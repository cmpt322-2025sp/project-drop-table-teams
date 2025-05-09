import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	// Regular auth client for standard operations
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			/**
			 * SvelteKit's cookies API requires `path` to be explicitly set in
			 * the cookie options. Setting `path` to `/` replicates previous/
			 * standard behavior.
			 */
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	// Admin client with service role for bypassing RLS
	event.locals.supabaseAdmin = createServerClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		},
		cookies: {
			// Mock cookie implementation since we're not using cookies for the admin client
			getAll: () => [],
			setAll: () => {}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!event.locals.session && event.url.pathname.startsWith('/private')) {
		redirect(303, '/auth');
	}

	// Check role-based access for authenticated users
	if (event.locals.session && event.url.pathname.startsWith('/private') && event.locals.user) {
		// Get the user's role from profiles
		const { data: profileData } = await event.locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', event.locals.user.id)
			.single();

		// Store the role in locals for use in routes
		const role = profileData?.role || event.locals.user.user_metadata?.role || 'student';
		event.locals.userRole = role;

		// Prevent students from accessing teacher routes
		if (role === 'student' && event.url.pathname.startsWith('/private/teacher')) {
			redirect(303, '/private/student/dashboard');
		}
	}

	if (event.locals.session && event.url.pathname === '/auth' && event.locals.user) {
		// Get the user role to determine where to redirect
		const { data: profileData } = await event.locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', event.locals.user.id)
			.single();

		// Redirect based on role or fallback to user metadata
		if (profileData) {
			redirect(
				303,
				profileData.role === 'teacher' ? '/private/teacher' : '/private/student/dashboard'
			);
		} else {
			// Fallback to metadata
			const role = event.locals.user.user_metadata?.role || 'student';
			redirect(303, role === 'teacher' ? '/private/teacher' : '/private/student/dashboard');
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);

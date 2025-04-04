import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/dashboard';

	/**
	 * Clean up the redirect URL by deleting the Auth flow parameters.
	 *
	 * `next` is preserved for now, because it's needed in the error case.
	 */
	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete('token_hash');
	redirectTo.searchParams.delete('type');

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			// Email verification was successful, we can redirect to dashboard
			redirectTo.searchParams.delete('next');

			// Get user session to determine role for proper redirection
			const {
				data: { session }
			} = await supabase.auth.getSession();
			const userRole = session?.user?.user_metadata?.role || 'student';

			if (userRole === 'teacher') {
				redirectTo.pathname = '/teacher';
			} else {
				redirectTo.pathname = '/dashboard';
			}

			redirect(303, redirectTo);
		} else {
			// If verification failed, add the error message to the URL
			redirectTo.pathname = '/auth/error';
			redirectTo.searchParams.set('error', error.message);
			redirect(303, redirectTo);
		}
	}

	// If token_hash or type are missing, redirect to error page
	redirectTo.pathname = '/auth/error';
	redirectTo.searchParams.set('error', 'Invalid verification link. Please request a new one.');
	redirect(303, redirectTo);
};

import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	signup: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const role = formData.get('role') as string || 'student';

		// First create the user in auth.users
		const { data: authData, error: authError } = await supabase.auth.signUp({ 
			email, 
			password,
			options: {
				data: {
					role // Store role in auth.users.user_metadata
				}
			}
		});

		if (authError) {
			console.error('Auth error:', authError);
			redirect(303, '/auth/error');
		}

		// If user was created successfully, insert profile data
		if (authData.user) {
			const { error: profileError } = await supabase
				.from('profiles')
				.insert({
					id: authData.user.id,
					email,
					role,
					level: 1,
					points: 0
				});

			if (profileError) {
				console.error('Profile error:', profileError);
				// Try to clean up the auth user if profile creation fails
				await supabase.auth.admin.deleteUser(authData.user.id);
				redirect(303, '/auth/error');
			}
		}

		redirect(303, '/');
	},
	
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await supabase.auth.signInWithPassword({ 
			email, 
			password 
		});

		if (error) {
			console.error(error);
			redirect(303, '/auth/error');
		} 

		// Fetch user profile to determine role
		if (data.user) {
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('id', data.user.id)
				.single();

			if (profileError) {
				console.error('Profile error:', profileError);
				// Fall back to metadata if profile fetch fails
				const role = data.user.user_metadata?.role || 'student';
				redirect(303, role === 'teacher' ? '/private/teacher' : '/private/student/dashboard');
			}

			// Redirect based on role
			if (profileData) {
				redirect(303, profileData.role === 'teacher' ? '/private/teacher' : '/private/student/dashboard');
			}
		}

		// Default fallback
		redirect(303, '/private/student/dashboard');
	}
};
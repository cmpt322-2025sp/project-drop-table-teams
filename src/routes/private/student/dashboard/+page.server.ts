import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure user exists
	if (!locals.user) {
		redirect(303, '/auth');
	}

	const userRole = locals.user.user_metadata?.role || 'student';

	// Get profile data
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', locals.user.id)
		.single();

	return {
		user: locals.user,
		userRole,
		profile
	};
};

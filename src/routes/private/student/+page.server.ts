import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Server-side redirect to dashboard
	redirect(303, '/private/student/dashboard');
};
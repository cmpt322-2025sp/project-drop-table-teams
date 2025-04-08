import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Pass user data from locals to the page component
	return {
		user: locals.user,
		userRole: locals.userRole
	};
};

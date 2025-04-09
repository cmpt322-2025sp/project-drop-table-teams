import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: Students } = await supabase
		.from('Students')
		.select('first_name, last_name, profile_email, level, points')
		.order('last_name');
	return { Students: Students ?? [] };
};

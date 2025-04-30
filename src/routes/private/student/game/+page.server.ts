import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	console.log('Game page server load running, URL:', url.pathname);

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

	// Log successful loading
	console.log('Game page server load complete, data prepared for client');

	return {
		user: locals.user,
		userRole,
		profile
	};
};

export const actions: Actions = {
	// Save game session stats to database
	saveGameStats: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Authentication required' };
		}

		const data = await request.formData();
		
		// Log the raw form data for debugging
		console.log('Form data received:', {
			level: data.get('level'),
			wrong_addition: data.get('wrong_addition'),
			wrong_subtraction: data.get('wrong_subtraction'),
			wrong_place: data.get('wrong_place'),
			problems_total: data.get('problems_total'),
			problems_solved: data.get('problems_solved'),
			time_spent_seconds: data.get('time_spent_seconds'),
			completed: data.get('completed')
		});
		
		const gameStats = {
			student_id: locals.user.id,
			level: parseInt(data.get('level') as string) || 1,
			wrong_addition: parseInt(data.get('wrong_addition') as string) || 0,
			wrong_subtraction: parseInt(data.get('wrong_subtraction') as string) || 0,
			wrong_place: parseInt(data.get('wrong_place') as string) || 0,
			problems_total: parseInt(data.get('problems_total') as string) || 0,
			problems_solved: parseInt(data.get('problems_solved') as string) || 0,
			time_spent_seconds: parseInt(data.get('time_spent_seconds') as string) || 0,
			completed: data.get('completed') === 'true'
		};
		
		// Log the processed game stats for debugging
		console.log('Processed game stats:', gameStats);

		try {
			const { error } = await locals.supabase.from('game_sessions').insert([gameStats]);
			
			if (error) {
				console.error('Error saving game stats:', error);
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (err) {
			console.error('Exception saving game stats:', err);
			return { success: false, error: 'Failed to save game stats' };
		}
	}
};
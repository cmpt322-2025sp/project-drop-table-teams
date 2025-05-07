import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Verify user is authenticated and a teacher
	const { user, supabaseAdmin } = locals;
	
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	// Get user's profile to verify role
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (!profile || profile.role !== 'teacher') {
		throw error(403, 'Only teachers can create classes');
	}

	// Get the class details from the request
	const { name, description } = await request.json();

	if (!name || name.trim() === '') {
		throw error(400, 'Class name is required');
	}

	// Create the new class
	const { data: newClass, error: insertError } = await supabaseAdmin
		.from('classes')
		.insert({
			name,
			description: description || null,
			teacher_id: user.id
		})
		.select()
		.single();

	if (insertError) {
		console.error('Error creating class:', insertError);
		throw error(500, 'Failed to create class');
	}

	return json(newClass);
};
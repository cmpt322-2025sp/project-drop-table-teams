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
		throw error(403, 'Only teachers can delete classes');
	}

	// Get the class ID from the request
	const { classId } = await request.json();

	if (!classId) {
		throw error(400, 'Class ID is required');
	}

	// Check if the class belongs to this teacher
	const { data: classData, error: classError } = await supabaseAdmin
		.from('classes')
		.select('id')
		.eq('id', classId)
		.eq('teacher_id', user.id)
		.single();

	if (classError || !classData) {
		throw error(404, 'Class not found or you do not have permission to delete it');
	}

	// Check if there are any students enrolled in the class
	const { data: enrollments, error: enrollmentError } = await supabaseAdmin
		.from('class_enrollments')
		.select('id')
		.eq('class_id', classId);

	if (enrollmentError) {
		throw error(500, 'Error checking class enrollments');
	}

	// If the class has students, prevent deletion
	if (enrollments && enrollments.length > 0) {
		throw error(400, 'Cannot delete a class with enrolled students. Remove all students first.');
	}

	// Delete the class
	const { error: deleteError } = await supabaseAdmin
		.from('classes')
		.delete()
		.eq('id', classId);

	if (deleteError) {
		console.error('Error deleting class:', deleteError);
		throw error(500, 'Failed to delete class');
	}

	return json({ success: true, message: 'Class deleted successfully' });
};
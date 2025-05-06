import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Use supabaseAdmin to bypass RLS policies and avoid recursion
	if (!locals.supabaseAdmin || !locals.session?.user) {
		console.error('No session or Supabase admin client');
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	try {
		const { studentId, classId, action } = await request.json();
		const teacherId = locals.session.user.id;

		// Validate request data
		if (!studentId || !classId || !action || (action !== 'add' && action !== 'remove')) {
			return json({ error: 'Invalid request data' }, { status: 400 });
		}

		// First verify the teacher owns the class
		const { data: teacherClass, error: classError } = await locals.supabaseAdmin
			.from('classes')
			.select('id')
			.eq('id', classId)
			.eq('teacher_id', teacherId)
			.maybeSingle();

		if (classError) {
			console.error('Error fetching teacher class:', classError);
			return json({ error: 'Failed to verify teacher class' }, { status: 500 });
		}

		if (!teacherClass) {
			return json({ error: 'You do not have permission to manage this class' }, { status: 403 });
		}

		// Now handle the enrollment action
		if (action === 'add') {
			// Check if enrollment already exists
			const { data: existingEnrollment, error: checkError } = await locals.supabaseAdmin
				.from('class_enrollments')
				.select('id')
				.eq('class_id', classId)
				.eq('student_id', studentId)
				.maybeSingle();

			if (checkError) {
				console.error('Error checking enrollment:', checkError);
				return json({ error: 'Failed to check enrollment status' }, { status: 500 });
			}

			if (existingEnrollment) {
				return json({ error: 'Student is already enrolled in this class' }, { status: 400 });
			}

			// Create the enrollment
			const { data: enrollment, error: enrollError } = await locals.supabaseAdmin
				.from('class_enrollments')
				.insert({
					class_id: classId,
					student_id: studentId
				})
				.select('id, class_id, student_id')
				.single();

			if (enrollError) {
				console.error('Error creating enrollment:', enrollError);
				return json({ error: 'Failed to enroll student' }, { status: 500 });
			}

			return json({ message: 'Student enrolled successfully', data: enrollment });
		} else if (action === 'remove') {
			// Delete the enrollment
			const { error: deleteError } = await locals.supabaseAdmin
				.from('class_enrollments')
				.delete()
				.eq('class_id', classId)
				.eq('student_id', studentId);

			if (deleteError) {
				console.error('Error removing enrollment:', deleteError);
				return json({ error: 'Failed to remove student from class' }, { status: 500 });
			}

			return json({ message: 'Student removed from class successfully' });
		}

		return json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.error('Error processing request:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

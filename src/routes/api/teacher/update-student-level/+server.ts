import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Use supabaseAdmin to bypass RLS policies and avoid recursion
	if (!locals.supabaseAdmin || !locals.session?.user) {
		console.error('No session or Supabase admin client');
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	try {
		const { studentId, level } = await request.json();
		const teacherId = locals.session.user.id;

		// Validate request data
		if (!studentId || !level || isNaN(Number(level)) || Number(level) < 1) {
			return json({ error: 'Invalid request data' }, { status: 400 });
		}

		// First verify the teacher has the student in their class
		// Get the teacher's classes
		const { data: teacherClasses, error: classesError } = await locals.supabaseAdmin
			.from('classes')
			.select('id')
			.eq('teacher_id', teacherId);

		if (classesError) {
			console.error('Error fetching teacher classes:', classesError);
			return json({ error: 'Failed to verify teacher classes' }, { status: 500 });
		}

		// Then check if student is enrolled in any of those classes
		const classIds = teacherClasses.map((c) => c.id);

		const { data: enrollment, error: enrollmentError } = await locals.supabaseAdmin
			.from('class_enrollments')
			.select('id')
			.eq('student_id', studentId)
			.in('class_id', classIds)
			.maybeSingle();

		if (enrollmentError) {
			console.error('Error checking enrollment:', enrollmentError);
			return json({ error: 'Failed to verify student enrollment' }, { status: 500 });
		}

		if (!enrollment) {
			return json({ error: 'Student is not enrolled in any of your classes' }, { status: 403 });
		}

		// Use the admin client to directly update the profile, bypassing RLS
		const { data, error } = await locals.supabaseAdmin
			.from('profiles')
			.update({ level: Number(level) })
			.eq('id', studentId)
			.eq('role', 'student') // Only update students
			.select('id, level')
			.single();

		if (error) {
			console.error('Database error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		// Return the updated student data
		return json(data);
	} catch (error) {
		console.error('Error processing request:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

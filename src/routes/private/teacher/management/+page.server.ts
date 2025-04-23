import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabaseAdmin, user } }) => {
	// Use the admin client to bypass RLS for teacher operations

	// Get teacher's classes
	const { data: classes } = await supabaseAdmin
		.from('classes')
		.select('id, name, description')
		.eq('teacher_id', user?.id);

	// Get all student profiles that are students
	const { data: students } = await supabaseAdmin
		.from('profiles')
		.select('id, email, role, level, points, created_at')
		.eq('role', 'student');

	// Get enrollments for this teacher's classes
	const { data: enrollments } = await supabaseAdmin
		.from('class_enrollments')
		.select('id, class_id, student_id')
		.in('class_id', classes?.map((c) => c.id) || []);

	return {
		classes: classes ?? [],
		students: students ?? [],
		enrollments: enrollments ?? []
	};
};

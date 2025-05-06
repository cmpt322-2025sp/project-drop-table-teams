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
    
    // Get all game session data
    const { data: games } = await supabaseAdmin
        .from('game_sessions')
        .select('student_id, wrong_addition, wrong_subtraction, wrong_place, problems_total, problems_solved, time_spent_seconds, completed, created_at');

    // Get enrollments for this teacher's classes
	const { data: enrollments } = await supabaseAdmin
    .from('class_enrollments')
    .select('id, class_id, student_id')
    .in('class_id', classes?.map((c) => c.id) || []);

    return {
        classes: classes ?? [],
        students: students ?? [],
        games: games ?? [],
        enrollments: enrollments ?? []
    };
};

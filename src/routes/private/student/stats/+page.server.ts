import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Ensure user exists
  if (!locals.user) {
    redirect(303, '/auth');
  }

  // Verify the user is a student
  const userRole = locals.user.user_metadata?.role || 'student';
  if (userRole !== 'student') {
    redirect(303, '/private');
  }

  // Get profile data
  const { data: profile } = await locals.supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', locals.user.id)
    .single();

  // Get student's game sessions using admin client to bypass RLS
  const { data: gameSessions } = await locals.supabaseAdmin
    .from('game_sessions')
    .select('*')
    .eq('student_id', locals.user.id)
    .order('created_at', { ascending: false });

  // Calculate summary statistics if game sessions exist
  let summaryStats = null;
  
  if (gameSessions && gameSessions.length > 0) {
    const totalSessions = gameSessions.length;
    const totalProblems = gameSessions.reduce((sum, session) => sum + (session.problems_total || 0), 0);
    const totalSolved = gameSessions.reduce((sum, session) => sum + (session.problems_solved || 0), 0);
    const totalTimeSeconds = gameSessions.reduce((sum, session) => sum + (session.time_spent_seconds || 0), 0);
    const completedSessions = gameSessions.filter(session => session.completed).length;
    
    // Calculate error counts
    const totalWrongAddition = gameSessions.reduce((sum, session) => sum + (session.wrong_addition || 0), 0);
    const totalWrongSubtraction = gameSessions.reduce((sum, session) => sum + (session.wrong_subtraction || 0), 0);
    const totalWrongPlace = gameSessions.reduce((sum, session) => sum + (session.wrong_place || 0), 0);
    
    // Calculate rates
    const successRate = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const avgTimePerSession = totalSessions > 0 ? totalTimeSeconds / totalSessions : 0;
    
    // Average errors per session
    const avgWrongAddition = totalSessions > 0 ? totalWrongAddition / totalSessions : 0;
    const avgWrongSubtraction = totalSessions > 0 ? totalWrongSubtraction / totalSessions : 0;
    const avgWrongPlace = totalSessions > 0 ? totalWrongPlace / totalSessions : 0;
    
    summaryStats = {
      totalSessions,
      totalProblems,
      totalSolved,
      successRate,
      completionRate,
      totalTimeSeconds,
      avgTimePerSession,
      avgWrongAddition,
      avgWrongSubtraction,
      avgWrongPlace
    };
  }

  return {
    user: locals.user,
    profile,
    gameSessions: gameSessions || [],
    summaryStats
  };
};
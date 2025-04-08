// This is a server-side API endpoint that redirects to the game page
// We use this to force a complete page reload when navigating between pages

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  // Ensure user is authenticated
  if (!locals.user) {
    redirect(303, '/auth');
  }
  
  // Perform a server-side 303 redirect to the game page
  // This ensures a full page reload
  redirect(303, '/private/student/game');
};
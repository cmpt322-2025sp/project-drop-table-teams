import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Use supabaseAdmin to bypass RLS policies and avoid recursion
  if (!locals.supabaseAdmin || !locals.session?.user) {
    console.error('No session or Supabase admin client');
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

};
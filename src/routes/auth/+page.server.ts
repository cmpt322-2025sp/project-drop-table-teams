import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userType = formData.get('userType') as string || 'student'; // Default to student

    // Create the user
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: userType // Store the role in user metadata
        },
        emailRedirectTo: `${new URL(request.url).origin}/auth/confirm`
      } 
    });

    if (error) {
      console.error(error);
      throw redirect(303, '/auth/error'); // Redirect on failure
    } else {
      // Note: We don't need to manually create a profile here as the database trigger 
      // handle_new_user() will do it automatically
      
      // Redirect to confirmation page instead of dashboard
      // User must verify email before accessing the dashboard
      return {
        success: true,
        message: 'Please check your email for a confirmation link.'
      };
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error(error);
      throw redirect(303, '/auth/error'); // Redirect on failure
    } else {
      // Get user metadata to check role
      const userRole = data.user?.user_metadata?.role || 'student';
      
      // Redirect based on user role
      if (userRole === 'teacher') {
        throw redirect(303, '/teacher'); // Teacher dashboard
      } else {
        throw redirect(303, '/dashboard'); // Student dashboard
      }
    }
  },
};

-- Drop the existing policy that causes infinite recursion
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;

-- Create a fixed version of the policy
CREATE POLICY "Teachers can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'teacher'
  );
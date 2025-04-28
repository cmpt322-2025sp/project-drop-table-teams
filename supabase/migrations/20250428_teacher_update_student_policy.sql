-- Add policy allowing teachers to update student profile levels
CREATE POLICY "Teachers can update student levels" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    -- Only for student profiles (not other teachers)
    auth.jwt() ->> 'role' = 'teacher' AND
    profiles.role = 'student' AND
    -- Only update if the student is in one of the teacher's classes
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE ce.student_id = profiles.id
      AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only for student profiles (not other teachers)
    auth.jwt() ->> 'role' = 'teacher' AND
    profiles.role = 'student' AND
    -- Only allow updating level and points fields (not role, email, etc.)
    (OLD.level IS DISTINCT FROM NEW.level OR OLD.points IS DISTINCT FROM NEW.points) AND
    -- Only update if the student is in one of the teacher's classes
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE ce.student_id = profiles.id
      AND c.teacher_id = auth.uid()
    )
  );
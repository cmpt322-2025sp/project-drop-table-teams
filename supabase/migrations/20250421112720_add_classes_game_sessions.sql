-- Skip ENUM conversion and keep role as TEXT

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create class_enrollments table (many-to-many between students and classes)
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Enable RLS on class_enrollments
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Create game_sessions table to track student gameplay
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  wrong_addition INTEGER NOT NULL DEFAULT 0,
  wrong_subtraction INTEGER NOT NULL DEFAULT 0,
  wrong_place INTEGER NOT NULL DEFAULT 0,
  problems_total INTEGER NOT NULL DEFAULT 0,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on game_sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes table
-- Teachers can view, insert, update, and delete their own classes
CREATE POLICY "Teachers can manage their own classes" 
  ON public.classes
  USING (teacher_id = auth.uid());

-- Students can view classes they are enrolled in
CREATE POLICY "Students can view enrolled classes" 
  ON public.classes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments 
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

-- RLS Policies for class_enrollments table
-- Teachers can manage enrollments for their classes
CREATE POLICY "Teachers can manage enrollments for their classes" 
  ON public.class_enrollments
  USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE id = class_enrollments.class_id AND teacher_id = auth.uid()
    )
  );

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments" 
  ON public.class_enrollments
  FOR SELECT
  USING (student_id = auth.uid());

-- RLS Policies for game_sessions table
-- Students can insert and view their own game sessions
CREATE POLICY "Students can manage their own game sessions" 
  ON public.game_sessions
  USING (student_id = auth.uid());

-- Teachers can view game sessions for students in their classes
CREATE POLICY "Teachers can view game sessions for enrolled students" 
  ON public.game_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE ce.student_id = game_sessions.student_id
      AND c.teacher_id = auth.uid()
    )
  );
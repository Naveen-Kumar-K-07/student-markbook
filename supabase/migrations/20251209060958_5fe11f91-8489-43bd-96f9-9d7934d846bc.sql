-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  max_marks INTEGER NOT NULL DEFAULT 100,
  passing_marks INTEGER NOT NULL DEFAULT 35
);

-- Create marks table
CREATE TABLE public.marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL CHECK (marks_obtained >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- Enable RLS (public access for this educational tool)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for educational use
CREATE POLICY "Anyone can read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Anyone can read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete subjects" ON public.subjects FOR DELETE USING (true);

CREATE POLICY "Anyone can read marks" ON public.marks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert marks" ON public.marks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update marks" ON public.marks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete marks" ON public.marks FOR DELETE USING (true);

-- Insert default subjects
INSERT INTO public.subjects (name, max_marks, passing_marks) VALUES
  ('Mathematics', 100, 35),
  ('Physics', 100, 35),
  ('Chemistry', 100, 35),
  ('English', 100, 35),
  ('Computer Science', 100, 35);
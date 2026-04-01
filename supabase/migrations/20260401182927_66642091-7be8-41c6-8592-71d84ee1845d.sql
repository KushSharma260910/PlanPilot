
-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('Backlog', 'To-Do', 'In Progress', 'Review', 'Done');

-- Create charters table
CREATE TABLE public.charters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  charter_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  charter_id UUID NOT NULL REFERENCES public.charters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status public.task_status NOT NULL DEFAULT 'Backlog',
  base_priority INTEGER NOT NULL DEFAULT 3 CHECK (base_priority >= 1 AND base_priority <= 5),
  priority_score NUMERIC NOT NULL DEFAULT 3,
  personality_state TEXT DEFAULT 'Calm',
  time_spent BIGINT NOT NULL DEFAULT 0,
  idle_time BIGINT NOT NULL DEFAULT 0,
  context_switch_count INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Charter RLS policies
CREATE POLICY "Users can view own charters" ON public.charters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own charters" ON public.charters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own charters" ON public.charters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own charters" ON public.charters FOR DELETE USING (auth.uid() = user_id);

-- Task RLS policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Timestamp triggers
CREATE TRIGGER update_charters_updated_at BEFORE UPDATE ON public.charters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

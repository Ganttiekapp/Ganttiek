-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source uuid,
  target uuid,
  type text DEFAULT 'finish-to-start'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT links_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text UNIQUE CHECK (char_length(username) >= 3),
  full_name text,
  avatar_url text,
  website text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  dependencies uuid[] DEFAULT '{}',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);

-- Create a separate table for task dependencies to handle multiple dependencies properly
CREATE TABLE public.task_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  depends_on_task_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_dependencies_pkey PRIMARY KEY (id),
  CONSTRAINT task_dependencies_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
  CONSTRAINT task_dependencies_depends_on_task_id_fkey FOREIGN KEY (depends_on_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
  CONSTRAINT task_dependencies_unique UNIQUE (task_id, depends_on_task_id)
);
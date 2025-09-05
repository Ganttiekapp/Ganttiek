-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source uuid,
  target uuid,
  type text DEFAULT 'finish-to-start'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT links_pkey PRIMARY KEY (id),
  CONSTRAINT links_source_fkey FOREIGN KEY (source) REFERENCES public.tasks(id),
  CONSTRAINT links_target_fkey FOREIGN KEY (target) REFERENCES public.tasks(id)
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
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  status text DEFAULT 'not-started'::text,
  progress integer DEFAULT 0,
  type text DEFAULT 'task'::text,
  color text DEFAULT '#3b82f6'::text,
  parent uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT tasks_parent_fkey FOREIGN KEY (parent) REFERENCES public.tasks(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);
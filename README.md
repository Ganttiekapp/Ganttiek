# Ganttiek - Project Management App

A simple Svelte-based project management application with email authentication using Supabase.

## Features

- Magic link authentication (passwordless login/signup)
- Email-based secure authentication
- **Project Management System**
  - Create, edit, and delete projects
  - Project status tracking (Not started, In progress, Completed)
  - Project timeline management with start/end dates
  - Project descriptions and metadata
- **Task Management**
  - Create and manage tasks within projects
  - Task progress tracking (0-100%)
  - Task timeline management
  - Task descriptions and dependencies
- **Dashboard Analytics**
  - Project statistics and overview
  - Recent projects display
  - Completion rate tracking
- Protected dashboard for authenticated users
- Modern, responsive UI
- Supabase integration for backend services

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Update the Supabase URL and API key with your actual values:
     ```
     VITE_SUPABASE_URL=your-supabase-project-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The app will be available at `http://localhost:5173`
   - Safari browser testing has been verified

## Pages

- **Home (`/`)**: Landing page with login/signup buttons
- **Login (`/login`)**: Magic link authentication (email only)
- **Signup (`/signup`)**: Magic link account creation (email only)
- **Dashboard (`/dashboard`)**: Project overview with statistics and recent projects
- **Projects (`/projects`)**: List all user projects with management options
- **Create Project (`/projects/new`)**: Form to create new projects
- **Project Detail (`/projects/[id]`)**: View project details and manage tasks
- **Edit Project (`/projects/[id]/edit`)**: Edit project information

## Authentication

The app uses Supabase's magic link authentication, which means:
- No passwords required
- Users enter their email address
- A secure link is sent to their email
- Clicking the link automatically signs them in
- More secure than traditional password authentication

## Database Schema

The app is designed to work with the provided database schema including:
- `profiles` table for user information
- `projects` table for project management
- `tasks` table for task tracking
- `links` table for task dependencies

## Browser Compatibility

Tested and verified to work correctly in Safari browser.

## Development

- Built with SvelteKit
- Uses Supabase for authentication and database
- Responsive design with modern CSS
- TypeScript-ready structure
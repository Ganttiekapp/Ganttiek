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
- **Comprehensive Task Management System**
  - Create, edit, and delete tasks across all projects
  - Task progress tracking (0-100%) with automatic status updates
  - Task priority levels (High, Medium, Low) with color coding
  - Task status management (To Do, In Progress, Completed)
  - Due date tracking with overdue task alerts
  - Task descriptions and project associations
  - Bulk task operations and filtering
  - Task completion toggle functionality
- **Enhanced Dashboard Analytics**
  - Project statistics and overview
  - Task statistics and progress tracking
  - Overdue task alerts and notifications
  - Recent projects and tasks display
  - Completion rate tracking for both projects and tasks
  - Quick action buttons for common operations
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
- **Dashboard (`/dashboard`)**: Enhanced overview with project and task statistics, overdue alerts, and quick actions
- **Projects (`/projects`)**: List all user projects with management options
- **Create Project (`/projects/new`)**: Form to create new projects
- **Project Detail (`/projects/[id]`)**: View project details and manage tasks with enhanced task management
- **Edit Project (`/projects/[id]/edit`)**: Edit project information
- **Tasks (`/tasks`)**: Comprehensive task management across all projects with filtering and status tracking
- **Task Detail (`/tasks/[id]`)**: Edit individual tasks with full task management features

## Authentication

The app uses Supabase's magic link authentication, which means:
- No passwords required
- Users enter their email address
- A secure link is sent to their email
- Clicking the link automatically signs them in
- More secure than traditional password authentication

## Task Management Features

The comprehensive task management system includes:

### Task Creation & Management
- Create tasks with name, description, priority, and due dates
- Associate tasks with specific projects
- Set task status (To Do, In Progress, Completed)
- Track progress percentage (0-100%)

### Task Organization
- Filter tasks by status (All, To Do, In Progress, Completed, Overdue)
- View tasks across all projects or within specific projects
- Sort tasks by due date, priority, or creation date
- Color-coded priority levels (High=Red, Medium=Yellow, Low=Green)

### Task Tracking
- Automatic status updates based on progress percentage
- Overdue task detection and alerts
- Task completion toggle functionality
- Progress tracking with visual indicators

### Dashboard Integration
- Task statistics on the main dashboard
- Overdue task alerts with quick access
- Recent tasks display
- Quick action buttons for task management

## Database Schema

The app is designed to work with the provided database schema including:
- `profiles` table for user information
- `projects` table for project management
- `tasks` table for comprehensive task tracking with priority, status, and progress
- `links` table for task dependencies

## Browser Compatibility

Tested and verified to work correctly in Safari browser.

## CI/CD Testing

The project includes comprehensive CI/CD testing with GitHub Actions:

- **Automated Testing**: Runs on every push and pull request
- **Environment Handling**: Automatically sets up test environment variables
- **Silent Testing**: Runs tests without opening browser windows
- **Cross-Platform**: Tests on Ubuntu with Node.js 18
- **Artifact Collection**: Saves test results and reports

### CI Environment Variables

The CI environment automatically sets up test environment variables:
- `VITE_SUPABASE_URL`: Test Supabase URL for CI testing
- `VITE_SUPABASE_ANON_KEY`: Test Supabase key for CI testing
- `VITE_APP_URL`: Local development server URL

### Test Commands

- `npm run test:silent` - Run all tests silently (recommended for CI)
- `npm run test:env` - Test environment variable configuration
- `npm run test:headless` - Run tests in headless mode

## Development

- Built with SvelteKit
- Uses Supabase for authentication and database
- Responsive design with modern CSS
- TypeScript-ready structure
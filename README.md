# Ganttiek - Client Project Management Platform

A modern web application built with [SVAR React](https://svar.dev) and Supabase for small agencies to manage client projects with interactive Gantt charts and seamless collaboration.

## 🎯 Project Overview

Ganttiek empowers small agencies (2-10 people) to deliver exceptional client project management services through:

- **Interactive Gantt Charts** - Powered by SVAR React for professional project visualization
- **Client Collaboration** - Secure project sharing with client access controls
- **Real-time Updates** - Live collaboration between team members and clients
- **Social Authentication** - Easy onboarding with Google and GitHub login
- **Zero Infrastructure** - Deployed on GitHub Pages with Supabase backend

## 🏗️ Architecture

### Frontend
- **SVAR React** - Professional Gantt chart components
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, modern UI
- **React Router** for client-side navigation
- **Supabase Client** for authentication and real-time data

### Backend
- **Supabase** - Complete backend-as-a-service
  - PostgreSQL database with Row Level Security
  - Built-in authentication with social providers
  - Real-time subscriptions for live collaboration
  - File storage for project attachments
  - Auto-generated REST and GraphQL APIs

### Deployment
- **GitHub Pages** - Free static hosting for frontend
- **Supabase Cloud** - Managed backend infrastructure
- **GitHub Actions** - Automated deployment pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- GitHub account
- Supabase account

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Ganttiek
npm install
```

### 2. Supabase Configuration
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup
```bash
# Run the database migration
npm run db:setup
```

### 4. Development
```bash
npm run dev
```

### 5. Deploy to GitHub Pages
```bash
npm run build
npm run deploy
```

## 📊 Development Roadmap

### Week 1: Foundation
- [ ] Project setup with SVAR React and Supabase
- [ ] Authentication with Google/GitHub
- [ ] Basic Gantt chart integration
- [ ] User management and team creation

### Week 2: Core Features
- [ ] Project creation and management
- [ ] Task management with SVAR Gantt
- [ ] Client invitation system
- [ ] Basic project sharing

### Week 3: Collaboration
- [ ] Real-time updates with Supabase subscriptions
- [ ] Client access controls and permissions
- [ ] Project comments and notifications
- [ ] Mobile-responsive design

### Week 4: Polish & Deploy
- [ ] UI/UX refinements
- [ ] Error handling and validation
- [ ] GitHub Pages deployment setup
- [ ] Documentation and testing

## 🎨 Key Features

### For Agencies
- **Project Templates** - Quick project setup for common client types
- **Team Management** - Invite team members with role-based permissions
- **Client Portals** - Secure project access for clients
- **Time Tracking** - Built-in time tracking for billing
- **Custom Branding** - White-label options for client-facing views

### For Clients
- **Project Visibility** - Real-time project progress updates
- **Task Comments** - Direct communication on specific tasks
- **Milestone Tracking** - Clear delivery expectations
- **File Sharing** - Secure document collaboration
- **Mobile Access** - View projects on any device

## 🛠️ Tech Stack Details

### SVAR React Integration
```jsx
import { Gantt } from '@svar/react-gantt';

// Basic Gantt chart implementation
<Gantt
  data={tasks}
  onTaskUpdate={handleTaskUpdate}
  onTaskCreate={handleTaskCreate}
  onTaskDelete={handleTaskDelete}
/>
```

### Supabase Integration
```javascript
import { createClient } from '@supabase/supabase-js';

// Real-time project updates
const supabase = createClient(url, key);
supabase
  .channel('projects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, 
    (payload) => updateGanttChart(payload)
  )
  .subscribe();
```

## 📁 Project Structure

```
Ganttiek/
├── src/
│   ├── components/
│   │   ├── gantt/           # SVAR Gantt wrapper components
│   │   ├── auth/            # Authentication components
│   │   ├── projects/        # Project management components
│   │   └── shared/          # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Project.tsx      # Project view with Gantt
│   │   └── Client.tsx       # Client portal view
│   ├── hooks/
│   │   ├── useSupabase.ts   # Supabase client hooks
│   │   ├── useAuth.ts       # Authentication hooks
│   │   └── useProjects.ts   # Project data hooks
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client setup
│   │   ├── auth.ts          # Authentication utilities
│   │   └── types.ts         # TypeScript definitions
│   └── styles/
│       └── globals.css      # Tailwind CSS imports
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql            # Sample data
└── public/                 # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:setup        # Setup Supabase database
npm run db:reset        # Reset database with seed data

# Deployment
npm run deploy          # Deploy to GitHub Pages
npm run deploy:preview  # Preview deployment
```

## 🔐 Authentication Flow

1. **User Registration/Login** - Google or GitHub OAuth
2. **Team Creation** - Agency owner creates team
3. **Member Invitation** - Invite team members via email
4. **Client Access** - Generate secure client portal links
5. **Role Management** - Admin, Editor, Viewer permissions

## 📊 Database Schema

### Core Tables
- `teams` - Agency organizations
- `users` - User accounts with team associations
- `projects` - Client projects with metadata
- `tasks` - Gantt chart tasks with dependencies
- `milestones` - Project milestone markers
- `comments` - Task and project comments
- `client_access` - Client portal access tokens

### Row Level Security (RLS)
- Team-based data isolation
- Client access restrictions
- Role-based permissions

## 🚀 Deployment

### GitHub Pages Setup
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to trigger automatic deployment

### Environment Variables
```env
# Required for deployment
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional
VITE_APP_NAME=Ganttiek
VITE_APP_URL=https://your-username.github.io/Ganttiek
```

## 🔄 Real-time Features

- **Live Gantt Updates** - Changes appear instantly for all users
- **Collaborative Editing** - Multiple users can edit simultaneously
- **Client Notifications** - Real-time updates for client stakeholders
- **Activity Feeds** - Track all project changes and comments

## 📱 Mobile Support

- **Responsive Design** - Works on all device sizes
- **Touch Gestures** - Optimized for mobile Gantt interaction
- **Progressive Web App** - Install as mobile app
- **Offline Capability** - View projects without internet

## 🎯 MVP Success Metrics

- **User Onboarding** - Complete setup in under 5 minutes
- **Project Creation** - Create first project in under 2 minutes
- **Client Sharing** - Share project with client in under 1 minute
- **Real-time Sync** - Updates appear within 2 seconds
- **Mobile Experience** - Full functionality on mobile devices

## 🔮 Future Enhancements

### Phase 2 (Post-MVP)
- **Time Tracking Integration** - Built-in time tracking and billing
- **Advanced Reporting** - Custom reports and analytics
- **API Integrations** - Slack, Google Calendar, Zapier
- **Custom Branding** - White-label client portals

### Phase 3 (Growth)
- **Enterprise Features** - SSO, advanced permissions
- **Multi-tenant Architecture** - Support for larger agencies
- **Advanced Gantt Features** - Critical path, resource management
- **Mobile App** - Native iOS/Android applications

## 📚 Resources

- [SVAR React Documentation](https://svar.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Pages Deployment](https://pages.github.com)
- [React Router Guide](https://reactrouter.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - Check the [docs](docs/) folder
- **Issues** - Create a [GitHub issue](https://github.com/your-username/Ganttiek/issues)
- **Discussions** - Join the [GitHub discussions](https://github.com/your-username/Ganttiek/discussions)

---

**Built with ❤️ for small agencies who want to deliver exceptional client project management experiences.**
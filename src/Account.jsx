import { useState } from 'react'
import { supabase } from './supabaseClient'
import ProjectManager from './ProjectManager'

export default function Account({ session }) {
  const [activeTab, setActiveTab] = useState('projects')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const userName = session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.user_name || 
                   session.user.email?.split('@')[0] || 
                   'User'

  return (
    <div className="landing-container">
      <div className="landing-content">
        <header className="landing-header">
          <h1>Ganttiek</h1>
          <p>Your waterfall task buddy :)</p>
        </header>

        <div className="welcome-section">
          <h2>Welcome back, {userName}!</h2>
          <p>You're successfully logged in and ready to manage your projects.</p>
          
          <div className="user-info">
            <p><strong>Email:</strong> {session.user.email}</p>
            {session.user.user_metadata?.avatar_url && (
              <img 
                src={session.user.user_metadata.avatar_url} 
                alt="Profile" 
                className="user-avatar"
              />
            )}
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            📊 My Projects
          </button>
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            ℹ️ About
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'projects' ? (
            <ProjectManager session={session} />
          ) : (
            <div className="about-section">
              <h3>🚀 About Ganttiek</h3>
              <p>Ganttiek is your waterfall task buddy, designed to help you manage projects with beautiful Gantt charts.</p>
              <div className="features">
                <h4>Features:</h4>
                <ul>
                  <li>✅ Project creation and management</li>
                  <li>🔄 Gantt chart visualization (coming soon)</li>
                  <li>👥 Team collaboration (coming soon)</li>
                  <li>📱 Mobile-friendly interface</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <button className="button sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

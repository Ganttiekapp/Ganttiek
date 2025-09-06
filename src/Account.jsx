import { useState } from 'react'
import { supabase } from './supabaseClient'
import ProjectManager from './ProjectManager'
import ProjectPage from './ProjectPage'

export default function Account({ session }) {
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleOpenProject = (projectId) => {
    setCurrentProjectId(projectId)
    setIsMenuOpen(false) // Close menu when navigating
  }

  const handleBackToProjects = () => {
    setCurrentProjectId(null)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const userName = session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.user_name || 
                   session.user.email?.split('@')[0] || 
                   'User'

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-brand">
          <h1>Ganttiek</h1>
        </div>
        
        {/* Desktop Menu */}
        <div className="desktop-menu">
          <button 
            className="desktop-menu-item"
            onClick={() => setCurrentProjectId(null)}
          >
            📊 My Projects
          </button>
          <button 
            className="desktop-menu-item sign-out"
            onClick={handleSignOut}
          >
            🚪 Sign Out
          </button>
        </div>
        
        {/* Hamburger Menu Button - Mobile Only */}
        <button 
          className="hamburger-menu"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
            <div className="menu-content" onClick={(e) => e.stopPropagation()}>
              <div className="menu-header">
                <h3>Welcome, {userName}!</h3>
                <p>{session.user.email}</p>
              </div>
              
              <div className="menu-items">
                <button 
                  className="menu-item"
                  onClick={() => {
                    setCurrentProjectId(null)
                    setIsMenuOpen(false)
                  }}
                >
                  📊 My Projects
                </button>
                
                <button 
                  className="menu-item sign-out"
                  onClick={handleSignOut}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {currentProjectId ? (
          <ProjectPage 
            session={session} 
            projectId={currentProjectId} 
            onBack={handleBackToProjects}
          />
        ) : (
          <ProjectManager 
            session={session} 
            onOpenProject={handleOpenProject}
          />
        )}
      </div>
    </div>
  )
}

import { supabase } from './supabaseClient'

export default function Account({ session }) {
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

        <div className="coming-soon">
          <h3>🚀 Coming Soon</h3>
          <p>Gantt chart features, project management, and team collaboration tools are in development.</p>
        </div>

        <button className="button sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

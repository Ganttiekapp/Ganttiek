import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
    
    if (error) {
      alert(`GitHub OAuth Error: ${error.message}`)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="header">Ganttiek</h1>
        <p className="description">Your waterfall task buddy :)</p>
        
        <div className="auth-buttons">
          <button 
            className="button github-button" 
            onClick={handleGitHubLogin}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign in with GitHub'}
          </button>

          <div className="divider">or</div>

          <form onSubmit={handleLogin}>
            <input
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="button" disabled={loading}>
              {loading ? 'Loading...' : 'Send magic link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

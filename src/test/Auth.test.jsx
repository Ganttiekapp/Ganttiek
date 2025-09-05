import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '../Auth'
import { supabase } from '../supabaseClient'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
      signInWithOAuth: vi.fn()
    }
  }
}))

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the auth form with correct title and tagline', () => {
    render(<Auth />)
    
    expect(screen.getByText('Ganttiek')).toBeInTheDocument()
    expect(screen.getByText('Your waterfall task buddy :)')).toBeInTheDocument()
  })

  it('renders GitHub login button', () => {
    render(<Auth />)
    
    const githubButton = screen.getByText('Sign in with GitHub')
    expect(githubButton).toBeInTheDocument()
    expect(githubButton).toHaveClass('github-button')
  })

  it('renders email input and magic link button', () => {
    render(<Auth />)
    
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    expect(screen.getByText('Send magic link')).toBeInTheDocument()
  })

  it('handles email input changes', async () => {
    const user = userEvent.setup()
    render(<Auth />)
    
    const emailInput = screen.getByPlaceholderText('Your email')
    await user.type(emailInput, 'test@example.com')
    
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('handles magic link form submission', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null })
    
    render(<Auth />)
    
    const emailInput = screen.getByPlaceholderText('Your email')
    const submitButton = screen.getByText('Send magic link')
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com'
    })
  })

  it('handles GitHub OAuth login', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithOAuth.mockResolvedValue({ error: null })
    
    render(<Auth />)
    
    const githubButton = screen.getByText('Sign in with GitHub')
    await user.click(githubButton)
    
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
  })

  it('shows loading state during magic link submission', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithOtp.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<Auth />)
    
    const emailInput = screen.getByPlaceholderText('Your email')
    const submitButton = screen.getByText('Send magic link')
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows loading state during GitHub OAuth', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithOAuth.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<Auth />)
    
    const githubButton = screen.getByText('Sign in with GitHub')
    await user.click(githubButton)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles magic link error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid email'
    supabase.auth.signInWithOtp.mockResolvedValue({ 
      error: { message: errorMessage } 
    })
    
    render(<Auth />)
    
    const emailInput = screen.getByPlaceholderText('Your email')
    const submitButton = screen.getByText('Send magic link')
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles GitHub OAuth error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'OAuth failed'
    supabase.auth.signInWithOAuth.mockResolvedValue({ 
      error: { message: errorMessage } 
    })
    
    render(<Auth />)
    
    const githubButton = screen.getByText('Sign in with GitHub')
    await user.click(githubButton)
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(`GitHub OAuth Error: ${errorMessage}`)
    })
  })
})

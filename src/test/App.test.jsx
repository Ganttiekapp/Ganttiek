import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { supabase } from '../supabaseClient'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Auth component when no session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Ganttiek')).toBeInTheDocument()
      expect(screen.getByText('Your waterfall task buddy :)')).toBeInTheDocument()
    })
  })

  it('renders Account component when session exists', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }
    }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
      expect(screen.getByText('📊 My Projects')).toBeInTheDocument()
    })
  })

  it('sets up auth state change listener on mount', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    const mockUnsubscribe = vi.fn()
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
    })
  })

  it('calls getSession on mount', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled()
    })
  })

  it('handles session state changes', async () => {
    let authStateChangeCallback
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Ganttiek')).toBeInTheDocument()
    })
    
    // Simulate auth state change to logged in
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }
    }
    
    authStateChangeCallback('SIGNED_IN', mockSession)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
    })
  })

  it('handles sign out', async () => {
    let authStateChangeCallback
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }
    }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
    })
    
    // Simulate sign out
    authStateChangeCallback('SIGNED_OUT', null)
    
    await waitFor(() => {
      expect(screen.getByText('Ganttiek')).toBeInTheDocument()
      expect(screen.getByText('Your waterfall task buddy :)')).toBeInTheDocument()
    })
  })

  it('renders with correct app container class', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    render(<App />)
    
    await waitFor(() => {
      const appContainer = document.querySelector('.app')
      expect(appContainer).toBeInTheDocument()
    })
  })
})

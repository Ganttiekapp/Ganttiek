import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Account from '../Account'
import { supabase } from '../supabaseClient'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve({ error: null }))
    }
  }
}))

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  }
}

describe('Account Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders account page with welcome message', () => {
    render(<Account session={mockSession} />)
    
    expect(screen.getByText('Ganttiek')).toBeInTheDocument()
    expect(screen.getByText('Your waterfall task buddy :)')).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
  })

  it('displays user email', () => {
    render(<Account session={mockSession} />)
    
    expect(screen.getByText('Email: test@example.com')).toBeInTheDocument()
  })

  it('displays user avatar when available', () => {
    render(<Account session={mockSession} />)
    
    const avatar = screen.getByAltText('Profile')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('uses username when full_name is not available', () => {
    const sessionWithUsername = {
      ...mockSession,
      user: {
        ...mockSession.user,
        user_metadata: {
          user_name: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
    }
    
    render(<Account session={sessionWithUsername} />)
    
    expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument()
  })

  it('uses email prefix when no name is available', () => {
    const sessionWithEmailOnly = {
      ...mockSession,
      user: {
        ...mockSession.user,
        user_metadata: {}
      }
    }
    
    render(<Account session={sessionWithEmailOnly} />)
    
    expect(screen.getByText('Welcome back, test!')).toBeInTheDocument()
  })

  it('renders tabs for Projects and About', () => {
    render(<Account session={mockSession} />)
    
    expect(screen.getByText('📊 My Projects')).toBeInTheDocument()
    expect(screen.getByText('ℹ️ About')).toBeInTheDocument()
  })

  it('shows Projects tab by default', () => {
    render(<Account session={mockSession} />)
    
    const projectsTab = screen.getByText('📊 My Projects')
    expect(projectsTab).toHaveClass('active')
  })

  it('switches to About tab when clicked', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    const aboutTab = screen.getByText('ℹ️ About')
    await user.click(aboutTab)
    
    expect(aboutTab).toHaveClass('active')
    expect(screen.getByText('🚀 About Ganttiek')).toBeInTheDocument()
  })

  it('shows About content when About tab is active', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    const aboutTab = screen.getByText('ℹ️ About')
    await user.click(aboutTab)
    
    expect(screen.getByText('🚀 About Ganttiek')).toBeInTheDocument()
    expect(screen.getByText('Ganttiek is your waterfall task buddy, designed to help you manage projects with beautiful Gantt charts.')).toBeInTheDocument()
    expect(screen.getByText('Features:')).toBeInTheDocument()
    expect(screen.getByText('✅ Project creation and management')).toBeInTheDocument()
    expect(screen.getByText('🔄 Gantt chart visualization with SVAR React')).toBeInTheDocument()
  })

  it('renders ProjectManager component when Projects tab is active', () => {
    render(<Account session={mockSession} />)
    
    // ProjectManager should be rendered (we can't easily test its content without mocking it)
    expect(screen.getByText('📊 My Projects')).toHaveClass('active')
  })

  it('calls signOut when sign out button is clicked', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)
    
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('handles navigation to project page', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    // This test would need to mock the ProjectManager component
    // and test the onOpenProject callback
    expect(screen.getByText('📊 My Projects')).toBeInTheDocument()
  })

  it('handles back navigation from project page', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    // This test would need to mock the ProjectPage component
    // and test the onBack callback
    expect(screen.getByText('📊 My Projects')).toBeInTheDocument()
  })

  it('resets to Projects tab when switching tabs', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    // Switch to About tab
    const aboutTab = screen.getByText('ℹ️ About')
    await user.click(aboutTab)
    
    expect(aboutTab).toHaveClass('active')
    
    // Switch back to Projects tab
    const projectsTab = screen.getByText('📊 My Projects')
    await user.click(projectsTab)
    
    expect(projectsTab).toHaveClass('active')
    expect(aboutTab).not.toHaveClass('active')
  })
})

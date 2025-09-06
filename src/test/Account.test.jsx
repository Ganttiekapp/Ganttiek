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

  it('renders account page with hamburger menu', () => {
    render(<Account session={mockSession} />)
    
    // Check that the hamburger menu and brand are present
    expect(screen.getByText('Ganttiek')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
  })

  it('displays user email in menu', () => {
    render(<Account session={mockSession} />)
    
    // Open hamburger menu to see the user email
    const hamburgerMenu = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburgerMenu)
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('displays user welcome message in menu', () => {
    render(<Account session={mockSession} />)
    
    // Open hamburger menu to see the welcome message
    const hamburgerMenu = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburgerMenu)
    
    expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument()
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
    
    // Open hamburger menu to see the welcome message
    const hamburgerMenu = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburgerMenu)
    
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument()
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
    
    // Open hamburger menu to see the welcome message
    const hamburgerMenu = screen.getByLabelText('Toggle menu')
    fireEvent.click(hamburgerMenu)
    
    expect(screen.getByText('Welcome, test!')).toBeInTheDocument()
  })

  it('renders menu items in desktop menu', () => {
    render(<Account session={mockSession} />)
    
    // Desktop menu items should be visible by default
    expect(screen.getByText('📊 My Projects')).toBeInTheDocument()
    expect(screen.getByText('🚪 Sign Out')).toBeInTheDocument()
  })

  it('shows Projects content by default', () => {
    render(<Account session={mockSession} />)
    
    // Should show ProjectManager content by default
    expect(screen.getByText('My Projects')).toBeInTheDocument()
  })

  it('opens and closes hamburger menu', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    const hamburgerMenu = screen.getByLabelText('Toggle menu')
    
    // Open menu
    await user.click(hamburgerMenu)
    expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument()
    
    // Close menu by clicking overlay
    const overlay = document.querySelector('.menu-overlay')
    await user.click(overlay)
    expect(screen.queryByText('Welcome, Test User!')).not.toBeInTheDocument()
  })

  it('renders ProjectManager component by default', () => {
    render(<Account session={mockSession} />)
    
    // ProjectManager should be rendered by default
    expect(screen.getByText('My Projects')).toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    // Click the desktop sign out button
    const signOutButton = screen.getByText('🚪 Sign Out')
    await user.click(signOutButton)
    
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('navigates to projects when desktop menu item is clicked', async () => {
    const user = userEvent.setup()
    render(<Account session={mockSession} />)
    
    // Click on My Projects desktop menu item
    const projectsMenuItem = screen.getByText('📊 My Projects')
    await user.click(projectsMenuItem)
    
    // Should show projects content
    expect(screen.getByText('My Projects')).toBeInTheDocument()
  })
})

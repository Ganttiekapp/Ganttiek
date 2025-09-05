import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectManager from '../ProjectManager'
import { supabase } from '../supabaseClient'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()
    }))
  }
}))

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com'
  }
}

const mockProjects = [
  {
    id: 'project-1',
    name: 'Test Project 1',
    description: 'First test project',
    created_at: '2024-01-01T00:00:00Z',
    user_id: 'user-123'
  },
  {
    id: 'project-2',
    name: 'Test Project 2',
    description: 'Second test project',
    created_at: '2024-01-02T00:00:00Z',
    user_id: 'user-123'
  }
]

describe('ProjectManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful project fetch
    supabase.from().select().eq().order().mockResolvedValue({
      data: mockProjects,
      error: null
    })
  })

  it('renders project manager with header and create button', async () => {
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('My Projects')).toBeInTheDocument()
      expect(screen.getByText('➕ New Project')).toBeInTheDocument()
    })
  })

  it('displays projects when they exist', async () => {
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
      expect(screen.getByText('Test Project 2')).toBeInTheDocument()
      expect(screen.getByText('First test project')).toBeInTheDocument()
      expect(screen.getByText('Second test project')).toBeInTheDocument()
    })
  })

  it('shows no projects message when no projects exist', async () => {
    supabase.from().select().eq().order().mockResolvedValue({
      data: [],
      error: null
    })
    
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText("You don't have any projects yet. Click \"➕ New Project\" to create one!")).toBeInTheDocument()
    })
  })

  it('shows create project form when create button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('➕ New Project')).toBeInTheDocument()
    })
    
    const createButton = screen.getByText('➕ New Project')
    await user.click(createButton)
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument()
  })

  it('hides create project form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('➕ New Project')).toBeInTheDocument()
    })
    
    // Open form
    const createButton = screen.getByText('➕ New Project')
    await user.click(createButton)
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    
    // Close form
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)
    
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
  })

  it('creates a new project successfully', async () => {
    const user = userEvent.setup()
    const newProject = {
      id: 'project-3',
      name: 'New Project',
      description: 'New project description',
      created_at: '2024-01-03T00:00:00Z',
      user_id: 'user-123'
    }
    
    supabase.from().insert().select().mockResolvedValue({
      data: [newProject],
      error: null
    })
    
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('➕ New Project')).toBeInTheDocument()
    })
    
    // Open form
    const createButton = screen.getByText('➕ New Project')
    await user.click(createButton)
    
    // Fill form
    const nameInput = screen.getByLabelText('Project Name')
    const descriptionInput = screen.getByLabelText('Description (Optional)')
    const submitButton = screen.getByText('Create Project')
    
    await user.type(nameInput, 'New Project')
    await user.type(descriptionInput, 'New project description')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('projects')
    })
  })

  it('calls onOpenProject when open button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnOpenProject = vi.fn()
    
    render(<ProjectManager session={mockSession} onOpenProject={mockOnOpenProject} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })
    
    const openButtons = screen.getAllByText('Open')
    await user.click(openButtons[0])
    
    expect(mockOnOpenProject).toHaveBeenCalledWith('project-1')
  })

  it('deletes a project when delete button is clicked', async () => {
    const user = userEvent.setup()
    supabase.from().delete().eq().eq().mockResolvedValue({
      data: null,
      error: null
    })
    
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })
    
    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this project?')
    expect(supabase.from).toHaveBeenCalledWith('projects')
  })

  it('shows error message when project creation fails', async () => {
    const user = userEvent.setup()
    supabase.from().insert().select().mockResolvedValue({
      data: null,
      error: { message: 'Creation failed' }
    })
    
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('➕ New Project')).toBeInTheDocument()
    })
    
    // Open form and submit
    const createButton = screen.getByText('➕ New Project')
    await user.click(createButton)
    
    const nameInput = screen.getByLabelText('Project Name')
    const submitButton = screen.getByText('Create Project')
    
    await user.type(nameInput, 'New Project')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create project.')).toBeInTheDocument()
    })
  })

  it('shows error message when project deletion fails', async () => {
    const user = userEvent.setup()
    supabase.from().delete().eq().eq().mockResolvedValue({
      data: null,
      error: { message: 'Deletion failed' }
    })
    
    render(<ProjectManager session={mockSession} onOpenProject={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })
    
    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Failed to delete project.')).toBeInTheDocument()
    })
  })
})

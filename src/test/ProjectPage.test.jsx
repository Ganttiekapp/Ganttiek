import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectPage from '../ProjectPage'
import { supabase } from '../supabaseClient'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}))

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com'
  }
}

const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'Test project description',
  created_at: '2024-01-01T00:00:00Z',
  user_id: 'user-123'
}

const mockTasks = [
  {
    id: 'task-1',
    name: 'Task 1',
    description: 'First task',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    progress: 50,
    dependencies: [],
    project_id: 'project-1',
    user_id: 'user-123'
  },
  {
    id: 'task-2',
    name: 'Task 2',
    description: 'Second task',
    start_date: '2024-01-03',
    end_date: '2024-01-07',
    progress: 25,
    dependencies: ['task-1'],
    project_id: 'project-1',
    user_id: 'user-123'
  }
]

describe('ProjectPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful project and tasks fetch
    supabase.from().select().eq().eq().single().mockResolvedValue({
      data: mockProject,
      error: null
    })
    
    supabase.from().select().eq().eq().order().mockResolvedValue({
      data: mockTasks,
      error: null
    })
  })

  it('renders project page with header and back button', async () => {
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('← Back to Projects')).toBeInTheDocument()
      expect(screen.getByText('Test Project')).toBeInTheDocument()
      expect(screen.getByText('Test project description')).toBeInTheDocument()
    })
  })

  it('renders gantt chart when tasks exist', async () => {
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Project Timeline')).toBeInTheDocument()
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
  })

  it('shows no tasks message when no tasks exist', async () => {
    supabase.from().select().eq().eq().order().mockResolvedValue({
      data: [],
      error: null
    })
    
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Create your first task to get started!')).toBeInTheDocument()
    })
  })

  it('shows create task form when add task button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('+ Add Task')).toBeInTheDocument()
    })
    
    const addTaskButton = screen.getByText('+ Add Task')
    await user.click(addTaskButton)
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Task Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()
  })

  it('creates a new task successfully', async () => {
    const user = userEvent.setup()
    const newTask = {
      id: 'task-3',
      name: 'New Task',
      description: 'New task description',
      start_date: '2024-01-08',
      end_date: '2024-01-12',
      progress: 0,
      dependencies: [],
      project_id: 'project-1',
      user_id: 'user-123'
    }
    
    supabase.from().insert().select().mockResolvedValue({
      data: [newTask],
      error: null
    })
    
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('+ Add Task')).toBeInTheDocument()
    })
    
    // Open form
    const addTaskButton = screen.getByText('+ Add Task')
    await user.click(addTaskButton)
    
    // Fill form
    const nameInput = screen.getByLabelText('Task Name')
    const startDateInput = screen.getByLabelText('Start Date')
    const endDateInput = screen.getByLabelText('End Date')
    const submitButton = screen.getByText('Create Task')
    
    await user.type(nameInput, 'New Task')
    await user.type(startDateInput, '2024-01-08')
    await user.type(endDateInput, '2024-01-12')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tasks')
    })
  })

  it('shows tasks list when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('📋 Show Tasks')).toBeInTheDocument()
    })
    
    const toggleButton = screen.getByText('📋 Show Tasks')
    await user.click(toggleButton)
    
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument()
    expect(screen.getByText('📊 Hide Tasks')).toBeInTheDocument()
  })

  it('hides tasks list when hide button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('📋 Show Tasks')).toBeInTheDocument()
    })
    
    // Show tasks list
    const showButton = screen.getByText('📋 Show Tasks')
    await user.click(showButton)
    
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument()
    
    // Hide tasks list
    const hideButton = screen.getByText('📊 Hide Tasks')
    await user.click(hideButton)
    
    expect(screen.queryByText('Tasks (2)')).not.toBeInTheDocument()
    expect(screen.getByText('📋 Show Tasks')).toBeInTheDocument()
  })

  it('shows task dependencies in tasks list', async () => {
    const user = userEvent.setup()
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('📋 Show Tasks')).toBeInTheDocument()
    })
    
    // Show tasks list
    const showButton = screen.getByText('📋 Show Tasks')
    await user.click(showButton)
    
    // Task 2 should show dependency on Task 1
    expect(screen.getByText('Dependencies:')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('opens task edit modal when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('📋 Show Tasks')).toBeInTheDocument()
    })
    
    // Show tasks list
    const showButton = screen.getByText('📋 Show Tasks')
    await user.click(showButton)
    
    // Click edit button
    const editButtons = screen.getAllByText('Edit')
    await user.click(editButtons[0])
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument()
  })

  it('deletes a task when delete button is clicked', async () => {
    const user = userEvent.setup()
    supabase.from().delete().eq().eq().mockResolvedValue({
      data: null,
      error: null
    })
    
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('📋 Show Tasks')).toBeInTheDocument()
    })
    
    // Show tasks list
    const showButton = screen.getByText('📋 Show Tasks')
    await user.click(showButton)
    
    // Click delete button
    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
    expect(supabase.from).toHaveBeenCalledWith('tasks')
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnBack = vi.fn()
    
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={mockOnBack} />)
    
    await waitFor(() => {
      expect(screen.getByText('← Back to Projects')).toBeInTheDocument()
    })
    
    const backButton = screen.getByText('← Back to Projects')
    await user.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalled()
  })

  it('shows loading state initially', () => {
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    expect(screen.getByText('Loading project...')).toBeInTheDocument()
  })

  it('shows error message when project fails to load', async () => {
    supabase.from().select().eq().eq().single().mockResolvedValue({
      data: null,
      error: { message: 'Project not found' }
    })
    
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load project details.')).toBeInTheDocument()
    })
  })

  it('shows error message when tasks fail to load', async () => {
    supabase.from().select().eq().eq().order().mockResolvedValue({
      data: null,
      error: { message: 'Tasks not found' }
    })
    
    render(<ProjectPage session={mockSession} projectId="project-1" onBack={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks.')).toBeInTheDocument()
    })
  })
})

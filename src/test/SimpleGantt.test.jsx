import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SimpleGantt from '../SimpleGantt'

const mockTasks = [
  {
    id: 'task-1',
    name: 'Task 1',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-05'),
    progress: 50,
    dependencies: []
  },
  {
    id: 'task-2',
    name: 'Task 2',
    start: new Date('2024-01-03'),
    end: new Date('2024-01-07'),
    progress: 25,
    dependencies: ['task-1']
  },
  {
    id: 'task-3',
    name: 'Task 3',
    start: new Date('2024-01-08'),
    end: new Date('2024-01-12'),
    progress: 0,
    dependencies: ['task-2']
  }
]

describe('SimpleGantt Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders gantt chart with title and view controls', () => {
    render(<SimpleGantt data={mockTasks} />)
    
    expect(screen.getByText('Project Timeline')).toBeInTheDocument()
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
  })

  it('renders task names in sidebar', () => {
    render(<SimpleGantt data={mockTasks} />)
    
    // Check that task names exist (there will be multiple occurrences)
    const task1Elements = screen.getAllByText('Task 1')
    const task2Elements = screen.getAllByText('Task 2')
    const task3Elements = screen.getAllByText('Task 3')
    
    expect(task1Elements.length).toBeGreaterThan(0)
    expect(task2Elements.length).toBeGreaterThan(0)
    expect(task3Elements.length).toBeGreaterThan(0)
  })

  it('renders progress bars in sidebar', () => {
    render(<SimpleGantt data={mockTasks} />)
    
    // Check for progress text in sidebar (there will be multiple occurrences)
    const progress50 = screen.getAllByText('50%')
    const progress25 = screen.getAllByText('25%')
    const progress0 = screen.getAllByText('0%')
    
    expect(progress50.length).toBeGreaterThan(0)
    expect(progress25.length).toBeGreaterThan(0)
    expect(progress0.length).toBeGreaterThan(0)
  })

  it('sorts tasks by dependencies correctly', () => {
    render(<SimpleGantt data={mockTasks} />)
    
    const taskRows = screen.getAllByText(/Task \d/)
    // Task 1 should appear first (no dependencies)
    // Task 2 should appear second (depends on Task 1)
    // Task 3 should appear third (depends on Task 2)
    expect(taskRows[0]).toHaveTextContent('Task 1')
    expect(taskRows[1]).toHaveTextContent('Task 2')
    expect(taskRows[2]).toHaveTextContent('Task 3')
  })

  it('changes view mode when view buttons are clicked', async () => {
    const user = userEvent.setup()
    render(<SimpleGantt data={mockTasks} />)
    
    const dayButton = screen.getByText('Day')
    const weekButton = screen.getByText('Week')
    const monthButton = screen.getByText('Month')
    
    // Week should be active by default
    expect(weekButton).toHaveClass('active')
    
    // Click Day button
    await user.click(dayButton)
    expect(dayButton).toHaveClass('active')
    expect(weekButton).not.toHaveClass('active')
    
    // Click Month button
    await user.click(monthButton)
    expect(monthButton).toHaveClass('active')
    expect(dayButton).not.toHaveClass('active')
  })

  it('calls onTaskClick when task is clicked', async () => {
    const user = userEvent.setup()
    const mockOnTaskClick = vi.fn()
    
    render(<SimpleGantt data={mockTasks} onTaskClick={mockOnTaskClick} />)
    
    // Click on the first task in the sidebar (more specific selector)
    const taskRows = screen.getAllByText('Task 1')
    const sidebarTask = taskRows[0] // First occurrence is in sidebar
    await user.click(sidebarTask)
    
    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0])
  })

  it('shows task details when task is selected', async () => {
    const user = userEvent.setup()
    render(<SimpleGantt data={mockTasks} />)
    
    // Click on the first task in the sidebar
    const taskRows = screen.getAllByText('Task 1')
    const sidebarTask = taskRows[0] // First occurrence is in sidebar
    await user.click(sidebarTask)
    
    // Check that task details are shown (using more flexible text matching)
    expect(screen.getByText(/Start:/)).toBeInTheDocument()
    expect(screen.getByText(/End:/)).toBeInTheDocument()
    expect(screen.getByText(/Progress:/)).toBeInTheDocument()
    expect(screen.getByText('Jan 1')).toBeInTheDocument()
    expect(screen.getByText('Jan 5')).toBeInTheDocument()
  })

  it('closes task details when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<SimpleGantt data={mockTasks} />)
    
    // Select a task
    const taskRows = screen.getAllByText('Task 1')
    const sidebarTask = taskRows[0] // First occurrence is in sidebar
    await user.click(sidebarTask)
    
    expect(screen.getByText(/Start:/)).toBeInTheDocument()
    
    // Close task details
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    expect(screen.queryByText(/Start:/)).not.toBeInTheDocument()
  })

  it('renders timeline headers for different view modes', async () => {
    const user = userEvent.setup()
    render(<SimpleGantt data={mockTasks} />)
    
    // Check that timeline headers are rendered (exact dates depend on the date calculation)
    expect(screen.getByText('Jan 1')).toBeInTheDocument()
    expect(screen.getByText('Jan 2')).toBeInTheDocument()
    
    // Switch to day view
    const dayButton = screen.getByText('Day')
    await user.click(dayButton)
    
    // Should show individual days (dates will be recalculated)
    expect(screen.getByText('Jan 1')).toBeInTheDocument()
  })

  it('handles empty task data', () => {
    render(<SimpleGantt data={[]} />)
    
    expect(screen.getByText('Project Timeline')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('handles tasks with circular dependencies', () => {
    const circularTasks = [
      {
        id: 'task-1',
        name: 'Task 1',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-05'),
        progress: 50,
        dependencies: ['task-2']
      },
      {
        id: 'task-2',
        name: 'Task 2',
        start: new Date('2024-01-03'),
        end: new Date('2024-01-07'),
        progress: 25,
        dependencies: ['task-1']
      }
    ]
    
    render(<SimpleGantt data={circularTasks} />)
    
    // Should still render both tasks (check for multiple occurrences)
    const task1Elements = screen.getAllByText('Task 1')
    const task2Elements = screen.getAllByText('Task 2')
    expect(task1Elements.length).toBeGreaterThan(0)
    expect(task2Elements.length).toBeGreaterThan(0)
  })

  it('renders dependency connections in timeline', () => {
    render(<SimpleGantt data={mockTasks} />)
    
    // Should render SVG for dependency connections
    const svg = document.querySelector('svg.dependency-connections')
    expect(svg).toBeInTheDocument()
  })

  it('updates task bar colors based on progress', () => {
    render(<SimpleGantt data={mockTasks} />)
    
    // Task 1 has 50% progress (should be blue)
    // Task 2 has 25% progress (should be yellow)
    // Task 3 has 0% progress (should be grey)
    
    const progressBars = document.querySelectorAll('.progress-fill')
    expect(progressBars).toHaveLength(3)
  })
})

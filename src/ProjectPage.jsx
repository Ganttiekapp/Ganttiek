import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient'
import SimpleGantt from './SimpleGantt'
import TaskEditModal from './TaskEditModal'

export default function ProjectPage({ session, projectId, onBack }) {
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showTasksList, setShowTasksList] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    progress: 0
  })

  useEffect(() => {
    loadProject()
    loadTasks()
  }, [projectId])

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        console.error('Error loading project:', error)
      } else {
        setProject(data)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading tasks:', error)
      } else {
        setTasks(data || [])
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!newTask.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          name: newTask.name.trim(),
          description: newTask.description.trim(),
          start_date: newTask.start_date || new Date().toISOString().split('T')[0],
          end_date: newTask.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: newTask.progress,
          project_id: projectId,
          user_id: session.user.id,
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error creating task:', error)
        alert('Error creating task: ' + error.message)
      } else {
        setTasks([...tasks, data[0]])
        setNewTask({
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          progress: 0
        })
        setShowTaskForm(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task: ' + error.message)
    }
  }

  const updateTask = async (updatedTask) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          name: updatedTask.name,
          description: updatedTask.description,
          start_date: updatedTask.start_date,
          end_date: updatedTask.end_date,
          progress: updatedTask.progress,
          dependencies: updatedTask.dependencies,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error updating task:', error)
        alert('Error updating task: ' + error.message)
      } else {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Error updating task: ' + error.message)
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error deleting task:', error)
        alert('Error deleting task: ' + error.message)
      } else {
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task: ' + error.message)
    }
  }

  // Sort tasks by dependencies (same logic as SimpleGantt)
  const sortedTasks = useMemo(() => {
    const sorted = []
    const visited = new Set()
    const visiting = new Set()

    const visit = (task) => {
      if (visiting.has(task.id)) {
        // Circular dependency detected, just add the task
        if (!visited.has(task.id)) {
          sorted.push(task)
          visited.add(task.id)
        }
        return
      }
      
      if (visited.has(task.id)) return
      
      visiting.add(task.id)
      
      // Visit dependencies first
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId)
          if (depTask) {
            visit(depTask)
          }
        })
      }
      
      visiting.delete(task.id)
      sorted.push(task)
      visited.add(task.id)
    }

    // Visit all tasks
    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task)
      }
    })

    return sorted
  }, [tasks])

  // Convert tasks to Gantt chart format
  const ganttData = sortedTasks.map(task => ({
    id: task.id,
    name: task.name,
    start: new Date(task.start_date),
    end: new Date(task.end_date),
    progress: task.progress,
    dependencies: task.dependencies || []
  }))

  if (loading) {
    return (
      <div className="project-page">
        <div className="loading">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-page">
        <div className="error">Project not found</div>
      </div>
    )
  }

  return (
    <div className="project-page">
      <div className="project-header">
        <div className="project-title">
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
        <div className="header-actions">
          <button 
            className="button toggle-tasks-button" 
            onClick={() => setShowTasksList(!showTasksList)}
          >
            {showTasksList ? '📊 Hide Tasks' : '📋 Show Tasks'}
          </button>
          <button 
            className="button create-task-button"
            onClick={() => setShowTaskForm(true)}
          >
            + Add Task
          </button>
        </div>
      </div>

      {showTaskForm && (
        <div className="create-task-form">
          <h3>Create New Task</h3>
          <form onSubmit={createTask}>
            <input
              type="text"
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({...newTask, name: e.target.value})}
              required
              className="inputField"
            />
            <textarea
              placeholder="Task description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="inputField"
              rows="3"
            />
            <div className="form-row">
              <input
                type="date"
                placeholder="Start date"
                value={newTask.start_date}
                onChange={(e) => setNewTask({...newTask, start_date: e.target.value})}
                className="inputField"
              />
              <input
                type="date"
                placeholder="End date"
                value={newTask.end_date}
                onChange={(e) => setNewTask({...newTask, end_date: e.target.value})}
                className="inputField"
              />
            </div>
            <div className="form-row">
              <label>
                Progress: {newTask.progress}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newTask.progress}
                  onChange={(e) => setNewTask({...newTask, progress: parseInt(e.target.value)})}
                  className="progress-slider"
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="button">
                Create Task
              </button>
              <button 
                type="button" 
                className="button cancel-button"
                onClick={() => setShowTaskForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="gantt-container">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        ) : (
          <div className="gantt-chart">
            <SimpleGantt
              data={ganttData}
              onTaskChange={(task) => {
                console.log('Task changed:', task)
                // TODO: Update task in database
              }}
              onTaskClick={(task) => {
                const fullTask = tasks.find(t => t.id === task.id)
                if (fullTask) {
                  setEditingTask(fullTask)
                }
              }}
            />
          </div>
        )}
      </div>

      {showTasksList && (
        <div className="tasks-list">
          <h3>Tasks ({tasks.length})</h3>
        {sortedTasks.map(task => {
          const dependencies = task.dependencies || []
          const dependencyTasks = tasks.filter(t => dependencies.includes(t.id))
          
          return (
            <div key={task.id} className="task-item">
              <div className="task-info">
                <h4>{task.name}</h4>
                {task.description && <p>{task.description}</p>}
                <div className="task-dates">
                  <span>Start: {new Date(task.start_date).toLocaleDateString()}</span>
                  <span>End: {new Date(task.end_date).toLocaleDateString()}</span>
                  <span>Progress: {task.progress}%</span>
                </div>
                {dependencyTasks.length > 0 && (
                  <div className="task-dependencies">
                    <strong>Dependencies:</strong>
                    <div className="dependency-tags">
                      {dependencyTasks.map(dep => (
                        <span key={dep.id} className="dependency-tag">
                          {dep.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="task-actions">
                <button 
                  className="button small-button edit-button"
                  onClick={() => setEditingTask(task)}
                >
                  Edit
                </button>
                <button 
                  className="button small-button delete-button"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
        </div>
      )}

      <TaskEditModal
        task={editingTask}
        tasks={tasks}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={updateTask}
      />
    </div>
  )
}

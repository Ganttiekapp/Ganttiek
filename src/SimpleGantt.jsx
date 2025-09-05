import { useState, useMemo } from 'react'

export default function SimpleGantt({ data, onTaskChange, onTaskClick }) {
  const [viewMode, setViewMode] = useState('week')
  const [selectedTask, setSelectedTask] = useState(null)

  // Calculate timeline
  const getTimelineDates = () => {
    if (!data || data.length === 0) return []
    
    const allDates = []
    data.forEach(task => {
      allDates.push(new Date(task.start))
      allDates.push(new Date(task.end))
    })
    
    const minDate = new Date(Math.min(...allDates))
    const maxDate = new Date(Math.max(...allDates))
    
    const dates = []
    const current = new Date(minDate)
    while (current <= maxDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const timelineDates = getTimelineDates()
  const minDate = timelineDates[0]
  const maxDate = timelineDates[timelineDates.length - 1]

  const getTaskPosition = (task) => {
    if (!minDate || !maxDate) return { left: 0, width: 0 }
    
    const start = new Date(task.start)
    const end = new Date(task.end)
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
    const taskStartDay = Math.ceil((start - minDate) / (1000 * 60 * 60 * 24))
    const taskDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    
    const left = (taskStartDay / totalDays) * 100
    const width = (taskDuration / totalDays) * 100
    
    return { left: Math.max(0, left), width: Math.max(2, width) }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getProgressColor = (progress) => {
    if (progress === 0) return '#e9ecef'
    if (progress < 30) return '#ffc107'
    if (progress < 70) return '#17a2b8'
    return '#28a745'
  }

  const getDependencyConnections = () => {
    const connections = []
    data.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = data.find(t => t.id === depId)
          if (depTask) {
            connections.push({
              from: depTask,
              to: task
            })
          }
        })
      }
    })
    return connections
  }

  const dependencyConnections = getDependencyConnections()

  // Sort tasks so dependencies appear above dependent tasks
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
          const depTask = data.find(t => t.id === depId)
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
    data.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task)
      }
    })

    return sorted
  }, [data])

  return (
    <div className="simple-gantt">
      <div className="gantt-header">
        <div className="gantt-title">
          <h3>Project Timeline</h3>
          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={`view-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <div className="gantt-content">
        <div className="gantt-sidebar">
          <div className="sidebar-header">Tasks</div>
          {sortedTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-row ${selectedTask?.id === task.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedTask(task)
                onTaskClick?.(task)
              }}
            >
              <div className="task-name">{task.name}</div>
              <div className="task-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${task.progress}%`,
                      backgroundColor: getProgressColor(task.progress)
                    }}
                  />
                </div>
                <span className="progress-text">{task.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="gantt-timeline">
          <div className="timeline-header">
            {timelineDates.map((date, index) => (
              <div key={index} className="timeline-cell">
                {formatDate(date)}
              </div>
            ))}
          </div>
          
          <div className="timeline-content">
            {/* Dependency connections */}
            <svg className="dependency-connections" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {dependencyConnections.map((connection, index) => {
                const fromPos = getTaskPosition(connection.from)
                const toPos = getTaskPosition(connection.to)
                const fromTaskIndex = sortedTasks.findIndex(t => t.id === connection.from.id)
                const toTaskIndex = sortedTasks.findIndex(t => t.id === connection.to.id)
                
                const fromY = (fromTaskIndex * 40) + 20 // Center of task bar
                const toY = (toTaskIndex * 40) + 20
                const fromX = fromPos.left + fromPos.width
                const toX = toPos.left
                
                return (
                  <line
                    key={index}
                    x1={`${fromX}%`}
                    y1={fromY}
                    x2={`${toX}%`}
                    y2={toY}
                    stroke="#dc3545"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#dc3545" />
                </marker>
              </defs>
            </svg>
            
            {sortedTasks.map(task => {
              const position = getTaskPosition(task)
              return (
                <div 
                  key={task.id} 
                  className="timeline-row"
                  onClick={() => {
                    setSelectedTask(task)
                    onTaskClick?.(task)
                  }}
                >
                  <div 
                    className="task-bar"
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`,
                      backgroundColor: getProgressColor(task.progress)
                    }}
                    title={`${task.name} (${task.progress}%)`}
                  >
                    <div className="task-bar-content">
                      <span className="task-bar-name">{task.name}</span>
                      <span className="task-bar-progress">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="task-details">
          <h4>{selectedTask.name}</h4>
          <p>Start: {formatDate(new Date(selectedTask.start))}</p>
          <p>End: {formatDate(new Date(selectedTask.end))}</p>
          <p>Progress: {selectedTask.progress}%</p>
          <button 
            className="button small-button"
            onClick={() => setSelectedTask(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

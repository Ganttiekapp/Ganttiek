import { useState } from 'react'

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
          {data.map(task => (
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
            {data.map(task => {
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

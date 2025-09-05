import { useState, useEffect } from 'react'

export default function TaskEditModal({ task, tasks, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    progress: 0,
    dependencies: []
  })

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        progress: task.progress || 0,
        dependencies: task.dependencies || []
      })
    }
  }, [task])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onSave({
      ...task,
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    })
  }

  const handleDependencyChange = (taskId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, taskId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        dependencies: prev.dependencies.filter(id => id !== taskId)
      }))
    }
  }

  const availableDependencies = tasks.filter(t => t.id !== task?.id)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Task</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="task-name">Task Name *</label>
            <input
              id="task-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="inputField"
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="inputField"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Start Date *</label>
              <input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
                className="inputField"
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">End Date *</label>
              <input
                id="end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                required
                className="inputField"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="progress">Progress: {formData.progress}%</label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
              className="progress-slider"
            />
          </div>

          {availableDependencies.length > 0 && (
            <div className="form-group">
              <label>Dependencies</label>
              <div className="dependencies-list">
                {availableDependencies.map(depTask => (
                  <label key={depTask.id} className="dependency-item">
                    <input
                      type="checkbox"
                      checked={formData.dependencies.includes(depTask.id)}
                      onChange={(e) => handleDependencyChange(depTask.id, e.target.checked)}
                    />
                    <span className="dependency-name">{depTask.name}</span>
                    <span className="dependency-dates">
                      ({new Date(depTask.start_date).toLocaleDateString()} - {new Date(depTask.end_date).toLocaleDateString()})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="button">
              Save Changes
            </button>
            <button 
              type="button" 
              className="button cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

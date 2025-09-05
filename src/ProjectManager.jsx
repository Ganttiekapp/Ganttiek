import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ProjectManager({ session, onOpenProject }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
      } else {
        setProjects(data || [])
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e) => {
    e.preventDefault()
    if (!newProject.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          user_id: session.user.id,
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error creating project:', error)
        alert('Error creating project: ' + error.message)
      } else {
        setProjects([data[0], ...projects])
        setNewProject({ name: '', description: '' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project: ' + error.message)
    }
  }

  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error deleting project:', error)
        alert('Error deleting project: ' + error.message)
      } else {
        setProjects(projects.filter(p => p.id !== projectId))
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="project-manager">
        <div className="loading">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="project-manager">
      <div className="project-header">
        <h2>My Projects</h2>
        <button 
          className="button create-button"
          onClick={() => setShowCreateForm(true)}
        >
          + New Project
        </button>
      </div>

      {showCreateForm && (
        <div className="create-project-form">
          <h3>Create New Project</h3>
          <form onSubmit={createProject}>
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              required
              className="inputField"
            />
            <textarea
              placeholder="Project description (optional)"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="inputField"
              rows="3"
            />
            <div className="form-actions">
              <button type="submit" className="button">
                Create Project
              </button>
              <button 
                type="button" 
                className="button cancel-button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-info">
                <h3>{project.name}</h3>
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                <p className="project-date">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="project-actions">
                <button 
                  className="button small-button"
                  onClick={() => onOpenProject(project.id)}
                >
                  Open
                </button>
                <button 
                  className="button small-button delete-button"
                  onClick={() => deleteProject(project.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

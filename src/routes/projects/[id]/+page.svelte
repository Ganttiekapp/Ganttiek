<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let project = null;
  let tasks = [];
  let loading = true;
  let error = '';
  let showTaskForm = false;

  let newTask = {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
    status: 'todo',
    progress: 0
  };

  onMount(async () => {
    user = await AuthService.getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    await loadProject();
  });

  async function loadProject() {
    try {
      loading = true;
      const [projectResult, tasksResult] = await Promise.all([
        ProjectService.getProject($page.params.id, user.id),
        ProjectService.getProjectTasks($page.params.id, user.id)
      ]);
      
      if (projectResult.error) {
        error = projectResult.error.message;
        return;
      }

      if (tasksResult.error) {
        error = tasksResult.error.message;
        return;
      }

      project = projectResult.data;
      tasks = tasksResult.data || [];
    } catch (err) {
      error = 'Failed to load project';
    } finally {
      loading = false;
    }
  }

  async function createTask() {
    if (!newTask.name.trim()) {
      error = 'Task name is required';
      return;
    }

    if (newTask.start_date && newTask.end_date && newTask.start_date > newTask.end_date) {
      error = 'End date must be after start date';
      return;
    }

    try {
      const taskData = {
        ...newTask,
        project_id: $page.params.id,
        user_id: user.id,
        name: newTask.name.trim(),
        description: newTask.description.trim() || null,
        start_date: newTask.start_date || new Date().toISOString().split('T')[0],
        end_date: newTask.end_date || new Date().toISOString().split('T')[0]
      };

      const { data, error: createError } = await ProjectService.createTask(taskData);
      
      if (createError) {
        error = createError.message;
      } else {
        tasks = [...tasks, data];
        newTask = {
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          priority: 'medium',
          status: 'todo',
          progress: 0
        };
        showTaskForm = false;
        error = '';
      }
    } catch (err) {
      error = 'Failed to create task';
    }
  }

  async function updateTaskProgress(taskId, progress) {
    try {
      const { data, error: updateError } = await ProjectService.updateTaskProgress(taskId, progress, user.id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        tasks = tasks.map(task => task.id === taskId ? data : task);
      }
    } catch (err) {
      error = 'Failed to update task';
    }
  }

  async function toggleTaskComplete(task) {
    try {
      const { data, error: updateError } = await ProjectService.toggleTaskComplete(task.id, user.id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        tasks = tasks.map(t => t.id === task.id ? data : t);
      }
    } catch (err) {
      error = 'Failed to toggle task completion';
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const { error: deleteError } = await ProjectService.deleteTask(taskId, user.id);
      
      if (deleteError) {
        error = deleteError.message;
      } else {
        tasks = tasks.filter(t => t.id !== taskId);
      }
    } catch (err) {
      error = 'Failed to delete task';
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'todo': return '#6c757d';
      default: return '#6c757d';
    }
  }

  function isOverdue(task) {
    if (!task.end_date || task.progress === 100) return false;
    return new Date(task.end_date) < new Date();
  }

  function getProjectStatus(project) {
    if (!project.start_date || !project.end_date) return 'Not started';
    
    const now = new Date();
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    
    if (now < start) return 'Not started';
    if (now > end) return 'Completed';
    return 'In progress';
  }

</script>

<svelte:head>
  <title>{project?.name || 'Project'} - Ganttiek</title>
</svelte:head>

<div class="project-container">
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button on:click={() => goto('/projects')} class="btn btn-secondary">
          ← Back to Projects
        </button>
        <h1>{project?.name || 'Loading...'}</h1>
      </div>
      <div class="header-actions">
        <button on:click={() => goto(`/projects/${$page.params.id}/edit`)} class="btn btn-secondary">
          Edit Project
        </button>
        <button on:click={() => showTaskForm = !showTaskForm} class="btn btn-primary">
          Add Task
        </button>
      </div>
    </div>
  </header>

  <main class="main-content">
    {#if loading}
      <div class="loading">
        <p>Loading project...</p>
      </div>
    {:else if error}
      <div class="error">
        {error}
      </div>
    {:else if project}
      <div class="project-info">
        <div class="project-details">
          {#if project.description}
            <p class="description">{project.description}</p>
          {/if}
          
          <div class="project-meta">
            <div class="meta-item">
              <strong>Status:</strong>
              <span class="status" style="background-color: {getStatusColor(getProjectStatus(project))}">
                {getProjectStatus(project)}
              </span>
            </div>
            <div class="meta-item">
              <strong>Start Date:</strong> {formatDate(project.start_date)}
            </div>
            <div class="meta-item">
              <strong>End Date:</strong> {formatDate(project.end_date)}
            </div>
            <div class="meta-item">
              <strong>Created:</strong> {formatDate(project.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div class="tasks-section">
        <h2>Tasks ({tasks.length})</h2>
        
        {#if showTaskForm}
          <div class="task-form">
            <h3>Add New Task</h3>
            <form on:submit|preventDefault={createTask}>
              <div class="form-row">
                <div class="form-group">
                  <label for="task-name">Task Name *</label>
                  <input
                    id="task-name"
                    type="text"
                    bind:value={newTask.name}
                    placeholder="Enter task name"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="task-progress">Progress (%)</label>
                  <input
                    id="task-progress"
                    type="number"
                    min="0"
                    max="100"
                    bind:value={newTask.progress}
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="task-description">Description</label>
                <textarea
                  id="task-description"
                  bind:value={newTask.description}
                  placeholder="Enter task description (optional)"
                  rows="3"
                ></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="task-start">Start Date</label>
                  <input
                    id="task-start"
                    type="date"
                    bind:value={newTask.start_date}
                  />
                </div>
                <div class="form-group">
                  <label for="task-end">End Date</label>
                  <input
                    id="task-end"
                    type="date"
                    bind:value={newTask.end_date}
                  />
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Create Task</button>
                <button type="button" on:click={() => showTaskForm = false} class="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        {/if}

        {#if tasks.length === 0}
          <div class="empty-state">
            <p>No tasks yet. Add your first task to get started!</p>
          </div>
        {:else}
          <div class="tasks-list">
            {#each tasks as task (task.id)}
              <div class="task-card">
                <div class="task-header">
                  <h4>{task.name}</h4>
                  <div class="task-actions">
                    <button on:click={() => deleteTask(task.id)} class="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </div>
                </div>
                
                {#if task.description}
                  <p class="task-description">{task.description}</p>
                {/if}
                
                <div class="task-meta">
                  <div class="task-dates">
                    <span><strong>Start:</strong> {formatDate(task.start_date)}</span>
                    <span><strong>End:</strong> {formatDate(task.end_date)}</span>
                  </div>
                  
                  <div class="task-progress">
                    <label for="progress-{task.id}">Progress:</label>
                    <input
                      id="progress-{task.id}"
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      on:input={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                      class="progress-slider"
                    />
                    <span class="progress-value">{task.progress}%</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

<style>
  .project-container {
    min-height: 100vh;
    background-color: #f8f9fa;
  }

  .header {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header h1 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading, .error {
    text-align: center;
    padding: 3rem;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 0.5rem;
    border: 1px solid #f5c6cb;
  }

  .project-info {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .description {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .project-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
  }

  .status {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .tasks-section h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .task-form {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .task-form h3 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .form-group input, .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #666;
  }

  .tasks-list {
    display: grid;
    gap: 1rem;
  }

  .task-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .task-header h4 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
  }

  .task-actions {
    display: flex;
    gap: 0.5rem;
  }

  .task-description {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .task-dates {
    display: flex;
    gap: 1rem;
    color: #666;
    font-size: 0.9rem;
  }

  .task-progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-slider {
    width: 100px;
  }

  .progress-value {
    font-weight: 600;
    color: #333;
    min-width: 3rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0056b3;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #545b62;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #c82333;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .header-left {
      flex-direction: column;
      align-items: stretch;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .task-meta {
      flex-direction: column;
      align-items: stretch;
    }

    .task-dates {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>

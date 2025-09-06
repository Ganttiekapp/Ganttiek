<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let task = null;
  let projects = [];
  let loading = true;
  let saving = false;
  let error = '';
  let success = '';

  let formData = {
    name: '',
    description: '',
    project_id: '',
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

    await loadTask();
  });

  async function loadTask() {
    try {
      loading = true;
      const [taskResult, projectsResult] = await Promise.all([
        ProjectService.getTask($page.params.id, user.id),
        ProjectService.getProjects(user.id)
      ]);
      
      if (taskResult.error) {
        error = taskResult.error.message;
        return;
      }

      if (projectsResult.error) {
        error = projectsResult.error.message;
        return;
      }

      task = taskResult.data;
      projects = projectsResult.data || [];

      if (task) {
        formData = {
          name: task.name || '',
          description: task.description || '',
          project_id: task.project_id || '',
          start_date: task.start_date || '',
          end_date: task.end_date || '',
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          progress: task.progress || 0
        };
      }
    } catch (err) {
      error = 'Failed to load task';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!formData.name.trim()) {
      error = 'Task name is required';
      return;
    }

    if (!formData.project_id) {
      error = 'Please select a project';
      return;
    }

    saving = true;
    error = '';
    success = '';

    try {
      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        project_id: formData.project_id,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority,
        status: formData.status,
        progress: formData.progress
      };

      const { data, error: updateError } = await ProjectService.updateTask($page.params.id, updates, user.id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        task = data;
        success = 'Task updated successfully!';
        setTimeout(() => {
          goto('/tasks');
        }, 1500);
      }
    } catch (err) {
      error = 'Failed to update task';
    } finally {
      saving = false;
    }
  }

  async function deleteTask() {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await ProjectService.deleteTask($page.params.id, user.id);
      
      if (deleteError) {
        error = deleteError.message;
      } else {
        goto('/tasks');
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
    if (!task?.end_date || task.progress === 100) return false;
    return new Date(task.end_date) < new Date();
  }
</script>

<svelte:head>
  <title>{task?.name || 'Task'} - Ganttiek</title>
</svelte:head>

<div class="task-detail-container">
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button on:click={() => goto('/tasks')} class="btn btn-secondary">
          ← Back to Tasks
        </button>
        <h1>{task?.name || 'Loading...'}</h1>
      </div>
      <div class="header-actions">
        <button on:click={deleteTask} class="btn btn-danger">
          Delete Task
        </button>
      </div>
    </div>
  </header>

  <main class="main-content">
    {#if loading}
      <div class="loading">
        <p>Loading task...</p>
      </div>
    {:else if error}
      <div class="error">
        {error}
      </div>
    {:else if task}
      {#if success}
        <div class="success">
          {success}
        </div>
      {/if}

      <!-- Task Info -->
      <div class="task-info">
        <div class="task-meta">
          <div class="meta-item">
            <strong>Project:</strong>
            <span>{task.projects?.name || 'No Project'}</span>
          </div>
          <div class="meta-item">
            <strong>Priority:</strong>
            <span class="priority" style="background-color: {getPriorityColor(task.priority)}">
              {task.priority}
            </span>
          </div>
          <div class="meta-item">
            <strong>Status:</strong>
            <span class="status" style="background-color: {getStatusColor(task.status)}">
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <div class="meta-item">
            <strong>Progress:</strong>
            <span>{task.progress}%</span>
          </div>
          {#if isOverdue(task)}
            <div class="meta-item">
              <span class="overdue-badge">⚠️ Overdue</span>
            </div>
          {/if}
        </div>

        <div class="task-dates">
          <div class="date-item">
            <strong>Start Date:</strong> {formatDate(task.start_date)}
          </div>
          <div class="date-item">
            <strong>Due Date:</strong> {formatDate(task.end_date)}
          </div>
          <div class="date-item">
            <strong>Created:</strong> {formatDate(task.created_at)}
          </div>
          <div class="date-item">
            <strong>Updated:</strong> {formatDate(task.updated_at)}
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="edit-form">
        <h2>Edit Task</h2>
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-row">
            <div class="form-group">
              <label for="name">Task Name *</label>
              <input
                id="name"
                type="text"
                bind:value={formData.name}
                placeholder="Enter task name"
                required
              />
            </div>
            <div class="form-group">
              <label for="project_id">Project *</label>
              <select id="project_id" bind:value={formData.project_id} required>
                <option value="">Select a project</option>
                {#each projects as project (project.id)}
                  <option value={project.id}>{project.name}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              bind:value={formData.description}
              placeholder="Enter task description (optional)"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="start_date">Start Date</label>
              <input
                id="start_date"
                type="date"
                bind:value={formData.start_date}
              />
            </div>
            <div class="form-group">
              <label for="end_date">Due Date</label>
              <input
                id="end_date"
                type="date"
                bind:value={formData.end_date}
              />
            </div>
            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" bind:value={formData.priority}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" bind:value={formData.status}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label for="progress">Progress (%)</label>
              <input
                id="progress"
                type="number"
                min="0"
                max="100"
                bind:value={formData.progress}
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" disabled={saving} class="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" on:click={() => goto('/tasks')} class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    {/if}
  </main>
</div>

<style>
  .task-detail-container {
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

  .success {
    background-color: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid #c3e6cb;
  }

  .task-info {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .task-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
  }

  .priority, .status {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .overdue-badge {
    color: #dc3545;
    font-weight: 600;
  }

  .task-dates {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .date-item {
    color: #666;
    font-size: 0.9rem;
  }

  .edit-form {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .edit-form h2 {
    margin: 0 0 1.5rem 0;
    color: #333;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-row:has(.form-group:nth-child(3)) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .btn-primary:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
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

    .form-actions {
      flex-direction: column;
    }
  }
</style>

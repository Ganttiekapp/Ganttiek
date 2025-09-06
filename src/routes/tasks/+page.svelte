<script>
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let tasks = [];
  let loading = true;
  let error = '';
  let activeTab = 'all';
  let showTaskForm = false;

  let newTask = {
    name: '',
    description: '',
    project_id: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
    status: 'todo'
  };

  let projects = [];

  onMount(async () => {
    user = await AuthService.getCurrentUser();
    if (user) {
      await loadData();
    } else {
      goto('/login');
    }
  });

  async function loadData() {
    try {
      loading = true;
      const [tasksResult, projectsResult] = await Promise.all([
        ProjectService.getAllTasks(user.id),
        ProjectService.getProjects(user.id)
      ]);
      
      if (tasksResult.error) {
        error = tasksResult.error.message;
        return;
      }

      if (projectsResult.error) {
        error = projectsResult.error.message;
        return;
      }

      tasks = tasksResult.data || [];
      projects = projectsResult.data || [];
    } catch (err) {
      error = 'Failed to load tasks';
    } finally {
      loading = false;
    }
  }

  async function loadTasksByTab() {
    try {
      loading = true;
      let result;
      
      switch (activeTab) {
        case 'overdue':
          result = await ProjectService.getOverdueTasks(user.id);
          break;
        case 'todo':
          result = await ProjectService.getTasksByStatus(user.id, 'todo');
          break;
        case 'in_progress':
          result = await ProjectService.getTasksByStatus(user.id, 'in_progress');
          break;
        case 'completed':
          result = await ProjectService.getTasksByStatus(user.id, 'completed');
          break;
        default:
          result = await ProjectService.getAllTasks(user.id);
      }
      
      if (result.error) {
        error = result.error.message;
      } else {
        tasks = result.data || [];
      }
    } catch (err) {
      error = 'Failed to load tasks';
    } finally {
      loading = false;
    }
  }

  async function createTask() {
    if (!newTask.name.trim()) {
      error = 'Task name is required';
      return;
    }

    if (!newTask.project_id) {
      error = 'Please select a project';
      return;
    }

    try {
      const taskData = {
        ...newTask,
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
        tasks = [data, ...tasks];
        newTask = {
          name: '',
          description: '',
          project_id: '',
          start_date: '',
          end_date: '',
          priority: 'medium',
          status: 'todo'
        };
        showTaskForm = false;
        error = '';
      }
    } catch (err) {
      error = 'Failed to create task';
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
      error = 'Failed to update task';
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

  $: if (activeTab) {
    loadTasksByTab();
  }
</script>

<svelte:head>
  <title>Tasks - Ganttiek</title>
</svelte:head>

<div class="tasks-container">
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button on:click={() => goto('/dashboard')} class="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>My Tasks</h1>
      </div>
      <div class="header-actions">
        <button on:click={() => showTaskForm = !showTaskForm} class="btn btn-primary">
          Add Task
        </button>
      </div>
    </div>
  </header>

  <main class="main-content">
    {#if loading}
      <div class="loading">
        <p>Loading tasks...</p>
      </div>
    {:else if error}
      <div class="error">
        {error}
      </div>
    {:else}
      <!-- Task Tabs -->
      <div class="tabs">
        <button 
          class="tab {activeTab === 'all' ? 'active' : ''}" 
          on:click={() => activeTab = 'all'}
        >
          All Tasks ({tasks.length})
        </button>
        <button 
          class="tab {activeTab === 'todo' ? 'active' : ''}" 
          on:click={() => activeTab = 'todo'}
        >
          To Do
        </button>
        <button 
          class="tab {activeTab === 'in_progress' ? 'active' : ''}" 
          on:click={() => activeTab = 'in_progress'}
        >
          In Progress
        </button>
        <button 
          class="tab {activeTab === 'completed' ? 'active' : ''}" 
          on:click={() => activeTab = 'completed'}
        >
          Completed
        </button>
        <button 
          class="tab {activeTab === 'overdue' ? 'active' : ''}" 
          on:click={() => activeTab = 'overdue'}
        >
          Overdue
        </button>
      </div>

      <!-- Add Task Form -->
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
                <label for="task-project">Project *</label>
                <select id="task-project" bind:value={newTask.project_id} required>
                  <option value="">Select a project</option>
                  {#each projects as project (project.id)}
                    <option value={project.id}>{project.name}</option>
                  {/each}
                </select>
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
                <label for="task-end">Due Date</label>
                <input
                  id="task-end"
                  type="date"
                  bind:value={newTask.end_date}
                />
              </div>
              <div class="form-group">
                <label for="task-priority">Priority</label>
                <select id="task-priority" bind:value={newTask.priority}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Create Task</button>
              <button type="button" on:click={() => showTaskForm = false} class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      {/if}

      <!-- Tasks List -->
      {#if tasks.length === 0}
        <div class="empty-state">
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
          <button on:click={() => showTaskForm = true} class="btn btn-primary">
            Create Task
          </button>
        </div>
      {:else}
        <div class="tasks-list">
          {#each tasks as task (task.id)}
            <div class="task-card {isOverdue(task) ? 'overdue' : ''}">
              <div class="task-header">
                <div class="task-title">
                  <input
                    type="checkbox"
                    checked={task.progress === 100}
                    on:change={() => toggleTaskComplete(task)}
                    class="task-checkbox"
                  />
                  <h4 class="{task.progress === 100 ? 'completed' : ''}">{task.name}</h4>
                </div>
                <div class="task-actions">
                  <span class="priority" style="background-color: {getPriorityColor(task.priority)}">
                    {task.priority}
                  </span>
                  <button on:click={() => deleteTask(task.id)} class="btn btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
              
              {#if task.description}
                <p class="task-description">{task.description}</p>
              {/if}
              
              <div class="task-meta">
                <div class="task-info">
                  <span class="project">📁 {task.projects?.name || 'No Project'}</span>
                  <span class="due-date">📅 Due: {formatDate(task.end_date)}</span>
                  {#if isOverdue(task)}
                    <span class="overdue-badge">⚠️ Overdue</span>
                  {/if}
                </div>
                
                <div class="task-progress">
                  <span class="status" style="background-color: {getStatusColor(task.status)}">
                    {task.status.replace('_', ' ')}
                  </span>
                  <span class="progress-text">{task.progress}%</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </main>
</div>

<style>
  .tasks-container {
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

  .loading, .error, .empty-state {
    text-align: center;
    padding: 3rem;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 0.5rem;
    border: 1px solid #f5c6cb;
  }

  .empty-state h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .empty-state p {
    margin-bottom: 2rem;
    color: #666;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e9ecef;
  }

  .tab {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab:hover {
    color: #007bff;
  }

  .tab.active {
    color: #007bff;
    border-bottom-color: #007bff;
  }

  .task-form {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .task-form h3 {
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
    margin-bottom: 1rem;
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

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
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
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .task-card.overdue {
    border-left: 4px solid #dc3545;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .task-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .task-checkbox {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }

  .task-title h4 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
  }

  .task-title h4.completed {
    text-decoration: line-through;
    color: #6c757d;
  }

  .task-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .priority {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
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

  .task-info {
    display: flex;
    gap: 1rem;
    color: #666;
    font-size: 0.9rem;
  }

  .overdue-badge {
    color: #dc3545;
    font-weight: 600;
  }

  .task-progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .status {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .progress-text {
    font-weight: 600;
    color: #333;
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

    .tabs {
      flex-wrap: wrap;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .task-meta {
      flex-direction: column;
      align-items: stretch;
    }

    .task-info {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>

<script>
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let projects = [];
  let tasks = [];
  let overdueTasks = [];
  let loading = true;

  onMount(async () => {
    user = await AuthService.getCurrentUser();
    if (user) {
      await loadProjects();
    }
    loading = false;
  });

  async function loadProjects() {
    try {
      const [projectsResult, tasksResult, overdueResult] = await Promise.all([
        ProjectService.getProjects(user.id),
        ProjectService.getAllTasks(user.id),
        ProjectService.getOverdueTasks(user.id)
      ]);
      
      if (!projectsResult.error) {
        projects = projectsResult.data || [];
      }
      
      if (!tasksResult.error) {
        tasks = tasksResult.data || [];
      }
      
      if (!overdueResult.error) {
        overdueTasks = overdueResult.data || [];
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  async function handleLogout() {
    await AuthService.signOut();
    goto('/');
  }

  function formatDate(dateString) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
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

  function getTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.progress === 100).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const todo = tasks.filter(t => t.progress === 0).length;
    
    return { total, completed, inProgress, todo };
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
      case 'Completed': return '#28a745';
      case 'In progress': return '#007bff';
      case 'Not started': return '#6c757d';
      default: return '#6c757d';
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Ganttiek</title>
</svelte:head>

{#if loading}
  <div class="loading">
    <p>Loading dashboard...</p>
  </div>
{:else if user}
  <div class="dashboard">
    <header class="header">
      <div class="header-content">
        <h1>Ganttiek Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {user.email}</span>
          <button on:click={handleLogout} class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total Projects</h3>
          <div class="stat-number">{projects.length}</div>
        </div>
        <div class="stat-card">
          <h3>Active Projects</h3>
          <div class="stat-number">{projects.filter(p => getProjectStatus(p) === 'In progress').length}</div>
        </div>
        <div class="stat-card">
          <h3>Completed Projects</h3>
          <div class="stat-number">{projects.filter(p => getProjectStatus(p) === 'Completed').length}</div>
        </div>
        <div class="stat-card">
          <h3>Total Tasks</h3>
          <div class="stat-number">{getTaskStats().total}</div>
        </div>
        <div class="stat-card">
          <h3>Completed Tasks</h3>
          <div class="stat-number">{getTaskStats().completed}</div>
        </div>
        <div class="stat-card">
          <h3>Overdue Tasks</h3>
          <div class="stat-number overdue">{overdueTasks.length}</div>
        </div>
      </div>

      <div class="dashboard-section">
        <div class="section-header">
          <h2>Recent Projects</h2>
          <div class="section-actions">
            <button on:click={() => goto('/projects/new')} class="btn btn-primary">
              Create Project
            </button>
            <button on:click={() => goto('/projects')} class="btn btn-secondary">
              View All Projects
            </button>
          </div>
        </div>

        {#if projects.length === 0}
          <div class="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first project to get started with project management.</p>
            <button on:click={() => goto('/projects/new')} class="btn btn-primary">
              Create Your First Project
            </button>
          </div>
        {:else}
          <div class="projects-preview">
            {#each projects.slice(0, 3) as project (project.id)}
              <div class="project-card">
                <div class="project-header">
                  <h4>{project.name}</h4>
                  <span class="status" style="background-color: {getStatusColor(getProjectStatus(project))}">
                    {getProjectStatus(project)}
                  </span>
                </div>
                
                {#if project.description}
                  <p class="description">{project.description}</p>
                {/if}
                
                <div class="project-dates">
                  <span><strong>Start:</strong> {formatDate(project.start_date)}</span>
                  <span><strong>End:</strong> {formatDate(project.end_date)}</span>
                </div>
                
                <div class="project-actions">
                  <button on:click={() => goto(`/projects/${project.id}`)} class="btn btn-primary btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Task Management Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Task Management</h2>
          <div class="section-actions">
            <button on:click={() => goto('/tasks')} class="btn btn-primary">
              View All Tasks
            </button>
          </div>
        </div>

        {#if overdueTasks.length > 0}
          <div class="overdue-alert">
            <h3>⚠️ Overdue Tasks ({overdueTasks.length})</h3>
            <div class="overdue-tasks">
              {#each overdueTasks.slice(0, 3) as task (task.id)}
                <div class="overdue-task">
                  <div class="task-info">
                    <h4>{task.name}</h4>
                    <p>Due: {formatDate(task.end_date)} • {task.projects?.name || 'No Project'}</p>
                  </div>
                  <div class="task-priority" style="background-color: {getPriorityColor(task.priority)}">
                    {task.priority}
                  </div>
                </div>
              {/each}
            </div>
            {#if overdueTasks.length > 3}
              <p class="more-tasks">... and {overdueTasks.length - 3} more overdue tasks</p>
            {/if}
          </div>
        {/if}

        {#if tasks.length > 0}
          <div class="recent-tasks">
            <h3>Recent Tasks</h3>
            <div class="tasks-list">
              {#each tasks.slice(0, 5) as task (task.id)}
                <div class="task-item">
                  <div class="task-content">
                    <h4 class="{task.progress === 100 ? 'completed' : ''}">{task.name}</h4>
                    <p>{task.projects?.name || 'No Project'} • {formatDate(task.end_date)}</p>
                  </div>
                  <div class="task-meta">
                    <span class="priority" style="background-color: {getPriorityColor(task.priority)}">
                      {task.priority}
                    </span>
                    <span class="progress">{task.progress}%</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <h2>Quick Actions</h2>
          <p>Common project management tasks</p>
          <div class="quick-actions">
            <button on:click={() => goto('/projects/new')} class="btn btn-primary">Create Project</button>
            <button on:click={() => goto('/projects')} class="btn btn-secondary">View All Projects</button>
            <button on:click={() => goto('/tasks')} class="btn btn-secondary">Manage Tasks</button>
          </div>
        </div>

        <div class="card">
          <h2>Project Analytics</h2>
          <p>Track your project progress and performance</p>
          <div class="analytics-preview">
            <div class="analytics-item">
              <span>Completion Rate:</span>
              <span class="analytics-value">
                {projects.length > 0 ? Math.round((projects.filter(p => getProjectStatus(p) === 'Completed').length / projects.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }

  .dashboard {
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

  .header h1 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info span {
    color: #666;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .stat-card h3 {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #007bff;
  }

  .stat-number.overdue {
    color: #dc3545;
  }

  .dashboard-section {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .section-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
  }

  .section-actions {
    display: flex;
    gap: 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .empty-state h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .empty-state p {
    margin-bottom: 2rem;
  }

  .projects-preview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .project-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e9ecef;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .project-header h4 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
    flex: 1;
  }

  .status {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .description {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.5;
    font-size: 0.9rem;
  }

  .project-dates {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
  }

  .project-actions {
    display: flex;
    gap: 0.5rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .analytics-preview {
    margin-top: 1rem;
  }

  .analytics-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
  }

  .analytics-item:last-child {
    border-bottom: none;
  }

  .analytics-value {
    font-weight: 600;
    color: #007bff;
  }

  .card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .card h2 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.25rem;
  }

  .card p {
    margin: 0 0 1.5rem 0;
    color: #666;
    line-height: 1.5;
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

  /* Task Management Styles */
  .overdue-alert {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .overdue-alert h3 {
    color: #721c24;
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .overdue-tasks {
    display: grid;
    gap: 0.75rem;
  }

  .overdue-task {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1rem;
    border-radius: 0.25rem;
    border-left: 4px solid #dc3545;
  }

  .task-info h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
    font-size: 1rem;
  }

  .task-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  .task-priority {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .more-tasks {
    margin: 1rem 0 0 0;
    color: #721c24;
    font-style: italic;
    text-align: center;
  }

  .recent-tasks h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
  }

  .tasks-list {
    display: grid;
    gap: 0.75rem;
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.25rem;
    border-left: 4px solid #e9ecef;
  }

  .task-content h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
    font-size: 1rem;
  }

  .task-content h4.completed {
    text-decoration: line-through;
    color: #6c757d;
  }

  .task-content p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

  .task-meta {
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

  .progress {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }
</style>

<script>
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let projects = [];
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
      const { data, error } = await ProjectService.getProjects(user.id);
      if (!error) {
        projects = data || [];
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
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

      <div class="dashboard-grid">
        <div class="card">
          <h2>Quick Actions</h2>
          <p>Common project management tasks</p>
          <div class="quick-actions">
            <button on:click={() => goto('/projects/new')} class="btn btn-primary">Create Project</button>
            <button on:click={() => goto('/projects')} class="btn btn-secondary">View All Projects</button>
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
</style>

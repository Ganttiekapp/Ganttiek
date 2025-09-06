<script>
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let projects = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    user = await AuthService.getCurrentUser();
    if (user) {
      await loadProjects();
    } else {
      goto('/login');
    }
  });

  async function loadProjects() {
    try {
      loading = true;
      const { data, error: fetchError } = await ProjectService.getProjects(user.id);
      
      if (fetchError) {
        error = fetchError.message;
      } else {
        projects = data || [];
      }
    } catch (err) {
      error = 'Failed to load projects';
    } finally {
      loading = false;
    }
  }

  async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await ProjectService.deleteProject(projectId, user.id);
      
      if (deleteError) {
        error = deleteError.message;
      } else {
        await loadProjects(); // Reload the list
      }
    } catch (err) {
      error = 'Failed to delete project';
    }
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
  <title>Projects - Ganttiek</title>
</svelte:head>

<div class="projects-container">
  <header class="header">
    <div class="header-content">
      <h1>My Projects</h1>
      <div class="header-actions">
        <button on:click={() => goto('/projects/new')} class="btn btn-primary">
          Create Project
        </button>
        <button on:click={() => goto('/dashboard')} class="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
    </div>
  </header>

  <main class="main-content">
    {#if loading}
      <div class="loading">
        <p>Loading projects...</p>
      </div>
    {:else if error}
      <div class="error">
        {error}
      </div>
    {:else if projects.length === 0}
      <div class="empty-state">
        <h2>No projects yet</h2>
        <p>Create your first project to get started with project management.</p>
        <button on:click={() => goto('/projects/new')} class="btn btn-primary">
          Create Your First Project
        </button>
      </div>
    {:else}
      <div class="projects-grid">
        {#each projects as project (project.id)}
          <div class="project-card">
            <div class="project-header">
              <h3>{project.name}</h3>
              <span class="status" style="background-color: {getStatusColor(getProjectStatus(project))}">
                {getProjectStatus(project)}
              </span>
            </div>
            
            {#if project.description}
              <p class="description">{project.description}</p>
            {/if}
            
            <div class="project-dates">
              <div class="date-item">
                <strong>Start:</strong> {formatDate(project.start_date)}
              </div>
              <div class="date-item">
                <strong>End:</strong> {formatDate(project.end_date)}
              </div>
            </div>
            
            <div class="project-actions">
              <button on:click={() => goto(`/projects/${project.id}`)} class="btn btn-primary">
                View Details
              </button>
              <button on:click={() => goto(`/projects/${project.id}/edit`)} class="btn btn-secondary">
                Edit
              </button>
              <button on:click={() => deleteProject(project.id)} class="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .projects-container {
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

  .empty-state h2 {
    color: #333;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 2rem;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
  }

  .project-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .project-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
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
  }

  .project-dates {
    margin-bottom: 1.5rem;
  }

  .date-item {
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 0.9rem;
  }

  .project-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
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
</style>

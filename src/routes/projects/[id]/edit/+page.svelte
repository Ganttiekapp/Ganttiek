<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';

  let user = null;
  let project = null;
  let loading = true;
  let saving = false;
  let error = '';
  let success = '';

  let formData = {
    name: '',
    description: '',
    start_date: '',
    end_date: ''
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
      const { data, error: fetchError } = await ProjectService.getProject($page.params.id, user.id);
      
      if (fetchError) {
        error = fetchError.message;
        return;
      }

      project = data;
      formData = {
        name: data.name || '',
        description: data.description || '',
        start_date: data.start_date || '',
        end_date: data.end_date || ''
      };
    } catch (err) {
      error = 'Failed to load project';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!formData.name.trim()) {
      error = 'Project name is required';
      return;
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      error = 'End date must be after start date';
      return;
    }

    saving = true;
    error = '';
    success = '';

    try {
      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      const { data, error: updateError } = await ProjectService.updateProject($page.params.id, updates, user.id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        success = 'Project updated successfully!';
        project = data;
        setTimeout(() => {
          goto(`/projects/${$page.params.id}`);
        }, 1500);
      }
    } catch (err) {
      error = 'Failed to update project';
    } finally {
      saving = false;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <title>Edit Project - Ganttiek</title>
</svelte:head>

<div class="form-container">
  <div class="form-card">
    <div class="form-header">
      <h1>Edit Project</h1>
      <button on:click={() => goto(`/projects/${$page.params.id}`)} class="btn btn-secondary">
        Back to Project
      </button>
    </div>
    
    {#if loading}
      <div class="loading">
        <p>Loading project...</p>
      </div>
    {:else if error}
      <div class="error">
        {error}
      </div>
    {:else if project}
      {#if success}
        <div class="success">
          {success}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="name">Project Name *</label>
          <input
            id="name"
            type="text"
            bind:value={formData.name}
            on:keydown={handleKeydown}
            placeholder="Enter project name"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            bind:value={formData.description}
            on:keydown={handleKeydown}
            placeholder="Enter project description (optional)"
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
              on:keydown={handleKeydown}
            />
          </div>

          <div class="form-group">
            <label for="end_date">End Date</label>
            <input
              id="end_date"
              type="date"
              bind:value={formData.end_date}
              on:keydown={handleKeydown}
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" disabled={saving} class="btn btn-primary">
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button type="button" on:click={() => goto(`/projects/${$page.params.id}`)} class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      <div class="form-help">
        <p><strong>Tip:</strong> Press Ctrl+Enter to quickly save changes.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .form-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 2rem;
    background-color: #f8f9fa;
  }

  .form-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .form-header h1 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    box-sizing: border-box;
    font-family: inherit;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
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

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
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

  .form-help {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #e7f3ff;
    border-radius: 0.25rem;
    border: 1px solid #b8daff;
  }

  .form-help p {
    margin: 0;
    color: #004085;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .form-container {
      padding: 1rem;
    }

    .form-header {
      flex-direction: column;
      gap: 1rem;
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

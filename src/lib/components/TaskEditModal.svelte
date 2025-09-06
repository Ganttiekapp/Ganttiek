<script>
  import { createEventDispatcher } from 'svelte';
  import { ProjectService } from '$lib/projectService.js';

  export let task = null;
  export let projects = [];
  export let isOpen = false;

  const dispatch = createEventDispatcher();

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

  let saving = false;
  let error = '';
  let validationErrors = {};

  $: if (task && isOpen) {
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
    error = '';
    validationErrors = {};
  }

  function validateForm() {
    validationErrors = {};
    
    if (!formData.name.trim()) {
      validationErrors.name = 'Task name is required';
    } else if (formData.name.trim().length < 3) {
      validationErrors.name = 'Task name must be at least 3 characters';
    }
    
    if (!formData.project_id) {
      validationErrors.project_id = 'Please select a project';
    }
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      validationErrors.end_date = 'End date must be after start date';
    }
    
    if (formData.progress < 0 || formData.progress > 100) {
      validationErrors.progress = 'Progress must be between 0 and 100';
    }
    
    return Object.keys(validationErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      error = 'Please fix the validation errors below';
      return;
    }

    saving = true;
    error = '';

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

      const { data, error: updateError } = await ProjectService.updateTask(task.id, updates, task.user_id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        dispatch('taskUpdated', data);
        closeModal();
      }
    } catch (err) {
      error = 'Failed to update task';
    } finally {
      saving = false;
    }
  }

  function closeModal() {
    dispatch('close');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Edit Task</h2>
        <button on:click={closeModal} class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        {#if error}
          <div class="error">
            {error}
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="modal-name">Task Name *</label>
            <input
              id="modal-name"
              type="text"
              bind:value={formData.name}
              placeholder="Enter task name"
              class:error={validationErrors.name}
              required
            />
            {#if validationErrors.name}
              <span class="error-message">{validationErrors.name}</span>
            {/if}
          </div>

          <div class="form-group">
            <label for="modal-project">Project *</label>
            <select 
              id="modal-project" 
              bind:value={formData.project_id} 
              class:error={validationErrors.project_id}
              required
            >
              <option value="">Select a project</option>
              {#each projects as project (project.id)}
                <option value={project.id}>{project.name}</option>
              {/each}
            </select>
            {#if validationErrors.project_id}
              <span class="error-message">{validationErrors.project_id}</span>
            {/if}
          </div>

          <div class="form-group">
            <label for="modal-description">Description</label>
            <textarea
              id="modal-description"
              bind:value={formData.description}
              placeholder="Enter task description (optional)"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="modal-start">Start Date</label>
              <input
                id="modal-start"
                type="date"
                bind:value={formData.start_date}
              />
            </div>
            <div class="form-group">
              <label for="modal-end">Due Date</label>
              <input
                id="modal-end"
                type="date"
                bind:value={formData.end_date}
                class:error={validationErrors.end_date}
              />
              {#if validationErrors.end_date}
                <span class="error-message">{validationErrors.end_date}</span>
              {/if}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="modal-priority">Priority</label>
              <select id="modal-priority" bind:value={formData.priority}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="form-group">
              <label for="modal-status">Status</label>
              <select id="modal-status" bind:value={formData.status}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label for="modal-progress">Progress (%)</label>
              <input
                id="modal-progress"
                type="number"
                min="0"
                max="100"
                bind:value={formData.progress}
                class:error={validationErrors.progress}
              />
              {#if validationErrors.progress}
                <span class="error-message">{validationErrors.progress}</span>
              {/if}
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" disabled={saving} class="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" on:click={closeModal} class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
  }

  .close-btn:hover {
    background-color: #f8f9fa;
    color: #333;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
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

  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .form-group input.error, .form-group select.error, .form-group textarea.error {
    border-color: #dc3545;
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
  }

  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
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

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
</style>

<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AuthService } from '$lib/auth.js';
  import { ProjectService } from '$lib/projectService.js';
  import { goto } from '$app/navigation';
  import { BananasGantt } from '$lib/gantt/index.js';

  let user = null;
  let project = null;
  let tasks = [];
  let loading = true;
  let error = '';
  let showTaskForm = false;
  let editingTaskId = null;
  let editingTask = {};
  let validationErrors = {};
  let success = '';
  let availableParentTasks = [];

  // Transform tasks for Gantt chart
  $: ganttTasks = tasks.map(task => ({
    id: task.id,
    name: task.name,
    description: task.description || '',
    startDate: new Date(task.start_date),
    endDate: new Date(task.end_date),
    progress: task.progress || 0,
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    resourceId: null,
    parentId: null,
    children: [],
    dependencies: [],
    milestones: [],
    isCritical: false,
    slack: 0,
    earlyStart: new Date(task.start_date),
    earlyFinish: new Date(task.end_date),
    lateStart: new Date(task.start_date),
    lateFinish: new Date(task.end_date),
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
    customFields: {}
  }));

  let newTask = {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
    status: 'todo',
    progress: 0,
    dependencies: []
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
      
      // Load available parent tasks for dependency selection
      loadAvailableParentTasks();
    } catch (err) {
      error = 'Failed to load project';
    } finally {
      loading = false;
    }
  }

  function loadAvailableParentTasks(currentTaskId = null) {
    // Use existing tasks array to populate available parent tasks
    availableParentTasks = tasks.filter(task => {
      // Don't include the current task being edited
      if (currentTaskId && task.id === currentTaskId) return false;
      // Don't include tasks that would create circular dependencies
      if (currentTaskId && wouldCreateCircularDependency(task.id, currentTaskId, tasks)) return false;
      return true;
    });
  }

  function wouldCreateCircularDependency(newParentId, childTaskId, allTasks) {
    let currentTaskId = newParentId;
    const visited = new Set();
    
    while (currentTaskId && !visited.has(currentTaskId)) {
      if (currentTaskId === childTaskId) {
        return true; // Circular dependency detected
      }
      
      visited.add(currentTaskId);
      const parentTask = allTasks.find(task => task.id === currentTaskId);
      // For now, we'll use a simple check - in a real implementation,
      // you'd need to check the task_dependencies table
      currentTaskId = null; // Simplified for now
    }
    
    return false;
  }

  function validateTaskForm(taskData) {
    validationErrors = {};
    
    if (!taskData.name.trim()) {
      validationErrors.name = 'Task name is required';
    } else if (taskData.name.trim().length < 3) {
      validationErrors.name = 'Task name must be at least 3 characters';
    }
    
    if (taskData.start_date && taskData.end_date && taskData.start_date > taskData.end_date) {
      validationErrors.end_date = 'End date must be after start date';
    }
    
    if (taskData.progress < 0 || taskData.progress > 100) {
      validationErrors.progress = 'Progress must be between 0 and 100';
    }
    
    return Object.keys(validationErrors).length === 0;
  }

  async function createTask() {
    if (!validateTaskForm(newTask)) {
      error = 'Please fix the validation errors below';
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
          progress: 0,
          dependencies: []
        };
        showTaskForm = false;
        error = '';
        validationErrors = {};
        success = 'Task created successfully!';
        setTimeout(() => success = '', 3000);
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
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await ProjectService.deleteTask(taskId, user.id);
      
      if (deleteError) {
        error = deleteError.message;
      } else {
        tasks = tasks.filter(t => t.id !== taskId);
        success = 'Task deleted successfully!';
        setTimeout(() => success = '', 3000);
      }
    } catch (err) {
      error = 'Failed to delete task';
    }
  }

  function startEditTask(task) {
    editingTaskId = task.id;
    editingTask = {
      name: task.name || '',
      description: task.description || '',
      start_date: task.start_date || '',
      end_date: task.end_date || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      progress: task.progress || 0,
      dependencies: task.dependencies || []
    };
    validationErrors = {};
    error = '';
    // Load available parent tasks for this specific task
    loadAvailableParentTasks(task.id);
  }

  function cancelEditTask() {
    editingTaskId = null;
    editingTask = {};
    validationErrors = {};
    error = '';
  }

  async function saveEditTask() {
    if (!validateTaskForm(editingTask)) {
      error = 'Please fix the validation errors below';
      return;
    }

    try {
      const updates = {
        name: editingTask.name.trim(),
        description: editingTask.description.trim() || null,
        start_date: editingTask.start_date || null,
        end_date: editingTask.end_date || null,
        priority: editingTask.priority,
        status: editingTask.status,
        progress: editingTask.progress
      };

      const { data, error: updateError } = await ProjectService.updateTask(editingTaskId, updates, user.id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        tasks = tasks.map(t => t.id === editingTaskId ? data : t);
        cancelEditTask();
        success = 'Task updated successfully!';
        setTimeout(() => success = '', 3000);
      }
    } catch (err) {
      error = 'Failed to update task';
    }
  }

  async function updateTaskStatus(taskId, status) {
    try {
      const { data, error: updateError } = await ProjectService.updateTaskStatus(taskId, status, user.id);
      
      if (updateError) {
        error = updateError.message;
      } else {
        tasks = tasks.map(task => task.id === taskId ? data : task);
        success = 'Task status updated!';
        setTimeout(() => success = '', 2000);
      }
    } catch (err) {
      error = 'Failed to update task status';
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
    {:else if success}
      <div class="success">
        {success}
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

      <!-- Bananas Gantt Chart Section -->
      {#if ganttTasks && ganttTasks.length > 0}
        <div class="gantt-section">
          <h2>Project Timeline</h2>
          <p class="gantt-info">Showing {ganttTasks.length} tasks in Gantt chart</p>
          <BananasGantt 
            tasks={ganttTasks}
            dependencies={[]}
            resources={[]}
            theme="default"
            width={1200}
            height={600}
            enableInteractions={true}
            showCriticalPath={true}
            showDependencies={true}
            showProgress={true}
            enableExport={true}
            enableUndoRedo={true}
            on:taskClick={(event) => console.log('Task clicked:', event.detail)}
            on:taskUpdated={(event) => console.log('Task updated:', event.detail)}
            on:dependencyCreated={(event) => console.log('Dependency created:', event.detail)}
          />
        </div>
      {:else if tasks && tasks.length === 0}
        <div class="gantt-section">
          <h2>Project Timeline</h2>
          <p class="no-tasks-message">No tasks yet. Create some tasks to see the Gantt chart.</p>
        </div>
      {/if}

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
                    class:error={validationErrors.name}
                    required
                  />
                  {#if validationErrors.name}
                    <span class="error-message">{validationErrors.name}</span>
                  {/if}
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

              <div class="form-group">
                <label for="task-dependencies">Task Dependencies</label>
                <div class="dependency-selector">
                  {#each availableParentTasks as parentTask (parentTask.id)}
                    <label class="dependency-option">
                      <input
                        type="checkbox"
                        bind:group={newTask.dependencies}
                        value={parentTask.id}
                      />
                      <span class="dependency-name">{parentTask.name}</span>
                    </label>
                  {/each}
                  {#if availableParentTasks.length === 0}
                    <p class="no-dependencies">No other tasks available for dependencies</p>
                  {/if}
                </div>
                <small class="form-help">Select tasks that must be completed before this task can start</small>
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
                {#if editingTaskId === task.id}
                  <!-- Edit Mode -->
                  <div class="task-edit-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label for="edit-name-{editingTaskId}">Task Name *</label>
                        <input
                          id="edit-name-{editingTaskId}"
                          type="text"
                          bind:value={editingTask.name}
                          class:error={validationErrors.name}
                          placeholder="Enter task name"
                        />
                        {#if validationErrors.name}
                          <span class="error-message">{validationErrors.name}</span>
                        {/if}
                      </div>
                      <div class="form-group">
                        <label for="edit-priority-{editingTaskId}">Priority</label>
                        <select id="edit-priority-{editingTaskId}" bind:value={editingTask.priority}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="edit-description-{editingTaskId}">Description</label>
                      <textarea
                        id="edit-description-{editingTaskId}"
                        bind:value={editingTask.description}
                        placeholder="Enter task description (optional)"
                        rows="2"
                      ></textarea>
                    </div>

                    <div class="form-group">
                      <label for="edit-dependencies-{editingTaskId}">Task Dependencies</label>
                      <div class="dependency-selector">
                        {#each availableParentTasks as parentTask (parentTask.id)}
                          <label class="dependency-option">
                            <input
                              type="checkbox"
                              bind:group={editingTask.dependencies}
                              value={parentTask.id}
                            />
                            <span class="dependency-name">{parentTask.name}</span>
                          </label>
                        {/each}
                        {#if availableParentTasks.length === 0}
                          <p class="no-dependencies">No other tasks available for dependencies</p>
                        {/if}
                      </div>
                      <small class="form-help">Select tasks that must be completed before this task can start</small>
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label for="edit-start-{editingTaskId}">Start Date</label>
                        <input id="edit-start-{editingTaskId}" type="date" bind:value={editingTask.start_date} />
                      </div>
                      <div class="form-group">
                        <label for="edit-end-{editingTaskId}">End Date</label>
                        <input 
                          id="edit-end-{editingTaskId}"
                          type="date" 
                          bind:value={editingTask.end_date}
                          class:error={validationErrors.end_date}
                        />
                        {#if validationErrors.end_date}
                          <span class="error-message">{validationErrors.end_date}</span>
                        {/if}
                      </div>
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label for="edit-status-{editingTaskId}">Status</label>
                        <select id="edit-status-{editingTaskId}" bind:value={editingTask.status}>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label for="edit-progress-{editingTaskId}">Progress (%)</label>
                        <input
                          id="edit-progress-{editingTaskId}"
                          type="number"
                          min="0"
                          max="100"
                          bind:value={editingTask.progress}
                          class:error={validationErrors.progress}
                        />
                        {#if validationErrors.progress}
                          <span class="error-message">{validationErrors.progress}</span>
                        {/if}
                      </div>
                    </div>
                    
                    <div class="edit-actions">
                      <button on:click={saveEditTask} class="btn btn-success btn-sm">
                        Save
                      </button>
                      <button on:click={cancelEditTask} class="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                {:else}
                  <!-- View Mode -->
                  <div class="task-header">
                    <div class="task-title">
                      <input
                        type="checkbox"
                        checked={(task.progress || 0) === 100}
                        on:change={() => toggleTaskComplete(task)}
                        class="task-checkbox"
                      />
                      <h4 class="{(task.progress || 0) === 100 ? 'completed' : ''}">{task.name || 'Untitled Task'}</h4>
                    </div>
                    <div class="task-actions">
                      <span class="priority" style="background-color: {getPriorityColor(task.priority || 'medium')}">
                        {task.priority || 'medium'}
                      </span>
                      <span class="status" style="background-color: {getStatusColor(task.status || 'todo')}">
                        {(task.status || 'todo').replace('_', ' ')}
                      </span>
                      <button on:click={() => startEditTask(task)} class="btn btn-primary btn-sm">
                        Edit
                      </button>
                      <button on:click={() => deleteTask(task.id)} class="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                {/if}
                
                {#if editingTaskId !== task.id}
                  {#if task.description}
                    <p class="task-description">{task.description}</p>
                  {/if}
                  
                  <div class="task-meta">
                    <div class="task-dates">
                      <span><strong>Start:</strong> {formatDate(task.start_date)}</span>
                      <span><strong>End:</strong> {formatDate(task.end_date)}</span>
                      {#if task.dependencies && task.dependencies.length > 0}
                        <span class="dependency-info">
                          <strong>Depends on:</strong> 
                          {#each task.dependencies as depId}
                            {#each tasks as parentTask (parentTask.id)}
                              {#if parentTask.id === depId}
                                <span class="dependency-badge">{parentTask.name}</span>
                              {/if}
                            {/each}
                          {/each}
                        </span>
                      {/if}
                    </div>
                    
                    <div class="task-progress">
                      <label for="progress-{task.id}">Progress:</label>
                      <input
                        id="progress-{task.id}"
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress || 0}
                        on:input={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                        class="progress-slider"
                      />
                      <span class="progress-value">{task.progress || 0}%</span>
                    </div>
                  </div>
                {/if}
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

  .gantt-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    margin: 2rem 0;
    overflow: hidden;
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

  .btn-success {
    background-color: #28a745;
    color: white;
  }

  .btn-success:hover {
    background-color: #218838;
  }

  .success {
    background-color: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid #c3e6cb;
  }

  .task-edit-form {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 2px solid #007bff;
    margin-bottom: 1rem;
  }

  .task-edit-form .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .task-edit-form .form-group {
    margin-bottom: 1rem;
  }

  .task-edit-form .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  .task-edit-form .form-group input,
  .task-edit-form .form-group select,
  .task-edit-form .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .task-edit-form .form-group input:focus,
  .task-edit-form .form-group select:focus,
  .task-edit-form .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .task-edit-form .form-group input.error {
    border-color: #dc3545;
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
  }

  .error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
  }

  .edit-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }

  .task-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .task-checkbox {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }

  .task-title h4.completed {
    text-decoration: line-through;
    color: #6c757d;
  }

  .dependency-info {
    color: #6c757d;
    font-size: 0.9rem;
    display: block;
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
    border-left: 3px solid #007bff;
  }

  .form-help {
    color: #6c757d;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
  }

  .dependency-selector {
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    padding: 0.75rem;
    background-color: #f8f9fa;
    max-height: 200px;
    overflow-y: auto;
  }

  .dependency-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .dependency-option:hover {
    background-color: #e9ecef;
  }

  .dependency-option input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }

  .dependency-name {
    font-size: 0.9rem;
    color: #333;
  }

  .no-dependencies {
    color: #6c757d;
    font-style: italic;
    margin: 0;
    padding: 0.5rem;
    text-align: center;
  }

  .dependency-badge {
    display: inline-block;
    background-color: #007bff;
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    margin: 0.125rem;
  }

  .gantt-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .gantt-section h2 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  .gantt-info {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    font-size: 0.9rem;
    font-style: italic;
  }

  .no-tasks-message {
    margin: 0;
    padding: 2rem;
    text-align: center;
    color: #6b7280;
    font-size: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 2px dashed #d1d5db;
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

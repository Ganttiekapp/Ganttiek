<!--
  Gantt Chart Demo Page
  This page demonstrates the Bananas Gantt Chart Library with sample data
-->

<script>
  import { onMount } from 'svelte';
  import { BananasGantt } from '$lib/gantt/index.js';
  
  let tasks = [];
  let dependencies = [];
  let resources = [];
  
  onMount(() => {
    // Create sample tasks for demonstration
    tasks = [
      {
        id: 'task-1',
        name: 'Project Planning',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        progress: 100,
        status: 'completed',
        priority: 'high'
      },
      {
        id: 'task-2',
        name: 'Development Phase 1',
        startDate: new Date('2024-01-16'),
        endDate: new Date('2024-02-15'),
        progress: 75,
        status: 'in_progress',
        priority: 'high'
      },
      {
        id: 'task-3',
        name: 'Testing Phase',
        startDate: new Date('2024-02-16'),
        endDate: new Date('2024-03-01'),
        progress: 25,
        status: 'todo',
        priority: 'medium'
      },
      {
        id: 'task-4',
        name: 'Deployment',
        startDate: new Date('2024-03-02'),
        endDate: new Date('2024-03-05'),
        progress: 0,
        status: 'todo',
        priority: 'high'
      },
      {
        id: 'task-5',
        name: 'Documentation',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-02-10'),
        progress: 60,
        status: 'in_progress',
        priority: 'medium'
      }
    ];
    
    // Create sample dependencies
    dependencies = [
      {
        from: 'task-1',
        to: 'task-2',
        type: 'finish-to-start',
        lag: 0
      },
      {
        from: 'task-2',
        to: 'task-3',
        type: 'finish-to-start',
        lag: 0
      },
      {
        from: 'task-3',
        to: 'task-4',
        type: 'finish-to-start',
        lag: 0
      }
    ];
    
    // Create sample resources
    resources = [
      {
        id: 'dev-1',
        name: 'Developer 1',
        type: 'human',
        capacity: 1,
        cost: 100
      },
      {
        id: 'tester-1',
        name: 'Tester 1',
        type: 'human',
        capacity: 1,
        cost: 80
      }
    ];
  });
  
  function handleTaskClick(event) {
    console.log('Task clicked:', event.detail);
  }
  
  function handleTaskUpdated(event) {
    console.log('Task updated:', event.detail);
  }
  
  function handleDependencyCreated(event) {
    console.log('Dependency created:', event.detail);
  }
</script>

<svelte:head>
  <title>Gantt Chart Demo - Gattiek</title>
</svelte:head>

<div class="demo-container">
  <header class="demo-header">
    <h1>🍌 Bananas Gantt Chart Demo</h1>
    <p>Interactive Gantt chart with sample project data</p>
  </header>
  
  <main class="demo-main">
    {#if tasks.length > 0}
      <div class="gantt-demo-section">
        <h2>Project Timeline</h2>
        <p>This is a demonstration of the Bananas Gantt Chart Library with sample data.</p>
        
        <BananasGantt 
          {tasks}
          {dependencies}
          {resources}
          theme="default"
          width={1200}
          height={600}
          enableInteractions={true}
          showCriticalPath={true}
          showDependencies={true}
          showProgress={true}
          enableExport={true}
          enableUndoRedo={true}
          on:taskClick={handleTaskClick}
          on:taskUpdated={handleTaskUpdated}
          on:dependencyCreated={handleDependencyCreated}
        />
      </div>
      
      <div class="demo-info">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✅ Task visualization with timeline bars</li>
          <li>✅ Progress indicators</li>
          <li>✅ Status-based coloring (completed, in-progress, todo)</li>
          <li>✅ Dependency arrows</li>
          <li>✅ Critical path highlighting</li>
          <li>✅ Interactive toolbar with zoom, export, and toggle options</li>
          <li>✅ Drag and drop task manipulation</li>
          <li>✅ Task resizing</li>
          <li>✅ Context menus</li>
          <li>✅ Keyboard shortcuts</li>
          <li>✅ Undo/Redo functionality</li>
        </ul>
        
        <h3>Sample Data:</h3>
        <ul>
          <li><strong>Tasks:</strong> {tasks.length} tasks with different statuses and priorities</li>
          <li><strong>Dependencies:</strong> {dependencies.length} task dependencies</li>
          <li><strong>Resources:</strong> {resources.length} assigned resources</li>
        </ul>
      </div>
    {:else}
      <div class="loading">
        <p>Loading Gantt chart...</p>
      </div>
    {/if}
  </main>
</div>

<style>
  .demo-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 0;
  }
  
  .demo-header {
    background: white;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }
  
  .demo-header h1 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 2.5rem;
    font-weight: 700;
  }
  
  .demo-header p {
    margin: 0;
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .demo-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .gantt-demo-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
    overflow: hidden;
  }
  
  .gantt-demo-section h2 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .gantt-demo-section p {
    margin: 0 0 2rem 0;
    color: #6b7280;
    font-size: 1rem;
  }
  
  .demo-info {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
  }
  
  .demo-info h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .demo-info ul {
    margin: 0 0 2rem 0;
    padding-left: 1.5rem;
  }
  
  .demo-info li {
    margin: 0.5rem 0;
    color: #374151;
    line-height: 1.6;
  }
  
  .demo-info strong {
    color: #1f2937;
    font-weight: 600;
  }
  
  .loading {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
  }
  
  .loading p {
    font-size: 1.1rem;
    margin: 0;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .demo-header {
      padding: 1.5rem 1rem;
    }
    
    .demo-header h1 {
      font-size: 2rem;
    }
    
    .demo-main {
      padding: 0 1rem;
    }
    
    .gantt-demo-section,
    .demo-info {
      padding: 1.5rem;
    }
  }
</style>

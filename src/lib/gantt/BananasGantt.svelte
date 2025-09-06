<!--
  🍌 BANANAS GANTT CHART COMPONENT 🍌
  The ultimate, full-featured Gantt chart library built from scratch!
  
  Features:
  - Advanced timeline calculations
  - Critical path analysis
  - Drag and drop interactions
  - Dependency management
  - Resource allocation
  - Multiple themes
  - Export capabilities
  - Performance optimization
  - Mobile support
  - Undo/Redo system
-->

<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { GanttEngine } from './GanttEngine.js';
  import { GanttRenderer } from './GanttRenderer.js';
  import { GanttInteractions } from './GanttInteractions.js';
  
  export let tasks = [];
  export let dependencies = [];
  export let resources = [];
  export let options = {};
  export let theme = 'default';
  export let width = 1200;
  export let height = 600;
  export let enableInteractions = true;
  export let showCriticalPath = true;
  export let showDependencies = true;
  export let showProgress = true;
  export let showResources = true;
  export let enableExport = true;
  export let enableUndoRedo = true;
  
  const dispatch = createEventDispatcher();
  
  let container;
  let engine;
  let renderer;
  let interactions;
  let isInitialized = false;
  
  // Component state
  let selectedTasks = [];
  let canUndo = false;
  let canRedo = false;
  let currentZoom = 1;
  let currentPan = { x: 0, y: 0 };
  
  // Toolbar state
  let showToolbar = true;
  let showSidebar = true;
  let showTimeline = true;
  let showGrid = true;
  
  onMount(() => {
    initializeGantt();
    setupEventListeners();
  });
  
  onDestroy(() => {
    cleanup();
  });
  
  function initializeGantt() {
    if (!container) return;
    
    try {
      // Initialize the Gantt engine
      engine = new GanttEngine({
        timeScale: options.timeScale || 'day',
        workingDays: options.workingDays || [1, 2, 3, 4, 5],
        workingHours: options.workingHours || { start: 9, end: 17 },
        holidays: options.holidays || [],
        ...options
      });
      
      // Initialize the renderer
      renderer = new GanttRenderer(container, engine, {
        width,
        height,
        theme,
        showDependencies,
        showCriticalPath,
        showProgress,
        showResources,
        ...options
      });
      
      // Initialize interactions if enabled
      if (enableInteractions) {
        interactions = new GanttInteractions(renderer, engine, {
          enableDragDrop: true,
          enableResize: true,
          enableDependencyCreation: true,
          enableContextMenu: true,
          enableKeyboardShortcuts: true,
          enableMultiSelect: true,
          enableUndoRedo,
          ...options
        });
      }
      
      // Load initial data
      loadData();
      
      isInitialized = true;
      dispatch('initialized', { engine, renderer, interactions });
      
    } catch (error) {
      console.error('Failed to initialize Gantt chart:', error);
      dispatch('error', { error });
    }
  }
  
  function loadData() {
    if (!engine) return;
    
    try {
      // Clear existing data
      engine.tasks.clear();
      engine.dependencies.clear();
      engine.resources.clear();
      
      // Load tasks
      if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
          engine.addTask(task);
        });
      }
      
      // Load dependencies
      if (dependencies && dependencies.length > 0) {
        dependencies.forEach(dep => {
          engine.addDependency(dep.from, dep.to, dep.type, dep.lag);
        });
      }
      
      // Load resources
      if (resources && resources.length > 0) {
        resources.forEach(resource => {
          engine.addResource(resource);
        });
      }
      
      // Calculate critical path
      engine.calculateCriticalPath();
      
      // Render the chart
      if (renderer) {
        renderer.render();
      }
      
      dispatch('dataLoaded', { 
        tasks: engine.getTasks(), 
        dependencies: engine.getDependencies(),
        resources: engine.getResources(),
        criticalPath: engine.getCriticalPath()
      });
      
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch('error', { error });
    }
  }
  
  function setupEventListeners() {
    if (!container) return;
    
    // Engine events
    if (engine) {
      engine.on('taskAdded', (task) => dispatch('taskAdded', { task }));
      engine.on('taskUpdated', (task) => dispatch('taskUpdated', { task }));
      engine.on('taskDeleted', (taskId) => dispatch('taskDeleted', { taskId }));
      engine.on('dependencyAdded', (dependency) => dispatch('dependencyAdded', { dependency }));
      engine.on('dependencyRemoved', (dependencyId) => dispatch('dependencyRemoved', { dependencyId }));
      engine.on('criticalPathCalculated', (criticalPath) => dispatch('criticalPathCalculated', { criticalPath }));
    }
    
    // Interaction events
    if (interactions) {
      container.addEventListener('taskClick', (event) => {
        dispatch('taskClick', event.detail);
      });
      
      container.addEventListener('taskHover', (event) => {
        dispatch('taskHover', event.detail);
      });
      
      container.addEventListener('dragStart', (event) => {
        dispatch('dragStart', event.detail);
      });
      
      container.addEventListener('dragEnd', (event) => {
        dispatch('dragEnd', event.detail);
      });
      
      container.addEventListener('resizeStart', (event) => {
        dispatch('resizeStart', event.detail);
      });
      
      container.addEventListener('resizeEnd', (event) => {
        dispatch('resizeEnd', event.detail);
      });
      
      container.addEventListener('dependencyCreated', (event) => {
        dispatch('dependencyCreated', event.detail);
      });
      
      container.addEventListener('editTask', (event) => {
        dispatch('editTask', event.detail);
      });
      
      container.addEventListener('taskDeleted', (event) => {
        dispatch('taskDeleted', event.detail);
      });
      
      container.addEventListener('taskSelected', (event) => {
        selectedTasks = interactions.getSelectedTasks();
        dispatch('taskSelected', event.detail);
      });
      
      container.addEventListener('selectionCleared', () => {
        selectedTasks = [];
        dispatch('selectionCleared');
      });
      
      container.addEventListener('undo', (event) => {
        updateUndoRedoState();
        dispatch('undo', event.detail);
      });
      
      container.addEventListener('redo', (event) => {
        updateUndoRedoState();
        dispatch('redo', event.detail);
      });
    }
  }
  
  function updateUndoRedoState() {
    if (interactions) {
      canUndo = interactions.canUndo();
      canRedo = interactions.canRedo();
    }
  }
  
  function cleanup() {
    if (interactions) {
      interactions.destroy();
    }
    if (renderer) {
      renderer.svg = null;
    }
    if (engine) {
      engine.eventListeners.clear();
    }
  }
  
  // ===== PUBLIC METHODS =====
  
  export function addTask(task) {
    if (!engine) return null;
    return engine.addTask(task);
  }
  
  export function updateTask(taskId, updates) {
    if (!engine) return null;
    return engine.updateTask(taskId, updates);
  }
  
  export function deleteTask(taskId) {
    if (!engine) return false;
    return engine.deleteTask(taskId);
  }
  
  export function addDependency(fromTaskId, toTaskId, type = 'finish-to-start', lag = 0) {
    if (!engine) return null;
    return engine.addDependency(fromTaskId, toTaskId, type, lag);
  }
  
  export function removeDependency(dependencyId) {
    if (!engine) return false;
    return engine.removeDependency(dependencyId);
  }
  
  export function addResource(resource) {
    if (!engine) return null;
    return engine.addResource(resource);
  }
  
  export function assignResource(taskId, resourceId, allocation = 1) {
    if (!engine) return false;
    return engine.assignResource(taskId, resourceId, allocation);
  }
  
  export function calculateCriticalPath() {
    if (!engine) return [];
    return engine.calculateCriticalPath();
  }
  
  export function getTasks() {
    if (!engine) return [];
    return engine.getTasks();
  }
  
  export function getTask(taskId) {
    if (!engine) return null;
    return engine.getTask(taskId);
  }
  
  export function getDependencies() {
    if (!engine) return [];
    return engine.getDependencies();
  }
  
  export function getResources() {
    if (!engine) return [];
    return engine.getResources();
  }
  
  export function getCriticalPath() {
    if (!engine) return [];
    return engine.getCriticalPath();
  }
  
  export function getTimeline() {
    if (!engine) return null;
    return engine.getTimeline();
  }
  
  export function exportData() {
    if (!engine) return null;
    return engine.exportData();
  }
  
  export function importData(data) {
    if (!engine) return false;
    engine.importData(data);
    if (renderer) {
      renderer.render();
    }
    return true;
  }
  
  export function setTheme(newTheme) {
    theme = newTheme;
    if (renderer) {
      renderer.setTheme(newTheme);
    }
  }
  
  export function setZoom(zoom) {
    currentZoom = zoom;
    if (renderer) {
      renderer.setZoom(zoom);
    }
  }
  
  export function setPan(x, y) {
    currentPan = { x, y };
    if (renderer) {
      renderer.setPan(x, y);
    }
  }
  
  export function undo() {
    if (interactions && interactions.canUndo()) {
      interactions.undo();
    }
  }
  
  export function redo() {
    if (interactions && interactions.canRedo()) {
      interactions.redo();
    }
  }
  
  export function selectTask(taskId) {
    if (interactions) {
      interactions.selectTask(taskId);
    }
  }
  
  export function selectAll() {
    if (interactions) {
      interactions.selectAll();
    }
  }
  
  export function clearSelection() {
    if (interactions) {
      interactions.clearSelection();
    }
  }
  
  export function exportSVG() {
    if (!renderer) return null;
    return renderer.exportSVG();
  }
  
  export function exportPNG() {
    if (!renderer) return null;
    return renderer.exportPNG();
  }
  
  export function refresh() {
    if (renderer) {
      renderer.render();
    }
  }
  
  // ===== TOOLBAR ACTIONS =====
  
  function handleZoomIn() {
    setZoom(currentZoom * 1.2);
  }
  
  function handleZoomOut() {
    setZoom(currentZoom / 1.2);
  }
  
  function handleZoomFit() {
    setZoom(1);
    setPan(0, 0);
  }
  
  function handleToggleCriticalPath() {
    showCriticalPath = !showCriticalPath;
    if (renderer) {
      renderer.options.showCriticalPath = showCriticalPath;
      renderer.render();
    }
  }
  
  function handleToggleDependencies() {
    showDependencies = !showDependencies;
    if (renderer) {
      renderer.options.showDependencies = showDependencies;
      renderer.render();
    }
  }
  
  function handleToggleProgress() {
    showProgress = !showProgress;
    if (renderer) {
      renderer.options.showProgress = showProgress;
      renderer.render();
    }
  }
  
  function handleToggleGrid() {
    showGrid = !showGrid;
    if (renderer) {
      renderer.options.showGrid = showGrid;
      renderer.render();
    }
  }
  
  function handleExportSVG() {
    const svgData = exportSVG();
    if (svgData) {
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gantt-chart.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  
  function handleExportPNG() {
    exportPNG().then(pngData => {
      if (pngData) {
        const a = document.createElement('a');
        a.href = pngData;
        a.download = 'gantt-chart.png';
        a.click();
      }
    });
  }
  
  // ===== REACTIVE STATEMENTS =====
  
  $: if (isInitialized && tasks) {
    loadData();
  }
  
  $: if (isInitialized && theme) {
    setTheme(theme);
  }
  
  $: if (isInitialized && width) {
    if (renderer) {
      renderer.options.width = width;
      renderer.render();
    }
  }
  
  $: if (isInitialized && height) {
    if (renderer) {
      renderer.options.height = height;
      renderer.render();
    }
  }
</script>

<div class="bananas-gantt-container">
  <!-- Toolbar -->
  {#if showToolbar}
    <div class="gantt-toolbar">
      <!-- Zoom buttons disabled -->
      <!--
      <div class="toolbar-section">
        <button class="toolbar-btn" on:click={handleZoomIn} title="Zoom In">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button class="toolbar-btn" on:click={handleZoomOut} title="Zoom Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
        <button class="toolbar-btn" on:click={handleZoomFit} title="Fit to Screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
          </svg>
        </button>
      </div>
      -->
      
      <div class="toolbar-section">
        <button 
          class="toolbar-btn" 
          class:active={showCriticalPath}
          on:click={handleToggleCriticalPath} 
          title="Toggle Critical Path"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <button 
          class="toolbar-btn" 
          class:active={showDependencies}
          on:click={handleToggleDependencies} 
          title="Toggle Dependencies"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
        <button 
          class="toolbar-btn" 
          class:active={showProgress}
          on:click={handleToggleProgress} 
          title="Toggle Progress"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
        <button 
          class="toolbar-btn" 
          class:active={showGrid}
          on:click={handleToggleGrid} 
          title="Toggle Grid"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h4v4H7V7zm6 0h4v4h-4V7zM7 13h4v4H7v-4zm6 0h4v4h-4v-4z"/>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-section">
        <button class="toolbar-btn" on:click={undo} disabled={!canUndo} title="Undo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
        </button>
        <button class="toolbar-btn" on:click={redo} disabled={!canRedo} title="Redo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
          </svg>
        </button>
      </div>
      
      {#if enableExport}
        <div class="toolbar-section">
          <button class="toolbar-btn" on:click={handleExportSVG} title="Export SVG">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
          <button class="toolbar-btn" on:click={handleExportPNG} title="Export PNG">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Main Gantt Chart -->
  <div class="gantt-main" bind:this={container}>
    <!-- Chart will be rendered here -->
  </div>
  
  <!-- Status Bar -->
  <div class="gantt-status-bar">
    <div class="status-info">
      <span>Tasks: {engine?.getTasks().length || 0}</span>
      <span>Dependencies: {engine?.getDependencies().length || 0}</span>
      <span>Critical Path: {engine?.getCriticalPath().length || 0}</span>
    </div>
    <!-- Zoom status disabled -->
    <!--
    <div class="status-zoom">
      <span>Zoom: {Math.round(currentZoom * 100)}%</span>
    </div>
    -->
  </div>
</div>

<style>
  .bananas-gantt-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    font-family: Inter, system-ui, sans-serif;
  }
  
  .gantt-toolbar {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    gap: 16px;
  }
  
  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .toolbar-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .toolbar-btn:active {
    background: #e5e7eb;
    transform: translateY(1px);
  }
  
  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .toolbar-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  
  .gantt-main {
    flex: 1;
    overflow: auto;
    position: relative;
  }
  
  .gantt-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #6b7280;
  }
  
  .status-info {
    display: flex;
    gap: 16px;
  }
  
  .status-zoom {
    font-weight: 500;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .gantt-toolbar {
      padding: 4px 8px;
      gap: 8px;
    }
    
    .toolbar-btn {
      width: 28px;
      height: 28px;
    }
    
    .status-info {
      gap: 8px;
    }
  }
  
  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .bananas-gantt-container {
      background: #1e293b;
      border-color: #475569;
    }
    
    .gantt-toolbar {
      background: #334155;
      border-color: #475569;
    }
    
    .toolbar-btn {
      background: #475569;
      color: #f1f5f9;
      border-color: #64748b;
    }
    
    .toolbar-btn:hover {
      background: #64748b;
    }
    
    .gantt-status-bar {
      background: #334155;
      border-color: #475569;
      color: #94a3b8;
    }
  }
</style>

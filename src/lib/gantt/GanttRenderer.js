/**
 * 🍌 BANANAS GANTT RENDERER 🍌
 * Advanced rendering system with SVG/Canvas support
 * 
 * Features:
 * - High-performance SVG rendering
 * - Canvas fallback for large datasets
 * - Multiple zoom levels
 * - Interactive elements
 * - Custom styling
 * - Export capabilities
 */

export class GanttRenderer {
  constructor(container, engine, options = {}) {
    this.container = container;
    this.engine = engine;
    this.options = {
      width: 1200,
      height: 600,
      rowHeight: 40,
      headerHeight: 60,
      sidebarWidth: 250,
      timeScale: 'day',
      showDependencies: true,
      showCriticalPath: true,
      showProgress: true,
      showResources: true,
      theme: 'default',
      ...options
    };
    
    this.svg = null;
    this.defs = null;
    this.ganttGroup = null;
    this.headerGroup = null;
    this.tasksGroup = null;
    this.dependenciesGroup = null;
    this.milestonesGroup = null;
    
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    
    this.themes = this.initializeThemes();
    this.currentTheme = this.themes[this.options.theme];
    
    this.initialize();
  }
  
  initialize() {
    this.createSVG();
    this.setupEventHandlers();
    this.setupZoomAndPan();
    this.render();
  }
  
  createSVG() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.options.width);
    this.svg.setAttribute('height', this.options.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.style.background = this.currentTheme.background;
    this.svg.style.border = '1px solid #e5e7eb';
    this.svg.style.borderRadius = '8px';
    
    // Create definitions for patterns and gradients
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.createPatterns();
    this.createGradients();
    this.svg.appendChild(this.defs);
    
    // Create main groups
    this.ganttGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.ganttGroup.setAttribute('class', 'gantt-main');
    
    this.headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.headerGroup.setAttribute('class', 'gantt-header');
    
    this.tasksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.tasksGroup.setAttribute('class', 'gantt-tasks');
    
    this.dependenciesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.dependenciesGroup.setAttribute('class', 'gantt-dependencies');
    
    this.milestonesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.milestonesGroup.setAttribute('class', 'gantt-milestones');
    
    this.ganttGroup.appendChild(this.headerGroup);
    this.ganttGroup.appendChild(this.tasksGroup);
    this.ganttGroup.appendChild(this.dependenciesGroup);
    this.ganttGroup.appendChild(this.milestonesGroup);
    
    this.svg.appendChild(this.ganttGroup);
    this.container.appendChild(this.svg);
  }
  
  createPatterns() {
    // Progress pattern
    const progressPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    progressPattern.setAttribute('id', 'progress-pattern');
    progressPattern.setAttribute('width', '4');
    progressPattern.setAttribute('height', '4');
    progressPattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const progressRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    progressRect.setAttribute('width', '4');
    progressRect.setAttribute('height', '4');
    progressRect.setAttribute('fill', 'rgba(255,255,255,0.3)');
    
    progressPattern.appendChild(progressRect);
    this.defs.appendChild(progressPattern);
    
    // Critical path pattern
    const criticalPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    criticalPattern.setAttribute('id', 'critical-pattern');
    criticalPattern.setAttribute('width', '8');
    criticalPattern.setAttribute('height', '8');
    criticalPattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const criticalRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    criticalRect.setAttribute('width', '8');
    criticalRect.setAttribute('height', '8');
    criticalRect.setAttribute('fill', 'rgba(255,0,0,0.1)');
    
    criticalPattern.appendChild(criticalRect);
    this.defs.appendChild(criticalPattern);
  }
  
  createGradients() {
    // Task gradient
    const taskGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    taskGradient.setAttribute('id', 'task-gradient');
    taskGradient.setAttribute('x1', '0%');
    taskGradient.setAttribute('y1', '0%');
    taskGradient.setAttribute('x2', '0%');
    taskGradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#3b82f6');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#1d4ed8');
    
    taskGradient.appendChild(stop1);
    taskGradient.appendChild(stop2);
    this.defs.appendChild(taskGradient);
  }
  
  render() {
    this.clear();
    this.renderHeader();
    this.renderTimeline();
    this.renderTasks();
    this.renderDependencies();
    this.renderMilestones();
    this.renderGrid();
  }
  
  renderHeader() {
    this.headerGroup.innerHTML = '';
    
    // Header background
    const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    headerBg.setAttribute('x', '0');
    headerBg.setAttribute('y', '0');
    headerBg.setAttribute('width', this.options.width);
    headerBg.setAttribute('height', this.options.headerHeight);
    headerBg.setAttribute('fill', this.currentTheme.headerBackground);
    headerBg.setAttribute('stroke', this.currentTheme.border);
    headerBg.setAttribute('stroke-width', '1');
    this.headerGroup.appendChild(headerBg);
    
    // Sidebar header
    const sidebarHeader = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sidebarHeader.setAttribute('x', '0');
    sidebarHeader.setAttribute('y', '0');
    sidebarHeader.setAttribute('width', this.options.sidebarWidth);
    sidebarHeader.setAttribute('height', this.options.headerHeight);
    sidebarHeader.setAttribute('fill', this.currentTheme.sidebarBackground);
    sidebarHeader.setAttribute('stroke', this.currentTheme.border);
    sidebarHeader.setAttribute('stroke-width', '1');
    this.headerGroup.appendChild(sidebarHeader);
    
    // Task name header text
    const taskHeaderText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    taskHeaderText.setAttribute('x', this.options.sidebarWidth / 2);
    taskHeaderText.setAttribute('y', this.options.headerHeight / 2 + 5);
    taskHeaderText.setAttribute('text-anchor', 'middle');
    taskHeaderText.setAttribute('font-family', this.currentTheme.fontFamily);
    taskHeaderText.setAttribute('font-size', this.currentTheme.fontSize);
    taskHeaderText.setAttribute('font-weight', 'bold');
    taskHeaderText.setAttribute('fill', this.currentTheme.textColor);
    taskHeaderText.textContent = 'Task Name';
    this.headerGroup.appendChild(taskHeaderText);
    
    // Timeline header
    this.renderTimelineHeader();
  }
  
  renderTimelineHeader() {
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.options.width - this.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    // Generate time scale labels
    const labels = this.generateTimeScaleLabels(timeline);
    
    labels.forEach((label, index) => {
      const x = this.options.sidebarWidth + (label.day * dayWidth);
      
      // Vertical line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x);
      line.setAttribute('y2', this.options.headerHeight);
      line.setAttribute('stroke', this.currentTheme.gridColor);
      line.setAttribute('stroke-width', '1');
      this.headerGroup.appendChild(line);
      
      // Label text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + 5);
      text.setAttribute('y', this.options.headerHeight - 10);
      text.setAttribute('font-family', this.currentTheme.fontFamily);
      text.setAttribute('font-size', this.currentTheme.fontSize - 2);
      text.setAttribute('fill', this.currentTheme.textColor);
      text.textContent = label.text;
      this.headerGroup.appendChild(text);
    });
  }
  
  renderTimeline() {
    // Timeline background
    const timelineBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    timelineBg.setAttribute('x', this.options.sidebarWidth);
    timelineBg.setAttribute('y', this.options.headerHeight);
    timelineBg.setAttribute('width', this.options.width - this.options.sidebarWidth);
    timelineBg.setAttribute('height', this.options.height - this.options.headerHeight);
    timelineBg.setAttribute('fill', this.currentTheme.timelineBackground);
    this.tasksGroup.appendChild(timelineBg);
  }
  
  renderTasks() {
    const tasks = this.engine.getTasks();
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.options.width - this.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    tasks.forEach((task, index) => {
      const y = this.options.headerHeight + (index * this.options.rowHeight);
      
      // Task row background
      const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rowBg.setAttribute('x', this.options.sidebarWidth);
      rowBg.setAttribute('y', y);
      rowBg.setAttribute('width', timelineWidth);
      rowBg.setAttribute('height', this.options.rowHeight);
      rowBg.setAttribute('fill', index % 2 === 0 ? this.currentTheme.rowBackground : this.currentTheme.rowBackgroundAlt);
      this.tasksGroup.appendChild(rowBg);
      
      // Task name
      this.renderTaskName(task, y);
      
      // Task bar
      this.renderTaskBar(task, y, dayWidth, timeline);
      
      // Progress bar
      if (this.options.showProgress && task.progress > 0) {
        this.renderProgressBar(task, y, dayWidth, timeline);
      }
    });
  }
  
  renderTaskName(task, y) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '10');
    text.setAttribute('y', y + this.options.rowHeight / 2 + 5);
    text.setAttribute('font-family', this.currentTheme.fontFamily);
    text.setAttribute('font-size', this.currentTheme.fontSize);
    text.setAttribute('fill', this.currentTheme.textColor);
    text.setAttribute('class', 'task-name');
    text.setAttribute('data-task-id', task.id);
    text.textContent = task.name;
    this.tasksGroup.appendChild(text);
  }
  
  renderTaskBar(task, y, dayWidth, timeline) {
    const startOffset = Math.ceil((task.startDate - timeline.start) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, task.duration);
    
    const x = this.options.sidebarWidth + (startOffset * dayWidth);
    const width = duration * dayWidth;
    
    const taskBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    taskBar.setAttribute('x', x);
    taskBar.setAttribute('y', y + 8);
    taskBar.setAttribute('width', width);
    taskBar.setAttribute('height', this.options.rowHeight - 16);
    taskBar.setAttribute('rx', '4');
    taskBar.setAttribute('ry', '4');
    taskBar.setAttribute('class', 'task-bar');
    taskBar.setAttribute('data-task-id', task.id);
    
    // Apply styling based on status and critical path
    if (task.isCritical && this.options.showCriticalPath) {
      taskBar.setAttribute('fill', this.currentTheme.criticalTaskColor);
      taskBar.setAttribute('stroke', this.currentTheme.criticalTaskBorder);
      taskBar.setAttribute('stroke-width', '2');
    } else {
      taskBar.setAttribute('fill', this.getStatusColor(task.status));
      taskBar.setAttribute('stroke', this.getStatusBorderColor(task.status));
      taskBar.setAttribute('stroke-width', '1');
    }
    
    this.tasksGroup.appendChild(taskBar);
    
    // Task label
    if (width > 60) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + 8);
      label.setAttribute('y', y + this.options.rowHeight / 2 + 5);
      label.setAttribute('font-family', this.currentTheme.fontFamily);
      label.setAttribute('font-size', this.currentTheme.fontSize - 1);
      label.setAttribute('fill', 'white');
      label.setAttribute('class', 'task-label');
      label.setAttribute('data-task-id', task.id);
      label.textContent = task.name;
      this.tasksGroup.appendChild(label);
    }
  }
  
  renderProgressBar(task, y, dayWidth, timeline) {
    const startOffset = Math.ceil((task.startDate - timeline.start) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, task.duration);
    const progressWidth = (duration * dayWidth * task.progress) / 100;
    
    const x = this.options.sidebarWidth + (startOffset * dayWidth);
    
    const progressBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    progressBar.setAttribute('x', x);
    progressBar.setAttribute('y', y + 8);
    progressBar.setAttribute('width', progressWidth);
    progressBar.setAttribute('height', this.options.rowHeight - 16);
    progressBar.setAttribute('rx', '4');
    progressBar.setAttribute('ry', '4');
    progressBar.setAttribute('fill', 'url(#progress-pattern)');
    progressBar.setAttribute('class', 'progress-bar');
    progressBar.setAttribute('data-task-id', task.id);
    this.tasksGroup.appendChild(progressBar);
  }
  
  renderDependencies() {
    if (!this.options.showDependencies) return;
    
    const dependencies = this.engine.getDependencies();
    const tasks = this.engine.getTasks();
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.options.width - this.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    dependencies.forEach(dependency => {
      const fromTask = tasks.find(t => t.id === dependency.from);
      const toTask = tasks.find(t => t.id === dependency.to);
      
      if (!fromTask || !toTask) return;
      
      const fromIndex = tasks.indexOf(fromTask);
      const toIndex = tasks.indexOf(toTask);
      
      const fromY = this.options.headerHeight + (fromIndex * this.options.rowHeight) + this.options.rowHeight / 2;
      const toY = this.options.headerHeight + (toIndex * this.options.rowHeight) + this.options.rowHeight / 2;
      
      const fromX = this.options.sidebarWidth + (Math.ceil((fromTask.endDate - timeline.start) / (1000 * 60 * 60 * 24)) * dayWidth);
      const toX = this.options.sidebarWidth + (Math.ceil((toTask.startDate - timeline.start) / (1000 * 60 * 60 * 24)) * dayWidth);
      
      this.renderDependencyLine(fromX, fromY, toX, toY, dependency);
    });
  }
  
  renderDependencyLine(fromX, fromY, toX, toY, dependency) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Create curved dependency line
    const midX = (fromX + toX) / 2;
    const controlY = Math.min(fromY, toY) - 20;
    
    const pathData = `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.currentTheme.dependencyColor);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', dependency.type === 'finish-to-start' ? 'none' : '5,5');
    path.setAttribute('class', 'dependency-line');
    path.setAttribute('data-dependency-id', dependency.id);
    
    this.dependenciesGroup.appendChild(path);
    
    // Arrow head
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowSize = 8;
    
    const arrowX = toX - arrowSize * Math.cos(angle);
    const arrowY = toY - arrowSize * Math.sin(angle);
    
    const arrowPoints = [
      `${toX},${toY}`,
      `${arrowX - arrowSize * Math.cos(angle - Math.PI / 6)},${arrowY - arrowSize * Math.sin(angle - Math.PI / 6)}`,
      `${arrowX - arrowSize * Math.cos(angle + Math.PI / 6)},${arrowY - arrowSize * Math.sin(angle + Math.PI / 6)}`
    ].join(' ');
    
    arrow.setAttribute('points', arrowPoints);
    arrow.setAttribute('fill', this.currentTheme.dependencyColor);
    arrow.setAttribute('class', 'dependency-arrow');
    arrow.setAttribute('data-dependency-id', dependency.id);
    
    this.dependenciesGroup.appendChild(arrow);
  }
  
  renderMilestones() {
    // Milestone rendering logic
    const tasks = this.engine.getTasks();
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.options.width - this.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    tasks.forEach((task, index) => {
      if (task.duration === 1) { // Milestone
        const y = this.options.headerHeight + (index * this.options.rowHeight);
        const x = this.options.sidebarWidth + (Math.ceil((task.startDate - timeline.start) / (1000 * 60 * 60 * 24)) * dayWidth);
        
        const milestone = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const size = 12;
        const points = [
          `${x},${y + this.options.rowHeight / 2 - size}`,
          `${x + size},${y + this.options.rowHeight / 2}`,
          `${x},${y + this.options.rowHeight / 2 + size}`,
          `${x - size},${y + this.options.rowHeight / 2}`
        ].join(' ');
        
        milestone.setAttribute('points', points);
        milestone.setAttribute('fill', this.currentTheme.milestoneColor);
        milestone.setAttribute('stroke', this.currentTheme.milestoneBorder);
        milestone.setAttribute('stroke-width', '2');
        milestone.setAttribute('class', 'milestone');
        milestone.setAttribute('data-task-id', task.id);
        
        this.milestonesGroup.appendChild(milestone);
      }
    });
  }
  
  renderGrid() {
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.options.width - this.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    // Vertical grid lines
    for (let i = 0; i <= timeline.totalDays; i++) {
      const x = this.options.sidebarWidth + (i * dayWidth);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', this.options.headerHeight);
      line.setAttribute('x2', x);
      line.setAttribute('y2', this.options.height);
      line.setAttribute('stroke', this.currentTheme.gridColor);
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.3');
      this.tasksGroup.appendChild(line);
    }
    
    // Horizontal grid lines
    const tasks = this.engine.getTasks();
    tasks.forEach((_, index) => {
      const y = this.options.headerHeight + (index * this.options.rowHeight);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.options.sidebarWidth);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.options.width);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', this.currentTheme.gridColor);
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.2');
      this.tasksGroup.appendChild(line);
    });
  }
  
  // ===== UTILITY METHODS =====
  
  generateTimeScaleLabels(timeline) {
    const labels = [];
    const days = timeline.totalDays;
    
    for (let i = 0; i <= days; i += 7) { // Weekly labels
      const date = new Date(timeline.start);
      date.setDate(date.getDate() + i);
      
      labels.push({
        day: i,
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return labels;
  }
  
  getStatusColor(status) {
    const colors = {
      todo: this.currentTheme.todoColor,
      in_progress: this.currentTheme.inProgressColor,
      completed: this.currentTheme.completedColor,
      blocked: this.currentTheme.blockedColor
    };
    return colors[status] || this.currentTheme.defaultTaskColor;
  }
  
  getStatusBorderColor(status) {
    const colors = {
      todo: this.currentTheme.todoBorder,
      in_progress: this.currentTheme.inProgressBorder,
      completed: this.currentTheme.completedBorder,
      blocked: this.currentTheme.blockedBorder
    };
    return colors[status] || this.currentTheme.defaultTaskBorder;
  }
  
  initializeThemes() {
    return {
      default: {
        background: '#ffffff',
        headerBackground: '#f8fafc',
        sidebarBackground: '#f1f5f9',
        timelineBackground: '#ffffff',
        rowBackground: '#ffffff',
        rowBackgroundAlt: '#f8fafc',
        border: '#e2e8f0',
        gridColor: '#cbd5e1',
        textColor: '#1e293b',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        defaultTaskColor: '#3b82f6',
        defaultTaskBorder: '#1d4ed8',
        todoColor: '#6b7280',
        todoBorder: '#4b5563',
        inProgressColor: '#3b82f6',
        inProgressBorder: '#1d4ed8',
        completedColor: '#10b981',
        completedBorder: '#059669',
        blockedColor: '#ef4444',
        blockedBorder: '#dc2626',
        criticalTaskColor: '#f59e0b',
        criticalTaskBorder: '#d97706',
        dependencyColor: '#6b7280',
        milestoneColor: '#8b5cf6',
        milestoneBorder: '#7c3aed'
      },
      dark: {
        background: '#1e293b',
        headerBackground: '#334155',
        sidebarBackground: '#475569',
        timelineBackground: '#1e293b',
        rowBackground: '#1e293b',
        rowBackgroundAlt: '#334155',
        border: '#475569',
        gridColor: '#64748b',
        textColor: '#f1f5f9',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        defaultTaskColor: '#3b82f6',
        defaultTaskBorder: '#60a5fa',
        todoColor: '#6b7280',
        todoBorder: '#9ca3af',
        inProgressColor: '#3b82f6',
        inProgressBorder: '#60a5fa',
        completedColor: '#10b981',
        completedBorder: '#34d399',
        blockedColor: '#ef4444',
        blockedBorder: '#f87171',
        criticalTaskColor: '#f59e0b',
        criticalTaskBorder: '#fbbf24',
        dependencyColor: '#9ca3af',
        milestoneColor: '#8b5cf6',
        milestoneBorder: '#a78bfa'
      }
    };
  }
  
  setupEventHandlers() {
    // Task click handlers
    this.svg.addEventListener('click', (event) => {
      const taskElement = event.target.closest('[data-task-id]');
      if (taskElement) {
        const taskId = taskElement.getAttribute('data-task-id');
        this.emit('taskClick', { taskId, event });
      }
    });
    
    // Task hover handlers
    this.svg.addEventListener('mouseover', (event) => {
      const taskElement = event.target.closest('[data-task-id]');
      if (taskElement) {
        const taskId = taskElement.getAttribute('data-task-id');
        this.emit('taskHover', { taskId, event });
      }
    });
  }
  
  setupZoomAndPan() {
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    
    // Enable panning with right mouse button or middle mouse button
    this.svg.addEventListener('mousedown', (event) => {
      if (event.button === 1 || event.button === 2) { // Middle or right mouse button
        event.preventDefault();
        isPanning = true;
        startX = event.clientX - this.panX;
        startY = event.clientY - this.panY;
        this.svg.style.cursor = 'grabbing';
      }
    });
    
    this.svg.addEventListener('mousemove', (event) => {
      if (isPanning) {
        this.panX = event.clientX - startX;
        this.panY = event.clientY - startY;
        this.updateTransform();
      }
    });
    
    this.svg.addEventListener('mouseup', () => {
      isPanning = false;
      this.svg.style.cursor = 'default';
    });
    
    // Prevent context menu on right click
    this.svg.addEventListener('contextmenu', (event) => {
      if (isPanning) {
        event.preventDefault();
      }
    });
    
    // Enhanced wheel zoom with better control
    this.svg.addEventListener('wheel', (event) => {
      event.preventDefault();
      
      // Get mouse position relative to SVG
      const rect = this.svg.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Calculate zoom factor
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const oldZoom = this.zoom;
      this.zoom *= delta;
      this.zoom = Math.max(0.1, Math.min(5, this.zoom));
      
      // Zoom towards mouse position
      if (this.zoom !== oldZoom) {
        const zoomRatio = this.zoom / oldZoom;
        this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
        this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
        this.updateTransform();
      }
    });
    
    // Add keyboard shortcuts for zoom
    document.addEventListener('keydown', (event) => {
      if (this.svg.contains(document.activeElement) || event.ctrlKey) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          this.zoom *= 1.1;
          this.zoom = Math.min(5, this.zoom);
          this.updateTransform();
        } else if (event.key === '-') {
          event.preventDefault();
          this.zoom *= 0.9;
          this.zoom = Math.max(0.1, this.zoom);
          this.updateTransform();
        } else if (event.key === '0') {
          event.preventDefault();
          this.zoom = 1;
          this.panX = 0;
          this.panY = 0;
          this.updateTransform();
        }
      }
    });
  }
  
  updateTransform() {
    const transform = `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`;
    this.ganttGroup.setAttribute('transform', transform);
  }
  
  clear() {
    if (this.tasksGroup) this.tasksGroup.innerHTML = '';
    if (this.dependenciesGroup) this.dependenciesGroup.innerHTML = '';
    if (this.milestonesGroup) this.milestonesGroup.innerHTML = '';
  }
  
  emit(event, data) {
    // Emit events to parent
    if (this.container.dispatchEvent) {
      this.container.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
  }
  
  // ===== PUBLIC API =====
  
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = this.themes[themeName];
      this.render();
    }
  }
  
  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(5, zoom));
    this.updateTransform();
  }
  
  setPan(x, y) {
    this.panX = x;
    this.panY = y;
    this.updateTransform();
  }
  
  exportSVG() {
    return this.svg.outerHTML;
  }
  
  exportPNG() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const svgData = new XMLSerializer().serializeToString(this.svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        ctx.drawImage(img, 0, 0);
        const pngData = canvas.toDataURL('image/png');
        URL.revokeObjectURL(svgUrl);
        resolve(pngData);
      };
      img.src = svgUrl;
    });
  }
}

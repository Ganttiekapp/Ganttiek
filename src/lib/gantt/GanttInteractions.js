/**
 * 🍌 BANANAS GANTT INTERACTIONS 🍌
 * Advanced interactive features for the Gantt chart
 * 
 * Features:
 * - Drag and drop task bars
 * - Resize task durations
 * - Create dependencies by dragging
 * - Context menus
 * - Keyboard shortcuts
 * - Multi-select
 * - Undo/Redo system
 */

export class GanttInteractions {
  constructor(renderer, engine, options = {}) {
    this.renderer = renderer;
    this.engine = engine;
    this.options = {
      enableDragDrop: true,
      enableResize: true,
      enableDependencyCreation: true,
      enableContextMenu: true,
      enableKeyboardShortcuts: true,
      enableMultiSelect: true,
      enableUndoRedo: true,
      ...options
    };
    
    this.isDragging = false;
    this.isResizing = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.originalTaskData = null;
    this.selectedTasks = new Set();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    
    this.initialize();
  }
  
  initialize() {
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.setupContextMenu();
    this.setupUndoRedo();
  }
  
  setupEventListeners() {
    const svg = this.renderer.svg;
    
    // Mouse events for task bars
    svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
    svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
    svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events for mobile
    svg.addEventListener('touchstart', this.handleTouchStart.bind(this));
    svg.addEventListener('touchmove', this.handleTouchMove.bind(this));
    svg.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Double click to edit
    svg.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    
    // Selection events
    svg.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleMouseDown(event) {
    const taskElement = event.target.closest('[data-task-id]');
    if (!taskElement) return;
    
    const taskId = taskElement.getAttribute('data-task-id');
    const task = this.engine.getTask(taskId);
    if (!task) return;
    
    event.preventDefault();
    
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.originalTaskData = { ...task };
    
    // Check if clicking on resize handle
    const rect = taskElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isResizeHandle = clickX > rect.width - 10;
    
    if (isResizeHandle && this.options.enableResize) {
      this.startResize(taskId, event);
    } else if (this.options.enableDragDrop) {
      this.startDrag(taskId, event);
    }
    
    // Add to selection if Ctrl/Cmd is held
    if (event.ctrlKey || event.metaKey) {
      this.toggleTaskSelection(taskId);
    } else if (!this.selectedTasks.has(taskId)) {
      this.clearSelection();
      this.selectTask(taskId);
    }
  }
  
  handleMouseMove(event) {
    if (this.isDragging) {
      this.updateDrag(event);
    } else if (this.isResizing) {
      this.updateResize(event);
    }
  }
  
  handleMouseUp(event) {
    if (this.isDragging) {
      this.endDrag(event);
    } else if (this.isResizing) {
      this.endResize(event);
    }
  }
  
  // ===== DRAG AND DROP =====
  
  startDrag(taskId, event) {
    this.isDragging = true;
    this.draggedTaskId = taskId;
    this.renderer.svg.style.cursor = 'grabbing';
    
    // Add visual feedback
    this.addDragFeedback(taskId);
    
    this.emit('dragStart', { taskId, event });
  }
  
  updateDrag(event) {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    
    // Calculate new position based on timeline
    const newStartDate = this.calculateNewStartDate(this.draggedTaskId, deltaX);
    
    // Update visual feedback
    this.updateDragFeedback(this.draggedTaskId, deltaX, deltaY);
    
    this.emit('dragUpdate', { 
      taskId: this.draggedTaskId, 
      deltaX, 
      deltaY, 
      newStartDate,
      event 
    });
  }
  
  endDrag(event) {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const newStartDate = this.calculateNewStartDate(this.draggedTaskId, deltaX);
    
    // Save to history before making changes
    this.saveToHistory();
    
    // Update task
    const task = this.engine.getTask(this.draggedTaskId);
    const duration = task.duration;
    const newEndDate = this.engine.addWorkingDays(newStartDate, duration - 1);
    
    this.engine.updateTask(this.draggedTaskId, {
      startDate: newStartDate,
      endDate: newEndDate
    });
    
    // Clean up
    this.removeDragFeedback();
    this.renderer.svg.style.cursor = 'default';
    this.isDragging = false;
    this.draggedTaskId = null;
    
    this.emit('dragEnd', { 
      taskId: this.draggedTaskId, 
      newStartDate, 
      newEndDate,
      event 
    });
  }
  
  // ===== RESIZE =====
  
  startResize(taskId, event) {
    this.isResizing = true;
    this.resizedTaskId = taskId;
    this.renderer.svg.style.cursor = 'ew-resize';
    
    this.addResizeFeedback(taskId);
    this.emit('resizeStart', { taskId, event });
  }
  
  updateResize(event) {
    if (!this.isResizing) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const newDuration = this.calculateNewDuration(this.resizedTaskId, deltaX);
    
    this.updateResizeFeedback(this.resizedTaskId, deltaX);
    
    this.emit('resizeUpdate', { 
      taskId: this.resizedTaskId, 
      deltaX, 
      newDuration,
      event 
    });
  }
  
  endResize(event) {
    if (!this.isResizing) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const newDuration = this.calculateNewDuration(this.resizedTaskId, deltaX);
    
    // Save to history
    this.saveToHistory();
    
    // Update task
    const task = this.engine.getTask(this.resizedTaskId);
    const newEndDate = this.engine.addWorkingDays(task.startDate, newDuration - 1);
    
    this.engine.updateTask(this.resizedTaskId, {
      duration: newDuration,
      endDate: newEndDate
    });
    
    // Clean up
    this.removeResizeFeedback();
    this.renderer.svg.style.cursor = 'default';
    this.isResizing = false;
    this.resizedTaskId = null;
    
    this.emit('resizeEnd', { 
      taskId: this.resizedTaskId, 
      newDuration, 
      newEndDate,
      event 
    });
  }
  
  // ===== DEPENDENCY CREATION =====
  
  startDependencyCreation(fromTaskId, event) {
    if (!this.options.enableDependencyCreation) return;
    
    this.isCreatingDependency = true;
    this.dependencyFromTaskId = fromTaskId;
    this.renderer.svg.style.cursor = 'crosshair';
    
    this.addDependencyCreationFeedback(fromTaskId, event);
    this.emit('dependencyCreationStart', { fromTaskId, event });
  }
  
  updateDependencyCreation(event) {
    if (!this.isCreatingDependency) return;
    
    const mousePos = this.getMousePosition(event);
    this.updateDependencyCreationFeedback(mousePos);
    
    this.emit('dependencyCreationUpdate', { mousePos, event });
  }
  
  endDependencyCreation(event) {
    if (!this.isCreatingDependency) return;
    
    const toTaskElement = event.target.closest('[data-task-id]');
    if (toTaskElement) {
      const toTaskId = toTaskElement.getAttribute('data-task-id');
      
      if (toTaskId !== this.dependencyFromTaskId) {
        this.saveToHistory();
        this.engine.addDependency(this.dependencyFromTaskId, toTaskId);
        this.emit('dependencyCreated', { 
          fromTaskId: this.dependencyFromTaskId, 
          toTaskId,
          event 
        });
      }
    }
    
    this.removeDependencyCreationFeedback();
    this.renderer.svg.style.cursor = 'default';
    this.isCreatingDependency = false;
    this.dependencyFromTaskId = null;
  }
  
  // ===== SELECTION =====
  
  selectTask(taskId) {
    this.selectedTasks.add(taskId);
    this.addSelectionFeedback(taskId);
    this.emit('taskSelected', { taskId });
  }
  
  deselectTask(taskId) {
    this.selectedTasks.delete(taskId);
    this.removeSelectionFeedback(taskId);
    this.emit('taskDeselected', { taskId });
  }
  
  toggleTaskSelection(taskId) {
    if (this.selectedTasks.has(taskId)) {
      this.deselectTask(taskId);
    } else {
      this.selectTask(taskId);
    }
  }
  
  clearSelection() {
    this.selectedTasks.forEach(taskId => {
      this.removeSelectionFeedback(taskId);
    });
    this.selectedTasks.clear();
    this.emit('selectionCleared');
  }
  
  selectAll() {
    const tasks = this.engine.getTasks();
    tasks.forEach(task => {
      this.selectTask(task.id);
    });
    this.emit('allTasksSelected');
  }
  
  // ===== CONTEXT MENU =====
  
  setupContextMenu() {
    if (!this.options.enableContextMenu) return;
    
    this.contextMenu = this.createContextMenu();
    document.body.appendChild(this.contextMenu);
    
    this.renderer.svg.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.showContextMenu(event);
    });
    
    // Hide context menu on click elsewhere
    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
  }
  
  createContextMenu() {
    const menu = document.createElement('div');
    menu.className = 'gantt-context-menu';
    menu.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 8px 0;
      min-width: 200px;
      z-index: 1000;
      display: none;
    `;
    
    const menuItems = [
      { text: 'Edit Task', action: 'edit' },
      { text: 'Delete Task', action: 'delete' },
      { text: 'Add Dependency', action: 'addDependency' },
      { text: 'Duplicate Task', action: 'duplicate' },
      { text: 'Set as Milestone', action: 'setMilestone' }
    ];
    
    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      menuItem.textContent = item.text;
      menuItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
      `;
      
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = '#f3f4f6';
      });
      
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'transparent';
      });
      
      menuItem.addEventListener('click', () => {
        this.handleContextMenuAction(item.action);
        this.hideContextMenu();
      });
      
      menu.appendChild(menuItem);
    });
    
    return menu;
  }
  
  showContextMenu(event) {
    const taskElement = event.target.closest('[data-task-id]');
    if (taskElement) {
      const taskId = taskElement.getAttribute('data-task-id');
      this.contextMenuTaskId = taskId;
    }
    
    this.contextMenu.style.display = 'block';
    this.contextMenu.style.left = event.pageX + 'px';
    this.contextMenu.style.top = event.pageY + 'px';
  }
  
  hideContextMenu() {
    this.contextMenu.style.display = 'none';
    this.contextMenuTaskId = null;
  }
  
  handleContextMenuAction(action) {
    const taskId = this.contextMenuTaskId;
    if (!taskId) return;
    
    switch (action) {
      case 'edit':
        this.editTask(taskId);
        break;
      case 'delete':
        this.deleteTask(taskId);
        break;
      case 'addDependency':
        this.startDependencyCreation(taskId, { clientX: 0, clientY: 0 });
        break;
      case 'duplicate':
        this.duplicateTask(taskId);
        break;
      case 'setMilestone':
        this.setTaskAsMilestone(taskId);
        break;
    }
  }
  
  // ===== KEYBOARD SHORTCUTS =====
  
  setupKeyboardShortcuts() {
    if (!this.options.enableKeyboardShortcuts) return;
    
    document.addEventListener('keydown', (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Don't interfere with form inputs
      }
      
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          if (this.selectedTasks.size > 0) {
            this.deleteSelectedTasks();
          }
          break;
          
        case 'a':
          if (isCtrlOrCmd) {
            event.preventDefault();
            this.selectAll();
          }
          break;
          
        case 'z':
          if (isCtrlOrCmd && !event.shiftKey) {
            event.preventDefault();
            this.undo();
          }
          break;
          
        case 'y':
          if (isCtrlOrCmd) {
            event.preventDefault();
            this.redo();
          }
          break;
          
        case 'c':
          if (isCtrlOrCmd) {
            event.preventDefault();
            this.copySelectedTasks();
          }
          break;
          
        case 'v':
          if (isCtrlOrCmd) {
            event.preventDefault();
            this.pasteTasks();
          }
          break;
          
        case 'Escape':
          this.clearSelection();
          this.cancelCurrentOperation();
          break;
      }
    });
  }
  
  // ===== UNDO/REDO =====
  
  setupUndoRedo() {
    if (!this.options.enableUndoRedo) return;
    
    // Listen for engine events to save history
    this.engine.on('taskUpdated', () => this.saveToHistory());
    this.engine.on('taskAdded', () => this.saveToHistory());
    this.engine.on('taskDeleted', () => this.saveToHistory());
    this.engine.on('dependencyAdded', () => this.saveToHistory());
    this.engine.on('dependencyRemoved', () => this.saveToHistory());
  }
  
  saveToHistory() {
    const state = this.engine.exportData();
    
    // Remove future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    this.history.push(JSON.parse(JSON.stringify(state)));
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.engine.importData(state);
      this.renderer.render();
      this.emit('undo', { state });
    }
  }
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.engine.importData(state);
      this.renderer.render();
      this.emit('redo', { state });
    }
  }
  
  // ===== UTILITY METHODS =====
  
  calculateNewStartDate(taskId, deltaX) {
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.renderer.options.width - this.renderer.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    const daysDelta = Math.round(deltaX / dayWidth);
    const task = this.engine.getTask(taskId);
    
    return this.engine.addWorkingDays(task.startDate, daysDelta);
  }
  
  calculateNewDuration(taskId, deltaX) {
    const timeline = this.engine.getTimeline();
    const timelineWidth = this.renderer.options.width - this.renderer.options.sidebarWidth;
    const dayWidth = timelineWidth / timeline.totalDays;
    
    const daysDelta = Math.round(deltaX / dayWidth);
    const task = this.engine.getTask(taskId);
    
    return Math.max(1, task.duration + daysDelta);
  }
  
  getMousePosition(event) {
    const rect = this.renderer.svg.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  addDragFeedback(taskId) {
    const taskElement = this.renderer.svg.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.opacity = '0.7';
      taskElement.style.transform = 'scale(1.05)';
    }
  }
  
  updateDragFeedback(taskId, deltaX, deltaY) {
    const taskElement = this.renderer.svg.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    }
  }
  
  removeDragFeedback() {
    const taskElements = this.renderer.svg.querySelectorAll('[data-task-id]');
    taskElements.forEach(element => {
      element.style.opacity = '';
      element.style.transform = '';
    });
  }
  
  addResizeFeedback(taskId) {
    const taskElement = this.renderer.svg.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.opacity = '0.8';
    }
  }
  
  updateResizeFeedback(taskId, deltaX) {
    const taskElement = this.renderer.svg.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      const currentWidth = parseFloat(taskElement.getAttribute('width'));
      taskElement.setAttribute('width', Math.max(20, currentWidth + deltaX));
    }
  }
  
  removeResizeFeedback() {
    this.removeDragFeedback();
  }
  
  addSelectionFeedback(taskId) {
    const taskElement = this.renderer.svg.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.stroke = '#3b82f6';
      taskElement.style.strokeWidth = '3';
    }
  }
  
  removeSelectionFeedback(taskId) {
    const taskElement = this.renderer.svg.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.stroke = '';
      taskElement.style.strokeWidth = '';
    }
  }
  
  addDependencyCreationFeedback(fromTaskId, event) {
    // Visual feedback for dependency creation
    const fromTaskElement = this.renderer.svg.querySelector(`[data-task-id="${fromTaskId}"]`);
    if (fromTaskElement) {
      fromTaskElement.style.stroke = '#f59e0b';
      fromTaskElement.style.strokeWidth = '3';
    }
  }
  
  updateDependencyCreationFeedback(mousePos) {
    // Update dependency line preview
  }
  
  removeDependencyCreationFeedback() {
    const taskElements = this.renderer.svg.querySelectorAll('[data-task-id]');
    taskElements.forEach(element => {
      element.style.stroke = '';
      element.style.strokeWidth = '';
    });
  }
  
  // ===== ACTION HANDLERS =====
  
  editTask(taskId) {
    this.emit('editTask', { taskId });
  }
  
  deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.saveToHistory();
      this.engine.deleteTask(taskId);
      this.renderer.render();
      this.emit('taskDeleted', { taskId });
    }
  }
  
  deleteSelectedTasks() {
    if (this.selectedTasks.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedTasks.size} task(s)?`)) {
      this.saveToHistory();
      this.selectedTasks.forEach(taskId => {
        this.engine.deleteTask(taskId);
      });
      this.clearSelection();
      this.renderer.render();
      this.emit('tasksDeleted', { taskIds: Array.from(this.selectedTasks) });
    }
  }
  
  duplicateTask(taskId) {
    const task = this.engine.getTask(taskId);
    if (task) {
      const newTask = {
        ...task,
        id: undefined,
        name: task.name + ' (Copy)',
        startDate: this.engine.addWorkingDays(task.startDate, 1),
        endDate: this.engine.addWorkingDays(task.endDate, 1)
      };
      
      this.saveToHistory();
      this.engine.addTask(newTask);
      this.renderer.render();
      this.emit('taskDuplicated', { originalTaskId: taskId, newTask });
    }
  }
  
  setTaskAsMilestone(taskId) {
    const task = this.engine.getTask(taskId);
    if (task) {
      this.saveToHistory();
      this.engine.updateTask(taskId, {
        duration: 1,
        endDate: task.startDate
      });
      this.renderer.render();
      this.emit('taskSetAsMilestone', { taskId });
    }
  }
  
  copySelectedTasks() {
    const tasks = Array.from(this.selectedTasks).map(id => this.engine.getTask(id));
    this.copiedTasks = tasks;
    this.emit('tasksCopied', { tasks });
  }
  
  pasteTasks() {
    if (!this.copiedTasks) return;
    
    this.saveToHistory();
    this.copiedTasks.forEach(task => {
      const newTask = {
        ...task,
        id: undefined,
        name: task.name + ' (Copy)',
        startDate: this.engine.addWorkingDays(task.startDate, 1),
        endDate: this.engine.addWorkingDays(task.endDate, 1)
      };
      this.engine.addTask(newTask);
    });
    this.renderer.render();
    this.emit('tasksPasted', { tasks: this.copiedTasks });
  }
  
  cancelCurrentOperation() {
    if (this.isDragging) {
      this.isDragging = false;
      this.removeDragFeedback();
    }
    if (this.isResizing) {
      this.isResizing = false;
      this.removeResizeFeedback();
    }
    if (this.isCreatingDependency) {
      this.isCreatingDependency = false;
      this.removeDependencyCreationFeedback();
    }
    this.renderer.svg.style.cursor = 'default';
  }
  
  // ===== TOUCH EVENTS =====
  
  handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.handleMouseDown(mouseEvent);
  }
  
  handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.handleMouseMove(mouseEvent);
  }
  
  handleTouchEnd(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const mouseEvent = new MouseEvent('mouseup', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.handleMouseUp(mouseEvent);
  }
  
  handleDoubleClick(event) {
    const taskElement = event.target.closest('[data-task-id]');
    if (taskElement) {
      const taskId = taskElement.getAttribute('data-task-id');
      this.editTask(taskId);
    }
  }
  
  handleClick(event) {
    // Handle selection logic
    if (!event.ctrlKey && !event.metaKey) {
      this.clearSelection();
    }
  }
  
  emit(event, data) {
    // Emit events to parent
    if (this.renderer.container.dispatchEvent) {
      this.renderer.container.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
  }
  
  // ===== PUBLIC API =====
  
  getSelectedTasks() {
    return Array.from(this.selectedTasks);
  }
  
  setSelectedTasks(taskIds) {
    this.clearSelection();
    taskIds.forEach(id => this.selectTask(id));
  }
  
  canUndo() {
    return this.historyIndex > 0;
  }
  
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }
  
  destroy() {
    // Clean up event listeners and DOM elements
    if (this.contextMenu && this.contextMenu.parentNode) {
      this.contextMenu.parentNode.removeChild(this.contextMenu);
    }
  }
}

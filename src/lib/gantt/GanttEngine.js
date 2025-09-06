/**
 * 🍌 BANANAS GANTT CHART ENGINE 🍌
 * A comprehensive, full-featured Gantt chart library built from scratch
 * 
 * Features:
 * - Advanced timeline calculations
 * - Critical path analysis
 * - Dependency management
 * - Resource allocation
 * - Performance optimization
 * - Multiple time scales
 * - Interactive features
 */

export class GanttEngine {
  constructor(options = {}) {
    this.options = {
      timeScale: 'day',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      workingHours: { start: 9, end: 17 },
      holidays: [],
      ...options
    };
    
    this.tasks = new Map();
    this.dependencies = new Map();
    this.resources = new Map();
    this.milestones = new Map();
    this.criticalPath = [];
    this.timeline = null;
    
    this.eventListeners = new Map();
    this.renderQueue = [];
    this.isRendering = false;
    
    this.initialize();
  }
  
  initialize() {
    this.calculateTimeline();
    this.setupEventSystem();
    this.initializePerformanceOptimizations();
  }
  
  // ===== TASK MANAGEMENT =====
  
  addTask(task) {
    const ganttTask = this.createGanttTask(task);
    this.tasks.set(ganttTask.id, ganttTask);
    this.recalculateDependencies();
    this.emit('taskAdded', ganttTask);
    return ganttTask;
  }
  
  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    
    Object.assign(task, updates);
    task.updatedAt = new Date();
    
    this.recalculateDependencies();
    this.emit('taskUpdated', task);
    return task;
  }
  
  deleteTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    
    // Remove dependencies
    this.dependencies.forEach((dep, depId) => {
      if (dep.from === taskId || dep.to === taskId) {
        this.dependencies.delete(depId);
      }
    });
    
    this.tasks.delete(taskId);
    this.recalculateDependencies();
    this.emit('taskDeleted', taskId);
    return true;
  }
  
  createGanttTask(task) {
    const startDate = new Date(task.startDate || task.start_date);
    const endDate = new Date(task.endDate || task.end_date);
    const duration = this.calculateDuration(startDate, endDate);
    
    return {
      id: task.id || this.generateId(),
      name: task.name || 'Unnamed Task',
      description: task.description || '',
      startDate,
      endDate,
      duration,
      progress: Math.max(0, Math.min(100, task.progress || 0)),
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      resourceId: task.resourceId || null,
      parentId: task.parentId || null,
      children: [],
      dependencies: [],
      milestones: [],
      isCritical: false,
      slack: 0,
      earlyStart: null,
      earlyFinish: null,
      lateStart: null,
      lateFinish: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customFields: task.customFields || {},
      ...task
    };
  }
  
  // ===== DEPENDENCY MANAGEMENT =====
  
  addDependency(fromTaskId, toTaskId, type = 'finish-to-start', lag = 0) {
    const dependency = {
      id: this.generateId(),
      from: fromTaskId,
      to: toTaskId,
      type, // finish-to-start, start-to-start, finish-to-finish, start-to-finish
      lag, // lag time in days
      createdAt: new Date()
    };
    
    this.dependencies.set(dependency.id, dependency);
    
    // Update task dependencies
    const fromTask = this.tasks.get(fromTaskId);
    const toTask = this.tasks.get(toTaskId);
    
    if (fromTask) fromTask.dependencies.push(dependency.id);
    if (toTask) toTask.dependencies.push(dependency.id);
    
    this.recalculateDependencies();
    this.emit('dependencyAdded', dependency);
    return dependency;
  }
  
  removeDependency(dependencyId) {
    const dependency = this.dependencies.get(dependencyId);
    if (!dependency) return false;
    
    // Remove from tasks
    const fromTask = this.tasks.get(dependency.from);
    const toTask = this.tasks.get(dependency.to);
    
    if (fromTask) {
      fromTask.dependencies = fromTask.dependencies.filter(id => id !== dependencyId);
    }
    if (toTask) {
      toTask.dependencies = toTask.dependencies.filter(id => id !== dependencyId);
    }
    
    this.dependencies.delete(dependencyId);
    this.recalculateDependencies();
    this.emit('dependencyRemoved', dependencyId);
    return true;
  }
  
  // ===== CRITICAL PATH ANALYSIS =====
  
  calculateCriticalPath() {
    this.calculateEarlyDates();
    this.calculateLateDates();
    this.identifyCriticalTasks();
    this.calculateSlack();
    
    this.criticalPath = this.buildCriticalPath();
    this.emit('criticalPathCalculated', this.criticalPath);
    return this.criticalPath;
  }
  
  recalculateDependencies() {
    // Recalculate critical path when dependencies change
    this.calculateCriticalPath();
  }
  
  calculateEarlyDates() {
    const visited = new Set();
    const stack = [];
    
    // Find tasks with no dependencies (start tasks)
    const startTasks = Array.from(this.tasks.values()).filter(task => 
      task.dependencies.length === 0
    );
    
    startTasks.forEach(task => {
      task.earlyStart = task.startDate;
      task.earlyFinish = this.addWorkingDays(task.startDate, task.duration - 1);
      stack.push(task);
    });
    
    while (stack.length > 0) {
      const currentTask = stack.pop();
      if (visited.has(currentTask.id)) continue;
      visited.add(currentTask.id);
      
      // Find dependent tasks
      const dependentTasks = Array.from(this.tasks.values()).filter(task =>
        task.dependencies.some(depId => {
          const dep = this.dependencies.get(depId);
          return dep && dep.from === currentTask.id;
        })
      );
      
      dependentTasks.forEach(depTask => {
        const dependency = this.findDependency(currentTask.id, depTask.id);
        if (dependency) {
          const earlyStart = this.calculateDependencyStart(currentTask, depTask, dependency);
          depTask.earlyStart = earlyStart;
          depTask.earlyFinish = this.addWorkingDays(earlyStart, depTask.duration - 1);
        }
        stack.push(depTask);
      });
    }
  }
  
  calculateLateDates() {
    const visited = new Set();
    const stack = [];
    
    // Find tasks with no dependents (end tasks)
    const endTasks = Array.from(this.tasks.values()).filter(task => {
      return !Array.from(this.dependencies.values()).some(dep => dep.from === task.id);
    });
    
    endTasks.forEach(task => {
      task.lateFinish = task.earlyFinish;
      task.lateStart = this.subtractWorkingDays(task.lateFinish, task.duration - 1);
      stack.push(task);
    });
    
    while (stack.length > 0) {
      const currentTask = stack.pop();
      if (visited.has(currentTask.id)) continue;
      visited.add(currentTask.id);
      
      // Find predecessor tasks
      const predecessorTasks = Array.from(this.tasks.values()).filter(task =>
        task.dependencies.some(depId => {
          const dep = this.dependencies.get(depId);
          return dep && dep.to === currentTask.id;
        })
      );
      
      predecessorTasks.forEach(predTask => {
        const dependency = this.findDependency(predTask.id, currentTask.id);
        if (dependency) {
          const lateFinish = this.calculateDependencyFinish(predTask, currentTask, dependency);
          predTask.lateFinish = lateFinish;
          predTask.lateStart = this.subtractWorkingDays(lateFinish, predTask.duration - 1);
        }
        stack.push(predTask);
      });
    }
  }
  
  identifyCriticalTasks() {
    this.tasks.forEach(task => {
      // Ensure dates are Date objects
      const earlyStart = task.earlyStart instanceof Date ? task.earlyStart : new Date(task.earlyStart);
      const lateStart = task.lateStart instanceof Date ? task.lateStart : new Date(task.lateStart);
      const earlyFinish = task.earlyFinish instanceof Date ? task.earlyFinish : new Date(task.earlyFinish);
      const lateFinish = task.lateFinish instanceof Date ? task.lateFinish : new Date(task.lateFinish);
      
      task.isCritical = earlyStart.getTime() === lateStart.getTime() &&
                       earlyFinish.getTime() === lateFinish.getTime();
    });
  }
  
  calculateSlack() {
    this.tasks.forEach(task => {
      // Ensure dates are Date objects
      const earlyStart = task.earlyStart instanceof Date ? task.earlyStart : new Date(task.earlyStart);
      const lateStart = task.lateStart instanceof Date ? task.lateStart : new Date(task.lateStart);
      
      task.slack = Math.ceil((lateStart - earlyStart) / (1000 * 60 * 60 * 24));
    });
  }
  
  buildCriticalPath() {
    const criticalTasks = Array.from(this.tasks.values())
      .filter(task => task.isCritical)
      .sort((a, b) => a.earlyStart - b.earlyStart);
    
    return criticalTasks;
  }
  
  // ===== TIMELINE CALCULATIONS =====
  
  calculateTimeline() {
    const allDates = [];
    
    this.tasks.forEach(task => {
      allDates.push(task.startDate, task.endDate);
    });
    
    if (allDates.length === 0) {
      this.timeline = {
        start: this.options.startDate,
        end: this.options.endDate,
        totalDays: 30
      };
      return;
    }
    
    const start = new Date(Math.min(...allDates));
    const end = new Date(Math.max(...allDates));
    
    // Add padding
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    
    this.timeline = {
      start,
      end,
      totalDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    };
  }
  
  calculateDuration(startDate, endDate) {
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  addWorkingDays(date, days) {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (this.isWorkingDay(result)) {
        addedDays++;
      }
    }
    
    return result;
  }
  
  subtractWorkingDays(date, days) {
    const result = new Date(date);
    let subtractedDays = 0;
    
    while (subtractedDays < days) {
      result.setDate(result.getDate() - 1);
      if (this.isWorkingDay(result)) {
        subtractedDays++;
      }
    }
    
    return result;
  }
  
  isWorkingDay(date) {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    return this.options.workingDays.includes(dayOfWeek) && 
           !this.options.holidays.includes(dateStr);
  }
  
  // ===== RESOURCE MANAGEMENT =====
  
  addResource(resource) {
    const ganttResource = {
      id: resource.id || this.generateId(),
      name: resource.name || 'Unnamed Resource',
      type: resource.type || 'human',
      capacity: resource.capacity || 1,
      cost: resource.cost || 0,
      skills: resource.skills || [],
      availability: resource.availability || [],
      ...resource
    };
    
    this.resources.set(ganttResource.id, ganttResource);
    this.emit('resourceAdded', ganttResource);
    return ganttResource;
  }
  
  assignResource(taskId, resourceId, allocation = 1) {
    const task = this.tasks.get(taskId);
    const resource = this.resources.get(resourceId);
    
    if (!task || !resource) {
      throw new Error('Task or resource not found');
    }
    
    task.resourceId = resourceId;
    task.resourceAllocation = allocation;
    
    this.emit('resourceAssigned', { taskId, resourceId, allocation });
    return true;
  }
  
  // ===== EVENT SYSTEM =====
  
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  
  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    
    this.eventListeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  setupEventSystem() {
    // Setup default event handlers
    this.on('taskAdded', () => this.scheduleRender());
    this.on('taskUpdated', () => this.scheduleRender());
    this.on('taskDeleted', () => this.scheduleRender());
    this.on('dependencyAdded', () => this.scheduleRender());
    this.on('dependencyRemoved', () => this.scheduleRender());
  }
  
  // ===== PERFORMANCE OPTIMIZATIONS =====
  
  initializePerformanceOptimizations() {
    this.renderQueue = [];
    this.isRendering = false;
    this.debounceTimer = null;
  }
  
  scheduleRender() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.processRenderQueue();
    }, 16); // ~60fps
  }
  
  processRenderQueue() {
    if (this.isRendering) return;
    
    this.isRendering = true;
    this.emit('beforeRender');
    
    // Process all queued updates
    while (this.renderQueue.length > 0) {
      const update = this.renderQueue.shift();
      this.processUpdate(update);
    }
    
    this.emit('afterRender');
    this.isRendering = false;
  }
  
  processUpdate(update) {
    // Process individual updates
    switch (update.type) {
      case 'task':
        this.calculateTaskPositions();
        break;
      case 'dependency':
        this.calculateDependencyLines();
        break;
      case 'timeline':
        this.calculateTimeline();
        break;
    }
  }
  
  // ===== UTILITY METHODS =====
  
  generateId() {
    return 'gantt_' + Math.random().toString(36).substr(2, 9);
  }
  
  findDependency(fromTaskId, toTaskId) {
    return Array.from(this.dependencies.values()).find(dep => 
      dep.from === fromTaskId && dep.to === toTaskId
    );
  }
  
  calculateDependencyStart(fromTask, toTask, dependency) {
    switch (dependency.type) {
      case 'finish-to-start':
        return this.addWorkingDays(fromTask.earlyFinish, dependency.lag + 1);
      case 'start-to-start':
        return this.addWorkingDays(fromTask.earlyStart, dependency.lag);
      case 'finish-to-finish':
        return this.subtractWorkingDays(toTask.earlyFinish, toTask.duration - 1);
      case 'start-to-finish':
        return this.subtractWorkingDays(fromTask.earlyStart, dependency.lag + 1);
      default:
        return toTask.earlyStart;
    }
  }
  
  calculateDependencyFinish(fromTask, toTask, dependency) {
    switch (dependency.type) {
      case 'finish-to-start':
        return this.subtractWorkingDays(toTask.lateStart, dependency.lag + 1);
      case 'start-to-start':
        return this.subtractWorkingDays(toTask.lateStart, dependency.lag);
      case 'finish-to-finish':
        return this.addWorkingDays(toTask.lateFinish, toTask.duration - 1);
      case 'start-to-finish':
        return this.addWorkingDays(fromTask.lateStart, dependency.lag + 1);
      default:
        return fromTask.lateFinish;
    }
  }
  
  // ===== PUBLIC API =====
  
  getTasks() {
    return Array.from(this.tasks.values());
  }
  
  getTask(taskId) {
    return this.tasks.get(taskId);
  }
  
  getDependencies() {
    return Array.from(this.dependencies.values());
  }
  
  getResources() {
    return Array.from(this.resources.values());
  }
  
  getCriticalPath() {
    return this.criticalPath;
  }
  
  getTimeline() {
    return this.timeline;
  }
  
  exportData() {
    return {
      tasks: this.getTasks(),
      dependencies: this.getDependencies(),
      resources: this.getResources(),
      criticalPath: this.getCriticalPath(),
      timeline: this.getTimeline(),
      options: this.options
    };
  }
  
  importData(data) {
    this.tasks.clear();
    this.dependencies.clear();
    this.resources.clear();
    
    if (data.tasks) {
      data.tasks.forEach(task => this.addTask(task));
    }
    
    if (data.dependencies) {
      data.dependencies.forEach(dep => this.addDependency(dep.from, dep.to, dep.type, dep.lag));
    }
    
    if (data.resources) {
      data.resources.forEach(resource => this.addResource(resource));
    }
    
    this.options = { ...this.options, ...data.options };
    this.calculateTimeline();
    this.calculateCriticalPath();
  }
}

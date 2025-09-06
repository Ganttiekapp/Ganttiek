/**
 * 🍌 BANANAS GANTT CHART LIBRARY 🍌
 * The ultimate, full-featured Gantt chart library built from scratch!
 * 
 * Exports all the components and utilities for building amazing Gantt charts
 */

// Import components
import { GanttEngine } from './GanttEngine.js';
import { GanttRenderer } from './GanttRenderer.js';
import { GanttInteractions } from './GanttInteractions.js';
import BananasGantt from './BananasGantt.svelte';

// Export components
export { GanttEngine, GanttRenderer, GanttInteractions, BananasGantt };

// Utility functions
export const GanttUtils = {
  /**
   * Format date for display
   */
  formatDate(date, format = 'short') {
    if (!date) return '';
    
    const options = {
      short: { month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(date);
  },
  
  /**
   * Calculate working days between two dates
   */
  calculateWorkingDays(startDate, endDate, workingDays = [1, 2, 3, 4, 5]) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    
    while (start <= end) {
      if (workingDays.includes(start.getDay())) {
        count++;
      }
      start.setDate(start.getDate() + 1);
    }
    
    return count;
  },
  
  /**
   * Generate a unique ID
   */
  generateId(prefix = 'gantt') {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Validate task data
   */
  validateTask(task) {
    const errors = [];
    
    if (!task.name || task.name.trim() === '') {
      errors.push('Task name is required');
    }
    
    if (!task.startDate && !task.start_date) {
      errors.push('Start date is required');
    }
    
    if (!task.endDate && !task.end_date) {
      errors.push('End date is required');
    }
    
    const startDate = new Date(task.startDate || task.start_date);
    const endDate = new Date(task.endDate || task.end_date);
    
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    }
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
    
    if (startDate > endDate) {
      errors.push('Start date must be before end date');
    }
    
    if (task.progress !== undefined && (task.progress < 0 || task.progress > 100)) {
      errors.push('Progress must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Convert task data to standard format
   */
  normalizeTask(task) {
    return {
      id: task.id || this.generateId(),
      name: task.name || 'Unnamed Task',
      description: task.description || '',
      startDate: new Date(task.startDate || task.start_date),
      endDate: new Date(task.endDate || task.end_date),
      progress: Math.max(0, Math.min(100, task.progress || 0)),
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      resourceId: task.resourceId || null,
      parentId: task.parentId || null,
      dependencies: task.dependencies || [],
      customFields: task.customFields || {},
      ...task
    };
  },
  
  /**
   * Calculate task duration in days
   */
  calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  },
  
  /**
   * Get status color
   */
  getStatusColor(status, theme = 'default') {
    const colors = {
      default: {
        todo: '#6b7280',
        in_progress: '#3b82f6',
        completed: '#10b981',
        blocked: '#ef4444'
      },
      dark: {
        todo: '#9ca3af',
        in_progress: '#60a5fa',
        completed: '#34d399',
        blocked: '#f87171'
      }
    };
    
    return colors[theme]?.[status] || colors.default[status] || colors.default.todo;
  },
  
  /**
   * Get priority color
   */
  getPriorityColor(priority, theme = 'default') {
    const colors = {
      default: {
        low: '#6b7280',
        medium: '#3b82f6',
        high: '#ef4444',
        critical: '#dc2626'
      },
      dark: {
        low: '#9ca3af',
        medium: '#60a5fa',
        high: '#f87171',
        critical: '#fca5a5'
      }
    };
    
    return colors[theme]?.[priority] || colors.default[priority] || colors.default.medium;
  }
};

// Default themes
export const GanttThemes = {
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
  },
  
  colorful: {
    background: '#ffffff',
    headerBackground: '#f0f9ff',
    sidebarBackground: '#e0f2fe',
    timelineBackground: '#ffffff',
    rowBackground: '#ffffff',
    rowBackgroundAlt: '#f8fafc',
    border: '#0ea5e9',
    gridColor: '#bae6fd',
    textColor: '#0c4a6e',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    defaultTaskColor: '#0ea5e9',
    defaultTaskBorder: '#0284c7',
    todoColor: '#6b7280',
    todoBorder: '#4b5563',
    inProgressColor: '#f59e0b',
    inProgressBorder: '#d97706',
    completedColor: '#10b981',
    completedBorder: '#059669',
    blockedColor: '#ef4444',
    blockedBorder: '#dc2626',
    criticalTaskColor: '#ec4899',
    criticalTaskBorder: '#db2777',
    dependencyColor: '#8b5cf6',
    milestoneColor: '#f59e0b',
    milestoneBorder: '#d97706'
  }
};

// Dependency types
export const DependencyTypes = {
  FINISH_TO_START: 'finish-to-start',
  START_TO_START: 'start-to-start',
  FINISH_TO_FINISH: 'finish-to-finish',
  START_TO_FINISH: 'start-to-finish'
};

// Task statuses
export const TaskStatuses = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked'
};

// Task priorities
export const TaskPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Time scales
export const TimeScales = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

// Export everything as a default object for convenience
export default {
  GanttEngine,
  GanttRenderer,
  GanttInteractions,
  BananasGantt,
  GanttUtils,
  GanttThemes,
  DependencyTypes,
  TaskStatuses,
  TaskPriorities,
  TimeScales
};

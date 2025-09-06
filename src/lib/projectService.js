import { supabase } from './supabase.js';

export class ProjectService {
  static async getProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  static async getProject(projectId, userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  }

  static async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateProject(projectId, updates, userId) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteProject(projectId, userId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);
    
    return { error };
  }

  static async getProjectTasks(projectId, userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('start_date', { ascending: true });
    
    return { data, error };
  }

  static async getAllTasks(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  static async getTasksByStatus(userId, status) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('due_date', { ascending: true });
    
    return { data, error };
  }

  static async getOverdueTasks(userId) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .lt('end_date', today)
      .neq('progress', 100)
      .order('end_date', { ascending: true });
    
    return { data, error };
  }

  static async createTask(taskData) {
    // Add default values and calculate status
    const enhancedTaskData = {
      ...taskData,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      due_date: taskData.end_date || taskData.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([enhancedTaskData])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateTask(taskId, updates, userId) {
    // Add updated timestamp
    const enhancedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(enhancedUpdates)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateTaskStatus(taskId, status, userId) {
    return this.updateTask(taskId, { status }, userId);
  }

  static async updateTaskProgress(taskId, progress, userId) {
    // Auto-update status based on progress
    let status = 'in_progress';
    if (progress === 0) status = 'todo';
    if (progress === 100) status = 'completed';

    return this.updateTask(taskId, { progress, status }, userId);
  }

  static async toggleTaskComplete(taskId, userId) {
    // Get current task to check progress
    const { data: task } = await this.getTask(taskId, userId);
    if (!task) return { error: 'Task not found' };

    const newProgress = task.progress === 100 ? 0 : 100;
    return this.updateTaskProgress(taskId, newProgress, userId);
  }

  static async getTask(taskId, userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  }

  static async deleteTask(taskId, userId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);
    
    return { error };
  }

  // Task dependency methods
  static async getTaskDependencies(taskId, userId) {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(*)
      `)
      .eq('task_id', taskId);
    
    return { data, error };
  }

  static async getTasksThatDependOn(taskId, userId) {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        task:tasks!task_dependencies_task_id_fkey(*)
      `)
      .eq('depends_on_task_id', taskId);
    
    return { data, error };
  }

  static async getAvailableDependencyTasks(projectId, currentTaskId, userId) {
    // Get all tasks in the project except the current task (to prevent self-reference)
    let query = supabase
      .from('tasks')
      .select('id, name')
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (currentTaskId) {
      query = query.neq('id', currentTaskId);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    
    // Filter out tasks that would create circular dependencies
    const filteredData = data?.filter(task => {
      if (!currentTaskId) return true;
      return !wouldCreateCircularDependency(task.id, currentTaskId, data);
    }) || [];
    
    return { data: filteredData, error };
  }

  static async updateTaskDependencies(taskId, dependencyTaskIds, userId) {
    // First, remove all existing dependencies for this task
    const { error: deleteError } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('task_id', taskId);
    
    if (deleteError) {
      return { error: deleteError };
    }
    
    // Then, add new dependencies if any
    if (dependencyTaskIds && dependencyTaskIds.length > 0) {
      const dependencies = dependencyTaskIds.map(depId => ({
        task_id: taskId,
        depends_on_task_id: depId
      }));
      
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert(dependencies)
        .select();
      
      return { data, error };
    }
    
    return { data: [], error: null };
  }

  static async getTaskWithDependencies(taskId, userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        dependencies:task_dependencies(
          *,
          depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(*)
        )
      `)
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  }
}

// Helper function to check for circular dependencies
function wouldCreateCircularDependency(newParentId, childTaskId, allTasks) {
  let currentTaskId = newParentId;
  const visited = new Set();
  
  while (currentTaskId && !visited.has(currentTaskId)) {
    if (currentTaskId === childTaskId) {
      return true; // Circular dependency detected
    }
    
    visited.add(currentTaskId);
    const parentTask = allTasks.find(task => task.id === currentTaskId);
    currentTaskId = parentTask?.parent_task_id;
  }
  
  return false;
}

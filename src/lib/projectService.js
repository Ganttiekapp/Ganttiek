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
}

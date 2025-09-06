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
    // For now, use the fallback method directly to avoid join issues
    // This ensures the method works regardless of foreign key setup
    return await this.getAllTasksFallback(userId);
  }

  static async getAllTasksFallback(userId) {
    try {
      // Fetch tasks without join
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (tasksError) {
        console.error('Failed to fetch tasks:', tasksError);
        return { data: null, error: tasksError };
      }
      
      if (!tasksData || tasksData.length === 0) {
        return { data: [], error: null };
      }
      
      // Get unique project IDs
      const projectIds = [...new Set(tasksData.map(task => task.project_id).filter(Boolean))];
      
      if (projectIds.length === 0) {
        // No project IDs, return tasks as-is
        return { data: tasksData, error: null };
      }
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds);
      
      if (projectsError) {
        console.warn('Failed to fetch projects, returning tasks without project info:', projectsError);
        return { data: tasksData, error: null }; // Return tasks without project info
      }
      
      // Combine the data
      const enrichedTasks = tasksData.map(task => ({
        ...task,
        projects: projectsData?.find(project => project.id === task.project_id) || null
      }));
      
      return { data: enrichedTasks, error: null };
    } catch (err) {
      console.error('Error in getAllTasksFallback:', err);
      return { data: null, error: err };
    }
  }

  // Simple method to get tasks without any joins - for debugging
  static async getTasksOnly(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  // Helper method to enrich tasks with project data
  static async enrichTasksWithProjects(tasksData) {
    if (!tasksData || tasksData.length === 0) {
      return tasksData;
    }
    
    try {
      // Get unique project IDs
      const projectIds = [...new Set(tasksData.map(task => task.project_id).filter(Boolean))];
      
      if (projectIds.length === 0) {
        return tasksData;
      }
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds);
      
      if (projectsError) {
        console.warn('Failed to fetch projects for enrichment:', projectsError);
        return tasksData; // Return tasks without project info
      }
      
      // Combine the data
      return tasksData.map(task => ({
        ...task,
        projects: projectsData?.find(project => project.id === task.project_id) || null
      }));
    } catch (err) {
      console.error('Error enriching tasks with projects:', err);
      return tasksData; // Return tasks without project info
    }
  }

  static async getTasksByStatus(userId, status) {
    // Use fallback approach to avoid join issues
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('end_date', { ascending: true });
    
    if (tasksError) {
      return { data: null, error: tasksError };
    }
    
    // Enrich with project data if available
    if (tasksData && tasksData.length > 0) {
      const enrichedTasks = await this.enrichTasksWithProjects(tasksData);
      return { data: enrichedTasks, error: null };
    }
    
    return { data: tasksData, error: null };
  }

  static async getOverdueTasks(userId) {
    const today = new Date().toISOString().split('T')[0];
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .lt('end_date', today)
      .neq('progress', 100)
      .order('end_date', { ascending: true });
    
    if (tasksError) {
      return { data: null, error: tasksError };
    }
    
    // Enrich with project data if available
    if (tasksData && tasksData.length > 0) {
      const enrichedTasks = await this.enrichTasksWithProjects(tasksData);
      return { data: enrichedTasks, error: null };
    }
    
    return { data: tasksData, error: null };
  }

  static async createTask(taskData) {
    // Add default values and calculate status
    const enhancedTaskData = {
      ...taskData,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
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
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();
    
    if (taskError) {
      return { data: null, error: taskError };
    }
    
    // Enrich with project data if available
    if (taskData) {
      const enrichedTasks = await this.enrichTasksWithProjects([taskData]);
      return { data: enrichedTasks[0], error: null };
    }
    
    return { data: taskData, error: null };
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

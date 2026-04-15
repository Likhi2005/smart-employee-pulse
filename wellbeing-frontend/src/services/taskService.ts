import api from './api';
import { Task, TaskAssignment, TaskTemplate, TaskFilters, SortOptions } from '@/types/tasks';

class TaskService {
    // ===== TASK CRUD =====

    /**
     * Get all team tasks with optional filters
     */
    async getTasks(filters?: TaskFilters, sort?: SortOptions) {
        const params = new URLSearchParams();

        if (filters?.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            params.append('status', statuses.join(','));
        }

        if (filters?.priority) {
            const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
            params.append('priority', priorities.join(','));
        }

        if (filters?.assignedTo) {
            params.append('assignedTo', filters.assignedTo);
        }

        if (filters?.searchQuery) {
            params.append('search', filters.searchQuery);
        }

        if (sort) {
            params.append('sortBy', sort.field);
            params.append('sortDir', sort.direction);
        }

        try {
            const response = await api.get(`/tasks/team-tasks?${params.toString()}`);
            return response.data as Task[];
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }
    }

    /**
     * Get single task details
     */
    async getTaskById(taskId: string) {
        try {
            const response = await api.get(`/tasks/${taskId}`);
            return response.data as Task;
        } catch (error) {
            console.error(`Failed to fetch task ${taskId}:`, error);
            throw error;
        }
    }

    /**
     * Create new task
     */
    async createTask(data: Partial<Task>) {
        try {
            const response = await api.post('/tasks/create', {
                title: data.title,
                description: data.description,
                effort: data.effort,
                priority: data.priority,
                dueDate: data.dueDate,
                isMandatory: data.isMandatory,
                skills: data.skills,
                tags: data.tags
            });
            return response.data as Task;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    /**
     * Update task details
     */
    async updateTask(taskId: string, data: Partial<Task>) {
        try {
            const response = await api.put(`/tasks/${taskId}`, data);
            return response.data as Task;
        } catch (error) {
            console.error(`Failed to update task ${taskId}:`, error);
            throw error;
        }
    }

    /**
     * Update task status
     */
    async updateTaskStatus(taskId: string, status: Task['status']) {
        return this.updateTask(taskId, { status });
    }

    /**
     * Delete task
     */
    async deleteTask(taskId: string) {
        try {
            await api.delete(`/tasks/${taskId}`);
        } catch (error) {
            console.error(`Failed to delete task ${taskId}:`, error);
            throw error;
        }
    }

    // ===== ASSIGNMENT OPERATIONS =====

    /**
     * Assign task to employee
     */
    async assignTask(taskId: string, employeeId: string, options?: { aiSuggested?: boolean; notes?: string }) {
        try {
            const response = await api.post(`/tasks/${taskId}/assign`, {
                assignedTo: employeeId,
                aiSuggested: options?.aiSuggested || false,
                notes: options?.notes
            });
            return response.data as Task;
        } catch (error) {
            console.error(`Failed to assign task ${taskId}:`, error);
            throw error;
        }
    }

    /**
     * Get assignment history for a task
     */
    async getAssignmentHistory(taskId: string) {
        try {
            const response = await api.get(`/tasks/${taskId}/assignment-history`);
            return response.data as TaskAssignment[];
        } catch (error) {
            console.error(`Failed to fetch assignment history for task ${taskId}:`, error);
            throw error;
        }
    }

    /**
     * Reject task assignment
     */
    async rejectAssignment(taskId: string, reason: string) {
        try {
            const response = await api.post(`/tasks/${taskId}/reject`, { reason });
            return response.data as Task;
        } catch (error) {
            console.error(`Failed to reject task ${taskId}:`, error);
            throw error;
        }
    }

    // ===== TEMPLATE OPERATIONS =====

    /**
     * Get all task templates
     */
    async getTemplates() {
        try {
            const response = await api.get('/tasks/templates');
            return response.data as TaskTemplate[];
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            throw error;
        }
    }

    /**
     * Create task from template
     */
    async createFromTemplate(templateId: string, overrides?: Partial<Task>) {
        try {
            const response = await api.post(`/tasks/templates/${templateId}/create`, overrides);
            return response.data as Task;
        } catch (error) {
            console.error(`Failed to create task from template ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Save task as reusable template
     */
    async saveAsTemplate(taskId: string, templateName: string, isPublic: boolean = false) {
        try {
            const response = await api.post(`/tasks/${taskId}/save-as-template`, {
                name: templateName,
                isPublic
            });
            return response.data as TaskTemplate;
        } catch (error) {
            console.error(`Failed to save task ${taskId} as template:`, error);
            throw error;
        }
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId: string) {
        try {
            await api.delete(`/tasks/templates/${templateId}`);
        } catch (error) {
            console.error(`Failed to delete template ${templateId}:`, error);
            throw error;
        }
    }
}

export default new TaskService();
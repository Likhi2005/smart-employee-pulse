import api from '@/services/api'
import type { TaskTemplateItem, CreateTaskTemplatePayload, UpdateTaskTemplatePayload } from '@/types'

export interface TemplateListParams {
  search?: string
  department?: string
  includeInactive?: boolean
  page?: number
  limit?: number
}

export interface TemplateListResponse {
  templates: TaskTemplateItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * List templates with filters
 * Server-side filtering for search, department, active status
 */
export async function listTemplates(params: TemplateListParams = {}): Promise<TemplateListResponse> {
  const q = new URLSearchParams()

  if (params.search?.trim()) q.set('search', params.search.trim())
  if (params.department?.trim()) q.set('department', params.department.trim())
  if (params.includeInactive !== undefined) q.set('includeInactive', String(params.includeInactive))
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))

  try {
    const response = await api.get(`/tasks/templates?${q.toString()}`)
    return {
      templates: response.data?.templates || [],
      meta: {
        page: Number(response.data?.meta?.page || 1),
        limit: Number(response.data?.meta?.limit || 12),
        total: Number(response.data?.meta?.total || 0),
        totalPages: Number(response.data?.meta?.totalPages || 1),
      },
    }
  } catch (error) {
    console.error('Failed to list templates:', error)
    throw error
  }
}

/**
 * Get single template by ID
 */
export async function getTemplate(templateId: string): Promise<TaskTemplateItem> {
  try {
    const response = await api.get(`/tasks/templates/${templateId}`)
    return response.data?.template as TaskTemplateItem
  } catch (error) {
    console.error('Failed to fetch template:', error)
    throw error
  }
}

/**
 * Create new template
 */
export async function createTemplate(payload: CreateTaskTemplatePayload): Promise<TaskTemplateItem> {
  try {
    const response = await api.post('/tasks/templates', payload)
    return response.data?.template as TaskTemplateItem
  } catch (error) {
    console.error('Failed to create template:', error)
    throw error
  }
}

/**
 * Update existing template
 */
export async function updateTemplate(
  templateId: string,
  payload: UpdateTaskTemplatePayload
): Promise<TaskTemplateItem> {
  try {
    const response = await api.put(`/tasks/templates/${templateId}`, payload)
    return response.data?.template as TaskTemplateItem
  } catch (error) {
    console.error('Failed to update template:', error)
    throw error
  }
}

/**
 * Archive template (soft delete via isActive=false)
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    await api.delete(`/tasks/templates/${templateId}`)
  } catch (error) {
    console.error('Failed to delete template:', error)
    throw error
  }
}

/**
 * Revert archive - activate an inactive template
 */
export async function reactivateTemplate(templateId: string): Promise<TaskTemplateItem> {
  try {
    const response = await api.put(`/tasks/templates/${templateId}`, { isActive: true })
    return response.data?.template as TaskTemplateItem
  } catch (error) {
    console.error('Failed to reactivate template:', error)
    throw error
  }
}

/**
 * Duplicate template with new name
 */
export async function duplicateTemplate(templateId: string, newName: string): Promise<TaskTemplateItem> {
  try {
    const original = await getTemplate(templateId)
    const payload: CreateTaskTemplatePayload = {
      name: newName,
      title: original.title,
      description: original.description,
      defaultPriority: original.defaultPriority,
      defaultEffort: original.defaultEffort,
      defaultIsMandatory: original.defaultIsMandatory,
      department: original.department,
      skillsRequired: original.skillsRequired,
      tags: original.tags,
    }
    return await createTemplate(payload)
  } catch (error) {
    console.error('Failed to duplicate template:', error)
    throw error
  }
}

/**
 * Extract unique departments from templates
 * Used for filter dropdown
 */
export function extractDepartments(templates: TaskTemplateItem[]): string[] {
  const departments = new Set<string>()
  templates.forEach((t) => {
    if (t.department?.trim()) {
      departments.add(t.department.trim())
    }
  })
  return Array.from(departments).sort()
}
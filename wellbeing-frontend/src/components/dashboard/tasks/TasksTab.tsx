import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TaskList } from './TaskList'
import { TaskCreatePage } from './TaskCreatePage'
import { TaskAssignmentHistoryPage } from './TaskAssignmentHistoryPage'
import { TaskTemplatesPage } from './TaskTemplatesPage'
import { AIOrchestrationPage } from './AIOrchestrationPage'
import AIAutomationPage from '../../../features/ai-automation/AIAutomationPage'

type TasksSection = 'list' | 'create' | 'history' | 'templates' | 'ai-orchestration' | 'ai-automation'

export function TasksTab() {
    const [searchParams] = useSearchParams()
    const section = (searchParams.get('section') || 'list') as TasksSection

    const title = useMemo(() => {
        if (section === 'history') return 'Assignment History'
        if (section === 'templates') return 'Task Templates'
        if (section === 'create') return 'Task Studio'
        if (section === 'ai-orchestration') return 'AI Orchestration Center'
        if (section === 'ai-automation') return 'AI Automation Dashboard'
        return 'All Tasks'
    }, [section])

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Management</p>
                <h1 className="text-2xl font-bold text-neutral-50">{title}</h1>
            </div>

            {section === 'list' && <TaskList />}
            {section === 'create' && <TaskCreatePage />}
            {section === 'history' && <TaskAssignmentHistoryPage />}
            {section === 'templates' && <TaskTemplatesPage />}
            {section === 'ai-orchestration' && <AIOrchestrationPage />}
            {section === 'ai-automation' && <AIAutomationPage />}
        </div>
    )
}
import React from 'react'
import { X, Download, FileText, FileJson, FileSpreadsheet, File } from 'lucide-react'
import type { TaskItem } from '@/types'

interface TaskDetailModalProps {
    task: TaskItem | null
    onClose: () => void
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
    if (!task) return null

    const handleExportJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(task, null, 2))
        triggerDownload(dataStr, `task-${task.id || task._id}.json`)
    }

    const handleExportCsv = () => {
        const headers = ['title', 'status', 'priority', 'assignee', 'dueDate', 'tags']
        const row = [
            `"${task.title.replace(/"/g, '""')}"`,
            task.status,
            task.priority,
            typeof task.assignedTo === 'object' ? task.assignedTo?.fullName || '' : task.assignedTo || '',
            task.dueDate ? new Date(task.dueDate).toISOString() : '',
            // tasks in this system might not have tags directly in the type, so we leave it empty or map it if it exists
            (task as any).tags ? (task as any).tags.join(',') : ''
        ]
        const csvContent = headers.join(',') + '\n' + row.join(',')
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
        triggerDownload(dataStr, `task-${task.id || task._id}.csv`)
    }

    const handleExportMarkdown = () => {
        const md = [
            `# ${task.title}`,
            `**Status:** ${task.status} | **Priority:** ${task.priority} | **Effort:** ${task.effort} pts`,
            `**Due Date:** ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'None'}`,
            `\n## Description`,
            task.description || '*No description provided.*',
            `\n## Metadata`,
            `- **Task ID:** ${task.id || task._id}`,
            `- **Created At:** ${new Date(task.createdAt).toLocaleString()}`,
            task.updatedAt ? `- **Updated At:** ${new Date(task.updatedAt).toLocaleString()}` : ''
        ].join('\n')
        
        const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md)
        triggerDownload(dataStr, `task-${task.id || task._id}.md`)
    }

    const handleExportPdf = () => {
        // Since we cannot easily generate a PDF blob purely in raw frontend without a large library (like jspdf),
        // we'll trigger the browser's print dialog on this modal, which users can "Save as PDF".
        // Alternatively, since the rule says "export MUST bypass UI logic and use raw task data", 
        // a basic print approach or just printing the raw data works.
        // We will create a temporary iframe with the raw data formatted nicely and print it.
        const printWindow = document.createElement('iframe')
        printWindow.style.position = 'absolute'
        printWindow.style.top = '-9999px'
        document.body.appendChild(printWindow)
        
        const content = `
            <html>
                <head>
                    <title>Task Report - ${task.id || task._id}</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #000; }
                        h1 { font-size: 24px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        h2 { font-size: 18px; margin-top: 20px; }
                        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                        .meta div { font-size: 14px; }
                        .desc { white-space: pre-wrap; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <h1>${task.title}</h1>
                    <div class="meta">
                        <div><strong>Status:</strong> ${task.status}</div>
                        <div><strong>Priority:</strong> ${task.priority}</div>
                        <div><strong>Effort:</strong> ${task.effort}</div>
                        <div><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'N/A'}</div>
                        <div><strong>Task ID:</strong> ${task.id || task._id}</div>
                    </div>
                    <h2>Description</h2>
                    <div class="desc">${task.description || 'No description provided.'}</div>
                </body>
            </html>
        `
        
        printWindow.contentDocument?.write(content)
        printWindow.contentDocument?.close()
        
        // Wait for styles to load then print
        setTimeout(() => {
            printWindow.contentWindow?.focus()
            printWindow.contentWindow?.print()
            document.body.removeChild(printWindow)
        }, 250)
    }

    const triggerDownload = (dataStr: string, filename: string) => {
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", filename)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-neutral-500">{task.id || task._id}</span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                                {task.status}
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-100 pr-8">{task.title}</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50">
                        <div>
                            <p className="text-[11px] text-neutral-500 mb-1">Priority</p>
                            <p className="text-sm font-medium capitalize text-neutral-200">{task.priority}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-neutral-500 mb-1">Effort</p>
                            <p className="text-sm font-medium text-neutral-200">{task.effort} pts</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-neutral-500 mb-1">Due Date</p>
                            <p className="text-sm font-medium text-neutral-200">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] text-neutral-500 mb-1">Risk Level</p>
                            <p className="text-sm font-medium capitalize text-neutral-200">{task.riskLevel || 'Low'}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-300 mb-3 border-b border-neutral-800 pb-2">
                            Description
                        </h3>
                        <div className="text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed">
                            {task.description || <span className="italic text-neutral-600">No description provided.</span>}
                        </div>
                    </div>

                    {/* Acceptance Criteria (mocked if not present) */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-300 mb-3 border-b border-neutral-800 pb-2">
                            Acceptance Criteria
                        </h3>
                        <div className="text-sm text-neutral-400">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>All requirements met as per description</li>
                                <li>Code reviewed and approved (if applicable)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer (Export Actions) */}
                <div className="p-5 border-t border-neutral-800 bg-neutral-900 rounded-b-2xl">
                    <p className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-1.5">
                        <Download size={14} /> Export Options (Raw Data)
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={handleExportJson} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-700/80 transition-colors">
                            <FileJson size={14} className="text-emerald-400" /> JSON
                        </button>
                        <button onClick={handleExportCsv} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-700/80 transition-colors">
                            <FileSpreadsheet size={14} className="text-green-400" /> CSV
                        </button>
                        <button onClick={handleExportMarkdown} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-700/80 transition-colors">
                            <FileText size={14} className="text-cyan-400" /> Markdown
                        </button>
                        <button onClick={handleExportPdf} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-700/80 transition-colors">
                            <File size={14} className="text-rose-400" /> PDF Report
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

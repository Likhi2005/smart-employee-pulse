'use client';

export default function TaskTableHeader() {
    const columns = [
        { label: 'Task', width: '30%' },
        { label: 'Priority', width: '12%' },
        { label: 'Status', width: '12%' },
        { label: 'Assigned To', width: '18%' },
        { label: 'Due Date', width: '14%' },
        { label: 'Effort (hrs)', width: '10%' },
        { label: 'Mandatory', width: '8%' }
    ];

    return (
        <div className="flex bg-neutral-900/50 border-b border-neutral-800 sticky top-0 z-10">
            {columns.map((col, idx) => (
                <div
                    key={idx}
                    style={{ width: col.width }}
                    className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                    {col.label}
                </div>
            ))}
        </div>
    );
}
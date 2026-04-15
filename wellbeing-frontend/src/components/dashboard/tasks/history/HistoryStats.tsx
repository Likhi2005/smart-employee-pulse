import React from 'react';
import { CheckCircle, XCircle, Zap, Users } from 'lucide-react';
import { AssignmentRecord } from '../../../../hooks/useAssignmentHistory';

interface AssigneeStats {
    id: string;
    name: string;
    email: string;
    count: number;
    successRate: number;
}

interface HistoryStatsProps {
    records: AssignmentRecord[];
    assigneeStats: AssigneeStats[];
}

export default function HistoryStats({ records, assigneeStats }: HistoryStatsProps) {
    const completedCount = records.filter((r) => r.assignmentStatus === 'completed').length;
    const rejectedCount = records.filter((r) => r.assignmentStatus === 'rejected').length;
    const aiSuggestedCount = records.filter((r) => r.aiSuggested).length;
    const successRate = records.length > 0 ? Math.round((completedCount / records.length) * 100) : 0;

    const stats = [
        {
            icon: CheckCircle,
            label: 'Completed',
            value: completedCount,
            color: 'emerald',
            description: `${successRate}% success rate`,
        },
        {
            icon: XCircle,
            label: 'Rejected',
            value: rejectedCount,
            color: 'red',
            description: `${records.length > 0 ? Math.round((rejectedCount / records.length) * 100) : 0}% of total`,
        },
        {
            icon: Zap,
            label: 'AI Suggested',
            value: aiSuggestedCount,
            color: 'yellow',
            description: `${records.length > 0 ? Math.round((aiSuggestedCount / records.length) * 100) : 0}% of total`,
        },
        {
            icon: Users,
            label: 'Top Performer',
            value: assigneeStats[0]?.name || 'N/A',
            color: 'blue',
            description: `${assigneeStats[0]?.count || 0} assignments (${assigneeStats[0]?.successRate || 0}% success)`,
        },
    ];

    const colorMap = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        red: 'bg-red-500/10 border-red-500/20',
        yellow: 'bg-yellow-500/10 border-yellow-500/20',
        blue: 'bg-blue-500/10 border-blue-500/20',
    };

    const textColorMap = {
        emerald: 'text-emerald-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        blue: 'text-blue-600',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const colorClass = colorMap[stat.color as keyof typeof colorMap];
                const textClass = textColorMap[stat.color as keyof typeof textColorMap];

                return (
                    <div
                        key={stat.label}
                        className={`p-4 rounded-lg border ${colorClass}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${textClass}`}>{stat.label}</p>
                                <p className="text-2xl font-bold mt-2 text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                            </div>
                            <Icon className={`w-5 h-5 ${textClass} opacity-50`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
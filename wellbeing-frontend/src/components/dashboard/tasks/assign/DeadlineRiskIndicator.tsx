'use client';

import { AlertTriangle } from 'lucide-react';

interface DeadlineRiskIndicatorProps {
    risk: number;
}

export default function DeadlineRiskIndicator({ risk }: DeadlineRiskIndicatorProps) {
    const getLevel = (score: number) => {
        if (score >= 75) return { label: 'Critical', color: 'text-red-400', icon: 'fill-red-600' };
        if (score >= 50) return { label: 'High', color: 'text-yellow-400', icon: 'fill-yellow-600' };
        if (score >= 25) return { label: 'Medium', color: 'text-blue-400', icon: 'fill-blue-600' };
        return { label: 'Low', color: 'text-green-400', icon: 'fill-green-600' };
    };

    const level = getLevel(risk);

    return (
        <div className="text-center p-3 rounded border border-neutral-700 bg-neutral-800/50">
            <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${level.icon.replace('fill-', 'text-')}`} />
            <p className={`text-xs font-medium ${level.color}`}>{level.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{risk}% Risk</p>
        </div>
    );
}
import React from 'react';
import { Activity, ShieldAlert, BarChart } from 'lucide-react';

interface TeamSnapshotProps {
    metrics: {
        avgWorkload: number;
        riskLevel: string;
        efficiency: number;
    };
}

export const TeamSnapshot: React.FC<TeamSnapshotProps> = ({ metrics }) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'green': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'amber': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'red': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const riskColorClass = getRiskColor(metrics.riskLevel);

    return (
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Team Snapshot</h3>
            
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 flex items-center gap-1"><Activity className="w-4 h-4" /> Avg Workload</span>
                        <span className="text-gray-200 font-medium">{metrics.avgWorkload}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${metrics.avgWorkload > 80 ? 'bg-red-500' : metrics.avgWorkload > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${metrics.avgWorkload}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-900/50 border-gray-700/50">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">System Risk</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize font-medium ${riskColorClass}`}>
                        {metrics.riskLevel}
                    </span>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 flex items-center gap-1"><BarChart className="w-4 h-4" /> Efficiency Score</span>
                        <span className="text-gray-200 font-medium">{metrics.efficiency}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${metrics.efficiency}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

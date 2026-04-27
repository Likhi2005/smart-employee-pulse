import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Users, Zap, Briefcase } from 'lucide-react';
import { ExecutionPreviewModal } from './ExecutionPreviewModal';

const actions = [
    { id: 'breakdown', label: 'Break Down Project', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'assign', label: 'Auto Assign Tasks', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'simulate', label: 'Simulate Impact', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'optimize', label: 'Optimize Workload', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
];

export const SmartActionsPanel: React.FC = () => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleActionClick = (actionId: string) => {
        if (actionId === 'breakdown') {
            navigate('/dashboard/manager/breakdown-studio');
        } else {
            setSelectedAction(actionId);
        }
    };

    return (
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Smart Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => handleActionClick(action.id)}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-gray-800 border border-gray-700/50 hover:bg-gray-700 transition-colors group"
                    >
                        <div className={`p-3 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-300">{action.label}</span>
                    </button>
                ))}
            </div>

            <ExecutionPreviewModal 
                isOpen={!!selectedAction} 
                onClose={() => setSelectedAction(null)} 
                actionId={selectedAction} 
            />
        </div>
    );
};

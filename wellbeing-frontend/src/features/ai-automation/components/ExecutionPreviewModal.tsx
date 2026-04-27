import React from 'react';
import { X, Check, Loader2, ArrowRight } from 'lucide-react';

interface PreviewData {
    title: string;
    description: string;
    steps: {
        label: string;
        value: string | React.ReactNode;
        status: 'pending' | 'success' | 'processing';
    }[];
    impact: string;
}

interface ExecutionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionId: string | null;
}

const PREVIEW_DATA: Record<string, PreviewData> = {
    'assign': {
        title: 'Auto Assign Tasks (Preview)',
        description: 'AI matches pending tasks to team members based on skills, current workload, and past performance.',
        steps: [
            { label: 'Workload Check', value: 'Analyzing capacity for 5 team members', status: 'success' },
            { label: 'Skill Matching', value: 'Matching React/Node.js requirements', status: 'success' },
            { label: 'Distribution', value: 'Optimizing assignment matrix to prevent burnout', status: 'processing' },
        ],
        impact: 'Reduces assignment bias and prevents overtime.'
    },
    'simulate': {
        title: 'Simulate Impact (Preview)',
        description: 'AI simulates the next 2 weeks of execution to identify potential bottlenecks before they happen.',
        steps: [
            { label: 'Data Gathering', value: 'Aggregating current sprint velocity', status: 'success' },
            { label: 'Monte Carlo Simulation', value: 'Running 10,000 execution scenarios', status: 'processing' },
            { label: 'Risk Identification', value: 'Detecting critical path vulnerabilities', status: 'pending' },
        ],
        impact: 'Highlights 2 high-risk dependencies early.'
    },
    'optimize': {
        title: 'Optimize Workload (Preview)',
        description: 'AI suggests task reallocations to balance the team workload and accelerate delivery.',
        steps: [
            { label: 'Bottleneck Detection', value: 'Found John is overloaded (115% capacity)', status: 'success' },
            { label: 'Alternative Routing', value: 'Identifying available peers with similar skills', status: 'success' },
            { label: 'Reallocation Plan', value: 'Drafting 3 shift proposals', status: 'processing' },
        ],
        impact: 'Improves overall sprint delivery confidence by 18%.'
    }
};

export const ExecutionPreviewModal: React.FC<ExecutionPreviewModalProps> = ({ isOpen, onClose, actionId }) => {
    if (!isOpen || !actionId) return null;

    const data = PREVIEW_DATA[actionId];
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 mb-2">
                            Feature Preview
                        </div>
                        <h2 className="text-xl font-bold text-gray-100">{data.title}</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {data.description}
                    </p>

                    {/* Simulation Steps */}
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                        {data.steps.map((step, idx) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-gray-800 text-gray-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow">
                                    {step.status === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
                                    {step.status === 'processing' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                                    {step.status === 'pending' && <span className="w-2 h-2 rounded-full bg-gray-600" />}
                                </div>
                                
                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-800 bg-gray-900/50 shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm text-gray-200">{step.label}</h4>
                                    </div>
                                    <p className="text-xs text-gray-400">{step.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Impact Summary */}
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Expected Impact</p>
                        <p className="text-sm text-indigo-200">{data.impact}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-200 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

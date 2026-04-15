'use client';

interface OverloadWarningProps {
    willOverload: boolean;
    severity: 'info' | 'warning' | 'critical';
}

export default function OverloadWarning({ willOverload, severity }: OverloadWarningProps) {
    const config = {
        info: { label: 'Safe', color: 'bg-green-600/20 text-green-400', icon: '✓' },
        warning: { label: 'High Load', color: 'bg-yellow-600/20 text-yellow-400', icon: '!' },
        critical: { label: 'Overload!', color: 'bg-red-600/20 text-red-400', icon: '✕' }
    };

    const current = config[severity];

    return (
        <div className={`p-3 rounded border ${current.color.replace('text-', 'border-').replace('20', '30')} text-center`}>
            <div className="text-lg font-bold">{current.icon}</div>
            <p className="text-xs font-medium mt-1">{current.label}</p>
        </div>
    );
}
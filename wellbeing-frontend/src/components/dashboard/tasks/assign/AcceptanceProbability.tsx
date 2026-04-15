'use client';

interface AcceptanceProbabilityProps {
    probability: number;
}

export default function AcceptanceProbability({ probability }: AcceptanceProbabilityProps) {
    return (
        <div className="text-center p-3 rounded border border-neutral-700 bg-neutral-800/50">
            <div className="text-lg font-bold text-purple-400">{probability}%</div>
            <p className="text-xs text-muted-foreground mt-1">Likely to Accept</p>
        </div>
    );
}
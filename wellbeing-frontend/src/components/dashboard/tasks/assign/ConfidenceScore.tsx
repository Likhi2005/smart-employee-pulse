'use client';

interface ConfidenceScoreProps {
    confidence: number;
}

export default function ConfidenceScore({ confidence }: ConfidenceScoreProps) {
    const getColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="text-center">
            <div className={`text-3xl font-bold ${getColor(confidence)}`}>
                {confidence}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confidence</p>
        </div>
    );
}
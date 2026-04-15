'use client';

interface SkillMatcherProps {
    skillMatch: number;
}

export default function SkillMatcher({ skillMatch }: SkillMatcherProps) {
    return (
        <div className="text-center p-3 rounded border border-neutral-700 bg-neutral-800/50">
            <div className="text-lg font-bold text-cyan-400">{skillMatch}%</div>
            <p className="text-xs text-muted-foreground mt-1">Skill Match</p>
        </div>
    );
}
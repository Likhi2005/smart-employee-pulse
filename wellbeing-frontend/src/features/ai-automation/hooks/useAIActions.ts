import { useState, useCallback, useEffect } from 'react';
import { aiAutomationService } from '../services/aiAutomationService';

export const useAIActions = () => {
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [loadingConflicts, setLoadingConflicts] = useState(false);
    const [decisionTrace, setDecisionTrace] = useState<any | null>(null);
    const [loadingTrace, setLoadingTrace] = useState(false);
    const [isApplying, setIsApplying] = useState<string | null>(null);

    const fetchConflicts = useCallback(async () => {
        setLoadingConflicts(true);
        try {
            const data = await aiAutomationService.detectConflicts();
            setConflicts(data.conflicts || []);
        } catch (error) {
            console.error('Failed to fetch conflicts', error);
        } finally {
            setLoadingConflicts(false);
        }
    }, []);

    const fetchDecisionTrace = useCallback(async (id: string) => {
        setLoadingTrace(true);
        try {
            const data = await aiAutomationService.getDecisionTrace(id);
            setDecisionTrace(data.trace);
        } catch (error) {
            console.error('Failed to fetch trace', error);
        } finally {
            setLoadingTrace(false);
        }
    }, []);

    const applyFix = useCallback(async (conflictId: string, actionPayload: any) => {
        setIsApplying(conflictId);
        try {
            // Optimistically remove conflict
            setConflicts((prev) => prev.filter(c => c.id !== conflictId));
            await aiAutomationService.assignTask(actionPayload);
        } catch (error) {
            console.error('Failed to apply fix', error);
            // Re-fetch to revert optimistic update on failure
            fetchConflicts();
        } finally {
            setIsApplying(null);
        }
    }, [fetchConflicts]);

    useEffect(() => {
        fetchConflicts();
    }, [fetchConflicts]);

    return {
        conflicts,
        loadingConflicts,
        fetchConflicts,
        decisionTrace,
        fetchDecisionTrace,
        loadingTrace,
        applyFix,
        isApplying,
        setDecisionTrace
    };
};

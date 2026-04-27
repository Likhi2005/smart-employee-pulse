import { useState, useCallback, useEffect } from 'react';
import { aiAutomationService } from '../services/aiAutomationService';

export const useAIActions = () => {
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [loadingConflicts, setLoadingConflicts] = useState(false);
    const [decisionTrace, setDecisionTrace] = useState<any | null>(null);
    const [loadingTrace, setLoadingTrace] = useState(false);
    const [isApplying, setIsApplying] = useState<string | null>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set());

    const fetchInsights = useCallback(async () => {
        setLoadingInsights(true);
        try {
            const data = await aiAutomationService.getInsights();
            setInsights(data.insights || []);
        } catch (error) {
            console.error('Failed to fetch insights', error);
        } finally {
            setLoadingInsights(false);
        }
    }, []);

    const fetchConflicts = useCallback(async () => {
        setLoadingConflicts(true);
        try {
            const data = await aiAutomationService.detectConflicts();
            const freshConflicts = (data.conflicts || []).filter((c: any) => !resolvedConflicts.has(c.id));
            setConflicts(freshConflicts);
        } catch (error) {
            console.error('Failed to fetch conflicts', error);
        } finally {
            setLoadingConflicts(false);
        }
    }, [resolvedConflicts]);

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

    const applyFix = useCallback(async (conflict: any) => {
        const conflictId = conflict?.id;
        setIsApplying(conflictId);
        try {
            if (!conflictId) {
                throw new Error('Conflict ID is missing');
            }

            const taskId = conflict.taskId || conflict.task?._id || conflict.task?._id?.toString?.();
            const employeeId = conflict.employeeId || conflict.employee?._id || conflict.employee?._id?.toString?.();

            if (!taskId || !employeeId) {
                throw new Error('Invalid conflict payload: missing taskId or employeeId');
            }

            // Mark as resolved locally
            setResolvedConflicts(prev => {
                const next = new Set(prev);
                next.add(conflictId);
                return next;
            });

            // Optimistically remove conflict
            setConflicts((prev) => prev.filter(c => c.id !== conflictId));
            await aiAutomationService.assignTask({
                taskId,
                employeeId,
                conflict,
            });
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
        fetchInsights();
    }, [fetchConflicts, fetchInsights]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            fetchConflicts();
            fetchInsights();
        }, 60000);

        return () => window.clearInterval(interval);
    }, [fetchConflicts, fetchInsights]);

    return {
        conflicts,
        loadingConflicts,
        fetchConflicts,
        decisionTrace,
        fetchDecisionTrace,
        loadingTrace,
        applyFix,
        isApplying,
        setDecisionTrace,
        insights,
        loadingInsights,
        fetchInsights
    };
};

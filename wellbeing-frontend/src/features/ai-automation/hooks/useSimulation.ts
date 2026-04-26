import { useState, useCallback, useEffect } from 'react';
import { aiAutomationService } from '../services/aiAutomationService';

export const useSimulation = () => {
    const [riskMode, setRiskMode] = useState('Balanced');
    const [metrics, setMetrics] = useState({ avgWorkload: 75, riskLevel: 'amber', efficiency: 85 });
    const [isSimulating, setIsSimulating] = useState(false);

    const simulate = useCallback(async (mode: string) => {
        setIsSimulating(true);
        try {
            const data = await aiAutomationService.simulateImpact({ riskMode: mode });
            setMetrics(data.metrics);
        } catch (error) {
            console.error('Failed to simulate', error);
        } finally {
            setIsSimulating(false);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            simulate(riskMode);
        }, 300); // Debounce simulation

        return () => clearTimeout(timeout);
    }, [riskMode, simulate]);

    return {
        riskMode,
        setRiskMode,
        metrics,
        isSimulating
    };
};

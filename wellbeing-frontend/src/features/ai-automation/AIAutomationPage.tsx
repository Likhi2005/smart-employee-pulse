import React, { useState } from 'react';
import { PriorityActionsPanel } from './components/PriorityActionsPanel';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { SmartActionsPanel } from './components/SmartActionsPanel';
import { TeamSnapshot } from './components/TeamSnapshot';
import { SimulationSlider } from './components/SimulationSlider';
import { DecisionDrawer } from './components/DecisionDrawer';
import { useAIActions } from './hooks/useAIActions';
import { useSimulation } from './hooks/useSimulation';
import { Brain } from 'lucide-react';

export const AIAutomationPage: React.FC = () => {
    const { 
        conflicts, 
        loadingConflicts, 
        applyFix, 
        isApplying, 
        decisionTrace, 
        fetchDecisionTrace, 
        loadingTrace,
        setDecisionTrace,
        insights,
        loadingInsights
    } = useAIActions();

    const { riskMode, setRiskMode, metrics, isSimulating } = useSimulation();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleWhy = async (id: string) => {
        setIsDrawerOpen(true);
        await fetchDecisionTrace(id);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setDecisionTrace(null), 300); // Clear after animation
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Brain className="w-8 h-8 text-amber-500" />
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                                AI Decision Center
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm ml-14">
                            Real-time intelligence and execution control
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Engine Active
                        </span>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Left Column: Priority Actions */}
                    <div className="xl:col-span-8 space-y-8">
                        <section>
                            <PriorityActionsPanel
                                conflicts={conflicts}
                                loading={loadingConflicts}
                                onApply={(conflict) => applyFix(conflict)}
                                onWhy={handleWhy}
                                isApplying={isApplying}
                            />
                        </section>
                        
                        <section className="pt-6 border-t border-gray-800">
                            <h2 className="text-xl font-bold text-gray-100 mb-6">Execution & Insights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SmartActionsPanel />
                                <AIInsightsPanel insights={insights} loading={loadingInsights} />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Context & Controls */}
                    <div className="xl:col-span-4 space-y-6">
                        <TeamSnapshot metrics={metrics} />
                        <SimulationSlider 
                            riskMode={riskMode} 
                            onChange={setRiskMode} 
                            isSimulating={isSimulating}
                        />
                    </div>
                </div>
            </div>

            {/* Decision Trace Drawer */}
            <DecisionDrawer 
                isOpen={isDrawerOpen} 
                onClose={handleCloseDrawer} 
                trace={decisionTrace} 
                loading={loadingTrace} 
            />
        </div>
    );
};

export default AIAutomationPage;

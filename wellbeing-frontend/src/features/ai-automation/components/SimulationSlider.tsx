import React from 'react';
import { Sliders } from 'lucide-react';

interface SimulationSliderProps {
    riskMode: string;
    onChange: (mode: string) => void;
    isSimulating: boolean;
}

const MODES = ['Conservative', 'Balanced', 'Aggressive'];

export const SimulationSlider: React.FC<SimulationSliderProps> = ({ riskMode, onChange, isSimulating }) => {
    return (
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-100">Simulation Engine</h3>
                </div>
                {isSimulating && <span className="text-xs text-blue-400 animate-pulse">Simulating...</span>}
            </div>

            <div className="relative pt-6 pb-2">
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={MODES.indexOf(riskMode)}
                    onChange={(e) => onChange(MODES[parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    {MODES.map((mode, index) => (
                        <span 
                            key={mode}
                            className={`cursor-pointer ${riskMode === mode ? 'text-blue-400 font-medium' : ''}`}
                            onClick={() => onChange(mode)}
                        >
                            {mode}
                        </span>
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
                Adjust the risk tolerance to see predictive changes in workload and assignment strategy.
            </p>
        </div>
    );
};

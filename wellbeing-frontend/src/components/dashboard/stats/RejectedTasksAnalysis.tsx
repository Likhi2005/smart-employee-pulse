import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { rejectionReasons } from '@/data/managerStatsData';

export function RejectedTasksAnalysis() {
    const totalRejected = rejectionReasons.reduce((sum, r) => sum + r.count, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-lg border border-red-500/20 bg-gradient-to-br from-red-500/10 to-black/50 p-6 backdrop-blur-sm"
        >
            <div className="mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-neutral-50">Rejected Tasks Analysis</h3>
            </div>

            <div className="mb-6 rounded-lg bg-red-500/5 p-4 text-center border border-red-500/20">
                <p className="text-xs text-red-300">TOTAL REJECTIONS THIS MONTH</p>
                <p className="mt-2 text-3xl font-bold text-red-400">{totalRejected}</p>
            </div>

            <div className="space-y-3">
                {rejectionReasons.map((reason, idx) => {
                    const percentage = (reason.count / totalRejected) * 100;
                    return (
                        <motion.div
                            key={reason.reason}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm text-neutral-300">{reason.reason}</p>
                                <span className="text-xs font-semibold text-red-400">{reason.count}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    className="h-full rounded-full bg-red-500"
                                ></motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
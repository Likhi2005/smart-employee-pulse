import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trendData } from '@/data/managerStatsData';

export function TrendChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm col-span-2"
        >
            <h3 className="mb-6 text-lg font-semibold text-neutral-50">Task Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="day" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="assigned"
                        stroke="#3b82f6"
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Tasks Assigned"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Tasks Completed"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
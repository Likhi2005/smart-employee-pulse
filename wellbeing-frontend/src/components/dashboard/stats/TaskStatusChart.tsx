import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { taskStatusData } from '@/data/managerStatsData';

export function TaskStatusChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <h3 className="mb-6 text-lg font-semibold text-neutral-50">Task Status Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
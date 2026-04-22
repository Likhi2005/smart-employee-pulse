import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { SummaryCard } from '../stats/SummaryCard';
import { WorkloadChart } from '../stats/WorkloadChart';
import { TaskStatusChart } from '../stats/TaskStatusChart';
import { EmployeesList } from '../stats/EmployeesList';

export function ManagerOverviewTab() {
    // TODO: Replace mock data with real API calls
    const summaryStats = {
        totalEmployees: 6,
        activeTasks: 205,
        completedTasks: 145,
        overloadedEmployees: 2,
        availableEmployees: 2,
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-neutral-50">Manager Dashboard</h1>
                <p className="mt-2 text-neutral-400">Real-time overview of team performance and workload</p>
            </motion.div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <SummaryCard
                    title="Total Employees"
                    value={summaryStats.totalEmployees}
                    icon={Users}
                    variant="default"
                    index={0}
                />
                <SummaryCard
                    title="Active Tasks"
                    value={summaryStats.activeTasks}
                    icon={Clock}
                    variant="warning"
                    index={1}
                    trend={{ value: 12, isPositive: true }}
                />
                <SummaryCard
                    title="Completed Tasks"
                    value={summaryStats.completedTasks}
                    icon={CheckCircle}
                    variant="success"
                    index={2}
                    trend={{ value: 8, isPositive: true }}
                />
                <SummaryCard
                    title="Overloaded"
                    value={summaryStats.overloadedEmployees}
                    icon={AlertCircle}
                    variant="danger"
                    index={3}
                    trend={{ value: 2, isPositive: false }}
                />
                <SummaryCard
                    title="Available"
                    value={summaryStats.availableEmployees}
                    icon={TrendingUp}
                    variant="success"
                    index={4}
                    trend={{ value: 5, isPositive: true }}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <WorkloadChart />
                <TaskStatusChart />
            </div>

            {/* Employees Lists */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <EmployeesList type="overloaded" />
                <EmployeesList type="available" />
            </div>
        </div>
    );
}
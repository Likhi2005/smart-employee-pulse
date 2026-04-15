import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { ManagerLayout } from '@/components/layouts/ManagerLayout';
import { SummaryCard } from '@/components/dashboard/stats/SummaryCard';
import { WorkloadChart } from '@/components/dashboard/stats/WorkloadChart';
import { TaskStatusChart } from '@/components/dashboard/stats/TaskStatusChart';
import { EmployeesList } from '@/components/dashboard/stats/EmployeesList';
import { SuggestionCard } from '@/components/dashboard/stats/SuggestionCard';
import { TrendChart } from '@/components/dashboard/stats/TrendChart';
import { RejectedTasksAnalysis } from '@/components/dashboard/stats/RejectedTasksAnalysis';
import { StatsFilters } from '@/components/dashboard/stats/StatsFilters';
import { summaryStats } from '@/data/managerStatsData';

export default function StatsPage() {
    return (
        <ManagerLayout>
            <div className="space-y-6 p-6">
                {/* Page Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-neutral-50">Manager Statistics</h1>
                    <p className="mt-2 text-neutral-400">Track workload, performance, and task distribution</p>
                </motion.div>

                {/* Filters */}
                <StatsFilters />

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

                {/* Suggestion & Trend */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <SuggestionCard />
                    <div className="lg:col-span-2">
                        <TrendChart />
                    </div>
                </div>

                {/* Rejected Tasks */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <RejectedTasksAnalysis />
                </div>
            </div>
        </ManagerLayout>
    );
}
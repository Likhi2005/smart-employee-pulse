import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { SummaryCard } from '../stats/SummaryCard';
import { WorkloadChart } from '../stats/WorkloadChart';
import { TaskStatusChart } from '../stats/TaskStatusChart';
import { EmployeesList } from '../stats/EmployeesList';
import { getManagerDashboard, type ManagerDashboard } from '@/services/dashboardService';

export function ManagerOverviewTab() {
    const [data, setData] = useState<ManagerDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const dashboardData = await getManagerDashboard();
                setData(dashboardData);
            } catch (err: any) {
                console.error('Failed to fetch manager dashboard:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const summaryStats = data ? {
        totalEmployees: data.teamStats.totalEmployees,
        activeTasks: data.taskStats.accepted + data.taskStats.pending,
        completedTasks: data.taskStats.completed,
        overloadedEmployees: data.teamWorkload.filter(e => e.currentWorkload >= 35).length,
        availableEmployees: data.teamWorkload.filter(e => e.currentWorkload < 15).length,
    } : {
        totalEmployees: 0,
        activeTasks: 0,
        completedTasks: 0,
        overloadedEmployees: 0,
        availableEmployees: 0,
    };

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-neutral-400 font-medium">Syncing team intelligence...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-6">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <h3 className="text-lg font-semibold text-red-400">Error Loading Dashboard</h3>
                <p className="text-red-400/80 mt-1">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );

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
                <WorkloadChart teamWorkload={data.teamWorkload} />
                <TaskStatusChart taskStats={data.taskStats} />
            </div>

            {/* Employees Lists */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <EmployeesList 
                    type="overloaded" 
                    teamWorkload={data.teamWorkload} 
                />
                <EmployeesList 
                    type="available" 
                    teamWorkload={data.teamWorkload} 
                />
            </div>
        </div>
    );
}
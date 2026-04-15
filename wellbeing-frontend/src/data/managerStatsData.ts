export interface Employee {
    id: string;
    name: string;
    avatar: string;
    taskCount: number;
    completedTasks: number;
    workloadLevel: 'low' | 'medium' | 'high' | 'critical';
    status: 'available' | 'busy' | 'offline';
    productivityScore: number;
}

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed' | 'rejected';
    assignedTo: string;
    dueDate: string;
}

export const employeesData: Employee[] = [
    {
        id: '1',
        name: 'Arjun Kumar',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun',
        taskCount: 3,
        completedTasks: 15,
        workloadLevel: 'low',
        status: 'available',
        productivityScore: 92,
    },
    {
        id: '2',
        name: 'Priya Singh',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
        taskCount: 8,
        completedTasks: 42,
        workloadLevel: 'high',
        status: 'busy',
        productivityScore: 88,
    },
    {
        id: '3',
        name: 'Rahul Patel',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rahul',
        taskCount: 12,
        completedTasks: 35,
        workloadLevel: 'critical',
        status: 'busy',
        productivityScore: 75,
    },
    {
        id: '4',
        name: 'Neha Gupta',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Neha',
        taskCount: 5,
        completedTasks: 28,
        workloadLevel: 'medium',
        status: 'available',
        productivityScore: 85,
    },
    {
        id: '5',
        name: 'Vikram Sharma',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram',
        taskCount: 2,
        completedTasks: 22,
        workloadLevel: 'low',
        status: 'available',
        productivityScore: 96,
    },
    {
        id: '6',
        name: 'Anjali Verma',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Anjali',
        taskCount: 11,
        completedTasks: 48,
        workloadLevel: 'critical',
        status: 'busy',
        productivityScore: 82,
    },
];

export const taskStatusData = [
    { name: 'Completed', value: 145, color: '#10b981' },
    { name: 'In Progress', value: 38, color: '#3b82f6' },
    { name: 'Pending', value: 22, color: '#f59e0b' },
    { name: 'Rejected', value: 5, color: '#ef4444' },
];

export const workloadChartData = employeesData.map((emp) => ({
    name: emp.name,
    tasks: emp.taskCount,
    completed: emp.completedTasks,
    workloadLevel: emp.workloadLevel,
}));

export const trendData = [
    { day: 'Mon', assigned: 12, completed: 8 },
    { day: 'Tue', assigned: 19, completed: 15 },
    { day: 'Wed', assigned: 15, completed: 12 },
    { day: 'Thu', assigned: 22, completed: 18 },
    { day: 'Fri', assigned: 18, completed: 14 },
    { day: 'Sat', assigned: 8, completed: 7 },
    { day: 'Sun', assigned: 5, completed: 5 },
];

export const rejectionReasons = [
    { reason: 'Incomplete Requirements', count: 2 },
    { reason: 'Deadline Missed', count: 1 },
    { reason: 'Quality Issues', count: 1 },
    { reason: 'Resource Constraint', count: 1 },
];

export const summaryStats = {
    totalEmployees: employeesData.length,
    activeTasks: 205,
    completedTasks: 145,
    overloadedEmployees: employeesData.filter((e) => e.workloadLevel === 'critical').length,
    availableEmployees: employeesData.filter((e) => e.workloadLevel === 'low').length,
};

export const suggestedEmployee = {
    id: '1',
    name: 'Arjun Kumar',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun',
    reason: 'Low workload (3 tasks) and high productivity (92%)',
    workloadLevel: 'low' as const,
};
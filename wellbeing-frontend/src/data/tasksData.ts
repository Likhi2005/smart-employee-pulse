export interface Task {
    id: string;
    title: string;
    description: string;
    effort: number; // in hours
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
    assignedBy: string; // manager name
    assignedTo?: string; // employee id
    assignedToName?: string; // employee name
    dueDate: string; // ISO date
    isMandatory: boolean;
    createdAt: string;
    completedAt?: string;
}

export const tasksData: Task[] = [
    {
        id: 'task-001',
        title: 'Fix login bug in authentication flow',
        description:
            'Users are unable to login with their email. Need to debug and fix the issue.',
        effort: 5,
        priority: 'high',
        status: 'pending',
        assignedBy: 'Manager',
        dueDate: '2024-11-20',
        isMandatory: true,
        createdAt: '2024-11-08',
    },
    {
        id: 'task-002',
        title: 'Update API documentation',
        description:
            'Document new endpoints and update the existing API docs for v2.',
        effort: 3,
        priority: 'low',
        status: 'pending',
        assignedBy: 'Manager',
        dueDate: '2024-11-25',
        isMandatory: false,
        createdAt: '2024-11-08',
    },
    {
        id: 'task-003',
        title: 'Optimize database queries',
        description:
            'Several queries are running slow. Optimize them for better performance.',
        effort: 8,
        priority: 'high',
        status: 'pending',
        assignedBy: 'Manager',
        dueDate: '2024-11-22',
        isMandatory: false,
        createdAt: '2024-11-08',
    },
    {
        id: 'task-004',
        title: 'Design dashboard mockups',
        description: 'Create high-fidelity mockups for the new manager dashboard.',
        effort: 6,
        priority: 'medium',
        status: 'assigned',
        assignedBy: 'Manager',
        assignedToName: 'Arjun Kumar',
        dueDate: '2024-11-18',
        isMandatory: false,
        createdAt: '2024-11-07',
    },
    {
        id: 'task-005',
        title: 'Implement notification system',
        description:
            'Build real-time notification system for task assignments and updates.',
        effort: 7,
        priority: 'high',
        status: 'assigned',
        assignedBy: 'Manager',
        assignedToName: 'Priya Singh',
        dueDate: '2024-11-21',
        isMandatory: true,
        createdAt: '2024-11-06',
    },
    {
        id: 'task-006',
        title: 'Write unit tests for auth module',
        description:
            'Achieve 80% code coverage for authentication module with unit tests.',
        effort: 4,
        priority: 'medium',
        status: 'assigned',
        assignedBy: 'Manager',
        assignedToName: 'Rahul Patel',
        dueDate: '2024-11-19',
        isMandatory: false,
        createdAt: '2024-11-08',
    },
    {
        id: 'task-007',
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        effort: 6,
        priority: 'medium',
        status: 'completed',
        assignedBy: 'Manager',
        assignedToName: 'Arjun Kumar',
        dueDate: '2024-11-10',
        isMandatory: false,
        createdAt: '2024-10-28',
        completedAt: '2024-11-05',
    },
    {
        id: 'task-008',
        title: 'Review code quality metrics',
        description: 'Analyze code quality reports and identify areas for improvement.',
        effort: 2,
        priority: 'low',
        status: 'rejected',
        assignedBy: 'Manager',
        assignedToName: 'Priya Singh',
        dueDate: '2024-11-12',
        isMandatory: false,
        createdAt: '2024-11-05',
    },
];
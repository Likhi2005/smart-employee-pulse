'use client';

import { useState, useEffect } from 'react';
import { WorkloadSnapshot, Task } from '@/types/tasks';
import { workloadEngine } from '@/services/workloadEngine';
import { useTaskManagement } from './useTaskManagement';

// Mock employee data for now - replace with API call
const MOCK_EMPLOYEES = [
    { id: 'emp-001', name: 'Arjun Kumar', avatar: 'https://i.pravatar.cc/150?u=arjun' },
    { id: 'emp-002', name: 'Priya Singh', avatar: 'https://i.pravatar.cc/150?u=priya' },
    { id: 'emp-003', name: 'Rahul Patel', avatar: 'https://i.pravatar.cc/150?u=rahul' }
];

export const useWorkloadCalculation = () => {
    const { tasks } = useTaskManagement();
    const [employeeSnapshots, setEmployeeSnapshots] = useState<Map<string, WorkloadSnapshot>>(new Map());
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        setIsCalculating(true);

        // Calculate workload for each employee
        const snapshots = new Map<string, WorkloadSnapshot>();

        MOCK_EMPLOYEES.forEach(employee => {
            // Get tasks assigned to this employee
            const employeeTasks = tasks.filter(t => t.assignedTo === employee.id);

            // Calculate workload
            const snapshot = workloadEngine.calculateWorkload(
                employee.id,
                employee.name,
                employeeTasks,
                employee.avatar
            );

            snapshots.set(employee.id, snapshot);
        });

        setEmployeeSnapshots(snapshots);
        setIsCalculating(false);
    }, [tasks]);

    return {
        employeeSnapshots,
        isCalculating,
        employees: MOCK_EMPLOYEES
    };
};
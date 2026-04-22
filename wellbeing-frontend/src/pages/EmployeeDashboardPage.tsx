import { EmployeeLayout } from '@/components/layouts/EmployeeLayout'
import { EmployeeDashboard } from '@/components/dashboard/employee/EmployeeDashboard'

export default function EmployeeDashboardPage() {
    return (
        <EmployeeLayout>
            <EmployeeDashboard />
        </EmployeeLayout>
    )
}
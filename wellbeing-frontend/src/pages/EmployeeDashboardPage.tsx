import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmployeeLayout } from '@/components/layouts/EmployeeLayout'
import { EmployeeDashboardShell, type EmployeeDashboardSection } from '@/components/dashboard/employee/EmployeeDashboardShell'

const VALID_SECTIONS: EmployeeDashboardSection[] = ['focus', 'pipeline', 'signals', 'insights']

export default function EmployeeDashboardPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const sectionParam = (searchParams.get('section') || 'focus').toLowerCase()

    const section = useMemo<EmployeeDashboardSection>(() => {
        if (VALID_SECTIONS.includes(sectionParam as EmployeeDashboardSection)) {
            return sectionParam as EmployeeDashboardSection
        }
        return 'focus'
    }, [sectionParam])

    const onSectionChange = (next: EmployeeDashboardSection) => {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('section', next)
        setSearchParams(nextParams, { replace: true })
    }

    return (
        <EmployeeLayout>
            <EmployeeDashboardShell section={section} onSectionChange={onSectionChange} />
        </EmployeeLayout>
    )
}
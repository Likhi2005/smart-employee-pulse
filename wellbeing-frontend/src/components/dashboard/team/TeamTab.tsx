import React, { useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'
import { CreateEmployeeForm } from './CreateEmployeeForm'
import { EmployeeList } from './EmployeeList'
import { EmployeeDetailsDrawer } from './EmployeeDetailsDrawer'
import { BulkImportPanel } from './BulkImportPanel'
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog'

type ActivePanel = 'create' | 'edit' | null

interface EditEmployeeData {
    fullName: string
    email: string
    department: string
}

export const TeamTab = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [activePanel, setActivePanel] = useState<ActivePanel>(null)

    const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(null)
    const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null)
    const [editData, setEditData] = useState<EditEmployeeData | null>(null)
    const [isPreparingEdit, setIsPreparingEdit] = useState(false)
    const [editError, setEditError] = useState('')

    const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    const resetFormState = () => {
        setIsCreateOpen(false)
        setActivePanel(null)
        setEditEmployeeId(null)
        setEditData(null)
        setIsPreparingEdit(false)
        setEditError('')
    }

    const handleCreatedOrUpdated = () => {
        resetFormState()
        handleRefresh()
    }

    const handleCreateOpen = () => {
        setViewEmployeeId(null)
        setEditEmployeeId(null)
        setEditData(null)
        setEditError('')
        setActivePanel('create')
        setIsCreateOpen(true)
    }

    const handleEdit = async (employeeId: string) => {
        setViewEmployeeId(null)
        setEditError('')
        setIsPreparingEdit(true)

        try {
            const response = await api.get('/employees/' + employeeId)
            const employee = response.data?.data

            setEditEmployeeId(employeeId)
            setEditData({
                fullName: employee?.fullName || '',
                email: employee?.email || '',
                department: employee?.department || 'Not specified',
            })

            setActivePanel('edit')
            setIsCreateOpen(true)
        } catch (err: any) {
            setEditError(err?.response?.data?.message || 'Failed to load employee details for editing')
            setActivePanel(null)
            setIsCreateOpen(false)
        } finally {
            setIsPreparingEdit(false)
        }
    }

    const handleView = (employeeId: string) => {
        resetFormState()
        setViewEmployeeId(employeeId)
    }

    const handleDeleteSuccess = () => {
        setDeleteEmployeeId(null)
        handleRefresh()
    }

    return (
        <div className="pt-6 pb-8 space-y-8">
            <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-50">Team Management</h2>
                        <p className="mt-1 text-sm text-neutral-400">
                            Create, manage, import, and review employee accounts.
                        </p>
                    </div>

                    {!isCreateOpen && (
                        <motion.button
                            onClick={handleCreateOpen}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-fit rounded-lg bg-amber-700 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-800"
                        >
                            + Create Employee
                        </motion.button>
                    )}
                </div>

                <div className="mt-5">
                    {isPreparingEdit && (
                        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-300">
                            Loading employee details...
                        </div>
                    )}

                    {editError && (
                        <div className="mb-4 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                            {editError}
                        </div>
                    )}

                    {isCreateOpen ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.25 }}
                        >
                            <CreateEmployeeForm
                                mode={activePanel === 'edit' ? 'edit' : 'create'}
                                employeeId={editEmployeeId}
                                initialData={editData}
                                onCancel={resetFormState}
                                onSuccess={handleCreatedOrUpdated}
                            />
                        </motion.div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900/40 px-4 py-5 text-sm text-neutral-400">
                            Click Create Employee to open the employee creation form.
                        </div>
                    )}
                </div>
            </section>

            <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 md:p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-neutral-50">Employees</h3>
                    <p className="mt-1 text-sm text-neutral-400">
                        Search, filter, export, edit, and delete employees.
                    </p>
                </div>

                <EmployeeList
                    key={refreshKey}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(employeeId) => setDeleteEmployeeId(employeeId)}
                />
            </section>

            <BulkImportPanel onSuccess={handleRefresh} />

            <EmployeeDetailsDrawer
                employeeId={viewEmployeeId}
                onClose={() => setViewEmployeeId(null)}
            />

            <DeleteEmployeeDialog
                employeeId={deleteEmployeeId}
                open={Boolean(deleteEmployeeId)}
                onClose={() => setDeleteEmployeeId(null)}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    )
}
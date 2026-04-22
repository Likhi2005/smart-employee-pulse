import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'

interface DeleteEmployeeDialogProps {
    employeeId: string | null
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({
    employeeId,
    open,
    onClose,
    onSuccess,
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            setError('')
            setIsDeleting(false)
        }
    }, [open])

    const handleDelete = async () => {
        if (!employeeId) return

        setIsDeleting(true)
        setError('')

        try {
            await api.delete('/employees/' + employeeId)
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to delete employee')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-red-900/20">
                                    <AlertTriangle className="text-red-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-50">
                                        Delete employee
                                    </h3>
                                    <p className="mt-1 text-sm text-neutral-400">
                                        This will deactivate the employee account. The record will remain in the system.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md p-1 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="text-neutral-300 hover:text-neutral-50"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleDelete}
                                isLoading={isDeleting}
                                className="bg-red-700 hover:bg-red-800 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
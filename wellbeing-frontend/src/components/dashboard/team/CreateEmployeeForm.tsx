import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Copy, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/services/api'

interface CreateEmployeeFormProps {
    onCancel: () => void
    onSuccess: () => void
    mode?: 'create' | 'edit'
    employeeId?: string | null
    initialData?: FormData | null
}

interface FormData {
    fullName: string
    email: string
    department: string
    skills: string
}

interface CreateResponse {
    employee: {
        id: string
        fullName: string
        email: string
        department: string
        role?: string
        isActive?: boolean
        isPasswordChanged?: boolean
    }
    tempPassword: string
}

export const CreateEmployeeForm: React.FC<CreateEmployeeFormProps> = ({
    onCancel,
    onSuccess,
    mode = 'create',
    employeeId = null,
    initialData = null,
}) => {
    const isEditMode = mode === 'edit'

    const [step, setStep] = useState<'form' | 'success'>('form')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [copiedPassword, setCopiedPassword] = useState(false)
    const [tempPassword, setTempPassword] = useState('')
    const [error, setError] = useState('')
    const [tempFormData, setTempFormData] = useState<FormData | null>(null)

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        department: 'Not specified',
        skills: '',
    })

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                fullName: initialData.fullName || '',
                email: initialData.email || '',
                department: initialData.department || 'Not specified',
                skills: (initialData as any).skills?.join(', ') || '',
            })
            setStep('form')
            setError('')
            setTempPassword('')
            setTempFormData(null)
        }

        if (!isEditMode && !initialData) {
            setFormData({
                fullName: '',
                email: '',
                department: 'Not specified',
                skills: '',
            })
            setStep('form')
            setError('')
        }
    }, [isEditMode, initialData])

    const departments = [
        'Not specified',
        'Engineering',
        'Product',
        'Design',
        'Marketing',
        'Sales',
        'HR',
        'Finance',
        'Operations',
        'Other',
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.fullName.trim()) {
            setError('Full name is required')
            return
        }

        if (!isEditMode) {
            if (!formData.email.trim()) {
                setError('Email is required')
                return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setError('Please enter a valid email')
                return
            }
        }

        setIsLoading(true)
        try {
            const skillsArray = formData.skills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)

            if (isEditMode) {
                if (!employeeId) {
                    setError('Employee id is missing for update')
                    return
                }

                await api.put('/employees/' + employeeId, {
                    fullName: formData.fullName.trim(),
                    department: formData.department,
                    skills: skillsArray,
                })

                onSuccess()
                return
            }

            const response = await api.post('/employees', {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                department: formData.department,
                skills: skillsArray,
            })

            const payload = response.data as {
                success: boolean
                message: string
                data: CreateResponse
            }

            setTempPassword(payload.data.tempPassword)
            setTempFormData({
                fullName: payload.data.employee.fullName,
                email: payload.data.employee.email,
                department: payload.data.employee.department,
            })
            setStep('success')
        } catch (err: any) {
            setError(err?.response?.data?.message || (isEditMode ? 'Failed to update employee' : 'Failed to create employee'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(tempPassword)
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
    }

    const handleDone = () => {
        setStep('form')
        setFormData({ fullName: '', email: '', department: 'Not specified', skills: '' })
        setTempPassword('')
        onSuccess()
    }

    const maskedPassword = tempPassword
        ? '•'.repeat(tempPassword.length)
        : 'Temporary password unavailable'

    if (!isEditMode && step === 'success' && tempFormData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-neutral-800 bg-neutral-950 p-8"
            >
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-900/20">
                            <Check className="text-green-400" size={32} />
                        </div>
                    </div>

                    <div className="space-y-2 text-center">
                        <h3 className="text-2xl font-bold text-neutral-50">Employee Created</h3>
                        <p className="text-neutral-400">
                            {tempFormData.fullName} has been added to your team.
                        </p>
                    </div>

                    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="mb-1 text-sm text-neutral-400">Name</p>
                                <p className="font-medium text-neutral-50">{tempFormData.fullName}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-neutral-400">Email</p>
                                <p className="font-medium text-neutral-50">{tempFormData.email}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="mb-1 text-sm text-neutral-400">Department</p>
                                <p className="font-medium text-neutral-50">{tempFormData.department}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-amber-800/40 bg-neutral-900 p-6">
                        <div>
                            <p className="mb-3 text-sm font-semibold text-amber-400">Temporary Password</p>
                            <p className="mb-3 text-xs text-neutral-400">
                                Share this with the employee. They must change it on first login.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3">
                                    <span className="font-mono text-neutral-50">
                                        {showPassword ? tempPassword : maskedPassword}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-neutral-400 hover:text-neutral-200"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <motion.button
                                type="button"
                                onClick={handleCopyPassword}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-lg bg-amber-700 p-3 text-white transition-colors hover:bg-amber-800"
                            >
                                {copiedPassword ? <Check size={18} /> : <Copy size={18} />}
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleDone}
                            className="bg-amber-700 px-6 py-2 text-white hover:bg-amber-800"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-8"
        >
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h3 className="mb-2 text-2xl font-bold text-neutral-50">
                        {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                    <p className="text-sm text-neutral-400">
                        {isEditMode
                            ? 'Update employee details. Email is locked and cannot be changed.'
                            : 'Create a new employee account. They will receive a temporary password and must change it on first login.'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-red-800/50 bg-red-900/20 p-4"
                    >
                        <span className="text-sm text-red-400">{error}</span>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        label="First Name"
                        name="firstName"
                        placeholder="Emma"
                        value={formData.fullName.split(' ')[0] || ''}
                        onChange={(e) => {
                            const chunks = formData.fullName.trim().split(' ').filter(Boolean)
                            const lastName = chunks.slice(1).join(' ')
                            setFormData((prev) => ({
                                ...prev,
                                fullName: lastName ? `${e.target.value} ${lastName}` : e.target.value,
                            }))
                        }}
                        required
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        placeholder="Crown"
                        value={formData.fullName.trim().split(' ').slice(1).join(' ')}
                        onChange={(e) => {
                            const firstName = formData.fullName.trim().split(' ')[0] || ''
                            setFormData((prev) => ({
                                ...prev,
                                fullName: firstName ? `${firstName} ${e.target.value}` : e.target.value,
                            }))
                        }}
                        required
                    />
                </div>

                <Input
                    label="Work Email"
                    name="email"
                    type="email"
                    placeholder="emma@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isEditMode}
                    helperText={isEditMode ? 'Email cannot be changed after account creation.' : undefined}
                />

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                        Department <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                        Skills <span className="text-neutral-500 text-xs font-normal">(comma-separated)</span>
                    </label>
                    <input
                        type="text"
                        name="skills"
                        placeholder="e.g. React, Node.js, TypeScript, AWS"
                        value={formData.skills}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Enter multiple skills separated by commas</p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-neutral-50"
                    >
                        <X size={14} />
                        <span className="text-sm">Cancel</span>
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex min-w-[150px] items-center justify-center rounded-lg bg-amber-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading
                            ? isEditMode
                                ? 'Updating...'
                                : 'Creating...'
                            : isEditMode
                                ? 'Update Employee'
                                : 'Create Employee'}
                    </button>
                </div>
            </form>
        </motion.div>
    )
}
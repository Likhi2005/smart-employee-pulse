import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/Button'

interface BulkImportPanelProps {
    onSuccess?: () => void
}

interface ImportReport {
    total: number
    inserted: number
    failed: number
    failedRecords?: Array<{
        row: number
        email?: string | null
        errors: string[]
    }>
}

export const BulkImportPanel: React.FC<BulkImportPanelProps> = ({ onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [report, setReport] = useState<ImportReport | null>(null)

    const escapeCsvValue = (value: string) => {
        const normalized = value.replace(/"/g, '""')
        return `"${normalized}"`
    }

    const handleDownloadTemplate = () => {
        const headers = ['fullName', 'email', 'department']
        const sampleRows = [
            ['Emma Crown', 'emma.crown@company.com', 'Engineering'],
            ['Liam Stone', 'liam.stone@company.com', 'Product'],
            ['Ava Green', 'ava.green@company.com', 'HR'],
        ]

        const csvLines = [headers, ...sampleRows]
            .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
            .join('\n')

        const blob = new Blob(['\uFEFF' + csvLines], {
            type: 'text/csv;charset=utf-8;',
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'employees-import-template.csv'
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setReport(null)

        if (!file) {
            setError('Please select a CSV or JSON file')
            return
        }

        const fileName = file.name.toLowerCase()
        const isValidType =
            file.type.includes('csv') ||
            file.type.includes('json') ||
            fileName.endsWith('.csv') ||
            fileName.endsWith('.json')

        if (!isValidType) {
            setError('Only CSV or JSON files are supported')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setIsUploading(true)
        try {
            const response = await api.post('/employees/bulk-import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            const data = response.data?.data as ImportReport
            setReport(data)
            onSuccess?.()
            setFile(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Bulk import failed')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-xl font-semibold text-neutral-50">Bulk Import</h3>
                    <p className="mt-1 text-sm text-neutral-400">
                        Upload CSV or JSON to add multiple employees.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
                    >
                        <Download size={16} />
                        Download Template
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
                    >
                        {isOpen ? 'Close' : 'Open'}
                    </button>
                </div>
            </div>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                    className="mt-5 space-y-4"
                >
                    <form onSubmit={handleUpload} className="space-y-4">
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-4 py-8 text-center transition-colors hover:bg-neutral-900">
                            <Upload className="text-neutral-400" size={24} />
                            <span className="mt-3 text-sm font-medium text-neutral-200">
                                Choose CSV or JSON file
                            </span>
                            <span className="mt-1 text-xs text-neutral-500">
                                File should contain fullName, email, department
                            </span>
                            <input
                                type="file"
                                accept=".csv,.json"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </label>

                        {file && (
                            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
                                <FileText size={16} className="text-neutral-400" />
                                {file.name}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                isLoading={isUploading}
                                className="bg-amber-700 text-white hover:bg-amber-800"
                            >
                                Import Employees
                            </Button>

                            <button
                                type="button"
                                onClick={() => {
                                    setFile(null)
                                    setError('')
                                    setReport(null)
                                }}
                                className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    {report && (
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-green-400" size={18} />
                                <h4 className="text-sm font-semibold text-neutral-50">Import Report</h4>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <ReportCard label="Total" value={report.total} />
                                <ReportCard label="Inserted" value={report.inserted} accent="text-green-400" />
                                <ReportCard label="Failed" value={report.failed} accent="text-red-400" />
                            </div>

                            {report.failedRecords && report.failedRecords.length > 0 && (
                                <div className="mt-5 space-y-2">
                                    <h5 className="text-sm font-medium text-neutral-200">Failed rows</h5>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                        {report.failedRecords.map((row) => (
                                            <div
                                                key={`${row.row}-${row.email || 'unknown'}`}
                                                className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span>Row {row.row}</span>
                                                    <span className="text-neutral-500">{row.email || 'No email'}</span>
                                                </div>
                                                <p className="mt-1 text-xs text-red-300">{row.errors.join(', ')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </section>
    )
}

const ReportCard = ({
    label,
    value,
    accent,
}: {
    label: string
    value: number
    accent?: string
}) => {
    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
            <p className={`mt-1 text-xl font-bold ${accent || 'text-neutral-50'}`}>{value}</p>
        </div>
    )
}
export default function Input({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-3 text-gray-400">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}
export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}) {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2'

    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105',
        secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:scale-105',
        accent: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
        ghost: 'text-gray-700 hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    }

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    }

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
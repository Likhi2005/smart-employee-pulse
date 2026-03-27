export default function Card({ children, className = '', elevated = false }) {
    return (
        <div className={`bg-white rounded-xl p-6 ${elevated ? 'shadow-lg' : 'shadow-md'} hover:shadow-lg transition-shadow duration-300 ${className}`}>
            {children}
        </div>
    )
}
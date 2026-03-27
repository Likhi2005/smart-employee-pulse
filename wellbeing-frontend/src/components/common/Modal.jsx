export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}
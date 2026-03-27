import { Bell, User, LogOut } from 'lucide-react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-lg">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-bold">Pulse</span>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                        alt={user?.name}
                        className="w-6 h-6 rounded-full"
                    />
                    <div>
                        <p className="text-xs text-gray-400">Logged in as</p>
                        <p className="text-sm font-medium text-white">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-red-400"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    )
}
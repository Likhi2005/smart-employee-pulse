import { NavLink } from 'react-router-dom'
import { BarChart3, MessageSquare, Gamepad2, CheckSquare, Settings, LogOut, Home, BarChart2 } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

export default function Sidebar() {
    const { logout, userRole } = useContext(AuthContext)

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/mood-check', label: 'Mood Check', icon: BarChart3 },
        { path: '/weekly-report', label: 'Weekly Report', icon: BarChart2 },
        { path: '/chatbot', label: 'Chat Support', icon: MessageSquare },
        { path: '/games', label: 'Stress Relief', icon: Gamepad2 },
        { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    ]

    if (userRole === 'manager') {
        menuItems.splice(1, 0, { path: '/manager-dashboard', label: 'Team Overview', icon: BarChart2 })
    }

    return (
        <div className="w-64 bg-gradient-to-b from-blue-600 to-purple-600 text-white h-screen sticky top-0 overflow-y-auto">
            <div className="p-6 border-b border-white/20">
                <h1 className="text-2xl font-bold">Pulse</h1>
                <p className="text-sm text-blue-100">Well-Being System</p>
            </div>

            <nav className="p-4 space-y-2">
                {menuItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-white/20' : 'hover:bg-white/10'
                            }`
                        }
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 space-y-2">
                <NavLink
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
                >
                    <span>👤 Profile</span>
                </NavLink>
                <NavLink
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-left"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
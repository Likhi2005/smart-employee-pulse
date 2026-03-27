import { Outlet, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { AuthContext } from '../context/AuthContext'

export default function MainLayout() {
    const { userRole } = useContext(AuthContext)
    const location = useLocation()

    // Only show sidebar for manager and admin
    const showSidebar = userRole === 'manager' || userRole === 'admin'

    return (
        <div className={`flex h-screen ${showSidebar ? '' : 'flex-col'}`}>
            {showSidebar && <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className={`flex-1 overflow-y-auto ${showSidebar ? 'bg-gray-50' : 'bg-gray-900'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
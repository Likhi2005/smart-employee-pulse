import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 flex items-center justify-center p-4">
            <Outlet />
        </div>
    )
}
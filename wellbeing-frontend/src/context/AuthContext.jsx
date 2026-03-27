import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [surveyCompletedToday, setSurveyCompletedToday] = useState(false)

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('user')
        const lastSurveyDate = localStorage.getItem('lastSurveyDate')
        const today = new Date().toDateString()

        if (savedUser) {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            setIsAuthenticated(true)
            setUserRole(userData.role)
        }

        // Check if survey was completed today
        if (lastSurveyDate === today) {
            setSurveyCompletedToday(true)
        }
    }, [])

    const login = (userData) => {
        setUser(userData)
        setIsAuthenticated(true)
        setUserRole(userData.role)
        localStorage.setItem('user', JSON.stringify(userData))
        setSurveyCompletedToday(false) // Reset survey for new login
    }

    const logout = () => {
        setUser(null)
        setIsAuthenticated(false)
        setUserRole(null)
        setSurveyCompletedToday(false)
        localStorage.removeItem('user')
        localStorage.removeItem('lastSurveyDate')
    }

    const completeSurvey = () => {
        setSurveyCompletedToday(true)
        localStorage.setItem('lastSurveyDate', new Date().toDateString())
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                userRole,
                login,
                logout,
                surveyCompletedToday,
                completeSurvey,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
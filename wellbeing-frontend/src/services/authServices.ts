import api from './api'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    companyName: string
    industry?: string
    managerName: string
    managerEmail: string
    managerPassword: string
}

export interface User {
    id: string
    fullName: string
    email: string
    role: 'manager' | 'employee'
    companyId: string
    companyName?: string
    isPasswordChanged: boolean
}

export interface AuthResponse {
    message: string
    token: string
    user: User
    company?: {
        id: string
        name: string
    }
    tempPassword?: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

class AuthService {
    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', data)
        return response.data
    }

    /**
     * Register company
     */
    async registerCompany(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/company-register', data)
        return response.data
    }

    /**
     * Change password
     */
    async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
        const response = await api.post('/auth/change-password', data)
        return response.data
    }

    /**
     * Get current user
     */
    async getMe(): Promise<{ user: User }> {
        const response = await api.get('/auth/me')
        return response.data
    }

    /**
     * Logout
     */
    logout(): void {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    /**
     * Check if token is valid
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token')
    }

    /**
     * Get token
     */
    getToken(): string | null {
        return localStorage.getItem('token')
    }

    /**
     * Get stored user
     */
    getStoredUser(): User | null {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    }
}

export default new AuthService()
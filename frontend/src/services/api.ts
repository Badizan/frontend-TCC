const API_BASE_URL = 'http://localhost:3333'

class ApiService {
    private token: string | null = null

    constructor() {
        this.token = localStorage.getItem('auth_token')
    }

    setToken(token: string) {
        this.token = token
        localStorage.setItem('auth_token', token)
    }

    clearToken() {
        this.token = null
        localStorage.removeItem('auth_token')
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const headers: Record<string, string> = {
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options.headers,
        }

        // Only set Content-Type if there's a body
        if (options.body) {
            headers['Content-Type'] = 'application/json'
        }

        const config: RequestInit = {
            headers,
            ...options,
        }

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken()
                    window.location.href = '/login'
                    throw new Error('Authentication required')
                }

                const errorData = await response.json().catch(() => ({}))

                // Handle validation errors
                if (errorData.message && Array.isArray(errorData.message)) {
                    const validationErrors = errorData.message.map((err: any) => err.message || err).join(', ')
                    throw new Error(validationErrors)
                }

                // Handle Zod validation errors
                if (typeof errorData.message === 'string' && errorData.message.startsWith('[')) {
                    try {
                        const parsedErrors = JSON.parse(errorData.message)
                        if (Array.isArray(parsedErrors)) {
                            const validationErrors = parsedErrors.map((err: any) => err.message || err).join(', ')
                            throw new Error(validationErrors)
                        }
                    } catch (parseError) {
                        // If parsing fails, use the original message
                    }
                }

                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('API request failed:', error)
            throw error
        }
    }

    // Auth methods
    async login(email: string, password: string) {
        const response = await this.request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })

        this.setToken(response.token)
        return response
    }

    async register(data: { name: string; email: string; password: string; role: string }) {
        const response = await this.request<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        })

        this.setToken(response.token)
        return response
    }

    async getProfile() {
        return this.request<any>('/auth/profile')
    }

    // Vehicle methods
    async getVehicles(ownerId?: string) {
        const query = ownerId ? `?ownerId=${ownerId}` : ''
        return this.request<any[]>(`/vehicles${query}`)
    }

    async getVehicle(id: string) {
        return this.request<any>(`/vehicles/${id}`)
    }

    async createVehicle(data: {
        brand: string
        model: string
        year: number
        licensePlate: string
        type: string
        ownerId: string
    }) {
        console.log('🌐 API: Criando veículo:', data);
        const result = await this.request<any>('/vehicles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        console.log('🌐 API: Veículo criado:', result);
        return result;
    }

    async updateVehicle(id: string, data: Partial<{
        brand: string
        model: string
        year: number
        licensePlate: string
        type: string
    }>) {
        return this.request<any>(`/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteVehicle(id: string) {
        return this.request<any>(`/vehicles/${id}`, {
            method: 'DELETE',
        })
    }

    // Maintenance methods
    async getMaintenances(filters?: {
        vehicleId?: string
        mechanicId?: string
        status?: string
        type?: string
    }) {
        const query = new URLSearchParams()
        if (filters?.vehicleId) query.append('vehicleId', filters.vehicleId)
        if (filters?.mechanicId) query.append('mechanicId', filters.mechanicId)
        if (filters?.status) query.append('status', filters.status)
        if (filters?.type) query.append('type', filters.type)

        const queryString = query.toString()
        return this.request<any[]>(`/maintenances${queryString ? `?${queryString}` : ''}`)
    }

    async getMaintenance(id: string) {
        return this.request<any>(`/maintenances/${id}`)
    }

    async createMaintenance(data: {
        vehicleId: string
        mechanicId: string
        type: string
        description: string
        scheduledDate: string
        cost?: number
        notes?: string
    }) {
        return this.request<any>('/maintenances', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateMaintenance(id: string, data: any) {
        return this.request<any>(`/maintenances/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteMaintenance(id: string) {
        return this.request<any>(`/maintenances/${id}`, {
            method: 'DELETE',
        })
    }

    // Reminder methods
    async getReminders(filters?: { vehicleId?: string; completed?: boolean }) {
        const query = new URLSearchParams()
        if (filters?.vehicleId) query.append('vehicleId', filters.vehicleId)
        if (typeof filters?.completed === 'boolean') query.append('completed', String(filters.completed))

        const queryString = query.toString()
        return this.request<any[]>(`/reminders${queryString ? `?${queryString}` : ''}`)
    }

    async getReminder(id: string) {
        return this.request<any>(`/reminders/${id}`)
    }

    async createReminder(data: {
        vehicleId: string
        description: string
        dueDate: string
    }) {
        return this.request<any>('/reminders', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateReminder(id: string, data: any) {
        return this.request<any>(`/reminders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteReminder(id: string) {
        return this.request<any>(`/reminders/${id}`, {
            method: 'DELETE',
        })
    }

    async completeReminder(id: string) {
        console.log('🌐 API: Completando lembrete:', id);
        const result = await this.request<any>(`/reminders/${id}/complete`, {
            method: 'PATCH',
        });
        console.log('🌐 API: Resposta do servidor:', result);
        return result;
    }

    // Expense methods
    async getExpenses(filters?: {
        vehicleId?: string
        category?: string
        startDate?: string
        endDate?: string
    }) {
        const query = new URLSearchParams()
        if (filters?.vehicleId) query.append('vehicleId', filters.vehicleId)
        if (filters?.category) query.append('category', filters.category)
        if (filters?.startDate) query.append('startDate', filters.startDate)
        if (filters?.endDate) query.append('endDate', filters.endDate)

        const queryString = query.toString()
        return this.request<any[]>(`/expenses${queryString ? `?${queryString}` : ''}`)
    }

    async getExpense(id: string) {
        return this.request<any>(`/expenses/${id}`)
    }

    async createExpense(data: {
        vehicleId: string
        description: string
        category: string
        amount: number
        date: string
    }) {
        return this.request<any>('/expenses', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateExpense(id: string, data: any) {
        return this.request<any>(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteExpense(id: string) {
        return this.request<any>(`/expenses/${id}`, {
            method: 'DELETE',
        })
    }
}

export const apiService = new ApiService()
export default apiService 
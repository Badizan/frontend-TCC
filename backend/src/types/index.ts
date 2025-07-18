import { FastifyRequest } from 'fastify'

export type UserRole = 'ADMIN' | 'OWNER'
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN'
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  type: VehicleType
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Maintenance {
  id: string
  vehicleId: string
  mechanicId: string
  type: MaintenanceType
  status: MaintenanceStatus
  description: string
  scheduledDate: Date
  completedDate?: Date
  cost?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  createdAt: Date
  updatedAt: Date
}

export interface Reminder {
  id: string
  vehicleId: string
  description: string
  dueDate: Date
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id: string
  vehicleId: string
  description: string
  category: string
  amount: number
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthenticatedUser {
  id: string
  role: UserRole
  email?: string
  name?: string
}

// Interfaces para predições
export interface ExpensePrediction {
  predictedAmount: number
  confidenceLevel: number
  factors: string[]
  timeframe: string
  [key: string]: any
}

export interface MaintenancePrediction {
  suggestedDate: Date
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  maintenanceType: string
  estimatedCost: number
  reasons: string[]
  [key: string]: any
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser
  }
} 
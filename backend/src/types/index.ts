import { FastifyRequest } from 'fastify'

export type UserRole = 'ADMIN' | 'MECHANIC' | 'RECEPTIONIST'
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

export interface AuthenticatedUser {
  id: string
  role: UserRole
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser
  }
} 
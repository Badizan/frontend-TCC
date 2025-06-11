import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/user.controller'
import { VehicleController } from '../controllers/vehicle.controller'
import { MaintenanceController } from '../controllers/maintenance.controller'
import { AuthController } from '../controllers/auth.controller'
import { ReminderController } from '../controllers/reminder.controller'
import { ExpenseController } from '../controllers/expense.controller'
import { authMiddleware } from '../middlewares/auth'

const userController = new UserController()
const vehicleController = new VehicleController()
const maintenanceController = new MaintenanceController()
const authController = new AuthController()
const reminderController = new ReminderController()
const expenseController = new ExpenseController()

export async function routes(app: FastifyInstance) {
  // Public routes
  app.get('/', async () => {
    return { message: 'Mechanic Shop API' }
  })

  // Auth routes
  app.post('/auth/register', authController.register.bind(authController))
  app.post('/auth/login', authController.login.bind(authController))
  app.get('/auth/profile', { preHandler: [authMiddleware] }, authController.getProfile.bind(authController))

  // Protected routes
  app.addHook('preHandler', async (request, reply) => {
    // Skip auth for public routes
    if (request.url.startsWith('/auth/')) {
      return
    }
    return authMiddleware(request, reply)
  })

  // User routes
  app.get('/users', userController.findAll.bind(userController))
  app.get('/users/:id', userController.findById.bind(userController))
  app.put('/users/:id', userController.update.bind(userController))
  app.delete('/users/:id', userController.delete.bind(userController))

  // Vehicle routes
  app.post('/vehicles', vehicleController.create.bind(vehicleController))
  app.get('/vehicles', vehicleController.findAll.bind(vehicleController))
  app.get('/vehicles/:id', vehicleController.findById.bind(vehicleController))
  app.put('/vehicles/:id', vehicleController.update.bind(vehicleController))
  app.delete('/vehicles/:id', vehicleController.delete.bind(vehicleController))

  // Maintenance routes
  app.post('/maintenances', maintenanceController.create.bind(maintenanceController))
  app.get('/maintenances', maintenanceController.findAll.bind(maintenanceController))
  app.get('/maintenances/:id', maintenanceController.findById.bind(maintenanceController))
  app.put('/maintenances/:id', maintenanceController.update.bind(maintenanceController))
  app.delete('/maintenances/:id', maintenanceController.delete.bind(maintenanceController))
  app.get('/vehicles/:vehicleId/maintenances', maintenanceController.findByVehicle.bind(maintenanceController))
  app.get('/mechanics/:mechanicId/maintenances', maintenanceController.findByMechanic.bind(maintenanceController))

  // Reminder routes
  app.post('/reminders', reminderController.create.bind(reminderController))
  app.get('/reminders', reminderController.findAll.bind(reminderController))
  app.get('/reminders/:id', reminderController.findById.bind(reminderController))
  app.put('/reminders/:id', reminderController.update.bind(reminderController))
  app.delete('/reminders/:id', reminderController.delete.bind(reminderController))

  // Expense routes
  app.post('/expenses', expenseController.create.bind(expenseController))
  app.get('/expenses', expenseController.findAll.bind(expenseController))
  app.get('/expenses/:id', expenseController.findById.bind(expenseController))
  app.put('/expenses/:id', expenseController.update.bind(expenseController))
  app.delete('/expenses/:id', expenseController.delete.bind(expenseController))

  // Dashboard routes
  app.get('/dashboard/stats', async (request, reply) => {
    try {
      const userId = request.user.id
      const vehicles = await vehicleController.findAll(request, reply)
      // This is a simplified version - you might want to create a dedicated dashboard controller
      return { vehicles: [], maintenances: [], reminders: [] }
    } catch (error) {
      return reply.status(500).send({ message: 'Error fetching dashboard data' })
    }
  })
} 
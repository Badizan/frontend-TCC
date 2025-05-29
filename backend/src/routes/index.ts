import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/user.controller'
import { VehicleController } from '../controllers/vehicle.controller'
import { MaintenanceController } from '../controllers/maintenance.controller'
import { AuthController } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth'

const userController = new UserController()
const vehicleController = new VehicleController()
const maintenanceController = new MaintenanceController()
const authController = new AuthController()

export async function routes(app: FastifyInstance) {
  // Public routes
  app.get('/', async () => {
    return { message: 'Mechanic Shop API' }
  })

  // Auth routes
  app.post('/auth/register', authController.register.bind(authController))
  app.post('/auth/login', authController.login.bind(authController))
  
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
} 
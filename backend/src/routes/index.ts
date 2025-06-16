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
  // ===== ROOT ENDPOINT =====
  app.get('/', {
    schema: {
      description: 'Endpoint raiz da API',
      tags: ['Sistema'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            version: { type: 'string' },
            docs: { type: 'string' }
          }
        }
      }
    }
  }, async () => {
    return {
      message: '🚗 AutoManutenção API - Sistema de Gestão Veicular',
      version: '1.0.0',
      docs: '/docs'
    }
  })

  // ===== AUTHENTICATION ROUTES =====
  app.post('/auth/register', {
    schema: {
      description: 'Registrar novo usuário no sistema',
      tags: ['Autenticação'],
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            description: 'Nome completo do usuário'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email válido para login'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Senha com mínimo 6 caracteres'
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'MECHANIC', 'OWNER'],
            description: 'Tipo de usuário (padrão: OWNER)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.register.bind(authController))

  app.post('/auth/login', {
    schema: {
      description: 'Fazer login no sistema',
      tags: ['Autenticação'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email cadastrado no sistema'
          },
          password: {
            type: 'string',
            description: 'Senha do usuário'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: {
              type: 'string',
              description: 'Token JWT para autenticação'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, authController.login.bind(authController))

  app.get('/auth/profile', {
    schema: {
      description: 'Obter perfil do usuário logado',
      tags: ['Autenticação'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        401: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: [authMiddleware]
  }, authController.getProfile.bind(authController))

  // Protected routes middleware
  app.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/auth/') || request.url === '/') {
      return
    }
    return authMiddleware(request, reply)
  })

  // ===== USER ROUTES =====
  app.get('/users', {
    schema: {
      description: 'Listar todos os usuários (Admin)',
      tags: ['Usuários'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, userController.findAll.bind(userController))

  app.get('/users/:id', {
    schema: {
      description: 'Buscar usuário por ID',
      tags: ['Usuários'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, userController.findById.bind(userController))

  // ===== VEHICLE ROUTES =====
  app.post('/vehicles', {
    schema: {
      description: 'Cadastrar novo veículo',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['brand', 'model', 'year', 'licensePlate', 'type'],
        properties: {
          brand: {
            type: 'string',
            minLength: 2,
            description: 'Marca do veículo'
          },
          model: {
            type: 'string',
            minLength: 2,
            description: 'Modelo do veículo'
          },
          year: {
            type: 'integer',
            minimum: 1900,
            maximum: 2025,
            description: 'Ano de fabricação'
          },
          licensePlate: {
            type: 'string',
            pattern: '^[A-Z]{3}[-]?[0-9]{4}$|^[A-Z]{3}[-]?[0-9][A-Z][0-9]{2}$',
            description: 'Placa no formato brasileiro (ABC1234, ABC-1234, ABC1D23 ou ABC-1D23)'
          },
          type: {
            type: 'string',
            enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
            description: 'Tipo do veículo'
          },
          color: {
            type: 'string',
            description: 'Cor do veículo'
          },
          mileage: {
            type: 'integer',
            minimum: 0,
            description: 'Quilometragem atual'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            licensePlate: { type: 'string' },
            type: { type: 'string' },
            color: { type: 'string' },
            mileage: { type: 'integer' },
            ownerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, vehicleController.create.bind(vehicleController))

  app.get('/vehicles', {
    schema: {
      description: 'Listar veículos do usuário',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
            description: 'Filtrar por tipo de veículo'
          },
          search: {
            type: 'string',
            description: 'Buscar por marca, modelo ou placa'
          }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              brand: { type: 'string' },
              model: { type: 'string' },
              year: { type: 'integer' },
              licensePlate: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
              mileage: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, vehicleController.findAll.bind(vehicleController))

  app.get('/vehicles/:id', {
    schema: {
      description: 'Buscar veículo por ID',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            licensePlate: { type: 'string' },
            type: { type: 'string' },
            color: { type: 'string' },
            mileage: { type: 'integer' },
            ownerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            maintenances: {
              type: 'array',
              items: { type: 'object' }
            },
            reminders: {
              type: 'array',
              items: { type: 'object' }
            },
            expenses: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  }, vehicleController.findById.bind(vehicleController))

  app.put('/vehicles/:id', {
    schema: {
      description: 'Atualizar dados do veículo',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        properties: {
          brand: { type: 'string', minLength: 2 },
          model: { type: 'string', minLength: 2 },
          year: { type: 'integer', minimum: 1900, maximum: 2025 },
          licensePlate: { type: 'string', pattern: '^[A-Z]{3}[-]?[0-9]{4}$|^[A-Z]{3}[-]?[0-9][A-Z][0-9]{2}$' },
          type: { type: 'string', enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'] },
          color: { type: 'string' },
          mileage: { type: 'integer', minimum: 0 }
        }
      }
    }
  }, vehicleController.update.bind(vehicleController))

  app.delete('/vehicles/:id', {
    schema: {
      description: 'Excluir veículo (remove também manutenções, lembretes e despesas)',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, vehicleController.delete.bind(vehicleController))

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
  app.patch('/reminders/:id/complete', reminderController.complete.bind(reminderController))
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
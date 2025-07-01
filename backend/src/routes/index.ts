import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/user.controller'
import { VehicleController } from '../controllers/vehicle.controller'
import { MaintenanceController } from '../controllers/maintenance.controller'
import { AuthController } from '../controllers/auth.controller'
import { ReminderController } from '../controllers/reminder.controller'
import { ExpenseController } from '../controllers/expense.controller'
import { ReportController } from '../controllers/report.controller'
import { authMiddleware } from '../middlewares/auth'
import { notificationRoutes } from './notification.routes'

const userController = new UserController()
const vehicleController = new VehicleController()
const maintenanceController = new MaintenanceController()
const authController = new AuthController()
const reminderController = new ReminderController()
const expenseController = new ExpenseController()
const reportController = new ReportController()

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
            docs: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' }
          }
        }
      }
    }
  }, async () => {
    return {
      message: '🚗 AutoManutenção API - Sistema de Gestão Veicular',
      version: '1.0.0',
      docs: '/docs',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })

  // ===== HEALTH CHECK =====
  app.get('/health', {
    schema: {
      description: 'Verificação de saúde da API',
      tags: ['Sistema'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async () => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString()
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
            enum: ['ADMIN', 'OWNER'],
            description: 'Tipo de usuário (padrão: OWNER)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            },
            token: { type: 'string' }
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
            description: 'Email do usuário'
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
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            },
            token: { type: 'string' }
          }
        }
      }
    }
  }, authController.login.bind(authController))

  app.get('/auth/profile', {
    schema: {
      description: 'Obter perfil do usuário autenticado',
      tags: ['Autenticação'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
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
    preHandler: authMiddleware
  }, authController.getProfile.bind(authController))

  app.post('/auth/forgot-password', {
    schema: {
      description: 'Solicitar recuperação de senha',
      tags: ['Autenticação'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email do usuário'
          }
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
  }, authController.forgotPassword.bind(authController))

  app.post('/auth/reset-password', {
    schema: {
      description: 'Redefinir senha com token',
      tags: ['Autenticação'],
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: {
            type: 'string',
            description: 'Token de recuperação'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Nova senha'
          }
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
  }, authController.resetPassword.bind(authController))

  app.post('/auth/validate-reset-token', {
    schema: {
      description: 'Validar token de recuperação',
      tags: ['Autenticação'],
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' }
          }
        }
      }
    }
  }, authController.validateResetToken.bind(authController))

  // ===== PROTECTED ROUTES =====

  // VEHICLES
  app.get('/vehicles', {
    schema: {
      description: 'Listar veículos do usuário',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, vehicleController.getAll.bind(vehicleController))

  app.get('/vehicles/:id', {
    schema: {
      description: 'Obter detalhes de um veículo',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: authMiddleware
  }, vehicleController.getById.bind(vehicleController))

  app.post('/vehicles', {
    schema: {
      description: 'Criar novo veículo',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, vehicleController.create.bind(vehicleController))

  app.put('/vehicles/:id', {
    schema: {
      description: 'Atualizar veículo',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: authMiddleware
  }, vehicleController.update.bind(vehicleController))

  app.delete('/vehicles/:id', {
    schema: {
      description: 'Deletar veículo',
      tags: ['Veículos'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: authMiddleware
  }, vehicleController.delete.bind(vehicleController))

  // MAINTENANCES
  app.get('/maintenance', {
    schema: {
      description: 'Listar manutenções',
      tags: ['Manutenções'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, maintenanceController.getAll.bind(maintenanceController))

  app.post('/maintenance', {
    schema: {
      description: 'Criar nova manutenção',
      tags: ['Manutenções'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, maintenanceController.create.bind(maintenanceController))

  // REMINDERS
  app.get('/reminders', {
    schema: {
      description: 'Listar lembretes',
      tags: ['Lembretes'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, reminderController.getAll.bind(reminderController))

  app.post('/reminders', {
    schema: {
      description: 'Criar novo lembrete',
      tags: ['Lembretes'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, reminderController.create.bind(reminderController))

  app.patch('/reminders/:id/complete', {
    schema: {
      description: 'Marcar lembrete como concluído',
      tags: ['Lembretes'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: authMiddleware
  }, reminderController.complete.bind(reminderController))

  // EXPENSES
  app.get('/expenses', {
    schema: {
      description: 'Listar despesas',
      tags: ['Despesas'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, expenseController.getAll.bind(expenseController))

  app.post('/expenses', {
    schema: {
      description: 'Criar nova despesa',
      tags: ['Despesas'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: authMiddleware
  }, expenseController.create.bind(expenseController))

  // NOTIFICATIONS
  app.register(notificationRoutes, { prefix: '/notifications' })
} 
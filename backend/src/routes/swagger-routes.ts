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

export async function swaggerRoutes(app: FastifyInstance) {
    // ===== ROOT ENDPOINT =====
    app.get('/', {
        schema: {
            description: 'Endpoint raiz da API com informações básicas',
            tags: ['Sistema'],
            summary: 'Informações da API',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: '🚗 AutoManutenção API - Sistema de Gestão Veicular' },
                        version: { type: 'string', example: '1.0.0' },
                        docs: { type: 'string', example: '/docs' },
                        status: { type: 'string', example: 'online' }
                    }
                }
            }
        }
    }, async () => {
        return {
            message: '🚗 AutoManutenção API - Sistema de Gestão Veicular',
            version: '1.0.0',
            docs: '/docs',
            status: 'online'
        }
    })

    // ===== AUTHENTICATION ROUTES =====
    app.post('/auth/register', {
        schema: {
            description: 'Registrar novo usuário no sistema',
            summary: 'Criar conta de usuário',
            tags: ['Autenticação'],
            body: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        description: 'Nome completo do usuário',
                        example: 'João Silva'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email válido para login',
                        example: 'joao@exemplo.com'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        description: 'Senha com mínimo 6 caracteres',
                        example: '123456'
                    },
                    role: {
                        type: 'string',
                        enum: ['ADMIN', 'MECHANIC', 'OWNER'],
                        description: 'Tipo de usuário (padrão: OWNER)',
                        example: 'OWNER'
                    }
                }
            },
            response: {
                201: {
                    description: 'Usuário criado com sucesso',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Usuário criado com sucesso' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' }
                            }
                        }
                    }
                },
                400: {
                    description: 'Dados inválidos',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Email já cadastrado' }
                    }
                }
            }
        }
    }, authController.register.bind(authController))

    app.post('/auth/login', {
        schema: {
            description: 'Fazer login no sistema e obter token JWT',
            summary: 'Login de usuário',
            tags: ['Autenticação'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email cadastrado no sistema',
                        example: 'admin@example.com'
                    },
                    password: {
                        type: 'string',
                        description: 'Senha do usuário',
                        example: '123456'
                    }
                }
            },
            response: {
                200: {
                    description: 'Login realizado com sucesso',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Login realizado com sucesso' },
                        token: {
                            type: 'string',
                            description: 'Token JWT para autenticação',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string', enum: ['ADMIN', 'MECHANIC', 'OWNER'] }
                            }
                        }
                    }
                },
                401: {
                    description: 'Credenciais inválidas',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Email ou senha incorretos' }
                    }
                }
            }
        }
    }, authController.login.bind(authController))

    app.get('/auth/profile', {
        schema: {
            description: 'Obter perfil do usuário logado',
            summary: 'Perfil do usuário',
            tags: ['Autenticação'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    description: 'Perfil do usuário',
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                401: {
                    description: 'Token inválido ou expirado',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Token inválido' }
                    }
                }
            }
        },
        preHandler: [authMiddleware]
    }, authController.getProfile.bind(authController))

    // Middleware para rotas protegidas
    app.addHook('preHandler', async (request, reply) => {
        if (request.url.startsWith('/auth/') || request.url === '/' || request.url.startsWith('/docs')) {
            return
        }
        return authMiddleware(request, reply)
    })

    // ===== VEHICLE ROUTES =====
    app.post('/vehicles', {
        schema: {
            description: 'Cadastrar novo veículo',
            summary: 'Criar veículo',
            tags: ['Veículos'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['brand', 'model', 'year', 'licensePlate', 'type'],
                properties: {
                    brand: {
                        type: 'string',
                        minLength: 2,
                        description: 'Marca do veículo',
                        example: 'Toyota'
                    },
                    model: {
                        type: 'string',
                        minLength: 2,
                        description: 'Modelo do veículo',
                        example: 'Corolla'
                    },
                    year: {
                        type: 'integer',
                        minimum: 1900,
                        maximum: 2025,
                        description: 'Ano de fabricação',
                        example: 2020
                    },
                    licensePlate: {
                        type: 'string',
                        pattern: '^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$',
                        description: 'Placa no formato brasileiro (ABC1234 ou ABC1D23)',
                        example: 'ABC1234'
                    },
                    type: {
                        type: 'string',
                        enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
                        description: 'Tipo do veículo',
                        example: 'CAR'
                    },
                    color: {
                        type: 'string',
                        description: 'Cor do veículo',
                        example: 'Branco'
                    },
                    mileage: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Quilometragem atual',
                        example: 50000
                    }
                }
            },
            response: {
                201: {
                    description: 'Veículo criado com sucesso',
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        brand: { type: 'string' },
                        model: { type: 'string' },
                        year: { type: 'integer' },
                        licensePlate: { type: 'string' },
                        type: { type: 'string' },
                        color: { type: 'string' },
                        mileage: { type: 'integer' },
                        ownerId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                400: {
                    description: 'Dados inválidos',
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, vehicleController.create.bind(vehicleController))

    app.get('/vehicles', {
        schema: {
            description: 'Listar todos os veículos do usuário logado',
            summary: 'Listar veículos',
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
                    },
                    page: {
                        type: 'integer',
                        minimum: 1,
                        description: 'Número da página',
                        default: 1
                    },
                    limit: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        description: 'Itens por página',
                        default: 20
                    }
                }
            },
            response: {
                200: {
                    description: 'Lista de veículos',
                    type: 'object',
                    properties: {
                        vehicles: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', format: 'uuid' },
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
                        },
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        totalPages: { type: 'integer' }
                    }
                }
            }
        }
    }, vehicleController.getAll.bind(vehicleController))

    app.get('/vehicles/:id', {
        schema: {
            description: 'Buscar veículo específico com todos os dados relacionados',
            summary: 'Detalhes do veículo',
            tags: ['Veículos'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID do veículo'
                    }
                },
                required: ['id']
            },
            response: {
                200: {
                    description: 'Dados completos do veículo',
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        brand: { type: 'string' },
                        model: { type: 'string' },
                        year: { type: 'integer' },
                        licensePlate: { type: 'string' },
                        type: { type: 'string' },
                        color: { type: 'string' },
                        mileage: { type: 'integer' },
                        ownerId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        maintenances: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    description: { type: 'string' },
                                    type: { type: 'string' },
                                    status: { type: 'string' },
                                    scheduledDate: { type: 'string', format: 'date-time' },
                                    cost: { type: 'number' }
                                }
                            }
                        },
                        reminders: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    description: { type: 'string' },
                                    reminderDate: { type: 'string', format: 'date-time' },
                                    completed: { type: 'boolean' }
                                }
                            }
                        },
                        expenses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    description: { type: 'string' },
                                    amount: { type: 'number' },
                                    category: { type: 'string' },
                                    date: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Veículo não encontrado',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Veículo não encontrado' }
                    }
                }
            }
        }
    }, vehicleController.getById.bind(vehicleController))

    app.put('/vehicles/:id', {
        schema: {
            description: 'Atualizar dados do veículo',
            summary: 'Editar veículo',
            tags: ['Veículos'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    brand: { type: 'string', minLength: 2 },
                    model: { type: 'string', minLength: 2 },
                    year: { type: 'integer', minimum: 1900, maximum: 2025 },
                    licensePlate: { type: 'string', pattern: '^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$' },
                    type: { type: 'string', enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'] },
                    color: { type: 'string' },
                    mileage: { type: 'integer', minimum: 0 }
                }
            },
            response: {
                200: {
                    description: 'Veículo atualizado com sucesso',
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        brand: { type: 'string' },
                        model: { type: 'string' },
                        year: { type: 'integer' },
                        licensePlate: { type: 'string' },
                        type: { type: 'string' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }, vehicleController.update.bind(vehicleController))

    app.delete('/vehicles/:id', {
        schema: {
            description: 'Excluir veículo permanentemente (remove também manutenções, lembretes e despesas associadas)',
            summary: 'Excluir veículo',
            tags: ['Veículos'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            },
            response: {
                200: {
                    description: 'Veículo excluído com sucesso',
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Veículo excluído com sucesso' }
                    }
                },
                404: {
                    description: 'Veículo não encontrado',
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, vehicleController.delete.bind(vehicleController))

    // Continue with other routes...
    // This is a template structure for the complete Swagger documentation
} 
import { SwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'

export const swaggerConfig: SwaggerOptions = {
    swagger: {
        info: {
            title: '🚗 AutoManutenção - API REST',
            description: `
        ## Sistema Completo de Gestão Veicular
        
        Esta é a documentação oficial da API REST do sistema **AutoManutenção**, 
        um sistema completo para gestão de veículos, manutenções, lembretes e despesas.
        
        ### 🎯 **Funcionalidades Principais**
        - 🔐 **Sistema de Autenticação**: JWT com diferentes níveis de acesso
        - 🚗 **Gestão de Veículos**: CRUD completo com validações
        - 🔧 **Controle de Manutenções**: Agendamento e acompanhamento
        - ⏰ **Sistema de Lembretes**: Alertas por data ou quilometragem
        - 💰 **Controle Financeiro**: Categorização e análise de despesas
        - 📊 **Dashboard e Relatórios**: Estatísticas e insights
        
        ### 🔐 **Como Usar a Autenticação**
        1. **Faça login** através do endpoint \`/auth/login\`
        2. **Copie o token JWT** retornado na resposta
        3. **Clique no botão "Authorize"** (🔒) no topo desta página
        4. **Cole o token** no formato: \`Bearer <seu_token>\`
        5. **Teste os endpoints** protegidos livremente
        
        ### 📱 **Credenciais de Teste**
        - **Admin**: admin@example.com / 123456
        - **Mecânico**: mecanico@example.com / 123456  
        - **Proprietário**: proprietario@example.com / 123456
        
        ### 🛠️ **Tecnologias Utilizadas**
        - **Backend**: Node.js + Fastify + TypeScript
        - **Banco de Dados**: PostgreSQL + Prisma ORM
        - **Validação**: Zod Schema Validation
        - **Autenticação**: JWT + bcrypt
        - **Documentação**: Swagger/OpenAPI 3.0
        
        ### 🚀 **Links Úteis**
        - **Frontend**: http://localhost:5173
        - **GitHub**: [Repositório do Projeto](#)
        - **Documentação Técnica**: [README](#)
      `,
            version: '1.0.0',
            contact: {
                name: 'Equipe AutoManutenção',
                email: 'contato@automanutencao.com.br',
                url: 'https://automanutencao.com.br'
            },
            license: {
                name: 'MIT License',
                url: 'https://opensource.org/licenses/MIT',
            },
            termsOfService: 'https://automanutencao.com.br/termos'
        },
        host: 'localhost:3000',
        basePath: '/',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
            {
                name: 'Sistema',
                description: '🏠 Informações básicas e status da API'
            },
            {
                name: 'Autenticação',
                description: '🔐 Endpoints para login, registro e gestão de sessões'
            },
            {
                name: 'Veículos',
                description: '🚗 CRUD completo para gestão de veículos do usuário'
            },
            {
                name: 'Manutenções',
                description: '🔧 Agendamento e controle de manutenções preventivas e corretivas'
            },
            {
                name: 'Lembretes',
                description: '⏰ Sistema de alertas inteligentes por data ou quilometragem'
            },
            {
                name: 'Despesas',
                description: '💰 Controle financeiro completo com categorização automática'
            },
            {
                name: 'Dashboard',
                description: '📊 Estatísticas, métricas e dados consolidados do sistema'
            },
            {
                name: 'Usuários',
                description: '👥 Gestão de usuários e permissões (Acesso Admin)'
            }
        ],
        securityDefinitions: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: '🔑 Token JWT no formato: `Bearer <token>`\n\n**Como obter o token:**\n1. Faça login no endpoint `/auth/login`\n2. Copie o token da resposta\n3. Use no formato: `Bearer eyJhbGciOiJIUzI1NiI...`'
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        definitions: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'ID único do usuário' },
                    name: { type: 'string', description: 'Nome completo' },
                    email: { type: 'string', format: 'email', description: 'Email para login' },
                    role: {
                        type: 'string',
                        enum: ['ADMIN', 'MECHANIC', 'OWNER'],
                        description: 'Nível de acesso do usuário'
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Vehicle: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    brand: { type: 'string', description: 'Marca do veículo' },
                    model: { type: 'string', description: 'Modelo do veículo' },
                    year: { type: 'integer', description: 'Ano de fabricação' },
                    licensePlate: { type: 'string', description: 'Placa do veículo' },
                    type: {
                        type: 'string',
                        enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
                        description: 'Tipo do veículo'
                    },
                    color: { type: 'string', description: 'Cor do veículo' },
                    mileage: { type: 'integer', description: 'Quilometragem atual' },
                    ownerId: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Maintenance: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    vehicleId: { type: 'string', format: 'uuid' },
                    type: {
                        type: 'string',
                        enum: ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION'],
                        description: 'Tipo da manutenção'
                    },
                    description: { type: 'string', description: 'Descrição detalhada' },
                    status: {
                        type: 'string',
                        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
                        description: 'Status atual'
                    },
                    scheduledDate: { type: 'string', format: 'date-time' },
                    completedDate: { type: 'string', format: 'date-time' },
                    mechanicId: { type: 'string', format: 'uuid' },
                    cost: { type: 'number', description: 'Custo da manutenção' },
                    notes: { type: 'string', description: 'Observações adicionais' }
                }
            },
            Reminder: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    vehicleId: { type: 'string', format: 'uuid' },
                    description: { type: 'string', description: 'Descrição do lembrete' },
                    reminderDate: { type: 'string', format: 'date-time' },
                    mileageReminder: { type: 'integer', description: 'Quilometragem de alerta' },
                    completed: { type: 'boolean', description: 'Se foi concluído' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Expense: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    vehicleId: { type: 'string', format: 'uuid' },
                    description: { type: 'string', description: 'Descrição da despesa' },
                    amount: { type: 'number', description: 'Valor gasto' },
                    category: {
                        type: 'string',
                        enum: ['FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLLS', 'PARKING', 'FINES', 'OTHER'],
                        description: 'Categoria da despesa'
                    },
                    date: { type: 'string', format: 'date-time' },
                    mileage: { type: 'integer', description: 'Quilometragem no momento' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string', description: 'Mensagem de erro' },
                    code: { type: 'string', description: 'Código do erro' },
                    details: { type: 'object', description: 'Detalhes adicionais' }
                }
            }
        }
    }
}

export const swaggerUiConfig: FastifySwaggerUiOptions = {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        layout: 'BaseLayout',
        filter: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
    },
    uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
        // Adicionar informações extras ao objeto Swagger
        swaggerObject.info.description += `\n\n**⏰ Documentação gerada em:** ${new Date().toLocaleString('pt-BR')}`
        return swaggerObject
    },
    transformSpecificationClone: true,
    theme: {
        title: '🚗 AutoManutenção API Docs'
    }
}

export const swaggerJsonConfig = {
    prefix: '/swagger',
    includeRoutes: true,
    openapi: '3.0.0'
} 
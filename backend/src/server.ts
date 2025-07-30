import fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { routes } from './routes'
import { CronService } from './services/cronService'
import { databaseService } from './config/database'
import dotenv from 'dotenv'

dotenv.config()

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development'
  }
})

// Tratamento global de erros
app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  
  // Erro de validação do Zod
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation error',
      details: error.validation
    })
  }
  
  // Erro de autenticação
  if (error.statusCode === 401) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error.message || 'Authentication required'
    })
  }
  
  // Erro de permissão
  if (error.statusCode === 403) {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: error.message || 'Access denied'
    })
  }
  
  // Erro de recurso não encontrado
  if (error.statusCode === 404) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: error.message || 'Resource not found'
    })
  }
  
  // Erro de conflito (ex: recurso duplicado)
  if (error.statusCode === 409) {
    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: error.message || 'Resource conflict'
    })
  }
  
  // Erro interno do servidor
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred processing your request' 
      : error.message
  })
})

// Hook para logging de requisições
app.addHook('onRequest', async (request, reply) => {
  request.log.info({ url: request.url, method: request.method }, 'incoming request')
})

// Hook para logging de respostas
app.addHook('onResponse', async (request, reply) => {
  request.log.info({ 
    url: request.url, 
    method: request.method, 
    statusCode: reply.statusCode,
    responseTime: reply.getResponseTime()
  }, 'request completed')
})

app.register(cors, {
  origin: true,
  credentials: true,
})

app.register(swagger, {
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
        - **API Base**: http://localhost:3000
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
    ]
  },
})

app.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    layout: 'BaseLayout',
    filter: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    persistAuthorization: true,
    displayRequestDuration: true,
    operationsSorter: 'alpha',
    tagsSorter: 'alpha'
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next() },
    preHandler: function (request, reply, next) { next() }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    // Adicionar timestamp de geração
    swaggerObject.info.description += `\n\n**⏰ Documentação gerada em:** ${new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}`

    // Adicionar informações do servidor
    swaggerObject.info.description += `\n**🖥️ Servidor:** ${swaggerObject.host}`

    return swaggerObject
  },
  transformSpecificationClone: true,
  theme: {
    title: '🚗 AutoManutenção - API Documentation'
  }
})

app.register(routes)

const port = process.env.PORT || 3000

// Função para shutdown gracioso
const gracefulShutdown = async (signal: string) => {
  app.log.info(`${signal} signal received: closing HTTP server`)
  try {
    await app.close()
    app.log.info('HTTP server closed')
    process.exit(0)
  } catch (err) {
    app.log.error(err, 'Error during shutdown')
    process.exit(1)
  }
}

// Registrar handlers para sinais de término
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  app.log.fatal(error, 'Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  app.log.fatal({ reason, promise }, 'Unhandled Rejection')
  process.exit(1)
})

// Inicializar servidor
const start = async () => {
  try {
    // Configurar serviço de banco de dados
    databaseService.setApp(app)
    
    // Conectar ao banco de dados
    try {
      await databaseService.connect()
    } catch (dbError) {
      app.log.fatal(dbError, 'Não foi possível conectar ao banco de dados')
      process.exit(1)
    }
    
    // Adicionar health check route
    app.get('/health', async (request, reply) => {
      const dbHealth = await databaseService.healthCheck()
      const isHealthy = dbHealth.status === 'healthy'
      
      return reply.status(isHealthy ? 200 : 503).send({
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          api: 'healthy',
          database: dbHealth
        }
      })
    })
    
    await app.listen({
      host: '0.0.0.0',
      port: Number(port),
    })
    
    console.log('🚀 ===================================')
    console.log(`🚀 HTTP Server running on http://localhost:${port}`)
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`)
    console.log('🚀 ===================================')

    // Inicializar serviços de background com tratamento de erro
    try {
      console.log('⏰ Inicializando serviços automáticos...')
      await CronService.initialize()
      console.log('✅ Serviços automáticos iniciados com sucesso!')
    } catch (cronError) {
      app.log.error(cronError, 'Erro ao inicializar serviços automáticos')
      // Continuar execução mesmo se os cron jobs falharem
    }
  } catch (err) {
    app.log.error(err, 'Error starting server')
    process.exit(1)
  }
}

start() 
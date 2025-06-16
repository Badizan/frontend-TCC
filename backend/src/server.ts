import fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { routes } from './routes'
import dotenv from 'dotenv'

dotenv.config()

const app = fastify()

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
        - **API Base**: http://localhost:3333
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
    host: 'localhost:3333',
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

const port = process.env.PORT || 3333

app
  .listen({
    host: '0.0.0.0',
    port: Number(port),
  })
  .then(() => {
    console.log('🚀 ===================================')
    console.log(`🚀 HTTP Server running on http://localhost:${port}`)
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`)
    console.log('🚀 ===================================')
  }) 
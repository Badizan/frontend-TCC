import fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { routes } from './routes'

const app = fastify()

app.register(cors, {
  origin: true,
})

app.register(swagger, {
  swagger: {
    info: {
      title: 'API - Manutenção Veicular',
      description: 'Documentação da API do sistema de manutenção preventiva de veículos',
      version: '1.0.0',
    },
    host: 'localhost:3333',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
})

app.register(swaggerUI, {
  routePrefix: '/docs',
})

app.register(routes)

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('🚀 HTTP Server running on http://localhost:3333')
    console.log('📚 Swagger docs at http://localhost:3333/docs')
  }) 
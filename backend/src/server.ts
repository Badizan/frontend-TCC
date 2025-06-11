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

const port = process.env.PORT || 3333

app
  .listen({
    host: '0.0.0.0',
    port: Number(port),
  })
  .then(() => {
    console.log(`🚀 HTTP Server running on http://localhost:${port}`)
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`)
  }) 
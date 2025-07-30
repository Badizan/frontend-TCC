import pino from 'pino'
import { FastifyInstance } from 'fastify'

// Configuração do logger baseada no ambiente
const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Configuração base do Pino
const loggerConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
        messageFormat: '{msg}',
        errorLikeObjectKeys: ['err', 'error'],
        errorProps: '',
        levelFirst: false,
        messageKey: 'msg',
        timestampKey: 'time'
      }
    }
  }),
  ...(isTest && {
    level: 'silent' // Desabilitar logs durante testes
  }),
  // Configuração para produção
  ...(!isDevelopment && !isTest && {
    formatters: {
      level: (label: string) => {
        return { level: label }
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    messageKey: 'message',
    errorKey: 'error'
  }),
  // Serializers customizados
  serializers: {
    req: (req: any) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      },
      remoteAddress: req.ip,
      remotePort: req.socket?.remotePort
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders?.()
    }),
    err: pino.stdSerializers.err
  },
  // Redact sensitive information
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.secret',
      '*.apiKey',
      '*.creditCard',
      '*.ssn'
    ],
    censor: '[REDACTED]'
  }
}

// Criar logger principal
export const logger = pino(loggerConfig)

// Função para criar child logger com contexto
export function createLogger(context: string, metadata?: Record<string, any>) {
  return logger.child({ context, ...metadata })
}

// Logger específico para erros críticos
export const errorLogger = createLogger('error', { type: 'critical' })

// Logger para auditoria
export const auditLogger = createLogger('audit', { type: 'security' })

// Logger para performance
export const performanceLogger = createLogger('performance', { type: 'metrics' })

// Função para logar erros com contexto completo
export function logError(error: Error, context: string, metadata?: Record<string, any>) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...metadata
  }

  if ((error as any).statusCode >= 500 || !((error as any).statusCode)) {
    errorLogger.error(errorInfo, `[${context}] ${error.message}`)
  } else {
    logger.warn(errorInfo, `[${context}] ${error.message}`)
  }
}

// Função para logar eventos de auditoria
export function logAudit(
  action: string,
  userId: string,
  resource: string,
  details?: Record<string, any>
) {
  auditLogger.info({
    action,
    userId,
    resource,
    timestamp: new Date().toISOString(),
    ...details
  }, `Audit: ${action} on ${resource} by user ${userId}`)
}

// Função para logar métricas de performance
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  const level = duration > 1000 ? 'warn' : 'info'
  performanceLogger[level]({
    operation,
    duration,
    durationMs: duration,
    ...metadata
  }, `Performance: ${operation} took ${duration}ms`)
}

// Middleware para logar requisições HTTP
export function createRequestLogger(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    request.log = logger.child({
      reqId: request.id,
      method: request.method,
      url: request.url,
      userId: (request as any).user?.id
    })
    
    request.log.info('Request received')
  })

  app.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.getResponseTime()
    
    request.log.info({
      statusCode: reply.statusCode,
      responseTime
    }, 'Request completed')

    // Log de performance para requisições lentas
    if (responseTime > 1000) {
      logPerformance(`${request.method} ${request.url}`, responseTime, {
        statusCode: reply.statusCode,
        userId: (request as any).user?.id
      })
    }
  })

  app.addHook('onError', async (request, reply, error) => {
    logError(error, 'HTTP Request', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      userId: (request as any).user?.id
    })
  })
}

// Função para configurar tratamento de erros não capturados
export function setupErrorHandlers() {
  process.on('uncaughtException', (error) => {
    errorLogger.fatal(error, 'Uncaught Exception')
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    errorLogger.fatal({ reason, promise }, 'Unhandled Rejection')
    process.exit(1)
  })

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
  })
}

export default logger
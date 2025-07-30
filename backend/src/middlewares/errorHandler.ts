import { FastifyRequest, FastifyReply, FastifyError } from 'fastify'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'

// Interface para resposta de erro padronizada
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    path: string
    method: string
    userId?: string
  }
}

// Tipos de erro personalizados
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'External service unavailable') {
    super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR')
    this.name = 'ExternalServiceError'
  }
}

// Função para log estruturado de erros
const logError = (error: Error, request: FastifyRequest, context?: any) => {
  const timestamp = new Date().toISOString()
  const logLevel = error instanceof AppError && error.statusCode < 500 ? 'WARN' : 'ERROR'
  
  const logData = {
    timestamp,
    level: logLevel,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational
      })
    },
    request: {
      method: request.method,
      url: request.url,
      path: request.routerPath,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: request.user?.id,
      userEmail: request.user?.email
    },
    context
  }

  if (logLevel === 'ERROR') {
    console.error('🚨 ERROR:', JSON.stringify(logData, null, 2))
  } else {
    console.warn('⚠️ WARNING:', JSON.stringify(logData, null, 2))
  }

  // Log adicional para erros críticos de segurança
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    console.warn('🔒 SECURITY EVENT:', {
      timestamp,
      type: error.name,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      attemptedResource: request.url,
      userId: request.user?.id
    })
  }
}

// Função para processar erros do Prisma
const handlePrismaError = (error: any): AppError => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Violação de constraint única
        const field = error.meta?.target as string[] || ['field']
        return new ConflictError(`${field.join(', ')} já existe no sistema`)
      
      case 'P2025':
        // Registro não encontrado
        return new NotFoundError('Registro')
      
      case 'P2003':
        // Violação de foreign key
        return new ValidationError('Referência inválida - registro relacionado não existe')
      
      case 'P2014':
        // Violação de relação requerida
        return new ValidationError('Operação inválida - dependências não atendidas')
      
      case 'P2021':
        // Tabela não existe
        return new DatabaseError('Estrutura do banco de dados inconsistente')
      
      case 'P2024':
        // Timeout de conexão
        return new DatabaseError('Timeout de conexão com banco de dados')
      
      default:
        console.error('🔍 Prisma Error Code:', error.code, error.message)
        return new DatabaseError(`Erro de banco de dados: ${error.message}`)
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new ValidationError('Dados inválidos para operação no banco')
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    return new DatabaseError('Erro desconhecido do banco de dados')
  }

  return new DatabaseError('Erro de banco de dados')
}

// Função para processar erros do Zod
const handleZodError = (error: ZodError): ValidationError => {
  const errors = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
    received: issue.received
  }))

  const message = errors.length === 1 
    ? `${errors[0].field}: ${errors[0].message}`
    : `Múltiplos erros de validação encontrados`

  const validationError = new ValidationError(message)
  ;(validationError as any).details = { validationErrors: errors }
  
  return validationError
}

// Middleware principal de tratamento de erros
export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  const timestamp = new Date().toISOString()
  
  let processedError: AppError

  // Processar diferentes tipos de erro
  if (error instanceof AppError) {
    processedError = error
  } else if (error.validation) {
    // Erro de validação do Fastify/Zod
    if (error.validation[0]?.schemaPath?.includes('zod')) {
      processedError = handleZodError(error as any)
    } else {
      processedError = new ValidationError('Dados de entrada inválidos')
    }
  } else if (error.name?.includes('Prisma')) {
    processedError = handlePrismaError(error)
  } else if (error.statusCode === 404) {
    processedError = new NotFoundError('Recurso')
  } else if (error.statusCode === 401) {
    processedError = new AuthenticationError(error.message)
  } else if (error.statusCode === 403) {
    processedError = new AuthorizationError(error.message)
  } else if (error.code === 'ECONNREFUSED') {
    processedError = new ExternalServiceError('Database', 'Conexão recusada')
  } else if (error.code === 'ETIMEDOUT') {
    processedError = new ExternalServiceError('External Service', 'Timeout de conexão')
  } else {
    // Erro não tratado - pode ser operacional ou de programação
    const isOperational = error.statusCode && error.statusCode < 500
    processedError = new AppError(
      isOperational ? error.message : 'Erro interno do servidor',
      error.statusCode || 500,
      'INTERNAL_ERROR',
      isOperational
    )
  }

  // Log do erro
  logError(processedError, request, {
    originalError: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  })

  // Preparar resposta
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: processedError.code,
      message: processedError.message,
      timestamp,
      path: request.url,
      method: request.method,
      userId: request.user?.id
    }
  }

  // Adicionar detalhes em desenvolvimento ou para erros de validação
  if (process.env.NODE_ENV === 'development' || processedError instanceof ValidationError) {
    errorResponse.error.details = (processedError as any).details || {
      stack: processedError.stack
    }
  }

  // Enviar resposta
  reply.status(processedError.statusCode).send(errorResponse)
}

// Handler para erros não capturados (uncaught exceptions e unhandled rejections)
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error: Error) => {
    console.error('🚨 UNCAUGHT EXCEPTION:', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })

    // Log crítico
    console.error('🚨 CRITICAL: Uncaught Exception - Aplicação será encerrada')
    
    // Graceful shutdown
    process.exit(1)
  })

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('🚨 UNHANDLED REJECTION:', {
      timestamp: new Date().toISOString(),
      reason: reason?.toString() || 'Unknown reason',
      stack: reason?.stack || 'No stack trace',
      promise: promise.toString()
    })

    // Log crítico
    console.error('🚨 CRITICAL: Unhandled Promise Rejection')
    
    // Não encerrar imediatamente para unhandled rejections, mas log crítico
    // Em produção, considere encerrar após um tempo
  })

  // Handler para SIGINT e SIGTERM (graceful shutdown)
  const gracefulShutdown = (signal: string) => {
    console.log(`🛑 ${signal} received - Iniciando shutdown graceful...`)
    
    // Aqui você pode adicionar lógica para fechar conexões, finalizar operações, etc.
    setTimeout(() => {
      console.log('✅ Shutdown graceful completado')
      process.exit(0)
    }, 5000) // 5 segundos para finalizar operações
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

// Wrapper para async functions
export const asyncHandler = (fn: Function) => {
  return (request: FastifyRequest, reply: FastifyReply) => {
    return Promise.resolve(fn(request, reply)).catch((error) => {
      errorHandler(error, request, reply)
    })
  }
}

// Utility para validar variáveis de ambiente obrigatórias
export const validateRequiredEnvVars = (requiredVars: string[]) => {
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('🚨 CRITICAL: Variáveis de ambiente obrigatórias não encontradas:', missing)
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`)
  }
  
  console.log('✅ Todas as variáveis de ambiente obrigatórias estão configuradas')
}
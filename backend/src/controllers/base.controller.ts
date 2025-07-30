import { FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export class BaseController {
  protected sendResponse(reply: FastifyReply, data: any, statusCode = 200) {
    return reply.status(statusCode).send(data)
  }

  protected sendError(reply: FastifyReply, error: any) {
    // Erro de validação do Zod
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: 'Dados inválidos fornecidos',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      })
    }

    // Erro customizado com statusCode
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name || 'Error',
        message: error.message
      })
    }

    // Erro do Prisma
    if (error.code && error.code.startsWith('P')) {
      const prismaError = this.handlePrismaError(error)
      return reply.status(prismaError.statusCode).send(prismaError)
    }

    // Erro genérico
    const statusCode = error.status || 500
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Erro interno do servidor'
      : error.message || 'Erro desconhecido'

    return reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Internal Server Error',
      message
    })
  }

  private handlePrismaError(error: any) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'campo'
      return {
        statusCode: 409,
        error: 'Conflict',
        message: `Já existe um registro com este ${field}`
      }
    }

    // Record not found
    if (error.code === 'P2025') {
      return {
        statusCode: 404,
        error: 'Not Found',
        message: 'Registro não encontrado'
      }
    }

    // Foreign key constraint
    if (error.code === 'P2003') {
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Referência inválida'
      }
    }

    // Required field missing
    if (error.code === 'P2012') {
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Campo obrigatório ausente'
      }
    }

    // Database connection error
    if (error.code === 'P1001') {
      return {
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Banco de dados indisponível'
      }
    }

    // Default Prisma error
    return {
      statusCode: 500,
      error: 'Database Error',
      message: 'Erro ao processar operação no banco de dados'
    }
  }

  // Método auxiliar para validação de IDs
  protected validateId(id: string, resourceName: string): void {
    if (!id || typeof id !== 'string') {
      throw {
        statusCode: 400,
        message: `ID de ${resourceName} inválido`
      }
    }

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw {
        statusCode: 400,
        message: `ID de ${resourceName} deve ser um UUID válido`
      }
    }
  }

  // Método auxiliar para validação de paginação
  protected validatePagination(page?: number, limit?: number) {
    const validatedPage = page && page > 0 ? page : 1
    const validatedLimit = limit && limit > 0 && limit <= 100 ? limit : 10

    return {
      page: validatedPage,
      limit: validatedLimit,
      skip: (validatedPage - 1) * validatedLimit
    }
  }
} 
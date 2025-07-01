import { FastifyReply } from 'fastify'

export class BaseController {
  protected sendResponse<T>(reply: FastifyReply, data: T, statusCode = 200) {
    return reply.status(statusCode).send(data)
  }

  protected sendError(reply: FastifyReply, error: Error, statusCode = 400) {
    return reply.status(statusCode).send({
      message: error.message,
      statusCode,
    })
  }

  protected static handleError(reply: FastifyReply, error: any, message: string) {
    console.error(message, error)
    return reply.status(500).send({
      success: false,
      message: message,
      error: error.message
    })
  }
} 
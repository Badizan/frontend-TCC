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
} 
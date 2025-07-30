import { FastifyReply } from 'fastify'
import { AppError } from '../middlewares/errorHandler'

export class BaseController {
  protected sendResponse<T>(reply: FastifyReply, data: T, statusCode = 200) {
    return reply.status(statusCode).send(data)
  }

  protected sendError(reply: FastifyReply, error: Error, statusCode = 400) {
    // Se for um AppError, deixar o middleware global tratar
    if (error instanceof AppError) {
      throw error;
    }
    
    // Para outros erros, criar um AppError
    throw new AppError(error.message, statusCode);
  }

  protected static handleError(reply: FastifyReply, error: any, message: string) {
    console.error(message, error)
    
    // Sempre lançar erro para ser tratado pelo middleware global
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(message, 500);
  }
} 
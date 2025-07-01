import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseController } from './base.controller'
import { AuthService } from '../services/auth.service'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const authService = new AuthService()

// Usuário de teste temporário
const TEST_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Usuário Teste',
  email: 'admin@test.com',
  role: 'OWNER'
}

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'OWNER']).default('OWNER')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const validateResetTokenSchema = z.object({
  token: z.string()
})

export class AuthController extends BaseController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('📝 AuthController: Processando registro...');
      const data = registerSchema.parse(request.body)

      console.log('📝 AuthController: Dados validados:', {
        name: data.name,
        email: data.email,
        role: data.role
      });

      const result = await authService.register(
        data.name,
        data.email,
        data.password,
        data.role
      )

      console.log('✅ AuthController: Registro bem-sucedido');
      return this.sendResponse(reply, result, 201)
    } catch (error: any) {
      console.error('❌ AuthController: Erro no registro:', error.message);
      return this.sendError(reply, error)
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('🔑 AuthController: Processando login...');
      const data = loginSchema.parse(request.body)

      console.log('🔑 AuthController: Tentando login para:', data.email);

      const result = await authService.login(data.email, data.password)

      console.log('✅ AuthController: Login bem-sucedido para:', data.email);
      return this.sendResponse(reply, result, 200)
    } catch (error: any) {
      console.error('❌ AuthController: Erro no login:', error.message);
      return this.sendError(reply, error)
    }
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('🔄 AuthController: Processando esqueci senha...');
      const data = forgotPasswordSchema.parse(request.body)
      const result = await authService.forgotPassword(data.email)
      console.log('✅ AuthController: Email de recuperação enviado');
      return this.sendResponse(reply, result)
    } catch (error: any) {
      console.error('❌ AuthController: Erro em esqueci senha:', error.message);
      return this.sendError(reply, error)
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('🔄 AuthController: Processando reset de senha...');
      const data = resetPasswordSchema.parse(request.body)
      const result = await authService.resetPassword(data.token, data.password)
      console.log('✅ AuthController: Senha redefinida com sucesso');
      return this.sendResponse(reply, result)
    } catch (error: any) {
      console.error('❌ AuthController: Erro ao redefinir senha:', error.message);
      return this.sendError(reply, error)
    }
  }

  async validateResetToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('🔍 AuthController: Validando token de reset...');
      const data = validateResetTokenSchema.parse(request.body)
      const isValid = await authService.validateResetToken(data.token)
      console.log('✅ AuthController: Token validado:', { isValid });
      return this.sendResponse(reply, { valid: isValid })
    } catch (error: any) {
      console.error('❌ AuthController: Erro ao validar token:', error.message);
      return this.sendError(reply, error)
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('👤 AuthController: Buscando perfil do usuário...');

      if (!request.user) {
        console.error('❌ AuthController: Usuário não encontrado no request');
        return reply.status(401).send({ message: 'User not authenticated' })
      }

      const userId = request.user.id
      console.log('👤 AuthController: ID do usuário:', userId);

      // Verifica se é o usuário de teste
      if (userId === TEST_USER.id) {
        console.log('✅ AuthController: Retornando usuário de teste');
        return this.sendResponse(reply, TEST_USER)
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, role: true }
        })

        if (!user) {
          console.error('❌ AuthController: Usuário não encontrado no banco');
          return reply.status(404).send({ message: 'User not found' })
        }

        console.log('✅ AuthController: Perfil encontrado:', user.email);
        return this.sendResponse(reply, user)
      } catch (dbError: any) {
        console.log('⚠️ AuthController: Banco indisponível, retornando dados do middleware');

        // Se o banco não estiver disponível, usar dados do middleware
        const fallbackUser = {
          id: request.user.id,
          name: request.user.name || 'Usuário de Desenvolvimento',
          email: request.user.email || 'user@development.com',
          role: request.user.role || 'OWNER'
        }

        return this.sendResponse(reply, fallbackUser)
      }
    } catch (error: any) {
      console.error('❌ AuthController: Erro ao buscar perfil:', error.message);
      return this.sendError(reply, error)
    }
  }
} 
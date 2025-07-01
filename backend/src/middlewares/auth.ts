import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Usuário de teste para desenvolvimento
const TEST_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Usuário Teste',
  email: 'admin@test.com',
  role: 'OWNER'
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET não definido nas variáveis de ambiente. Usando chave padrão (não recomendado para produção).')
}

declare global {
  namespace FastifyTypes {
    interface Request {
      user?: {
        id: string
        role: string
        email?: string
        name?: string
      }
    }
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        message: 'Token de autorização não fornecido'
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: 'Token não fornecido'
      })
    }

    // Verificar e decodificar o token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return reply.status(401).send({
          success: false,
          message: 'Token expirado. Faça login novamente.'
        })
      } else if (jwtError.name === 'JsonWebTokenError') {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido'
        })
      } else {
        return reply.status(401).send({
          success: false,
          message: 'Erro ao verificar token'
        })
      }
    }

    if (!decoded.userId) {
      return reply.status(401).send({
        success: false,
        message: 'Token inválido: userId não encontrado'
      })
    }

    // Verificar se é o usuário de teste primeiro
    if (decoded.userId === TEST_USER.id) {
      console.log('🔐 Middleware: Usuário de teste autenticado');
      request.user = {
        id: TEST_USER.id,
        role: TEST_USER.role,
        email: TEST_USER.email,
        name: TEST_USER.name
      }
      return
    }

    // Tentar buscar usuário no banco de dados
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          name: true
        }
      })

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Usuário não encontrado ou foi removido'
        })
      }

      // Adicionar informações do usuário ao request
      request.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      }

      // Log para debug (remover em produção)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Usuário autenticado: ${user.email} (${user.role})`)
      }

    } catch (dbError) {
      console.warn('⚠️ Middleware: Banco indisponível, usando fallback para usuário válido');

      // Se não conseguir acessar o banco, mas o token é válido,
      // usar dados básicos do token para desenvolvimento
      request.user = {
        id: decoded.userId,
        role: 'OWNER', // Role padrão para desenvolvimento
        email: 'user@development.com',
        name: 'Usuário de Desenvolvimento'
      }
    }

  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error)
    return reply.status(500).send({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}

// Middleware para verificar roles específicas
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: 'Usuário não autenticado'
      })
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        message: `Acesso negado. Roles necessárias: ${roles.join(', ')}`
      })
    }
  }
}

// Middleware para verificar se é admin
export const requireAdmin = requireRole('ADMIN')

// Middleware para verificar se é o próprio usuário ou admin
export function requireOwnerOrAdmin(request: FastifyRequest, reply: FastifyReply) {
  const { user } = request

  if (!user) {
    reply.status(401).send({ error: 'Usuário não autenticado' })
    return
  }

  // Extrair ID do usuário dos parâmetros da rota
  const paramUserId = (request.params as any)?.userId ||
    (request.params as any)?.id ||
    (request.body as any)?.ownerId ||
    (request.query as any)?.ownerId

  const isOwner = request.user.id === paramUserId
  const isAdmin = request.user.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    reply.status(403).send({ error: 'Access denied. Must be the owner or admin.' })
    return
  }
} 
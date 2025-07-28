import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { UserRole } from '../types'

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

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

// Log de auditoria para rastrear ações por usuário
const auditLog = (userId: string, action: string, resource: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`🔍 AUDIT [${timestamp}] User: ${userId} | Action: ${action} | Resource: ${resource}`, details ? `| Details: ${JSON.stringify(details)}` : '');
};

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  // Log da tentativa de acesso
  console.log(`🔐 AUTH: ${request.method} ${request.url} - IP: ${request.ip}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ AUTH: Token não fornecido ou formato inválido');
    return reply.status(401).send({ message: 'Token não fornecido ou inválido' });
  }

  const token = authHeader.substring(7);

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ AUTH: JWT_SECRET não configurado');
      return reply.status(500).send({ message: 'Erro de configuração do servidor' });
    }

    const payload = jwt.verify(token, jwtSecret) as JWTPayload;

    // Verificações extras de segurança
    if (!payload.id || !payload.email) {
      console.warn('🚨 AUTH: Token válido mas payload incompleto:', { id: payload.id, email: payload.email });
      return reply.status(401).send({ message: 'Token inválido: dados do usuário incompletos' });
    }

    // Anexar usuário à request
    request.user = payload;

    // Log de auditoria da ação autenticada
    const resource = request.url.split('?')[0]; // Remove query params do log
    auditLog(payload.id, request.method, resource, {
      userEmail: payload.email,
      userRole: payload.role,
      queryParams: Object.keys(request.query as any).length > 0 ? request.query : undefined,
      bodyPresent: request.method !== 'GET' && Object.keys(request.body || {}).length > 0
    });

    console.log(`✅ AUTH: Usuário autenticado - ${payload.email} (${payload.id})`);
  } catch (error: any) {
    console.warn('🚨 AUTH: Token inválido ou expirado:', error.message);

    // Log de tentativa de acesso com token inválido
    console.warn('🚨 SECURITY: Tentativa de acesso com token inválido', {
      ip: request.ip,
      url: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'],
      errorType: error.name
    });

    return reply.status(401).send({ message: 'Token inválido ou expirado' });
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

// Middleware adicional para verificar proprietário de recursos
export function createOwnershipMiddleware(resourceType: 'vehicle' | 'expense' | 'maintenance' | 'reminder') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;
    if (!user) {
      console.error('❌ OWNERSHIP: Middleware chamado sem usuário autenticado');
      return reply.status(401).send({ message: 'Usuário não autenticado' });
    }

    const { id } = request.params as { id: string };
    if (id) {
      // Log da verificação de propriedade
      auditLog(user.id, 'OWNERSHIP_CHECK', `${resourceType}:${id}`, {
        userEmail: user.email,
        userRole: user.role
      });
    }

    // Este middleware apenas registra, a verificação real acontece nos controllers
    console.log(`🔍 OWNERSHIP: Verificando propriedade de ${resourceType} para usuário ${user.email}`);
  };
} 
import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // TODO: Implement JWT verification
    // This is a placeholder for the actual authentication logic
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return reply.status(401).send({ message: 'User not found' })
    }

    request.user = {
      id: user.id,
      role: user.role
    }
  } catch (error) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
} 
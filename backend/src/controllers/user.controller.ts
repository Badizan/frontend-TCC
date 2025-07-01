import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseController } from './base.controller'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export class UserController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password, role, phone } = request.body as {
        name: string
        email: string
        password: string
        role?: 'ADMIN' | 'OWNER'
        phone?: string
      }

      // Verificar se o email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          message: 'Email já está em uso'
        })
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10)

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'OWNER',
          phone
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true
        }
      })

      return this.sendResponse(reply, {
        message: 'Usuário criado com sucesso',
        user
      }, 201)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vehicles: true,
              maintenances: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return this.sendResponse(reply, { users })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          vehicles: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true
            }
          },
          maintenances: {
            select: {
              id: true,
              description: true,
              status: true,
              scheduledDate: true
            },
            take: 5,
            orderBy: {
              scheduledDate: 'desc'
            }
          }
        }
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado'
        })
      }

      return this.sendResponse(reply, { user })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { name, email, role, phone, password } = request.body as {
        name?: string
        email?: string
        role?: 'ADMIN' | 'OWNER'
        phone?: string
        password?: string
      }

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado'
        })
      }

      // Se está atualizando email, verificar se não existe outro usuário com o mesmo email
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        })

        if (emailExists) {
          return reply.status(409).send({
            success: false,
            message: 'Email já está em uso por outro usuário'
          })
        }
      }

      const updateData: any = {}
      if (name) updateData.name = name
      if (email) updateData.email = email
      if (role) updateData.role = role
      if (phone) updateData.phone = phone
      if (password) {
        updateData.password = await bcrypt.hash(password, 10)
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          updatedAt: true
        }
      })

      return this.sendResponse(reply, {
        message: 'Usuário atualizado com sucesso',
        user
      })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          vehicles: true,
          maintenances: true
        }
      })

      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado'
        })
      }

      // Verificar se tem dados vinculados
      if (existingUser.vehicles.length > 0 || existingUser.maintenances.length > 0) {
        return reply.status(409).send({
          success: false,
          message: 'Não é possível excluir usuário com veículos ou manutenções vinculadas'
        })
      }

      await prisma.user.delete({
        where: { id }
      })

      return this.sendResponse(reply, {
        message: 'Usuário excluído com sucesso'
      })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.user as { id: string }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          settings: true
        }
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado'
        })
      }

      return this.sendResponse(reply, { user })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.user as { id: string }
      const { name, email, phone, currentPassword, newPassword } = request.body as {
        name?: string
        email?: string
        phone?: string
        currentPassword?: string
        newPassword?: string
      }

      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado'
        })
      }

      // Se está mudando senha, verificar senha atual
      if (newPassword) {
        if (!currentPassword) {
          return reply.status(400).send({
            success: false,
            message: 'Senha atual é obrigatória para alterar a senha'
          })
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password)
        if (!passwordMatch) {
          return reply.status(401).send({
            success: false,
            message: 'Senha atual incorreta'
          })
        }
      }

      const updateData: any = {}
      if (name) updateData.name = name
      if (email) updateData.email = email
      if (phone) updateData.phone = phone
      if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10)
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          updatedAt: true
        }
      })

      return this.sendResponse(reply, {
        message: 'Perfil atualizado com sucesso',
        user: updatedUser
      })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }
} 
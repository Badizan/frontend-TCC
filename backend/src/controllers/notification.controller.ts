import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notification.service';
import { BaseController } from './base.controller';

const notificationService = new NotificationService();

export class NotificationController extends BaseController {
  // Buscar notificações do usuário
  static async getUserNotifications(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;
      const { page = 1, limit = 20, unreadOnly = false } = request.query as any;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
      });

      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao buscar notificações');
    }
  }

  // Marcar notificação como lida
  static async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;
      const { notificationId } = request.params as any;

      await notificationService.markAsRead(notificationId, userId);

      return reply.send({
        success: true,
        message: 'Notificação marcada como lida'
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao marcar notificação como lida');
    }
  }

  // Marcar todas as notificações como lidas
  static async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;

      await notificationService.markAllAsRead(userId);

      return reply.send({
        success: true,
        message: 'Todas as notificações marcadas como lidas'
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao marcar todas as notificações como lidas');
    }
  }

  // Deletar notificação
  static async deleteNotification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;
      const { notificationId } = request.params as any;

      await notificationService.deleteNotification(notificationId, userId);

      return reply.send({
        success: true,
        message: 'Notificação removida'
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao remover notificação');
    }
  }

  // Contar notificações não lidas
  static async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;

      const count = await notificationService.getUnreadCount(userId);

      return reply.send({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao contar notificações não lidas');
    }
  }

  // Salvar subscription de push notifications
  static async savePushSubscription(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;
      const { subscription } = request.body as any;

      await notificationService.savePushSubscription(userId, subscription);

      return reply.send({
        success: true,
        message: 'Subscription salva com sucesso'
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao salvar subscription');
    }
  }

  // Criar notificação manual (para admins)
  static async createNotification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId, type, title, message, channel, scheduledFor } = request.body as any;

      const notification = await notificationService.createNotification({
        userId,
        type,
        title,
        message,
        channel,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      });

      return reply.send({
        success: true,
        data: notification,
        message: 'Notificação criada com sucesso'
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao criar notificação');
    }
  }

  // Testar notificação push
  static async testPushNotification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user as any;

      await notificationService.createNotification({
        userId,
        type: 'SYSTEM_UPDATE',
        title: 'Notificação de Teste',
        message: 'Esta é uma notificação de teste para verificar se o sistema está funcionando.',
        channel: 'PUSH'
      });

      return reply.send({
        success: true,
        message: 'Notificação de teste enviada'
      });
    } catch (error) {
      return this.handleError(reply, error, 'Erro ao enviar notificação de teste');
    }
  }
} 
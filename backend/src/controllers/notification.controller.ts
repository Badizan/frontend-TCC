import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

// Removido AuthenticatedRequest - usando FastifyRequest diretamente

export class NotificationController extends BaseController {
  private notificationService: NotificationService;
  private emailService: EmailService;

  constructor() {
    super();
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
  }

  // Obter todas as notificações do usuário
  public getNotifications = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      const { page = 1, limit = 10, unreadOnly = false, category, channel } = req.query as any;

      const notifications = await this.notificationService.getUserNotifications(userId, {
        page: Number(page),
        limit: Number(limit),
        unreadOnly: Boolean(unreadOnly),
        category: category as string,
        channel: channel as 'IN_APP' | 'EMAIL'
      });

      return this.sendResponse(reply, notifications);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Marcar notificação como lida
  public markAsRead = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      const { notificationId } = req.params as any;

      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      await this.notificationService.markAsRead(notificationId, userId);
      return this.sendResponse(reply, { message: 'Notification marked as read' });
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Marcar todas as notificações como lidas
  public markAllAsRead = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      await this.notificationService.markAllAsRead(userId);
      return this.sendResponse(reply, { message: 'All notifications marked as read' });
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Excluir uma notificação
  public deleteNotification = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      const { notificationId } = req.params as any;

      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      await this.notificationService.deleteNotification(notificationId, userId);
      return this.sendResponse(reply, { message: 'Notification deleted' });
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Obter configurações de notificação
  public getNotificationSettings = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      const settings = await this.notificationService.getNotificationSettings(userId);
      return this.sendResponse(reply, settings);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Atualizar configurações de notificação
  public updateNotificationSettings = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      const settings = req.body as any;
      await this.notificationService.updateNotificationSettings(userId, settings);
      return this.sendResponse(reply, { message: 'Notification settings updated' });
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Enviar email de teste
  public sendTestEmail = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      const user = await this.notificationService.getUserById(userId);
      if (!user || !user.email) {
        return reply.status(400).send({ message: 'User email not found' });
      }

      await this.emailService.sendTestEmail(user.email);
      return this.sendResponse(reply, { message: 'Test email sent successfully' });
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };

  // Obter notificações não lidas
  public getUnreadNotifications = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      const notifications = await this.notificationService.getUserNotifications(userId, {
        page: 1,
        limit: 100,
        unreadOnly: true
      });
      return this.sendResponse(reply, notifications);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  };
} 
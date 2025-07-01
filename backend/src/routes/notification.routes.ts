import { FastifyInstance } from 'fastify'
import { NotificationController } from '../controllers/notification.controller'
import { authMiddleware } from '../middlewares/auth'

const notificationController = new NotificationController()

export async function notificationRoutes(app: FastifyInstance) {
    // Notification routes
    app.get('/', {
        preHandler: authMiddleware
    }, notificationController.getNotifications.bind(notificationController))

    app.patch('/:notificationId/read', {
        preHandler: authMiddleware
    }, notificationController.markAsRead.bind(notificationController))

    app.patch('/read-all', {
        preHandler: authMiddleware
    }, notificationController.markAllAsRead.bind(notificationController))

    app.delete('/:notificationId', {
        preHandler: authMiddleware
    }, notificationController.deleteNotification.bind(notificationController))

    app.get('/unread', {
        preHandler: authMiddleware
    }, notificationController.getUnreadNotifications.bind(notificationController))

    // Settings routes
    app.get('/settings', {
        preHandler: authMiddleware
    }, notificationController.getNotificationSettings.bind(notificationController))

    app.put('/settings', {
        preHandler: authMiddleware
    }, notificationController.updateNotificationSettings.bind(notificationController))

    app.post('/test-email', {
        preHandler: authMiddleware
    }, notificationController.sendTestEmail.bind(notificationController))
}
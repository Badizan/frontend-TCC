import nodemailer from 'nodemailer';

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export class EmailService {
    private transporter!: nodemailer.Transporter;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        // Configuração para Gmail (pode ser alterada para outros provedores)
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'seu-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'sua-senha-de-app'
            }
        });

        // Para outros provedores, use:
        /*
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        */
    }

    // Verificar conexão
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ Email: Servidor conectado');
            return true;
        } catch (error) {
            console.error('❌ Email: Erro na conexão:', error);
            return false;
        }
    }

    // Enviar email genérico
    async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
        try {
            const mailOptions = {
                from: `"AutoManutenção" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado para ${to}: ${result.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao enviar email para ${to}:`, error);
            return false;
        }
    }

    // ================ TEMPLATES DE EMAIL ================

    // Template para lembrete de manutenção
    async sendMaintenanceReminder(
        to: string,
        userName: string,
        vehicleName: string,
        maintenanceType: string,
        dueDate: string,
        description?: string
    ): Promise<boolean> {
        const subject = `🔧 Lembrete: Manutenção do ${vehicleName}`;

        const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lembrete de Manutenção</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .alert-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 AutoManutenção</h1>
                <p>Lembrete de Manutenção</p>
            </div>
            
            <div class="content">
                <h2>Olá, ${userName}! 👋</h2>
                
                <div class="alert-box">
                    <h3>⏰ Lembrete importante sobre seu ${vehicleName}</h3>
                    <p><strong>Tipo de manutenção:</strong> ${maintenanceType}</p>
                    <p><strong>Data prevista:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR')}</p>
                    ${description ? `<p><strong>Descrição:</strong> ${description}</p>` : ''}
                </div>
                
                <p>É importante manter a manutenção em dia para:</p>
                <ul>
                    <li>✅ Garantir a segurança</li>
                    <li>✅ Evitar gastos maiores</li>
                    <li>✅ Manter a garantia</li>
                    <li>✅ Preservar o valor do veículo</li>
                </ul>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/maintenance" class="button">
                    Agendar Manutenção
                </a>
                
                <p>Se você já realizou esta manutenção, marque como concluída no app.</p>
            </div>
            
            <div class="footer">
                <p>AutoManutenção - Gestão inteligente de manutenção veicular</p>
                <p>Se você não deseja mais receber esses emails, <a href="#">clique aqui</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

        return this.sendEmail(to, subject, html);
    }

    // Template para manutenção vencida
    async sendOverdueMaintenanceAlert(
        to: string,
        userName: string,
        vehicleName: string,
        maintenanceType: string,
        daysPastDue: number
    ): Promise<boolean> {
        const subject = `⚠️ URGENTE: Manutenção do ${vehicleName} está atrasada!`;

        const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Manutenção Atrasada</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ AutoManutenção</h1>
                <p>Manutenção Atrasada</p>
            </div>
            
            <div class="content">
                <h2>Atenção, ${userName}! 🚨</h2>
                
                <div class="alert-box">
                    <h3>🚗 Seu ${vehicleName} precisa de atenção URGENTE!</h3>
                    <p><strong>Manutenção atrasada:</strong> ${maintenanceType}</p>
                    <p><strong>Dias em atraso:</strong> ${daysPastDue} dias</p>
                </div>
                
                <p>Manutenções atrasadas podem causar:</p>
                <ul>
                    <li>🔴 Riscos à segurança</li>
                    <li>🔴 Danos maiores ao veículo</li>
                    <li>🔴 Perda de garantia</li>
                    <li>🔴 Custos elevados de reparo</li>
                </ul>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/maintenance" class="button">
                    Agendar AGORA
                </a>
                
                <p><strong>Recomendação:</strong> Agende sua manutenção o quanto antes para evitar problemas maiores.</p>
            </div>
            
            <div class="footer">
                <p>AutoManutenção - Cuidando do seu veículo</p>
            </div>
        </div>
    </body>
    </html>
    `;

        return this.sendEmail(to, subject, html);
    }

    // Template para quilometragem alta
    async sendMileageAlert(
        to: string,
        userName: string,
        vehicleName: string,
        currentMileage: number,
        targetMileage: number
    ): Promise<boolean> {
        const subject = `📍 Alerta: ${vehicleName} atingiu ${currentMileage.toLocaleString()} km`;

        const html = this.generateMileageAlertTemplate({
            userName,
            vehicleName,
            currentMileage,
            targetMileage
        });

        return this.sendEmail(to, subject, html);
    }

    // Template de boas-vindas
    async sendWelcomeEmail(
        to: string,
        userName: string
    ): Promise<boolean> {
        const subject = `🎉 Bem-vindo ao AutoManutenção, ${userName}!`;

        const html = this.generateWelcomeTemplate({ userName });

        return this.sendEmail(to, subject, html);
    }

    // Template de resumo semanal
    async sendWeeklySummary(
        to: string,
        userName: string,
        summary: {
            vehiclesCount: number;
            pendingMaintenances: number;
            totalExpenses: number;
            upcomingReminders: number;
        }
    ): Promise<boolean> {
        const subject = `📊 Seu resumo semanal - AutoManutenção`;

        const html = this.generateWeeklySummaryTemplate({
            userName,
            ...summary
        });

        return this.sendEmail(to, subject, html);
    }

    // Email de teste para verificar configurações
    async sendTestEmail(to: string): Promise<boolean> {
        const subject = '🧪 Teste de Email - AutoManutenção';
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🧪 Teste de Email</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">AutoManutenção - Sistema de Gestão Veicular</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333; margin-top: 0;">✅ Email Funcionando!</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Este é um email de teste para verificar se o sistema de notificações está funcionando corretamente.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📱 Funcionar offline</h3>
                    <p style="color: #666; margin: 0;">
                        O sistema está configurado para funcionar mesmo sem conexão com a internet.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                        Acessar Sistema
                    </a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                    Este email foi enviado automaticamente pelo sistema AutoManutenção.
                </p>
            </div>
        </div>
        `;

        return this.sendEmail(to, subject, html);
    }

    // Enviar email de reset de senha
    async sendPasswordResetEmail(to: string, userName: string, resetUrl: string): Promise<boolean> {
        const subject = '🔐 Recuperação de Senha - AutoManutenção';
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🔐 Recuperação de Senha</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">AutoManutenção - Sistema de Gestão Veicular</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Recebemos uma solicitação para redefinir sua senha no sistema AutoManutenção.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">⚠️ Importante</h3>
                    <ul style="color: #666; margin: 0; padding-left: 20px;">
                        <li>Este link é válido por 1 hora</li>
                        <li>Use apenas se você solicitou a recuperação</li>
                        <li>Após usar, o link será invalidado automaticamente</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                        Redefinir Senha
                    </a>
                </div>
                
                <p style="color: #666; line-height: 1.6;">
                    Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá inalterada.
                </p>
                
                <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        <strong>Link direto:</strong> <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
                    </p>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                    Este email foi enviado automaticamente pelo sistema AutoManutenção.
                </p>
            </div>
        </div>
        `;

        return this.sendEmail(to, subject, html);
    }

    // ================ GERADORES DE TEMPLATE ================

    private generateMileageAlertTemplate(data: {
        userName: string;
        vehicleName: string;
        currentMileage: number;
        targetMileage: number;
    }): string {
        return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alerta de Quilometragem</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .alert-box { background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📍 AutoManutenção</h1>
                <p>Alerta de Quilometragem</p>
            </div>
            
            <div class="content">
                <h2>Olá, ${data.userName}! 📊</h2>
                
                <div class="alert-box">
                    <h3>🚗 ${data.vehicleName} atingiu um marco importante!</h3>
                    <p><strong>Quilometragem atual:</strong> ${data.currentMileage.toLocaleString()} km</p>
                    <p><strong>Meta atingida:</strong> ${data.targetMileage.toLocaleString()} km</p>
                </div>
                
                <p>Com essa quilometragem, é recomendado verificar:</p>
                <ul>
                    <li>🔧 Troca de óleo e filtros</li>
                    <li>🔧 Revisão dos freios</li>
                    <li>🔧 Alinhamento e balanceamento</li>
                    <li>🔧 Estado dos pneus</li>
                </ul>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vehicles" class="button">
                    Ver Recomendações
                </a>
            </div>
            
            <div class="footer">
                <p>AutoManutenção - Monitoramento inteligente</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    private generateWelcomeTemplate(data: { userName: string }): string {
        return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao AutoManutenção</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .feature-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 15px 0; border-radius: 8px; }
            .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bem-vindo ao AutoManutenção!</h1>
                <p>Sua gestão de veículos acaba de ficar mais inteligente</p>
            </div>
            
            <div class="content">
                <h2>Olá, ${data.userName}! 👋</h2>
                
                <p>Estamos muito felizes em tê-lo conosco! O AutoManutenção vai ajudar você a:</p>
                
                <div class="feature-box">
                    <h3>🚗 Gerenciar seus veículos</h3>
                    <p>Cadastre todos os seus veículos e mantenha informações organizadas</p>
                </div>
                
                <div class="feature-box">
                    <h3>⏰ Nunca esquecer manutenções</h3>
                    <p>Receba lembretes automáticos por email e notificação push</p>
                </div>
                
                <div class="feature-box">
                    <h3>💰 Controlar gastos</h3>
                    <p>Acompanhe todos os custos e tenha relatórios detalhados</p>
                </div>
                
                <div class="feature-box">
                    <h3>📱 Funcionar offline</h3>
                    <p>Use o app mesmo sem internet, tudo será sincronizado depois</p>
                </div>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vehicles/new" class="button">
                    Cadastrar Primeiro Veículo
                </a>
                
                <p>Precisa de ajuda? Nossa equipe está sempre disponível para apoiá-lo!</p>
            </div>
            
            <div class="footer">
                <p>AutoManutenção - Gestão inteligente de manutenção veicular</p>
                <p>Dúvidas? Entre em contato: suporte@automanutencao.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    private generateWeeklySummaryTemplate(data: {
        userName: string;
        vehiclesCount: number;
        pendingMaintenances: number;
        totalExpenses: number;
        upcomingReminders: number;
    }): string {
        return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resumo Semanal</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #1e40af; }
            .button { display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Resumo Semanal</h1>
                <p>Veja como foi sua semana no AutoManutenção</p>
            </div>
            
            <div class="content">
                <h2>Olá, ${data.userName}! 📈</h2>
                
                <p>Aqui está o resumo das atividades da sua frota esta semana:</p>
                
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-number">${data.vehiclesCount}</div>
                        <div>Veículos Cadastrados</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-number">${data.pendingMaintenances}</div>
                        <div>Manutenções Pendentes</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-number">R$ ${data.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div>Gastos na Semana</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-number">${data.upcomingReminders}</div>
                        <div>Lembretes Próximos</div>
                    </div>
                </div>
                
                ${data.pendingMaintenances > 0 ? `
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p><strong>⚠️ Atenção:</strong> Você tem ${data.pendingMaintenances} manutenção(ões) pendente(s). Não se esqueça de agendá-las!</p>
                </div>
                ` : ''}
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                    Ver Dashboard Completo
                </a>
                
                <p>Continue mantendo seus veículos em dia! 🚗✨</p>
            </div>
            
            <div class="footer">
                <p>AutoManutenção - Seu parceiro na gestão veicular</p>
                <p><a href="#">Alterar preferências de email</a> | <a href="#">Cancelar emails semanais</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    // Utilitário para remover HTML
    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
}

// Singleton
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
    if (!emailServiceInstance) {
        emailServiceInstance = new EmailService();
    }
    return emailServiceInstance;
} 
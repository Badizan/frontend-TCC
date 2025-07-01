import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { EmailService } from './email.service'

const prisma = new PrismaClient()
const emailService = new EmailService()
const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET não está definido nas variáveis de ambiente!')
  process.exit(1)
}

// Usuário de teste temporário para desenvolvimento
const TEST_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Usuário Teste',
  email: 'admin@test.com',
  password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt de "123456"
  role: 'OWNER'
}

export class AuthService {
  async register(name: string, email: string, password: string, role: 'ADMIN' | 'OWNER') {
    console.log('📝 AuthService: Tentando registrar usuário:', { name, email, role });

    try {
      // Verificar se é o usuário de teste e já está registrado
      if (email === TEST_USER.email) {
        console.log('❌ AuthService: Tentativa de registrar usuário de teste existente');
        throw new Error('Este email já está registrado no sistema');
      }

      // Verificar se o usuário já existe no banco
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log('❌ AuthService: Email já registrado:', email);
        throw new Error('Este email já está registrado. Tente fazer login ou use outro email.');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        }
      });

      console.log('✅ AuthService: Usuário registrado com sucesso:', email);

      // Retornar apenas sucesso, sem fazer login automático
      return {
        success: true,
        message: 'Conta criada com sucesso! Faça login para continuar.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error: any) {
      console.error('❌ AuthService: Erro no registro:', error.message);

      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        // Violação de constraint única (email duplicado)
        throw new Error('Este email já está registrado. Tente fazer login ou use outro email.');
      }

      // Tratar outros erros específicos
      if (error.message.includes('já está registrado')) {
        throw error; // Re-lançar erro de validação própria
      }

      // Para outros erros, lançar erro genérico
      throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
    }
  }

  async login(email: string, password: string) {
    console.log('🔑 AuthService: Tentando login para:', email);

    // Verificar usuário de teste primeiro
    if (email === TEST_USER.email) {
      console.log('🔑 AuthService: Verificando usuário de teste...');

      let validPassword = false;

      // Aceita tanto a senha direta quanto o hash
      if (password === '123456') {
        validPassword = true;
      } else {
        validPassword = await bcrypt.compare(password, TEST_USER.password);
      }

      if (!validPassword) {
        console.log('❌ AuthService: Senha inválida para usuário de teste');
        throw new Error('Email ou senha incorretos');
      }

      const token = jwt.sign(
        { userId: TEST_USER.id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ AuthService: Login bem-sucedido (usuário de teste)');

      return {
        user: {
          id: TEST_USER.id,
          name: TEST_USER.name,
          email: TEST_USER.email,
          role: TEST_USER.role
        },
        token
      };
    }

    try {
      // Tentar buscar no banco
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('❌ AuthService: Usuário não encontrado:', email);
        throw new Error('Email ou senha incorretos');
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        console.log('❌ AuthService: Senha inválida para:', email);
        throw new Error('Email ou senha incorretos');
      }

      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ AuthService: Login bem-sucedido:', email);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error: any) {
      console.error('❌ AuthService: Erro no login:', error.message);

      // Se já é um erro de credenciais, re-lança
      if (error.message.includes('Email ou senha incorretos')) {
        throw error;
      }

      // Para outros erros de banco, lança erro genérico
      throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
    }
  }

  async forgotPassword(email: string) {
    console.log('🔄 AuthService: Processando esqueci senha para:', email);

    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log('⚠️ AuthService: Email não encontrado (não revelando por segurança):', email);
        // Não revelar se o email existe ou não por segurança
        return { message: 'Se o email existir, você receberá um link de recuperação' }
      }

      // Gerar token único
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      // Salvar token no banco
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt
        }
      })

      // Enviar email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`

      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl
      )

      if (emailSent) {
        console.log('✅ AuthService: Email de recuperação enviado para:', email);
      } else {
        console.log('⚠️ AuthService: Erro ao enviar email, mas token criado');
      }

      return { message: 'Se o email existir, você receberá um link de recuperação' }
    } catch (error: any) {
      console.error('❌ AuthService: Erro em esqueci senha:', error.message);

      // Mesmo com erro, não revelar se o email existe
      return { message: 'Se o email existir, você receberá um link de recuperação' }
    }
  }

  async resetPassword(token: string, newPassword: string) {
    console.log('🔄 AuthService: Processando reset de senha...');

    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      })

      if (!resetToken) {
        console.log('❌ AuthService: Token de reset inválido');
        throw new Error('Invalid or expired reset token')
      }

      if (resetToken.expiresAt < new Date()) {
        console.log('❌ AuthService: Token de reset expirado');

        // Limpar token expirado
        await prisma.passwordResetToken.delete({
          where: { token }
        })

        throw new Error('Invalid or expired reset token')
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Atualizar senha do usuário
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      })

      // Limpar token usado
      await prisma.passwordResetToken.delete({
        where: { token }
      })

      console.log('✅ AuthService: Senha redefinida com sucesso');

      return { message: 'Password reset successfully' }
    } catch (error: any) {
      console.error('❌ AuthService: Erro ao redefinir senha:', error.message);
      throw error
    }
  }

  async validateResetToken(token: string) {
    console.log('🔍 AuthService: Validando token de reset...');

    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token }
      })

      const isValid = resetToken && resetToken.expiresAt > new Date()

      console.log('✅ AuthService: Token validado:', { isValid });

      return isValid
    } catch (error: any) {
      console.error('❌ AuthService: Erro ao validar token:', error.message);
      return false
    }
  }
} 
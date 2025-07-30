import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'

const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 segundos

export class DatabaseService {
  private prisma: PrismaClient
  private app?: FastifyInstance
  private isConnected: boolean = false

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'query', emit: 'event' },
      ],
      errorFormat: 'pretty',
    })

    // Configurar event listeners
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.prisma.$on('warn', (e) => {
      this.app?.log.warn(e)
    })

    this.prisma.$on('info', (e) => {
      this.app?.log.info(e)
    })

    this.prisma.$on('error', (e) => {
      this.app?.log.error(e)
    })

    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        this.app?.log.debug(e)
      })
    }
  }

  setApp(app: FastifyInstance) {
    this.app = app
  }

  async connect(retries = MAX_RETRIES): Promise<void> {
    try {
      this.app?.log.info('📊 Conectando ao banco de dados...')
      await this.prisma.$connect()
      this.isConnected = true
      this.app?.log.info('✅ Conexão com banco de dados estabelecida')
    } catch (error) {
      this.app?.log.error(error, `❌ Erro ao conectar ao banco de dados`)
      
      if (retries > 0) {
        this.app?.log.info(`⏳ Tentando reconectar em ${RETRY_DELAY / 1000}s... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        return this.connect(retries - 1)
      }
      
      throw new Error('Não foi possível conectar ao banco de dados após múltiplas tentativas')
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      this.isConnected = false
      this.app?.log.info('📊 Desconectado do banco de dados')
    } catch (error) {
      this.app?.log.error(error, 'Erro ao desconectar do banco de dados')
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return {
        status: 'healthy',
        message: 'Banco de dados está operacional'
      }
    } catch (error) {
      this.app?.log.error(error, 'Health check do banco falhou')
      return {
        status: 'unhealthy',
        message: 'Banco de dados não está respondendo'
      }
    }
  }

  getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error('Banco de dados não está conectado')
    }
    return this.prisma
  }

  // Método para executar transações com retry
  async executeTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    retries = 3
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(fn)
    } catch (error: any) {
      this.app?.log.error(error, 'Erro na transação')
      
      // Retry em caso de deadlock ou timeout
      if (retries > 0 && (error.code === 'P2034' || error.code === 'P2024')) {
        this.app?.log.info(`Retry de transação... (${retries} tentativas restantes)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.executeTransaction(fn, retries - 1)
      }
      
      throw error
    }
  }

  // Método para lidar com erros do Prisma
  handlePrismaError(error: any): { statusCode: number; message: string } {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'campo'
      return {
        statusCode: 409,
        message: `Já existe um registro com este ${field}`
      }
    }

    // Record not found
    if (error.code === 'P2025') {
      return {
        statusCode: 404,
        message: 'Registro não encontrado'
      }
    }

    // Foreign key constraint
    if (error.code === 'P2003') {
      return {
        statusCode: 400,
        message: 'Referência inválida'
      }
    }

    // Database connection error
    if (error.code === 'P1001') {
      return {
        statusCode: 503,
        message: 'Banco de dados indisponível'
      }
    }

    // Default error
    return {
      statusCode: 500,
      message: 'Erro interno do servidor'
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService()
export default databaseService
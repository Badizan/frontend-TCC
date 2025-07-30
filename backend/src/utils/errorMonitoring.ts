import { FastifyInstance } from 'fastify'
import { logger, logError } from '../config/logger'

interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsByStatusCode: Record<number, number>
  errorsByEndpoint: Record<string, number>
  lastErrors: ErrorInfo[]
}

interface ErrorInfo {
  timestamp: Date
  message: string
  statusCode?: number
  endpoint?: string
  userId?: string
  stack?: string
  type: string
}

class ErrorMonitor {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsByStatusCode: {},
    errorsByEndpoint: {},
    lastErrors: []
  }

  private maxErrorHistory = 100
  private errorRateWindow = 60000 // 1 minuto
  private errorTimestamps: number[] = []
  private alertThreshold = 50 // 50 erros por minuto

  recordError(error: Error, context?: {
    statusCode?: number
    endpoint?: string
    userId?: string
  }) {
    const errorInfo: ErrorInfo = {
      timestamp: new Date(),
      message: error.message,
      statusCode: context?.statusCode,
      endpoint: context?.endpoint,
      userId: context?.userId,
      stack: error.stack,
      type: error.name || 'UnknownError'
    }

    // Atualizar métricas
    this.metrics.totalErrors++
    
    // Contabilizar por tipo
    this.metrics.errorsByType[errorInfo.type] = 
      (this.metrics.errorsByType[errorInfo.type] || 0) + 1
    
    // Contabilizar por status code
    if (context?.statusCode) {
      this.metrics.errorsByStatusCode[context.statusCode] = 
        (this.metrics.errorsByStatusCode[context.statusCode] || 0) + 1
    }
    
    // Contabilizar por endpoint
    if (context?.endpoint) {
      this.metrics.errorsByEndpoint[context.endpoint] = 
        (this.metrics.errorsByEndpoint[context.endpoint] || 0) + 1
    }

    // Adicionar ao histórico
    this.metrics.lastErrors.unshift(errorInfo)
    if (this.metrics.lastErrors.length > this.maxErrorHistory) {
      this.metrics.lastErrors.pop()
    }

    // Verificar taxa de erro
    this.checkErrorRate()

    // Logar erro
    logError(error, 'ErrorMonitor', context)
  }

  private checkErrorRate() {
    const now = Date.now()
    
    // Limpar timestamps antigos
    this.errorTimestamps = this.errorTimestamps.filter(
      timestamp => now - timestamp < this.errorRateWindow
    )
    
    // Adicionar timestamp atual
    this.errorTimestamps.push(now)
    
    // Verificar se excedeu o threshold
    if (this.errorTimestamps.length > this.alertThreshold) {
      logger.fatal({
        errorRate: this.errorTimestamps.length,
        window: this.errorRateWindow,
        threshold: this.alertThreshold
      }, 'ALERTA: Taxa de erro crítica detectada!')
      
      // Aqui você poderia enviar alertas por email, Slack, etc.
      this.sendAlert()
    }
  }

  private sendAlert() {
    // Implementar envio de alertas (email, Slack, PagerDuty, etc.)
    // Por enquanto, apenas log
    logger.error({
      metrics: this.getMetrics(),
      topErrors: this.getTopErrors()
    }, 'Sistema em estado crítico - muitos erros detectados')
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics }
  }

  getTopErrors(limit = 5): Array<{ type: string; count: number }> {
    return Object.entries(this.metrics.errorsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }))
  }

  getErrorRate(): number {
    const now = Date.now()
    const recentErrors = this.errorTimestamps.filter(
      timestamp => now - timestamp < this.errorRateWindow
    )
    return recentErrors.length
  }

  reset() {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByStatusCode: {},
      errorsByEndpoint: {},
      lastErrors: []
    }
    this.errorTimestamps = []
  }

  // Método para expor métricas em formato Prometheus
  getPrometheusMetrics(): string {
    const lines: string[] = [
      '# HELP app_errors_total Total number of errors',
      '# TYPE app_errors_total counter',
      `app_errors_total ${this.metrics.totalErrors}`,
      '',
      '# HELP app_errors_by_type Number of errors by type',
      '# TYPE app_errors_by_type counter'
    ]

    for (const [type, count] of Object.entries(this.metrics.errorsByType)) {
      lines.push(`app_errors_by_type{type="${type}"} ${count}`)
    }

    lines.push('')
    lines.push('# HELP app_errors_by_status_code Number of errors by status code')
    lines.push('# TYPE app_errors_by_status_code counter')

    for (const [code, count] of Object.entries(this.metrics.errorsByStatusCode)) {
      lines.push(`app_errors_by_status_code{code="${code}"} ${count}`)
    }

    lines.push('')
    lines.push('# HELP app_error_rate Current error rate per minute')
    lines.push('# TYPE app_error_rate gauge')
    lines.push(`app_error_rate ${this.getErrorRate()}`)

    return lines.join('\n')
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor()

// Middleware para monitorar erros
export function setupErrorMonitoring(app: FastifyInstance) {
  // Adicionar rota para métricas
  app.get('/metrics', async (request, reply) => {
    return reply
      .type('text/plain')
      .send(errorMonitor.getPrometheusMetrics())
  })

  // Adicionar rota para dashboard de erros (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    app.get('/errors/dashboard', async (request, reply) => {
      return reply.send({
        metrics: errorMonitor.getMetrics(),
        topErrors: errorMonitor.getTopErrors(10),
        errorRate: errorMonitor.getErrorRate(),
        status: errorMonitor.getErrorRate() > 10 ? 'critical' : 'healthy'
      })
    })
  }

  // Hook para capturar todos os erros
  app.setErrorHandler((error, request, reply) => {
    errorMonitor.recordError(error, {
      statusCode: reply.statusCode || 500,
      endpoint: `${request.method} ${request.url}`,
      userId: (request as any).user?.id
    })

    // Delegar para o handler padrão
    app.errorHandler(error, request, reply)
  })
}

export default errorMonitor
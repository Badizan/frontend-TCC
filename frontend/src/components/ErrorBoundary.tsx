import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showReport?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log estruturado do erro
    const errorData = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    console.error('🚨 React Error Boundary:', errorData);

    // Em produção, você pode enviar este erro para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorData);
    }
  }

  private getCurrentUserId(): string | null {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        return payload.id || null;
      }
    } catch {
      // Ignorar erros ao obter ID do usuário
    }
    return null;
  }

  private reportError(errorData: any) {
    // Implementar envio para serviço de monitoramento
    // Por exemplo: Sentry, LogRocket, etc.
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Falha silenciosa se não conseguir reportar
      });
    } catch {
      // Falha silenciosa
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Detalhes do erro copiados para a área de transferência');
      })
      .catch(() => {
        alert('Não foi possível copiar os detalhes do erro');
      });
  };

  render() {
    if (this.state.hasError) {
      // Se um fallback personalizado foi fornecido, usar ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderizar interface de erro padrão
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Oops! Algo deu errado
              </h1>
              
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para corrigir o problema.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">ID do Erro:</p>
                <p className="text-sm font-mono text-gray-800">{this.state.errorId}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Ir para o início
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recarregar página
                </button>
              </div>

              {(this.props.showReport || process.env.NODE_ENV === 'development') && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={this.copyErrorDetails}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
                  >
                    <Bug className="w-4 h-4" />
                    Copiar detalhes do erro
                  </button>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        Detalhes técnicos (desenvolvimento)
                      </summary>
                      <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                        <div className="mb-2">
                          <strong>Erro:</strong> {this.state.error?.message}
                        </div>
                        <div className="mb-2">
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                        </div>
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para envolver componentes com Error Boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook para reportar erros manualmente
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: any) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('🚨 Manual Error Report:', errorData);

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData)
        }).catch(() => {
          // Falha silenciosa
        });
      } catch {
        // Falha silenciosa
      }
    }
  };

  return { reportError };
};

export default ErrorBoundary;
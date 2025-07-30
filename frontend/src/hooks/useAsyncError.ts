import { useCallback, useState } from 'react';
import { useErrorHandler } from '../components/ErrorBoundary';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncErrorOptions {
  throwOnError?: boolean;
  logErrors?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Hook personalizado para gerenciar operações assíncronas com tratamento de erro
 */
export const useAsyncError = <T = any>(options: UseAsyncErrorOptions = {}) => {
  const {
    throwOnError = true,
    logErrors = true,
    retryCount = 0,
    retryDelay = 1000
  } = options;

  const { reportError } = useErrorHandler();
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Executa uma operação assíncrona com tratamento de erro automático
   */
  const execute = useCallback(async (
    asyncFn: () => Promise<T>,
    context?: any
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    let lastError: Error;
    let attempts = 0;
    const maxAttempts = retryCount + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await asyncFn();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error: any) {
        lastError = error;
        attempts++;

        if (logErrors) {
          console.error(`🚨 AsyncError (attempt ${attempts}/${maxAttempts}):`, {
            error: error.message,
            context,
            timestamp: new Date().toISOString()
          });
        }

        // Se ainda há tentativas restantes e o erro é recuperável
        if (attempts < maxAttempts && isRetryableError(error)) {
          console.warn(`⚠️ Retrying in ${retryDelay}ms... (${attempts}/${maxAttempts})`);
          await sleep(retryDelay * attempts); // Backoff progressivo
          continue;
        }

        // Erro final
        setState({ data: null, loading: false, error });

        if (logErrors) {
          reportError(error, { context, attempts, maxAttempts });
        }

        if (throwOnError) {
          throw error;
        }

        return null;
      }
    }

    return null;
  }, [throwOnError, logErrors, retryCount, retryDelay, reportError]);

  /**
   * Verifica se um erro é recuperável (pode ser tentado novamente)
   */
  const isRetryableError = (error: any): boolean => {
    // Erros de rede são geralmente recuperáveis
    if (error.code === 'NETWORK_ERROR' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'TIMEOUT') {
      return true;
    }

    // Erros 5xx do servidor são recuperáveis
    if (error.originalError?.response?.status >= 500) {
      return true;
    }

    // 429 (Too Many Requests) é recuperável
    if (error.originalError?.response?.status === 429) {
      return true;
    }

    // 408 (Request Timeout) é recuperável
    if (error.originalError?.response?.status === 408) {
      return true;
    }

    return false;
  };

  /**
   * Limpa o estado de erro
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Limpa todos os dados
   */
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  /**
   * Wrapper seguro para operações assíncronas que não devem quebrar o componente
   */
  const safeExecute = useCallback(async (
    asyncFn: () => Promise<T>,
    fallbackValue?: T,
    context?: any
  ): Promise<T | null> => {
    try {
      return await execute(asyncFn, context);
    } catch (error) {
      // Erro já foi logado pelo execute
      return fallbackValue ?? null;
    }
  }, [execute]);

  return {
    // Estado
    data: state.data,
    loading: state.loading,
    error: state.error,
    
    // Métodos
    execute,
    safeExecute,
    clearError,
    reset,
    
    // Estado derivado
    hasError: !!state.error,
    isRetryableError: state.error ? isRetryableError(state.error) : false
  };
};

/**
 * Hook simplificado para operações que só precisam de loading e error
 */
export const useAsyncOperation = (options: UseAsyncErrorOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { reportError } = useErrorHandler();
  
  const { logErrors = true } = options;

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: any
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setLoading(false);
      return result;
    } catch (error: any) {
      setLoading(false);
      setError(error);

      if (logErrors) {
        console.error('🚨 AsyncOperation Error:', {
          error: error.message,
          context,
          timestamp: new Date().toISOString()
        });

        reportError(error, context);
      }

      return null;
    }
  }, [logErrors, reportError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
    hasError: !!error
  };
};

/**
 * HOC para componentes que fazem operações assíncronas
 */
export const withAsyncErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options: UseAsyncErrorOptions = {}
) => {
  const WrappedComponent = (props: P) => {
    const asyncError = useAsyncError(options);

    return React.createElement(Component, {
      ...props,
      asyncError
    } as P);
  };

  WrappedComponent.displayName = `withAsyncErrorHandling(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default useAsyncError;
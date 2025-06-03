import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';

interface ErrorDetails {
    message: string;
    code?: string;
    stack?: string;
    context?: Record<string, any>;
    timestamp: string;
}

class ErrorService {
    private readonly MAX_ERRORS = 100;
    private errors: ErrorDetails[] = [];

    handleError(error: Error | string, context?: Record<string, any>): void {
        const errorDetails: ErrorDetails = {
            message: typeof error === 'string' ? error : error.message,
            code: typeof error === 'string' ? undefined : (error as any).code,
            stack: typeof error === 'string' ? undefined : error.stack,
            context,
            timestamp: new Date().toISOString(),
        };

        this.logError(errorDetails);
        this.notifyError(errorDetails);
        this.trackError(errorDetails);
    }

    private logError(error: ErrorDetails): void {
        console.error('Error:', error);

        this.errors.unshift(error);
        if (this.errors.length > this.MAX_ERRORS) {
            this.errors.pop();
        }
    }

    private notifyError(error: ErrorDetails): void {
        notificationService.error(
            error.message,
            'Erro',
            { duration: 0 }
        );
    }

    private trackError(error: ErrorDetails): void {
        analyticsService.trackError(new Error(error.message));
    }

    getErrors(): ErrorDetails[] {
        return [...this.errors];
    }

    clearErrors(): void {
        this.errors = [];
    }

    getLastError(): ErrorDetails | undefined {
        return this.errors[0];
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    getErrorCount(): number {
        return this.errors.length;
    }

    async exportErrors(): Promise<Blob> {
        const errorsJson = JSON.stringify(this.errors, null, 2);
        return new Blob([errorsJson], { type: 'application/json' });
    }
}

export const errorService = new ErrorService();

// Global error handler
window.addEventListener('error', (event) => {
    errorService.handleError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
    });
});

window.addEventListener('unhandledrejection', (event) => {
    errorService.handleError(event.reason, {
        type: 'unhandledrejection',
    });
}); 
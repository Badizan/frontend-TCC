// Sistema de logging que só funciona em desenvolvimento
const isDevelopment = import.meta.env.DEV;

export const logger = {
    log: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.log(message, ...args);
        }
    },

    error: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.error(message, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.warn(message, ...args);
        }
    },

    info: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.info(message, ...args);
        }
    },

    debug: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.debug(message, ...args);
        }
    }
};

// Função para logs que sempre devem aparecer (ex: erros críticos)
export const productionLogger = {
    error: (message: string, ...args: any[]) => {
        console.error(message, ...args);
    },

    warn: (message: string, ...args: any[]) => {
        console.warn(message, ...args);
    }
}; 
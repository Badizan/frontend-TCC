import api from './api';
import { notificationService } from './notification.service';

interface UploadProgress {
    progress: number;
    loaded: number;
    total: number;
}

interface UploadOptions {
    onProgress?: (progress: UploadProgress) => void;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
}

class UploadService {
    async uploadFile(file: File, url: string, options: UploadOptions = {}): Promise<string> {
        try {
            this.validateFile(file, options);

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (options.onProgress && progressEvent.total) {
                        options.onProgress({
                            progress: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                        });
                    }
                },
            });

            return response.data.url;
        } catch (error) {
            notificationService.error('Erro ao fazer upload do arquivo.');
            throw error;
        }
    }

    async uploadMultipleFiles(files: File[], url: string, options: UploadOptions = {}): Promise<string[]> {
        try {
            files.forEach(file => this.validateFile(file, options));

            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const response = await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (options.onProgress && progressEvent.total) {
                        options.onProgress({
                            progress: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                        });
                    }
                },
            });

            return response.data.urls;
        } catch (error) {
            notificationService.error('Erro ao fazer upload dos arquivos.');
            throw error;
        }
    }

    private validateFile(file: File, options: UploadOptions): void {
        if (options.maxSize && file.size > options.maxSize) {
            throw new Error(`Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(options.maxSize)}`);
        }

        if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de arquivo não permitido. Tipos permitidos: ${options.allowedTypes.join(', ')}`);
        }
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async deleteFile(url: string): Promise<void> {
        try {
            await api.delete(url);
        } catch (error) {
            notificationService.error('Erro ao deletar arquivo.');
            throw error;
        }
    }

    async deleteMultipleFiles(urls: string[]): Promise<void> {
        try {
            await api.post('/files/delete-multiple', { urls });
        } catch (error) {
            notificationService.error('Erro ao deletar arquivos.');
            throw error;
        }
    }
}

export const uploadService = new UploadService(); 
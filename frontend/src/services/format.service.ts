import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class FormatService {
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }

    formatDate(date: string | Date, formatStr = 'dd/MM/yyyy'): string {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, formatStr, { locale: ptBR });
    }

    formatDateTime(date: string | Date): string {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }

    formatPhone(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }

    formatCPF(cpf: string): string {
        const cleaned = cpf.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
        if (match) {
            return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
        }
        return cpf;
    }

    formatCNPJ(cnpj: string): string {
        const cleaned = cnpj.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
        if (match) {
            return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
        }
        return cnpj;
    }

    formatCEP(cep: string): string {
        const cleaned = cep.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{5})(\d{3})$/);
        if (match) {
            return `${match[1]}-${match[2]}`;
        }
        return cep;
    }

    formatLicensePlate(plate: string): string {
        const cleaned = plate.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}`;
        }
        return plate;
    }

    formatMileage(mileage: number): string {
        return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
    }

    formatPercentage(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value / 100);
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

export const formatService = new FormatService(); 
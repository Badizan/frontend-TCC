// Utilitários para formatação segura de dados

export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? parseLocalDate(date) : date;
        if (isNaN(dateObj.getTime())) return '-';

        return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
        return '-';
    }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? parseLocalDate(date) : date;
        if (isNaN(dateObj.getTime())) return '-';

        return dateObj.toLocaleString('pt-BR');
    } catch (error) {
        return '-';
    }
};

// Função para obter data no formato YYYY-MM-DD preservando timezone local
export const getLocalDateString = (date?: Date): string => {
    const dateObj = date || new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Função para obter data máxima (hoje) no formato YYYY-MM-DD preservando timezone local
export const getTodayString = (): string => {
    return getLocalDateString(new Date());
};

// Função para converter string de data local em Date object
export const parseLocalDate = (dateString: string): Date => {
    if (!dateString) return new Date();

    // Se a string já tem informação de timezone, usa como está
    // Verifica se é ISO string com timezone (ex: 2024-01-02T10:30:00Z ou 2024-01-02T10:30:00-03:00)
    if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+') || dateString.lastIndexOf('-') > dateString.indexOf('T'))) {
        return new Date(dateString);
    }

    // Para strings no formato YYYY-MM-DD, cria data local correta
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        if (year && month && day) {
            return new Date(year, month - 1, day);
        }
    }

    // Se já é uma data válida, retorna como está
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return new Date();
};

export const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount && amount !== 0) return 'R$ 0,00';

    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    } catch (error) {
        return `R$ ${amount}`;
    }
};

export const formatMileage = (mileage: number | null | undefined): string => {
    if (!mileage && mileage !== 0) return '-';

    try {
        return `${mileage.toLocaleString('pt-BR')} km`;
    } catch (error) {
        return '-';
    }
};

export const formatNumber = (number: number | null | undefined): string => {
    if (!number && number !== 0) return '0';

    try {
        return number.toLocaleString('pt-BR');
    } catch (error) {
        return '0';
    }
};

export const formatVehicleType = (type: string): string => {
    const types: Record<string, string> = {
        CAR: 'Carro',
        MOTORCYCLE: 'Moto',
        TRUCK: 'Caminhão',
        VAN: 'Van'
    };

    return types[type] || type;
};

export const formatMaintenanceStatus = (status: string): string => {
    const statuses: Record<string, string> = {
        SCHEDULED: 'Agendada',
        IN_PROGRESS: 'Em Progresso',
        COMPLETED: 'Concluída',
        CANCELLED: 'Cancelada'
    };

    return statuses[status] || status;
};

export const formatExpenseCategory = (category: string): string => {
    const categories: Record<string, string> = {
        maintenance: 'Manutenção',
        fuel: 'Combustível',
        insurance: 'Seguro',
        tax: 'Impostos/Taxas',
        other: 'Outros'
    };

    return categories[category] || category;
}; 
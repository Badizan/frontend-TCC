// Utilitários para formatação segura de dados

export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '-';

        return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
        return '-';
    }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '-';

        return dateObj.toLocaleString('pt-BR');
    } catch (error) {
        return '-';
    }
};

export const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount && amount !== 0) return 'R$ 0,00';

    try {
        return `R$ ${amount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    } catch (error) {
        return 'R$ 0,00';
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
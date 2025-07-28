/**
 * Utilitários para parse correto de datas preservando timezone local
 */

/**
 * Parse de data a partir de string preservando timezone local
 * Evita problemas de UTC que causam diferença de um dia
 */
export function parseLocalDate(dateString: string): Date {
    if (!dateString) return new Date();

    // Se a string já tem informação de timezone, usa como está
    // Verifica se é ISO string com timezone (ex: 2024-01-02T10:30:00Z ou 2024-01-02T10:30:00-03:00)
    if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+') || dateString.lastIndexOf('-') > dateString.indexOf('T'))) {
        return new Date(dateString);
    }

    // Para strings no formato YYYY-MM-DD, cria data local diretamente
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        if (year && month && day) {
            // Cria uma data local diretamente, sem conversão UTC
            return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
    }

    // Fallback para parsing padrão
    return new Date(dateString);
}

/**
 * Parse de data e hora preservando timezone local
 */
export function parseLocalDateTime(dateTimeString: string): Date {
    if (!dateTimeString) return new Date();

    // Se já tem timezone info, usa como está
    if (dateTimeString.includes('Z') || dateTimeString.includes('+') || dateTimeString.includes('-')) {
        return new Date(dateTimeString);
    }

    // Se tem T mas não tem timezone, assume local
    if (dateTimeString.includes('T')) {
        const [datePart, timePart] = dateTimeString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second = 0] = timePart.split(':').map(Number);

        if (year && month && day) {
            return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
        }
    }

    // Para strings simples de data, trata como parseLocalDate
    return parseLocalDate(dateTimeString);
}

/**
 * Converte Date object para string no formato YYYY-MM-DD preservando timezone local
 */
export function formatLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtém data de hoje no formato YYYY-MM-DD
 */
export function getTodayString(): string {
    return formatLocalDateString(new Date());
} 
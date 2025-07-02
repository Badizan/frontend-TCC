// Mapeamento de erros para português
export const errorMessages: { [key: string]: string } = {
    'User not found': 'Usuário não encontrado',
    'Invalid credentials': 'Email ou senha incorretos',
    'Email ou senha incorretos': 'Email ou senha incorretos',
    'Email already exists': 'Este email já está cadastrado',
    'Email already registered': 'Este email já está cadastrado',
    'Este email já está registrado no sistema': 'Este email já está cadastrado',
    'Este email já está registrado. Tente fazer login ou use outro email.': 'Este email já está cadastrado. Tente fazer login ou use outro email.',
    'Invalid email': 'Email inválido',
    'Password too short': 'Senha deve ter pelo menos 6 caracteres',
    'Passwords do not match': 'As senhas não coincidem',
    'Network error': 'Erro de conexão. Verifique sua internet',
    'Server error': 'Erro interno do servidor. Tente novamente',
    'Erro interno do servidor. Tente novamente mais tarde.': 'Erro interno do servidor. Tente novamente mais tarde.',
    'Unauthorized': 'Acesso não autorizado',
    'Token expired': 'Sessão expirada. Faça login novamente',
    'User already exists': 'Usuário já existe com este email',
    'Missing required fields': 'Preencha todos os campos obrigatórios',
    'Connection refused': 'Não foi possível conectar ao servidor',
    'ECONNREFUSED': 'Não foi possível conectar ao servidor',
    'fetch failed': 'Erro de conexão com o servidor',
    'NetworkError': 'Erro de rede. Verifique sua conexão',
    'Failed to fetch': 'Erro de conexão. Verifique se o servidor está rodando',

    // Erros específicos de veículo/placa
    'Você já possui um veículo cadastrado com a placa': 'Você já possui um veículo cadastrado com a placa',
    'Você já possui outro veículo cadastrado com a placa': 'Você já possui outro veículo cadastrado com a placa',
    'A placa': 'A placa',
    'já está cadastrada no sistema': 'já está cadastrada no sistema',
    'já está sendo usada por outro veículo': 'já está sendo usada por outro veículo',
    'Vehicle not found': 'Veículo não encontrado',
    'Access denied to this vehicle': 'Acesso negado a este veículo',
    'Invalid license plate format': 'Formato de placa inválido (ex: ABC-1234 ou ABC-1D23)',
    'License plate is required': 'Placa é obrigatória',
    'Brand is required': 'Marca é obrigatória',
    'Model is required': 'Modelo é obrigatório',
    'Year must be between 1900 and': 'Ano deve estar entre 1900 e',
    'Mileage cannot be negative': 'Quilometragem não pode ser negativa'
};

export const translateError = (error: string): string => {
    // Busca correspondência exata primeiro
    if (errorMessages[error]) {
        return errorMessages[error];
    }

    // Busca por palavras-chave
    const lowerError = error.toLowerCase();

    // Tratamento específico para erros de placa
    if (lowerError.includes('placa') || lowerError.includes('license plate')) {
        if (lowerError.includes('já está cadastrada') || lowerError.includes('already registered')) {
            return 'Esta placa já está cadastrada no sistema. Use uma placa diferente.';
        }
        if (lowerError.includes('já está sendo usada') || lowerError.includes('already in use')) {
            return 'Esta placa já está sendo usada por outro veículo. Use uma placa diferente.';
        }
        if (lowerError.includes('já possui') && lowerError.includes('veículo')) {
            return 'Você já possui um veículo com esta placa. Use uma placa diferente.';
        }
        if (lowerError.includes('invalid') || lowerError.includes('formato')) {
            return 'Formato de placa inválido. Use o formato ABC-1234 ou ABC-1D23.';
        }
        if (lowerError.includes('required') || lowerError.includes('obrigatória')) {
            return 'Placa é obrigatória. Preencha este campo.';
        }
    }

    if (lowerError.includes('email')) {
        if (lowerError.includes('registrado') || lowerError.includes('cadastrado') ||
            lowerError.includes('exists') || lowerError.includes('already') ||
            lowerError.includes('registered')) {
            return 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        }
        if (lowerError.includes('invalid') || lowerError.includes('inválido')) {
            return 'Email inválido';
        }
    }

    if (lowerError.includes('password') || lowerError.includes('senha')) {
        if (lowerError.includes('short') || lowerError.includes('length') || lowerError.includes('caracteres')) {
            return 'Senha deve ter pelo menos 6 caracteres';
        }
        if (lowerError.includes('match') || lowerError.includes('coincidem')) {
            return 'As senhas não coincidem';
        }
        if (lowerError.includes('incorrect') || lowerError.includes('incorretos')) {
            return 'Email ou senha incorretos';
        }
    }

    if (lowerError.includes('connect') || lowerError.includes('network') || lowerError.includes('econnrefused')) {
        return 'Erro de conexão. Verifique se o servidor está rodando';
    }

    if (lowerError.includes('unauthorized') || lowerError.includes('forbidden')) {
        return 'Email ou senha incorretos';
    }

    if (lowerError.includes('server') || lowerError.includes('internal') || lowerError.includes('servidor')) {
        return 'Erro interno do servidor. Tente novamente';
    }

    if (lowerError.includes('fetch')) {
        return 'Erro de conexão. Verifique se o servidor está rodando';
    }

    // Retorna erro genérico se não encontrar correspondência
    return 'Ocorreu um erro inesperado. Tente novamente';
}; 
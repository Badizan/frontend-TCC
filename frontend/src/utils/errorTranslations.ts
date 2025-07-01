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
    'Failed to fetch': 'Erro de conexão. Verifique se o servidor está rodando'
};

export const translateError = (error: string): string => {
    // Busca correspondência exata primeiro
    if (errorMessages[error]) {
        return errorMessages[error];
    }

    // Busca por palavras-chave
    const lowerError = error.toLowerCase();

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
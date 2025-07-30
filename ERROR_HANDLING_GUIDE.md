# 🛡️ Sistema de Tratamento de Erros - Guia Completo

Este documento descreve o sistema abrangente de tratamento de erros implementado no projeto AutoManutenção.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Backend - Tratamento de Erros](#backend---tratamento-de-erros)
3. [Frontend - Tratamento de Erros](#frontend---tratamento-de-erros)
4. [Tipos de Erro](#tipos-de-erro)
5. [Como Usar](#como-usar)
6. [Melhores Práticas](#melhores-práticas)
7. [Monitoramento e Logs](#monitoramento-e-logs)

## 🎯 Visão Geral

O sistema de tratamento de erros foi projetado para:

- **Capturar todos os tipos de erro** (validação, autenticação, banco de dados, rede, etc.)
- **Fornecer mensagens de erro claras** para o usuário
- **Log estruturado** para debugging e monitoramento
- **Recuperação automática** quando possível
- **Fallbacks graceful** para manter a aplicação funcionando

## 🚀 Backend - Tratamento de Erros

### Middleware Global de Erros

Localização: `backend/src/middlewares/errorHandler.ts`

O middleware global captura todos os erros e os processa de forma consistente:

```typescript
// Registrado no servidor principal
app.setErrorHandler(errorHandler)
```

### Classes de Erro Customizadas

```typescript
// Erro base
class AppError extends Error {
  statusCode: number
  code: string
  isOperational: boolean
}

// Erros específicos
class ValidationError extends AppError      // 400 - Dados inválidos
class AuthenticationError extends AppError  // 401 - Não autenticado
class AuthorizationError extends AppError   // 403 - Sem permissão
class NotFoundError extends AppError        // 404 - Não encontrado
class ConflictError extends AppError        // 409 - Conflito de dados
class DatabaseError extends AppError        // 500 - Erro de BD
class ExternalServiceError extends AppError // 503 - Serviço externo
```

### Exemplo de Uso no Controller

```typescript
// Antes (problemático)
if (!user) {
  return reply.status(404).send({ message: 'User not found' })
}

// Depois (com tratamento adequado)
if (!user) {
  throw new NotFoundError('User')
}
```

### Validação de Variáveis de Ambiente

```typescript
// No startup do servidor
validateRequiredEnvVars([
  'JWT_SECRET',
  'DATABASE_URL'
])
```

### Handlers para Erros Críticos

```typescript
// Configurado automaticamente
setupGlobalErrorHandlers()

// Captura:
// - uncaughtException
// - unhandledRejection
// - SIGINT/SIGTERM (graceful shutdown)
```

## 🎨 Frontend - Tratamento de Erros

### Error Boundary

Localização: `frontend/src/components/ErrorBoundary.tsx`

Captura erros de renderização do React:

```tsx
// Envolver componentes
<ErrorBoundary>
  <SeuComponente />
</ErrorBoundary>

// HOC para componentes
export default withErrorBoundary(SeuComponente)
```

### Hook para Tratamento de Erros Manuais

```tsx
import { useErrorHandler } from '../components/ErrorBoundary'

const { reportError } = useErrorHandler()

try {
  // operação perigosa
} catch (error) {
  reportError(error, { context: 'operação_específica' })
}
```

### Hook para Operações Assíncronas

Localização: `frontend/src/hooks/useAsyncError.ts`

```tsx
import { useAsyncError } from '../hooks/useAsyncError'

const { data, loading, error, execute, safeExecute } = useAsyncError({
  retryCount: 3,
  retryDelay: 1000
})

// Execução com retry automático
const loadData = async () => {
  await execute(async () => {
    return api.getData()
  }, { context: 'loading_data' })
}

// Execução segura (não quebra o componente)
const safeSave = async () => {
  await safeExecute(async () => {
    return api.saveData(data)
  }, null, { context: 'saving_data' })
}
```

### Serviço de API Melhorado

Localização: `frontend/src/services/api.ts`

- **Interceptors** para tratamento automático de erros HTTP
- **Retry automático** para erros recuperáveis
- **Mensagens de erro personalizadas** baseadas no status HTTP
- **Log estruturado** para debugging

```typescript
// Retry automático para erros 5xx, 429, timeouts
const response = await this.makeRequestWithRetry(
  () => this.api.get('/data'),
  { retry: true, maxRetries: 3 }
)
```

## 🏷️ Tipos de Erro

### Backend

| Tipo | Status | Quando Usar |
|------|--------|-------------|
| `ValidationError` | 400 | Dados de entrada inválidos |
| `AuthenticationError` | 401 | Token ausente/inválido |
| `AuthorizationError` | 403 | Sem permissão |
| `NotFoundError` | 404 | Recurso não encontrado |
| `ConflictError` | 409 | Dados duplicados/conflito |
| `DatabaseError` | 500 | Erro de banco de dados |
| `ExternalServiceError` | 503 | API externa indisponível |

### Frontend

| Situação | Tratamento |
|----------|------------|
| Erro de renderização | Error Boundary |
| Erro de API | Interceptor do Axios |
| Operação assíncrona | useAsyncError hook |
| Erro manual | useErrorHandler hook |

## 📖 Como Usar

### No Backend

1. **Controllers**: Use as classes de erro customizadas

```typescript
export class UserController extends BaseController {
  async getUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      
      const user = await userService.findById(id)
      if (!user) {
        throw new NotFoundError('Usuário')
      }
      
      return this.sendResponse(reply, user)
    } catch (error) {
      // O middleware global tratará o erro automaticamente
      throw error
    }
  }
}
```

2. **Services**: Lance erros específicos

```typescript
export class UserService {
  async create(userData: CreateUserData) {
    try {
      return await prisma.user.create({ data: userData })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('Email já está em uso')
      }
      throw new DatabaseError('Falha ao criar usuário')
    }
  }
}
```

### No Frontend

1. **Componentes**: Use Error Boundary

```tsx
// App.tsx
<ErrorBoundary>
  <Router>
    <Routes>
      <Route path="/" element={
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>
      } />
    </Routes>
  </Router>
</ErrorBoundary>
```

2. **Operações Assíncronas**: Use hooks especializados

```tsx
function UserList() {
  const { data, loading, error, execute } = useAsyncError({
    retryCount: 2
  })
  
  useEffect(() => {
    execute(async () => {
      return api.getUsers()
    }, { component: 'UserList' })
  }, [])
  
  if (loading) return <Loading />
  if (error) return <ErrorMessage error={error} />
  
  return <div>{/* renderizar usuários */}</div>
}
```

3. **Operações Simples**: Use useAsyncOperation

```tsx
function SaveButton({ data }) {
  const { loading, error, execute } = useAsyncOperation()
  
  const handleSave = async () => {
    await execute(async () => {
      return api.saveData(data)
    }, { action: 'save_data' })
  }
  
  return (
    <button onClick={handleSave} disabled={loading}>
      {loading ? 'Salvando...' : 'Salvar'}
      {error && <span className="error">{error.message}</span>}
    </button>
  )
}
```

## ✅ Melhores Práticas

### Geral

1. **Sempre tratar erros**: Nunca ignore erros ou use `try/catch` vazios
2. **Mensagens claras**: Forneça mensagens de erro que o usuário entenda
3. **Context adequado**: Inclua contexto suficiente nos logs
4. **Fallbacks**: Sempre tenha um plano B quando algo falha

### Backend

1. **Use classes específicas**: Não use Error genérico
2. **Valide entrada**: Use Zod para validação de dados
3. **Log estruturado**: Use o sistema de log padronizado
4. **Não vaze informações**: Não exponha stack traces em produção

```typescript
// ✅ Bom
throw new NotFoundError('Usuário')

// ❌ Ruim  
throw new Error('User with id 123 not found in database table users')
```

### Frontend

1. **Error Boundaries**: Use em pontos estratégicos da árvore de componentes
2. **Loading states**: Sempre mostre estado de carregamento
3. **Retry quando apropriado**: Para erros de rede/temporários
4. **Feedback visual**: Mostre erros de forma clara ao usuário

```tsx
// ✅ Bom
const { data, loading, error, execute } = useAsyncError()

// ❌ Ruim
const [data, setData] = useState()
// sem tratamento de loading/error
```

## 📊 Monitoramento e Logs

### Estrutura de Log

Todos os logs seguem uma estrutura consistente:

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "level": "ERROR",
  "error": {
    "name": "ValidationError",
    "message": "Email é obrigatório",
    "code": "VALIDATION_ERROR",
    "statusCode": 400
  },
  "request": {
    "method": "POST",
    "url": "/api/users",
    "ip": "192.168.1.100",
    "userId": "user-123"
  },
  "context": {
    "component": "UserRegistration",
    "action": "create_user"
  }
}
```

### Filtros de Log

- **ERROR**: Problemas críticos que quebram funcionalidade
- **WARN**: Problemas não críticos (401, 403, 404, etc.)
- **SECURITY**: Tentativas suspeitas de acesso

### Integração com Serviços de Monitoramento

O sistema está preparado para integração com:

- **Sentry**: Para tracking de erros em produção
- **LogRocket**: Para sessões de usuário
- **DataDog**: Para métricas e alertas
- **New Relic**: Para performance monitoring

```typescript
// Exemplo de integração (Error Boundary)
if (process.env.NODE_ENV === 'production') {
  this.reportError(errorData); // Envia para serviço externo
}
```

## 🚨 Casos de Emergência

### Falha Total do Backend

1. O servidor tem graceful shutdown configurado
2. Timeout de 5 segundos para finalizar operações
3. Logs detalhados sobre a causa da falha

### Falha Total do Frontend

1. Fallback HTML básico em `main.tsx`
2. Botão de reload da página
3. Limpeza automática de cache corrompido

### Recuperação de Estado

1. **Backend**: Restart automático via Docker/PM2
2. **Frontend**: Limpeza de cache e reload automático
3. **Database**: Transações para manter consistência

---

## 🔧 Configuração Adicional

### Variáveis de Ambiente

```env
# Backend
JWT_SECRET=sua-chave-secreta-forte
DATABASE_URL=postgresql://...
NODE_ENV=production

# Frontend  
VITE_API_URL=https://api.exemplo.com
VITE_SENTRY_DSN=https://...
```

### Timeouts

- **API Requests**: 10 segundos
- **Database**: 30 segundos  
- **Graceful Shutdown**: 5 segundos
- **Retry Delay**: 1-8 segundos (exponential backoff)

---

Este sistema de tratamento de erros garante que sua aplicação seja resiliente, fornecendo uma experiência consistente ao usuário mesmo quando coisas dão errado. 🛡️
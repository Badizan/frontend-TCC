# Sistema de Tratamento de Erros - AutoManutenção

## Visão Geral

Este documento descreve o sistema completo de tratamento de erros implementado no projeto AutoManutenção, incluindo validações, retry logic, circuit breakers, logging estruturado e monitoramento.

## 🛡️ Componentes do Sistema

### 1. Backend - Tratamento Global de Erros

#### Server.ts - Error Handler Global
```typescript
app.setErrorHandler((error, request, reply) => {
  // Tratamento específico por tipo de erro
  // Logging automático
  // Resposta padronizada
})
```

**Tipos de erro tratados:**
- Erros de validação (Zod)
- Erros de autenticação (401)
- Erros de autorização (403)
- Erros de recurso não encontrado (404)
- Erros de conflito (409)
- Erros internos (500)

#### Base Controller - Tratamento Padronizado
- Validação de IDs (formato UUID)
- Tratamento de erros do Prisma
- Respostas padronizadas
- Métodos auxiliares para validação

### 2. Banco de Dados - Resiliência

#### DatabaseService (config/database.ts)
- **Retry automático**: Até 3 tentativas com delay de 5s
- **Health checks**: Verificação periódica da conexão
- **Transações com retry**: Para deadlocks e timeouts
- **Tratamento de erros Prisma**: Mensagens amigáveis

### 3. Frontend - Tratamento de Erros na API

#### ApiService (services/api.ts)
- **Retry Logic**: 3 tentativas para erros de rede/servidor
- **Circuit Breaker**: Proteção contra falhas em cascata
- **Tipos de erro customizados**:
  - `NetworkError`: Problemas de conexão
  - `ValidationError`: Dados inválidos
  - `AuthenticationError`: Não autorizado
  - `NotFoundError`: Recurso não encontrado
  - `ApiError`: Erro genérico com detalhes

#### Configurações:
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const CIRCUIT_BREAKER_THRESHOLD = 5; // falhas consecutivas
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 segundos
```

### 4. Logging Estruturado

#### Logger Configuration (config/logger.ts)
- **Desenvolvimento**: Logs coloridos e formatados
- **Produção**: JSON estruturado
- **Níveis**: debug, info, warn, error, fatal
- **Redação automática**: Senhas, tokens, dados sensíveis

#### Tipos de Logger:
1. **Logger Principal**: Logs gerais da aplicação
2. **Error Logger**: Erros críticos
3. **Audit Logger**: Ações de segurança
4. **Performance Logger**: Métricas de performance

### 5. Monitoramento de Erros

#### ErrorMonitor (utils/errorMonitoring.ts)
- **Métricas coletadas**:
  - Total de erros
  - Erros por tipo
  - Erros por status code
  - Erros por endpoint
  - Taxa de erro por minuto

- **Alertas automáticos**: Quando taxa > 50 erros/minuto
- **Endpoint de métricas**: `/metrics` (formato Prometheus)
- **Dashboard de erros**: `/errors/dashboard` (desenvolvimento)

## 📊 Fluxo de Tratamento de Erros

```
1. Erro ocorre no sistema
   ↓
2. Capturado pelo try/catch local ou middleware
   ↓
3. Logged com contexto completo
   ↓
4. Métricas atualizadas no ErrorMonitor
   ↓
5. Resposta padronizada enviada ao cliente
   ↓
6. Cliente tenta retry se aplicável
   ↓
7. Circuit breaker ativado se muitas falhas
```

## 🔧 Configuração e Uso

### Variáveis de Ambiente
```env
NODE_ENV=production|development|test
LOG_LEVEL=debug|info|warn|error
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
```

### Exemplo de Uso no Controller
```typescript
async create(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Validar entrada
    const data = createSchema.parse(request.body);
    
    // Validar ID se necessário
    this.validateId(data.vehicleId, 'veículo');
    
    // Processar...
    const result = await service.create(data);
    
    return this.sendResponse(reply, result, 201);
  } catch (error) {
    // Tratamento automático baseado no tipo de erro
    return this.sendError(reply, error);
  }
}
```

### Exemplo de Uso no Frontend
```typescript
try {
  const vehicles = await api.getVehicles();
  // Processar veículos...
} catch (error) {
  if (error instanceof NetworkError) {
    // Mostrar mensagem de conexão
  } else if (error instanceof ValidationError) {
    // Mostrar erros de validação
  } else {
    // Erro genérico
  }
}
```

## 🚨 Monitoramento

### Verificar Status do Sistema
```bash
# Health check
curl http://localhost:3000/health

# Métricas (Prometheus)
curl http://localhost:3000/metrics

# Dashboard de erros (dev only)
curl http://localhost:3000/errors/dashboard
```

### Resposta do Health Check
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T10:00:00.000Z",
  "services": {
    "api": "healthy",
    "database": {
      "status": "healthy",
      "message": "Banco de dados está operacional"
    }
  }
}
```

## 🔍 Debugging

### Logs Estruturados
```bash
# Ver todos os logs
npm run dev

# Filtrar por nível
LOG_LEVEL=debug npm run dev

# Logs em produção (JSON)
NODE_ENV=production npm start | jq
```

### Analisar Erros
1. Verificar `/errors/dashboard` para visão geral
2. Consultar logs para stack traces completos
3. Verificar métricas em `/metrics`
4. Analisar padrões de erro por endpoint/tipo

## 📈 Melhores Práticas

1. **Sempre use try/catch** em operações assíncronas
2. **Valide entrada** com Zod schemas
3. **Use tipos de erro específicos** para diferentes situações
4. **Inclua contexto** nos logs (userId, endpoint, etc)
5. **Monitore métricas** regularmente
6. **Configure alertas** para taxas de erro altas
7. **Teste cenários de erro** em desenvolvimento

## 🔒 Segurança

- Senhas e tokens são automaticamente censurados nos logs
- Mensagens de erro em produção não expõem detalhes internos
- Stack traces completos apenas em desenvolvimento
- Auditoria automática de ações sensíveis

## 🚀 Performance

- Circuit breaker previne sobrecarga em falhas
- Retry com backoff exponencial
- Conexões de banco com pool e retry
- Logs assíncronos para não bloquear requisições

## 📝 Conclusão

O sistema de tratamento de erros implementado fornece:
- ✅ Resiliência contra falhas
- ✅ Visibilidade completa de problemas
- ✅ Experiência consistente para usuários
- ✅ Facilidade de debugging
- ✅ Monitoramento proativo
- ✅ Segurança adequada

Para adicionar novos tipos de erro ou modificar o comportamento, consulte os arquivos mencionados neste documento.
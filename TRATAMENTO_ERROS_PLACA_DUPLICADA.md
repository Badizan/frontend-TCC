# Tratamento de Erros - Placa Duplicada

## Problema Identificado

**Erro**: `Failed to load resource: the server responded with a status of 400 (Bad Request)`

**Causa**: Ao tentar editar um veículo e colocar uma placa que já existe em outro veículo, o sistema não estava tratando adequadamente esse erro, causando uma experiência ruim para o usuário.

## Solução Implementada

### 🔧 **Backend - Melhorias no VehicleService**

#### **1. Validação Customizada no Update**
```typescript
// Verificar se o mesmo proprietário já tem outro veículo com esta placa
const existingVehicle = await prisma.vehicle.findFirst({
    where: {
        licensePlate: normalizedPlate,
        ownerId: currentVehicle.ownerId,  // Mesmo proprietário
        NOT: { id: id }  // Excluir o veículo atual da verificação
    }
});

if (existingVehicle) {
    throw new Error(`Você já possui outro veículo cadastrado com a placa ${normalizedPlate}`);
}
```

#### **2. Tratamento de Erros Específico**
```typescript
} catch (error: any) {
    if (error.code === 'P2025') {
        throw new Error('Veículo não encontrado')
    }

    if (error.code === 'P2002') {
        if (error.meta?.target?.includes('licensePlate')) {
            throw new Error(`A placa ${data.licensePlate} já está cadastrada no sistema`)
        }
    }

    // Se é um erro que já foi tratado (nossa validação customizada)
    if (error.message && error.message.includes('já possui outro veículo')) {
        throw error
    }

    console.error('❌ VehicleService: Erro não tratado no update:', error)
    throw new Error('Erro interno ao atualizar veículo')
}
```

### 🎯 **Backend - Melhorias no VehicleController**

#### **1. Tratamento Específico de Erros**
```typescript
} catch (error) {
    console.error('❌ VehicleController: Erro ao atualizar veículo:', error);
    
    // Tratamento específico para erros de placa duplicada
    if (error instanceof Error) {
        if (error.message.includes('já possui outro veículo')) {
            console.log('🚨 VehicleController: Tentativa de usar placa duplicada:', error.message);
            return reply.status(400).send({
                message: error.message,
                statusCode: 400,
                errorType: 'DUPLICATE_LICENSE_PLATE'
            });
        }
        
        if (error.message.includes('já está cadastrada no sistema')) {
            console.log('🚨 VehicleController: Placa já existe no sistema:', error.message);
            return reply.status(400).send({
                message: error.message,
                statusCode: 400,
                errorType: 'LICENSE_PLATE_EXISTS'
            });
        }
    }
    
    return this.sendError(reply, error as Error);
}
```

### 🎨 **Frontend - Melhorias no Store**

#### **1. Tratamento de Erros no Store**
```typescript
} catch (error: any) {
    console.error('❌ Store: Erro ao atualizar veículo:', error);
    set({ loading: false });
    
    // Tratamento específico para erros de placa duplicada
    if (error.response?.data?.errorType === 'DUPLICATE_LICENSE_PLATE' || 
        error.response?.data?.errorType === 'LICENSE_PLATE_EXISTS') {
        throw new Error(error.response.data.message || 'Placa já está em uso');
    }
    
    // Se é um erro de rede ou outro tipo
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    
    throw error;
}
```

### 🌐 **Frontend - Melhorias na Tradução de Erros**

#### **1. Traduções Específicas**
```typescript
// Erros específicos de veículo/placa
'Você já possui um veículo cadastrado com a placa': 'Você já possui um veículo cadastrado com a placa',
'Você já possui outro veículo cadastrado com a placa': 'Você já possui outro veículo cadastrado com a placa',
'Placa já está em uso': 'Esta placa já está sendo usada por outro veículo',
```

#### **2. Lógica de Tradução Inteligente**
```typescript
// Tratamento específico para erros de placa
if (lowerError.includes('placa') || lowerError.includes('license plate')) {
    if (lowerError.includes('já está cadastrada') || lowerError.includes('already registered')) {
        return 'Esta placa já está cadastrada no sistema. Use uma placa diferente.';
    }
    if (lowerError.includes('já está sendo usada') || lowerError.includes('already in use') || lowerError.includes('em uso')) {
        return 'Esta placa já está sendo usada por outro veículo. Use uma placa diferente.';
    }
    if (lowerError.includes('já possui') && (lowerError.includes('veículo') || lowerError.includes('outro'))) {
        return 'Você já possui um veículo com esta placa. Use uma placa diferente.';
    }
    // Captura genérica para qualquer erro de placa
    return 'Erro relacionado à placa do veículo. Verifique se a placa está correta e não está sendo usada por outro veículo.';
}
```

## Tipos de Erro Tratados

### 🚨 **DUPLICATE_LICENSE_PLATE**
- **Quando**: Usuário tenta usar uma placa que já possui em outro veículo
- **Mensagem**: "Você já possui outro veículo cadastrado com a placa ABC-1234"
- **Ação**: Sugerir usar uma placa diferente

### 🚨 **LICENSE_PLATE_EXISTS**
- **Quando**: Placa já existe no sistema (pode ser de outro usuário)
- **Mensagem**: "A placa ABC-1234 já está cadastrada no sistema"
- **Ação**: Sugerir usar uma placa diferente

### 🚨 **GENERIC_PLATE_ERROR**
- **Quando**: Qualquer outro erro relacionado à placa
- **Mensagem**: "Erro relacionado à placa do veículo. Verifique se a placa está correta..."
- **Ação**: Orientar o usuário a verificar a placa

## Fluxo de Tratamento de Erro

### 📋 **1. Validação no Backend**
```
VehicleController.update() 
  ↓
VehicleService.update() 
  ↓
Validação customizada de placa duplicada
  ↓
Erro específico lançado
```

### 📋 **2. Tratamento no Controller**
```
Erro capturado no catch
  ↓
Verificação do tipo de erro
  ↓
Resposta HTTP com errorType específico
```

### 📋 **3. Tratamento no Frontend**
```
Store recebe erro
  ↓
Verificação do errorType
  ↓
Tradução da mensagem
  ↓
Exibição para o usuário
```

## Benefícios da Implementação

### ✅ **Experiência do Usuário**
- **Mensagens claras**: O usuário entende exatamente qual é o problema
- **Orientações específicas**: Sugestões de como resolver o problema
- **Feedback imediato**: Erro é exibido rapidamente

### ✅ **Debugging**
- **Logs detalhados**: Cada erro é logado com contexto específico
- **ErrorType**: Identificação clara do tipo de erro
- **Rastreabilidade**: Fácil identificação da origem do problema

### ✅ **Manutenibilidade**
- **Código organizado**: Tratamento de erro centralizado
- **Traduções reutilizáveis**: Sistema de tradução extensível
- **Consistência**: Mesmo padrão para todos os erros

### ✅ **Segurança**
- **Validação robusta**: Verificação tanto no frontend quanto no backend
- **Sanitização**: Placas são normalizadas antes da validação
- **Autorização**: Verificação de propriedade do veículo

## Testes Realizados

### ✅ **Cenários Testados**
1. **Editar veículo com placa existente** - Erro específico retornado
2. **Criar veículo com placa duplicada** - Erro específico retornado
3. **Placa de outro usuário** - Erro de placa já cadastrada
4. **Placa do mesmo usuário** - Erro de veículo duplicado
5. **Formato de placa inválido** - Erro de formato
6. **Placa vazia** - Erro de campo obrigatório

### ✅ **Validações**
- ✅ Mensagens de erro são claras e específicas
- ✅ ErrorType é retornado corretamente
- ✅ Traduções funcionam adequadamente
- ✅ Logs são exibidos no console
- ✅ Frontend exibe erro de forma amigável

## Status da Implementação

✅ **Backend**: Validação e tratamento de erros implementados
✅ **Frontend**: Tratamento e tradução de erros implementados
✅ **Testado**: Funcionando em todos os cenários
✅ **Documentado**: Este arquivo

---

**Resultado**: Agora quando o usuário tentar editar um veículo e usar uma placa que já existe, ele receberá uma mensagem clara e específica sobre o problema, com orientações de como resolvê-lo! 🎯✨ 
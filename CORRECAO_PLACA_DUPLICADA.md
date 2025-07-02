# Correção: Erro de Placa Duplicada ao Editar Veículo

## Problema Identificado

O usuário estava tentando editar um veículo existente (alterando apenas nome, data, etc.) mantendo a mesma placa, mas o sistema retornava erro:

```
"A placa ASM-1234 já está sendo usada por outro veículo"
```

**Comportamento incorreto:** O sistema não permitia que o usuário editasse seu próprio veículo quando mantinha a mesma placa.

## Causa Raiz

No arquivo `backend/src/services/vehicle.service.ts`, o método `update` tinha uma validação incorreta na linha 143:

### ❌ Código Anterior (Problemático)
```typescript
// Verificar se já existe outro veículo com esta placa (excluindo o atual)
const existingVehicle = await prisma.vehicle.findFirst({
    where: {
        licensePlate: normalizedPlate,
        NOT: { id: id }  // Excluir o veículo atual da verificação
    }
});
```

**Problema:** Esta validação verificava se QUALQUER veículo no sistema inteiro tinha a mesma placa, ignorando que diferentes usuários podem ter veículos com a mesma placa.

## Solução Implementada

### ✅ Código Corrigido
```typescript
// Primeiro, obter o veículo atual para saber quem é o proprietário
const currentVehicle = await prisma.vehicle.findUnique({
    where: { id }
});

if (!currentVehicle) {
    throw new Error('Veículo não encontrado');
}

// Verificar se o mesmo proprietário já tem outro veículo com esta placa
const existingVehicle = await prisma.vehicle.findFirst({
    where: {
        licensePlate: normalizedPlate,
        ownerId: currentVehicle.ownerId,  // ← CORREÇÃO: Mesmo proprietário
        NOT: { id: id }  // Excluir o veículo atual da verificação
    }
});

if (existingVehicle) {
    throw new Error(`Você já possui outro veículo cadastrado com a placa ${normalizedPlate}`);
}
```

## Lógica de Validação Corrigida

### Cenários de Validação:

1. **✅ Permitido:** Usuário A edita seu veículo mantendo a mesma placa
2. **✅ Permitido:** Usuário A e Usuário B têm veículos com a mesma placa
3. **❌ Bloqueado:** Usuário A tenta cadastrar outro veículo com placa igual ao que já possui
4. **❌ Bloqueado:** Usuário A tenta alterar placa para uma que já usa em outro veículo

### Método Create (já estava correto)
O método `create` já implementava a validação correta:

```typescript
// Verificar se já existe um veículo com essa placa para esse proprietário
const existingVehicle = await prisma.vehicle.findFirst({
    where: {
        licensePlate: data.licensePlate.toUpperCase(),
        ownerId: data.ownerId  // ← Correto: Mesmo proprietário
    }
});
```

## Mensagens de Erro Melhoradas

### Antes:
- "A placa ASM-1234 já está sendo usada por outro veículo"

### Depois:
- "Você já possui outro veículo cadastrado com a placa ASM-1234"

## Benefícios da Correção

1. **✅ UX Melhorada:** Usuário pode editar seu veículo normalmente
2. **✅ Segurança:** Mantém validação para evitar duplicatas do mesmo usuário
3. **✅ Flexibilidade:** Permite que diferentes usuários tenham veículos com mesma placa
4. **✅ Clareza:** Mensagens de erro mais claras e específicas

## Teste de Validação

Para verificar se a correção funciona:

1. **Cenário 1:** Editar veículo mantendo a mesma placa
   - ✅ **Resultado esperado:** Edição realizada com sucesso

2. **Cenário 2:** Alterar placa para uma já usada pelo mesmo usuário
   - ❌ **Resultado esperado:** "Você já possui outro veículo cadastrado com a placa XXX"

3. **Cenário 3:** Alterar placa para uma nova/única
   - ✅ **Resultado esperado:** Edição realizada com sucesso

---

**Data da correção:** 02/07/2025  
**Arquivo modificado:** `backend/src/services/vehicle.service.ts`  
**Status:** ✅ Implementado e testado 
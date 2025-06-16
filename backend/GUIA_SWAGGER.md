# 🚀 **Guia Rápido - Swagger API Documentation**

## 📍 **Acesso Direto**

### **URL da Documentação:**
```
http://localhost:3333/docs
```

---

## ⚡ **Como Testar em 3 Passos**

### **1️⃣ Fazer Login**
1. Vá para o endpoint `POST /auth/login`
2. Clique em **"Try it out"**
3. Use as credenciais:
   ```json
   {
     "email": "admin@example.com",
     "password": "123456"
   }
   ```
4. Clique em **"Execute"**
5. **Copie o token** da resposta

### **2️⃣ Autorizar no Swagger**
1. Clique no botão **"🔒 Authorize"** (topo da página)
2. Cole o token no formato: `Bearer seu_token_aqui`
3. Clique em **"Authorize"**
4. Feche o modal

### **3️⃣ Testar Endpoints**
Agora todos os endpoints protegidos estão liberados! ✅

---

## 🎯 **Endpoints Mais Importantes**

### **🔐 Autenticação (Comece aqui!)**
- `POST /auth/login` - **Fazer login** (obrigatório primeiro)
- `POST /auth/register` - Criar nova conta
- `GET /auth/profile` - Ver seu perfil

### **🚗 Veículos (Principais)**
- `POST /vehicles` - **Cadastrar veículo**
- `GET /vehicles` - **Listar seus veículos**
- `GET /vehicles/{id}` - **Ver detalhes completos**
- `DELETE /vehicles/{id}` - Excluir veículo

### **🔧 Manutenções**
- `POST /maintenances` - **Agendar manutenção**
- `GET /maintenances` - **Ver manutenções**
- `PUT /maintenances/{id}` - Atualizar status

### **⏰ Lembretes**
- `POST /reminders` - **Criar lembrete**
- `GET /reminders` - **Ver lembretes ativos**
- `PUT /reminders/{id}` - Marcar como concluído

### **💰 Despesas**
- `POST /expenses` - **Registrar gasto**
- `GET /expenses` - **Ver histórico de gastos**

---

## 📱 **Credenciais Prontas para Teste**

```json
// Admin (acesso total)
{
  "email": "admin@example.com",
  "password": "123456"
}

// Mecânico
{
  "email": "mecanico@example.com", 
  "password": "123456"
}

// Proprietário
{
  "email": "proprietario@example.com",
  "password": "123456"
}
```

---

## 🛠️ **Exemplos de Request Body**

### **Cadastrar Veículo**
```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "licensePlate": "ABC1234",
  "type": "CAR",
  "color": "Branco",
  "mileage": 45000
}
```

### **Agendar Manutenção**
```json
{
  "vehicleId": "seu_veiculo_id",
  "type": "PREVENTIVE",
  "description": "Troca de óleo e filtros",
  "scheduledDate": "2023-12-15T09:00:00.000Z",
  "cost": 150.00
}
```

### **Criar Lembrete**
```json
{
  "vehicleId": "seu_veiculo_id",
  "description": "Revisão dos 60.000 km",
  "reminderDate": "2023-12-20T10:00:00.000Z",
  "mileageReminder": 60000
}
```

### **Registrar Despesa**
```json
{
  "vehicleId": "seu_veiculo_id",
  "description": "Abastecimento",
  "amount": 120.50,
  "category": "FUEL",
  "date": "2023-12-06T08:30:00.000Z"
}
```

---

## 🎨 **Funcionalidades do Swagger UI**

### **✨ Recursos Disponíveis:**
- ✅ **Teste em tempo real** - Execute requisições diretamente
- ✅ **Autorização persistente** - Faça login uma vez, teste tudo
- ✅ **Filtro de endpoints** - Busque endpoints específicos
- ✅ **Modelos expandidos** - Veja estruturas de dados completas
- ✅ **Duração das requests** - Monitore performance
- ✅ **Headers de request** - Veja cabeçalhos enviados
- ✅ **Try it out** - Botão para testar cada endpoint

### **🔍 Dicas de Uso:**
1. **Use o filtro** para encontrar endpoints rapidamente
2. **Clique nos modelos** para ver estruturas de dados
3. **Copie o cURL** gerado para usar fora do Swagger
4. **Expanda as seções** para ver todos os detalhes

---

## ⚠️ **Problemas Comuns**

### **❌ "Unauthorized" (401)**
**Solução:** Faça login e autorize no Swagger
1. `POST /auth/login` 
2. Copie o token
3. Clique em **"🔒 Authorize"**
4. Cole: `Bearer seu_token`

### **❌ "Not Found" (404)**
**Solução:** Verifique se o ID do recurso existe
- Use `GET /vehicles` para ver IDs válidos

### **❌ "Bad Request" (400)**
**Solução:** Verifique o formato dos dados
- Confira os campos obrigatórios
- Valide formatos de data e email

---

## 🏆 **Fluxo Completo de Teste**

### **Sequência Recomendada:**
1. 🔐 **Login** → `POST /auth/login`
2. 🔒 **Autorizar** no botão do Swagger
3. 🚗 **Cadastrar veículo** → `POST /vehicles`
4. 👀 **Ver veículo** → `GET /vehicles/{id}`
5. 🔧 **Agendar manutenção** → `POST /maintenances`
6. ⏰ **Criar lembrete** → `POST /reminders`
7. 💰 **Registrar despesa** → `POST /expenses`
8. 📊 **Ver estatísticas** → `GET /dashboard/stats`

---

## 🚀 **Links Úteis**

- **Swagger UI**: http://localhost:3333/docs
- **API Base**: http://localhost:3333
- **Frontend**: http://localhost:5173
- **JSON da API**: http://localhost:3333/swagger

---

## 🎉 **Pronto para Testar!**

**A documentação Swagger está completa e organizada!**

1. ✅ Acesse: http://localhost:3333/docs
2. ✅ Faça login com: admin@example.com / 123456
3. ✅ Explore e teste todas as funcionalidades!

**Happy Testing! 🚀✨** 
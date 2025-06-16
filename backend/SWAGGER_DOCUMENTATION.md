# 📚 Documentação Completa da API AutoManutenção

## 🚀 **Acesso à Documentação Swagger**

**URL:** http://localhost:3333/docs

A documentação interativa da API está disponível através do Swagger UI, onde você pode:
- ✅ Visualizar todos os endpoints
- ✅ Testar as requisições diretamente
- ✅ Ver exemplos de request/response
- ✅ Verificar schemas de validação

---

## 🔐 **Autenticação**

A API utiliza autenticação **JWT (JSON Web Token)**. Para acessar endpoints protegidos:

1. **Faça login** através do endpoint `/auth/login`
2. **Copie o token** retornado na resposta
3. **Use o token** no header `Authorization: Bearer <seu_token>`

### **Credenciais de Teste:**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

---

## 📋 **Endpoints Disponíveis**

### **🏠 Sistema**
- `GET /` - Informações básicas da API

### **🔐 Autenticação**
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `GET /auth/profile` - Obter perfil do usuário (protegido)

### **🚗 Veículos**
- `POST /vehicles` - Cadastrar veículo (protegido)
- `GET /vehicles` - Listar veículos (protegido)
- `GET /vehicles/:id` - Detalhes do veículo (protegido)
- `PUT /vehicles/:id` - Atualizar veículo (protegido)
- `DELETE /vehicles/:id` - Excluir veículo (protegido)

### **🔧 Manutenções**
- `POST /maintenances` - Agendar manutenção (protegido)
- `GET /maintenances` - Listar manutenções (protegido)
- `GET /maintenances/:id` - Detalhes da manutenção (protegido)
- `PUT /maintenances/:id` - Atualizar manutenção (protegido)
- `DELETE /maintenances/:id` - Cancelar manutenção (protegido)
- `GET /vehicles/:vehicleId/maintenances` - Manutenções do veículo (protegido)

### **⏰ Lembretes**
- `POST /reminders` - Criar lembrete (protegido)
- `GET /reminders` - Listar lembretes (protegido)
- `GET /reminders/:id` - Detalhes do lembrete (protegido)
- `PUT /reminders/:id` - Atualizar lembrete (protegido)
- `DELETE /reminders/:id` - Excluir lembrete (protegido)

### **💰 Despesas**
- `POST /expenses` - Registrar despesa (protegido)
- `GET /expenses` - Listar despesas (protegido)
- `GET /expenses/:id` - Detalhes da despesa (protegido)
- `PUT /expenses/:id` - Atualizar despesa (protegido)
- `DELETE /expenses/:id` - Excluir despesa (protegido)

### **👥 Usuários (Admin)**
- `GET /users` - Listar usuários (protegido)
- `GET /users/:id` - Detalhes do usuário (protegido)
- `PUT /users/:id` - Atualizar usuário (protegido)
- `DELETE /users/:id` - Excluir usuário (protegido)

---

## 📊 **Schemas de Dados**

### **🔐 Autenticação**

#### **Register Request**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "123456",
  "role": "OWNER"
}
```

#### **Login Request**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

#### **Login Response**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### **🚗 Veículos**

#### **Create Vehicle Request**
```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "licensePlate": "ABC1234",
  "type": "CAR",
  "color": "Branco",
  "mileage": 50000
}
```

#### **Vehicle Response**
```json
{
  "id": "uuid",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "licensePlate": "ABC1234",
  "type": "CAR",
  "color": "Branco",
  "mileage": 50000,
  "ownerId": "uuid",
  "createdAt": "2023-12-06T10:00:00.000Z",
  "updatedAt": "2023-12-06T10:00:00.000Z"
}
```

### **🔧 Manutenções**

#### **Create Maintenance Request**
```json
{
  "vehicleId": "uuid",
  "type": "PREVENTIVE",
  "description": "Troca de óleo e filtros",
  "scheduledDate": "2023-12-15T09:00:00.000Z",
  "mechanicId": "uuid",
  "cost": 150.00,
  "notes": "Verificar também os pneus"
}
```

#### **Maintenance Response**
```json
{
  "id": "uuid",
  "vehicleId": "uuid",
  "type": "PREVENTIVE",
  "description": "Troca de óleo e filtros",
  "status": "SCHEDULED",
  "scheduledDate": "2023-12-15T09:00:00.000Z",
  "completedDate": null,
  "mechanicId": "uuid",
  "cost": 150.00,
  "notes": "Verificar também os pneus",
  "createdAt": "2023-12-06T10:00:00.000Z"
}
```

### **⏰ Lembretes**

#### **Create Reminder Request**
```json
{
  "vehicleId": "uuid",
  "description": "Revisão dos 60.000 km",
  "reminderDate": "2023-12-20T10:00:00.000Z",
  "mileageReminder": 60000,
  "completed": false
}
```

### **💰 Despesas**

#### **Create Expense Request**
```json
{
  "vehicleId": "uuid",
  "description": "Abastecimento",
  "amount": 120.50,
  "category": "FUEL",
  "date": "2023-12-06T08:30:00.000Z",
  "mileage": 51200
}
```

---

## 🏷️ **Enums e Tipos**

### **Tipos de Usuário (UserRole)**
- `ADMIN` - Administrador do sistema
- `MECHANIC` - Mecânico responsável pelas manutenções
- `OWNER` - Proprietário de veículos

### **Tipos de Veículo (VehicleType)**
- `CAR` - Carro
- `MOTORCYCLE` - Motocicleta
- `TRUCK` - Caminhão
- `VAN` - Van/Utilitário

### **Tipos de Manutenção (MaintenanceType)**
- `PREVENTIVE` - Manutenção preventiva
- `CORRECTIVE` - Manutenção corretiva
- `INSPECTION` - Inspeção

### **Status da Manutenção (MaintenanceStatus)**
- `SCHEDULED` - Agendada
- `IN_PROGRESS` - Em progresso
- `COMPLETED` - Concluída
- `CANCELLED` - Cancelada

### **Categorias de Despesa (ExpenseCategory)**
- `FUEL` - Combustível
- `MAINTENANCE` - Manutenção
- `INSURANCE` - Seguro
- `TOLLS` - Pedágios
- `PARKING` - Estacionamento
- `FINES` - Multas
- `OTHER` - Outros

---

## 🛡️ **Códigos de Status HTTP**

### **Sucesso**
- `200 OK` - Operação realizada com sucesso
- `201 Created` - Recurso criado com sucesso

### **Erro do Cliente**
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido ou ausente
- `403 Forbidden` - Sem permissão para acessar o recurso
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Erro de validação

### **Erro do Servidor**
- `500 Internal Server Error` - Erro interno do servidor

---

## 🔍 **Filtros e Consultas**

### **Veículos**
- `?type=CAR` - Filtrar por tipo
- `?search=toyota` - Buscar por marca/modelo/placa
- `?page=1&limit=10` - Paginação

### **Manutenções**
- `?status=SCHEDULED` - Filtrar por status
- `?type=PREVENTIVE` - Filtrar por tipo
- `?vehicleId=uuid` - Filtrar por veículo

### **Despesas**
- `?category=FUEL` - Filtrar por categoria
- `?startDate=2023-12-01` - Data início
- `?endDate=2023-12-31` - Data fim
- `?vehicleId=uuid` - Filtrar por veículo

---

## 🧪 **Como Testar**

### **1. Via Swagger UI (Recomendado)**
1. Acesse http://localhost:3333/docs
2. Clique em "Authorize" e insira o token JWT
3. Teste os endpoints diretamente

### **2. Via cURL**
```bash
# Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# Usar token nas requisições
curl -X GET http://localhost:3333/vehicles \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### **3. Via Postman/Insomnia**
1. Importe a collection do Swagger (JSON)
2. Configure a autenticação Bearer Token
3. Teste os endpoints

---

## 📝 **Exemplos Práticos**

### **Fluxo Completo: Cadastrar Veículo e Agendar Manutenção**

1. **Login**
2. **Cadastrar veículo**
3. **Agendar manutenção**
4. **Criar lembrete**
5. **Registrar despesa**

### **Consultas Úteis**
- Listar manutenções pendentes
- Buscar lembretes vencidos
- Calcular gastos mensais
- Obter histórico do veículo

---

## 🚀 **Próximos Passos**

1. ✅ **Acesse o Swagger**: http://localhost:3333/docs
2. ✅ **Faça login** com as credenciais de teste
3. ✅ **Explore os endpoints** interativamente
4. ✅ **Teste as funcionalidades** do sistema

**A documentação está completa e organizada! 📚✨** 
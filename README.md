# Sistema de Gerenciamento de Oficina Mecânica

Sistema completo para gerenciamento de oficina mecânica com manutenção preventiva de veículos, desenvolvido com Node.js, React, TypeScript, Prisma e PostgreSQL.

## 🚀 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Prisma** - ORM moderno para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **Zod** - Validação de esquemas
- **Bcrypt** - Hash de senhas

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **Lucide React** - Ícones

## 📋 Funcionalidades

### ✅ Implementadas
- 🔐 **Autenticação e Autorização**
  - Login/logout de usuários
  - Diferentes níveis de acesso (Admin, Mecânico, Recepcionista)
  - Proteção de rotas

- 🚗 **Gerenciamento de Veículos**
  - Cadastro de veículos (marca, modelo, ano, placa, tipo)
  - Listagem e visualização detalhada
  - Edição e exclusão de veículos
  - Associação com proprietários

- 🔧 **Controle de Manutenções**
  - Agendamento de manutenções
  - Diferentes tipos (Preventiva, Corretiva, Inspeção)
  - Status de acompanhamento
  - Histórico completo por veículo
  - Associação com mecânicos

- ⏰ **Sistema de Lembretes**
  - Lembretes personalizados de manutenção
  - Data de vencimento
  - Marcação como concluído
  - Filtros por veículo

- 💰 **Controle de Despesas**
  - Registro de gastos por categoria
  - Relatórios de despesas
  - Filtros por período e categoria
  - Vinculação com veículos

- 🏢 **Gestão de Serviços**
  - Cadastro de tipos de serviços
  - Preços e duração estimada
  - Descrições detalhadas

### 🚧 Funcionalidades Futuras
- 📊 Dashboard com gráficos e estatísticas
- 📄 Relatórios detalhados em PDF
- 📱 Notificações por email/SMS
- 📈 Análise de custos por veículo
- 🔄 Integração com sistemas externos
- 📷 Upload de imagens dos veículos

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### 1. Clone o Repositório
```bash
git clone [url-do-repositorio]
cd tcc-teste
```

### 2. Configure o Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente (.env já está configurado)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oficina_mecanica?schema=public"
# JWT_SECRET="super-secret-jwt-key-for-oficina-mecanica-system"

# Inicie o PostgreSQL com Docker
docker-compose -f docker-compose.dev.yml up -d

# Execute as migrations do banco
npx prisma generate
npx prisma migrate dev --name init

# Popule o banco com dados de exemplo
npx prisma db seed

# Inicie o servidor backend
npm run dev
```

O backend estará rodando em: **http://localhost:3333**

### 3. Configure o Frontend

```bash
cd ../frontend

# Instale as dependências
npm install

# Inicie o servidor frontend
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

## 👥 Usuários de Teste

O sistema vem com usuários pré-cadastrados para teste:

| Email | Senha | Função |
|-------|-------|--------|
| admin@example.com | 123456 | Administrador |
| mecanico@example.com | 123456 | Mecânico |
| proprietario@example.com | 123456 | Recepcionista |

## 📚 API Endpoints

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil do usuário logado

### Veículos
- `GET /vehicles` - Listar veículos
- `POST /vehicles` - Criar veículo
- `GET /vehicles/:id` - Buscar veículo por ID
- `PUT /vehicles/:id` - Atualizar veículo
- `DELETE /vehicles/:id` - Deletar veículo

### Manutenções
- `GET /maintenances` - Listar manutenções
- `POST /maintenances` - Criar manutenção
- `GET /maintenances/:id` - Buscar manutenção por ID
- `PUT /maintenances/:id` - Atualizar manutenção
- `DELETE /maintenances/:id` - Deletar manutenção
- `GET /vehicles/:vehicleId/maintenances` - Manutenções por veículo
- `GET /mechanics/:mechanicId/maintenances` - Manutenções por mecânico

### Lembretes
- `GET /reminders` - Listar lembretes
- `POST /reminders` - Criar lembrete
- `GET /reminders/:id` - Buscar lembrete por ID
- `PUT /reminders/:id` - Atualizar lembrete
- `DELETE /reminders/:id` - Deletar lembrete

### Despesas
- `GET /expenses` - Listar despesas
- `POST /expenses` - Criar despesa
- `GET /expenses/:id` - Buscar despesa por ID
- `PUT /expenses/:id` - Atualizar despesa
- `DELETE /expenses/:id` - Deletar despesa

## 🗄️ Estrutura do Banco de Dados

### Principais Entidades
- **Users** - Usuários do sistema (admin, mecânicos, recepcionistas)
- **Vehicles** - Veículos cadastrados
- **Maintenances** - Registros de manutenções
- **Reminders** - Lembretes de manutenção
- **Expenses** - Despesas dos veículos
- **Services** - Tipos de serviços oferecidos

## 📱 Como Usar

### 1. Faça Login
- Acesse http://localhost:5173
- Use um dos usuários de teste
- Você será redirecionado para o dashboard

### 2. Gerencie Veículos
- No dashboard, clique em "Adicionar Veículo"
- Preencha os dados do veículo
- Visualize e edite veículos existentes

### 3. Controle Manutenções
- Acesse a seção de manutenções
- Agende novos serviços
- Acompanhe o status dos trabalhos

### 4. Configure Lembretes
- Crie lembretes personalizados
- Defina datas de vencimento
- Marque como concluído quando necessário

### 5. Registre Despesas
- Adicione gastos por categoria
- Acompanhe o histórico financeiro
- Gere relatórios de custos

## 🔧 Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm run dev          # Servidor em desenvolvimento
npm run build        # Build para produção
npm start           # Servidor em produção
npx prisma studio   # Interface visual do banco
npx prisma db seed  # Popular banco com dados
```

**Frontend:**
```bash
npm run dev         # Servidor em desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview da build
```

### Estrutura de Pastas

```
backend/
├── src/
│   ├── controllers/    # Controladores das rotas
│   ├── services/       # Lógica de negócios
│   ├── middlewares/    # Middlewares (auth, etc)
│   ├── routes/         # Definição das rotas
│   ├── types/          # Tipos TypeScript
│   └── server.ts       # Arquivo principal
├── prisma/
│   ├── schema.prisma   # Schema do banco
│   └── seed.ts         # Dados iniciais
└── package.json

frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Integração com API
│   ├── store/          # Gerenciamento de estado
│   ├── types/          # Tipos TypeScript
│   └── App.tsx         # Componente principal
└── package.json
```

## 🐛 Solução de Problemas

### Backend não inicia
- Verifique se o PostgreSQL está rodando
- Confirme as variáveis de ambiente no .env
- Execute `npx prisma generate` novamente

### Frontend não carrega dados
- Verifique se o backend está rodando na porta 3333
- Confirme a URL da API no arquivo services/api.ts
- Verifique o console do navegador para erros

### Erro de autenticação
- Limpe o localStorage do navegador
- Faça login novamente
- Verifique se o JWT_SECRET está configurado

## 📄 Documentação da API

Acesse a documentação interativa da API em:
**http://localhost:3333/docs**

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido para o Trabalho de Conclusão de Curso (TCC)**
Sistema de Gerenciamento de Oficina Mecânica com foco em manutenção preventiva de veículos. 
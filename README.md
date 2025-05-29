# Sistema de Gerenciamento de Oficina Mecânica

Sistema backend para gerenciamento de oficina mecânica, desenvolvido com Node.js, Fastify, TypeScript, Prisma e PostgreSQL.

## 🚀 Tecnologias

- Node.js
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Zod (validação)
- JWT (autenticação)
- Jest (testes)

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd [nome-do-diretorio]
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo .env.example para .env
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

4. Inicie o banco de dados com Docker:
```bash
docker-compose up -d
```

5. Execute as migrações do Prisma:
```bash
npx prisma migrate dev
```

6. Inicie o servidor:
```bash
npm run dev
```

## 📦 Estrutura do Projeto

```
src/
├── controllers/     # Controladores da aplicação
├── middlewares/     # Middlewares (autenticação, etc)
├── routes/         # Definição das rotas
├── schemas/        # Schemas de validação (Zod)
├── services/       # Lógica de negócios
├── types/          # Definições de tipos TypeScript
└── app.ts          # Arquivo principal da aplicação
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer seu-token-jwt
```

## 📝 Endpoints

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login

### Usuários
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário por ID
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Veículos
- `POST /vehicles` - Cadastrar veículo
- `GET /vehicles` - Listar veículos
- `GET /vehicles/:id` - Buscar veículo por ID
- `PUT /vehicles/:id` - Atualizar veículo
- `DELETE /vehicles/:id` - Deletar veículo

### Manutenções
- `POST /maintenances` - Registrar manutenção
- `GET /maintenances` - Listar manutenções
- `GET /maintenances/:id` - Buscar manutenção por ID
- `PUT /maintenances/:id` - Atualizar manutenção
- `DELETE /maintenances/:id` - Deletar manutenção
- `GET /vehicles/:vehicleId/maintenances` - Listar manutenções por veículo
- `GET /mechanics/:mechanicId/maintenances` - Listar manutenções por mecânico

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

## 📊 Banco de Dados

O projeto utiliza PostgreSQL com Prisma ORM. Para gerenciar o banco de dados:

```bash
# Abrir Prisma Studio
npx prisma studio

# Gerar cliente Prisma
npx prisma generate

# Criar nova migração
npx prisma migrate dev
```

## 🔄 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm start` - Inicia o servidor em modo produção
- `npm test` - Executa os testes
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

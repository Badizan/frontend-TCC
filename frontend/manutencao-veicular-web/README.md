# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Manutenção Veicular Web

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Rode o projeto em modo desenvolvimento:
   ```sh
   npm run dev
   ```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## Principais Funcionalidades
- Cadastro e login de usuários
- Cadastro, edição e exclusão de veículos
- Cadastro, edição e exclusão de manutenções
- Dashboard com gráficos de gastos e lembretes automáticos de revisão
- Exportação de dados (CSV) para veículos e manutenções
- Busca/filtro nas listas
- Edição de perfil do usuário
- Notificações visuais de sucesso/erro
- Interface responsiva e moderna

---

## Diferenciais para o TCC
- Lembretes automáticos de manutenção preventiva
- Exportação de dados para relatórios
- Dashboard interativo
- Foco em UX e responsividade

---

## Dicas para apresentação
- Mostre o fluxo completo: login, cadastro de veículo, cadastro de manutenção, dashboard, exportação, lembretes.
- Destaque os diferenciais: lembretes automáticos, exportação, gráficos.
- Teste em diferentes tamanhos de tela (responsividade).
- Se possível, rode o backend junto para demonstrar integração real.

O Tailwind CSS já está configurado. Para testar, adicione classes do Tailwind em qualquer componente React.

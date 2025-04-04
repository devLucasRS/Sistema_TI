# Sistema de Gestão Técnica

Sistema completo para gestão de chamados técnicos, inventário de equipamentos e controle de usuários.

## 🚀 Tecnologias

### Frontend
- React.js
- Material-UI (MUI)
- Axios
- React Router
- Context API

### Backend
- Node.js
- Express
- MySQL
- JWT Authentication
- Multer (Upload de arquivos)

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v8.0 ou superior)
- NPM ou Yarn

## 🔧 Instalação

### Backend
1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações de banco de dados.

4. Inicie o servidor:
```bash
npm start
```

### Frontend
1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## 📦 Estrutura do Projeto

### Frontend
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contextos do React
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços (API, etc)
│   ├── routes/         # Configuração de rotas
│   ├── constants/      # Constantes e configurações
│   ├── App.js          # Componente principal
│   └── index.js        # Ponto de entrada
```

### Backend
```
backend/
├── src/
│   ├── config/         # Configurações
│   ├── controllers/    # Controladores
│   ├── database/       # Configuração do banco
│   ├── middleware/     # Middlewares
│   ├── models/         # Modelos
│   ├── routes/         # Rotas da API
│   └── server.js       # Servidor principal
```

## 🛠️ Funcionalidades

### Gestão de Usuários
- Cadastro e autenticação
- Diferentes níveis de acesso (Admin, Técnico, Usuário)
- Gerenciamento de perfil

### Gestão de Chamados
- Abertura de chamados
- Acompanhamento de status
- Upload de anexos
- Comentários e histórico
- SLA (Service Level Agreement)

### Inventário
- Cadastro de equipamentos
- Controle de portadores
- Histórico de movimentações
- Status de disponibilidade

### Dashboard
- Visão geral do sistema
- Estatísticas em tempo real
- Gráficos e relatórios
- Diferentes visualizações por perfil

## 📊 Banco de Dados

O sistema utiliza as seguintes tabelas principais:
- `usuarios`: Gestão de usuários
- `chamados`: Registro de chamados
- `equipamentos`: Inventário
- `anexos_chamados`: Arquivos anexados
- `historico_equipamentos`: Movimentações

## 🔒 Segurança

- Autenticação JWT
- Proteção de rotas
- Validação de dados
- Sanitização de inputs
- Controle de acesso baseado em perfil

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📫 Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu_usuario/sistema-tec](https://github.com/seu_usuario/sistema-tec) 
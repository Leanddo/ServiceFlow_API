# ServiceFlow_API

API RESTful para gestão de negócios, profissionais, serviços, filas, avaliações e autenticação de utilizadores.

---

## Tecnologias & Bibliotecas

- **Node.js**
- **Express.js**
- **Sequelize** (ORM para PostgreSQL)
- **JWT** (`jsonwebtoken`)
- **Nodemailer** (envio de emails)
- **Multer** (upload de imagens)
- **dotenv** (variáveis de ambiente)
- **bcrypt** (hash de passwords)
- **cookie-parser**
- **cors**
- **passport** e **passport-google-oauth20** (login Google)
- **ics** (eventos de calendário)
- **node-cron** (tarefas agendadas)
- **express-rate-limit**
- **sequelize-cli** (migrations)

---

## Instalação

```bash
git clone https://github.com/Leanddo/ServiceFlow_API.git
cd ServiceFlow_API
npm install
```

Crie um ficheiro `.env` com as variáveis de ambiente necessárias, por exemplo:

```
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=serviceflow
DB_PORT=5432
JWTSECRET=sua_chave_secreta
EMAIL_HOST=smtp.seuprovedor.com
EMAIL_USER=seu_email
EMAIL_PASS=sua_senha_email
API_HOST=http://localhost:3000
HOST=http://localhost:3000
GOOGLE_CLIENT_SECRET=google_api_token
GOOGLE_CLIENT_ID=google_api_id
```

---

## Migrations

Para criar as tabelas e estrutura da base de dados, use:

```bash
npm run migrate
```

O ficheiro principal de migration está em `migrations/20250403184254-database-migration.js` e cria todas as tabelas necessárias:  
**Users, Businesses, Professionals, Services, Queues, Reviews, OTP, Notifications, PasswordResetToken, BusinessPhotos**.

---

## Como usar

```bash
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`.

---

## Estrutura de Pastas

```
ServiceFlow_API/
│
├── controller/         # Lógica dos endpoints
├── middleware/         # Middlewares de autenticação, upload, etc.
├── models/             # Modelos Sequelize
├── routes/             # Definição das rotas
├── migrations/         # Migrations do banco de dados
├── templates/          # Templates de email
├── utils/              # Funções utilitárias
├── public/             # Uploads de imagens
├── config/             # Configurações do projeto
├── .env                # Variáveis de ambiente
└── README.md           # Este ficheiro
```

---

## Endpoints Principais

### Autenticação (`/api/auth`)
- `POST /api/auth/login` — Login de utilizador
- `POST /api/auth/register` — Registo de utilizador
- `POST /api/auth/verify` — Verificação de email
- `POST /api/auth/forgot-password` — Recuperação de senha
- `POST /api/auth/reset-password/:token` — Redefinir senha
- `GET /api/auth/is-logged-in` — Verifica se o utilizador está autenticado
- `GET /api/auth/google` — Login com Google OAuth

### Negócios (`/api/business`)
- `POST /api/business/` — Criar negócio
- `GET /api/business/` — Listar negócios (com filtros)
- `GET /api/business/:id` — Detalhes de um negócio
- `PUT /api/business/:business_id` — Editar negócio
- `PUT /api/business/:business_id/photo` — Atualizar foto principal
- `PUT /api/business/:business_id/status` — Ativar/desativar negócio
- `GET /api/business/:business_id/is-owner` — Verifica se o utilizador é owner
- `GET /api/business/:business_id/is-professional` — Verifica se o utilizador é profissional do negócio

### Profissionais (`/api/professionals`)
- `GET /api/professionals` — Listar todos os profissionais
- `GET /api/business/:business_id/professionals/private` — Profissionais privados de um negócio
- `GET /api/business/:business_id/professionals/public` — Profissionais públicos de um negócio
- `POST /api/business/:business_id/professionals` — Adicionar profissional a um negócio
- `PUT /api/business/:business_id/professionals/:id` — Atualizar profissional
- `DELETE /api/professionals/:id` — Remover profissional
- `GET /api/businesses/user` — Listar negócios do utilizador autenticado

### Serviços (`/api/services`)
- `POST /api/businesses/:business_id/services` — Criar serviço
- `GET /api/businesses/:business_id/services` — Listar serviços de um negócio
- `GET /api/businesses/:business_id/services/private` — Listar serviços privados
- `GET /api/businesses/:business_id/services/:service_id` — Detalhes de um serviço
- `PUT /api/businesses/:business_id/services/:service_id` — Atualizar serviço
- `PATCH /api/businesses/:business_id/services/:service_id/status` — Ativar/desativar serviço
- `DELETE /api/businesses/:business_id/services/:service_id` — Remover serviço
- `PUT /api/businesses/:business_id/services/:service_id/photo` — Atualizar foto do serviço
- `DELETE /api/businesses/:business_id/services/:service_id/photo` — Remover foto do serviço

### Filas (`/api/queues`)
- `POST /api/services/:service_id/queues` — Inscrever-se numa fila
- `POST /api/services/:service_id/queues/owner` — Inscrever proprietário numa fila
- `GET /api/queues/user` — Listar filas do utilizador autenticado
- `GET /api/queues/:business_id` — Listar filas de um negócio
- `PATCH /api/queues/:queue_id/status` — Atualizar status da fila
- `DELETE /api/queues/:queue_id` — Cancelar inscrição na fila

### Avaliações (`/api/reviews`)
- `POST /api/services/:service_id/reviews` — Criar avaliação para um serviço
- `GET /api/services/:service_id/reviews` — Listar avaliações de um serviço
- `GET /api/business/:business_id/reviews` — Listar avaliações de um negócio
- `GET /api/business/:business_id/average-rating` — Média de avaliações do negócio

### Fotos de Negócio (`/api/businessPhotos`)
- `GET /api/business/:business_id/photos` — Listar fotos do negócio
- `POST /api/business/:business_id/photos` — Adicionar fotos ao negócio
- `DELETE /api/business/:business_id/photos/:photo_id` — Remover foto do negócio

### Utilizador (`/api/user`)
- `GET /api/user/profile` — Perfil do utilizador autenticado
- `PUT /api/user/profile` — Atualizar perfil
- `PUT /api/user/profile/photo` — Atualizar foto de perfil
- `PUT /api/user/password` — Atualizar password
- `DELETE /api/user/account` — Eliminar conta

---

## Observações

- O projeto utiliza cookies HTTP-only para autenticação.
- As imagens são armazenadas na pasta `public/`.
- O envio de emails depende da configuração correta do SMTP no `.env`.
- O frontend deve consumir esta API e enviar o cookie de autenticação nas requisições protegidas.

---
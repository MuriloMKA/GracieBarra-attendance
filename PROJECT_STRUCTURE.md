# 🏗️ Estrutura Completa do Projeto

```
GracieBarra-attendance/
│
├── 📱 Frontend (React Native + Expo)
│   │
│   ├── App.js                          # Entry point principal
│   ├── app.json                        # Configuração do Expo
│   ├── package.json                    # Dependências
│   ├── babel.config.js                 # Configuração Babel
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 🎨 components/              # Componentes reutilizáveis
│   │   │   ├── Button.js               # Botão customizado GB
│   │   │   ├── Input.js                # Input com validação
│   │   │   ├── DigitalCard.js          # Cartão digital do aluno
│   │   │   ├── Loading.js              # Spinner de loading
│   │   │   └── StatusBadge.js          # Badge de status
│   │   │
│   │   ├── 📱 screens/                 # Telas do aplicativo
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   └── LoginScreen.js      # Tela de login
│   │   │   │
│   │   │   ├── Student/                # Telas do Aluno
│   │   │   │   ├── StudentHomeScreen.js        # Check-in
│   │   │   │   ├── StudentProfileScreen.js     # Perfil + Cartão
│   │   │   │   └── StudentHistoryScreen.js     # Histórico
│   │   │   │
│   │   │   └── Admin/                  # Telas do Admin
│   │   │       ├── AdminHomeScreen.js          # Dashboard
│   │   │       ├── AdminStudentsScreen.js      # Gestão de alunos
│   │   │       └── AdminReportsScreen.js       # Relatórios
│   │   │
│   │   ├── 🧭 navigation/              # Sistema de navegação
│   │   │   └── AppNavigator.js         # Rotas e tabs
│   │   │
│   │   ├── 🔐 contexts/                # Context API (Estado global)
│   │   │   ├── AuthContext.js          # Autenticação
│   │   │   └── ThemeContext.js         # Tema (futuro)
│   │   │
│   │   ├── 🌐 services/                # Serviços e APIs
│   │   │   ├── api.js                  # Cliente Axios + endpoints
│   │   │   ├── storage.js              # AsyncStorage helpers
│   │   │   └── notifications.js        # Push notifications
│   │   │
│   │   ├── 🎨 constants/               # Constantes e configurações
│   │   │   └── theme.js                # Cores, fontes, tamanhos
│   │   │
│   │   ├── 🛠️ utils/                   # Funções utilitárias
│   │   │   ├── validation.js           # Validação de formulários
│   │   │   ├── dateFormat.js           # Formatação de datas
│   │   │   └── helpers.js              # Helpers gerais
│   │   │
│   │   └── ⚙️ config/                  # Configurações
│   │       └── config.example.js       # Exemplo de config
│   │
│   └── 📁 assets/                      # Assets estáticos
│       ├── icon.png                    # Ícone do app
│       ├── splash.png                  # Splash screen
│       ├── adaptive-icon.png           # Ícone Android
│       └── logo-gb.png                 # Logo Gracie Barra
│
├── 🖥️ Backend (Node.js + Express)
│   │
│   ├── 📁 backend/
│   │   │
│   │   ├── server.js                   # Servidor principal
│   │   ├── package.json                # Dependências backend
│   │   ├── .env.example                # Exemplo de variáveis de ambiente
│   │   │
│   │   ├── 📁 models/                  # Modelos do banco de dados
│   │   │   ├── User.js                 # Modelo de usuário
│   │   │   ├── Checkin.js              # Modelo de check-in
│   │   │   └── Class.js                # Modelo de aula
│   │   │
│   │   ├── 📁 routes/                  # Rotas da API
│   │   │   ├── auth.js                 # Rotas de autenticação
│   │   │   ├── students.js             # Rotas de alunos
│   │   │   ├── checkins.js             # Rotas de check-ins
│   │   │   └── stats.js                # Rotas de estatísticas
│   │   │
│   │   ├── 📁 controllers/             # Controladores (lógica)
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   └── checkinController.js
│   │   │
│   │   ├── 📁 middleware/              # Middlewares
│   │   │   ├── auth.js                 # Verificação de JWT
│   │   │   ├── validation.js           # Validação de dados
│   │   │   └── errorHandler.js         # Tratamento de erros
│   │   │
│   │   └── 📁 utils/                   # Utilitários backend
│   │       ├── jwt.js                  # Geração de tokens
│   │       └── emailService.js         # Envio de emails
│   │
├── 📚 Documentação
│   │
│   ├── README.md                       # ✅ Documentação principal
│   ├── QUICKSTART.md                   # ✅ Guia de início rápido
│   ├── DEPLOY.md                       # ✅ Guia de deploy
│   ├── DESIGN.md                       # ✅ Guidelines de design
│   ├── CHECKLIST.md                    # ✅ Checklist de implementação
│   └── API.md                          # 🔜 Documentação da API
│
└── 🔧 Configuração
    │
    ├── .gitignore                      # ✅ Arquivos ignorados pelo Git
    ├── .eslintrc.js                    # 🔜 Configuração ESLint
    └── .prettierrc                     # 🔜 Configuração Prettier
```

## 📊 Fluxo de Dados

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Frontend  │ ◄────►   │   Backend   │ ◄────►   │   MongoDB   │
│ React Native│  HTTP    │   Express   │  Mongo   │   Database  │
│    (Expo)   │  REST    │   Node.js   │  Driver  │             │
└─────────────┘          └─────────────┘          └─────────────┘
       │                        │
       │                        │
       ▼                        ▼
┌─────────────┐          ┌─────────────┐
│ AsyncStorage│          │   JWT Auth  │
│   (Local)   │          │  (Tokens)   │
└─────────────┘          └─────────────┘
```

## 🔄 Fluxo de Autenticação

```
1. Usuário digita email/senha
   │
   ▼
2. Frontend envia POST /api/auth/login
   │
   ▼
3. Backend valida credenciais
   │
   ├─► ❌ Inválido: retorna erro 401
   │
   └─► ✅ Válido: gera JWT token
       │
       ▼
4. Frontend salva token + user no AsyncStorage
   │
   ▼
5. Frontend redireciona para tela principal
   │
   ▼
6. Todas as requisições incluem token no header
```

## 📱 Fluxo de Check-in

```
ALUNO                           BACKEND                         ADMIN
  │                                │                              │
  │ 1. Seleciona aula              │                              │
  │────────────────────►           │                              │
  │                                │                              │
  │ 2. POST /api/checkins          │                              │
  │────────────────────►           │                              │
  │                                │ 3. Cria check-in (pending)   │
  │ 3. Confirmação                 │                              │
  │◄────────────────────           │                              │
  │                                │                              │
  │                                │ 4. GET /api/checkins/pending │
  │                                │◄─────────────────────────────│
  │                                │                              │
  │                                │ 5. Lista check-ins           │
  │                                │──────────────────────────────►
  │                                │                              │
  │                                │ 6. PUT /api/checkins/:id     │
  │                                │   (status: confirmed)        │
  │                                │◄─────────────────────────────│
  │                                │                              │
  │ 7. Notificação (confirmado)    │                              │
  │◄────────────────────────────────                              │
```

## 🎯 Componentes Principais

### 1. DigitalCard (Cartão Digital)

- **Função**: Exibe o cartão de presença digital do aluno
- **Props**: `user`, `attendances`
- **Lógica**: Calcula cor do cartão baseado em faixa e graus
- **Visual**: Grid de presenças, barra de progresso, datas

### 2. AuthContext (Contexto de Autenticação)

- **Função**: Gerencia estado de autenticação global
- **Métodos**: `signIn()`, `signOut()`, `updateUser()`
- **Estado**: `user`, `signed`, `loading`

### 3. AppNavigator (Navegação)

- **Função**: Define rotas e navegação do app
- **Tipos**: Stack Navigator + Bottom Tabs
- **Lógica**: Redireciona baseado em `user.type` (student/admin)

## 🗄️ Estrutura do Banco de Dados

### Collection: users

```json
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (bcrypt hash),
  "type": "student" | "admin",
  "belt": "GBK" | "BRANCA" | "AZUL" | "ROXA" | "MARROM" | "PRETA",
  "degrees": Number (0-10),
  "birthDate": Date,
  "lastGraduation": Date,
  "nextGraduation": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Collection: checkins

```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: users),
  "classId": Number,
  "className": String,
  "time": String,
  "date": Date,
  "status": "pending" | "confirmed" | "rejected",
  "confirmedBy": ObjectId (ref: users),
  "confirmedAt": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

## 🚀 Stack Tecnológica Completa

### Frontend

- **Framework**: React Native 0.73
- **Platform**: Expo ~50.0
- **Navigation**: React Navigation 6
- **State**: Context API + AsyncStorage
- **HTTP**: Axios
- **Styling**: StyleSheet (nativo)

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator

### DevOps

- **Hosting Backend**: Railway / Render
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions (opcional)
- **Monitoring**: Sentry (opcional)

## 📈 Roadmap

```
Fase 1 (MVP) ━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅ COMPLETO
├── Autenticação básica
├── Check-in digital
├── Cartão digital
├── Dashboard admin
└── Gestão de alunos

Fase 2 (Melhorias) ━━━━━━━━━━━━━━━━━━━ 🔄 EM PROGRESSO
├── Push notifications
├── QR Code check-in
├── Relatórios avançados
└── Upload de fotos

Fase 3 (Avançado) ━━━━━━━━━━━━━━━━━━━━ 📅 PLANEJADO
├── Dark mode
├── Multi-idioma
├── Gamificação
├── Sistema de pagamentos
└── Analytics dashboard
```

---

**Created with ❤️ for Gracie Barra Community**

🥋 OSS - Brotherhood, Integrity, Development

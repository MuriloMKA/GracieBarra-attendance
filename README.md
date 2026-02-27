# 🥋 Gracie Barra - Sistema de Gerenciamento de Presença

Sistema completo de gerenciamento de presença digital para escolas de Jiu-Jitsu Gracie Barra, substituindo os cartões físicos por um aplicativo mobile moderno.

![Gracie Barra](https://img.shields.io/badge/Gracie%20Barra-Digital%20Attendance-red)
![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## 📱 Características

### Para Alunos

- ✅ **Check-in Digital**: Realize check-in nas aulas de forma rápida e fácil
- 🎫 **Cartão Digital Dinâmico**: Visualize sua graduação com cartão que muda de cor automaticamente
- 📊 **Acompanhamento de Progresso**: Veja quantas aulas faltam para sua próxima graduação
- 📅 **Histórico de Presença**: Acompanhe todas as suas presenças confirmadas

### Para Administradores

- ✓ **Confirmação de Check-ins**: Aprove ou rejeite check-ins com um toque
- 👥 **Gestão de Alunos**: Atualize informações, faixas e graus dos alunos
- 📈 **Dashboard**: Visualize estatísticas e métricas importantes
- 🎓 **Sistema de Graduação**: Registre promoções e datas de graduação

## 🎨 Identidade Visual

O sistema segue rigorosamente o manual de marca da Gracie Barra:

- **Cores Principais**: Branco (#FFFFFF) e Vermelho GB (#E31E24)
- **Cor de Destaque**: Azul (#1E88E5)
- **Design**: Minimalista e clean

### Cores dos Cartões Digitais

| Categoria/Faixa       | Cor do Card           |
| --------------------- | --------------------- |
| Kids (GBK)            | Verde (#4CAF50)       |
| Branca (0-2 graus)    | Azul Claro (#81D4FA)  |
| Branca (3-4) até Azul | Azul Escuro (#1976D2) |
| Azul até Preta        | Preto (#212121)       |

## 🚀 Tecnologias

### Frontend (Mobile)

- **React Native** 0.73 com Expo
- **React Navigation** para navegação
- **AsyncStorage** para armazenamento local
- **Axios** para requisições HTTP

### Backend (API)

- **Node.js** com Express
- **JWT** para autenticação
- **MongoDB** (ou outro banco de sua preferência)
- **Bcrypt** para segurança de senhas

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Xcode (para iOS) ou Android Studio (para Android)

### Frontend (React Native)

```bash
# Instalar dependências
npm install

# Iniciar o Expo
npm start

# Rodar no iOS
npm run ios

# Rodar no Android
npm run android
```

### Backend (API)

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# O arquivo .env já está configurado com MongoDB Atlas
# Para ver configurações, consulte MONGODB_SETUP.md

# Popular banco de dados com dados iniciais
npm run seed

# Iniciar servidor
npm start

# Ou em modo desenvolvimento
npm run dev
```

## 📁 Estrutura do Projeto

```
GracieBarra-attendance/
├── backend/                    # API Node.js
│   ├── server.js              # Servidor principal
│   ├── package.json
│   └── .env.example
│
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── DigitalCard.js    # Cartão digital do aluno
│   │
│   ├── screens/               # Telas do app
│   │   ├── LoginScreen.js
│   │   ├── StudentHomeScreen.js
│   │   ├── StudentProfileScreen.js
│   │   ├── AdminHomeScreen.js
│   │   └── AdminStudentsScreen.js
│   │
│   ├── contexts/              # Context API
│   │   └── AuthContext.js
│   │
│   ├── navigation/            # Navegação
│   │   └── AppNavigator.js
│   │
│   └── constants/             # Constantes e temas
│       └── theme.js           # Cores, fontes, tamanhos
│
├── App.js                     # Entry point
├── app.json                   # Configuração Expo
└── package.json
```

## 🔐 Autenticação

### Credenciais de Teste

**Aluno:**

- Email: `aluno@gb.com`
- Senha: `123456`

**Administrador:**

- Email: `admin@gb.com`
- Senha: `123456`

> ⚠️ **Importante**: Altere essas credenciais em produção!

## 📊 API Endpoints

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter usuário atual

### Alunos

- `GET /api/students` - Listar todos os alunos
- `GET /api/students/:id` - Obter aluno por ID
- `PUT /api/students/:id` - Atualizar aluno

### Check-ins

- `POST /api/checkins` - Criar check-in
- `GET /api/checkins/pending` - Listar check-ins pendentes
- `GET /api/checkins/user/:userId` - Check-ins de um usuário
- `PUT /api/checkins/:id` - Atualizar status do check-in

### Estatísticas

- `GET /api/stats` - Obter estatísticas gerais

## 🎯 Funcionalidades Futuras

- [ ] Notificações push
- [ ] Histórico detalhado de presenças
- [ ] Sistema de pontos/gamificação
- [ ] Integração com sistemas de pagamento
- [ ] Relatórios em PDF
- [ ] Sistema de mensagens entre aluno e admin
- [ ] Agendamento de aulas
- [ ] QR Code para check-in automático

## 🔧 Configuração do Backend

### Usando MongoDB

```javascript
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

### Schemas Sugeridos

**User Schema:**

```javascript
{
  name: String,
  email: String,
  password: String, // bcrypt hash
  type: String, // 'student' | 'admin'
  belt: String,
  degrees: Number,
  birthDate: Date,
  lastGraduation: Date,
  nextGraduation: Date,
  createdAt: Date
}
```

**Checkin Schema:**

```javascript
{
  userId: ObjectId,
  classId: Number,
  className: String,
  time: String,
  date: Date,
  status: String, // 'pending' | 'confirmed' | 'rejected'
  createdAt: Date
}
```

## 🎨 Personalizando Cores

Edite o arquivo `src/constants/theme.js`:

```javascript
export const COLORS = {
  primary: "#E31E24", // Vermelho GB
  accent: "#1E88E5", // Azul
  // ...
};
```

## 📱 Build para Produção

### iOS

```bash
# Build standalone
expo build:ios

# Ou com EAS
eas build --platform ios
```

### Android

```bash
# Build APK
expo build:android -t apk

# Ou AAB para Play Store
expo build:android -t app-bundle

# Com EAS
eas build --platform android
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é um sistema personalizado para escolas Gracie Barra.

## 👨‍💻 Desenvolvido por

Desenvolvido com ❤️ para a comunidade Gracie Barra

## 📞 Suporte

Para suporte, envie um email para: suporte@graciebarra.com

---

**Gracie Barra** - Brotherhood, Integrity, Development

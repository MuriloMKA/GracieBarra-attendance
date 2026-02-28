# 🔐 Guia de Configuração - Conexão com MongoDB

## ✅ O que foi configurado:

1. **Backend com JWT e bcrypt** - Autenticação segura com senhas hasheadas
2. **Frontend conectado à API** - Dados reais do MongoDB (sem mais dados mock)
3. **Login simplificado** - 1 admin + 4 alunos de teste com diferentes faixas
4. **Segurança básica** - Tokens JWT, CORS configurado, senhas hasheadas

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Iniciar o Backend (Servidor)

```powershell
# Na pasta do projeto
node server/index.js
```

Você verá:

```
✅ MongoDB conectado com sucesso!
🚀 Servidor rodando em http://localhost:3001
```

### 2️⃣ Inicializar os Dados no Banco (APENAS UMA VEZ)

Com o servidor rodando, abra um novo terminal e execute:

```powershell
# Via PowerShell - usando Invoke-RestMethod
Invoke-RestMethod -Uri "http://localhost:3001/api/setup/init" -Method POST -ContentType "application/json"
```

**OU via browser/Postman:**

- Método: `POST`
- URL: `http://localhost:3001/api/setup/init`

Isso criará:

- ✅ 1 Professor (Admin)
- ✅ 4 Alunos de teste (diferentes faixas)
- ✅ 3 Aulas padrão
- ✅ Todas as senhas hasheadas com bcrypt

**Resposta esperada:**

```json
{
  "message": "Dados iniciais criados com sucesso!",
  "users": {
    "admin": "admin@graciebarra.com / admin123",
    "students": "joao@example.com, maria@example.com, carlos@example.com, pedro@example.com / aluno123"
  }
}
```

### 3️⃣ Iniciar o Frontend (Desenvolvimento)

```powershell
# Em OUTRO terminal
npm run dev
```

Acesse: http://localhost:5173

### 4️⃣ Fazer Login

Use um dos usuários de teste:

**👨‍🏫 Professor (Admin):**

- Email: `admin@graciebarra.com`
- Senha: `admin123`

**🥋 Alunos:**

- **João Silva** (Branca 1°): `joao@example.com` / `aluno123`
- **Maria Santos** (Azul 2°): `maria@example.com` / `aluno123`
- **Carlos Oliveira** (Roxa): `carlos@example.com` / `aluno123`
- **Pedro Costa** (GBK - Cinza 3°): `pedro@example.com` / `aluno123`

---

## 📱 Testar no Celular

### Opção 1: Via Navegador

1. Descubra seu IP local:

   ```powershell
   ipconfig
   ```

   (Procure por "Endereço IPv4" - ex: 192.168.15.11)

2. **Atualize o arquivo `.env.local`:**

   ```
   VITE_API_URL=http://192.168.15.11:3001/api
   ```

   (Substitua pelo seu IP)

3. Refaça o build:

   ```powershell
   npm run build
   npx cap sync
   ```

4. No celular (mesma WiFi), acesse:
   ```
   http://192.168.15.11:5173
   ```

### Opção 2: App Nativo Android

1. Atualize `.env.local` com seu IP (como acima)

2. Faça o build e instale:
   ```powershell
   npm run build
   npx cap sync
   cd android
   ./gradlew installDebug
   ```

O app será instalado no celular conectado!

---

## 🔒 Segurança Implementada

### ✅ Autenticação JWT

- Token válido por 7 dias
- Token enviado em todas as requisições protegidas
- Logout remove o token

### ✅ Senhas Hasheadas

- bcrypt com salt rounds = 10
- Senhas NUNCA armazenadas em texto plano

### ✅ Rotas Protegidas

Todas as rotas de API (exceto `/login` e `/health`) exigem autenticação:

- `/api/students` - protegida
- `/api/attendance` - protegida
- `/api/classes` - protegida

### ✅ CORS Configurado

- Backend aceita requisições do frontend
- Em produção, configure domínios específicos

---

## 🔧 Configuração de Variáveis de Ambiente

### Backend (`.env`)

```env
MONGODB_URI=mongodb+srv://murilo_dev:MuriloKaspar93blocobe@gb-attendence.vw27p8v.mongodb.net/gb-attendance?retryWrites=true&w=majority
PORT=3001
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_aqui_mude_em_producao
```

### Frontend (`.env.local`)

```env
# Desenvolvimento local:
VITE_API_URL=http://localhost:3001/api

# Para celular (mesma rede WiFi):
# VITE_API_URL=http://SEU_IP:3001/api
```

**⚠️ IMPORTANTE:** Nunca commite o `.env` com dados sensíveis no Git!

---

## 📊 Estrutura do Banco de Dados

### Collections:

#### `users`

```javascript
{
  email: "admin@graciebarra.com",
  password: "$2a$10$...", // hash bcrypt
  role: "admin",
  name: "Professor Admin",
  studentId: ObjectId // apenas para students
}
```

#### `students`

```javascript
{
  name: "João Silva",
  email: "joao@example.com",
  program: "GB1",
  belt: "White",
  degrees: 1,
  lastGraduationDate: "2025-08-20",
  nextDegreeDate: "2026-05-20",
  birthDate: "1995-03-15",
  specialDates: []
}
```

#### `attendance`

```javascript
{
  studentId: ObjectId,
  date: "2026-02-27T20:10:00.000Z",
  classId: "c1",
  className: "Fundamentos",
  classTime: "20:10",
  confirmed: false
}
```

#### `classes`

```javascript
{
  name: "Fundamentos",
  time: "19:00",
  instructor: "Professor Admin",
  daysOfWeek: [1, 3, 5] // 0=Dom, 1=Seg, ..., 6=Sáb
}
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento

```powershell
# Backend
node server/index.js

# Frontend (navegador)
npm run dev

# Frontend (build para produção)
npm run build

# Sincronizar com apps nativos
npx cap sync

# Abrir Android Studio
npm run android

# Instalar no celular Android
cd android; ./gradlew installDebug
```

### Limpar Dados (Reset)

Se quiser apagar todos os dados e recomeçar:

1. Acesse o MongoDB Atlas
2. Vá em "Collections"
3. Delete todas as collections:
   - `users`
   - `students`
   - `attendance`
   - `classes`
4. Execute novamente: `POST http://localhost:3001/api/setup/init`

---

## 🐛 Troubleshooting

### "Erro ao conectar com o servidor"

1. Verifique se o backend está rodando
2. Confirme a URL em `.env.local`
3. No celular, verifique se está na mesma WiFi

### "Token inválido" ou "Sessão expirada"

- Faça logout e login novamente
- O token expira após 7 dias

### "Cannot POST /api/setup/init"

- Verifique se o servidor está rodando
- Dados já foram inicializados (retorna erro 400)

### Celular não acessa o backend

1. Use o IP correto (não use `localhost`)
2. Desative firewall temporariamente
3. Certifique-se que backend está escutando em `0.0.0.0` (já configurado)

---

## 📝 Próximos Passos para Produção

### Antes de lançar:

1. ✅ Mudar `JWT_SECRET` para uma chave forte
2. ✅ Configurar CORS para aceitar apenas seu domínio
3. ✅ Adicionar HTTPS (SSL/TLS)
4. ✅ Limitar tentativas de login (rate limiting)
5. ✅ Adicionar logs de auditoria
6. ✅ Backup automático do banco de dados
7. ✅ Implementar recuperação de senha por email
8. ✅ Adicionar validação de input mais rigorosa
9. ✅ Remover os botões de "acesso rápido" da tela de login

---

## 🎉 Tudo Pronto!

Seu app agora está conectado ao MongoDB com autenticação segura!

Qualquer dúvida, é só perguntar! 🥋💪

# 🥋 GB Attendance - Sistema de Presença Gracie Barra

Sistema de gerenciamento de presença para academias Gracie Barra com backend MongoDB e aplicativo mobile nativo.

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)

## 🚀 Como Rodar o Projeto

### 1️⃣ Instalar Dependências

Abra o PowerShell na pasta do projeto e execute:

```powershell
npm install
```

### 2️⃣ Configurar Variáveis de Ambiente

Crie/edite o arquivo `.env` na raiz do projeto com sua string de conexão MongoDB:

```env
MONGODB_URI=sua_string_de_conexao_mongodb_aqui
PORT=3001
JWT_SECRET=sua_chave_secreta_jwt_aqui
```

**Como obter a string do MongoDB Atlas:**

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Vá em "Database" → "Connect" → "Connect your application"
3. Copie a connection string e substitua `<password>` pela sua senha

### 3️⃣ Iniciar o Backend

Em um terminal, execute:

```powershell
node server/index.js
```

Você verá:

```
✅ MongoDB conectado com sucesso!
🚀 Servidor rodando em http://localhost:3001
```

### 4️⃣ Criar Dados Iniciais (Primeira Vez)

Com o backend rodando, em outro terminal execute:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/setup/init" -Method POST -ContentType "application/json"
```

Isso criará:

- 1 usuário admin (admin@graciebarra.com / admin123)
- 4 alunos de teste com diferentes faixas
- 3 aulas padrão (Fundamentos, Avançado, Kids)

### 5️⃣ Iniciar o Frontend

Em outro terminal (deixe o backend rodando), execute:

```powershell
npm run dev -- --host 192.168.15.2
```

**⚠️ IMPORTANTE**: Substitua `192.168.15.2` pelo seu IP local. Para descobrir:

```powershell
ipconfig
```

Procure por "Endereço IPv4" na seção da sua rede WiFi.

## 📱 Como Rodar no Celular (Live Reload)

### ✅ Configuração (já feita!)

O projeto já está configurado para live reload. Qualquer alteração no código atualiza automaticamente no celular!

### 🚀 Passos para rodar:

**1. Configure seu IP no Capacitor:**

Edite `capacitor.config.json` e atualize a URL com seu IP:

```json
{
  "server": {
    "url": "http://SEU_IP:5173",
    "cleartext": true
  }
}
```

**2. Configure o backend no frontend:**

Edite `.env.local` e configure o IP do backend:

```env
VITE_API_URL=http://SEU_IP:3001/api
```

**3. Sincronize e instale no celular:**

```powershell
# Sincronizar configurações
npx cap sync android

# Instalar no celular conectado via USB
cd android
./gradlew installDebug
```

**4. Inicie os servidores:**

Terminal 1 (Backend):

```powershell
node server/index.js
```

Terminal 2 (Frontend com live reload):

```powershell
npm run dev -- --host SEU_IP
```

**5. Abra o app no celular**

O app se conectará automaticamente ao servidor de desenvolvimento e **qualquer mudança no código será refletida instantaneamente** no celular! 🔄

## 🔐 Usuários de Login

Os usuários estão salvos no MongoDB. Use o comando de reset para recriar:

## 🔐 Usuários de Login

Os usuários estão salvos no MongoDB. Use o comando de reset para recriar:

**Admin:**

- Email: admin@graciebarra.com
- Senha: admin123

**Alunos de teste:**

- João Silva (Branca 1°): joao@example.com / aluno123
- Maria Santos (Azul 2°): maria@example.com / aluno123
- Carlos Oliveira (Roxa): carlos@example.com / aluno123
- Pedro Costa (GBK Cinza 3°): pedro@example.com / aluno123

## 🗄️ Gerenciamento do Banco de Dados

### Limpar todas as coleções:

```powershell
node server/reset-db.js
```

### Recriar dados iniciais:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/setup/init" -Method POST -ContentType "application/json"
```

## 📡 API Endpoints

Base URL: `http://localhost:3001/api`

### Autenticação

- `POST /auth/login` - Login (retorna JWT token)

### Alunos (requer autenticação)

- `GET /students` - Lista todos os alunos
- `GET /students/:id` - Busca aluno específico
- `POST /students` - Cria novo aluno
- `PUT /students/:id` - Atualiza aluno

### Presenças (requer autenticação)

- `GET /attendance` - Lista presenças
- `POST /attendance` - Registra presença
- `PATCH /attendance/:id` - Atualiza presença (confirmar/rejeitar)

### Aulas (requer autenticação)

- `GET /classes` - Lista aulas
- `POST /classes` - Cria nova aula

### Setup

- `POST /setup/init` - Cria dados iniciais

**Autenticação:** Inclua o token JWT no header:

```
Authorization: Bearer SEU_TOKEN_JWT
```

## 📁 Estrutura do Projeto

```
GracieBarra-attendance/
├── src/                      # Frontend (React + TypeScript)
│   ├── app/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── ui/           # Componentes Radix UI
│   │   │   ├── BeltDisplay.tsx
│   │   │   └── AttendanceCard.tsx
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Login.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── ...
│   │   ├── context/          # Context API (gerenciamento de estado)
│   │   │   └── DataContext.tsx
│   │   └── services/         # Serviços de API
│   │       └── api.ts        # Axios + interceptors JWT
│   └── styles/               # Estilos CSS/Tailwind
├── server/                   # Backend (Node.js + Express + MongoDB)
│   ├── index.js              # API REST + autenticação JWT
│   └── reset-db.js           # Script para limpar banco
├── android/                  # Projeto Android (Capacitor)
├── capacitor.config.json     # Configuração Capacitor
├── .env                      # Variáveis backend
├── .env.local                # Variáveis frontend
└── package.json              # Dependências
```

## 🛠️ Stack Tecnológica

### Frontend

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router 7** - Roteamento
- **Tailwind CSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones
- **Sonner** - Notificações toast

### Backend

- **Node.js** + **Express**
- **MongoDB** (Mongoose) - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Segurança

### Mobile

- **Capacitor 8** - Framework nativo
- Plugins: App, Network, Splash Screen, Status Bar

## 🔧 Scripts Disponíveis

### Frontend

```powershell
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build
```

### Mobile

```powershell
npm run android          # Build + Sync + Abrir Android Studio
npm run ios              # Build + Sync + Abrir Xcode (Mac)
npm run sync             # Sincronizar com plataformas nativas
npx cap sync android     # Sync apenas Android
npx cap open android     # Abrir Android Studio
```

### Backend

```powershell
node server/index.js     # Iniciar servidor backend
node server/reset-db.js  # Limpar banco de dados
```

## ⚠️ Observações de Segurança

### ⚠️ IMPORTANTE PARA PRODUÇÃO:

1. **Nunca commite arquivos `.env`** com senhas reais
2. **Mude o `JWT_SECRET`** para algo forte e único
3. **Configure CORS** para aceitar apenas domínios específicos
4. **Use HTTPS** em produção
5. **Habilite rate limiting** no backend
6. **Valide todas as entradas** do usuário
7. **Configure corretamente** as permissões do MongoDB Atlas
8. **Use variáveis de ambiente** para strings sensíveis

### Exemplo de CORS em produção:

```javascript
app.use(
  cors({
    origin: ["https://seudominio.com"],
    credentials: true,
  }),
);
```

## 🐛 Problemas Comuns

### "Erro ao conectar MongoDB"

- Verifique a string de conexão no `.env`
- Confirme que tem acesso à internet
- Verifique se seu IP está liberado no MongoDB Atlas
- Vá em Network Access e adicione seu IP ou use `0.0.0.0/0` (não recomendado para produção)

### "Não consigo acessar do celular"

- Confirme que ambos estão na **mesma rede WiFi**
- Desative temporariamente o firewall do Windows
- Use o IP correto (o que aparece no terminal)
- Verifique se a porta 5173 e 3001 estão abertas

### "Perfil de aluno não encontrado"

- Certifique-se que executou o setup inicial: `POST /api/setup/init`
- Limpe o banco e recrie: `node server/reset-db.js` + setup init
- Verifique se o studentId está sendo retornado no login

### "Token inválido" ou "Sessão expirada"

- Faça logout e login novamente
- Limpe o localStorage do navegador (F12 → Application → Clear)
- Os tokens JWT expiram em 7 dias

### "Live reload não funciona no celular"

- Verifique se o `capacitor.config.json` tem a URL correta
- Confirme que o servidor dev está rodando com `--host SEU_IP`
- Reinstale o app após mudar configurações: `npx cap sync android && cd android && ./gradlew installDebug`

### "Gradle build failed"

- Abra o Android Studio e deixe sincronizar/baixar dependências
- Execute: `cd android && ./gradlew clean`
- Verifique se tem Java 17 instalado

## 📚 Documentação Adicional

- [GUIA-APP-NATIVO.md](GUIA-APP-NATIVO.md) - Guia completo para gerar apps Android/iOS
- [CONFIGURACAO-MONGODB.md](CONFIGURACAO-MONGODB.md) - Configuração e segurança do MongoDB

## 🚀 Próximas Funcionalidades

- [ ] Dashboard com gráficos de frequência
- [ ] Sistema de notificações push
- [ ] Relatórios em PDF
- [ ] Integração com calendário
- [ ] Sistema de pagamentos
- [ ] Chat entre alunos e professores
- [ ] Vídeos de técnicas/treinos
- [ ] Ranking de frequência

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Desenvolvido com ❤️ para Gracie Barra

# 🥋 GB Attendance - Sistema de Presença Gracie Barra

Sistema de gerenciamento de presença para academias Gracie Barra.

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)

## 🚀 Como Rodar o Projeto

### 1️⃣ Instalar Dependências

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
npm install --prefix . -f express mongoose cors dotenv bcryptjs jsonwebtoken
```

### 2️⃣ Configurar Variáveis de Ambiente

O arquivo `.env` já está criado com sua string do MongoDB. Verifique se está correto:

```
MONGODB_URI=mongodb+srv://murilo_dev:MuriloKaspar93blocobe@gb-attendence.vw27p8v.mongodb.net/gb-attendance?retryWrites=true&w=majority
PORT=3001
```

### 3️⃣ Iniciar o Backend (Servidor)

Em um terminal, execute:

```powershell
node server/index.js
```

Você verá:

```
✅ MongoDB conectado com sucesso!
🚀 Servidor rodando em http://localhost:3001
```

### 4️⃣ Iniciar o Frontend

Em OUTRO terminal (deixe o backend rodando), execute:

```powershell
npm run dev
```

Você verá algo como:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.X:5173/
```

### 5️⃣ Acessar o Aplicativo

- **No computador**: Abra http://localhost:5173
- **No celular**: Use o endereço Network (ex: http://192.168.1.X:5173)

## 📱 Como Rodar no Celular

### ✅ Opção 1: Navegador (Mais Simples e Rápido)

1. Certifique-se que o celular está na **mesma rede WiFi** que o computador
2. Anote o endereço IP do seu computador:

   ```powershell
   ipconfig
   ```

   Procure por "Endereço IPv4" (exemplo: 192.168.1.100)

3. No celular, abra o navegador e acesse:

   ```
   http://SEU_IP:5173
   ```

   Exemplo: `http://192.168.1.100:5173`

4. Para adicionar à tela inicial (como app):
   - **Android**: Menu → "Adicionar à tela inicial"
   - **iOS**: Compartilhar → "Adicionar à Tela de Início"

### 🚀 Opção 2: Aplicativo Nativo (Android/iOS) - **JÁ CONFIGURADO!**

Seu projeto agora está pronto para gerar aplicativos nativos!

**Para Android:**

```powershell
# Abrir projeto no Android Studio
npm run android

# OU gerar APK diretamente
npm run build
npx cap sync
cd android
./gradlew assembleDebug
```

O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

**Para iOS (apenas em Mac):**

```powershell
npm run ios
```

📖 **Guia Completo**: Veja o arquivo [GUIA-APP-NATIVO.md](GUIA-APP-NATIVO.md) para instruções detalhadas de como:

- ✅ Instalar Android Studio
- ✅ Gerar APK para Android
- ✅ Testar no emulador ou celular
- ✅ Publicar na Google Play Store
- ✅ Gerar IPA para iOS (no Mac)
- ✅ Publicar na Apple App Store
- ✅ Personalizar ícone e splash screen

**Scripts úteis:**

```powershell
npm run android      # Build + Sync + Abrir Android Studio
npm run ios          # Build + Sync + Abrir Xcode (Mac)
npm run sync         # Sincronizar mudanças com as plataformas
npm run run:android  # Rodar no celular Android conectado via USB
```

## 🔐 Usuários Padrão (Temporário - dados mock)

**Admin:**

- Email: admin@gb.com
- Senha: admin123

**Aluno:**

- Email: joao@example.com
- Senha: senha123

## 📡 API Endpoints

Base URL: `http://localhost:3001/api`

- `GET /students` - Lista todos os alunos
- `GET /students/:id` - Busca aluno específico
- `POST /students` - Cria novo aluno
- `PUT /students/:id` - Atualiza aluno
- `GET /attendance` - Lista presenças
- `POST /attendance` - Registra presença
- `GET /classes` - Lista aulas
- `POST /auth/login` - Login

## 🛠️ Próximos Passos

Para conectar o frontend com o backend:

1. Instalar axios no frontend:

```powershell
npm install axios
```

2. Atualizar o `DataContext.tsx` para fazer chamadas HTTP ao backend ao invés de usar dados mock

3. Adicionar autenticação JWT para segurança

## 📝 Estrutura do Projeto

```
GracieBarra-attendance/
├── src/                    # Frontend (React)
│   ├── app/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   └── context/        # Context API (dados mock)
│   └── styles/             # Estilos CSS
├── server/                 # Backend (Node.js + Express)
│   └── index.js            # API REST + MongoDB
├── .env                    # Variáveis de ambiente
└── package.json            # Dependências

```

## ⚠️ Observações Importantes

1. **Segurança**: A senha está em texto plano. Em produção, use bcrypt para hash!
2. **CORS**: O backend aceita requisições de qualquer origem. Configure corretamente em produção.
3. **JWT**: Adicione autenticação JWT para produção.
4. **Firewall**: Pode ser necessário liberar a porta 5173 e 3001 no firewall do Windows.

## 🐛 Problemas Comuns

### "Erro ao conectar MongoDB"

- Verifique a string de conexão no `.env`
- Confirme que tem acesso à internet
- Verifique se o IP está liberado no MongoDB Atlas

### "Não consigo acessar do celular"

- Confirme que ambos estão na mesma rede WiFi
- Desative temporariamente o firewall do Windows
- Use o IP correto (o que aparece no terminal quando roda `npm run dev`)

### "Porta já está em uso"

- Mude a porta no `vite.config.ts` ou `.env`

## 📞 Suporte

Qualquer dúvida, pode perguntar!

---

Desenvolvido com ❤️ para Gracie Barra

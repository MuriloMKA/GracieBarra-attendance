# 🚀 Guia de Deploy

Este guia mostra como fazer o deploy do sistema Gracie Barra Attendance em produção.

## 📋 Pré-requisitos

- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuito)
- Conta no [Railway](https://railway.app/) ou [Render](https://render.com/) para o backend (gratuito)
- Conta no [Expo](https://expo.dev/) para publicar o app

## 🗄️ Passo 1: Configurar MongoDB Atlas

### 1.1 Criar Cluster

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (opção FREE)
4. Aguarde a criação (pode levar alguns minutos)

### 1.2 Configurar Acesso

1. Vá para "Database Access"
2. Adicione um novo usuário com senha
3. Anote o usuário e senha

### 1.3 Configurar Network Access

1. Vá para "Network Access"
2. Adicione `0.0.0.0/0` (permitir de qualquer lugar)

### 1.4 Obter Connection String

1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Copie a connection string
4. Substitua `<password>` pela senha do seu usuário

Exemplo:

```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/graciebarra?retryWrites=true&w=majority
```

## 🖥️ Passo 2: Deploy do Backend

### Opção A: Railway (Recomendado)

1. **Criar conta no Railway**
   - Acesse [railway.app](https://railway.app/)
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório do seu projeto

3. **Configurar variáveis de ambiente**
   - Na aba "Variables", adicione:

   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=sua-connection-string-aqui
   JWT_SECRET=seu-segredo-super-seguro-aqui
   JWT_EXPIRES_IN=7d
   ```

4. **Deploy automático**
   - O Railway detectará automaticamente o Node.js
   - Aguarde o deploy (3-5 minutos)
   - Anote a URL gerada (ex: `https://seu-app.railway.app`)

### Opção B: Render

1. **Criar conta no Render**
   - Acesse [render.com](https://render.com/)
   - Faça login com GitHub

2. **Criar Web Service**
   - Clique em "New +"
   - Selecione "Web Service"
   - Conecte seu repositório

3. **Configurar**
   - Name: `graciebarra-api`
   - Region: escolha a mais próxima
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Adicionar variáveis de ambiente**
   - Na seção "Environment Variables", adicione as mesmas do Railway

5. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde o deploy

## 📱 Passo 3: Publicar o App Mobile

### 3.1 Atualizar URL da API

Edite `src/services/api.js`:

```javascript
const API_URL = "https://sua-url-do-backend.railway.app/api";
```

### 3.2 Build com EAS

1. **Instalar EAS CLI**

```bash
npm install -g eas-cli
```

2. **Login no Expo**

```bash
eas login
```

3. **Configurar EAS**

```bash
eas build:configure
```

4. **Build para Android**

```bash
eas build --platform android
```

5. **Build para iOS** (requer conta Apple Developer)

```bash
eas build --platform ios
```

### 3.3 Publicar no Expo (Para testes)

```bash
expo publish
```

Isso gerará um link que pode ser aberto no Expo Go.

## 🏪 Passo 4: Publicar nas Lojas

### Google Play Store (Android)

1. **Criar conta de desenvolvedor**
   - Acesse [Google Play Console](https://play.google.com/console)
   - Pague a taxa única de $25

2. **Gerar APK/AAB**

```bash
eas build --platform android --profile production
```

3. **Upload na Play Store**
   - Acesse o Play Console
   - Crie novo aplicativo
   - Faça upload do AAB
   - Preencha as informações e screenshots
   - Envie para revisão

### Apple App Store (iOS)

1. **Conta Apple Developer**
   - Precisa de conta paga ($99/ano)

2. **Gerar IPA**

```bash
eas build --platform ios --profile production
```

3. **Upload via App Store Connect**
   - Use o Transporter ou Xcode
   - Preencha informações
   - Envie para revisão

## 🔒 Passo 5: Segurança em Produção

### Backend

1. **Nunca commite .env**
   - Sempre use variáveis de ambiente
2. **Use HTTPS**
   - Railway/Render já fornecem HTTPS

3. **Rate Limiting**

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // max 100 requisições
});

app.use(limiter);
```

4. **Helmet.js**

```javascript
const helmet = require("helmet");
app.use(helmet());
```

### Frontend

1. **Não armazene dados sensíveis**
   - Use apenas tokens JWT
2. **Valide inputs**
   - Sempre valide no frontend e backend

## 📊 Passo 6: Monitoramento

### Backend

- Use logs do Railway/Render
- Configure alertas de erro

### Database

- Configure alertas no MongoDB Atlas
- Monitore uso de recursos

### App

- Use [Sentry](https://sentry.io/) para tracking de erros

```bash
npm install @sentry/react-native
```

## 🔄 Passo 7: Atualizações OTA (Over The Air)

Com Expo, você pode atualizar o app sem republicar:

```bash
expo publish
```

Ou com EAS Update:

```bash
eas update --branch production
```

## 💰 Custos Estimados

### Serviços Gratuitos (Desenvolvimento)

- MongoDB Atlas: Gratuito até 512MB
- Railway: $5 em créditos gratuitos/mês
- Render: Gratuito com limitações
- Expo: Gratuito

### Produção (Estimativa)

- MongoDB Atlas: $0-9/mês (depende do uso)
- Railway/Render: $5-20/mês
- Apple Developer: $99/ano
- Google Play: $25 (taxa única)

## 🆘 Troubleshooting

### Backend não inicia

- Verifique logs do Railway/Render
- Confirme connection string do MongoDB
- Teste localmente primeiro

### App não conecta à API

- Verifique CORS no backend
- Confirme URL da API no código
- Teste a API com Postman/Insomnia

### Build falha

- Limpe cache: `expo start -c`
- Delete `node_modules` e reinstale
- Verifique versões das dependências

## 📚 Recursos Adicionais

- [Documentação Expo](https://docs.expo.dev/)
- [Documentação Railway](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

---

Dúvidas? Consulte a documentação ou abra uma issue no repositório! 🚀

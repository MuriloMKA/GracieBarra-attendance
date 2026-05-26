# GB Attendance

Sistema de controle de presenças da Gracie Barra, agora focado em **aplicação web** com deploy no Railway.

## Visão Geral

- Frontend em React + Vite
- Backend em Node.js + Express
- Banco em MongoDB
- QR Code com câmera do navegador
- Deploy simples: o backend também serve o frontend compilado em `dist/`

## Requisitos

- Node.js 20+
- Git
- Conta no Railway
- MongoDB Atlas ou outro MongoDB acessível pela internet

## Rodando Localmente

Instale as dependências:

```powershell
npm install
```

Crie um arquivo `.env` na raiz com as variáveis do backend:

```env
MONGODB_URI=sua_string_mongodb
JWT_SECRET=sua_chave_secreta
PORT=3001
```

Opcional, se usar notificações por Firebase:

```env
FIREBASE_SERVICE_ACCOUNT_BASE64=...
EMAIL_USER=...
EMAIL_PASS=...
```

Inicie o backend:

```powershell
npm run backend
```

Em outro terminal, rode o frontend em desenvolvimento:

```powershell
npm run dev
```

## Como o deploy funciona

Este projeto não depende mais de app nativo.

- O Vite gera a build em `dist/`
- O Express em `server/index.js` serve essa build automaticamente
- O Railway sobe tudo em um único serviço

## Deploy no Railway

Use estas configurações:

- Build command: `npm install --include=dev && npm run build`
- Start command: `node server/index.js`

Variáveis de ambiente mínimas no Railway:

```env
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
```

Se usar email/Firebase, mantenha também as variáveis correspondentes.

## Domínio personalizado no Railway

No serviço do Railway:

1. Abra o serviço `GracieBarra-attendance`
2. Vá em `Settings`
3. Abra `Networking`
4. Clique em `Custom Domain`
5. Adicione seu domínio ou subdomínio

O Railway vai mostrar o registro DNS que você precisa criar no provedor do seu domínio.

## QR Code e câmera

O leitor usa a câmera do navegador.

- Precisa de HTTPS em produção
- Em localhost funciona para desenvolvimento
- Em celular, o navegador vai pedir permissão de câmera

## Usuários iniciais

Após iniciar o backend, crie os dados de teste com:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/setup/init" -Method POST -ContentType "application/json"
```

Credenciais padrão:

- Admin: `admin@graciebarra.com` / `admin123`

## Estrutura principal

- `src/` - Frontend React
- `server/` - API Express
- `dist/` - Build final da aplicação web

## Scripts úteis

```powershell
npm run dev
npm run build
npm run preview
npm run backend
```

## Observações

- O projeto agora está preparado para web e escalonamento
- Não há mais fluxo de Android/iOS no caminho principal
- O backend continua responsável por autenticação, presenças, alunos e notificações

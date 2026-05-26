# Deploy Web

Este projeto agora roda como **aplicação web** e é publicado pelo Railway.

## Como funciona

- O frontend é compilado pelo Vite para `dist/`
- O backend Express serve a build estática automaticamente
- Você não precisa mais de Capacitor, Android ou iOS

## Railway

Configuração recomendada:

- Build command: `npm install --include=dev && npm run build`
- Start command: `node server/index.js`

Variáveis mínimas:

```env
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
```

## Domínio

No Railway:

1. Abra o serviço da aplicação
2. Vá em `Settings`
3. Entre em `Networking`
4. Clique em `Custom Domain`
5. Adicione o domínio desejado

## QR Code

O leitor de QR Code usa a câmera do navegador.

- Em produção precisa de HTTPS
- Em desenvolvimento funciona em `localhost`
- Em celular, o navegador vai pedir permissão de câmera

## Desenvolvimento local

```powershell
npm install
npm run backend
npm run dev
```

Se quiser publicar mudanças, faça:

```powershell
npm run build
```

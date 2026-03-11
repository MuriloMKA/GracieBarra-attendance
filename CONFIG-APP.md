# 📱 Configuração do App - IMPORTANTE

## ⚠️ O QUE ESTAVA ERRADO

O `capacitor.config.json` estava configurado com:

```json
"url": "http://192.168.15.200:5173"
```

Isso fazia o app tentar **carregar do servidor de desenvolvimento** em vez de usar os **arquivos locais** do build!

## ✅ SOLUÇÃO APLICADA

### capacitor.config.json (PRODUÇÃO)

- **SEM** propriedade `url`
- App usa arquivos LOCAIS do `dist/`
- Standalone - funciona sem servidor rodando
- API: `http://192.168.15.200:3001` (compilado no código)

### capacitor.config.dev.json (DESENVOLVIMENTO)

- **COM** propriedade `url: "http://192.168.15.200:5173"`
- App carrega do servidor Vite (live reload)
- Requer `npm run dev` rodando

## 🚀 Como Usar

### Para atualizar o app após mudanças de código:

**Opção 1 - Script automático (RECOMENDADO):**

```bash
atualizar-app.cmd
```

**Opção 2 - Manual:**

```bash
$env:VITE_API_URL="http://192.168.15.200:3001/api"
npm run build
npx cap sync android
cd android
./gradlew installDebug
```

### Para desenvolvimento no PC (browser):

```bash
npm run dev
```

Acesse: http://localhost:5173

### Para iniciar o backend:

```bash
node server/index.js
```

Ou use o script: `iniciar.cmd`

## 📝 Credenciais de Login

- **Email:** admin@graciebarra.com
- **Senha:** admin123

## 🔧 Configurações Importantes

### .env

```
VITE_API_URL=http://192.168.15.200:3001/api
```

Esta variável é compilada no build do app!

### Backend (server/index.js)

- Porta: 3001
- Escuta em: 0.0.0.0 (todas as interfaces)
- Acessível em: http://192.168.15.200:3001

## 🌐 Rede

- **IP Fixo:** 192.168.15.200
- **Celular deve estar:** No mesmo WiFi (192.168.15.x)
- **Firewall:** Porta 3001 liberada

## ⚡ Modo Desenvolvimento vs Produção

| Aspecto            | Produção (Atual)        | Desenvolvimento             |
| ------------------ | ----------------------- | --------------------------- |
| Arquivo config     | `capacitor.config.json` | `capacitor.config.dev.json` |
| URL no config      | ❌ Sem URL              | ✅ Com URL (5173)           |
| Arquivos           | Locais (dist/)          | Servidor Vite               |
| Servidor Vite      | ❌ Não precisa          | ✅ Necessário               |
| Live Reload        | ❌ Não                  | ✅ Sim                      |
| Rebuild necessário | ✅ Sim                  | ❌ Não                      |

## 🎯 Resumo

O app agora está em **modo PRODUÇÃO standalone**:

- ✅ Usa arquivos locais compilados
- ✅ Backend em 192.168.15.200:3001 (hardcoded no build)
- ✅ Não precisa do servidor Vite rodando
- ✅ Funciona independente após instalado
- ❌ Precisa rebuild + reinstall para ver mudanças de código

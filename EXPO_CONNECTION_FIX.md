# 🔧 Solução: Erro de Conexão no Expo Go

## ❌ Erro Reportado

```
uncaught error java.io.ioexception failed to download remote update
```

## 📋 Causas Comuns

Este erro acontece quando o **Expo Go não consegue se conectar ao servidor de desenvolvimento** no seu computador.

### Motivos principais:

1. **Redes diferentes** - Celular e computador não estão no mesmo WiFi
2. **Firewall do Windows** - Bloqueando a conexão
3. **Backend não está rodando** - API não está disponível
4. **VPN ou proxy ativo** - Interferindo na conexão local

---

## ✅ Soluções (Testar nesta ordem)

### 🔹 Solução 1: Verificar Versões e Reinstalar

```powershell
# 1. Parar todos os processos Expo
Get-Process | Where-Object {$_.ProcessName -like "*expo*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. Atualizar para versões compatíveis
npm install

# 3. Limpar cache do Expo
npx expo start --clear
```

### 🔹 Solução 2: Mesma Rede WiFi ⭐ **MAIS COMUM**

**Passo a passo:**

1. ✅ Verifique se o celular e o computador estão **no mesmo WiFi**
2. ✅ Não use dados móveis no celular
3. ✅ Não use VPN em nenhum dos dispositivos
4. ✅ Desative o modo "Economia de dados" no celular

**Testar:**

```powershell
# Iniciar Expo em modo LAN (padrão)
npx expo start
```

No Expo Go, escaneie o QR code que aparece no terminal.

---

### 🔹 Solução 3: Modo Tunnel (Funciona em QUALQUER rede)

Se você não pode colocar os dispositivos na mesma rede:

```powershell
# Instalar ngrok (necessário para tunnel)
npm install -g @expo/ngrok

# Iniciar com tunnel
npx expo start --tunnel
```

⚠️ **Nota:** O modo tunnel é mais lento, mas funciona mesmo com redes diferentes.

---

### 🔹 Solução 4: Liberar Firewall do Windows

O Windows pode estar bloqueando a porta 8081 (Expo) e 3000 (Backend).

**Abrir PowerShell como Administrador e executar:**

```powershell
# Liberar porta do Expo (8081)
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow

# Liberar porta do Backend (3000)
New-NetFirewallRule -DisplayName "Node Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Depois reinicie o Expo:

```powershell
npx expo start
```

---

### 🔹 Solução 5: Descobrir IP do Computador

Se o QR code não funcionar, você pode conectar manualmente:

```powershell
# Descobrir o IP local do seu computador
ipconfig | Select-String "IPv4"
```

Exemplo de resultado:

```
IPv4 Address. . . . . . . . . . . : 192.168.1.10
```

**No Expo Go:**

1. Abra o app Expo Go
2. Toque em "Enter URL manually"
3. Digite: `exp://192.168.1.10:8081`
4. Toque em "Connect"

---

### 🔹 Solução 6: Verificar Backend

O backend **precisa estar rodando** para o app funcionar:

```powershell
# Terminal 1: Backend
cd backend
node server.js
# Deve mostrar: "✅ Servidor rodando na porta 3000"

# Terminal 2 (novo): Frontend
npx expo start
```

**Testar se o backend está respondendo:**

```powershell
# Abrir navegador em:
http://localhost:3000/api/test
```

Se aparecer uma resposta JSON, o backend está funcionando! ✅

---

### 🔹 Solução 7: Usar Emulador Android (Alternativa)

Se nada funcionar, use um emulador:

```powershell
# Com Android Studio instalado:
npx expo start --android
```

Ou baixe o **Android Studio** e configure um emulador virtual.

---

## 🎯 Checklist Rápido

Antes de escanear o QR code:

- [ ] Backend rodando (`node backend/server.js`)
- [ ] Frontend rodando (`npx expo start`)
- [ ] Celular e PC na mesma rede WiFi
- [ ] WiFi ativo no celular (não dados móveis)
- [ ] Firewall liberado (portas 3000 e 8081)
- [ ] Expo Go instalado no celular
- [ ] Nenhuma VPN ativa

---

## 🆘 Debug Avançado

### Ver logs detalhados do terminal:

```powershell
# Iniciar com logs detalhados
npx expo start --clear --verbose
```

### Testar conectividade da rede:

```powershell
# Ping do celular para o PC (descobrir IP do PC primeiro)
ipconfig | Select-String "IPv4"

# No celular, instale um app de "Network Tools" e faça ping para o IP do PC
```

---

## ✅ Próximos Passos

Depois de conectar com sucesso:

1. **Fazer login no app:**
   - Email: `aluno@gb.com`
   - Senha: `123456`

2. **Testar funcionalidades:**
   - Check-in de presença
   - Ver carteirinha digital
   - Ver progresso até a faixa

3. **Login admin (para gerenciar):**
   - Email: `admin@gb.com`
   - Senha: `123456`

---

## 📞 Comandos Úteis

```powershell
# Reiniciar tudo do zero
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
npx expo start --clear

# Verificar portas em uso
Get-NetTCPConnection -LocalPort 3000,8081

# Matar processo específico
Stop-Process -Id <PID> -Force

# Ver IP do computador
ipconfig
```

---

🎉 **Após conectar, o app funcionará normalmente!**

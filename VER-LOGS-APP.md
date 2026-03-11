# 🔍 Como Ver os Logs do App Android

## Método 1: Chrome DevTools (RECOMENDADO)

### Passo a Passo:

1. **No PC, abra o Chrome** e acesse:

   ```
   chrome://inspect
   ```

2. **Conecte o celular via USB** (com depuração USB ativada)

3. **Na página chrome://inspect**, você verá:
   - Lista de dispositivos conectados
   - Procure por: `com.graciebarrabarra.attendance`
   - Clique no botão **"inspect"**

4. **DevTools abrirá automaticamente**
   - Clique na aba **"Console"**

5. **Com o Console aberto no PC**:
   - Abra o app no celular
   - Tente fazer login
   - OBSERVE o console no PC

6. **Você verá logs como**:

   ```
   🔍 API_URL configurada: http://192.168.15.200:3001/api
   🔐 Tentando login com: {email: "admin@...", url: "..."}
   ❌ Erro no login: 401 {error: "..."}
   ```

7. **Copie TODOS os logs** e envie para análise

---

## Método 2: ADB Logcat (Alternativo)

Se o chrome://inspect não funcionar, use o ADB:

### Requisitos:

- Android SDK instalado
- ADB no PATH

### Comando:

```bash
adb logcat | Select-String "System.out|chromium"
```

Ou apenas:

```bash
adb logcat *:E
```

(Mostra apenas erros)

---

## O que os logs vão revelar:

✅ **URL sendo usada pelo app**

- Se for `localhost:3001` → PROBLEMA! (app não atualizou)
- Se for `192.168.15.200:3001` → OK! (problema é outra coisa)

✅ **Erro específico do login**

- `401 Unauthorized` → Credenciais incorretas no banco
- `ERR_CONNECTION_REFUSED` → Backend não acessível
- `ERR_CONNECTION_ABORTED` → Rede/Firewall bloqueando
- `Network Error` → Problema de conectividade

✅ **Payload sendo enviado**

- Confirma se email/senha estão corretos no request

---

## Se não conseguir usar nenhum método:

**Alternativa: Teste direto no navegador do celular**

1. Abra o navegador do celular (Chrome/Firefox)
2. Acesse: `http://192.168.15.200:5173`
3. Tente fazer login
4. Se funcionar → problema é específico do app
5. Se não funcionar → problema é de rede

---

## Troubleshooting Chrome Inspect:

### Não aparece o device?

- Certifique-se que depuração USB está ativada
- Tente desconectar e reconectar o USB
- Autorize a depuração no popup do celular

### Não aparece a aplicação?

- Certifique-se que o app está ABERTO no celular
- Feche e abra o app novamente
- Atualize a página chrome://inspect

### Console está vazio?

- Recarregue o app (feche e abra novamente)
- Os logs aparecem sempre que o app inicia

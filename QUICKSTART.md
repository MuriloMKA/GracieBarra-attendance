# 🚀 Guia de Início Rápido - Gracie Barra Attendance

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

Para testar no celular:

- Instale o app **Expo Go** ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🎯 Passo a Passo

### 1. Instalar Dependências do Frontend

```powershell
# Na pasta principal do projeto
npm install
```

### 2. Configurar o Backend

```powershell
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# O arquivo .env já está configurado com MongoDB Atlas
# Popular banco de dados com dados iniciais
npm run seed

# Voltar para a pasta principal
cd ..
```

### 3. Iniciar o Backend

```powershell
# Na pasta backend
cd backend
npm start
```

O servidor estará rodando em `http://localhost:3000`

✅ **MongoDB Atlas conectado!** Veja [MONGODB_SETUP.md](MONGODB_SETUP.md) para mais detalhes.

### 4. Iniciar o Frontend (Expo)

Em um novo terminal:

```powershell
# Na pasta principal do projeto
npm start
```

Isso abrirá o Expo Developer Tools no seu navegador.

### 5. Testar no Celular

1. Abra o app **Expo Go** no seu celular
2. Escaneie o QR code que apareceu no terminal/navegador
3. O app será carregado no seu celular!

### 6. Fazer Login

Use uma das credenciais de teste:

**Como Aluno:**

- Email: `aluno@gb.com`
- Senha: `123456`

**Como Admin:**

- Email: `admin@gb.com`
- Senha: `123456`

## 🎨 Testando as Funcionalidades

### Como Aluno:

1. Faça login com credenciais de aluno
2. Veja os horários disponíveis
3. Clique em uma aula para fazer check-in
4. Navegue até "Perfil" para ver seu cartão digital

### Como Admin:

1. Faça login com credenciais de admin
2. Veja os check-ins pendentes no dashboard
3. Confirme ou rejeite check-ins
4. Navegue até "Alunos" para gerenciar os alunos
5. Edite informações e promova alunos

## 🔧 Comandos Úteis

```powershell
# Limpar cache do Expo
npx expo start --clear

# Rodar no emulador Android
npm run android

# Rodar no simulador iOS (apenas Mac)
npm run ios

# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version
```

## 🐛 Problemas Comuns

### "Metro bundler stuck at 100%"

```powershell
npx expo start --clear
```

### "Cannot connect to backend"

- Verifique se o backend está rodando em `http://localhost:3000`
- Tente acessar `http://localhost:3000` no navegador
- Se usar celular físico, o backend precisa estar acessível na rede

### "Expo Go não conecta"

- Certifique-se de estar na mesma rede WiFi (celular e computador)
- Tente fechar e abrir o Expo Go novamente

## 📱 Testando em Emuladores

### Android Studio Emulator (Windows/Mac/Linux)

```powershell
npm run android
```

### iOS Simulator (apenas Mac)

```powershell
npm run ios
```

## 🎯 Próximos Passos

1. **Personalizar cores**: Edite `src/constants/theme.js`
2. **Adicionar logo**: Coloque sua logo em `assets/`
3. **Conectar banco de dados real**: Substitua os dados mock no backend
4. **Configurar autenticação JWT**: Implemente tokens JWT no backend
5. **Deploy do backend**: Hospede em Heroku, Railway, ou DigitalOcean

## 📚 Documentação Adicional

- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do React Native](https://reactnative.dev/)
- [Documentação do Express](https://expressjs.com/)

## 💡 Dicas

- Use `Ctrl + C` para parar os servidores
- Mantenha tanto frontend quanto backend rodando ao mesmo tempo
- O backend usa porta 3000 por padrão
- O Expo usa portas 19000-19001 por padrão

---

Pronto! Você agora tem o sistema Gracie Barra Attendance rodando! 🥋

Para mais informações, consulte o [README.md](README.md) principal.

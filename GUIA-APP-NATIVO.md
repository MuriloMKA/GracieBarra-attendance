# 📱 Guia Completo: Gerar Aplicativo Nativo (Android & iOS)

Seu projeto agora está configurado como um aplicativo nativo! Siga este guia para gerar o APK/IPA.

---

## 🤖 ANDROID - Gerar APK

### Pré-requisitos para Android

1. **Instalar Android Studio**: https://developer.android.com/studio
   - Durante a instalação, certifique-se de instalar:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (para emulador)

### Passos para Gerar o APK

#### 1️⃣ Abrir o Projeto no Android Studio

```powershell
# No PowerShell, na pasta do projeto:
npx cap open android
```

Isso abrirá o Android Studio com o projeto Android.

#### 2️⃣ Aguardar o Gradle Sync

- O Android Studio vai baixar dependências automaticamente
- Aguarde a mensagem "Gradle build finished" (pode demorar 5-10 minutos na primeira vez)

#### 3️⃣ Testar no Emulador (Opcional)

1. No Android Studio: `Tools` → `Device Manager`
2. Crie um dispositivo virtual (ex: Pixel 5)
3. Clique no botão ▶️ (Run) para testar

#### 4️⃣ Gerar APK de Desenvolvimento

**Opção A - Debug APK (sem assinatura):**

1. No Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Aguarde o build finalizar
3. Clique em "locate" quando aparecer a notificação
4. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

**Como instalar no celular:**

- Copie o arquivo APK para o celular
- Abra o arquivo no celular
- Permita "Instalar de fontes desconhecidas" se pedido
- Instale o app

#### 5️⃣ Gerar APK de Produção (Para publicar)

1. **Gerar Keystore (primeira vez):**

```powershell
# No PowerShell:
cd android
./gradlew assembleRelease

# OU criar keystore manualmente:
keytool -genkey -v -keystore gb-attendance.keystore -alias gb-app -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configurar assinatura:**

Crie o arquivo `android/key.properties`:

```properties
storePassword=SUA_SENHA_AQUI
keyPassword=SUA_SENHA_AQUI
keyAlias=gb-app
storeFile=../gb-attendance.keystore
```

3. **Editar `android/app/build.gradle`:**

Adicione antes de `android {`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dentro de `android { ... }`, adicione:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

4. **Gerar APK assinado:**

```powershell
cd android
./gradlew assembleRelease
```

APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🍎 iOS - Gerar IPA

### ⚠️ IMPORTANTE: iOS só pode ser compilado em um Mac

Se você não tem Mac, você pode:

- Usar um serviço de build na nuvem (Expo EAS, Codemagic, etc.)
- Pedir para alguém com Mac compilar
- Alugar um Mac na nuvem

### Pré-requisitos para iOS (se tiver Mac)

1. **macOS** (Catalina ou superior)
2. **Xcode** (versão 13+): https://apps.apple.com/app/xcode/id497799835
3. **Conta Apple Developer** ($99/ano): https://developer.apple.com
4. **CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

### Passos para Gerar o IPA (no Mac)

#### 1️⃣ Instalar Dependências

```bash
cd ios/App
pod install
```

#### 2️⃣ Abrir no Xcode

```bash
npx cap open ios
```

#### 3️⃣ Configurar Signing

1. No Xcode, selecione o projeto `App`
2. Vá em `Signing & Capabilities`
3. Selecione sua equipe (Team)
4. Mude o `Bundle Identifier` se necessário

#### 4️⃣ Testar no Simulador

1. Escolha um simulador (ex: iPhone 14)
2. Clique no botão ▶️ (Run)

#### 5️⃣ Gerar IPA para Produção

1. Selecione `Generic iOS Device` como destino
2. Menu: `Product` → `Archive`
3. Aguarde o build
4. Na janela de Archives, clique em `Distribute App`
5. Escolha o método de distribuição:
   - **App Store Connect**: Para publicar na App Store
   - **Ad Hoc**: Para instalar em dispositivos específicos
   - **Enterprise**: Se tiver conta Enterprise

---

## 🔄 Workflow de Desenvolvimento

### Quando Fazer Mudanças no Código

```powershell
# 1. Fazer mudanças no código React
# 2. Fazer novo build
npm run build

# 3. Sincronizar com as plataformas nativas
npx cap sync

# 4a. Para Android:
npx cap run android

# 4b. Para iOS (no Mac):
npx cap run ios
```

### Atalhos Úteis

```powershell
# Build + Sync + Abrir Android Studio
npm run build; npx cap sync; npx cap open android

# Apenas sincronizar sem fazer novo build
npx cap sync

# Ver logs do app em tempo real (Android)
npx cap run android -l

# Limpar cache do Android
cd android; ./gradlew clean; cd ..
```

---

## 📦 Publicar nas Lojas

### Google Play Store (Android)

1. Gere o APK assinado (veja acima)
2. Crie uma conta no [Google Play Console](https://play.google.com/console)
3. Crie um novo app
4. Preencha as informações (descrição, screenshots, etc.)
5. Faça upload do APK em "Production"
6. Submeta para revisão

**Custo:** $25 (taxa única)

### Apple App Store (iOS)

1. Crie uma conta [Apple Developer](https://developer.apple.com)
2. No Xcode, archive e distribua para App Store Connect
3. No [App Store Connect](https://appstoreconnect.apple.com):
   - Crie novo app
   - Preencha informações
   - Adicione screenshots
   - Submeta para revisão

**Custo:** $99/ano

---

## 🎨 Personalizar Ícone e Splash Screen

### Ícone do App

1. Crie um ícone 1024x1024px (PNG com fundo)
2. Use uma ferramenta como [Icon Kitchen](https://icon.kitchen) ou [App Icon Generator](https://www.appicon.co)
3. Substitua os ícones em:
   - **Android**: `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - **iOS**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Splash Screen

1. Crie uma imagem 2732x2732px (PNG)
2. Coloque em:
   - **Android**: `android/app/src/main/res/drawable/splash.png`
   - **iOS**: `ios/App/App/Assets.xcassets/Splash.imageset/`

**Ou use uma ferramenta automatizada:**

```powershell
npm install -g cordova-res
cordova-res android --skip-config --copy
cordova-res ios --skip-config --copy
```

---

## 🛠️ Troubleshooting

### Android Studio não encontra SDK

1. Abra Android Studio
2. `Tools` → `SDK Manager`
3. Instale pelo menos uma versão do Android SDK (recomendado: API 33+)

### Erro "JAVA_HOME not set"

1. Instale o JDK 11 ou 17
2. Configure JAVA_HOME:
   ```powershell
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "Machine")
   ```

### App não conecta com o backend

No arquivo `.env`, mude de `localhost` para o IP da sua máquina:

```
# Não funciona no celular:
API_URL=http://localhost:3001

# Funciona:
API_URL=http://192.168.1.100:3001
```

### Permissões no Android

Se precisar de permissões (câmera, localização, etc.), adicione em:
`android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

---

## 🚀 Próximos Passos

1. ✅ Instale o Android Studio
2. ✅ Abra o projeto com `npx cap open android`
3. ✅ Aguarde o Gradle sync finalizar
4. ✅ Teste no emulador ou no celular conectado via USB
5. ✅ Gere um APK de debug para testar
6. ✅ Personalize ícone e splash screen
7. ✅ Configure o backend para aceitar conexões da rede local
8. ✅ Gere APK de produção quando estiver pronto

---

## 📞 Precisa de Ajuda?

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Documentação Android](https://developer.android.com)
- [Documentação iOS](https://developer.apple.com/documentation/)

**Dica:** Para testar rápido no celular Android:

1. Ative o "Modo Desenvolvedor" no Android
2. Conecte via USB
3. Execute: `npx cap run android`

Boa sorte com seu app! 🥋💪

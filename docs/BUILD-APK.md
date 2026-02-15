# Gerar APK do HabitFlow

Há duas formas principais: **EAS Build** (na nuvem, mais simples) e **build local** (no seu PC).

---

## Opção 1: EAS Build (recomendado)

O [Expo Application Services (EAS)](https://expo.dev/eas) gera o APK na nuvem. Não precisa do Android Studio.

### 1. Instalar EAS CLI e fazer login

```bash
npm install -g eas-cli
eas login
```

(Crie uma conta em [expo.dev](https://expo.dev) se ainda não tiver.)

### 2. Configurar o projeto (uma vez)

```bash
eas build:configure
```

Isso cria o ficheiro `eas.json`. Para gerar **APK** (instalável direto), use o perfil `preview` já definido em `eas.json`.

### 3. Gerar o APK

```bash
eas build --platform android --profile preview
```

O build corre nos servidores da Expo. No final aparece um link para **descarregar o APK**. Instale no telemóvel ou partilhe o ficheiro.

### 4. Build em CI/CD (sem login interativo)

Para builds automatizados, use um **Access Token** do Expo:

1. Em [expo.dev](https://expo.dev) → **Account Settings** → **Access Tokens**, crie um token.
2. Defina a variável de ambiente: `EXPO_TOKEN=seu_token`
3. Execute: `npm run build:apk` ou `eas build --platform android --profile preview`

### 5. Variáveis de ambiente (Supabase)

Para o APK usar o seu Supabase, as variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` precisam estar definidas no build. No EAS:

- **Opção A:** Criar um ficheiro `.env` na raiz (já tem) e no `eas.json` usar `env` no perfil, ou
- **Opção B:** No [Expo Dashboard](https://expo.dev) → seu projeto → **Secrets** e adicionar as variáveis. O EAS injeta-as no build.

Para o EAS usar o seu `.env` local, no `eas.json` pode definir:

```json
"preview": {
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "valor ou deixar para Secrets",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "valor ou deixar para Secrets"
  }
}
```

Ou configure **EAS Secrets** no dashboard e não coloque credenciais no repositório.

---

## Opção 2: Build local (Android Studio)

Gera o APK no seu computador. Precisa do **Android Studio** e do **Android SDK** instalados.

### 1. Gerar a pasta nativa `android/`

```bash
npm run prebuild:android
# ou
npx expo prebuild --platform android
```

Isso cria a pasta `android/` com o projeto nativo.

**Alternativa via script (com `ANDROID_HOME` definido):**

```bash
npm run build:apk:local
```

O APK fica em `android/app/build/outputs/apk/release/app-release-unsigned.apk`.

### 2. Abrir no Android Studio

- Abra o Android Studio.
- **File → Open** e escolha a pasta `android/` do projeto.
- Espere o Gradle sync terminar.

### 3. Gerar o APK

- **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
- O APK fica em algo como:  
  `android/app/build/outputs/apk/debug/app-debug.apk`

Para um APK de **release** (assinado), use **Build → Generate Signed Bundle / APK** e siga o assistente (precisa de um keystore).

### 4. Variáveis de ambiente

O `.env` da raiz é usado quando roda `npx expo start`. No APK gerado por `prebuild`, as variáveis precisam estar disponíveis no momento do build. Pode definir no `app.json` em `expo.extra` ou usar um plugin de env. Para simplicidade, use EAS Build com Secrets para o APK final.

---

## Resumo rápido (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Descarregue o APK no link que aparecer e instale no Android.

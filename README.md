# HabitFlow

App de rastreamento de hábitos para iOS, Android e Web. Desenvolvido com **Expo (React Native)** e **Supabase** para sincronização na nuvem.

![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase)

---

## Funcionalidades

- **Hoje** — Lista de hábitos do dia, marcar conclusão, progresso e sequência (streak)
- **Calendário** — Navegação mensal, indicador de conclusão por dia, hábitos da data selecionada
- **Progresso** — Visões semanal, mensal e anual; gráficos, heatmap e resumo por hábito
- **Criar/editar hábitos** — Nome, cor, ícone, frequência (diário, dias úteis, fins de semana, personalizado)
- **Detalhe do hábito** — Streak, taxas de conclusão (7/30/365 dias), histórico
- **Tema** — Modo claro e escuro
- **Recuperação de senha** — "Esqueci a senha" no login → e-mail com link → definir nova senha (app ou web)
- **Sync** — Supabase (opcional); sem config, usa apenas AsyncStorage local

---

## Stack

| Camada        | Tecnologia |
|---------------|------------|
| App           | Expo 54, React 19, React Native, expo-router |
| Estado/Dados  | React Context + Supabase ou AsyncStorage |
| Backend       | Supabase (PostgreSQL + REST API) |
| UI            | React Native, Reanimated, Nunito, Ionicons |

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (cloud ou auto-hospedado) para sync na nuvem

---

## Instalação

```bash
git clone <url-do-repositorio>
cd habit-tracker
npm install
```

### Variáveis de ambiente

Copie o exemplo e preencha com as credenciais do seu projeto Supabase:

```bash
cp .env.example .env
```

Edite o `.env`:

- `EXPO_PUBLIC_SUPABASE_URL` — URL do projeto (ex.: `https://xxx.supabase.co`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Chave anon em **Settings → API** no Dashboard

Alternativamente, o app aceita `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.

**Sem estas variáveis**, o app funciona apenas com dados locais (AsyncStorage).

### Banco de dados (Supabase)

Execute a migração no **SQL Editor** do Supabase:

- Ficheiro: `supabase/migrations/20250212000000_habitflow_tables.sql`

Ou, com a connection string no `.env`:

```bash
npm run supabase:migrate
```

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o Expo (dev) |
| `npm run supabase:migrate` | Aplica a migração no Supabase (requer `SUPABASE_DB_URL`) |
| `npm run test-supabase` | Testa conexão e CRUD no Supabase |
| `npm run lint` | Executa o ESLint |
| `npm run lint:fix` | Corrige automaticamente o que for possível |
| `npm run build:web` | Exporta a app para web (pasta `dist/`) — para deploy na Vercel |
| `npm run build:apk` | Gera APK Android via EAS Build |

---

## Executar o projeto

```bash
npx expo start
```

- **Web:** `w` no terminal ou abra o URL indicado  
- **Android:** `a` ou escaneie o QR code  
- **iOS:** `i` (simulador) ou escaneie o QR code  

---

## Estrutura do projeto

```
habit-tracker/
├── app/                 # Rotas (expo-router)
│   ├── (auth)/          # Login, cadastro, esqueci a senha, nova senha
│   ├── (tabs)/          # Hoje, Calendário, Progresso
│   ├── habit-form.tsx    # Criar/editar hábito
│   └── habit-detail.tsx  # Detalhe e estatísticas
├── lib/
│   ├── habits-context.tsx  # Estado e lógica (Supabase ou AsyncStorage)
│   ├── supabase.ts         # Cliente Supabase
│   └── useTheme.ts
├── components/
├── constants/
├── supabase/
│   └── migrations/       # SQL das tabelas
├── scripts/
│   ├── test-supabase.js      # Teste de conexão
│   ├── run-supabase-migration.js
│   └── setup-expo-env.js
└── docs/                 # Documentação
```

---

## Documentação

- [Supabase — configuração e migração](docs/SUPABASE.md)
- [Supabase self-hosted — Auth e recuperação de senha](docs/supabase-selfhosted-auth-config.md)
- [Guia de desenvolvimento](docs/DESENVOLVIMENTO.md)
- [Gerar APK (Android)](docs/BUILD-APK.md)
- [Deploy Web na Vercel](docs/DEPLOY-VERCEL.md)

---

## Licença

Projeto privado.

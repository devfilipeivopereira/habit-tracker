# HabitFlow + Supabase

O app usa **Supabase** para persistir hábitos e conclusões quando as variáveis de ambiente estão configuradas. Caso contrário, usa apenas **AsyncStorage** (dados locais no dispositivo).

---

## 1. Variáveis de ambiente

Crie ou edite o `.env` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

- **EXPO_PUBLIC_SUPABASE_URL** — URL do projeto (Supabase cloud ou auto-hospedado).
- **EXPO_PUBLIC_SUPABASE_ANON_KEY** — Chave **anon** (pública) em **Settings → API** no Dashboard.

No Expo, variáveis que precisam estar disponíveis no cliente devem ter o prefixo `EXPO_PUBLIC_`.

Também são aceites (para compatibilidade com outros setups):

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 2. Criar as tabelas no Supabase

### Opção A — SQL Editor (recomendado)

1. Abra o **Supabase Dashboard** do seu projeto.
2. Vá a **SQL Editor** e crie uma nova query.
3. Copie todo o conteúdo de:
   - `supabase/migrations/20250212000000_habitflow_tables.sql`
4. Cole na query e execute (Run).

### Opção B — Script com connection string

Se tiver a **connection string** do Postgres (Settings → Database):

```env
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

Depois:

```bash
npm run supabase:migrate
```

### Tabelas criadas

| Tabela | Descrição |
|--------|-----------|
| `habits` | id, name, color, icon, frequency, custom_days, reminder, created_at |
| `habit_completions` | id, habit_id, date (unique por habit_id + date) |

**Autenticação (por usuário):** depois da migração inicial, execute a segunda migração para associar hábitos ao utilizador e ativar RLS por conta:

- Ficheiro: `supabase/migrations/20250212100000_habitflow_auth_user_id.sql`

Ela adiciona `user_id` em `habits`, remove as políticas “allow all” e cria políticas que filtram por `auth.uid()`. Cada utilizador só vê e edita os próprios hábitos e conclusões. O app usa **Supabase Auth** (cadastro com nome e e-mail, login com e-mail e senha) e exige login quando o Supabase está configurado.

---

## 3. Recuperação de senha

O fluxo "Esqueci a senha" usa o Supabase Auth:

1. Na tela de login, o utilizador clica em **Esqueci a senha** e informa o e-mail.
2. O Supabase envia um e-mail com um link (redirect para `myapp://reset-password` na app ou para o site na web).
3. Ao abrir o link, a app define a sessão a partir dos tokens na URL e mostra a tela **Nova senha**.
4. O utilizador define e confirma a nova senha; em seguida é redirecionado para a área logada.

**Supabase cloud:** em **Authentication → URL Configuration** adicione `myapp://reset-password` (e o domínio da web, se aplicável) em **Redirect URLs**.

**Supabase self-hosted (Docker):** as redirect URLs configuram-se por variáveis de ambiente no serviço `auth` (GoTrue). Ver [Supabase self-hosted — Auth e recuperação de senha](supabase-selfhosted-auth-config.md).

---

## 4. Testar a conexão

```bash
node scripts/test-supabase.js
```

O script:

- Lê o `.env`
- Conecta ao Supabase
- Faz SELECT em `habits`, INSERT de um hábito de teste, INSERT em `habit_completions`, SELECT e DELETE do hábito de teste

Se tudo estiver correto, verá: `Supabase: todos os testes passaram.`

---

## 5. Supabase auto-hospedado (Docker Swarm)

Se o Supabase estiver em Docker Swarm na VPS:

- Listar serviços: `docker service ls | grep supabase`
- Reiniciar o PostgREST (atualiza o schema cache):  
  `docker service update --force supabase_supabase_rest`

Depois de criar ou alterar tabelas, reiniciar o `rest` evita erros do tipo “table not found in schema cache”.

---

## 6. MCP (opcional)

Com o MCP do Supabase configurado no Cursor (ex.: `https://supabase.seudominio.com/mcp`), pode executar SQL e inspecionar tabelas a partir do IDE.

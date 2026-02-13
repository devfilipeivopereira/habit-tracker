# Configuração Auth (recuperação de senha) – Supabase self-hosted

Usa estes valores no projeto onde tens o Supabase em Docker (ex.: `https://supabase.filipeivopereira.com/`).

## Variáveis de ambiente

- **App (login):** https://habitos.encorajar.com.br  
- **Supabase:** https://supabase.filipeivopereira.com  

## 1. Ficheiro `.env` (na pasta do docker-compose do Supabase)

```env
# App onde o utilizador faz login
SITE_URL=https://habitos.encorajar.com.br

# URL pública do Supabase
SUPABASE_PUBLIC_URL=https://supabase.filipeivopereira.com
API_EXTERNAL_URL=https://supabase.filipeivopereira.com

# Redirects permitidos: site web + deep link da app (recuperação de senha)
GOTRUE_URI_ALLOW_LIST=https://habitos.encorajar.com.br,https://habitos.encorajar.com.br/**,myapp://reset-password
```

## 2. Serviço `auth` no `docker-compose.yml`

Se as variáveis não forem lidas do `.env` pelo serviço `auth`, define-as no próprio serviço. Procura o bloco do **auth** (GoTrue) e adiciona/ajusta o `environment`:

```yaml
services:
  auth:
    image: supabase/gotrue:v2.x.x   # usa a tag que já tens
    environment:
      GOTRUE_SITE_URL: https://habitos.encorajar.com.br
      GOTRUE_URI_ALLOW_LIST: "https://habitos.encorajar.com.br,https://habitos.encorajar.com.br/**,myapp://reset-password"
      # ... resto das variáveis que já tens (GOTRUE_JWT_SECRET, DB, etc.)
```

Ou, para puxar do `.env`:

```yaml
  auth:
    image: supabase/gotrue:v2.x.x
    environment:
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_URI_ALLOW_LIST: ${GOTRUE_URI_ALLOW_LIST}
      # ... outras vars (GOTRUE_JWT_SECRET, GOTRUE_DB_*, etc.)
```

## 3. Aplicar e verificar

```bash
docker compose down
docker compose up -d
docker compose logs auth
```

Se o GoTrue já usar `GOTRUE_SITE_URL` e `GOTRUE_URI_ALLOW_LIST` por convenção a partir do `.env`, basta teres o `.env` correto e reiniciar. Caso contrário, usa o bloco `environment` do `auth` como acima.

## 4. No habit-tracker (já configurado)

O `.env` da app deve ter:

```env
EXPO_PUBLIC_SUPABASE_URL=https://supabase.filipeivopereira.com
EXPO_PUBLIC_SUPABASE_ANON_KEY=<teu_anon_key>
```

O redirect para recuperação de senha na app móvel é `myapp://reset-password` (definido no código e permitido em `GOTRUE_URI_ALLOW_LIST`).

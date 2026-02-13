# CORS no Kong (Supabase self-hosted)

Quando a **app web** em `https://habitos.encorajar.com.br` chama a API do Supabase em `https://supabase.filipeivopereira.com`, o browser faz um pedido cross-origin. Se o Kong não devolver os cabeçalhos CORS corretos, aparece:

```text
Access to fetch at 'https://supabase.filipeivopereira.com/auth/v1/recover...' from origin 'https://habitos.encorajar.com.br' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

A solução é usar um `kong.yml` com o **plugin CORS** configurado para a origem da app e com uma **rota aberta** para `/auth/v1/recover` (para o preflight OPTIONS e o POST de “Esqueci a senha” funcionarem).

---

## Método recomendado: colar o ficheiro completo

Neste repositório existe um **kong.yml completo** já com CORS e a rota aberta para recuperação de senha. Usa esse ficheiro no servidor.

**Ficheiro no projeto:** `docs/kong.yml-full-with-cors`

O ficheiro inclui origens de desenvolvimento (`http://localhost:8081`, `http://localhost:3000`) para testar auth e recuperação de senha em localhost.

---

## Passos no servidor

### 1. Abrir o kong.yml no servidor

```bash
nano /root/supabase/docker/volumes/api/kong.yml
```

### 2. Substituir todo o conteúdo

- Apaga **tudo** o que está no ficheiro (Ctrl+K em cada linha ou selecionar tudo e apagar).
- Abre no teu PC o ficheiro **`docs/kong.yml-full-with-cors`** deste repositório.
- Copia **todo** o conteúdo (do início ao fim).
- Cola no `nano` no servidor.

### 3. Verificar nomes dos serviços (importante)

O ficheiro usa estes hosts para os serviços:

- `supabase_auth`
- `supabase_rest`
- `supabase_storage`
- `supabase_meta`
- `supabase_studio`
- `supabase_analytics`
- `supabase_functions`
- `supabase_realtime`

Se no teu **docker-compose** os serviços tiverem outros nomes (por exemplo só `auth`, `rest`, etc.), faz **Find & Replace** no ficheiro:

- `supabase_auth` → `auth` (e o mesmo para os outros, conforme o teu compose).

Assim evitas que o Kong não arranque por não resolver os hostnames.

### 4. Gravar e sair

- **Ctrl+O** → Enter (gravar).
- **Ctrl+X** (sair).

### 5. Reiniciar o Kong

Confirma o nome do serviço Kong:

```bash
docker service ls | grep kong
```

Reinicia (ajusta o nome se for diferente):

```bash
docker service update --force supabase_supabase_kong
```

Se usares **Docker Compose** (sem Swarm):

```bash
docker compose restart supabase_kong
```

---

## Se o Kong não arrancar (update falha)

Se aparecer algo como *“update paused due to failure or early termination”*:

1. **Reverter para a versão anterior** (para o Supabase voltar a responder):

   ```bash
   docker service update --rollback supabase_supabase_kong
   ```

2. **Ver o erro** nos logs:

   ```bash
   docker service logs supabase_supabase_kong --tail 100
   ```

   Procura mensagens de erro (YAML inválido, plugin, route, etc.). Se o erro for de **hostname** (serviço não encontrado), corrige no `kong.yml` os nomes dos serviços (passo 3 acima) e tenta de novo o update.

---

## Verificar

1. Abre **https://habitos.encorajar.com.br**.
2. Clica em **Esqueci a senha**, preenche o e-mail e envia.
3. Não deve aparecer o erro de CORS; o pedido a `/auth/v1/recover` deve concluir.

Para testar o preflight no servidor (opcional):

```bash
curl -i -X OPTIONS "https://supabase.filipeivopereira.com/auth/v1/recover" \
  -H "Origin: https://habitos.encorajar.com.br" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,apikey"
```

Na resposta deve aparecer `Access-Control-Allow-Origin: https://habitos.encorajar.com.br`.

---

## Resumo do que o ficheiro inclui

- **Consumers, ACLs, basicauth** (com variáveis `$SUPABASE_ANON_KEY`, `$DASHBOARD_USERNAME`, `$DASHBOARD_PASSWORD` que o Kong substitui pelo ambiente).
- **Rotas abertas** para auth: verify, callback, authorize e **recover** (para “Esqueci a senha”), todas com CORS para `https://habitos.encorajar.com.br`.
- **Rotas seguras** (auth, rest, graphql, realtime, storage, functions, dashboard) com CORS e key-auth onde aplicável.
- **Meta, MCP, Analytics** como no setup habitual.

Tudo o que precisas de colar no servidor está em **`docs/kong.yml-full-with-cors`**.

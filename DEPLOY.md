# Deploy - Vercel (Padrao)

## Objetivo
Publicar o sistema no Vercel com deploy automatico via GitHub, mantendo o site ativo.

## Pre-requisitos
- Repositorio no GitHub (branch `main`)
- Projeto criado no Vercel
- Variaveis de ambiente configuradas no Vercel

## Variaveis de Ambiente (Vercel)
Configure em `Project Settings -> Environment Variables`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_NAME` (opcional)
- `OPENAI_API_KEY` (se usar IA)
- `OPENAI_ASSISTANT_ID` (se usar IA)
- `GOOGLE_SPEECH_CREDENTIALS_JSON` (se usar Speech)
- `GOOGLE_SPEECH_LANGUAGE`
- `IMAP_HOST`, `IMAP_PORT`, `IMAP_SECURE`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_MAILBOX`, `IMAP_FETCH_COUNT`
- `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`, `GRAPH_USER`, `GRAPH_FETCH_COUNT`

Notas:
- Nunca comitar `.env.local`.
- Use `.env.example` como referencia.

## Deploy Inicial (Vercel)
1. Vercel -> New Project
2. Conectar o repo `RepensNetwork/PROJETOX`
3. Branch de producao: `main`
4. Framework: Next.js (auto)
5. Build Command: `npm run vercel-build`
6. Output: automatico
7. Deploy

## Deploy Automatico (GitHub -> Vercel)
Sempre que subir commit no `main`, o Vercel dispara um novo deploy.

### Comandos (PowerShell)
```powershell
git status
git add .
git commit -m "sua mensagem"
git push origin main
```

## Confirmar Integracao
No Vercel:
- Project -> Settings -> Git
- Repo: `RepensNetwork/PROJETOX`
- Production Branch: `main`

Se o Vercel nao estiver pegando o ultimo commit:
1. Settings -> Git -> Disconnect
2. Reconnect no repo correto
3. Production Branch: `main`
4. Deploy

## Dominio
1. Vercel -> Project -> Domains
2. Adicione o dominio
3. Aponte o DNS para a Vercel (A ou CNAME conforme indicado)
4. Defina o dominio como Primary

## Troubleshooting Padrao

### 404 NOT_FOUND no site
- Confirme se o dominio esta apontando para o projeto correto
- Veja se o ultimo deploy esta `Ready`
- Verifique se o commit do deploy e o mais recente

### Build falha por tipos (TypeScript)
- Instale os `@types` necessarios
- Exemplo:
  - `@types/mailparser`
  - `@types/html-to-text`

### Vercel usando commit antigo
- Refaça a integracao (Disconnect/Connect)
- Garanta que o branch e `main`


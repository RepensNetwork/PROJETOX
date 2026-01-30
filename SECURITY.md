# Segurança — Asa Brokers

Este documento descreve as medidas de segurança aplicadas ao projeto e boas práticas para mantê-lo protegido.

## O que já está configurado

### 1. Headers de segurança (Next.js + middleware)

- **X-Frame-Options: DENY** — Impede que o site seja embutido em iframes (proteção contra clickjacking).
- **X-Content-Type-Options: nosniff** — Evita que o navegador interprete respostas com MIME type incorreto (reduz risco de XSS).
- **Referrer-Policy: strict-origin-when-cross-origin** — Controla quanto do URL é enviado em requisições para outros sites.
- **Permissions-Policy** — Restringe uso de câmera, microfone (apenas `self` para o app), geolocalização e browsing-topics.
- **Strict-Transport-Security (HSTS)** — Em produção com HTTPS, o navegador passa a acessar apenas por HTTPS (configurado em `next.config.js`).
- **Content-Security-Policy (CSP)** — Define origens permitidas para scripts, estilos, conexões (inclui Supabase) e impede embedding por outros sites.

Os mesmos headers são aplicados no **middleware** em todas as respostas (incluindo redirects), garantindo que login, logout e redirecionamentos também estejam protegidos.

### 2. Autenticação e autorização

- Autenticação via **Supabase Auth** (sessão e cookies gerenciados pelo Supabase SSR).
- Middleware verifica usuário em todas as rotas; rotas não públicas redirecionam para `/login`.
- Controle de acesso por **permissões por tela** (`allowed_pages`) e **admin**; usuários inativos são deslogados.
- Opção de **vinculação de IP de sessão** (`STRICT_IP_SESSION`, `session_ip` em membros) para maior rigor.

### 3. Variáveis de ambiente

- Credenciais e chaves ficam em **variáveis de ambiente** (`.env`); o arquivo `.env` está no `.gitignore` e **não deve ser commitado**.
- Use `.env.example` como referência; nunca preencha senhas ou tokens reais no exemplo.

### 4. Build e dependências

- **React Strict Mode** ativo para ajudar a detectar problemas em desenvolvimento.
- Execute `npm run audit` periodicamente para verificar vulnerabilidades nas dependências (script sugerido abaixo).

## Boas práticas recomendadas

1. **HTTPS em produção** — Sempre servir o site por HTTPS; o HSTS reforça isso no navegador.
2. **Não commitar segredos** — Nada de `.env`, chaves de API ou senhas no repositório.
3. **Auditar dependências** — Rodar `npm audit` e corrigir vulnerabilidades críticas/altas.
4. **Atualizar Supabase** — Manter políticas RLS e funções do Supabase alinhadas ao que o app precisa; não expor dados sensíveis via anon key.
5. **Backup e recuperação** — Garantir backups do banco (Supabase oferece opções) e plano de recuperação.
6. **Rate limiting (opcional)** — Para maior proteção em login/APIs, considere rate limiting (ex.: [Upstash Rate Limit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)) em rotas sensíveis.

## Script de auditoria

Foi adicionado o script `audit` no `package.json` para facilitar a checagem de dependências:

```bash
npm run audit
```

Recomenda-se rodar após instalar ou atualizar pacotes e antes de deploys importantes.

## Contato

Em caso de descoberta de vulnerabilidade, trate-a de forma confidencial e siga os procedimentos internos da organização antes de divulgação pública.

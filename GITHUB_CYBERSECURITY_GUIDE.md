# Guia de Cibersegurança e Proteção de Dados para GitHub — TARIRA Ecosystem

Este guia detalha todas as configurações e boas práticas de **Cibersegurança em Repositórios GitHub (Públicos ou Privados)** para proteger o ecossistema TARIRA contra invasões, vazamento de credenciais, injeções maliciosas e ataques ao código.

---

## 🛡️ 1. Proteção de Repositório Público no GitHub

Ao hospedar o projeto no GitHub:

### A. Regras Automáticas no `.gitignore`
O ficheiro `.gitignore` já está configurado no projeto para bloquear automaticamente o commit de:
- Ficheiros `.env`, `.env.local`, `.env.production` (variáveis de ambiente reais com senhas/chaves).
- Chaves criptográficas privadas (`*.pem`, `*.key`, `id_rsa`, `*.keystore`).
- Dumps de banco de dados (`*.sqlite`, `*.db`, `*.sql.gz`, `*.dump`).
- Tokens de acesso pessoal (PATs) e credenciais de contas de serviço.

### B. Gestão Segura de Segredos com GitHub Actions & Secrets
Se utilizar **GitHub Actions** (CI/CD) ou implantação automática (Vercel, Render, Railway, AWS, DigitalOcean):
1. Aceda ao seu repositório no GitHub.
2. Clique em **Settings** > **Secrets and variables** > **Actions**.
3. Adicione os seus segredos em **Repository secrets**:
   - `GEMINI_API_KEY`: A sua chave da API do Google Gemini.
   - `SUPABASE_URL`: O endpoint HTTPS do seu projeto Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: A chave Service Role mestra (acessível **apenas** no backend Node).
   - `ADMIN_PASSWORD`: A senha de acesso administrativo à plataforma.
   - `VITE_SUPABASE_URL`: O URL do Supabase para o cliente frontend.
   - `VITE_SUPABASE_ANON_KEY`: A chave anónima pública do Supabase.

---

## 🔒 2. Recursos Nativos de Segurança do GitHub (Ativação Recomendada)

No seu repositório GitHub, recomendamos ativar os recursos gratuitos de proteção:

1. **GitHub Secret Scanning & Push Protection**:
   - Vá a **Settings** > **Code security and analysis**.
   - Ative **Secret scanning** e **Push protection**.
   - *Efeito*: O GitHub bloqueará instantaneamente qualquer commit que tente enviar chaves de API conhecidas por engano.

2. **Dependabot Security Alerts & Updates**:
   - Ative **Dependabot alerts** e **Dependabot security updates**.
   - *Efeito*: O GitHub avisa e gera correções automáticas caso alguma dependência do `package.json` venha a ter vulnerabilidades conhecidas.

3. **CodeQL Code Scanning**:
   - Vá a **Security** > **Code scanning** e configure a análise automática com CodeQL.
   - *Efeito*: Faz a varredura contínua do código TypeScript/JavaScript contra falhas de injeção, XSS e poluição de protótipo.

---

## 🌐 3. Proteção nos Navegadores dos Utilizadores

Independentemente do browser utilizado (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge, Opera, navegadores móveis):

1. **Content-Security-Policy (CSP)**:
   - Restringe origens de carregamento de scripts, fontes, estilos e conexões apenas aos serviços aprovados (Google Maps, Supabase, Google Fonts).
   - Bloqueia scripts maliciosos injetados por extensões de navegador ou ataques XSS.

2. **Prevenção de MIME-Sniffing (`X-Content-Type-Options: nosniff`)**:
   - Força o navegador a respeitar os tipos de conteúdo legítimos, impedindo que ficheiros de upload sejam executados como código.

3. **Anti-Clickjacking (`X-Frame-Options` & CSP `frame-ancestors`)**:
   - Impede que hackers incorporem o portal TARIRA dentro de páginas falsas para roubar cliques ou credenciais.

4. **Sanitização Recursiva de Dados**:
   - Todos os dados enviados através de formulários ou chamadas de API são higienizados no servidor contra tags `<script>`, pseudo-protocolos `javascript:` e caracteres nulos antes de qualquer persistência.

5. **Proteção Contra Força Bruta (Rate Limiting)**:
   - Limitação inteligente de requisições por IP com bloqueio de segurança em caso de tentativas automatizadas de adivinhação de senhas.

---

## 🚀 4. Como Enviar o Projeto para o GitHub com Segurança

Ao fazer o primeiro envio (*push*) para o GitHub:

```bash
# 1. Inicializar o repositório se ainda não o tiver feito
git init

# 2. Verificar se o .gitignore está ativo e quais ficheiros serão incluídos
git status

# 3. Adicionar os ficheiros e confirmar (os segredos .env serão ignorados automaticamente)
git add .
git commit -m "feat: initial commit with enterprise cybersecurity shield"

# 4. Conectar ao repositório GitHub e enviar
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

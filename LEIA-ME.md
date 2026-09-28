# MONI Weather vC13 — relatos compartilhados (GitHub Pages + Supabase)

## Passo a passo
1. Crie um projeto grátis em supabase.com.
2. Abra `supabase.sql`, troque `troque-este-sal` (2 vezes) por um texto seu, cole em **SQL Editor** e clique **Run**.
3. Em **Settings → API**, copie a *Project URL* e a chave *anon/publishable* para o `config.js`.
4. Suba **o conteúdo desta pasta** na raiz do repositório (index.html, app.js, style.css, config.js). Em **Settings → Pages**, escolha *Deploy from a branch* → `main` → `/ (root)`.
5. Teste em dois aparelhos: envie um relato em um; ele aparece no outro em até ~1 min.

## Segurança
- A chave anon é pública por design. Quem protege os dados são as regras do `supabase.sql`: o público só lê e cria (só tipo, posição e nota), não edita nem apaga, e não consegue forjar votos ou data.
- Nunca use a chave `service_role` no site.
- Limite: 10 relatos / 10 min por IP e 1 voto por IP por relato. Em redes móveis com IP compartilhado (CGNAT) isso pode atingir usuários legítimos; ajuste o número no SQL.
- Moderação: remova relatos falsos em **Table Editor → reports**. O app já esconde relatos com 3 votos de "não está mais".
- Privacidade: relatos de necessidade, perigo e serviço são arredondados (~110 m); abrigos e pontos de ajuda ficam com ~11 m.

## Manutenção
- Limpeza opcional de relatos antigos: `delete from reports where ts < now() - interval '3 days';`
- No plano gratuito, projetos sem atividade por cerca de uma semana podem ser pausados: confira antes de uma temporada de risco.

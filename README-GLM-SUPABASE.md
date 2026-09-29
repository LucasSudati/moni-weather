# MONI Weather — GLM online (GitHub Pages + Supabase)

Esta versão não usa Python, `.bat` nem servidor local.

## Publicar a função pelo Dashboard do Supabase

1. Abra **Supabase → Edge Functions**.
2. Crie uma função chamada **`glm`**.
3. Cole o conteúdo de `supabase/functions/glm/index.ts`.
4. Desative a verificação de JWT para esta função pública de leitura (`verify_jwt = false`).
5. Faça o deploy.
6. Abra no navegador:
   `https://SEU-PROJETO.supabase.co/functions/v1/glm?south=-34&west=-58&north=-27&east=-49&minutes=15`
7. Se aparecer JSON com `source_ok:true`, faça push do frontend no GitHub Pages.

O `config.js` monta automaticamente a URL da função usando `supabaseUrl`.

## Git / CLI (opcional)

O repositório já inclui `supabase/config.toml` com `verify_jwt = false`. Se no futuro você usar deploy por GitHub Actions/CLI, a configuração já está pronta.

## Observação

O GLM mede atividade elétrica total observada pelo satélite. Os pontos não devem ser interpretados como localização exata de descargas nuvem-solo.

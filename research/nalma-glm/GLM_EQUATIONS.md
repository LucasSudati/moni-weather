# GLM — equações para análise (versão de estudo 0.1)

O GOES-19 GLM mede radiância óptica associada a descargas (banda próxima de 777,4 nm), não campos eletromagnéticos diretamente. O produto organiza **eventos**, **grupos** e **flashes**; não são conceitos intercambiáveis.

## Variáveis por flash
- t0, t1: início e fim em UTC; duração T = t1 - t0 (s).
- E: energia óptica do flash (J), **quando presente no produto escolhido**. Não interpretar como energia elétrica total.
- A: área óptica informada pelo produto (km²); documentar se é área do flash, grupo ou evento.
- Ne: quantidade de eventos ópticos no flash; Ng: quantidade de grupos.
- φ, λ: latitude e longitude do centro reportado; centro não equivale ao ponto de impacto no solo.

## Equações propostas
1. Duração: T = t1 - t0.
2. Taxa por célula e janela: F = N_flashes / Δt, em flashes/min (Δt em minutos).
3. Densidade espacial: D = N_flashes / (S × Δt), em flashes/(km²·min); S é a área analisada, não a área de cada flash.
4. Energia por duração: Q = E / T (W), apenas como indicador derivado de energia óptica, não potência elétrica; para T=0 registrar indefinido.
5. Energia por área: U = E / A (J/km²), se A>0.
6. Variação da taxa (lightning jump exploratório): J = (F_atual - F_base) / max(F_base, ε). ε evita divisão por zero e deve ser declarado.
7. Associação espacial NALMA–GLM: distância geodésica Haversine; temporal: distância entre intervalos UTC. Limites iniciais do protótipo: 25 km e 1 s, **não calibrados**.

## Classificação
x = [T, E, A, Ne, Ng, F, D, J, ...variáveis ambientais].
P(k|x) = exp(b_k + w_k·x) / Σ_c exp(b_c + w_c·x).
Classes operacionais: CG provável, não-CG provável, indeterminado. Sem rótulos independentes e validação regional, probabilidades não são confiáveis para alegar contato com solo.

## Cuidados
Energia, área e tempos devem ser extraídos do produto/versão efetivamente utilizado, com unidades e flags de qualidade. Verificar disponibilidade de campos de flash vs grupo vs evento antes de implementar; não somar áreas sobrepostas como se fossem disjuntas. Controlar geometria de observação ao comparar Alabama e RS.

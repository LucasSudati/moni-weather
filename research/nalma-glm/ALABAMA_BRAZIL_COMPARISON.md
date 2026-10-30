# Experimento 02 — Alabama × Rio Grande do Sul

## Hipótese
Tempestades convectivas comparáveis no Alabama e no Rio Grande do Sul podem compartilhar distribuições de características ópticas de flashes observados pelo mesmo GOES-19 GLM. Hipótese ainda não testada.

## Seleção
- Alabama: tempestades dentro da cobertura NALMA com dados simultâneos GOES-19 GLM, após início da operação GOES-19 como GOES-East em 2025.
- Rio Grande do Sul: tempestades observadas pelo GOES-19 GLM, em períodos meteorológicos comparáveis.
- Meta inicial: pelo menos três tempestades independentes por região, sujeita à disponibilidade.
- Registrar datas UTC, duração, área geográfica, fase da tempestade, fontes e qualidade de cobertura.

## Características
- GLM: duração, energia óptica, área, eventos/grupos por flash, taxa de flashes em janelas de 1 e 5 minutos.
- Meteorologia: refletividade radar, temperatura de topo de nuvem, CAPE quando disponível, fase convectiva e horário local.
- Instrumentação: geometria de visada, distância ao nadir, cobertura, qualidade e diferenças de detecção.
- NALMA: altitude, extensão e sequência VHF nos casos do Alabama; ausência de NALMA no Brasil não equivale à ausência de descarga.

## Análise
1. Obter arquivos originais GLM de ambos os locais e NALMA do Alabama, documentando origem, versões e checksums.
2. Normalizar horários, unidades, filtros de qualidade e área/tempo de observação.
3. Parear tempestades por características meteorológicas, não pelo resultado desejado.
4. Comparar distribuições GLM por mediana, IQR, teste KS e distância Wasserstein, com intervalos de confiança reamostrados por tempestade.
5. Treinar classificação de contato com solo somente com rótulos independentes; validar em tempestades não vistas do Alabama e depois no Brasil se houver rótulos brasileiros independentes.
6. Reportar erros, viés regional e limitações. Não interpretar semelhança óptica como prova de mesma classe elétrica.

## Estado
Plano experimental registrado. Nenhuma tempestade foi selecionada, baixada ou comparada ainda. A branch main e a operação atual do MONI Weather permanecem intactas.

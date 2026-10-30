# Plano de ingestão NALMA para classificação experimental GLM

## Objetivo
Usar a NALMA para obter características de propagação VHF e associá-las a flashes ópticos GLM, sem confundir evento óptico com impacto no solo. Classes-alvo: intranuvem, entre nuvens, nuvem-solo e indeterminado; somente usar rótulos confirmados por fontes independentes para treinar e validar.

## Fonte e formato
NASA GHRC NALMA V1: https://doi.org/10.5067/NALMA/DATA101 (confirmar identificador exato da coleção antes do download).
Catálogo: https://data.nasa.gov/dataset/north-alabama-lightning-mapping-array-lma-v1
Guia: https://ghrc.nsstc.nasa.gov/pub/lma/nalmaraw/doc/nalma_dataset.pdf

Priorizar **NALMA processada, full-rate**, não arquivos brutos por estação. Os arquivos são ASCII compactados em gzip e incluem cabeçalho de configuração/tempo e fontes VHF. NRT é decimada e deve ser tratada separadamente. Não presumir que cada fonte VHF representa uma descarga.

## Pipeline proposto
1. Selecionar uma janela histórica com cobertura NALMA + GOES-19 GLM.
2. Baixar amostra NALMA processada; registrar URL, data, checksum e versão.
3. Ler cabeçalho, validar colunas e unidades; manter dados originais.
4. Normalizar horário UTC, latitude, longitude, altitude, potência e qualidade.
5. Filtrar fontes por qualidade; agrupar fontes em trajetórias/descargas usando critérios versionados.
6. Parear agrupamentos NALMA com flashes GLM com incertezas temporais e espaciais.
7. Extrair distribuição de altitudes, extensão vertical/horizontal, duração, sequência VHF, energia óptica, área e contagem de eventos/grupos.
8. Obter rótulos nuvem-solo independentes, dividir treino e teste por tempestade, avaliar falsos positivos e calibrar probabilidades.

## Restrições
- A NALMA e o GLM medem modalidades diferentes, e nenhum sozinho prova impacto no solo.
- A classificação intranuvem/entre nuvens pode ser ambígua; usar indeterminado quando necessário.
- O modelo treinado no Alabama não deve ser aplicado ao Brasil sem validação de transferência.
- Manter a branch main e o GLM operacional intactos.
- Os testes atuais usam apenas dados sintéticos. Nenhum download ou teste científico real foi concluído.

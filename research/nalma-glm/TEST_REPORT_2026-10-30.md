# Relatório de execução — Lição 1 NALMA × GOES-19 GLM

**Data:** 30/10/2026  
**Branch:** `feature/nalma-glm-correlation`  
**Ambiente de execução:** Node.js v22.16.0, Linux  
**Estado:** testes de software concluídos; aquisição e correlação científica real pendentes.

## 1. Execução de testes

Comando executado a partir da raiz de uma cópia de trabalho dos arquivos da branch:

```bash
node --experimental-default-type=module --test research/nalma-glm/tests/*.test.js
```

| Etapa | Testes | Aprovados | Falhas | Tipo de dados |
|---|---:|---:|---:|---|
| Suíte original `correlate.test.js`, sem modificações | 6 | 6 | 0 | Sintéticos |
| Suíte ampliada após validação e parser | 17 | 17 | 0 | Sintéticos |

Os seis testes originais cobriram distância zero, sobreposição, rejeição espacial/temporal, pareamento muitos-para-muitos e intervalo inválido. Os três testes adicionais de correlação verificaram rejeição de coordenadas ausentes, latitude fora da faixa e limites `NaN`. O código foi ajustado para rejeitar essas entradas em vez de produzir associação com pontuação `NaN`.

Os oito testes novos cobriram: sete campos documentados da NALMA, descompressão gzip, arquivo sem eventos, contagem divergente, latitude inválida, linha incompleta, data impossível e integração sintética de fontes VHF agregadas manualmente com flash GLM fictício. O teste de integração encontrou **um pareamento artificial**, com `time_overlap_ms=100`, distância inferior a 1 km e classificação `unknown`. **Esse número não é uma observação meteorológica.**

Foi executado também o script `inspect-nalma.js` sobre arquivo gzip **gerado artificialmente** com duas fontes VHF. O script calculou SHA-256, contagem de fontes, intervalos UTC, latitude, longitude e altitude; não realizou classificação.

## 2. Verificação de formato oficial

A documentação da NASA GHRC foi consultada:

- [Guia NASA NALMA](https://ghrc.nsstc.nasa.gov/pub/lma/nalmaraw/doc/nalma_dataset.pdf): arquivo processado `NALMA_YYMMDD_hhmmss_####.dat.gz`, cabeçalho, marcador `*** data ***` e sete campos de fonte na Tabela 6: `time` (segundos UTC do dia), `lat`, `lon`, `alt` (m), `reduced chi2`, `P` (dBW), `mask` (hexadecimal).
- [NASA NALMA V1](https://doi.org/10.5067/NALMA/DATA101): coleção processada full-rate; diferente da NRT decimada e dos dados brutos por estação.
- [NOAA GLM L2](https://vlab.noaa.gov/web/geostationary-lightning-mapper/products): eventos, grupos e flashes são níveis distintos; GLM não confirma CG.
- [NOAA GOES-19](https://www.ospo.noaa.gov/data/messages/2025/04/MSG_20250407_1510.html): GOES-19 entrou em operação como GOES-East em **07/04/2025 às 15:10 UTC**.

O parser implementado usa esse esquema **documentado**, mas ainda não foi testado contra arquivos reais. A data UTC vem do nome do arquivo e o tempo da fonte é interpretado como segundos do dia; o campo original de segundos é preservado, pois `Date`/ISO arredonda para milissegundos.

## 3. Tentativa de obter amostra real

Foram localizados o catálogo NASA, o DOI e o acesso à coleção via [Earthdata Search](https://search.earthdata.nasa.gov/search/granules?p=C2683433889-GHRC_DAAC). Tentativas de acesso direto aos diretórios GHRC e de baixar o guia no ambiente de execução falharam por indisponibilidade de conexão/resolução de nomes. A interface web do catálogo Earthdata exige JavaScript e não expôs um granule acessível para download nesse ambiente. **Nenhum arquivo NALMA real foi obtido.**

O produto GLM L2-LCFA está catalogado pela NOAA e disponível em arquivos NetCDF, mas **nenhum arquivo GLM real foi baixado**. Portanto, não existe janela temporal real conjunta validada nem correlação física calculada.

## 4. Limitações técnicas e científicas

- O correlacionador atual recebe **clusters NALMA e flashes GLM já normalizados**; não constrói clusters automaticamente nem interpreta NetCDF GLM.
- O pareamento usa centros geográficos e janelas UTC, permitindo relações muitos-para-muitos. Isso **não comprova** que duas observações sejam a mesma descarga.
- Os limites de **25 km** e **1.000 ms** e a pontuação são heurísticos, **não calibrados**.
- A conversão para `time_utc` em ISO perde precisão abaixo de 1 ms; análises de propagação VHF devem utilizar `time_seconds_of_day` original ou representação temporal de maior precisão.
- O parser e a CLI carregam o arquivo inteiro em memória; avaliar processamento em streaming para granules grandes.
- Ausência de fontes NALMA não invalida flash GLM. Sem rede independente de rótulos CG, não há validação de contato com o solo.
- **Não há amostra de tempestade, estatística de associação real, classificação validada ou resultado Alabama × Rio Grande do Sul.**

## 5. Próximas ações objetivas

1. Obter um granule NALMA **processado full-rate** de data posterior a 07/04/2025, preferencialmente com tempestade documentada sobre o norte do Alabama; preservar URL, nome, checksum SHA-256 e horário UTC.
2. Executar `inspect-nalma.js` no `.dat.gz` real; ajustar parser conforme o cabeçalho efetivo, sem descartar dados originais.
3. Obter arquivos **GOES-19 GLM-L2-LCFA** NetCDF do mesmo intervalo UTC na [NOAA/NCEI](https://www.ncei.noaa.gov/products/goes-terrestrial-weather-abi-glm); implementar extração de `flash_id`, tempo de primeiro/último evento, latitude, longitude, área, energia e flags de qualidade.
4. Construir agrupamento de fontes VHF em flashes, com critérios e incertezas explícitos; revisar associações múltiplas e calibrar limiares com tempestades rotuladas.
5. Selecionar pelo menos três tempestades no Alabama e três no Rio Grande do Sul, controlando fase convectiva e geometria GLM. Só estimar desempenho CG com verdade-terreno independente.

**Integridade:** alterações realizadas exclusivamente na branch `feature/nalma-glm-correlation`; `main` não foi modificada nesta execução.

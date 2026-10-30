# NALMA — formato de dados confirmado na documentação NASA

**Estado em 30/10/2026:** estrutura conferida no [guia NASA GHRC NALMA](https://ghrc.nsstc.nasa.gov/pub/lma/nalmaraw/doc/nalma_dataset.pdf), especialmente as Tabelas 2, 3 e 6. **Ainda não foi baixado nem validado um arquivo de observações real.**

## Coleções distintas

- **NALMA V1 full-rate processada:** DOI [10.5067/NALMA/DATA101](https://doi.org/10.5067/NALMA/DATA101). Esta é a coleção prioritária.
- **NALMA NRT:** DOI [10.5067/NALMA/DATA201](https://doi.org/10.5067/NALMA/DATA201). Dados processados com decimação.
- **NALMA Raw Data:** DOI [10.5067/NALMA/DATA301](https://doi.org/10.5067/NALMA/DATA301). Dados brutos por estação, outro formato; o parser deste projeto **não** os aceita.

O padrão documentado dos arquivos processados é `NALMA_YYMMDD_hhmmss_####.dat.gz`, onde `####` indica segundos analisados. O conteúdo é texto ASCII comprimido com gzip. O cabeçalho contém tempo de referência, estações, configuração e informações de formato. A linha `*** data ***` separa cabeçalho de registros.

## Campos de cada fonte VHF — Tabela 6 do guia

| Posição | Campo do guia | Unidade | Interpretação |
|---|---|---|---|
| 1 | `time` | segundos UTC do dia | Instante da fonte, não tempo relativo ao primeiro flash |
| 2 | `lat` | graus norte | Latitude |
| 3 | `lon` | graus leste | Longitude; valores negativos a oeste |
| 4 | `alt` | m | Altitude |
| 5 | `reduced chi2` | adimensional | Qui-quadrado reduzido da localização |
| 6 | `P` | dBW | Potência VHF informada no produto |
| 7 | `mask` | hexadecimal | Máscara das estações que observaram a fonte |

A máscara permite derivar o número de bits ativos, mas esse valor não substitui a avaliação geométrica/qualitativa das estações. Uma fonte VHF **não** é uma descarga completa.

## Parser experimental

- [`processors/parse-nalma.js`](processors/parse-nalma.js): `parseNalmaAscii(text, {filename})` e `parseNalmaGzip(buffer, {filename})`.
- [`scripts/inspect-nalma.js`](scripts/inspect-nalma.js): resumo de arquivo local e checksum SHA-256.
- [`tests/parse-nalma.test.js`](tests/parse-nalma.test.js): testes sintéticos de formato, gzip, validação e integração ilustrativa com GLM.

No diretório raiz do repositório:

```bash
node --experimental-default-type=module research/nalma-glm/scripts/inspect-nalma.js /caminho/NALMA_250501_120000_3600.dat.gz
node --experimental-default-type=module --test research/nalma-glm/tests/*.test.js
```

O parser guarda `time_seconds_of_day` como número original e também `time_utc` ISO arredondado a milissegundos; **não** usar a versão arredondada para estudos de propagação VHF com precisão de microssegundos. Não foi testado contra arquivo NALMA real; os exemplos de teste são artificiais.

## Equações dos agrupamentos de fontes

Para `N` fontes com altitude `z_i`:

$$
\bar{z}=\frac{1}{N}\sum_{i=1}^{N}z_i
$$

$$
\Delta z=\max_i(z_i)-\min_i(z_i)
$$

$$
\Delta t=\max_i(t_i)-\min_i(t_i)
$$

$$
p_{\mathrm{baixo}}=\frac{1}{N}\sum_{i=1}^{N}\mathbf{1}(z_i<h_0)
$$

O limiar `h_0` precisa de calibração. Nem `p_baixo` nem a ausência de fontes VHF próximas ao solo confirmam ou excluem descarga nuvem-solo.

## Fonte e acesso

- [Catálogo NASA NALMA](https://data.nasa.gov/dataset/north-alabama-lightning-mapping-array-lma-v1).
- [Earthdata Search — coleção](https://search.earthdata.nasa.gov/search/granules?p=C2683433889-GHRC_DAAC).
- [Guia NASA GHRC](https://ghrc.nsstc.nasa.gov/pub/lma/nalmaraw/doc/nalma_dataset.pdf).

A data de início difere entre versões de metadados do catálogo e do guia; para o experimento GOES-19 usar amostras posteriores a 7 de abril de 2025 e confirmar cobertura de cada granule.

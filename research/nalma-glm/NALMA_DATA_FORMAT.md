# NALMA — formato dos dados e normalização (versão de estudo 0.1)

Fonte planejada: NASA GHRC NALMA V1, arquivos **processados full-rate**, geralmente ASCII compactado gzip (.gz). Referência de formato: https://ghrc.nsstc.nasa.gov/pub/lma/nalmaraw/doc/nalma_dataset.pdf . O layout exato de colunas deve ser confirmado pelo cabeçalho do arquivo real. **Ainda não foi obtida uma amostra real.**

## Estrutura esperada
1. Cabeçalho: estação/rede, instante de referência, configuração, informações de processamento e descrição das colunas.
2. Registros de fontes VHF localizadas, uma fonte por linha.
3. Metadados de qualidade, quando disponíveis.

## Campos a identificar no cabeçalho real
- tempo relativo à referência e/ou UTC;
- latitude e longitude (graus);
- altitude (metros);
- potência da fonte (unidade definida pelo produto);
- métrica de qualidade da localização (por exemplo chi-quadrado, quando disponível);
- número de estações participantes e/ou máscaras de estações, se fornecidos.

A ordem, os nomes e as unidades **não devem ser presumidos**. Uma fonte VHF não é um flash completo nem um raio nuvem-solo confirmado.

## Registro normalizado proposto (NÃO é linha original NALMA)
```json
{
  "source_id": "exemplo",
  "time_utc": "2026-01-01T12:00:00.000Z",
  "latitude": null,
  "longitude": null,
  "altitude_m": null,
  "power_raw": null,
  "quality_chi2": null,
  "station_count": null,
  "source_file": "arquivo-original.gz"
}
```
Valores null são campos a preencher após inspeção real, não observações.

## Equações para um agrupamento de N fontes
- altitude média: z̄ = Σz_i / N.
- extensão vertical: Δz = max(z_i) - min(z_i).
- duração: Δt = max(t_i) - min(t_i).
- fração de fontes baixas: p_baixa = #{z_i < h0} / N; h0 depende de calibração e da cobertura da rede.
- extensão horizontal: maior distância geodésica entre fontes (km), com tratamento de custo computacional para N elevado.
- propagação vertical aproximada: inclinação de regressão z(t), sensível a ruído e à ordem de detecção.

## Procedimento de leitura
1. Preservar .gz e checksum SHA-256.
2. Ler cabeçalho, identificar colunas, unidades, instante-base e qualidade.
3. Converter tempo para UTC e altitude para metros; validar latitude/longitude.
4. Filtrar qualidade com limites documentados, não arbitrários.
5. Agrupar fontes em descargas e associar ao GLM por tempo e espaço.
6. Usar rótulos independentes de CG; ausência de VHF em baixa altitude não prova ausência de CG.

A rede NALMA é regional; no RS usaremos GLM e, quando possível, dados independentes brasileiros para validação.

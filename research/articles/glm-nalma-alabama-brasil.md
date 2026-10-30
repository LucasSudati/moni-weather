# Correlação entre observações ópticas do GOES-19 GLM e fontes VHF da NALMA: proposta de análise comparativa entre Alabama e Rio Grande do Sul

**MONI Weather — artigo técnico exploratório, 30 de outubro de 2026**

## Resumo
Propõe-se investigar a correspondência entre flashes ópticos observados pelo Geostationary Lightning Mapper (GLM) a bordo do GOES-19 e fontes de radiofrequência VHF localizadas pela North Alabama Lightning Mapping Array (NALMA). A pesquisa busca caracterizar distribuições de duração, energia e área óptica e relacioná-las à estrutura espacial e temporal da propagação elétrica, com posterior comparação de tempestades do Alabama e do Rio Grande do Sul. O GLM não mede diretamente campos elétricos ou radiofrequência; a NALMA detecta emissões VHF. Nenhum dos instrumentos, isoladamente, estabelece contato com o solo. Apresentam-se hipóteses, variáveis, equações e um protocolo de validação. **Não são apresentados resultados experimentais, pois dados reais ainda não foram processados.**

**Palavras-chave:** GLM; NALMA; GOES-19; raios; descargas atmosféricas; sensoriamento remoto; aprendizado de máquina.

## 1. Introdução
A atividade elétrica de tempestades pode ser observada por sensores de modalidades distintas. O GLM registra pulsos luminosos associados a descargas atmosféricas, na região espectral próxima a 777,4 nm. Redes LMA, como a NALMA, localizam fontes de emissão VHF geradas durante a propagação das descargas. A associação espaço-temporal dessas observações pode permitir estudos sobre a morfologia elétrica das tempestades. A motivação aplicada é melhorar a interpretação da camada de descargas do MONI Weather sem confundir detecção óptica com impacto confirmado no solo.

## 2. Objetivos e hipótese
Objetivo geral: avaliar a existência de padrões ópticos comparáveis em tempestades convectivas do Alabama e do Rio Grande do Sul e sua relação com assinaturas VHF medidas no Alabama.

Objetivos específicos: (i) normalizar arquivos GLM e NALMA; (ii) associar flashes e agrupamentos VHF; (iii) extrair descritores físicos e estatísticos; (iv) comparar tempestades meteorologicamente semelhantes nas duas regiões; (v) investigar classificação de descargas nuvem-solo (CG) com rótulos independentes.

Hipótese: tempestades de características meteorológicas semelhantes podem apresentar distribuições semelhantes de propriedades ópticas, mesmo em regiões distintas. Semelhança estatística não implica igualdade dos mecanismos físicos nem capacidade automática de identificar CG.

## 3. Dados e instrumentos
O GLM produz observações organizadas em eventos, grupos e flashes. Para cada flash, pretende-se obter início, fim, posição, energia e área, conforme os campos efetivamente disponíveis na versão do produto. A energia GLM é óptica, não a energia elétrica total.

A NALMA disponibiliza dados processados de fontes VHF, tipicamente em ASCII comprimido com gzip. O cabeçalho do arquivo real determinará a ordem e as unidades dos campos, potencialmente incluindo tempo, latitude, longitude, altitude, potência e métricas de qualidade. Uma fonte VHF individual não equivale a uma descarga completa.

O recorte inicial será de pelo menos três tempestades independentes no Alabama e três no Rio Grande do Sul, condicionado à disponibilidade. As datas devem coincidir com a operação do GOES-19, e as amostras serão pareadas por fase convectiva, intensidade, horário e geometria de observação. Para verificar CG, será necessária fonte independente de rótulos de descargas nuvem-solo.

## 4. Formulação matemática
Duração de um flash: T = t_f - t_i.

Taxa de flashes: F = N / Δt, com Δt em minutos.

Densidade espaço-temporal: D = N / (S × Δt), onde S é a área analisada em km².

Energia óptica por duração: Q = E / T, se T > 0; indicador óptico, não potência elétrica.

Energia óptica por área: U = E / A, se A > 0.

Variação relativa da taxa: J = (F_atual - F_base) / max(F_base, ε), com ε declarado.

Para um agrupamento de N fontes VHF: altitude média z̄ = Σ z_i / N; extensão vertical Δz = max(z_i) - min(z_i); duração Δt_VHF = max(t_i) - min(t_i); fração abaixo de altura h0: p_baixa = #{z_i < h0} / N. A fração de fontes baixas não demonstra contato com o solo.

A distância horizontal entre centros é calculada pela fórmula de Haversine. A separação temporal entre intervalos é zero quando eles se sobrepõem, ou o menor intervalo entre suas extremidades quando não se sobrepõem. O protótipo atual usa 25 km e 1 s como limites **meramente exploratórios**, sujeitos à calibração.

Para classificação supervisionada, uma hipótese inicial é regressão logística multinomial: P(k|x) = exp(b_k + w_k·x) / Σ_c exp(b_c + w_c·x). A classe indeterminada deve ser tratada como abstenção quando a confiança for insuficiente. Sem validação e calibração, probabilidades não devem ser interpretadas como confiabilidade operacional.

## 5. Metodologia experimental
Primeiro, selecionar tempestades e registrar os metadados de cada conjunto. Segundo, preservar arquivos originais e checksums, converter horários para UTC, verificar unidades e filtrar registros de qualidade inadequada. Terceiro, agrupar fontes VHF e associá-las a flashes ópticos, mantendo associações ambíguas identificadas. Quarto, extrair distribuições de duração, energia, área, frequência e extensão elétrica. Quinto, comparar regiões por estatísticas robustas, incluindo mediana, intervalo interquartil, distância de Wasserstein e teste Kolmogorov–Smirnov, com incerteza estimada por reamostragem de tempestades.

O conjunto de treinamento e validação deve ser dividido por tempestade, não aleatoriamente por flash, para evitar vazamento temporal e espacial. A avaliação de transferência para o Brasil requer rótulos independentes brasileiros e deve reportar precisão, sensibilidade, falsos positivos e calibração. É necessário controlar efeitos de geometria de observação do satélite, cobertura da NALMA, diferença de eficiência de detecção e características ambientais.

## 6. Limitações
A semelhança climática entre Alabama e partes do Sul do Brasil não garante equivalência de tempestades individuais. A NALMA cobre uma região específica dos Estados Unidos; não fornece observações VHF equivalentes no Rio Grande do Sul. A detecção GLM pode não coincidir com todas as fontes VHF, e o inverso também ocorre. A presença de emissão VHF em altitude não prova que a descarga atingiu o solo. Classificações CG exigem validação independente. O presente trabalho é uma proposta de pesquisa e não um sistema de alerta validado.

## 7. Resultados esperados e conclusão
Espera-se obter uma base comparável de descritores ópticos e VHF, identificar padrões regionais e quantificar limitações da transferência estatística. A contribuição inicial é metodológica: um procedimento reprodutível para relacionar modalidades ópticas e VHF sem atribuir ao GLM capacidades de medição que ele não possui. Não há, nesta etapa, resultados medidos ou acurácia demonstrada.

## Referências e fontes para consulta
- NASA GHRC — North Alabama Lightning Mapping Array (NALMA) V1: https://doi.org/10.5067/NALMA/DATA101 (verificar metadados da coleção antes da coleta).
- NASA Earthdata — NALMA: https://data.nasa.gov/dataset/north-alabama-lightning-mapping-array-lma-v1
- Guia técnico NALMA: https://ghrc.nsstc.nasa.gov/pub/lma/nalmaraw/doc/nalma_dataset.pdf
- NOAA GOES-R Series — GLM: https://www.goes-r.gov/spacesegment/glm.html
- MONI Weather, branch de pesquisa: https://github.com/LucasSudati/moni-weather/tree/feature/nalma-glm-correlation/research/nalma-glm

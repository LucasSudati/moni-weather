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

As expressões seguintes usam notação matemática LaTeX em blocos, com grandezas e unidades definidas no texto.

**Duração de um flash:**

$$
T = t_f - t_i
$$

em que \(t_i\) e \(t_f\) são os instantes inicial e final, e \(T\) é expresso em segundos.

**Taxa de flashes:**

$$
F = \frac{N_f}{\Delta t}
$$

em flashes por minuto, quando \(\Delta t\) está em minutos e \(N_f\) é a quantidade de flashes.

**Densidade espaço-temporal:**

$$
D = \frac{N_f}{S\,\Delta t}
$$

em flashes por km² por minuto, com \(S\) em km².

**Energia óptica por duração:**

$$
Q = \frac{E}{T}, \qquad T>0
$$

em watts quando \(E\) está em joules. Trata-se de um indicador derivado da energia óptica registrada, não da potência elétrica da descarga.

**Energia óptica por área:**

$$
U = \frac{E}{A}, \qquad A>0
$$

em J/km² quando \(A\) está em km².

**Variação relativa da taxa de flashes:**

$$
J = \frac{F_{\mathrm{atual}}-F_{\mathrm{base}}}{\max(F_{\mathrm{base}},\varepsilon)}
$$

em que \(\varepsilon>0\) é um parâmetro de estabilização a ser declarado.

Para um agrupamento de \(N_s\) fontes VHF da NALMA, com altitudes \(z_i\) e instantes \(t_i\):

**Altitude média:**

$$
\bar z = \frac{1}{N_s}\sum_{i=1}^{N_s}z_i
$$

**Extensão vertical:**

$$
\Delta z = \max_i(z_i)-\min_i(z_i)
$$

**Duração da atividade VHF:**

$$
\Delta t_{\mathrm{VHF}} = \max_i(t_i)-\min_i(t_i)
$$

**Fração de fontes abaixo da altura de referência \(h_0\):**

$$
p_{\mathrm{baixa}} = \frac{1}{N_s}\sum_{i=1}^{N_s}\mathbf{1}(z_i<h_0)
$$

A presença de fontes VHF em baixa altitude não demonstra contato da descarga com o solo.

**Distância horizontal entre centros (Haversine):**

$$
d=2R\arcsin\left(\sqrt{\sin^2\left(\frac{\varphi_2-\varphi_1}{2}\right)+\cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\lambda_2-\lambda_1}{2}\right)}\right)
$$

em que \(R\) é o raio terrestre, \(\varphi\) representa latitude e \(\lambda\), longitude, ambas em radianos.

**Separação temporal entre intervalos NALMA e GLM:**

$$
\Delta t_{\mathrm{gap}}=\max\left(0,\ t_{N,0}-t_{G,1},\ t_{G,0}-t_{N,1}\right)
$$

O valor é zero quando os intervalos se sobrepõem. Os limites iniciais de 25 km e 1 s são **meramente exploratórios**, sujeitos à calibração.

**Classificador supervisionado — regressão logística multinomial:**

$$
s_k=b_k+\mathbf{w}_k^\mathsf{T}\mathbf{x}
$$

$$
P(k\mid\mathbf{x})=\frac{\exp(s_k)}{\sum_c\exp(s_c)}
$$

A classe indeterminada corresponde à abstenção quando a confiança é insuficiente. Sem validação e calibração, essas probabilidades não representam confiabilidade operacional.

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

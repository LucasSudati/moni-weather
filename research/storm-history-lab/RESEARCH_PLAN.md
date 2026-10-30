# Laboratório de tempestades históricas — plano de pesquisa

**Projeto:** MONI Weather · **Status:** planejamento experimental · **Data:** 30/10/2026

## Objetivo
Reconstruir a evolução de tempestades históricas, especialmente episódios de granizo no Rio Grande do Sul, por meio de uma linha do tempo sincronizada de radar, satélite, descargas atmosféricas e registros independentes de impactos. O laboratório também servirá como base de casos para testes retrospectivos de algoritmos.

## Escopo inicial
- Selecionar eventos com data, local e intervalo UTC documentados; registrar critérios de inclusão e exclusão.
- Ingerir dados históricos disponíveis de GOES-19 ABI/GLM (apenas para datas cobertas pelo satélite), REDEMET/DECEA MAXCAPPI e outras fontes autorizadas.
- Registrar relatórios de granizo, alertas e observações oficiais com procedência, horário, incerteza e distinção entre ocorrência confirmada e relato.
- Exibir camadas sincronizadas em linha do tempo, com indicação de lacunas, latência e resolução.
- Exportar um dossiê reprodutível de cada caso: fontes, versões, horários, parâmetros e limitações.

## Estrutura proposta
`cases/<id-do-evento>/metadata.json` — identificação, região, janela UTC, licenças e fontes.
`cases/<id-do-evento>/observations/` — manifestos ou dados permitidos, com checksums.
`cases/<id-do-evento>/analysis/` — séries temporais, anotações e figuras derivadas.
`research/storm-history-lab/` — protocolos e relatórios; não versionar segredos nem grandes dados brutos sem política de armazenamento.

## Método
1. Selecionar casos sem usar o desempenho de modelos como critério.
2. Verificar acesso, termos de uso, cobertura temporal e qualidade das fontes.
3. Padronizar UTC, coordenadas, unidades, projeções e identificação de produtos.
4. Sincronizar observações preservando seus horários originais e resolução temporal.
5. Comparar evolução observada com relatos independentes, registrando discrepâncias.
6. Produzir relatórios e conjunto de casos para avaliação retrospectiva sem vazamento de informações futuras.

## Critérios de aceitação da primeira etapa
- Um caso histórico reproduzível, com manifesto de fontes e cronologia documentada.
- Visualização temporal com indicação explícita de dados ausentes.
- Testes de conversão de horários e coordenadas.
- Nenhuma afirmação de previsão ou detecção de granizo validada sem comparação independente.

## Riscos e limites
Cobertura e disponibilidade histórica variam por sensor; a rede de radar pode apresentar lacunas; relatos de danos têm vieses espaciais; GOES-19 não cobre eventos anteriores à sua operação. Respeitar licenças e não confundir proxy de severidade com granizo confirmado.

## Integração
Trabalho restrito a esta branch até revisão técnica. Integração na `main` somente após testes, revisão de dados e autorização explícita.

## Ampliação do corpus — Rio Grande do Sul

**Decisão de escopo (30/10/2026):** construir um inventário abrangente de eventos hidrometeorológicos do Rio Grande do Sul, não apenas de granizo. Incluir enchentes e inundações, enxurradas, cheias de rios, chuva extrema, tempestades convectivas, vendavais, tornados, granizo e episódios compostos. O inventário será continuamente ampliado conforme a disponibilidade de registros verificáveis; **não é possível presumir cobertura de todas as ocorrências históricas**.

### Fontes candidatas e verificação
- **Defesa Civil do RS e S2iD:** registros de ocorrências, danos e municípios afetados; confirmar granularidade, licenças e acesso.
- **ANA / HidroWeb e redes hidrométricas:** níveis, vazões, cotas de referência e séries temporais; conferir estações e qualidade.
- **INMET:** estações, chuva, vento, temperatura e boletins, com metadados.
- **CPRM / SGB:** monitoramento hidrológico e informações geológicas e de risco.
- **CEMADEN:** pluviômetros, monitoramento e alertas onde houver cobertura.
- **REDEMET / DECEA:** produtos de radar quando disponíveis e autorizados.
- **NOAA / NASA / INPE:** satélite, GLM e outras observações, respeitando a janela operacional de cada instrumento.
- **Órgãos estaduais e municipais:** registros e relatórios oficiais de impacto, com confirmação independente quando possível.

Essas são **fontes a consultar**, não dados já obtidos ou verificados. Não usar eventos anteriores ao início da operação de determinado sensor como se tivessem observações desse sensor.

### Organização dos estudos
1. **Inventário mestre:** identificador, tipo de fenômeno, início/fim UTC, municípios, geometria, fonte, qualidade, incerteza, licença e disponibilidade de dados.
2. **Catálogo de observações:** estação/sensor, variável, unidade, resolução, datum, cobertura, lacunas, flags de qualidade, checksum e versão.
3. **Casos de estudo:** evento hidrológico, convectivo ou composto, com cronologia e ligações entre chuva, níveis dos rios, radar, satélite e impactos.
4. **Conjuntos de avaliação por tarefa:** nowcast de células para 15–60 min; chuva intensa; cheias com horizontes e métricas próprios. **Não usar erro de trajetória de células para avaliar previsão de inundação.**
5. **Partições independentes:** separar tempestades e episódios de cheia por evento e período, evitando que janelas correlacionadas entrem em treino e teste.
6. **Relatórios de lacunas:** eventos sem radar, satélite ou estações suficientes continuam catalogados, mas não entram em métricas incompatíveis.

### Eventos prioritários para levantamento
- Enchentes e chuvas extremas de **abril–maio de 2024** no RS.
- Outros episódios históricos de cheias, vendavais e granizo a identificar por fontes oficiais, sem antecipar contagens ou datas não verificadas.

### Critérios de qualidade
Não tratar ausência de registro como ausência de fenômeno; distinguir relato de observação instrumental; manter dados brutos e proveniência; não inferir causa de impacto apenas por correlação temporal; registrar limitações espaciais e mudanças de instrumentação.

### Marco inicial
Publicar primeiro o esquema do inventário e uma lista de fontes verificadas. Depois coletar eventos por períodos, auditar cobertura e somente então construir conjuntos de validação reproduzíveis.


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

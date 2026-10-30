# Validação automática do nowcast — protocolo inicial

**Projeto:** MONI Weather · **Status:** planejamento experimental · **Data:** 30/10/2026

## Objetivo
Medir o desempenho das previsões de deslocamento de células convectivas do MONI Weather para horizontes de **15, 30, 45 e 60 minutos**, confrontando previsões congeladas no instante de emissão com observações posteriores independentes da execução da previsão.

## Unidade de avaliação e dados
Cada registro deve conter: identificador de tempestade e célula, instante UTC de emissão `t0`, horizonte `h`, posição/contorno previsto, versão do algoritmo, parâmetros, identificadores e horários das observações disponíveis em `t0`, posição/contorno observado em `t0+h`, qualidade e motivo de eventual exclusão. Preservar previsões originais imutáveis para impedir avaliação com dados futuros.

## Métricas
Para célula corretamente associada, erro horizontal do centro:

$$
e_h = 2R\arcsin\!\left(\sqrt{\sin^2\!\left(\frac{\varphi_o-\varphi_p}{2}\right)+\cos\varphi_p\cos\varphi_o\sin^2\!\left(\frac{\lambda_o-\lambda_p}{2}\right)}\right)
$$

com latitude/longitude em radianos e `R` em quilômetros; `e_h` resulta em km. Reportar mediana, média, percentis 75/90 e intervalos de confiança por reamostragem **de tempestades**, para cada horizonte. Para contornos, usar interseção sobre união (IoU) quando as geometrias forem comparáveis.

Avaliar separadamente **detecção e associação**: taxa de células previstas sem correspondência, células observadas não previstas, divisões/fusões e falhas de rastreamento. Não calcular erro de posição somente para sucessos sem divulgar a taxa de falha, pois isso gera viés de sobrevivência.

## Protocolo
1. Definir previamente janelas, limiares de associação, máscaras de cobertura e critérios de exclusão.
2. Executar previsões usando apenas observações disponíveis até `t0`; registrar versões e hashes.
3. Recuperar observações de verificação em `t0+h`, com tolerância temporal declarada.
4. Associar células por procedimento determinístico, documentando empates, divisões e fusões.
5. Calcular métricas por horizonte, tempestade, intensidade e qualidade de cobertura.
6. Comparar com baselines: persistência (posição inalterada) e extrapolação linear simples.
7. Separar desenvolvimento e teste por **tempestade**, preferencialmente também por período; publicar incertezas e casos de falha.
8. Repetir avaliação em episódios históricos independentes do laboratório de tempestades.

## Critérios de aceitação da primeira etapa
- Esquema de dados e testes de horários/UTC e Haversine, inclusive bordas e coordenadas inválidas.
- Execução retrospectiva reproduzível com pelo menos um evento e quatro horizontes, sem alegar generalização estatística.
- Relatório que inclua cobertura, taxa de associação, falhas e métricas com unidades.
- Nenhuma promessa de desempenho operacional sem amostra representativa e validação externa.

## Limitações
O radar pode ter latência e lacunas; centroides podem mudar com a evolução da célula; divisão e fusão tornam a associação ambígua; amostras sucessivas de uma mesma tempestade são correlacionadas. Os limiares e metas numéricas só serão definidos após avaliação da qualidade dos dados, sem ajuste oportunista ao conjunto de teste.

## Integração
Desenvolvimento isolado nesta branch. A `main` permanece inalterada até revisão, testes e autorização explícita.

# Protocolo de validação matemática — NALMA × GLM (v0.1)

**Status:** protocolo pré-experimental; sem resultados medidos. **Origem:** branch main. **Objetivo:** avaliar se observações ópticas GLM permitem estimar descargas nuvem-solo (CG) versus não-CG, usando NALMA para caracterização VHF e uma rede independente para rótulos CG.

## 1. Hipóteses e separação de etapas
1. Associar fontes NALMA a flashes GLM por tempo e espaço; associação não implica classificação.
2. Extrair atributos: altitude média, dispersão e extensão vertical, duração, extensão horizontal, evolução temporal VHF; duração, energia e área óptica GLM.
3. Treinar classificador probabilístico; classe **indeterminada** por abstenção quando evidência insuficiente.
4. Validar rótulos CG com observações independentes (rede terrestre apropriada). Ausência de fontes VHF baixas **não prova** ausência de CG.

## 2. Preparação e controle de qualidade
- Guardar dados originais, origem, licença, versões de processamento, UTC, unidades e metadados de qualidade.
- Registrar a geometria de visada do GOES, cobertura NALMA, disponibilidade de sensores e topografia.
- Identificar eventos ambíguos, duplicatas, falhas e janelas sem cobertura; não convertê-los em negativos.
- Começar com parâmetros candidatos de associação espacial (25 km) e temporal (1 s), **não validados**; testar sensibilidade e colisões muitos-para-um.

## 3. Partição e treinamento
Separar tempestades inteiras entre treino, validação e teste; evitar vazamento temporal e espacial. Ajustar normalização, parâmetros e limiar apenas em treino/validação. Reservar teste independente e posteriormente comparar domínio Alabama–RS (transferência não equivale a verdade de terreno no RS).

## 4. Métricas (classe positiva = CG)
| Medida | Equação | Interpretação |
|---|---|---|
| Precisão | $\\displaystyle \\frac{VP}{VP+FP}$ | Fração de previsões CG corretas |
| Sensibilidade | $\\displaystyle \\frac{VP}{VP+FN}$ | Fração de CG detectados |
| Especificidade | $\\displaystyle \\frac{VN}{VN+FP}$ | Fração de não-CG corretamente rejeitados |
| F1 | $\\displaystyle \\frac{2VP}{2VP+FP+FN}$ | Equilíbrio precisão/sensibilidade |

VP, FP, VN e FN são contagens da matriz de confusão. Reportar denominadores, intervalos de confiança, matriz completa, taxa de abstenção, calibração das probabilidades e desempenho por tempestade. Métricas com denominador zero ficam indefinidas, nunca iguais a zero por conveniência.

## 5. Critérios de decisão
Limiar inicial candidato de 0,85 **não é confiança científica calibrada**. Escolher limiar segundo custo dos falsos alarmes, cobertura e validação. Reportar casos sem correspondência como indeterminados. Não inferir IC versus CC sem rótulos independentes adequados.

## 6. Registro dos testes
Para cada execução: data UTC, arquivos/DOIs, checksums, versão do código, parâmetros, quantidade de tempestades, cobertura, métricas, falhas, limitações e decisão de continuar ou rejeitar hipótese. Nenhum resultado numérico deve ser inventado.

## 7. Revisão cruzada
Enviar protocolo e resultados para crítica na branch `research/nalma-glm-peer-review`. Cada objeção deve indicar trecho, evidência, impacto e correção. Não integrar na main sem revisão e autorização.

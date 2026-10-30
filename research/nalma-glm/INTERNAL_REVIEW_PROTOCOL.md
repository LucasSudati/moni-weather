# Protocolo de revisão científica interna — NALMA × GLM (v0.1)

**Escopo:** revisão crítica do artigo exploratório `research/articles/glm-nalma-alabama-brasil.md` e do protocolo matemático. **Natureza:** auditoria interna inspirada em revisão por pares; **não** equivale a parecer independente de especialistas.

## 1. Princípios
- Distinguir observação, hipótese, inferência e resultado validado.
- Não tratar flash óptico GLM como medição direta de campo elétrico nem como prova de impacto no solo.
- NALMA detecta fontes VHF e não cobre o Rio Grande do Sul; classificar CG requer validação independente.
- Preservar equações em LaTeX e definir símbolos, unidades, intervalos e condições de validade.
- Não alterar a main durante a revisão.

## 2. Checklist de auditoria
1. **Física:** definições de flash, raio, CG, IC e CC; limites instrumentais; emissões VHF versus ópticas.
2. **Equações:** dimensões, unidades, singularidades (divisão por zero), normalização, geometria esférica, propagação de incerteza.
3. **Associação:** critérios de tempo/espaço, resolução dos sensores, múltiplas correspondências, falsos pareamentos.
4. **Treinamento:** origem dos rótulos, desequilíbrio de classes, independência dos conjuntos, vazamento de dados, abstenção.
5. **Validação:** matriz de confusão, precisão, sensibilidade, especificidade, calibração e incertezas.
6. **Transferência Alabama–RS:** seleção de tempestades comparáveis, sazonalidade, diferenças atmosféricas, geometria GOES e ausência de verdade de terreno NALMA no RS.
7. **Reprodutibilidade:** fonte e versão de dados, scripts, parâmetros, referências verificáveis e limitações.
8. **Redação:** não apresentar resultados inexistentes; distinguir metas, experimentos e achados.

## 3. Modelo de parecer
Para cada apontamento registrar:
- **ID e gravidade:** crítico / maior / menor / sugestão.
- **Localização:** arquivo, seção e equação.
- **Problema:** descrição objetiva.
- **Fundamentação:** justificativa física, matemática ou bibliográfica.
- **Impacto:** possível efeito sobre conclusões.
- **Correção proposta:** texto, equação ou teste necessário.
- **Resposta do autor:** aceitar / justificar / pendente, com evidência.

## 4. Fluxo de revisão cruzada
A revisão examina o protocolo da branch `research/nalma-glm-validation`; a validação responde às críticas e produz testes reproduzíveis. Registrar divergências não resolvidas, sem forçar consenso. Alterações à main apenas após análise conjunta e autorização explícita.

## 5. Parecer inicial (pendente de auditoria integral)
Pontos prioritários a verificar: dependência de verdade de terreno CG, transferência de domínio Alabama–RS, limiares experimentais e distinção entre associação NALMA–GLM e classificação. **Não declarar artigo aprovado antes da análise completa.**

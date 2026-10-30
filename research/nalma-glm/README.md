# Experimento NALMA × GLM

Protótipo de correlação por proximidade espacial e temporal. Não é um classificador de raios nuvem-solo.

## Testes

No diretório raiz do repositório, com Node.js moderno:

```bash
node --experimental-default-type=module --test research/nalma-glm/tests/*.test.js
```

Os testes usam **dados sintéticos**, não medições da NASA. Limiares iniciais de 25 km e 1000 ms são parâmetros ilustrativos, **não calibrados**. O algoritmo retorna associações muitos-para-muitos, pontuação heurística e classificação `unknown`.

## Próximas etapas

Validar os formatos oficiais NALMA e GLM, implementar conversores com proveniência e unidades, obter tempestade histórica de cobertura simultânea, calibrar janelas e avaliar falsos pareamentos antes de integrar ao MONI Weather.

## Execução verificada — 30/10/2026

Os seis testes originais foram executados com Node.js v22.16.0 e passaram (**6/6**). Foram acrescentados três testes de validação de coordenadas e limites e oito testes de parser NALMA, gzip, dados vazios, entradas inválidas e pareamento sintético NALMA × GLM. Após essas alterações, **17/17 testes passaram** em execução local.

A verificação é **exclusivamente de software com dados sintéticos**; ainda não foi obtido arquivo de observação NALMA nem arquivo GOES-19 GLM real, portanto **não há validação científica de correlação**. O parser foi implementado a partir do guia NASA, mas não foi validado com um granule real.

Arquivos novos:
- [Parser NALMA](processors/parse-nalma.js)
- [Testes do parser e pareamento](tests/parse-nalma.test.js)
- [Inspeção de arquivo local e SHA-256](scripts/inspect-nalma.js)
- [Relatório técnico da execução](TEST_REPORT_2026-10-30.md)

Para inspecionar uma amostra real depois de obtê-la no Earthdata:

```bash
node --experimental-default-type=module research/nalma-glm/scripts/inspect-nalma.js /caminho/NALMA_YYMMDD_hhmmss_####.dat.gz
```

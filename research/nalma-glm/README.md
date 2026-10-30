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

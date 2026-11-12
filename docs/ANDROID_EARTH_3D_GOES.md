# Moni Weather — Android / Terra 3D / GOES

**Status:** planejamento técnico; branch isolada da `main`. Nenhum APK compilado ou integração validada nesta etapa.

## Objetivo
Criar aplicativo Android usando Capacitor + Android Studio, com globo terrestre 3D como mapa principal, preservando as funcionalidades web e as Edge Functions Supabase.

## Etapas
- [ ] Auditar a implementação atual de mapas e suas dependências antes de escolher o motor do globo (MapLibre 3D não implica globo esférico).
- [ ] Implementar globo esférico com navegação por toque, zoom, rotação e geolocalização; avaliar CesiumJS ou alternativa WebGL compatível com Android WebView.
- [ ] Adaptar controles e desempenho para dispositivos Android; limitar resolução, memória de texturas e frequência de atualização.
- [ ] Criar empacotamento Capacitor, permissões e instruções de build no Android Studio.
- [ ] Integrar camadas GOES ABI com timestamps, legendas, cobertura e disponibilidade por produto.
- [ ] Preservar radar MAXCAPPI, GLM, IMERG, relatos, alertas e análise de risco, quando compatíveis com o globo.
- [ ] Testar em aparelho real, compilar APK de depuração e documentar resultados.

## Catálogo GOES ABI planejado
Oferecer, conforme disponibilidade do provedor e satélite, **16 bandas ABI**:
- Visível: bandas 1 (azul, ~0,47 µm) e 2 (vermelho, ~0,64 µm).
- Infravermelho próximo: bandas 3–6 (~0,86; 1,37; 1,61; 2,24 µm).
- Infravermelho: bandas 7–16 (~3,9 a 13,3 µm).
- Composições: GeoColor, cor natural aproximada, vapor d'água, nuvens e outros RGB derivados **somente quando disponíveis e corretamente rotulados**.

**Importante:** ABI não possui banda ultravioleta (UV). Não anunciar UV como observação ABI. Caso se integre produto UV de outro instrumento, identificar claramente a fonte, a resolução e a atualização. GLM é sensor óptico de relâmpagos, não câmera UV.

## Critérios de qualidade
- Seleção de banda/composição e horário com indicação de latência e cobertura.
- Não inventar imagens, timestamps ou canais ausentes.
- Reprojeção geográfica correta no globo e tratamento de áreas sem cobertura.
- Fonte, atribuição e licenças verificadas.
- Testes de CORS, WebGL, consumo de memória, zoom e rotação no Android.
- Segredos e chaves privadas permanecem no backend, nunca no APK.

## Arquitetura proposta
```text
Android APK (Capacitor)
  └── WebView / frontend responsivo
      ├── Globo 3D WebGL
      ├── Camadas GOES ABI / GLM
      ├── Radar MAXCAPPI / IMERG
      └── Supabase Edge Functions existentes
```

Esta documentação registra o escopo inicial. A implementação será realizada e validada em commits posteriores, sem alterar a `main`.


# MONI Weather

**Mapa colaborativo de alerta e apoio para tempestades e catástrofes.**

O MONI Weather reúne, na mesma interface, o que está acontecendo **no
céu** — satélite, infravermelho, radar, precipitação, raios, vento e
células convectivas — e **no chão** — abrigos, doações, distribuição,
lonas, energia, água e danos reportados pela comunidade.

**Aplicação:** <https://lucassudati.github.io/moni-weather/>  
**Repositório:** <https://github.com/LucasSudati/moni-weather>

> **Projeto experimental e não oficial.** Não substitui alertas,
> orientações ou canais da Defesa Civil, INMET, Bombeiros, SAMU ou
> outras autoridades.

------------------------------------------------------------------------

## Por que existe

O projeto nasceu depois de uma tempestade intensa de granizo, em
setembro de 2026, que causou danos graves em uma cidade e na região ao
redor. Nos primeiros dias, informações essenciais ficaram espalhadas em
grupos de mensagem, publicações e conversas: onde havia lona, onde
receber doações, quais bairros estavam sem energia ou água e quais vias
tinham problemas.

A proposta do MONI Weather é colocar **meteorologia, risco e logística
comunitária no mesmo mapa**, com linguagem acessível e indicação clara
da origem e das limitações de cada informação.

## Princípios

- **Informação compreensível:** dados técnicos são traduzidos para
  elementos visuais e mensagens curtas.
- **Observação não é previsão:** satélite, radar e raios são separados
  de modelos e estimativas.
- **Estimativa não é alerta oficial:** risco, granizo e nowcast do MONI
  são experimentais.
- **Relato comunitário não é dado verificado:** relatos são
  identificados como colaborativos.
- **Informação temporária:** relatos expiram para reduzir informação
  obsoleta.
- **Privacidade:** o formulário orienta a não publicar nomes nem
  telefones.
- **Falha degradável:** uma fonte indisponível não deve inutilizar o
  restante do mapa.

------------------------------------------------------------------------

# Funcionalidades

## Meteorologia

A interface disponibiliza:

- Satélite GOES-19 / GOES-East ABI;
- nuvens de tempestade em infravermelho;
- radar REDEMET / MAXCAPPI com animação;
- precipitação NASA IMERG;
- raios GOES GLM;
- vento;
- células de tempestade;
- trajetória observada;
- nowcast experimental de 15, 30, 45 e 60 minutos;
- potencial de granizo;
- queimadas/focos térmicos;
- avisos do INMET;
- linha do tempo;
- análise meteorológica do ponto selecionado.

## Risco simplificado

Ao tocar no mapa ou usar a localização, o app classifica o ponto como
**baixo, moderado, alto ou muito alto**. É uma heurística experimental e
não um alerta oficial.

## Relatos

O botão **Reportar** permite informar:

| Grupo       | Situações                                                   |
|-------------|-------------------------------------------------------------|
| Tempo agora | granizo, tempestade forte, chuva intensa, incêndio/queimada |
| Ajuda       | abrigo, arrecadação, distribuição, lonas, energia, água     |
| Necessidade | precisa de lona, sem energia, sem água                      |
| Perigo      | árvore caída, poste/fio caído                               |

O relato pode usar a localização do aparelho ou um ponto escolhido no
mapa.

------------------------------------------------------------------------

# Arquitetura

O MONI foi desenhado para operar **100% online**, sem servidor próprio e
sem computador permanentemente ligado.

``` text
GitHub Pages
└─ HTML + CSS + JavaScript
   ├─ Leaflet ───────────── mapa meteorológico
   ├─ MapLibre GL JS ───── rotas 2D/3D
   ├─ APIs públicas ────── GIBS / Open-Meteo / etc.
   └─ Supabase
      ├─ PostgreSQL / REST ─ relatos e estado
      └─ Edge Functions
         ├─ glm
         ├─ radar
         ├─ maxcappi-analyze
         ├─ fires
         └─ route
```

| Parte               | Tecnologia                        |
|---------------------|-----------------------------------|
| Front-end           | HTML, CSS e JavaScript puro       |
| Mapa                | Leaflet                           |
| Rotas 2D/3D         | MapLibre GL JS                    |
| Hospedagem          | GitHub Pages                      |
| Banco               | Supabase/PostgreSQL               |
| Processamento/proxy | Supabase Edge Functions / Deno    |
| PWA                 | Service Worker + Web App Manifest |
| Localização         | Geolocation API                   |

Não há etapa obrigatória de build.

------------------------------------------------------------------------

# Como os dados são tratados

## Satélite GOES

O GeoColor do GOES-East/GOES-19 é carregado como camada
georreferenciada. O usuário controla a opacidade e a timeline pode
selecionar observações anteriores. O sistema não cria frames futuros.

## Infravermelho

A imagem IR ajuda a visualizar topos de nuvens e convecção. A análise de
núcleos frios é experimental. O tratamento visual usa saturação reduzida
para que vermelho/laranja permaneçam associados a risco na interface.

## Precipitação IMERG

O produto `IMERG_Precipitation_Rate` é consumido via NASA GIBS/WMS.

``` text
NASA GIBS → WMS → tile georreferenciado → pane Leaflet → mapa
```

É tratado como **precipitação observada** e pode ter atraso de algumas
horas. Não substitui radar em tempo real.

## Radar REDEMET / MAXCAPPI

O radar passa pela Edge Function `radar`.

``` text
REDEMET
  ↓
Edge Function radar
  ↓
validação + normalização + metadados geográficos
  ↓
frames MAXCAPPI
  ├─→ animação no mapa
  └─→ maxcappi-analyze
```

A função mantém credenciais fora do navegador, normaliza horários,
associa imagens aos radares/bounds e elimina respostas inadequadas ou
duplicadas quando necessário.

## Raios GOES GLM

A Edge Function `glm` entrega ao navegador uma representação reduzida da
atividade elétrica.

``` text
GOES GLM
  ↓
glm
  ↓
filtro temporal
  ↓
filtro espacial / bbox
  ↓
normalização
  ↓
eventos recentes
  ↓
mapa
```

O front-end trabalha com uma janela recente, limita o volume de pontos e
pode usar idade/opacidade para destacar eventos novos. Uma detecção GLM
representa atividade elétrica observada por satélite; não significa
necessariamente impacto no solo exatamente no pixel mostrado.

## Vento

O vento é mostrado por direção e intensidade. Para a análise do ponto,
velocidade e rajadas também entram na avaliação de risco.

## Queimadas

Focos térmicos podem vir de produtos VIIRS/GOES e da Edge Function
`fires`, conforme a fonte configurada.

**Foco térmico não é confirmação de incêndio.** É uma detecção remota
sujeita à resolução do sensor, horário, nuvens e outras limitações.

O MONI mantém separada uma heurística de **condição meteorológica
favorável ao fogo**, baseada em umidade, temperatura, rajadas e
precipitação.

## INMET

Avisos do INMET aparecem como informação oficial separada. A interface
não mistura visualmente um aviso oficial com a classificação
experimental do MONI.

## Open-Meteo

Ao selecionar um ponto, o front-end consulta dados horários como:

- temperatura a 2 m;
- umidade;
- precipitação;
- cobertura de nuvens;
- vento a 10 m;
- rajadas;
- CAPE;
- Lifted Index;
- Convective Inhibition;
- altura do nível de congelamento.

A timeline usa aproximadamente 12 h anteriores e 12 h futuras ao momento
de referência.

------------------------------------------------------------------------

# Tratamento do risco

A escala de risco é uma **heurística do projeto**.

Na implementação usada como base:

``` text
CAPE >= 800 J/kg                  → pelo menos MODERADO
CAPE >= 1500 J/kg ou rajada >=60 → ALTO
CAPE >= 2500 J/kg ou rajada >=80 → MUITO ALTO
LI <= -6 e CAPE >= 1000          → pode elevar 1 nível
|CIN| > 200                       → pode reduzir 1 nível
```

O potencial de granizo é calculado separadamente combinando
instabilidade, precipitação e nível de congelamento.

Esses limiares **não são critérios oficiais do INMET ou da Defesa
Civil**.

------------------------------------------------------------------------

# MAXCAPPI Analyzer

`maxcappi-analyze` é a parte de processamento convectivo do MONI.

## Classificação dos pixels

O produto recebido é uma imagem PNG colorida. O analisador decodifica a
imagem e classifica a paleta.

O campo `estimated_dbz` é uma **estimativa baseada na cor da imagem
MAXCAPPI**, não a refletividade bruta original da REDEMET.

## Células e núcleos

Configuração documentada:

``` text
célula:
  estimated_dbz >= 30 dBZ
  mínimo: 3 pixels

núcleo convectivo:
  estimated_dbz >= 50 dBZ
  mínimo: 2 pixels

merge multirradar:
  distância: 20 km
```

Uma célula pode conter vários núcleos. Para cada estrutura são obtidos
centro, bounding box, área aproximada, intensidade, pico e informações
dos núcleos.

## Tracking

O estado temporal é persistido na tabela:

``` text
moni_maxcappi_state
```

O estado lógico utilizado é `brasil`.

Parâmetros documentados:

``` text
idade máxima do estado anterior: 90 min
velocidade física máxima:        180 km/h
tolerância base:                 8 km
distância máxima de associação:  60 km
histórico:                       até 8 pontos
suavização:                      até 5 segmentos
```

O matching considera posição anterior e prevista, direção, velocidade,
mudança de área, salto de dBZ e mudança de núcleos. Associações
fisicamente incompatíveis recebem penalidade ou são rejeitadas.

O sistema mantém indicadores como `confidence`, `motion_quality`,
`forecast_quality`, `track_quality_score`, `forecast_status` e
`forecast_reason`.

## Nowcast

Com movimento suficientemente confiável:

``` text
posição observada
   ↓
vetor suavizado
   ↓
+15 min
+30 min
+45 min
+60 min
```

É uma **extrapolação cinemática**, não um modelo atmosférico. A
qualidade cai quando células nascem, dissipam, dividem, fundem ou mudam
rapidamente de direção/velocidade. O nowcast pode ser bloqueado quando o
movimento não é confiável.

------------------------------------------------------------------------

# Relatos da comunidade

Cada relato guarda informações equivalentes a:

``` text
tipo
latitude / longitude
horário
nota opcional
contadores/estado de confirmação
```

A implementação usa TTL por natureza do relato. A lógica documentada
historicamente trabalha com:

``` text
ajuda disponível → até 48 h
necessidade      → até 24 h
perigo           → até 12 h
serviço          → até 12 h
```

Tipos meteorológicos imediatos podem usar validade menor na versão em
produção.

Usuários próximos podem marcar **Ainda vale** ou **Não está mais**.
Relatos suficientemente contestados podem sair do mapa antes do TTL.

O texto livre é curto e a interface pede explicitamente que não sejam
publicados nomes nem telefones.

------------------------------------------------------------------------

# Rotas internas 2D/3D

A rota até um relato permanece dentro do MONI.

``` text
localização atual + destino
          ↓
       route
          ↓
 serviço compatível com OSRM
          ↓
geometria + distância + duração + passos
          ↓
     MapLibre GL JS
          ↓
       2D / 3D
```

A função valida origem/destino e converte a ordem das coordenadas para o
formato esperado pelo upstream. O front-end desenha a rota, acompanha a
localização, mostra resumo/instruções e alterna entre 2D e 3D.

A rota não garante conhecimento de bloqueios recentes causados por uma
catástrofe.

------------------------------------------------------------------------

# PWA e notificações

O projeto inclui `manifest.webmanifest` e `sw.js`.

O Service Worker cuida do cache dos recursos essenciais e da
infraestrutura de notificações. O cache melhora a abertura em conexão
instável, mas **não torna dados meteorológicos recentes totalmente
offline**.

O sistema visual de relatos possui três famílias:

- **marker:** pin no mapa;
- **menu:** símbolo compacto no formulário;
- **notification:** bloco quadrado para alertas.

Símbolo e cor mantêm a mesma semântica entre os três contextos.

------------------------------------------------------------------------

# Supabase Edge Functions

## `glm`

**Objetivo:** obter, filtrar e normalizar atividade elétrica recente.

Entrada típica: janela temporal, `bbox` e limite de eventos.

Tratamento:

1.  consulta a origem;
2.  valida resposta;
3.  filtra por tempo;
4.  filtra pela área;
5.  reduz payload;
6.  normaliza coordenadas/timestamps;
7.  usa cache curto quando apropriado;
8.  retorna JSON/GeoJSON para o mapa.

## `radar`

**Objetivo:** intermediar os produtos MAXCAPPI da REDEMET.

Responsabilidades:

- manter credenciais em secrets;
- consultar produtos;
- selecionar frames;
- normalizar timestamps;
- associar radar, centro e bounds;
- eliminar itens inválidos/duplicados;
- fornecer dados ao mapa e ao `maxcappi-analyze`.

## `maxcappi-analyze`

**Objetivo:** converter imagens MAXCAPPI em células rastreáveis.

``` text
radar
→ PNG
→ decode
→ paleta
→ estimated_dbz
→ componentes conectados
→ células
→ núcleos
→ merge multirradar
→ matching temporal
→ tracking_id
→ movimento
→ qualidade
→ nowcast
```

Modos:

``` text
/functions/v1/maxcappi-analyze
/functions/v1/maxcappi-analyze?lat=...&lon=...&radius=...
```

## `fires`

**Objetivo:** intermediar e normalizar focos térmicos quando a fonte
configurada exige proxy/processamento.

Deve validar coordenadas/horários, filtrar por tempo e área e retornar
apenas campos necessários. O contrato do front-end deve sempre
apresentar o resultado como **detecção térmica**, não confirmação
automática de incêndio.

## `route`

**Objetivo:** desacoplar o navegador do provedor de roteamento.

Entrada lógica:

``` text
from=latitude,longitude
to=latitude,longitude
```

Valida coordenadas, converte para a ordem esperada pelo upstream e
consulta o serviço compatível com OSRM.

Saída normalizada:

- geometria;
- distância;
- duração;
- passos/instruções, quando disponíveis;
- erro legível quando não há rota.

------------------------------------------------------------------------

# Banco, segurança e privacidade

## Relatos

A tabela de relatos deve usar **Row Level Security (RLS)**. Acesso
público deve ser limitado às operações realmente necessárias.

## Estado MAXCAPPI

`moni_maxcappi_state` mantém estado compacto para continuidade do
tracking. Não é um arquivo meteorológico histórico completo.

## Secrets

Nunca coloque no front-end:

- `service_role`;
- tokens privados;
- credenciais REDEMET;
- chaves privadas de provedores.

Secrets ficam nas configurações das Edge Functions do Supabase.

`config.js` deve conter apenas configuração pública compatível com RLS.

## CORS

As Functions acessadas pelo GitHub Pages devem tratar `OPTIONS` e enviar
cabeçalhos CORS adequados.

## Geolocalização

A posição vem da Geolocation API e depende de permissão do navegador. É
usada para centralizar o mapa, analisar o ponto, criar relatos, calcular
rotas e determinar proximidade de alertas. O MONI não precisa publicar
continuamente a localização do usuário.

------------------------------------------------------------------------

# Estrutura

``` text
moni-weather/
├── index.html
├── style.css
├── app.js
├── config.js
├── sw.js
├── manifest.webmanifest
├── METEOCONS-LICENSE.txt
├── assets/
│   └── report-icons-v2/
│       ├── marker/
│       ├── menu/
│       └── notification/
└── supabase/
    └── functions/
        ├── glm/index.ts
        ├── radar/index.ts
        ├── maxcappi-analyze/index.ts
        ├── fires/index.ts
        └── route/index.ts
```

A pasta `supabase/functions` representa a organização recomendada para
versionar o backend. Se os códigos ainda não estiverem públicos no
repositório, esta seção documenta a arquitetura prevista.

| Arquivo                | Função                                           |
|------------------------|--------------------------------------------------|
| `index.html`           | interface, painel, mapa, relatos e navegação     |
| `style.css`            | visual, responsividade, acessibilidade e estados |
| `app.js`               | camadas, dados, risco, comunidade e rotas        |
| `config.js`            | configuração pública do Supabase                 |
| `sw.js`                | cache/PWA/notificações                           |
| `manifest.webmanifest` | instalação do app                                |
| `assets/`              | ícones e recursos visuais                        |

------------------------------------------------------------------------

# Rodando localmente

``` bash
git clone https://github.com/LucasSudati/moni-weather.git
cd moni-weather
python3 -m http.server 8000
```

Abra `http://localhost:8000`.

Não abra o HTML diretamente como `file://`. Service Worker,
geolocalização, módulos e CORS dependem de HTTPS ou `localhost`.

------------------------------------------------------------------------

# Backend próprio

1.  Crie um projeto Supabase.
2.  Configure URL e chave pública em `config.js`.
3.  Crie as tabelas.
4.  Ative RLS.
5.  Cadastre secrets das APIs externas.
6.  Publique `glm`, `radar`, `maxcappi-analyze`, `fires` e `route`.
7.  Teste CORS a partir do domínio do front-end.
8.  Confirme que o JSON retornado corresponde ao contrato usado por
    `app.js`.

Exemplo conceitual:

``` js
window.MONI_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseKey: "SUA_CHAVE_PUBLICA"
};
```

------------------------------------------------------------------------

# Limitações

- fontes externas podem ficar indisponíveis;
- cada sensor/produto possui resolução e latência próprias;
- IMERG pode ter atraso;
- foco térmico não confirma incêndio;
- `estimated_dbz` não é refletividade bruta;
- nowcast é extrapolação de movimento;
- células podem nascer, dissipar, dividir e fundir;
- risco e granizo são heurísticas;
- relatos podem estar errados ou desatualizados;
- rotas podem não conhecer bloqueios recentes;
- notificações dependem do navegador;
- cache PWA não substitui conexão para dados novos.

------------------------------------------------------------------------

# Emergência

Em risco de vida:

- **193 — Bombeiros**
- **192 — SAMU**
- **199 — Defesa Civil**

Siga sempre alertas e orientações oficiais.

------------------------------------------------------------------------

# Roadmap

- [ ] painel de coordenação de pontos de apoio;
- [ ] filtros por tipo e bairro;
- [ ] necessidades por ponto de coleta;
- [ ] fila offline de relatos e sincronização posterior;
- [ ] moderação e proteção contra spam/relatos falsos;
- [ ] documentação SQL;
- [ ] versionamento público das Edge Functions;
- [ ] testes automatizados dos contratos;
- [ ] métricas de validação do nowcast;
- [ ] melhorias contínuas de acessibilidade.

------------------------------------------------------------------------

# Créditos

Dados e serviços: NASA GIBS, NOAA/GOES GLM, REDEMET/DECEA, INMET, INPE,
Open-Meteo, Esri, OpenFreeMap e OSRM, conforme os termos de cada fonte.

Bibliotecas: Leaflet e MapLibre GL JS.

Ícones meteorológicos: **Meteocons**, de Bas Milius, licença MIT. Veja
`METEOCONS-LICENSE.txt`.

## Licença

O código original do **MONI Weather** é disponibilizado sob a **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Isso permite usar, estudar, modificar e redistribuir o software de acordo com os termos da licença. Bibliotecas, ícones, mapas, dados meteorológicos, APIs e outros recursos de terceiros permanecem sujeitos às licenças e aos termos de seus respectivos autores e fornecedores.

Consulte:

- `LICENSE` — licença do código original do MONI Weather;
- `THIRD_PARTY_NOTICES.md` — bibliotecas, dados, mapas, APIs e serviços de terceiros;
- `METEOCONS-LICENSE.txt` — aviso de licença específico dos Meteocons.

Copyright © 2026 Lucas Sudati.

## Autor

Criado por **Lucas Sudati** — <https://github.com/LucasSudati>

------------------------------------------------------------------------
informação veio, quão recente ela é e quais são suas limitações**.

# Third-Party Notices — MONI Weather

Este arquivo identifica bibliotecas, ícones, mapas, dados, APIs e
serviços de terceiros utilizados ou integrados pelo MONI Weather.

A licença principal do código original do MONI Weather é a **GNU Affero
General Public License v3.0 (AGPL-3.0)**. Essa licença não altera nem
substitui as licenças, termos de uso, direitos autorais, requisitos de
atribuição ou políticas dos recursos de terceiros listados abaixo.

> Este documento é informativo e deve ser atualizado quando uma fonte,
> biblioteca, provedor ou forma de integração mudar.

## Bibliotecas e recursos de software

### Meteocons

- Projeto: Meteocons
- Autor: Bas Milius
- Uso no MONI: ícones meteorológicos animados e recursos visuais
  derivados do conjunto Meteocons
- Licença: MIT
- Aviso local: `METEOCONS-LICENSE.txt`
- Projeto oficial: <https://github.com/basmilius/meteocons>

O MONI preserva separadamente o aviso de licença dos Meteocons. Os
ícones permanecem sujeitos à licença MIT e não são relicenciados pela
AGPL do MONI.

### Leaflet

- Projeto: Leaflet
- Uso no MONI: mapa meteorológico principal e camadas geográficas
- Licença: BSD 2-Clause
- Projeto oficial: <https://leafletjs.com/>

A licença do Leaflet se aplica à biblioteca. Tiles, imagens, dados e
serviços exibidos através dela permanecem sujeitos aos termos de seus
respectivos provedores.

### MapLibre GL JS

- Projeto: MapLibre GL JS
- Uso no MONI: visualização das rotas internas em 2D/3D
- Licença: BSD 3-Clause
- Projeto oficial: <https://maplibre.org/>

O nome MapLibre e os nomes de seus contribuidores não devem ser
utilizados para sugerir endosso ao MONI sem autorização.

### OSRM / serviço compatível

- Projeto/protocolo: Open Source Routing Machine (OSRM) ou serviço
  compatível
- Uso no MONI: cálculo da geometria, distância, duração e passos das
  rotas
- Referência: <https://project-osrm.org/>

O MONI utiliza roteamento como serviço externo/intermediado. Os termos
do servidor de roteamento efetivamente utilizado devem ser observados
separadamente da licença do front-end.

## Dados meteorológicos e ambientais

### NASA GIBS / NASA Earthdata

- Uso no MONI: camadas geoespaciais, incluindo produtos de satélite e
  precipitação quando configurados
- Serviço: NASA Global Imagery Browse Services (GIBS)
- Referência:
  <https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs>

Produtos individuais disponibilizados por GIBS podem ter proveniência e
requisitos próprios. A licença AGPL do MONI não se aplica aos dados ou
imagens NASA.

### NOAA / GOES / GLM

- Uso no MONI: atividade elétrica detectada pelo Geostationary Lightning
  Mapper (GLM) e produtos relacionados ao GOES
- Organização: National Oceanic and Atmospheric Administration (NOAA)
- Referência: <https://www.noaa.gov/>

Dados e produtos NOAA permanecem sujeitos às políticas e avisos
aplicáveis da NOAA e de eventuais terceiros. O uso pelo MONI não implica
endosso da NOAA.

### REDEMET / DECEA

- Uso no MONI: produtos meteorológicos/radar, incluindo MAXCAPPI quando
  disponibilizado pela integração
- Organização: Departamento de Controle do Espaço Aéreo (DECEA) /
  REDEMET
- Referência: <https://redemet.decea.mil.br/>

Os dados, imagens, endpoints e serviços permanecem sujeitos às regras e
condições publicadas pela REDEMET/DECEA. Credenciais ou tokens privados
não fazem parte do código público do MONI.

### INMET

- Uso no MONI: avisos meteorológicos oficiais
- Organização: Instituto Nacional de Meteorologia (INMET)
- Referência: <https://portal.inmet.gov.br/>

Os avisos oficiais são apresentados separadamente das estimativas
experimentais do MONI. Dados e avisos permanecem sujeitos às regras da
fonte oficial.

### INPE — Programa Queimadas

- Uso no MONI: focos térmicos/monitoramento de queimadas
- Organização: Instituto Nacional de Pesquisas Espaciais (INPE)
- Serviço: Programa Queimadas
- Referência:
  <https://www.gov.br/pt-br/servicos/obter-dados-de-queimadas>

Uma detecção térmica não é apresentada como confirmação automática de
incêndio. Os dados permanecem sob as condições aplicáveis do serviço de
origem.

### Open-Meteo

- Uso no MONI: variáveis meteorológicas do ponto selecionado e suporte à
  análise experimental de risco
- Serviço: Open-Meteo
- Termos: <https://open-meteo.com/en/terms>

Na API gratuita não comercial, o Open-Meteo declara uso não comercial,
limites de chamadas e dados sob CC BY 4.0. Uma futura implantação
comercial ou com outro perfil de uso deve revisar o plano e os termos
vigentes antes da operação.

## Mapas e dados cartográficos

### OpenFreeMap

- Uso no MONI: mapa base quando configurado
- Serviço: OpenFreeMap
- Referência: <https://openfreemap.org/>

Atribuições exibidas no mapa devem ser preservadas. Os dados
cartográficos e componentes associados permanecem sujeitos aos termos e
licenças indicados pelo provedor e pelas fontes subjacentes.

### OpenStreetMap

Mapas base podem incorporar dados © contribuidores do OpenStreetMap. A
atribuição correspondente deve permanecer visível quando exigida pela
camada utilizada.

- Referência: <https://www.openstreetmap.org/copyright>

### Esri

- Uso no MONI: mapa base/imagens quando configurados
- Organização: Esri
- Referência: <https://www.esri.com/>

Créditos e atribuições fornecidos pela camada devem permanecer visíveis.
Conteúdo Esri não é licenciado pela AGPL do MONI.

## Supabase

- Uso no MONI: banco de dados, APIs e Edge Functions durante a fase de
  desenvolvimento
- Serviço: Supabase
- Referência: <https://supabase.com/>

O uso do serviço hospedado está sujeito aos termos do provedor. O MONI
não concede direitos sobre a plataforma Supabase.

## GitHub / GitHub Pages

- Uso no MONI: hospedagem do repositório e publicação do front-end
  durante a fase de desenvolvimento
- Serviço: GitHub
- Referência: <https://github.com/>

O uso da plataforma está sujeito aos termos do GitHub.

## Separação de licenças

Em resumo:

``` text
Código original do MONI Weather
└── GNU AGPL v3.0

Bibliotecas e ícones de terceiros
├── Meteocons ───── MIT
├── Leaflet ─────── BSD 2-Clause
└── MapLibre GL JS  BSD 3-Clause

Dados, mapas, APIs e serviços
└── permanecem sujeitos aos termos das respectivas fontes/provedores
```

A presença de um recurso neste repositório ou sua exibição pelo MONI
Weather não significa que esse recurso tenha sido relicenciado sob
AGPL-3.0.

## Ausência de endosso

A utilização de nomes, marcas, dados ou serviços de organizações
externas serve apenas para identificar a origem técnica das informações.
Não implica parceria, certificação ou endosso do MONI Weather por essas
organizações.

## Atualizações

Como o MONI Weather está em desenvolvimento, provedores, endpoints e
bibliotecas podem mudar. Antes de uma implantação institucional ou
comercial, os termos atuais de todas as fontes utilizadas devem ser
revisados.

# MONI Weather

**Mapa colaborativo de alerta e apoio para tempestades e catástrofes.**
Junta, numa única tela, o que está acontecendo no céu (satélite, radar, raios) e o que está acontecendo no chão (abrigos, arrecadação, distribuição, estragos), para que a ajuda chegue mais rápido a quem precisa.

**Acesse:** https://lucassudati.github.io/moni-weather/

![MONI Weather: satélite infravermelho, raios, vento e painel de risco](docs/screenshot.jpg)

## Por que existe

O projeto nasceu depois de uma tempestade intensa de granizo, em setembro de 2026, que devastou uma cidade e a região ao redor. Nos primeiros dias, a logística de apoio ficou espalhada em grupos de mensagem, publicações e conversas soltas: quem tem lona, onde receber doações, qual bairro está sem energia, qual rua está bloqueada.

O MONI Weather tenta unificar essa informação em um só lugar, no mapa, e deixá-la fácil de achar por quem ajuda e por quem foi afetado.

## O que ele faz

### 1. Acompanha o tempo em tempo quase real
- **Satélite GOES-19** e **nuvens de tempestade** (infravermelho), com opacidade ajustável
- **Raios** detectados por satélite (GLM)
- **Radar meteorológico** REDEMET, com animação
- **Células de tempestade** com trajetória observada e previsão de 15 a 60 minutos (experimental: extrapola o deslocamento observado)
- **Precipitação**, **vento animado**, **potencial de granizo** e **queimadas** (INPE)
- **Avisos oficiais do INMET** listados no painel
- **Linha do tempo** de observação e previsão para o ponto selecionado

### 2. Traduz os dados em um nível de risco simples
Ao tocar no mapa ou ativar a localização, o app mostra um cartão com o risco no ponto (**baixo, moderado, alto ou muito alto**), com linguagem direta e o que fazer. O nível combina condições atmosféricas (instabilidade, rajadas, precipitação), atividade elétrica próxima e relatos da comunidade.

### 3. Organiza a ajuda no mapa (relatos da comunidade)
Qualquer pessoa pode marcar um relato pelo botão **Reportar**, usando a própria localização ou um ponto no mapa:

| Situação | Exemplos de relato |
|---|---|
| Tempo agora | granizo, tempestade forte, chuva intensa, incêndio |
| Ajuda disponível | abrigo, arrecadação de mantimentos, distribuição de mantimentos, lonas disponíveis, com energia, com água |
| Necessidade | precisa de lona, sem energia, sem água |
| Perigo | árvore caída, poste ou fio caído |

- Cada relato tem ícone e cor próprios e aparece no mapa para todos.
- Os relatos **expiram sozinhos** (de 3 h a 48 h, conforme o tipo) para não deixar informação velha no mapa.
- Quem passa pelo local pode confirmar com **"Ainda vale"** ou **"Não está mais"**; relatos que já não valem saem do mapa.
- **Traçar rota** até um relato, em mapa 2D ou 3D, direto no app.
- **Alertas no dispositivo** (notificações) para avisos próximos.

### 4. Funciona no celular
Interface responsiva e instalável como app (PWA), pensada para uso com uma mão e conexão instável.

## Avisos importantes

- **Este projeto não é um canal oficial** e não substitui a Defesa Civil, o INMET ou qualquer alerta de autoridade.
- As classificações de risco são **estimativas experimentais**.
- Os relatos são **enviados por usuários e não são verificados**.
- Em risco de vida, ligue **193** (Bombeiros), **192** (SAMU) ou **199** (Defesa Civil).
- Nos relatos, não escreva nomes nem telefones.

## Como funciona por dentro

Site estático (HTML, CSS e JavaScript puro), hospedado no GitHub Pages, sem etapa de build.

| Parte | Tecnologia |
|---|---|
| Mapa principal | [Leaflet](https://leafletjs.com/) |
| Navegação de rota 2D/3D | [MapLibre GL JS](https://maplibre.org/) |
| Relatos e funções de servidor | [Supabase](https://supabase.com/) (banco e Edge Functions) |
| App instalável e notificações | Service Worker e Web App Manifest |

```
index.html        estrutura da interface
style.css         estilos
app.js            mapa, camadas, risco, relatos e rotas
config.js         endereços do Supabase
sw.js             cache e notificações
manifest.webmanifest
assets/           ícones de relatos e alertas
```

### Fontes de dados
- Satélite e nuvens: NASA GIBS, GOES-East (ABI)
- Raios: NOAA GOES GLM
- Radar: REDEMET (MAXCAPPI)
- Precipitação: NASA IMERG
- Avisos: INMET
- Focos de queimada: INPE
- Modelo atmosférico do ponto selecionado: Open-Meteo
- Mapa base: Esri e OpenFreeMap

## Rodando localmente

```bash
git clone https://github.com/LucasSudati/moni-weather.git
cd moni-weather
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Por usar service worker e geolocalização, o app precisa ser servido por `localhost` ou HTTPS (abrir o arquivo direto não funciona).

### Usando o seu próprio backend
O front-end aponta para um projeto Supabase definido em `config.js`. Para rodar com o seu:

1. Crie um projeto no Supabase e coloque a URL e a chave pública (anon) em `config.js`.
2. Publique as Edge Functions usadas pelo app: `glm`, `radar`, `maxcappi-analyze`, `fires` e `route`.
3. Guarde as chaves de APIs externas (como a da REDEMET) apenas como *secrets* das Edge Functions, nunca no front-end.
4. Habilite as regras de segurança (RLS) na tabela de relatos.

> O esquema da tabela de relatos e o código das Edge Functions ainda não estão documentados neste repositório.

## Estado do projeto

Em desenvolvimento e em testes. Ideias e prioridades:

- [ ] Painel para coordenação de pontos de apoio (voluntários e prefeitura)
- [ ] Filtros por tipo de relato e por bairro
- [ ] Lista de necessidades por ponto de coleta
- [ ] Modo offline para relatos sem sinal
- [ ] Moderação e proteção contra relatos falsos

## Como contribuir

Sugestões, bugs e melhorias são bem-vindos: abra uma *issue* ou um *pull request*. Quem atua em Defesa Civil, voluntariado ou logística de apoio e quiser ajudar a validar o que o mapa deveria mostrar é especialmente bem-vindo.

## Créditos e licenças

- Ícones animados: [Meteocons](https://github.com/basmilius/meteocons), de Bas Milius (licença MIT), veja `METEOCONS-LICENSE.txt`
- Dados: NASA, NOAA, REDEMET, INMET, INPE, Open-Meteo, Esri e OpenFreeMap, sob os termos de cada fonte
- Licença do código deste projeto: a definir

Criado por [@LucasSudati](https://github.com/LucasSudati).

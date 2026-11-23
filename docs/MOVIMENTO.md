# Movimento da Home (versão 11.1)

Especificação que guiou a implementação (16–17/11/2026), escrita a partir do estudo do código dos sites
da Happy Web (movefitness, patosites, cantu, baronimplementos, rfccriobrilhante, tupapb) e de três
propostas independentes (público, assinatura por seção, engenharia/Elementor). Depois de implementada,
passou por uma revisão independente em quatro frentes (motor JS, CSS, especificação/gosto, estrutura/
Elementor); os 39 achados confirmados foram corrigidos. **Onde o código diverge do texto abaixo, vale o
que está em "Ajustes depois da revisão", no fim deste arquivo.**

---

# ESPECIFICAÇÃO FINAL: movimento da Home do Instituto Happy Web (v11)

Arquivos que mudam (todos em `C:/dev/sites/Instituto Happy Web/instituto-happyweb-v11/src/`):
- `index.html`: só **classes novas**. Nenhum elemento novo e nenhum texto alterado.
- `css/style-global.css`: tokens, keyframes, estados de entrada, botões, cabeçalho, painel, voltar ao topo e rodapé.
- `css/estilos.css`: um bloco por seção.
- `js/preferencias.js`: liga o movimento antes da primeira pintura e arma a trava de segurança.
- `js/funções-global.js`: "7. Movimento", numa IIFE própria **no topo do arquivo**. O módulo 4 ganha o anel de progresso e a sombra do cabeçalho.
- Atualizar as frases "a página fica parada" no cabeçalho do `estilos.css`, no `README.md` e em `docs/PONTO-DE-PARADA.md`.

Base: a margem de ~10% já está no CSS (`--margem: 10vw` a partir de 48rem; `clamp(1.25rem, 6vw, 2rem)` no celular). Os prints da pasta "Versão 11" são de **antes** dela. A 1440 px o conteúdo passou de 1200 para 1152 px. Os atalhos ficam 5 numa linha a partir de ~1200 px de janela, e os eixos a partir de ~1360 px. A 1280 px os eixos ficam 3+2. Com Texto maior em 1440 px, os eixos também ficam 3+2.

## Direção em seis linhas
1. A abertura fica parada no texto: o título é lido no primeiro segundo, como nos 6 sites da agência. Quem dá vida à abertura é a foto.
2. Cada seção tem uma ideia de movimento só dela. **Cinco seções têm efeito que acompanha a rolagem**: abertura (a foto fica para trás), Quem somos (o ponto rosa orbita), Primeiros passos (a trilha se desenha), Transparência (a luz atravessa) e Contato (a cortina abre até a borda). **Quatro não têm**: atalhos, eixos, inclusão digital e rodapé.
3. As entradas são **em cascata dentro do bloco de texto**, com atrasos que crescem de cima para baixo, então nenhum texto passa por cima de outro. Os cartões entram em escada **por fileira real**.
4. Os hovers mudam conforme o tipo de elemento. Em quatro seções, o botão "acorda" o desenho da própria seção (via `:has`).
5. **Zero elemento novo no HTML**: tudo é feito com classes e pseudo-elementos. Isso vale igual no Elementor, sem widget HTML e sem container vazio.
6. JavaScript: um IntersectionObserver para as entradas e um único laço `requestAnimationFrame` para a rolagem. O JS escreve **variáveis numéricas** em elementos pequenos, e o CSS decide o visual. Sem biblioteca.

---

## 1. Tokens de movimento

Colar no `:root` do `style-global.css`. `--passar` e `--curva` continuam como estão.

```css
:root {
  /* tempos */
  --mov-hover: 650ms;    /* hover que move ou enche (botão, cartão, ícone, seta) */
  --mov-lavar: 750ms;    /* cor do eixo escorrendo */
  --mov-foto: 1600ms;    /* foto que se aproxima no hover (token aprovado na 7.4) */
  --mov-toque: 150ms;    /* :active; ao soltar volta no tempo normal do elemento */
  --mov-entra: 1100ms;   /* deslocamento das entradas */
  --mov-aparece: 750ms;  /* opacidade das entradas: o texto fica nítido antes de parar */
  --mov-banner: 1300ms;
  --mov-brota: 800ms;    /* ícone e ponto que brotam */
  --mov-traco: 900ms;    /* faixa do eixo */
  --mov-anel: 1600ms;    /* anel da marca se desenhando */
  --mov-assenta: 2000ms; /* foto da abertura ao carregar */
  --mov-onda: 1200ms;    /* halo único (pino, "A seguir") */
  /* curvas */
  --curva-entra: cubic-bezier(0.5, 1, 0.89, 1);      /* entradas: a curva da onda dos eixos aprovada na 7.2 */
  --curva-traco: cubic-bezier(0.65, 0, 0.35, 1);     /* linhas e anel que se desenham */
  --curva-pouso: cubic-bezier(0.34, 1.36, 0.64, 1);  /* passa ~5% e volta: SÓ ícone, ponto, check e pino */
  /* distâncias em px: com "Texto maior" cresce a letra, não o percurso */
  --dist-texto: 56px; --dist-cartao: 64px; --dist-marco: 48px; --dist-banner: 56px; --dist-lado: 0px;
  /* passos de sequência (o JS lê daqui) */
  --passo-texto: 100ms; --passo-cartao: 120ms; --passo-icone: 100ms; --passo-marco: 150ms;
}
@media (min-width: 48rem) { :root { --dist-texto: 72px; --dist-cartao: 96px; --dist-marco: 64px; --dist-banner: 80px; } }
@media (min-width: 64rem) { :root { --dist-lado: 64px; } }
```

Regras de tempo:
- **Hovers** ficam entre 500 e 750 ms; foto 1600 ms. Nada de hover abaixo de 500 ms. A única exceção é o `:active` de 150 ms, que é retorno de toque.
- **Entradas**: deslocamento de 1100 ms e opacidade de 750 ms, com `--curva-entra`. Cartões: 1100 ms. Banner: 1300 ms.
- **Rolagem** não tem duração: usa suavização exponencial corrigida pelo tempo de cada quadro:
  - `atual += (alvo − atual) × (1 − (1 − f)^(dt/16,667))`, com `dt ≤ 64 ms`;
  - `f = 0,08` nas fotos, na órbita, na luz e na cortina (95% do caminho em ~0,6 s);
  - `f = 0,12` na trilha (~0,4 s).
  - O mapeamento posição → valor é sempre linear.
- **A curva expo fica proibida.** A `--curva-pouso` nunca vai em texto, cartão ou foto.

Atrasos em sequência:
- **Texto**: 100 ms por item na ordem do DOM, entre itens da mesma seção que entram no mesmo lote. No máximo 4 passos (400 ms).
- **Cartões dos eixos**: 120 ms por coluna dentro da fileira real (máximo 480). Somam +200 ms se a cabeça da seção entrou no mesmo lote. Teto total: 600 ms.
- **Ícones dos atalhos**: 100 ms por coluna. Na primeira tela começam 150 ms depois de o script iniciar.
- **Marcos da trilha**: 150 ms por coluna, só no computador.
- **Faixa de cor do eixo**: atraso do cartão + 350 ms.
- **Marca**: disco 0, ponto 300, anel 600.
- **Checks**: círculo em 300, 600 e 900 ms; traço do check em 500, 800 e 1100 ms.
- **Pino**: 700 ms; a onda sai em 1500 ms.
- **Links do painel**: 60 ms cada (máximo 240); o botão do painel em 300 ms.
- **Convite do A+**: 1800 ms depois de abrir.
- Em coluna única (celular, Texto maior) não há escada: cada item entra sozinho, na sua vez.
- **Nenhum texto espera mais de 400 ms depois do próprio gatilho.**

---

## 2. Seção por seção

Convenção: o "gatilho" é o elemento cruzar 90% da altura da tela (`rootMargin: 0px 0px -10% 0px`). Toda transformação de hover vale também para `:focus-visible`. Hover que desloca ou escala só existe em `@media (hover: hover) and (pointer: fine)`. Tudo o que move fica dentro de `@media (prefers-reduced-motion: no-preference)`.

### 2.1 Botões (família única, todas as seções)
- **Entrada**: nenhuma própria. O botão entra como um item da cascata do bloco de texto em que está.
- **Rolagem**: nenhum efeito.
- **Hover/foco: "preenchimento orgânico"**. Um círculo nasce do canto de baixo à esquerda e enche o botão. O texto nunca troca de cor, de lugar nem de rótulo.
  ```css
  .botao { position: relative; isolation: isolate; overflow: hidden;
           transition: background-color var(--passar) var(--curva), color var(--passar) var(--curva),
                       border-color var(--passar) var(--curva), scale var(--passar) var(--curva); }
  .botao::before { content: ""; position: absolute; z-index: -1; left: 20%; top: 100%; width: 300%;
                   aspect-ratio: 1; border-radius: 50%; background: var(--botao-enche);
                   translate: -50% -50%; scale: 0; pointer-events: none;
                   transition: scale var(--mov-hover) var(--curva); }
  /* hover (mouse) e :focus-visible → .botao::before { scale: 1 } */
  .botao:active { scale: .97; transition-duration: var(--mov-toque); }
  .botao:active::before { scale: 1; transition-duration: var(--mov-toque); }
  ```
  O `overflow: hidden` não corta o `outline` do próprio botão, então o anel de foco continua inteiro.
- **`--botao-enche` por variante**:
  - `.botao--primario`: `var(--petroleo-profundo)`. Branco sobre ele dá 11:1.
  - `.botao--claro`: `var(--petroleo-claro)`. Petróleo-escuro sobre ele dá ~6,8:1.
  - `.botao--contorno`: `var(--petroleo-claro)`. A borda vai de tinta para `--petroleo` em 500 ms e o texto continua tinta (~15:1). **Substitui** o hover atual, que enche de tinta e troca o texto para branco.
  - `.botao--contorno-claro`: `rgba(255,255,255,.16)`, com a borda indo a `--branco`. Na abertura dá ~7,2:1.
  - `.transparencia .botao--contorno-claro`: `var(--petroleo-profundo)`, com borda `--branco`. Branco 16% sobre o petróleo derrubaria o contraste para ~4:1.
- As trocas de `background` dos `:hover` atuais (`.botao--primario:hover` etc.) passam a valer **só** dentro de `@media (prefers-reduced-motion: reduce)`.
- **Celular**: sem hover. No `:active`, o preenchimento entra em 150 ms e o botão vai a `scale .97`.

### 2.2 Cabeçalho e flutuantes
- **Entrada**: nenhuma. O cabeçalho existe desde o primeiro quadro e nunca some.
- **Rolagem**:
  - Com `scrollY > 8`, o cabeçalho ganha `.cabecalho--rolado`. Aparece então uma sombra por camada: `.cabecalho::after`, absoluto em `top: 100%`, com altura `1.5rem`, `linear-gradient(rgba(11,63,66,.10), transparent)`, opacidade 0→1 em 500 ms e `pointer-events: none`.
  - A altura e o tamanho da marca não mudam. O fio de baixo atual fica.
  - **Voltar ao topo**: ganha um anel de progresso da página inteira, o padrão dos 6 sites da agência.
    ```css
    .voltar-topo::before {
      content: ""; position: absolute; inset: 4px; border-radius: 50%;
      background: conic-gradient(var(--branco) calc(var(--progresso, 0) * 360deg), rgba(255,255,255,.25) 0);
      mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2.5px));
      /* repetir com -webkit-mask */
    }
    ```
    O anel é informação, não enfeite, por isso vale também com "menos movimento".
  - O botão aparece subindo: `translate: 0 16px` → 0, com opacidade, em 500 ms (a regra de "depois de uma tela rolada" continua).
- **Hover/foco**:
  - **Links do menu**: o traço de 3 px continua nascendo da esquerda, mas **sai pela direita**. Na base fica `transform-origin: right`; no hover, `left`. Duração 600 ms.
  - **"A+ Texto maior"**: `.botao-texto__a` com `display: inline-block` vai a `scale 1.15` em 500 ms, e a borda escurece (já existe).
  - **Clique em qualquer `[data-texto-maior]`**: todos os `[data-texto-sinal]` dão um pulo de confirmação (`scale` 1 → 1,3 → 1, 600 ms, `--curva-pouso`). A classe `.pulou` sai no `animationend`.
  - **Menu** (só `.botao-menu:not(.botao-menu--fechar)`): os dois traços se afastam ±2 px (`translate` em `::before` e `::after`), 500 ms.
  - **"Falar com o Instituto"**: família dos botões.
  - **Voltar ao topo**: o svg sobe 4 px (500 ms) e o fundo escurece (já existe).
  - Nenhum hover na marca.
- **Painel do menu**:
  - Abre com opacidade em **300 ms** (hoje são 200).
  - Os links `li` sobem 24 px com opacidade, 500 ms, `--curva-entra`, com atrasos de 0/60/120/180/240 ms pelo `:nth-child`. `.painel__falar` entra em 300 ms.
  - Fecha em 200 ms, sem animar os itens.
  - Só dentro de `no-preference`. Não depende de `html.mov`.
- **Celular**: "A+" e "Menu" respondem ao `:active` com `scale .94` em 150 ms.

### 2.3 Abertura
- **Entrada**:
  - Selo, título, subtítulo, os 2 botões e "Letra pequena?" ficam **parados e visíveis** desde a primeira pintura. É o padrão dos 6 sites e protege o LCP.
  - Só a foto **assenta**. A regra `html.mov .abertura__foto img { scale: 1.06 }` vale antes do JS. O JS adiciona `.assenta` a `.abertura__foto` quando a imagem carrega, ou na hora se `img.complete`. Então roda `animation: mov-assenta var(--mov-assenta) var(--curva-entra) backwards`, com `@keyframes mov-assenta { from { scale: 1.06 } }`.
  - `transform-origin` da foto: `65% 45%` a partir de 64rem e `50% 40%` abaixo. A opacidade fica sempre em 1.
  - **Convite do A+**:
    - O JS adiciona `.convite` a `.letra` só se o Texto maior estiver desligado e se `sessionStorage['ihw-convite']` não existir (com try/catch); depois grava a chave. Resultado: uma vez por sessão.
    - CSS: `.letra.convite .letra__a::after { animation: mov-halo 1400ms var(--curva) 1800ms 2 }`.
    - O halo é um anel branco de 2 px (`box-shadow: 0 0 0 2px rgba(255,255,255,.6)`), `scale` 1→1,7 e opacidade .6→0.
- **Rolagem: "a foto fica para trás"**:
  - Classes `hw-segue hw-segue--foto` em `.abertura__foto`, que ganha `overflow: hidden`.
  - CSS: `.abertura__foto img { translate: 0 calc(var(--foto-y, 0) * 1px); }`.
  - O JS escreve `--foto-y = min(amp × clamp(scrollY / dist, 0, 1), max(0, scrollY − 1))`.
  - Parâmetros no CSS da própria `.abertura__foto`:
    - `--segue-amp: 120; --segue-dist: 480` a partir de 64rem;
    - `96` / `400` entre 48 e 64rem;
    - `64` / `320` abaixo de 48rem.
  - A trava `≤ scrollY − 1` garante que o vão que abre em cima fique **sempre atrás do cabeçalho fixo e opaco**, mesmo com a suavização atrasada ao subir rápido ("Voltar ao topo"). Sem escala extra: o enquadramento aprovado fica intacto.
  - O degradê `::after` não se move, e o texto não tem efeito de rolagem.
- **Hover/foco**:
  - Botões da família.
  - `.letra`: `.letra__a` vai a `scale 1.12` e mostra um halo fixo (`::after` em `scale 1.3`, opacidade .45), em 600 ms. O sublinhado de 1→2 px já existe.
- **Celular**: valores menores (acima). `.letra__a` responde ao `:active` com `scale .94`.

### 2.4 Atalhos "O que você procura?"
- **Entrada**:
  - Cartões, nomes e o título ficam **sempre visíveis**: são o menu da Home e, no computador, estão na primeira tela.
  - Só os ícones brotam: classes `hw-entra hw-entra--icone` em cada `.atalho__icone`. Antes, `opacity: 0; scale: .6`. Na entrada, `scale` e opacidade em 800 ms com `--curva-pouso`, atraso de 100 ms por coluna (máximo 400).
- **Rolagem**: nenhum efeito. O que serve para navegar não se mexe.
- **Hover/foco: "o cartão se solta da borda e o ícone se enche de água"**:
  - `.atalhos__lista li:hover > .atalho, .atalho:focus-visible { transform: translateY(-8px) }`, com `transition: transform var(--mov-hover) var(--curva)`. O hover fica no `li` parado, para não tremer na borda de baixo (defeito que ele já viu).
  - A sombra maior vem de uma camada, sem animar `box-shadow`:
    - `.atalho { position: relative }`;
    - `.atalho::after { content:""; position:absolute; inset:0; border-radius:inherit; box-shadow: 0 1.75rem 3rem rgba(11,63,66,.28); opacity:0; pointer-events:none; transition: opacity var(--mov-hover) var(--curva) }`;
    - hover: `opacity: 1`.
  - Ícone:
    - `.atalho__icone { position: relative; overflow: hidden; isolation: isolate }`;
    - `.atalho__icone::before { content:""; position:absolute; inset:0; z-index:-1; background: var(--petroleo); translate: 0 101%; transition: translate 600ms var(--curva) }`;
    - hover: `translate: 0 0`; a cor do ícone vai a branco em 400 ms, com 150 ms de atraso.
  - O fundo `--petroleo-suave` do círculo não muda (é a água que enche).
  - **Substitui** o `.atalho:hover` atual (−4 px e troca de `box-shadow`) e o `.atalho:hover .atalho__icone`. Os dois ficam só para `reduce`, sem o `transform`.
  - O anel de foco atual (`outline` + `box-shadow` branco de 9 px) continua.
- **Celular**: 2 por linha (1 por linha em 320 px ou com Texto maior). Cada ícone brota quando a sua linha entra. No `:active`, a água enche em 150 ms e o cartão vai a `scale .98`.

### 2.5 Quem somos
- **Entrada**:
  - `.rotulo`, `.titulo-secao`, `.quem-somos__corpo` e `.botao` recebem `hw-entra hw-entra--texto`: cascata de 72 px (56 no celular) com 100 ms entre os itens.
  - `.quem-somos__marca` recebe `hw-entra hw-entra--marca`. A marca se monta:
    - **disco**: `scale` .86→1 com opacidade, 1200 ms, `--curva-entra`;
    - **ponto rosa**: pousa no anel vindo de fora (`scale` 1,2→1 em torno do centro da marca, mais opacidade), 800 ms, `--curva-pouso`, atraso de 300 ms;
    - **anel fino**: se desenha a partir do ponto, como se o ponto o traçasse. Usar `@property --arco { syntax:'<angle>'; inherits:false; initial-value:360deg }` com `mask: conic-gradient(from var(--arco-inicio, 0deg), #000 var(--arco), transparent 0)` (mais `-webkit-mask`), indo de 0 a 360° em 1600 ms, `--curva-traco`, atraso de 600 ms. O JS grava `--arco-inicio` com o ângulo atual do ponto no momento da entrada.
    - Só animar o anel se `CSS.registerProperty` existir; o JS põe `html.mov-arco`. Sem isso, o anel aparece inteiro.
- **Rolagem: "o ponto rosa orbita o anel"**:
  - `.quem-somos__marca` também recebe `hw-segue hw-segue--orbita`.
  - O `::after` atual (ponto preso em right/bottom) passa a ser o ponto que gira em volta do centro da marca:
    ```css
    .quem-somos__marca::after { right:auto; bottom:auto; left:50%; top:calc(1px - .85rem); width:14%;
      translate:-50% -50%; transform-origin:50% calc(407.14% + .85rem - 1px);
      rotate: calc(133.5deg + var(--orbita, 0) * var(--orbita-amp, 140deg)); }
    ```
    O `407.14%` é 50% + 357,14% (= metade da marca ÷ 14%). Assim o centro de giro é exatamente o centro da marca, em qualquer largura e com Texto maior.
  - Para a pouso da entrada valer em torno do mesmo centro, o `scale` do ponto usa esse mesmo `transform-origin`.
  - O JS escreve `--orbita = p − 0,5` no próprio `.quem-somos__marca`, com p na **travessia** da marca: 0 quando o topo dela entra por baixo, 1 quando a base sai por cima.
  - `--orbita-amp`: `140deg` a partir de 48rem (~525 px de arco num círculo de 400 px) e `100deg` abaixo (~230 px).
  - 133,5° é o lugar desenhado hoje. Sem JS, e com a marca no meio da tela, o ponto está exatamente onde está nos prints. O disco e o logo não giram.
- **Hover**: só o botão (família). A marca não reage ao mouse: não é link.
- **Celular**:
  - A marca fica abaixo do texto e tem gatilho próprio.
  - `.quem-somos { overflow-x: clip }` sem `hidden` de reserva (o `hidden` transformaria a seção em caixa de rolagem).
  - Conta feita para 320 px com Texto maior: o ponto chega a ~151 px do centro, e a borda da tela está a 160 px. Fica dentro.

### 2.6 Cinco eixos
- **Entrada**:
  - Cabeça: `.eixos__cabeca .rotulo`, `.eixos__cabeca .titulo-secao` e `.eixos__texto` entram em cascata (`--texto`).
  - Cada `.eixos__lista > li` recebe `hw-entra hw-entra--cartao` e sobe 96 px (64 no celular) com opacidade, 1100/750 ms. Os atrasos seguem a fileira real: 0/120/240/360/480 com os 5 lado a lado; em 3+2 a segunda fileira recomeça do 0. Somam +200 ms se a cabeça entrou no mesmo lote, com teto de 600.
  - Quando o cartão assenta, a faixa de cor se desenha da esquerda para a direita:
    - antes: `html.mov li:not(.entrou) .eixo::before { scale: 0 1; transform-origin: left }`;
    - depois: `.entrou .eixo::before { animation: mov-faixa var(--mov-traco) var(--curva-traco) calc(var(--atraso,0ms) + 350ms) backwards }`.
    - As cinco cores correm como uma régua.
- **Rolagem**: nenhum efeito. É a grade de leitura mais densa.
- **Hover/foco: "a cor do eixo escorre da faixa"**. O cartão **não sobe** (subir é dos atalhos).
  - `.eixo { isolation: isolate }`;
  - `.eixo::after { content:""; position:absolute; inset:0; z-index:-1; background: color-mix(in srgb, var(--cor-eixo) 9%, var(--branco)); scale: 1 0; transform-origin: 50% 0; transition: scale var(--mov-lavar) var(--curva); pointer-events:none }`;
  - hover: `scale: 1 1`.
  - `.eixo__icone`: o fundo vai para `var(--cor-eixo)` e o ícone fica branco, 500 ms.
  - O "›" de "Saiba mais" avança 6 px em 650 ms. Para isso, `.eixo__mais::after` passa a `content:"›"; display:inline-block; margin-left:.25em`. O sublinhado passa a terminar em "mais".
  - **Tirar** o `transform`, o `box-shadow` do `.eixo:hover` e a `transition` de transform do `.eixo`.
  - Contraste conferido: petróleo sobre a lavagem mais escura (eixo 5) dá ~4,9:1; texto-2 dá ~7,6:1.
- **Celular**: um cartão por vez, sem escada; a faixa se desenha do mesmo jeito. No `:active`, a lavagem aparece em 150 ms.

### 2.7 Inclusão digital (banner)
- **Entrada: "a janela se abre"**:
  - `.tecnologia__banner` recebe `hw-entra hw-entra--banner`. **Nunca fica invisível**: a opacidade é sempre 1.
  - A partir de 64rem: `@keyframes mov-janela { from { translate: 0 var(--dist-banner); clip-path: inset(0 min(4%, 2.75rem) round var(--raio-grande)); } to { clip-path: inset(0 round var(--raio-grande)); } }`, em 1300 ms, `--curva-entra`. O recorte (≤ 46 px) é menor que o padding do texto (56 px), então não corta letra.
  - Abaixo de 64rem: só `translate` de 80 px (tablet) ou 56 px (celular).
  - A lista recebe `hw-entra hw-entra--checks` e tem gatilho próprio. O texto dos itens fica visível o tempo todo; só os checks se marcam:
    - `li` com `position: relative`; `li::before` vira **só o círculo** (cor de fundo, sem a imagem);
    - `li::after` absoluto (`left:0; top:0; 1.75rem × 1.75rem`) leva a imagem do ✓ que hoje está no `::before`;
    - círculo: `scale` .4→1 com opacidade, 500 ms, `--curva-pouso`, em 300/600/900 ms;
    - traço do ✓: `clip-path: inset(0 100% 0 0)` → `inset(0)`, 450 ms, `--curva-traco`, em 500/800/1100 ms.
- **Rolagem**: nenhum efeito.
- **Hover/foco**:
  - Botão claro (família).
  - `.tecnologia__banner:has(.botao:hover, .botao:focus-visible) .tecnologia__foto img { scale: 1.06 }`, com `transition: scale var(--mov-foto) var(--curva)` e `transform-origin: 45% 40%`. O convite aproxima a cena.
- **Celular**: o banner vai de ponta a ponta e só sobe 56 px. Checks iguais.

### 2.8 Primeiros passos (trilha)
- **Entrada**:
  - Cabeça (`.rotulo`, `.titulo-secao`, `.passos__intro`) em cascata.
  - O primeiro `.marco__ponto` recebe `hw-entra hw-entra--icone` e brota de .7 a 1.
  - Cada `.marco__texto` recebe `hw-entra hw-entra--marco`: 64 px (48 no celular), 150 ms por coluna, só no computador.
  - `.passos__fim > p` e o `.botao` entram em cascata.
  - **O texto nunca espera a linha.**
- **Rolagem: "a trilha se percorre"** (catraca: depois de desenhada, não apaga):
  - `.trilha` recebe `hw-segue hw-segue--trilha`. O JS escreve `--traco` (0 a 1) em cada `.marco` que tem linha (1º e 2º).
  - Desenho por **recorte**, nunca por escala (o tracejado não estica), com ponta arredondada:
    - a partir de 64rem: `.marco::after { clip-path: inset(0 calc((1 - var(--traco, 1)) * 100%) 0 0 round 2px) }`;
    - abaixo de 64rem: `inset(0 0 calc((1 - var(--traco, 1)) * 100%) 0 round 2px)`.
  - A partir de 64rem (`--segue-modo: tela; --segue-de: .85; --segue-ate: .45`): p vai de 0 a 1 enquanto o topo da trilha passa de 85% para 45% da tela. Trecho 1 = `clamp(2p)`; trecho 2 = `clamp(2p − 1)`.
  - Abaixo de 64rem (`--segue-modo: linha; --segue-linha: .70`): "linha de leitura" a 70% da tela. O trecho i vai do pé do ponto i ao topo do ponto i+1, e o progresso é `(0,70 × vh − topo do trecho na tela) ÷ altura do trecho`.
  - **Pontos 2 e "A seguir" começam apagados**, e só com `html.mov`:
    - ponto 2: `scale .82`, fundo `--petroleo-suave`, ícone petróleo;
    - "A seguir": `scale .82` e contorno `--petroleo-claro`.
  - Quando o trecho anterior chega a 0,98, o ponto recebe `.aceso`: `scale 1` em 700 ms (`--curva-pouso`) e as cores certas em 600 ms. O "A seguir" acende com um halo único: `.marco__ponto::after`, anel de 3 px, `scale` 1→1,5, opacidade .4→0, 1200 ms.
  - Segurança: se a trilha ficar inteira na tela por 1200 ms sem a linha completa, o alvo vai a 1 e a linha termina sozinha.
- **Hover/foco**:
  - Botão contorno (família).
  - `.passos:has(.passos__fim .botao:hover, .passos__fim .botao:focus-visible) .marco:nth-child(2)::after { animation: mov-tracejado 1200ms var(--curva-traco) }`: o tracejado anda **um período** em direção ao "A seguir" (`background-position` +20 px na horizontal, +16 px na vertical) e termina idêntico. É uma vez por passagem, sem laço.
  - Os marcos não são links e não reagem ao mouse.
- **Celular**: trilha vertical, pontos e halo iguais, textos sem escada.

### 2.9 Transparência (faixa petróleo)
- **Entrada**:
  - A partir de 64rem: par lateral, a única entrada lateral da Home. `.transparencia__texto` recebe `hw-entra hw-entra--esq` (vem de −64 px) e o `.botao` recebe `hw-entra hw-entra--dir` (vem de +64 px). Entram juntos, 1100/750 ms.
  - Abaixo de 64rem, `--esq` e `--dir` viram cascata vertical: o bloco em 0 e o botão em 100 ms.
- **Rolagem: "a luz atravessa"**:
  - A seção recebe `hw-segue hw-segue--luz`. As duas faixas saem do `background-image` e viram `::before` (faixa larga) e `::after` (faixa fina).
  - Cada faixa é um paralelogramo: `position:absolute; inset-block:-10%; transform: skewX(-25deg)`, com fundo branco em **alfa dobrado** (12% e 8%) e `opacity: .5`. Assim o repouso fica igual ao de hoje.
  - Posição a meia altura, para reproduzir os 115° atuais. A 1440 × ~280 px: faixa larga de ~61% a ~74% da largura; faixa fina de ~76% a ~94%.
    - Fórmula: a parada f do degradê cai em `x = 50% + (f − 0,5) × L ÷ 0,906`, com `L = 0,906·W + 0,423·H`.
    - Ajustar `left`/`width` por ponto de quebra, sobrepondo a captura atual (diferença ≤ 4 px).
  - O movimento usa a propriedade `translate`, separada do `skewX`:
    - `.transparencia::before { translate: calc(var(--luz, 0) * var(--luz-a)) 0 }`;
    - `.transparencia::after { translate: calc(var(--luz, 0) * var(--luz-b)) 0 }`.
  - Amplitudes: `--luz-a: 120px; --luz-b: -72px`, e `64px` / `-40px` abaixo de 48rem.
  - O JS escreve `--luz = 2p − 1` na seção (p = travessia da seção).
  - `.transparencia { position: relative; overflow: hidden; overflow: clip; isolation: isolate }` e `.transparencia__dentro { position: relative; z-index: 1 }`. O texto nunca se move com a rolagem.
- **Hover/foco**:
  - Contorno-claro, que aqui escurece com petróleo-profundo.
  - `.transparencia:has(.botao:hover, .botao:focus-visible)::before, ::after { opacity: 1 }` em 750 ms: as faixas acendem.

### 2.10 Contato e conexões
- **Entrada**:
  - `.rotulo`, `.titulo-secao`, `.contato__corpo`, `.botao` e `.contato__sede` em cascata (0 a 400 ms). A sede entra na cascata para o botão, ao subir, não passar por cima do endereço.
  - `.contato__pin` recebe `hw-entra hw-entra--pino`: cai de −40 px com opacidade, 900 ms, `--curva-pouso`, atraso de 700 ms. Ao pousar, solta uma onda única: `::after` com anel petróleo de 2 px, `scale` 1→1,9, opacidade .5→0, 1200 ms, aos 1500 ms.
- **Rolagem: "a foto se estende até a borda da tela"** (catraca):
  - `.contato__foto` recebe `hw-segue hw-segue--cortina` e ganha `position: relative; overflow: hidden`.
  - Cortina na cor do papel: `.contato__foto::after { content:""; position:absolute; inset:0; background: var(--papel); translate: calc(var(--cortina, 1) * 101%) 0 }`. Ela desliza para a direita.
  - Ao mesmo tempo a foto assenta: `.contato__foto img { scale: calc(1.1 - .1 * var(--cortina, 1)); transform-origin: 0 50% }`.
  - O progresso é medido pelo topo da foto na tela: de 100% a 55% (`--segue-de: 1; --segue-ate: .55`), e até 60% abaixo de 64rem.
  - Antes do JS, `html.mov .contato__foto { --cortina: 0 }`. Sem JS, o valor padrão 1 deixa a foto aberta.
- **Hover/foco**:
  - Botão primário (família).
  - `.contato__texto:has(.botao:hover, .botao:focus-visible) .contato__pin { transform: translateY(-8px) }`, com `transition: transform 800ms var(--curva-pouso)`. O pino se levanta enquanto o convite está ativo; usa `transform`, que não briga com o `translate` da entrada.
- **Celular**: o texto fica em cima e a foto embaixo, de ponta a ponta, com a mesma cortina. Pino igual.

### 2.11 Rodapé
- **Entrada**:
  - Só o fio da base. `.rodape__base` recebe `hw-entra hw-entra--fio`, e o `border-top` atual vira `::before` (1 px, `rgba(255,255,255,.18)`), que vai de `scale: 0 1` a 1 a partir da esquerda, em 1400 ms, `--curva-traco`.
  - Colunas, endereço e links ficam sempre visíveis.
- **Rolagem**: nenhum efeito.
- **Hover/foco**:
  - **Links do menu**: `.rodape__menu li:hover > a` (e `a:focus-visible`) desliza 10 px com `translate`, 600 ms. Um traço `a::before` (absoluto, `left: -10px`, 8 × 2 px, `--petroleo-claro`, `scale: 0 1` → 1 a partir da esquerda) se desenha onde o texto estava. A cor vai para petróleo-claro em 500 ms. O sublinhado do hover atual fica só para `reduce`.
  - **"Falar com o Instituto"** (`.rodape .link--solto`): o sublinhado vai de 2 para 4 px e o `text-underline-offset` de .22 para .32em, em 500 ms.
- **Celular**: o `:active` troca a cor em 150 ms; nada se move.

---

## 3. Arquitetura

### 3.1 Ligar sem flash e sem esconder nada se o JS falhar
- **`preferencias.js`** (no `<head>`, antes do CSS) põe `mov` no `<html>` só quando **todas** estas condições valem:
  - `matchMedia('(prefers-reduced-motion: no-preference)').matches`;
  - `'IntersectionObserver' in window`;
  - `CSS.supports('translate', '0 1px')`;
  - o endereço **não** tem `?estatico`.

  Depois arma `setTimeout(2500)`, que tira `mov` se `mov-pronto` não existir. Tudo em try/catch.
- **Módulo 7**:
  - Começa com `if (!raiz.classList.contains('mov')) return;` e, logo em seguida, adiciona `mov-pronto`.
  - Corpo inteiro em try/catch; no catch, remove `mov`.
  - Fica numa IIFE **no topo** do `funções-global.js`: um erro nos módulos 0–6 interrompe o resto do script, mas não o movimento. O módulo 7 escuta sozinho os cliques de `[data-texto-maior]`, sem depender do módulo 1.
- **Estados escondidos** existem só em `@media screen and (prefers-reduced-motion: no-preference) { html.mov ... }`. Na impressão, com menos movimento ou sem JS, tudo aparece.
  - O `beforeprint` remove as variáveis em linha (repouso).
  - Reforço: `html.mov .hw-entra:not(.entrou):focus-within { opacity:1; translate:none }`.
- **Estados de repouso sem JS** são os valores padrão das variáveis: `--foto-y` 0, `--orbita` 0 (133,5°), `--traco` 1 com os pontos acesos, `--luz` 0 e `--cortina` 1 (aberta).

### 3.2 Entradas (classes, CSS por keyframes)
- **Tipos**:
  - `hw-entra--texto`, `--cartao`, `--marco`: escondem com `opacity:0; translate: var(--de-x,0) var(--de-y)`, onde `--de-y` é a `--dist-*` do tipo;
  - `--esq` / `--dir`: `--de-x: ∓var(--dist-lado)`; abaixo de 64rem viram `texto`;
  - `--icone`: `opacity:0; scale:.6` (o ponto da trilha usa .7);
  - `--banner`, `--marca`, `--checks`, `--pino`, `--fio`: regras próprias, descritas acima.
- **Entrada por `animation`, nunca por `transition`.** Assim o atraso da escada não vaza para o hover, e o `transition` dos botões não é sobrescrito.
  ```css
  @keyframes mov-desloca { from { translate: var(--de-x,0) var(--de-y,0); } }
  @keyframes mov-surge   { from { opacity: 0; } }
  html.mov .hw-entra--texto.entrou { animation:
    mov-desloca var(--mov-entra) var(--curva-entra) var(--atraso,0ms) backwards,
    mov-surge var(--mov-aparece) var(--curva-entra) var(--atraso,0ms) backwards; }
  html.mov .mov-ja, html.mov .mov-ja *, html.mov .mov-ja::before, html.mov .mov-ja::after,
  html.mov .mov-ja *::before, html.mov .mov-ja *::after { animation: none !important; }
  ```
- **Separação de propriedades** (nada briga):
  - entrada: `translate` / `scale` / `opacity` / `clip-path`, por animation;
  - rolagem: variáveis → `translate` / `rotate` / `scale` / `clip-path` nas peças internas e pseudos;
  - hover: `transform` (ou `scale` / `translate` num **filho** ou **pseudo**).
  - A entrada fica no `li` ou no item; o hover fica no `a` de dentro.
- **JS**:
  - Um IntersectionObserver com `rootMargin '0px 0px -10% 0px'` e `threshold 0`.
  - A cada lote:
    - itens `texto`: agrupar pela seção (`closest('section, footer, nav')`) e ordenar pelo DOM; `--atraso = min(i, 4) × passo-texto`;
    - itens `cartao` / `icone` / `marco`: agrupar pelo pai e por fileira (`top` arredondado, tolerância de 8 px), ordenar por `left`; `--atraso = min(base + coluna × passo, 600)`, com `base = 200` se houver texto da mesma seção no lote;
    - pôr `.entrou` e fazer `unobserve`;
    - na marca, gravar `--arco-inicio`.
  - **Partida**: o que está inteiro acima da tela recebe `.entrou.mov-ja`. O que está na tela (`top < vh`) entra na hora, com 150 ms de base.
  - **Durante a rolagem** (a cada 250 ms):
    - o que ficou inteiro acima da tela sem ter entrado (arraste da barra, salto) recebe `.entrou.mov-ja`;
    - se `scrollY + vh ≥ scrollHeight − 4`, tudo o que está pendente e visível entra. Os itens no último 10% da página nunca cruzariam a linha de gatilho.
  - `focusin` num item pendente (`target.closest('.hw-entra:not(.entrou)')`): `.entrou.mov-ja`.
  - Na carga com `#âncora` e no `hashchange`: tudo acima do alvo recebe `.entrou.mov-ja`.
  - `beforeprint`: tudo entra.

### 3.3 Laço de rolagem (rAF único)
- **Palcos**: `.hw-segue` com `hw-segue--foto|orbita|trilha|luz|cortina`. Os parâmetros (`--segue-amp`, `--segue-dist`, `--segue-de`, `--segue-ate`, `--segue-modo`, `--segue-linha`, `--orbita-amp`) ficam **no CSS, com os media queries**. O JS lê com `getComputedStyle` só ao medir.
- **Medir**:
  - `topo` = soma de `offsetTop` pela cadeia de `offsetParent` (ignora transform, então a escala da entrada não atrapalha); `altura = offsetHeight`;
  - `vh = document.documentElement.clientHeight`;
  - na trilha, guardar também a posição dos `.marco__ponto`.
  - Medir na partida, no `load`, em `document.fonts.ready`, no `resize` (debounce de 150 ms; no toque, ignorar mudança só de altura menor que 150 px, que é a barra do navegador), num ResizeObserver no `body` (por rAF) e 2 rAF depois do clique no Texto maior.
- **Fórmulas** (y = `scrollY`):
  - **topo** (foto): ver 2.3;
  - **travessia** (órbita, luz): `p = clamp((y + vh − topo) / (vh + altura))`;
  - **tela** (cortina, trilha no computador): `p = clamp((de·vh − (topo − y)) / ((de − ate)·vh))`;
  - **linha** (trilha no celular): ver 2.8;
  - **catraca**: `alvo = max(alvo, máximo anterior)`.
- **Laço**:
  - O scroll (passivo) só marca que há trabalho e liga o rAF.
  - O rAF calcula com as medidas em cache: lê só `scrollY`, **nunca** `getBoundingClientRect`.
  - Suaviza com a fórmula dos tokens.
  - Escreve a variável **no palco** (`el.style.setProperty('--orbita', v.toFixed(4))`) só quando muda ≥ 0,0005 (ou 0,1 px).
  - Dorme quando tudo convergiu e não houve scroll nos últimos 150 ms.
  - Na partida e depois de âncora, `atual = alvo` (sem suavizar).
  - Um IntersectionObserver por palco (`rootMargin 25% 0px`) liga e desliga cada efeito e põe `.segue-ativo`. Só sob essa classe o CSS aplica `will-change` às peças que se movem. Isso também dá CSS à classe `hw-segue`, que o `validar.py` cobra.
- **Modo leve**: se `navigator.connection?.saveData`, a rolagem fica desligada (repouso) e as entradas continuam.
- **Módulo 4** (vale também com menos movimento): no mesmo scroll passivo, por rAF, `--progresso = scrollY ÷ (scrollHeight − clientHeight)` (com `scrollHeight` em cache) em `.voltar-topo`, mais `.cabecalho--rolado`.

### 3.4 Menos movimento (`prefers-reduced-motion: reduce`)
- **Fica imediato e estático**:
  - nada começa escondido (`mov` nunca é posto);
  - todos os efeitos de rolagem ficam no repouso: foto parada, ponto rosa em 133,5°, anel inteiro, trilha completa com pontos acesos, faixas no meio, cortina aberta;
  - sem assentar da foto, sem convite e sem pulo do A+;
  - os links do painel não animam;
  - os hovers não têm deslocamento, escala, máscara nem tracejado andando.
- **Continua**: as trocas de cor, fundo, borda e sublinhado em 500 ms (os `:hover` atuais, com o preenchimento virando troca de fundo direta), a sombra do cabeçalho sem transição, o anel de progresso do topo e o foco.
- **Mudança com a página aberta** (`matchMedia` `change`, com `addListener` como reserva): tirar `mov`, marcar tudo `.entrou.mov-ja`, parar o laço e limpar as variáveis em linha.

### 3.5 Texto maior
- As distâncias e amplitudes são em px e não crescem. A órbita é calculada em % + rem, então acompanha sozinha.
- O clique recalcula a geometria (2 rAF e `fonts.ready`) e a escada usa a fileira real. As container queries mudam as colunas (eixos 3+2 em 1440 com Texto maior).
- As entradas não se repetem. O sinal A+/A− dá o pulo de confirmação.
- Testar em 320 e em 1280 px com Texto maior.

### 3.6 Teclado
- Todo hover tem par em `:focus-visible`, inclusive os ligados por `:has(.botao:focus-visible)`.
- O anel de foco atual (rosa-profundo, branco nos fundos escuros, e o duplo dos atalhos) não é animado nem coberto: as camadas novas ficam em `z-index: -1` ou têm `pointer-events: none` e miolo transparente.
- Um item escondido aparece na hora quando recebe foco (`focusin` e `:focus-within`).
- O `scroll-padding-top` atual continua.

### 3.7 Sem rolagem lateral
- `overflow` só nas peças:
  - `.abertura__foto` e `.contato__foto`: `hidden`;
  - `.tecnologia__banner`: já tem;
  - `.transparencia`: `hidden` e depois `clip`;
  - `.quem-somos`: `overflow-x: clip`.
- **Nunca** no `html` ou no `body`: prenderia o cabeçalho sticky.
- **Nunca** na `.abertura`: os atalhos avançam para a seção de baixo.
- A entrada lateral só existe a partir de 64rem, dentro da seção cortada.

### 3.8 Celular fraco
- O que anima continuamente usa só `translate`, `rotate`, `scale` e `opacity`.
- `clip-path` só em entradas únicas ou peças pequenas: banner (uma vez), trilha (4 px), checks (28 px). A máscara do anel roda uma vez.
- Sombras por opacidade de camada, nunca transição de `box-shadow`. Sem `filter` e sem blur.
- Um observador de entrada (com `unobserve`), um laço que dorme e variáveis escritas em elementos pequenos.
- Meta: 60 fps com a CPU 4× mais lenta.

### 3.9 Capturas
`?estatico` desliga o movimento para as capturas de página inteira e o PDF. **A prova do movimento é vídeo.**

---

## 4. Elementor (widgets nativos + Código personalizado)

**Nativo:**
- Layout com widgets nativos, mantendo as **classes do protótipo**, como o README já prevê. As classes `hw-entra*` e `hw-segue*` vão em Avançado → Classes CSS, sem precisar do campo Atributos.
- Cabeçalho: Efeitos de movimento → Fixo: topo, com deslocamento de efeitos de 8 px. A sombra serve tanto para `.elementor-sticky--effects` quanto para `.cabecalho--rolado`.
- Voltar ao topo: o bloco padrão da agência (Progress Tracker circular + ícone), **sem** o Motion FX de translateY 3,4 e sem animação de entrada. Mostrar pela classe `.visivel` do módulo 4. Alternativa: o anel em CSS deste protótipo.
- Trocas de cor no hover com a duração de transição nativa de 0,5 s.
- Painel do celular: Off-canvas ou Popup com Fade de 0,3 s.

**Não usar:**
- **Animação de entrada**: põe `.elementor-invisible`, deixa a página em branco sem JS, desloca 100% da altura e só tem 0,75/1,25/2 s. Conferir que o modelo institucional não traz nenhuma configurada.
- **Animação de hover**: 0,3 s, rápida demais para ele.
- **Efeitos de rolagem do Motion FX**: medem velocidade e não px, não fazem catraca e continuam com "menos movimento". Se alguém usar mesmo assim, incluir `@media (prefers-reduced-motion: reduce) { .elementor-motion-effects-element, .elementor-motion-effects-layer { transform: none !important } }`.

**Código personalizado (Pro):**
- `<head>`, prioridade alta: `preferencias.js` (Texto maior + `mov` + trava).
- Fim do `<body>`: `funções-global.js` com o módulo 7.
- CSS: `style-global.css` + `estilos.css` no CSS do Kit.

**Seletores a adaptar ao markup do Elementor:**
- Botão: classes de variante no widget; preenchimento em `.botao .elementor-button` (`position:relative; isolation:isolate; overflow:hidden; ::before`).
- Atalho: cada atalho num container-célula (o "li"). O hover fica na célula e o `transform` no widget (com markup otimizado não existe `.elementor-widget-container`). Água no `.elementor-icon` da Caixa de ícone.
- Eixo: faixa e lavagem nos pseudos do widget com a classe `eixo`.
- Checks: a lista inteira num Editor de texto com `ul.lista-check` (o CSS vale igual).
- Trilha: três containers `.marco`; as linhas são `::after`, e o JS escreve `--traco` neles.

**Avisos:**
- Nos **containers**, o `::before` é a camada de "Sobreposição de fundo" do Elementor. Onde o projeto usa pseudo de container (`.transparencia`, `.abertura__foto`, `.contato__foto`, `.quem-somos__marca`), não configurar sobreposição e declarar todas as propriedades (`content`, `inset`, `background`, `opacity`, `transition`). Se ainda conflitar, levar o pseudo para um widget Imagem interno.
- Os kits da agência têm `overflow-x: hidden` em `html` e `body`. Trocar por `overflow-x: clip` só no `body`, ou manter, já que o sticky do Elementor é fixo por JS.
- O vão da foto da abertura só fica escondido se o cabeçalho for opaco e estiver acima da abertura. Se ficar transparente sobre ela, pôr `--segue-amp: 0`.
- O `validar.py` precisa aceitar as classes `hw-*` (todas têm CSS). A cópia do conversor da Pneus Ballan precisa preservá-las.
- Pontos de quebra 1023/1099/1199 batem com 64/68,75/75 rem; os valores de celular estão em 48rem.

---

## 5. Descartes (o que ficou de fora e por quê)

**Proposta 1:**
- Título subindo sozinho sobre o parágrafo parado: texto passaria por cima de texto. Trocado pela cascata com atrasos crescentes, que nunca sobrepõe.
- Curva nova `--curva-chegada`: já existe a curva aprovada `(0.5, 1, 0.89, 1)`.
- Tracejado andando em laço enquanto o mouse está no botão: proibido laço. Ficou um passo por passagem (Proposta 3).
- Ponto rosa andando +20° no hover do botão: brigaria com o giro da rolagem. A marca responde só à rolagem.
- Título subindo de novo dentro do banner: seriam dois movimentos encaixados.
- Halo do A+ a cada carga: ficou uma vez por sessão.
- Lift da logo no hover: sem função.

**Proposta 2:**
- Marca do cabeçalho encolhendo ao rolar: o cabeçalho é o ponto fixo; trocar o tamanho é um pulo sem função.
- Foto da abertura escurecendo com a rolagem: camada extra, e "escurecer pela rolagem" está no que evitar do estudo.
- Cortina do Contato por `clip-path` reversível: repinta uma foto grande a cada quadro e fecha de novo ao subir. Ficou a cortina por `translate`, com catraca (Proposta 1).
- Hover em coisas que não são link (foto do banner, pontos da trilha): sugere clique. Só o botão acorda a cena.
- Lavagem dos eixos por `clip-path` de baixo para cima: repinta. Ficou a escala vertical a partir da faixa (Proposta 1).

**Proposta 3:**
- Cartões dos atalhos escondidos e subindo na carga: abriria um buraco no menu principal na primeira tela. Só os ícones brotam.
- Sobra de escala calculada (1,10 a 1,22) e paralaxe nas três fotos: muda o enquadramento aprovado e repete o mesmo efeito três vezes.
- Trilha reversível e textos esperando a linha: faria conteúdo sumir e depender da rolagem.
- Contorno enchendo de tinta com o texto virando branco: cinza ilegível no meio da transição.
- Preenchimento varrendo da esquerda (scaleX): reto e mecânico. Ficou o círculo que nasce do canto (o "preenchimento orgânico" da v7).
- Entrance Animation nativa com a keyframe trocada: mantém `.elementor-invisible` e cria dois motores.
- Colunas do rodapé entrando: o endereço deve estar lá na hora, e o fim da página pode nunca cruzar a linha de gatilho.
- Modo leve por número de núcleos: ficou só `saveData`.

**Mais de uma proposta:**
- Contorno-claro com branco 16% na faixa da Transparência (Propostas 1 e 2): contraste de ~4:1. Ali o botão escurece com petróleo-profundo.

---

## 6. Riscos e testes

**Riscos (e o que fazer):**
1. **"Cara de demonstração"** (são 5 efeitos de rolagem e muitas entradas). Ordem de corte, sem tocar nas outras assinaturas: convite do A+ → luz da Transparência → foto da inclusão no hover → pino se levantando.
2. **Sutil demais.** Subir primeiro as amplitudes de rolagem: foto 120→160 px, órbita 140→180°, luz 120→160 px. Na luz, antes de aumentar o percurso, subir o tom de 6%/4% para 9%/6%. Só por último mexer nas distâncias de texto (72 px já está acima dos 40–50 px que ele reprovou).
3. **JS falho ou lento.** Títulos podem ficar até 2,5 s invisíveis numa rede ruim. Parágrafos de cartão, a abertura, os atalhos, a sede e o rodapé nunca dependem disso.
4. **Âncora, arraste da barra e fim da página.** Cobertos pelas regras "acima da tela = visto sem animação" e "fim da página = revela".
5. **Vão da foto da abertura.** Depende do cabeçalho opaco e da trava `y ≤ scrollY − 1`.
6. **Rolagem lateral em 320 px com Texto maior** (ponto em órbita, faixas, entrada lateral, fotos): as peças têm `overflow`; medir.
7. **A `--curva-pouso` parecer desenho animado.** Só em peças de até 72 px.
8. **Suporte de navegador.** Sem `translate`/`scale`/`rotate` individuais, o movimento nem liga. Sem `@property`, o anel aparece inteiro. Sem `:has()`, a cena não acorda. Sem `overflow: clip`, vale o `hidden` declarado antes. Em todos os casos o resultado é parado e completo.
9. **Margem de 10%.** Vale a partir de 768 px; no celular está em 6vw (~23 px a 390 px). Avisar o cliente: 10% no celular apertaria a letra grande.
10. **Prints velhos.** São de antes da margem: refazer tudo com `?estatico`.

**Como testar** (Edge invisível via CDP, perfil absoluto, teclado por Tab real, vídeo com o ffmpeg do Remotion):
1. **Sem JS** (`Emulation.setScriptExecutionDisabled`): a captura de página inteira deve ser igual à de `?estatico` (diferença de pixels ≈ 0).
2. **JS atrasado 4 s** (interceptar `funções-global.js`): aos 2,5 s, `html.mov` sai e tudo aparece. Quando o script chega, nada volta a esconder e nada se move.
3. **Menos movimento** (`Emulation.setEmulatedMedia`, `prefers-reduced-motion: reduce`):
   - sem `html.mov`;
   - durante a rolagem e os hovers, `document.getAnimations()` só tem transições de cor;
   - `getComputedStyle(...).transform` fica `none` no hover.
4. **Inventário das entradas** em 1440×900 e 390×844, rolando 100 px a cada 100 ms até o fim:
   - registrar quando cada `.hw-entra` recebe `.entrou`;
   - conferir duração, atraso e curva pelo `getAnimations()` contra a tabela da seção 1;
   - no fim, `document.querySelectorAll('.hw-entra:not(.entrou)').length === 0`.
5. **Primeira tela**: captura 100 ms depois do DOMContentLoaded, em 1440 e 390. Abertura e cartões dos atalhos inteiros; só os círculos dos ícones podem estar brotando.
6. **Rolagem lateral**: `scrollWidth === clientWidth` a cada 100 ms durante a rolagem, em 320, 390, 768, 1024, 1280 e 1440 px, com e sem Texto maior.
7. **CLS**: a soma do `PerformanceObserver('layout-shift')` deve ser 0.
8. **fps**: `Emulation.setCPUThrottlingRate` 4, em 390 px, rolando a 1000 px/s. Registrar os quadros por rAF: ≥ 90% devem ficar ≤ 20 ms, e nenhuma tarefa longa (> 50 ms) do módulo 7.
9. **Vão da abertura**: rolar até 800 px, clicar em "Voltar ao topo" e gravar. A faixa de pixels logo abaixo do cabeçalho, na área da foto, nunca pode ficar lisa na cor petróleo-profundo.
10. **Ângulos e linhas**:
    - com a marca centrada na tela, o ponto rosa fica a 133,5° ± 2° (sobrepor o print 01);
    - a trilha fica completa com o topo a 45%;
    - no celular, a ponta da linha fica a ±8 px da linha dos 70%;
    - `--traco` e `--cortina` nunca diminuem ao subir;
    - a cortina fica toda aberta com o topo da foto a 55% (60% no celular).
11. **Teclado**: Tab real da primeira à última parada. Para cada `document.activeElement`: opacidade 1 nele e em todos os ancestrais, dentro da tela e fora de baixo do cabeçalho.
12. **Contraste no meio do hover**: em cada variante de botão, nos eixos 3 e 5 e na faixa da Transparência, pausar as animações na metade (`getAnimations()`, `pause`, `currentTime = duração/2`) e medir o texto: ≥ 4,5:1.
13. **Tremor**: mouse a 2 px da borda de baixo de um atalho por 2 s; o `transform` amostrado deve ficar constante.
14. **Texto maior no meio da página**: nenhuma entrada se repete; órbita, trilha e luz recalculadas dois quadros depois.
15. **Material para ele aprovar**:
    - vídeos de rolagem contínua em 1440 e em 390 px (~500 px/s, com pausa de 1,5 s em cada seção);
    - um vídeo com Texto maior e um com menos movimento;
    - closes dos hovers: cada tipo de botão, atalho, eixo, links do menu e do rodapé, A+ e as quatro cenas acordadas pelo botão;
    - capturas novas com `?estatico`.

    Ele avalia movimento por vídeo, não por print.


---

## Ajustes depois da revisão (valem sobre o texto acima)

- **Botões:** o círculo do preenchimento tem `width: calc(160% + 2.5rem)` (não 300%) e a curva é a
  `--curva-traco` (simétrica): o botão fica cheio em ~400–450 ms, e encher e esvaziar têm o mesmo ritmo.
  Usa `transform` (não `scale`/`translate` soltos), para não aparecer parado em navegador antigo.
- **Peças que usavam `translate`/`rotate`/`scale` soltos fora do movimento** (água dos atalhos, lavagem
  dos eixos, ponto rosa, traço do rodapé, círculo dos botões) passaram a `transform`. A **cortina** do
  Contato só existe com `html.mov-segue`: sem o motor de rolagem, a foto está sempre aberta.
- **Saída de emergência no JS:** `desistir()` limpa os números escritos em linha, mostra o que faltava e
  tira as classes; os laços (observadores, rolagem, quadros) rodam dentro de `seguro()`.
- **Linha de gatilho** sobe acima do aviso de privacidade enquanto ele cobre a base da tela (celular).
- **Teclado:** item focado ainda no atraso da escada recebe `.mov-ja` (ele e os que o contêm).
- **Foto da abertura:** longe da tela volta a 0; ao voltar, ou num salto maior que uma tela, vai direto ao
  valor certo (nunca abre vão sob o cabeçalho).
- **Partida:** trilha e cortina que já estão na tela começam completas; entradas da primeira tela, o
  assentar da foto e o convite do A+ esperam o primeiro quadro visível (aba em segundo plano).
- **Convite do A+:** só quando o botão está inteiro à vista, abaixo do cabeçalho e acima do aviso.
- **Tracejado da trilha:** desenho de um período por repetição (sem emenda); a passagem é disparada por
  `.anda` (JS, ao passar o mouse ou focar o botão) e termina inteira mesmo se o mouse sair.
- **Pino do Contato:** a queda começa depois que o endereço (o pai) entrou, herdando o atraso dele.
- **Banner:** um keyframe só (`mov-janela`, com `--janela-recorte`/`--janela-raio` por tela): a entrada
  não recomeça ao girar o tablet.
- **Transparência:** posições das faixas por faixa de tela (reproduzem o degradê aprovado); percurso maior
  (96/−60, 160/−96 e 200/−120 px); as faixas só "acendem" no hover a partir de 64rem; com "menos
  movimento", o botão escurece com petróleo profundo (contraste).
- **Hovers que deslocam ou escalam** só em `(hover: hover) and (pointer: fine)`; os que trocam cor do
  ícone também (no toque nada fica "grudado"). Pares em `:focus-visible` para o A+ e o Menu.
- **iOS:** um ouvinte vazio de `touchstart` no topo do `funções-global.js` (sem ele o Safari não aplica
  o `:active`).
- **Menu do celular:** fecha desbotando em 200 ms, já fora do teclado e do clique (`inert`).
- **Traço do menu** nasce e recolhe pela esquerda (a saída pela direita dava um salto em passagens rápidas).
- **Elementor:** células `atalhos__item`/`eixos__item` no HTML (o Elementor não tem `li`);
  `:has(.botao :focus-visible)` nas cenas (o link focado fica dentro da peça com a classe); o anel da
  marca e as faixas da Transparência declaram `width/height: auto`, `opacity`, `transition` e
  `mix-blend-mode` (o `::before` de um container é a "Sobreposição de fundo"); `.hw-segue` tem valores
  padrão e a trilha guarda os parâmetros em `.hw-segue--trilha`.
- **Margem e grades:** `--margem: 6vw` a partir de 48rem (foi 10vw na 11.1) e `--largura: 80rem`; menu
  completo a partir de 78rem; atalhos 5 numa linha com o contêiner ≥ 60rem; eixos 3+2 com o contêiner ≥
  48rem e 5 lado a lado ≥ 68rem.

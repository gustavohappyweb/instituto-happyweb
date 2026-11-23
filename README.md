# Instituto Happy Web — versão 11.2 (Home nova com movimento, margem lateral larga e fotos novas, para aprovação)

**18/11/2026 · desenvolvimento local · NÃO publicado.**

**18–19/11/2026 — páginas internas (pedido: "faça o resto do site").** Em `src/html/`: `o-instituto`,
`atuacao` (âncoras dos 5 eixos que a Home usa), `cursos-e-tutoriais` (`#tutoriais`), `transparencia`,
`contato`, `privacidade` e `404`. Textos da versão 9 (aprovados ou propostas já revisadas), sem inventar
dado: o que falta aparece como "será publicado depois de conferido". Visual no vocabulário da Home 11.2:
abertura escura terminando no arco aprovado, círculo com o ícone do cartão da Home, cartão "Nesta página"
mordendo o arco, uma composição própria por seção, faixa petróleo no fim. CSS: `paginas.css` (peças
comuns) + um arquivo por página (`o-instituto.css`, `atuacao.css`...). `.lista-check` e
`.etiqueta--clara` passaram do `estilos.css` para o `style-global.css`. Fotos ilustrativas Pexels já com
crédito (instituto-equipe, eixo-*, cursos-turma, tutoriais-celular, transparencia-documentos,
contato-conversa; `?v=p1`). Contato SEM formulário: os canais oficiais não existem ainda e a página diz
isso. Cache das internas: `?v=11.2i2` (Home `?v=11.2f10`).
Revisão independente em 4 frentes (conteúdo, código/acessibilidade, celular/tablet, links/movimento) e
correções: nada promete canal de contato, curso, certificado ou documento que não existe; sem linha de
CNPJ; Transparência compacta no celular; pílulas do "Nesta página" com seta (são links); um só desconto
do cabeçalho ao pular para uma seção; sem rolagem lateral; aviso de privacidade fala em "preferências de
uso" (Home também). Conferido: 0 link/âncora quebrado, todas as entradas animam (rolagem real), 0
rolagem lateral em 390/820/1440, também com "Texto maior". Prints: `..\Prints\Versão 11.2 - Páginas internas (para aprovação)`.
**Decisões do cliente pendentes nas internas:** canal oficial de contato (os botões "Falar com o
Instituto" levam a uma página que diz que os canais serão divulgados); se a sede recebe público (rodapé
"Onde estamos"); fotos de banco perto do nome das RFCC; link para o site da Happy Web em O Instituto;
"em seu nome" no aviso do eixo 03; foto do eixo Esporte (só futebol); "Em preparação" ou "Planejados";
cursos pela internet; endereço do Moodle; CNPJ, composição da Diretoria/Conselho e documentos;
revisão jurídica da Política de privacidade; caminhos absolutos da 404 na hospedagem. Zip antes: `..\Checkpoints\Projeto - versão 11.2 antes das páginas internas - 2026-11-18.zip`.

**18/11/2026 — inclusão digital: arco no lugar do degradê e do corte seco — APROVADO ("Aprovado").** Ele achou o corte seco
"dois retângulos lado a lado" e pediu recorte assimétrico, discreto, sem degradê nem blur, e pessoas menos
apertadas. Feito: a foto termina num arco (`clip-path: ellipse`), na borda de baixo quando fica em cima
(celular, tablet e notebook até 1439 px) e na borda esquerda quando fica ao lado (a partir de 1440 px);
saiu também o degradê de baixo do celular/tablet. Lado a lado só a partir de 90 rem (antes 64): abaixo
disso a coluna ficava estreita e alta e a moça de amarelo sumia (achado da revisão independente). Foto em
cima: 16:9 no tablet e 2:1 no notebook, `object-position: 45% 20%`; lado a lado `45% 40%`;
de 1600 px a foto ganha mais largura (colunas 1fr / 1.2fr). Resolução: o `sizes` dizia 600 px e o
navegador ampliava a foto até 1,8x; agora `sizes` 1000 px no computador e arquivos 1800/2400 px novos
(original 3200 px) — medido sem ampliação de 390 a 1920 px.

**18/11/2026 — linha velha acima da abertura ao voltar ao topo:** era a sombra do cabeçalho
(`.cabecalho::after`, 24 px) com transição de opacidade; o navegador mantinha uma faixa antiga da página.
A sombra agora aparece/some sem transição (teste de rolagem ida e volta no Edge: faixa limpa).

**18/11/2026 — inclusão digital: corte seco entre o petróleo e a foto (a pedido: o degradê largo
"parecia névoa").** No computador saiu o degradê de 40% sobre a foto (`.tecnologia__foto::after`
com `content: none`); a foto começa nítida onde termina o petróleo. Posição: `52% 40%` até 1199 px e
`45% 40%` de 1200 px para cima (as duas mulheres e o tablet). Celular e tablet mantêm o degradê de baixo.
Testadas 4 saídas na página real (atual, corte seco, degradê curto, borda de 48 px); as duas com
degradê curto ainda faziam uma faixa embaçada. Antes/depois em
`..\Prints\Versão 11.2 - Fotos novas (para aprovação)\4 - Inclusão digital - transição antes e depois.jpg`.

**18/11/2026 — fotos novas (pedido: "Quero imagens melhores!").** Foram mostradas folhas com a foto
atual e opções do Pexels (`..\Prints\Fotos novas - opções (para escolher)`) e ele escolheu **D, C, C**:
abertura = grupo rindo ao ar livre (pexels 8117545), inclusão digital = mulher mostrando o tablet a uma
senhora (pexels 11284052), contato = três mulheres conversando com notebooks (pexels 6457492). Os recortes
WebP têm os mesmos nomes e tamanhos de antes; nos endereços das fotos entrou `?v=f1` e no CSS/JS
`?v=11.2f2`. Depois de uma revisão independente do enquadramento em 6 larguras (390 a 1920 px): abertura com
recortes por caixa (computador sem a mulher cortada na borda esquerda, `object-position: 78% 10%`;
tablet e celular mais fechados nas duas mulheres, sem mão solta); inclusão digital ajustada depois com o corte seco (nota acima); contato em `80% 45%` de 64 a 75 rem e `100% 45%` acima.
Em 1024–1199 px a coluna da foto da inclusão é estreita e mostra só a senhora com o tablet (limite
do layout, não da foto). Recortes gerados por `fotos_v12.py` + `fotos_v12b.py` (pasta temporária). Ponto de restauração antes da troca:
`..\Checkpoints\Projeto - versão 11.2 antes das fotos novas - 2026-11-18.zip`.

**18/11/2026 — margem lateral do computador maior (a pedido, em vários passos: "preciso de ainda menos"
→ "quero uns 3-4% mais" → … → "aumente mais um pouco").** Hoje: celular `clamp(1.25rem, 6vw, 2rem)`;
tablet `3.78vw`; computador (64 rem+) `max(175px, 3.78vw)`, ou seja, no mínimo 175 px de cada lado.
`--largura` foi para 120 rem, então quem limita o conteúdo é a margem. Com essa margem o menu completo do
cabeçalho só cabe numa linha a partir de 88 rem (~1410 px); abaixo disso aparece o botão "Menu".

**17/11/2026 — a 11.3 foi recusada e esta 11.2 foi restaurada.** A 11.3 ("refinamento visual": atalhos em faixa-índice no pé da abertura, Quem somos em forma de carta sem o círculo, eixos em índice 01–05) foi vista pelo dono e recusada ("não gostei. volta para a última versão"). Os arquivos voltaram, byte a byte, ao zip `..\Checkpoints\Projeto - versão 11.2 antes do refinamento visual - 2026-11-17.zip`; só o `?v=` dos endereços do CSS/JS mudou para `11.2r` (para nenhum navegador reaproveitar arquivos da 11.3). A 11.3 está guardada em `..\Checkpoints\Projeto - versão 11.3 recusada (antes de voltar à 11.2) - 2026-11-17.zip` e o material dela em `..\Prints\Versão 11.3 - Refinamento visual (para aprovação)`.

**11.2 (17/11/2026), a pedido:** "gostei, porém preciso de menos preenchimento nas laterais". A margem
lateral passou de ~10% para ~6% da tela (do tablet para cima) e o conteúdo pode ir até 1280 px (antes
1200): em 1440 px sobram 86 px de cada lado (eram 144). O movimento é o mesmo da 11.1.

A versão 10 ("a carinha do logo em pedaços") foi recusada ("ficou horrível"). A versão 11 volta ao
**vocabulário dos sites da Happy Web** (Move, Pato Sites, Cantu, Baroni, RFCC, TUPA): abertura com
foto, atalhos que avançam sobre a seção seguinte, cartões, banner escuro com foto, faixa de cor e
fechamento com foto até a borda. Cada seção tem a forma que o conteúdo pede, sem repetir fórmula,
com letra grande e caminhos óbvios, pensando nas voluntárias de mais idade das Redes Femininas de
Combate ao Câncer.

**11.1 (16–17/11/2026), a pedido:** "padding de uns 10% apenas nas laterais, deixe com mais respiro" e
"adicione animações e hover diferentes, animações de scroll". A margem lateral passou a ~10% da tela
(do tablet para cima; na 11.2 baixou para ~6%) e a Home ganhou movimento de rolagem e hovers próprios de cada seção — lento,
suave e claramente perceptível, sem rolagem presa, sem cursor personalizado e sem biblioteca. A
abertura nunca esconde texto, e sem JavaScript, impresso ou com "menos movimento" a página fica parada
e completa. Detalhes em `docs/MOVIMENTO.md`.

As versões anteriores ficaram intactas (`..\instituto-happyweb-v10`, `..\instituto-happyweb-novo`,
`..\Projeto`, `..\instituto-happyweb-versao-anterior`). A v11 antes do movimento está no zip
`..\Checkpoints\Projeto - versão 11 Home nova - 2026-11-16.zip`.

## Abrir

```bash
python -m http.server 5544 --bind 127.0.0.1 --directory "C:/dev/sites/Instituto Happy Web/instituto-happyweb-v11"
```

Endereço: `http://localhost:5544/src/index.html` (no Claude Code: configuração
`instituto-happyweb-v11`). Abrir `src/index.html` direto (duplo clique) também funciona.
`http://localhost:5544/src/index.html?estatico` abre sem movimento (usado nas capturas e no PDF).

## A Home, seção por seção

| Seção | Forma | Movimento (rolagem · hover) |
|---|---|---|
| Abertura | Foto à direita fundindo no petróleo; título, dois botões e o "A+" explicado em palavras ("Letra pequena? Aumente o texto do site aqui") | O texto fica parado; a foto assenta ao carregar e "fica para trás" ao rolar · o "A+" ganha um halo (e um convite, uma vez por visita) |
| Atalhos | "O que você procura?" + 5 cartões brancos com ícone que começam no petróleo e terminam no branco | Os ícones brotam · o cartão sobe e o círculo do ícone se enche de petróleo, como água |
| Quem somos | Texto oficial + a marca inteira desenhada num círculo claro | Texto em cascata; a marca se monta (o ponto rosa traça o anel) e o ponto orbita conforme a rolagem |
| Eixos | 5 cartões com a cor de cada eixo (5 lado a lado; 3+2 centralizados; 2; 1) | Cartões em escada e a faixa de cor se desenha · a cor do eixo "escorre" e lava o cartão; a seta avança |
| Inclusão digital | Banner escuro arredondado com foto e os três cuidados dos tutoriais | A "janela" se abre e os checks se marcam um a um · o botão aproxima a foto |
| Primeiros passos | Trilha: dois pontos "Em preparação" ligados por linha cheia, um "A seguir" por linha tracejada (vertical no celular) | A linha se desenha com a rolagem e acende os pontos · o botão faz o tracejado andar até o "A seguir" |
| Transparência | Faixa petróleo com recortes diagonais suaves | Texto vem da esquerda e botão da direita; as faixas de luz atravessam com a rolagem · o botão acende as faixas |
| Contato | Metade texto (com o endereço da sede), metade foto até a borda da tela | Uma cortina abre a foto com a rolagem; o pino cai e pousa · o botão levanta o pino |
| Comum | Cabeçalho, botões, menu do celular, voltar ao topo, rodapé | Sombra no cabeçalho ao rolar; botões se enchem de cor; anel de progresso no "voltar ao topo"; links do rodapé deslizam |

## Estrutura (padrão de sites estáticos)

```
instituto-happyweb-v11/
├── src/
│   ├── index.html            a Home (as páginas internas entram em src/html/ quando forem feitas)
│   ├── css/  normalize.css · reset.css · style-global.css (comum, com o bloco MOVIMENTO)
│   │         estilos.css (só a Home, com o bloco MOVIMENTO DA HOME)
│   └── js/   preferencias.js (no <head>: aplica o "Texto maior" e liga o movimento antes de a página
│             aparecer, com trava de 2,5 s)
│             funções-global.js (defer: módulo 7 "Movimento" no topo; Texto maior, menu, voltar ao
│             topo com anel de progresso, sombra do cabeçalho, aviso)
├── public/
│   ├── fontes/   Plus Jakarta Sans e Inter (OFL)
│   ├── icones/   favicons oficiais
│   └── imagens/  marca/ (logos oficiais, preto e branco — sem alteração)
│                 fotos/ (recortes WebP das fotos ilustrativas do Pexels)
└── docs/         PONTO-DE-PARADA.md · MOVIMENTO.md
```

Exceção registrada: o `preferencias.js` fica no `<head>` sem `defer`, porque precisa agir antes da
primeira pintura (a letra não "pula" de tamanho e o movimento não pisca). No WordPress ele entra como
Código personalizado no `<head>`, com prioridade alta e fora de qualquer "atrasar/adiar JS" de plugin.

Os links para as páginas internas (`./html/...`) ainda não abrem: as páginas só serão criadas
depois da aprovação da Home (sem páginas vazias de fachada).

## Fotos (ilustrativas, de banco de imagens — não são registros do Instituto)
Originais e créditos em `..\instituto-happyweb-novo\fotos-originais` (`creditos.json`). Licença
Pexels: uso gratuito, atribuição não obrigatória.
- Abertura: Ivan S — pexels.com/photo/8117545 (desde 18/11/2026; antes Andrea Piacquadio, 3866392)
- Inclusão digital: Centre for Ageing Better — pexels.com/photo/11284052 (antes RDNE Stock project, 7490819)
- Contato: Alexander Suhorucov — pexels.com/photo/6457492 (antes Yan Krukau, 8837714)
- Recortes: abertura 3:2 (800/1200/1800), abertura-tablet 16:9 (900/1300), abertura-cel 1:1 (480/780),
  tecnologia 4:3 (600/900/1200), contato 6:5 (600/900/1300), contato-cel 4:3 (480/780).

## Testado
**16/11/2026 (layout):** capturas reais (Edge invisível) em 1440, 1280 com "Texto maior", 1024, 768,
390 e 320 com "Texto maior": sem rolagem lateral, sem texto cortado nem palavra quebrada no meio.
"Texto maior" troca sinal e rótulo nos dois botões; menu do celular como janela (foco, Esc, fundo
inerte); aviso de privacidade guardado; todos os arquivos referenciados existem.

**17/11/2026 (margem e movimento), no Edge invisível:**
- Rolagem contínua até o fim em 1440×900, 390×844 e 320×640 com "Texto maior": as 38 entradas entram,
  a trilha completa e acende os pontos, a cortina abre, sem rolagem lateral em nenhum momento, console
  sem erros.
- "Menos movimento" e `?estatico`: nada escondido, trilha inteira, cortina aberta, foto parada. Sem
  JavaScript: tudo aparece (o estado escondido só existe com `html.mov`, que o JS põe).
- Correções da revisão conferidas: no celular com o aviso aberto, nenhuma entrada acontece atrás dele;
  Tab rápido pela página inteira com todo item focado opaco; salto ao topo sem vão sob o cabeçalho;
  convite do A+ só com o botão à vista; tracejado completa a passagem; menu fecha desbotando e inerte;
  botão enche em ~400 ms.
- Revisão independente (motor JS, CSS, especificação/gosto, estrutura/Elementor) com verificação
  cética: 39 achados confirmados e corrigidos (lista em `docs/MOVIMENTO.md`).
- **11.2 (margem de 6%):** cabeçalho, atalhos e eixos medidos em 768, 1024, 1248, 1280, 1366, 1440 e
  1920 px (menu completo cabe a partir de 1248 com folga de 74 px; sem rolagem lateral); rolagem com
  movimento até o fim em 1280×800 e 390×844 sem erros, 38 entradas e trilha/cortina completas.
- Não medido: iPhone real (o `:active` no Safari), celular fraco com CPU lenta (fps), CLS e zoom de
  pinça num aparelho de verdade.

## Para o cliente aprovar
1. **A Home com margem e movimento**: prints e PDF da margem nova em
   `..\Prints\Versão 11.2 - Margem menor (para aprovação)` (com antes/depois); **vídeos** do movimento
   em `..\Prints\Versão 11.1 - Margem de 10% e movimento (para aprovação)`. O movimento se avalia pelos
   vídeos (10 rolagem no computador, 11 rolagem no celular, 12 hovers, 13 letra maior no celular).
   Se algo ficar "demais", a ordem de corte combinada é: convite do A+ → luz da Transparência → foto do
   banner no hover → pino se levantando. Se ficar sutil, sobe primeiro o percurso da foto, da órbita e
   da luz.
2. **Textos novos desta versão** (os do briefing seguem ao pé da letra):
   - abertura: botões "Conheça o Instituto" e "Nossa atuação"; botão de letra "Letra pequena?
     Aumente o texto do site aqui" / "Voltar ao tamanho normal da letra";
   - atalhos: "O que você procura?" · "O Instituto" · "Eixos de atuação" · "Cursos e tutoriais" ·
     "Transparência" · "Contato";
   - quem somos: título **"Um instituto para aproximar pessoas, conhecimento e oportunidades."** e
     botão "Saiba mais sobre o Instituto";
   - eixos: "Saiba mais" em cada cartão;
   - inclusão digital: rótulo "Inclusão digital" e botão "Saber como vão ser os tutoriais";
   - primeiros passos: "Os cursos vão acontecer **pela internet**, num espaço próprio, separado deste
     site. As primeiras atividades previstas serão gratuitas." e botão "Acompanhar cursos e
     tutoriais";
   - transparência: botão "Acessar a Transparência"; contato: rótulo "Contato e conexões" e "Nossa
     sede".
   - Continuam valendo os textos propostos na versão 10 que se repetem aqui (selo "Associação sem
     fins lucrativos · Pato Branco (PR)", "Onde estamos agora", "Nossos primeiros passos.", os três
     cuidados dos tutoriais, rodapé e aviso de privacidade).
3. **Decisões**: aval para usar fotos de banco ao lado do nome das Redes Femininas até existirem
   fotos próprias autorizadas; canal oficial de contato (e-mail/formulário/WhatsApp do Instituto —
   nunca os da Happy Web); se a sede recebe público; confirmar que os cursos serão pela internet.

## Para a conversão em Elementor (depois da aprovação)
- Partir do modelo institucional da Happy Web (Hello Elementor + Elementor Pro) e montar com widgets
  nativos, mantendo as classes deste protótipo; o CSS (`style-global.css` e `estilos.css`) vai junto.
- Pontos de quebra do Elementor: tablet 1023, tablet extra 1099, notebook 1199 (batem com 64 rem,
  68,75 rem e 75 rem deste CSS). O menu completo do cabeçalho cabe a partir de 88 rem (~1410 px) com a
  margem de 175 px: abaixo disso, botão "Menu". Margem lateral no computador: no mínimo 175 px de cada
  lado (o conteúdo não tem mais teto prático: `--largura` 120 rem). "Texto maior" não mexe nesses pontos: o que depende dele
  está em CSS (`html.texto-maior` no cabeçalho e `@container` nos atalhos e nos eixos).
- Peças que viram widgets: cada atalho e cada eixo é uma **célula** (container com a classe
  `atalhos__item`/`eixos__item`) com um container de Tag HTML "a" + link e a classe `atalho`/`eixo`;
  dentro, Ícone sem link, Título e (no eixo) Texto + "Saiba mais" — nunca Caixa de ícone, que põe dois
  links e não deixa o cartão inteiro clicável. Zerar o `fill` que o Elementor põe no SVG do Ícone.
  Trilha → três containers `.marco` (as linhas são `::after`); marca do "Quem somos" → Imagem num
  container redondo; fotos → Imagem com alt e srcset; contato → container de duas colunas.
- **Movimento no Elementor** (detalhes em `docs/MOVIMENTO.md`):
  - classes `hw-entra hw-entra--…` e `hw-segue hw-segue--…` em Avançado → Classes CSS, no mesmo
    elemento do protótipo; seções com Tag HTML section, atalhos nav, rodapé footer;
  - **não usar** Animação de entrada (põe `.elementor-invisible` e deixa a página em branco sem JS),
    Animação de hover (0,3 s, rápida demais) nem Efeitos de rolagem; conferir que o modelo não traz
    nenhuma;
  - `.quem-somos__marca` e `.transparencia`: Sobreposição de fundo vazia (o `::before` é dela);
  - botões: widget Botão sem cor nem animação de hover (no widget e no Kit); numa camada de adaptação,
    levar o bloco `.botao` para o `.elementor-button` interno (como no Pneus Ballan);
  - Menu do Pro com Ponteiro "Nenhum" (senão o traço dele briga com o nosso); o painel do celular, se
    virar Off-canvas/Popup, precisa da classe de "aberto" dele no lugar de `.painel--aberto`;
  - cabeçalho fixo e opaco acima da abertura (senão `--segue-amp: 0` na `.abertura__foto`);
  - Código personalizado: `preferencias.js` no `<head>` com prioridade alta e `funções-global.js` no
    fim do `<body>`, os dois fora de adiar/atrasar/juntar JS do plugin de cache;
  - capturas e PDF com `?estatico`; o movimento se aprova por vídeo.
- O conversor da Pneus Ballan precisa de uma cópia adaptada (sem mexer no original): `a.botao` →
  Botão; `<svg>` → Ícone com SVG enviado (exportar os SVGs para `public/icones` nessa hora);
  `img`/`picture` → Imagem; as listas inteiras num Editor de texto; preservar as classes `hw-*`. O
  `validar.py` deve acusar widget HTML, container vazio e classe sem CSS.

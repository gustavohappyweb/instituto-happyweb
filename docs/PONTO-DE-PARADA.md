# Ponto de parada — versão 11.2 (margem larga e fotos novas)

**18/11/2026.** Nada publicado; nenhum servidor, DNS, hospedagem, usuário ou senha tocado.

## Feito
1. A versão 10 foi recusada ("ficou horrível"). Lição: nada de conceito abstrato que o público não
   lê (formas soltas do logo); usar o vocabulário que a Happy Web já entrega nos seus sites.
2. Primeira montagem da v11 no vocabulário da Happy Web, depois uma revisão independente (público,
   método de design, conteúdo, código). Ela apontou risco de parecer "o TUPA com outra cor" e três
   seções com a mesma fórmula texto + foto.
3. Reestruturação (`src/index.html` + `src/css/estilos.css` reescrito):
   - atalhos em cartões brancos mordendo a borda da abertura; o "A+" virou um botão de texto logo
     abaixo dos botões (antes era uma barra no lugar mais forte da abertura);
   - saiu o quadro "Gratuitas" da abertura (parecia oferta aberta), saíram as faixas coloridas e os
     sublinhados de cor (ornamentos do TUPA) e a nota dos eixos (repetia o parágrafo de cima);
   - "Quem somos" com a marca desenhada no lugar de foto; "Primeiros passos" virou trilha; Contato
     com foto até a borda (três mulheres de idades diferentes); ícone de monitor e "pela internet"
     nos cursos (o pin sugeria lugar físico);
   - cartões dos eixos alinhados ("Saiba mais" sempre no pé) e sem buracos na grade (5 / 3+2 / 2 / 1);
   - celular estreito e "Texto maior": atalhos um por linha com ícone ao lado; nos eixos o ícone vai
     para cima e o nome não quebra no meio da palavra; endereço sem quebra feia.
4. Prints da v11 para aprovação: `..\..\Prints\Versão 11 - Home nova (para aprovação)`; zip
   `..\..\Checkpoints\Projeto - versão 11 Home nova - 2026-11-16.zip`.
5. **11.1 — margem de 10%** (pedido: "padding de uns 10% apenas nas laterais, mais respiro"):
   `--margem: 10vw` do tablet para cima (no celular `clamp(1.25rem, 6vw, 2rem)`); menu completo do
   cabeçalho a partir de 84 rem; atalhos 5 numa linha e eixos 5 lado a lado só quando cabem
   (container queries).
6. **11.1 — movimento** (pedido: "animações e hover diferentes, animações de scroll"):
   - estudo do código dos 6 sites da Happy Web (o que a agência usa: entradas fadeInUp, cartões em
     escada, cartão que sobe 5 px, botão que se enche, parallax leve; o que evitar: rolagem presa,
     texto embaçado, abertura animada) e três propostas independentes → especificação
     (`docs/MOVIMENTO.md`);
   - implementação em CSS e JS puros: entradas em cascata, cinco efeitos que acompanham a rolagem
     (foto da abertura, órbita do ponto rosa, trilha, luz da Transparência, cortina do Contato) e
     hovers próprios por tipo de elemento; só classes novas no HTML;
   - revisão independente em 4 frentes + verificação cética: 39 achados confirmados e corrigidos.
7. Material para aprovação: `..\..\Prints\Versão 11.1 - Margem de 10% e movimento (para aprovação)`
   (9 capturas com `?estatico`, PDF e 4 vídeos). Ponto de restauração:
   `..\..\Checkpoints\Projeto - versão 11.1 Margem e movimento - 2026-11-17.zip`.

8. **11.2 — margem menor** (ele gostou da 11.1, "porém preciso de menos preenchimento nas laterais"):
   `--margem: 6vw` do tablet para cima e conteúdo até 1280 px (`--largura: 80rem`); menu completo a
   partir de 78 rem. Prints e PDF (com antes/depois) em
   `..\..\Prints\Versão 11.2 - Margem menor (para aprovação)`; zip
   `..\..\Checkpoints\Projeto - versão 11.2 Margem menor - 2026-11-17.zip`.

9. **11.3 recusada, 11.2 restaurada (17/11/2026).** A 11.3 (refinamento visual: atalhos em faixa, Quem somos
   em carta, eixos em índice 01–05) foi recusada ("não gostei. volta para a última versão"). Os arquivos
   voltaram ao zip "11.2 antes do refinamento visual" (conferido byte a byte); `?v=11.2r` nos endereços.
   A 11.3 ficou no zip "11.3 recusada (antes de voltar à 11.2)" e na pasta de prints dela.

10. **Margem lateral do computador maior (18/11/2026)**, a pedido e em vários passos até "aumente mais um
    pouco": computador `max(175px, 3.78vw)` de cada lado; tablet `3.78vw`; `--largura: 120rem`; menu
    completo do cabeçalho a partir de 88 rem (~1410 px). Conferido sem rolagem lateral e com "Falar com o
    Instituto" numa linha.
11. **Fotos novas (18/11/2026)**, pedido "Quero imagens melhores!": folhas de escolha em
    `..\..\Prints\Fotos novas - opções (para escolher)`; ele escolheu D, C, C (pexels 8117545, 11284052,
    6457492). Recortes com os mesmos nomes; `?v=f1` nas fotos, `?v=11.2f2` no CSS/JS; foto do Contato no
    computador em `80% 45%` (≥75 rem: `100% 45%`); abertura recortada por caixa (computador
    `78% 10%`); inclusão revista no item 12. Revisão independente do enquadramento feita. Capturas em 6 larguras em
    `..\..\Prints\Versão 11.2 - Fotos novas (para aprovação)`. Zip antes da troca:
    `..\..\Checkpoints\Projeto - versão 11.2 antes das fotos novas - 2026-11-18.zip`.

12. **Inclusão digital sem degradê (18/11/2026)**, pedido "a transição parece névoa": corte seco entre o
    petróleo e a foto no computador; foto em `52% 40%` até 1199 px e `45% 40%` acima; `?v=11.2f4`.

13. **Linha velha acima da abertura (18/11/2026):** sombra do cabeçalho sem transição de opacidade.
14. **Inclusão digital com arco (18/11/2026) — APROVADO:** recorte em arco no lugar de degradê/corte seco; lado a lado
    só de 1440 px (foto em cima, 2:1, no notebook); arquivos tecnologia-1800/2400 e `sizes` corrigido (antes ampliava até 1,8x); `?v=11.2f9`.

15. **Páginas internas (18–19/11/2026):** as 6 páginas que a Home liga + 404, montadas a partir da
    O Instituto (modelo) por 5 montadores em paralelo e revisadas em 4 frentes (conteúdo, código e
    acessibilidade, celular/tablet, links e movimento). Ver README.

## Aguardando o cliente
Aprovação das fotos novas no site.
Aprovação da margem lateral (175 px no computador) e do movimento (ele disse que gostou do movimento da 11.1), da Home e dos textos novos; decisões sobre fotos
de banco ao lado das RFCC, canal oficial de contato, se a sede recebe público e se os cursos serão
mesmo pela internet (lista no README).

## Próximo passo
Ajustar o movimento conforme ele reagir aos vídeos (ordem de corte e de reforço no README). Com a Home
aprovada: páginas internas (`src/html/`), uma a uma, com o mesmo cuidado por seção; depois, a conversão
para Elementor sobre o modelo institucional (notas no README e em `docs/MOVIMENTO.md`).
Pendente de medir em aparelho real: `:active` no iPhone, fps em celular fraco, zoom de pinça.

16. **Botão do WhatsApp (23/11/2026):** igual ao do site da Happy Web (círculo verde 65 px no canto, selo vermelho "1"), em todas as páginas; o "voltar ao topo" foi para cima dele. O número NÃO está posto: escrever só os dígitos em `WHATSAPP` no fim do `src/js/funções-global.js`. Enquanto vazio, o botão leva à página de Contato. Não usar o número comercial da Happy Web.

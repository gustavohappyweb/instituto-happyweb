/*
 * funções-global.js — comportamento comum a todas as páginas (script clássico, com defer):
 *  0. Largura útil da janela (sem a barra de rolagem) em --largura-janela, para as contas de "sangria"
 *  1. "Texto maior" (todos os botões [data-texto-maior]; a escolha fica guardada neste aparelho)
 *  2. Menu do celular (janela: prende o foco, Esc fecha, o resto da página fica inerte)
 *  3. Fotos que aparecem suavemente quando terminam de carregar (páginas internas; na Home, ver o 7)
 *  4. "Voltar ao topo" depois de uma tela rolada (com anel de progresso) e sombra do cabeçalho ao rolar
 *  5. Aviso de privacidade ("Entendi" guarda a escolha; o botão de topo fica sempre acima dele)
 *  6. Teclado em "botões" que não são <button> (Enter e Espaço), para a versão no WordPress
 *  7. Movimento (logo abaixo, numa função própria): entradas na rolagem e efeitos que acompanham a rolagem
 * Nada aqui esconde conteúdo para sempre: sem JavaScript, o site continua inteiro, legível e parado.
 * (O preferencias.js, no <head>, aplica o "Texto maior" e liga o movimento antes de a página aparecer.)
 */

/* iOS: sem um ouvinte de toque, o Safari não aplica o :active (o retorno do toque em botões e cartões) */
document.addEventListener("touchstart", function () {}, { passive: true });

/* 7. Movimento ------------------------------------------------------------------------------------
 * Fica no começo e numa função própria: se outra parte deste arquivo falhar, o movimento continua; se o
 * movimento falhar (na montagem ou depois, em qualquer laço), "desistir" mostra tudo parado e completo.
 *  a) Entradas: cada ".hw-entra" ganha ".entrou" (uma vez só) quando cruza a linha de gatilho (90% da
 *     tela, ou acima do aviso de privacidade enquanto ele cobre a base), com atraso em cascata: texto na
 *     ordem da página (100 ms, no máximo 400); cartões, ícones e marcos por coluna da fileira real.
 *     O que já passou (barra arrastada, salto, foco do teclado) aparece sem animar.
 *  b) Efeitos que acompanham a rolagem: cada ".hw-segue" recebe um número (--foto-y, --orbita, --traco,
 *     --luz, --cortina), suavizado num único requestAnimationFrame que dorme quando tudo parou. As medidas
 *     ficam guardadas; durante a rolagem só se lê scrollY. O CSS decide o visual.
 */
(function () {
	"use strict";

	var raiz = document.documentElement;
	if (!raiz.classList.contains("mov")) {
		return; /* "menos movimento", navegador antigo, ?estatico ou trava de segurança */
	}
	raiz.classList.add("mov-pronto");

	var palcos = [];
	var observador = null;
	var desligado = false;

	/* saída de emergência: limpa os números escritos, mostra o que faltava e tira as classes */
	function desistir() {
		desligado = true;
		try {
			palcos = [];
			if (observador) {
				observador.disconnect();
			}
			Array.prototype.forEach.call(document.querySelectorAll(".hw-segue, .hw-segue .marco"), function (el) {
				["--foto-y", "--orbita", "--luz", "--cortina", "--traco"].forEach(function (nome) {
					el.style.removeProperty(nome);
				});
			});
			Array.prototype.forEach.call(document.querySelectorAll(".hw-entra:not(.entrou)"), function (el) {
				el.classList.add("entrou", "mov-ja");
			});
		} catch (erro) { /* segue para tirar as classes */ }
		raiz.classList.remove("mov", "mov-pronto", "mov-segue", "mov-arco");
	}
	/* embrulha o que roda depois da montagem (observadores, rolagem, quadros): erro → desistir */
	function seguro(funcao) {
		return function () {
			if (desligado) {
				return undefined;
			}
			try {
				return funcao.apply(this, arguments);
			} catch (erro) {
				desistir();
				return undefined;
			}
		};
	}

	try {
		var lista = function (seletor, base) {
			return Array.prototype.slice.call((base || document).querySelectorAll(seletor));
		};
		var limitar = function (v) {
			return v < 0 ? 0 : (v > 1 ? 1 : v);
		};
		var ler = function (estilo, nome, padrao) {
			var v = parseFloat(estilo.getPropertyValue(nome));
			return isNaN(v) ? padrao : v;
		};
		var estiloRaiz = window.getComputedStyle(raiz);
		var PASSO = {
			texto: ler(estiloRaiz, "--passo-texto", 100),
			cartao: ler(estiloRaiz, "--passo-cartao", 120),
			icone: ler(estiloRaiz, "--passo-icone", 100),
			marco: ler(estiloRaiz, "--passo-marco", 150)
		};
		if (window.CSS && "registerProperty" in window.CSS) {
			raiz.classList.add("mov-arco"); /* o anel da marca pode se desenhar */
		}

		var alturaJanela = raiz.clientHeight;
		/* no celular, com a barra do navegador recolhida, a área visível é maior que o clientHeight */
		var alturaVisivel = function () {
			return Math.max(alturaJanela, window.innerHeight || 0);
		};
		var palcoOrbita = null;

		/* ---- a) entradas ---- */
		var pendentes = lista(".hw-entra");
		var tipoDe = function (el) {
			var c = el.classList;
			if (c.contains("hw-entra--texto") || c.contains("hw-entra--esq") || c.contains("hw-entra--dir")) {
				return "texto";
			}
			if (c.contains("hw-entra--cartao")) {
				return "cartao";
			}
			if (c.contains("hw-entra--icone")) {
				return "icone";
			}
			if (c.contains("hw-entra--marco")) {
				return "marco";
			}
			return "outro";
		};
		/* ângulo atual do ponto rosa (o anel da marca começa a se desenhar dali) */
		var anguloDoPonto = function (el) {
			var estilo = window.getComputedStyle(el);
			var base = ler(estilo, "--orbita-base", 133.5);
			var amp = ler(estilo, "--orbita-amp", 0);
			var orbita = palcoOrbita && palcoOrbita.atual ? palcoOrbita.atual[0] : 0;
			return base + orbita * amp;
		};
		var marcar = function (el, atraso, semAnimar) {
			if (el.classList.contains("entrou")) {
				return;
			}
			if (atraso) {
				el.style.setProperty("--atraso", Math.round(atraso) + "ms");
			}
			if (el.classList.contains("hw-entra--marca")) {
				el.style.setProperty("--arco-inicio", anguloDoPonto(el).toFixed(1) + "deg");
			}
			el.classList.add("entrou");
			if (semAnimar) {
				el.classList.add("mov-ja");
			}
			if (observador) {
				observador.unobserve(el);
			}
		};
		var entrar = function (lote, base) {
			var secoes = [];
			var grupoDe = function (el) {
				var secao = el.closest("section, footer, nav") || document.body;
				for (var i = 0; i < secoes.length; i++) {
					if (secoes[i].secao === secao) {
						return secoes[i];
					}
				}
				var novo = { secao: secao, texto: [], grade: [], outros: [] };
				secoes.push(novo);
				return novo;
			};
			lote.forEach(function (el) {
				if (el.classList.contains("entrou")) {
					return;
				}
				var tipo = tipoDe(el);
				var grupo = grupoDe(el);
				(tipo === "texto" ? grupo.texto : (tipo === "outro" ? grupo.outros : grupo.grade)).push(el);
			});
			secoes.forEach(function (grupo) {
				/* texto: na ordem da página, 100 ms entre itens, no máximo 4 passos */
				grupo.texto.sort(function (a, b) {
					return (a.compareDocumentPosition(b) & 4) ? -1 : 1;
				});
				grupo.texto.forEach(function (el, i) {
					marcar(el, base + Math.min(i, 4) * PASSO.texto);
				});
				/* cartões, ícones e marcos: por coluna dentro da fileira real (a 2ª fileira recomeça do zero) */
				var baseGrade = base + (grupo.texto.length ? 200 : 0);
				var itens = grupo.grade.map(function (el) {
					var r = el.getBoundingClientRect();
					return { el: el, topo: Math.round(r.top), esquerda: r.left, tipo: tipoDe(el) };
				});
				itens.sort(function (a, b) {
					return (a.topo - b.topo) || (a.esquerda - b.esquerda);
				});
				var fileira = [];
				var topoFileira = null;
				var fecharFileira = function () {
					fileira.sort(function (a, b) {
						return a.esquerda - b.esquerda;
					});
					fileira.forEach(function (item, coluna) {
						marcar(item.el, Math.min(baseGrade + coluna * PASSO[item.tipo], 600));
					});
					fileira = [];
				};
				itens.forEach(function (item) {
					if (topoFileira !== null && Math.abs(item.topo - topoFileira) > 8) {
						fecharFileira();
					}
					if (!fileira.length) {
						topoFileira = item.topo;
					}
					fileira.push(item);
				});
				fecharFileira();
				grupo.outros.forEach(function (el) {
					marcar(el, 0);
				});
			});
		};

		/* linha de gatilho: 90% da tela, ou acima do aviso de privacidade enquanto ele cobre a base */
		var aoCruzar = seguro(function (entradas) {
			var lote = [];
			entradas.forEach(function (entrada) {
				if (entrada.isIntersecting) {
					lote.push(entrada.target);
				}
			});
			if (lote.length) {
				entrar(lote, 0);
			}
		});
		var margemArmada = "";
		var margemGatilho = function () {
			var aviso = document.querySelector("[data-aviso]");
			var cobre = raiz.classList.contains("com-aviso") && aviso && !aviso.hidden ? aviso.offsetHeight : 0;
			return "0px 0px -" + Math.round(cobre + 0.1 * alturaJanela) + "px 0px";
		};
		var armar = function () {
			if (desligado) {
				return;
			}
			var margem = margemGatilho();
			if (observador && margem === margemArmada) {
				return;
			}
			margemArmada = margem;
			if (observador) {
				observador.disconnect();
			}
			observador = new IntersectionObserver(aoCruzar, { rootMargin: margem, threshold: 0 });
			pendentes.forEach(function (el) {
				if (!el.classList.contains("entrou")) {
					observador.observe(el);
				}
			});
		};

		/* convite do "A+" da abertura: um halo, uma vez por visita, só quando o botão está inteiro à vista
		   (abaixo do cabeçalho e acima do aviso de privacidade) e com a letra normal */
		var letra = document.querySelector(".letra");
		var jaConvidou = null;
		try {
			jaConvidou = window.sessionStorage.getItem("ihw-convite");
		} catch (erro) { /* sem armazenamento: convida nesta página */ }
		var convitePendente = Boolean(letra && !jaConvidou && !raiz.classList.contains("texto-maior"));
		var inicioConvite = window.performance.now();
		var checarConvite = function () {
			if (!convitePendente) {
				return;
			}
			if (raiz.classList.contains("texto-maior")) {
				convitePendente = false;
				return;
			}
			var r = letra.getBoundingClientRect();
			var aviso = document.querySelector("[data-aviso]");
			var cabecalho = document.querySelector(".cabecalho");
			var limite = aviso && !aviso.hidden ? aviso.getBoundingClientRect().top : window.innerHeight;
			var topoLivre = cabecalho ? cabecalho.getBoundingClientRect().bottom : 0;
			if (r.top >= topoLivre && r.bottom <= limite - 8) {
				convitePendente = false;
				letra.style.setProperty("--convite-atraso", window.performance.now() - inicioConvite < 500 ? "1800ms" : "600ms");
				letra.classList.add("convite");
				try {
					window.sessionStorage.setItem("ihw-convite", "1");
				} catch (erro) { /* sem armazenamento */ }
			}
		};

		/* durante a rolagem (no máximo a cada 250 ms): o que ficou acima da tela sem ter entrado aparece
		   sem animar; no fim da página (ou com zoom de pinça), o que está à vista entra */
		var ultimaConferida = 0;
		var conferirMarcado = false;
		var vigiarTrilha = function () {};
		var ligar = function () {};
		var conferir = seguro(function () {
			ultimaConferida = Date.now();
			conferirMarcado = false;
			pendentes = pendentes.filter(function (el) {
				return !el.classList.contains("entrou");
			});
			var h = alturaVisivel();
			var noFim = Math.ceil(window.scrollY + h) >= raiz.scrollHeight - 4;
			var vv = window.visualViewport;
			var comZoom = vv && vv.scale > 1.05;
			var visiveis = [];
			pendentes.forEach(function (el) {
				var r = el.getBoundingClientRect();
				if (r.bottom <= 0) {
					marcar(el, 0, true);
				} else if (noFim && r.top < h) {
					visiveis.push(el);
				} else if (comZoom && r.top < vv.offsetTop + 0.9 * vv.height && r.bottom > vv.offsetTop) {
					visiveis.push(el);
				}
			});
			if (visiveis.length) {
				entrar(visiveis, 0);
			}
			if (noFim) {
				/* no fim da página, a trilha e a cortina terminam de abrir mesmo que a tela seja baixa */
				palcos.forEach(function (p) {
					if (p.tipo === "trilha" || p.tipo === "cortina") {
						p.maximo = [1, 1];
					}
				});
				ligar();
			}
			vigiarTrilha();
			checarConvite();
		});
		var pedirConferir = function () {
			var agora = Date.now();
			if (agora - ultimaConferida >= 250) {
				conferir();
			} else if (!conferirMarcado) {
				conferirMarcado = true;
				window.setTimeout(conferir, 250 - (agora - ultimaConferida));
			}
		};

		/* foco do teclado num item escondido ou ainda entrando (no atraso da escada): aparece na hora,
		   ele e os itens que o contêm */
		document.addEventListener("focusin", seguro(function (evento) {
			var alvo = evento.target;
			var item = alvo.closest ? alvo.closest(".hw-entra:not(.mov-ja)") : null;
			while (item) {
				if (item.classList.contains("entrou")) {
					item.classList.add("mov-ja");
				} else {
					marcar(item, 0, true);
				}
				item = item.parentElement ? item.parentElement.closest(".hw-entra:not(.mov-ja)") : null;
			}
		}));

		/* abertura: a foto assenta quando termina de carregar (no primeiro quadro visível: numa aba aberta
		   em segundo plano, o efeito espera a pessoa chegar) */
		var fotoAbertura = document.querySelector(".abertura__foto");
		var imagemAbertura = fotoAbertura ? fotoAbertura.querySelector("img") : null;
		if (imagemAbertura) {
			var assentar = function () {
				window.requestAnimationFrame(function () {
					fotoAbertura.classList.add("assenta");
				});
			};
			if (imagemAbertura.complete) {
				assentar();
			} else {
				imagemAbertura.addEventListener("load", assentar);
				imagemAbertura.addEventListener("error", assentar);
			}
		}

		/* ---- b) efeitos que acompanham a rolagem ---- */
		var topoDoc = function (el) {
			var y = 0;
			while (el) {
				y += el.offsetTop; /* ignora transformações: a entrada não atrapalha a medida */
				el = el.offsetParent;
			}
			return y;
		};
		var economia = window.navigator.connection && window.navigator.connection.saveData;
		var TIPOS = ["foto", "orbita", "trilha", "luz", "cortina"];
		palcos = economia ? [] : lista(".hw-segue").map(function (el) {
			var tipo = TIPOS.filter(function (t) {
				return el.classList.contains("hw-segue--" + t);
			})[0];
			return {
				el: el,
				tipo: tipo,
				ativo: false,
				m: null,
				atual: null,
				escrito: [],
				maximo: [0, 0],
				f: tipo === "trilha" ? 0.12 : 0.08, /* suavização: 95% do caminho em ~0,4 s (trilha) ou ~0,6 s */
				marcos: tipo === "trilha" ? lista(".marco", el) : null,
				pontos: tipo === "trilha" ? lista(".marco__ponto", el) : null
			};
		}).filter(function (p) {
			return p.tipo && (p.tipo !== "trilha" || (p.marcos.length === 3 && p.pontos.length === 3));
		});
		palcoOrbita = palcos.filter(function (p) {
			return p.tipo === "orbita";
		})[0] || null;
		if (palcos.length) {
			raiz.classList.add("mov-segue");
		}

		var medir = function (p) {
			var estilo = window.getComputedStyle(p.el);
			p.m = {
				topo: topoDoc(p.el),
				altura: p.el.offsetHeight,
				amp: ler(estilo, "--segue-amp", 120),
				dist: ler(estilo, "--segue-dist", 480),
				de: ler(estilo, "--segue-de", 1),
				ate: ler(estilo, "--segue-ate", 0.55),
				modo: estilo.getPropertyValue("--segue-modo").trim(),
				linha: ler(estilo, "--segue-linha", 0.7)
			};
			if (p.tipo === "trilha") {
				p.m.trechos = [0, 1].map(function (i) {
					var a = p.pontos[i];
					var b = p.pontos[i + 1];
					var inicio = topoDoc(a) + a.offsetHeight;
					return { inicio: inicio, fim: Math.max(topoDoc(b), inicio + 1) };
				});
			}
		};
		/* posição de rolagem → valor (sempre linear); a trilha e a cortina só avançam (catraca) */
		var calcular = function (p, y, h) {
			var m = p.m;
			var valores;
			if (p.tipo === "foto") {
				valores = [Math.min(m.amp * limitar(y / m.dist), Math.max(0, y - 1))];
			} else if (p.tipo === "orbita" || p.tipo === "luz") {
				var travessia = limitar((y + h - m.topo) / (h + m.altura));
				valores = [p.tipo === "orbita" ? travessia - 0.5 : 2 * travessia - 1];
			} else if (p.tipo === "cortina") {
				valores = [limitar((m.de * h - (m.topo - y)) / ((m.de - m.ate) * h))];
			} else if (m.modo === "tela") {
				var q = limitar((m.de * h - (m.topo - y)) / ((m.de - m.ate) * h));
				valores = [limitar(2 * q), limitar(2 * q - 1)];
			} else {
				var linhaDeLeitura = y + m.linha * h;
				valores = m.trechos.map(function (trecho) {
					return limitar((linhaDeLeitura - trecho.inicio) / (trecho.fim - trecho.inicio));
				});
			}
			if (p.tipo === "trilha" || p.tipo === "cortina") {
				valores = valores.map(function (v, i) {
					p.maximo[i] = Math.max(p.maximo[i], v);
					return p.maximo[i];
				});
			}
			return valores;
		};
		var NOMES = { foto: "--foto-y", orbita: "--orbita", luz: "--luz", cortina: "--cortina" };
		var escrever = function (p) {
			var minimo = p.tipo === "foto" ? 0.1 : 0.0005;
			p.atual.forEach(function (v, i) {
				if (p.escrito[i] !== undefined && Math.abs(v - p.escrito[i]) < minimo && v !== 0 && v !== 1) {
					return;
				}
				p.escrito[i] = v;
				var texto = v.toFixed(p.tipo === "foto" ? 1 : 4);
				if (p.tipo === "trilha") {
					p.marcos[i].style.setProperty("--traco", texto);
					if (v >= 0.98) {
						p.pontos[i + 1].classList.add("aceso");
					}
				} else {
					p.el.style.setProperty(NOMES[p.tipo], texto);
				}
			});
		};
		/* vai direto ao valor da posição atual, sem suavizar (partida, salto, volta de longe) */
		var assentarPalco = function (p) {
			if (!p.m) {
				medir(p);
			}
			p.atual = calcular(p, window.scrollY, alturaJanela).slice();
			escrever(p);
		};

		var rodando = false;
		var ultimoQuadro = 0;
		var ultimaRolagem = 0;
		var quadroSeguro = null;
		var quadro = function (t) {
			var dt = ultimoQuadro ? Math.min(t - ultimoQuadro, 64) : 16.667;
			ultimoQuadro = t;
			var y = window.scrollY;
			var parado = true;
			palcos.forEach(function (p) {
				if (!p.ativo || !p.m || !p.atual) {
					return;
				}
				var alvo = calcular(p, y, alturaJanela);
				var k = 1 - Math.pow(1 - p.f, dt / 16.667);
				var minimo = p.tipo === "foto" ? 0.1 : 0.0005;
				alvo.forEach(function (v, i) {
					var diferenca = v - p.atual[i];
					if (Math.abs(diferenca) < minimo) {
						p.atual[i] = v;
					} else {
						p.atual[i] += diferenca * k;
						parado = false;
					}
				});
				if (p.tipo === "foto") {
					p.atual[0] = Math.min(p.atual[0], Math.max(0, y - 1)); /* o vão fica sempre atrás do cabeçalho */
				}
				escrever(p);
			});
			if (parado && t - ultimaRolagem > 150) {
				rodando = false;
				ultimoQuadro = 0;
				return;
			}
			window.requestAnimationFrame(quadroSeguro);
		};
		quadroSeguro = seguro(quadro);
		ligar = function () {
			ultimaRolagem = window.performance.now();
			if (!rodando && palcos.length && !desligado) {
				rodando = true;
				window.requestAnimationFrame(quadroSeguro);
			}
		};
		var medirTudo = seguro(function () {
			alturaJanela = raiz.clientHeight;
			palcos.forEach(medir);
			armar();
			ligar();
		});

		/* a trilha inteira na tela por 1,2 s sem ter terminado: termina sozinha */
		var esperaTrilha = 0;
		vigiarTrilha = function () {
			palcos.forEach(function (p) {
				if (p.tipo !== "trilha" || !p.m || (p.maximo[0] >= 1 && p.maximo[1] >= 1) || esperaTrilha) {
					return;
				}
				var inteira = function () {
					var topoNaTela = p.m.topo - window.scrollY;
					return topoNaTela >= 0 && topoNaTela + p.m.altura <= alturaVisivel();
				};
				if (inteira()) {
					esperaTrilha = window.setTimeout(seguro(function () {
						esperaTrilha = 0;
						if (inteira()) {
							p.maximo = [1, 1];
							ligar();
						}
					}), 1200);
				}
			});
		};

		/* partida dos efeitos: trilha e cortina que já estão na tela começam completas (nunca fecham o
		   que a pessoa já viu aberto); o resto vai direto ao valor da posição atual */
		var yPartida = window.scrollY;
		palcos.forEach(function (p) {
			medir(p);
			if ((p.tipo === "trilha" || p.tipo === "cortina") && p.m.topo < yPartida + alturaJanela && p.m.topo + p.m.altura > yPartida) {
				p.maximo = [1, 1];
			}
			assentarPalco(p);
		});
		vigiarTrilha();

		/* partida das entradas: o que já passou aparece sem animar; o que está na tela entra no primeiro
		   quadro visível (150 ms de base); o resto espera a linha de gatilho */
		var naTela = [];
		pendentes.forEach(function (el) {
			var r = el.getBoundingClientRect();
			if (r.bottom <= 0) {
				marcar(el, 0, true);
			} else if (r.top < alturaJanela) {
				naTela.push(el);
			}
		});
		window.requestAnimationFrame(seguro(function () {
			if (naTela.length) {
				entrar(naTela, 150);
			}
			armar(); /* aqui o aviso de privacidade (módulo 5) já está na tela e medido */
			checarConvite();
		}));
		/* o aviso abriu ou fechou: a linha de gatilho muda */
		if ("MutationObserver" in window) {
			var comAviso = raiz.classList.contains("com-aviso");
			new window.MutationObserver(seguro(function () {
				var agora = raiz.classList.contains("com-aviso");
				if (agora !== comAviso) {
					comAviso = agora;
					armar();
				}
			})).observe(raiz, { attributes: true, attributeFilter: ["class"] });
		}

		/* cada efeito só trabalha perto da tela; a foto da abertura, longe dela, volta a 0 (invisível),
		   e ao voltar vai direto ao valor certo (nunca aparece um vão sob o cabeçalho) */
		var vigia = new IntersectionObserver(seguro(function (entradas) {
			entradas.forEach(function (entrada) {
				palcos.forEach(function (p) {
					if (p.el !== entrada.target) {
						return;
					}
					p.ativo = entrada.isIntersecting;
					p.el.classList.toggle("segue-ativo", p.ativo);
					if (p.tipo === "foto" && p.m && p.atual) {
						if (p.ativo) {
							assentarPalco(p);
						} else {
							p.atual = [0];
							escrever(p);
						}
					}
				});
			});
			ligar();
		}), { rootMargin: "25% 0px" });
		palcos.forEach(function (p) {
			vigia.observe(p.el);
		});

		/* rolagem: salto maior que uma tela (barra arrastada, End, volta no histórico) assenta direto */
		var yAntes = window.scrollY;
		window.addEventListener("scroll", seguro(function () {
			var y = window.scrollY;
			if (Math.abs(y - yAntes) > alturaJanela) {
				palcos.forEach(function (p) {
					if (p.m) {
						assentarPalco(p);
					}
				});
			}
			yAntes = y;
			ligar();
			pedirConferir();
		}), { passive: true });
		if (window.visualViewport) {
			window.visualViewport.addEventListener("scroll", pedirConferir);
			window.visualViewport.addEventListener("resize", pedirConferir);
		}

		/* medidas: na carga, quando as fontes chegam, ao mudar o tamanho da janela ou da página */
		var larguraMedida = window.innerWidth;
		var esperaMedir = 0;
		window.addEventListener("resize", function () {
			if (window.innerWidth === larguraMedida && raiz.clientHeight === alturaJanela) {
				return; /* só a barra do navegador do celular: o clientHeight não muda */
			}
			window.clearTimeout(esperaMedir);
			esperaMedir = window.setTimeout(function () {
				larguraMedida = window.innerWidth;
				medirTudo();
			}, 150);
		});
		window.addEventListener("load", medirTudo);
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(medirTudo);
		}
		if ("ResizeObserver" in window) {
			var medidaMarcada = false;
			new window.ResizeObserver(function () {
				if (!medidaMarcada) {
					medidaMarcada = true;
					window.requestAnimationFrame(function () {
						medidaMarcada = false;
						medirTudo();
					});
				}
			}).observe(document.body);
		}

		/* "Texto maior": os sinais A+/A− dão um pulo de confirmação e as medidas são refeitas */
		lista("[data-texto-maior]").forEach(function (botao) {
			botao.addEventListener("click", seguro(function () {
				lista("[data-texto-sinal]").forEach(function (sinal) {
					sinal.classList.remove("pulou");
					void sinal.offsetWidth; /* reinicia a animação se clicar de novo */
					sinal.classList.add("pulou");
				});
				window.requestAnimationFrame(function () {
					window.requestAnimationFrame(medirTudo);
				});
			}));
		});

		/* trilha: o tracejado anda um período até o "A seguir" quando o botão da seção recebe o mouse ou o
		   foco do teclado; a passagem termina inteira mesmo que o mouse saia antes */
		var trechoTracejado = document.querySelector(".trilha .marco:nth-child(2)");
		var botaoTrilha = document.querySelector(".passos__fim .botao");
		if (trechoTracejado && botaoTrilha) {
			var andar = function () {
				trechoTracejado.classList.add("anda");
			};
			botaoTrilha.addEventListener("pointerenter", function (evento) {
				if (evento.pointerType === "mouse") {
					andar();
				}
			});
			botaoTrilha.addEventListener("focus", function () {
				var deTeclado = true;
				try {
					deTeclado = botaoTrilha.matches(":focus-visible");
				} catch (erro) { /* navegador sem :focus-visible */ }
				if (deTeclado) {
					andar();
				}
			});
		}
		var fimDeAnimacao = function (evento) {
			if (!evento.target.classList) {
				return;
			}
			if (evento.animationName === "mov-pulo") {
				evento.target.classList.remove("pulou");
			} else if (evento.animationName === "mov-tracejado") {
				evento.target.classList.remove("anda");
			}
		};
		document.addEventListener("animationend", fimDeAnimacao);
		document.addEventListener("animationcancel", fimDeAnimacao);

		/* impressão: tudo aparece, parado */
		var repouso = function (p) {
			["--foto-y", "--orbita", "--luz", "--cortina"].forEach(function (nome) {
				p.el.style.removeProperty(nome);
			});
			if (p.marcos) {
				p.marcos.forEach(function (marco) {
					marco.style.removeProperty("--traco");
				});
			}
			p.escrito = [];
		};
		window.addEventListener("beforeprint", function () {
			lista(".hw-entra:not(.entrou)").forEach(function (el) {
				marcar(el, 0, true);
			});
			palcos.forEach(repouso);
		});
		window.addEventListener("afterprint", seguro(function () {
			palcos.forEach(assentarPalco);
		}));

		/* a pessoa pediu "menos movimento" com a página aberta: tudo para no lugar */
		var consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
		var aoMudar = function () {
			if (consulta.matches) {
				desistir();
			}
		};
		if (consulta.addEventListener) {
			consulta.addEventListener("change", aoMudar);
		} else if (consulta.addListener) {
			consulta.addListener(aoMudar);
		}
	} catch (erro) {
		desistir();
	}
}());

(function () {
	"use strict";

	var raiz = document.documentElement;
	var guardar = function (chave, valor) {
		try {
			if (valor === null) {
				window.localStorage.removeItem(chave);
			} else {
				window.localStorage.setItem(chave, valor);
			}
		} catch (erro) { /* sem armazenamento: vale só nesta página */ }
	};
	var ler = function (chave) {
		try {
			return window.localStorage.getItem(chave);
		} catch (erro) {
			return null;
		}
	};

	/* 0. Largura útil da janela ------------------------------------------- */
	var medirJanela = function () {
		raiz.style.setProperty("--largura-janela", raiz.clientWidth + "px");
	};
	medirJanela();
	window.addEventListener("resize", medirJanela);

	/* 1. Texto maior ------------------------------------------------------ */
	if (ler("ihw-texto-maior") === "1") {
		raiz.classList.add("texto-maior"); /* caso o preferencias.js não tenha rodado */
	}
	var botoesTexto = Array.prototype.slice.call(document.querySelectorAll("[data-texto-maior]"));
	var mostrarEstadoTexto = function () {
		var ligado = raiz.classList.contains("texto-maior");
		botoesTexto.forEach(function (botao) {
			var sinal = botao.querySelector("[data-texto-sinal]");
			var rotulo = botao.querySelector("[data-texto-rotulo]");
			if (sinal) {
				sinal.textContent = ligado ? "A−" : "A+";
			}
			if (rotulo) {
				/* cada botão pode ter os próprios textos (data-ligado / data-desligado) */
				rotulo.textContent = ligado ? (rotulo.getAttribute("data-ligado") || "Texto normal") : (rotulo.getAttribute("data-desligado") || "Texto maior");
			}
		});
	};
	botoesTexto.forEach(function (botao) {
		botao.addEventListener("click", function () {
			var ligado = raiz.classList.toggle("texto-maior");
			guardar("ihw-texto-maior", ligado ? "1" : null);
			mostrarEstadoTexto();
			medirJanela();
		});
	});
	mostrarEstadoTexto();

	/* 2. Menu do celular --------------------------------------------------- */
	var painel = document.querySelector("[data-painel]");
	var abrir = document.querySelector("[data-menu-abrir]");
	var fechar = document.querySelector("[data-menu-fechar]");
	var focoAnterior = null;
	/* o que fica atrás do painel e precisa sair do alcance do teclado e do leitor de tela */
	var fundo = Array.prototype.slice.call(document.querySelectorAll("body > header, body > main, body > footer, .pular, [data-voltar-topo], [data-whatsapp], [data-aviso]"));

	var focaveis = function () {
		return Array.prototype.slice.call(painel.querySelectorAll("a[href], button:not([disabled])"));
	};
	var fecharPainel = function (devolverFoco) {
		/* desbota em 200 ms (na hora, com "menos movimento"); enquanto some, sai do teclado e do clique */
		painel.classList.remove("painel--aberto");
		painel.inert = true;
		var esconder = function () {
			if (!painel.classList.contains("painel--aberto")) {
				painel.hidden = true;
			}
		};
		if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			esconder();
		} else {
			window.setTimeout(esconder, 200);
		}
		document.body.classList.remove("sem-rolagem");
		fundo.forEach(function (parte) {
			parte.inert = false;
		});
		abrir.setAttribute("aria-expanded", "false");
		if (devolverFoco && focoAnterior) {
			focoAnterior.focus();
		}
	};

	if (painel && abrir && fechar) {
		abrir.addEventListener("click", function () {
			focoAnterior = document.activeElement && document.activeElement !== document.body ? document.activeElement : abrir;
			painel.inert = false;
			painel.hidden = false;
			document.body.classList.add("sem-rolagem");
			fundo.forEach(function (parte) {
				parte.inert = true;
			});
			abrir.setAttribute("aria-expanded", "true");
			void painel.offsetWidth; /* o navegador registra o estado inicial: assim a opacidade anima */
			painel.classList.add("painel--aberto");
			fechar.focus();
		});
		fechar.addEventListener("click", function () {
			fecharPainel(true);
		});
		painel.addEventListener("keydown", function (evento) {
			if (evento.key === "Escape") {
				fecharPainel(true);
				return;
			}
			if (evento.key !== "Tab") {
				return;
			}
			var lista = focaveis();
			var primeiro = lista[0];
			var ultimo = lista[lista.length - 1];
			if (evento.shiftKey && document.activeElement === primeiro) {
				evento.preventDefault();
				ultimo.focus();
			} else if (!evento.shiftKey && document.activeElement === ultimo) {
				evento.preventDefault();
				primeiro.focus();
			}
		});
	}

	/* 3. Fotos que aparecem ao carregar ------------------------------------ */
	Array.prototype.slice.call(document.querySelectorAll(".foto-entrada")).forEach(function (foto) {
		if (foto.complete && foto.naturalWidth > 0) {
			return; /* já chegou: aparece direto */
		}
		foto.classList.add("esperando");
		var mostrar = function () {
			foto.classList.remove("esperando");
		};
		foto.addEventListener("load", mostrar);
		foto.addEventListener("error", mostrar);
	});

	/* 4. Voltar ao topo (com anel de progresso da página) e sombra do cabeçalho ------------------------ */
	var topo = document.querySelector("[data-voltar-topo]");
	var cabecalho = document.querySelector(".cabecalho");
	var alturaPagina = 0;
	var medirPagina = function () {
		alturaPagina = raiz.scrollHeight;
	};
	var topoMarcado = false;
	var conferirTopo = function () {
		topoMarcado = false;
		var y = window.scrollY;
		if (topo) {
			topo.classList.toggle("visivel", y > window.innerHeight);
			/* no celular, com a barra do navegador recolhida, a área visível é o innerHeight */
			var rolavel = alturaPagina - Math.max(raiz.clientHeight, window.innerHeight || 0);
			topo.style.setProperty("--progresso", rolavel > 0 ? Math.min(1, y / rolavel).toFixed(4) : "0");
		}
		if (cabecalho) {
			cabecalho.classList.toggle("cabecalho--rolado", y > 8);
		}
	};
	if (topo) {
		topo.hidden = false; /* com JavaScript, o botão passa a aparecer/sumir pela classe "visivel" */
	}
	medirPagina();
	window.addEventListener("resize", medirPagina);
	window.addEventListener("load", medirPagina);
	if ("ResizeObserver" in window) {
		new window.ResizeObserver(function () {
			medirPagina();
			conferirTopo();
		}).observe(document.body);
	}
	window.addEventListener("scroll", function () {
		if (!topoMarcado) {
			topoMarcado = true;
			window.requestAnimationFrame(conferirTopo);
		}
	}, { passive: true });
	conferirTopo();

	/* 5. Aviso de privacidade ----------------------------------------------- */
	var aviso = document.querySelector("[data-aviso]");
	var avisoOk = document.querySelector("[data-aviso-ok]");
	if (aviso && avisoOk && ler("ihw-aviso-ok") !== "1") {
		aviso.hidden = false;
		raiz.classList.add("com-aviso");
		var medirAviso = function () {
			raiz.style.setProperty("--aviso-altura", aviso.offsetHeight + "px");
		};
		medirAviso();
		var observador = "ResizeObserver" in window ? new window.ResizeObserver(medirAviso) : null;
		if (observador) {
			observador.observe(aviso);
		} else {
			window.addEventListener("resize", medirAviso);
		}
		avisoOk.addEventListener("click", function () {
			guardar("ihw-aviso-ok", "1");
			aviso.hidden = true;
			raiz.classList.remove("com-aviso");
			if (observador) {
				observador.disconnect();
			}
		});
	}

	/* 6. Teclado em "botões" que não são <button> ---------------------------- */
	document.addEventListener("keydown", function (evento) {
		var alvo = evento.target;
		if ((evento.key === "Enter" || evento.key === " ") && alvo.matches && alvo.matches('[role="button"]:not(button):not(a)')) {
			evento.preventDefault();
			alvo.click();
		}
	});

	/* 7. WhatsApp ------------------------------------------------------------
	   Quando o Instituto tiver o número oficial, escreva só os dígitos aqui (com 55 e DDD, ex.: "5546999999999").
	   Enquanto estiver vazio, o botão leva à página de Contato. */
	var WHATSAPP = "";
	var whats = document.querySelector("[data-whatsapp]");
	if (whats && /^\d{12,13}$/.test(WHATSAPP)) {
		whats.href = "https://wa.me/" + WHATSAPP;
		whats.target = "_blank";
		whats.rel = "noopener";
	}
}());

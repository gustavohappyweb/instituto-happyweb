/*
 * preferencias.js — roda no <head>, sem defer, ANTES de a página aparecer:
 *  1. aplica a preferência "Texto maior" (a letra não "pula" de tamanho a cada página);
 *  2. liga o movimento (classe "mov" no <html>) só quando o aparelho aceita movimento, o navegador sabe
 *     fazê-lo e o endereço não pede "?estatico" (usado nas capturas). Se o funções-global.js não
 *     confirmar em 2,5 s (classe "mov-pronto"), a classe sai e tudo aparece parado: nada fica escondido.
 * No WordPress, entra como Código personalizado no <head>. Todo o resto está no funções-global.js.
 */
(function () {
	"use strict";
	var raiz = document.documentElement;
	try {
		if (window.localStorage.getItem("ihw-texto-maior") === "1") {
			raiz.classList.add("texto-maior");
		}
	} catch (erro) {
		/* navegador sem armazenamento: a página abre no tamanho normal */
	}

	try {
		var podeMover = window.matchMedia && window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
			"IntersectionObserver" in window &&
			window.CSS && window.CSS.supports && window.CSS.supports("translate", "0 1px") &&
			!/[?&]estatico\b/.test(window.location.search);
		if (podeMover) {
			raiz.classList.add("mov");
			window.setTimeout(function () {
				if (!raiz.classList.contains("mov-pronto")) {
					raiz.classList.remove("mov");
				}
			}, 2500);
		}
	} catch (erro) {
		raiz.classList.remove("mov");
	}
}());

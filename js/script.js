/* =====================================================================
   script.js — comportamento do site
   Faz 3 coisas: troca de tela (roda, toque, teclado, botões),
   troca dos procedimentos (setas) e o clique na figura (para celular).
   ===================================================================== */

// Tudo fica dentro de uma função (IIFE) para não misturar variáveis
// com outros scripts. Ela roda assim que o arquivo é carregado.
(function () {

  // ----- 1. DADOS -----------------------------------------------------

  // Ordem das telas. idx = posição atual nesta lista.
  var ordem = ["hero", "servicos", "contato"];

  // Monta o SVG do círculo: recebe só o desenho de dentro (d).
  function icone(d) {
    return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="30"/>' + d + '</svg>';
  }

  // Lista de procedimentos. Para adicionar um, copie uma linha e mude o texto.
  // t = título, p = descrição, i = desenho do círculo.
  var cards = [
    { t: "PEIM", p: "Tratamento para vasinhos e varizes: aplicação de solução esclerosante nos vasinhos, para melhorar o aspecto das pernas.", i: icone('<path d="M22 46 Q30 42 32 32 Q34 22 44 18"/><path d="M32 32 Q26 30 22 24"/><path d="M36 42 Q42 40 46 34"/>') },
    { t: "Skin booster", p: "Hidratação profunda para uma pele mais saudável, luminosa e com textura melhorada.", i: icone('<path d="M32 16 C32 16 22 28 22 36 A10 10 0 0 0 42 36 C42 28 32 16 32 16 Z"/>') },
    { t: "Microagulhamento capilar", p: "Estímulo no couro cabeludo para favorecer a circulação local e a absorção de ativos.", i: icone('<path d="M24 48 Q21 34 28 22"/><path d="M32 48 V20"/><path d="M40 48 Q43 34 36 22"/>') },
    { t: "Bioestimulador de colágeno", p: "Estímulo à produção natural de colágeno, para firmeza e sustentação da pele.", i: icone('<path d="M18 28 Q25 22 32 28 T46 28"/><path d="M18 38 Q25 32 32 38 T46 38"/>') },
    { t: "Intradermoterapia", p: "Aplicação de ativos diretamente na pele, indicada para gordura localizada e celulite.", i: icone('<circle cx="26" cy="28" r="4"/><circle cx="40" cy="26" r="3"/><circle cx="34" cy="40" r="5"/>') },
    { t: "Toxina botulínica", p: "Suaviza linhas de expressão e rugas dinâmicas, mantendo a naturalidade da expressão.", i: icone('<path d="M20 30 Q32 44 44 30"/><circle cx="24" cy="24" r="1.6"/><circle cx="40" cy="24" r="1.6"/>') },
    { t: "Preenchimento facial", p: "Reposição de volume e definição de contornos, com aspecto natural.", i: icone('<path d="M32 18 L44 32 L32 46 L20 32 Z"/><path d="M20 32 H44"/>') }
  ];

  // ----- 2. ESTADO (variáveis que guardam o que está acontecendo) -----

  var idx = 0;        // em qual tela estamos (0 = início)
  var atual = 0;      // qual procedimento aparece (0 = PEIM)
  var busy = false;   // trava: evita pular duas telas com um único gesto

  // ----- 3. PEGANDO ELEMENTOS DO HTML -------------------------------
  // getElementById pega um elemento pelo id="..." que está no index.html
  var body = document.body;
  var num = document.getElementById("num");
  var tit = document.getElementById("titulo");
  var txt = document.getElementById("texto");

  // ----- 4. FUNÇÕES ---------------------------------------------------

  // Escreve na tela o procedimento que está em "atual"
  function pintar() {
    var c = cards[atual];
    num.textContent = "0" + (atual + 1) + " / 0" + cards.length;  // ex.: "01 / 07"
    tit.textContent = c.t;
    txt.textContent = c.p;
    document.getElementById("icone").innerHTML = c.i;             // desenho do círculo
  }

  // Vai para a tela de número i (0, 1 ou 2)
  // forcar = true ignora a trava (usado pelos botões do menu)
  function ir(i, forcar) {
    if (i < 0 || i >= ordem.length) return;   // fora da lista: não faz nada
    if (busy && !forcar) return;              // ainda está animando: espera
    idx = i;
    body.dataset.view = ordem[i];             // muda data-view na <body> → o CSS faz a animação
    busy = true;
    setTimeout(function () { busy = false; }, 900);  // libera depois de 0,9 s
  }

  // Anda uma tela para frente (d = 1) ou para trás (d = -1)
  function mudar(d) { ir(idx + d); }

  // Troca de procedimento. O % faz voltar ao início ou ir ao fim da lista.
  function cartao(d) {
    atual = (atual + d + cards.length) % cards.length;
    pintar();
  }

  // ----- 5. CONTROLES -------------------------------------------------

  // Roda do mouse: desce → próxima tela; sobe → tela anterior.
  // passive:false permite cancelar o scroll da página (preventDefault).
  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 18) return;   // ignora movimentos pequenos
    mudar(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // Toque: guarda onde o dedo começou e onde soltou.
  var y0 = null;
  window.addEventListener("touchstart", function (e) {
    y0 = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", function (e) {
    if (y0 === null) return;
    var dy = y0 - e.changedTouches[0].clientY;   // positivo = deslizou para cima
    y0 = null;
    if (Math.abs(dy) > 40) mudar(dy > 0 ? 1 : -1);
  }, { passive: true });

  // Teclado: setas e Page Up/Down trocam de tela.
  // Setas esquerda/direita trocam de procedimento (só na tela de procedimentos).
  window.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowDown" || k === "PageDown") { e.preventDefault(); mudar(1); }
    else if (k === "ArrowUp" || k === "PageUp") { e.preventDefault(); mudar(-1); }
    else if (k === "ArrowRight" && ordem[idx] === "servicos") cartao(1);
    else if (k === "ArrowLeft" && ordem[idx] === "servicos") cartao(-1);
  });

  // Botões do menu: cada um tem data-go="hero|servicos|contato" no HTML.
  // querySelectorAll pega todos eles de uma vez.
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () {
      ir(ordem.indexOf(b.dataset.go), true);   // indexOf acha a posição do nome na lista
    });
  });

  // Setas de procedimento
  document.getElementById("ant").addEventListener("click", function () { cartao(-1); });
  document.getElementById("prox").addEventListener("click", function () { cartao(1); });

  // Clique na figura alterna a classe "ativo" (troca verde ↔ jaleco no toque)
  var fig = document.getElementById("figura");
  fig.addEventListener("click", function () {
    fig.classList.toggle("ativo");
  });

  // ----- 6. INÍCIO ----------------------------------------------------
  body.dataset.view = "hero";   // começa na tela inicial
  pintar();                     // preenche o procedimento 1 (já fica pronto)

})();

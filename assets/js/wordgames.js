/* =========================================================
   wordgames.js: os três desafios de palavra, um novo por dia.

   Palavrinha: adivinhar a palavra de cinco letras em seis tentativas.
   Contexto:   adivinhar a palavra secreta pela proximidade dos palpites.
   Teia:       separar dezesseis palavras em quatro grupos de quatro.

   Os três guardam o andamento no aparelho, então ela pode fechar e
   voltar depois sem perder o que já fez. Os pontos de amizade só vêm
   na primeira vez que ela termina o desafio do dia.
   ========================================================= */
const WordGames = (() => {
  const W = () => WordBank;

  /* ---------- coisas que os três usam ---------- */
  const hoje = () => Store.dayNumber();

  /** lê o andamento de hoje, já com os campos que o jogo espera */
  function estadoDe(child, jogo, inicial) {
    const salvo = Store.dailyGame(child.id, jogo);
    return Object.assign({}, inicial, salvo || {});
  }

  const guardar = (child, jogo, estado) => Store.saveDailyGame(child.id, jogo, estado);

  /**
   * Fecha o desafio: dá os pontos só na primeira vez do dia e mostra a
   * tela de fim de jogo padrão dos joguinhos.
   */
  function encerrar(child, jogo, estado, dados) {
    const primeiraVez = !estado.contabilizado;
    estado.contabilizado = true;
    guardar(child, jogo, estado);
    Games.fim(child, jogo, dados.pontos, primeiraVez ? dados.xp : 0, dados.resumo, {
      extra: dados.extra,
      titulo: dados.titulo,
    });
  }

  /** faixa com a sequência de dias, igual para os três */
  function faixaDoDia(child, jogo, texto) {
    const seq = Store.dailyStreak(child.id, jogo);
    return `
      <div class="game-hud">
        <span class="chip lime">Desafio de ${Store.labelDate(Store.today()).toLowerCase()}</span>
        ${seq > 1 ? `<span class="chip neutral">${seq} dias seguidos</span>` : ''}
        ${texto ? `<span class="chip neutral">${UI.esc(texto)}</span>` : ''}
      </div>`;
  }

  /* =========================================================
     1) PALAVRINHA
     ========================================================= */
  const LINHAS_TECLADO = ['QWERTYUIOP', 'ASDFGHJKLÇ', 'ZXCVBNM'];
  const TENTATIVAS = 6;

  function palavrinha(child) {
    const resposta = W().doDia(W().PALAVRAS, hoje());
    const estado = estadoDe(child, 'palavrinha', { tentativas: [], ganhou: false, contabilizado: false });
    if (estado.resposta && estado.resposta !== resposta) {
      // virou o dia com a folha aberta: começa de novo com a palavra nova
      estado.tentativas = [];
      estado.ganhou = false;
      estado.contabilizado = false;
    }
    estado.resposta = resposta;

    const acabou = () => estado.ganhou || estado.tentativas.length >= TENTATIVAS;
    let atual = '';

    const linhaHtml = (palpite, estados) => `
      <div class="pl-linha">
        ${Array.from({ length: 5 }, (_, i) => `
          <span class="pl-letra ${estados ? estados[i] : ''} ${!estados && palpite[i] ? 'digitando' : ''}"
                style="animation-delay:${estados ? i * 90 : 0}ms">${palpite[i] || ''}</span>`).join('')}
      </div>`;

    function tabuleiro() {
      const feitas = estado.tentativas.map((t) => linhaHtml(t, W().conferir(t, resposta)));
      const emCurso = acabou() ? [] : [linhaHtml(atual.padEnd(5, ' ').split('').map((c) => c.trim()))];
      const vazias = Array.from(
        { length: Math.max(0, TENTATIVAS - feitas.length - emCurso.length) },
        () => linhaHtml([]),
      );
      return feitas.concat(emCurso, vazias).join('');
    }

    function teclado() {
      const mapa = W().tecladoDe(estado.tentativas, resposta);
      return LINHAS_TECLADO.map((linha, i) => `
        <div class="pl-teclado-linha">
          ${i === 2 ? '<button type="button" class="pl-tecla larga" data-tecla="ENTER">Enviar</button>' : ''}
          ${linha.split('').map((L) => {
            const chave = W().limpar(L) || L;
            return `<button type="button" class="pl-tecla ${mapa[chave] || ''}" data-tecla="${L}">${L}</button>`;
          }).join('')}
          ${i === 2 ? '<button type="button" class="pl-tecla larga" data-tecla="APAGAR">Apagar</button>' : ''}
        </div>`).join('');
    }

    UI.openSheet({
      title: 'Palavrinha',
      subtitle: 'Uma palavra de cinco letras por dia. Você tem seis tentativas.',
      body: `
        ${faixaDoDia(child, 'palavrinha')}
        <div class="pl-board" data-board>${tabuleiro()}</div>
        <p class="tiny center pl-aviso" data-aviso>Verde é letra certa no lugar certo. Amarelo é letra certa no lugar errado.</p>
        <div class="pl-teclado" data-teclado>${teclado()}</div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair</button>',
      onMount(sheet) {
        const board = sheet.querySelector('[data-board]');
        const tec = sheet.querySelector('[data-teclado]');
        const aviso = sheet.querySelector('[data-aviso]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        const redesenhar = () => { board.innerHTML = tabuleiro(); tec.innerHTML = teclado(); ligarTeclas(); };
        const dizer = (texto, ruim) => {
          aviso.textContent = texto;
          aviso.classList.toggle('ruim', !!ruim);
        };

        function digitar(letra) {
          if (acabou() || atual.length >= 5) return;
          atual += W().limpar(letra);
          board.innerHTML = tabuleiro();
        }
        function apagar() {
          if (acabou()) return;
          atual = atual.slice(0, -1);
          board.innerHTML = tabuleiro();
        }
        function enviar() {
          if (acabou()) return;
          if (atual.length < 5) {
            dizer('Faltam letras para completar a palavra.', true);
            const linha = board.children[estado.tentativas.length];
            if (linha) {
              linha.classList.remove('treme');
              void linha.offsetWidth;
              linha.classList.add('treme');
            }
            return;
          }
          const palpite = atual;
          estado.tentativas.push(palpite);
          atual = '';
          if (palpite === resposta) estado.ganhou = true;
          guardar(child, 'palavrinha', estado);
          redesenhar();

          if (!W().conhecida(palpite) && !estado.ganhou) {
            dizer('Essa eu não conhecia, mas vale a tentativa.');
          } else {
            dizer('Verde é letra certa no lugar certo. Amarelo é letra certa no lugar errado.');
          }

          if (estado.ganhou) {
            Effects.burst('approved');
            const n = estado.tentativas.length;
            setTimeout(() => encerrar(child, 'palavrinha', estado, {
              pontos: Math.max(20, 120 - (n - 1) * 18),
              xp: Math.max(3, 8 - n),
              resumo: n === 1 ? 'de primeira' : `em ${n} tentativas`,
              titulo: 'Acertou a palavrinha!',
            }), 900);
          } else if (estado.tentativas.length >= TENTATIVAS) {
            setTimeout(() => encerrar(child, 'palavrinha', estado, {
              pontos: 10, xp: 2,
              resumo: `a palavra era ${resposta}`,
              titulo: 'Quase!',
              extra: `<div class="note">A palavra de hoje era <b>${resposta}</b>. Amanhã tem outra.</div>`,
            }), 900);
          }
        }

        function ligarTeclas() {
          tec.querySelectorAll('[data-tecla]').forEach((b) => b.addEventListener('click', () => {
            const t = b.getAttribute('data-tecla');
            if (t === 'ENTER') return enviar();
            if (t === 'APAGAR') return apagar();
            return digitar(t);
          }));
        }
        ligarTeclas();

        // teclado de verdade, para quem estiver no computador
        const noTeclado = (ev) => {
          if (!document.body.contains(sheet)) return;
          if (ev.key === 'Enter') { ev.preventDefault(); enviar(); }
          else if (ev.key === 'Backspace') { ev.preventDefault(); apagar(); }
          else if (/^[a-zA-ZçÇáéíóúâêôãõà]$/.test(ev.key)) digitar(ev.key);
        };
        document.addEventListener('keydown', noTeclado);
        sheet._soltarTeclado = () => document.removeEventListener('keydown', noTeclado);

        if (acabou()) {
          dizer(estado.ganhou
            ? 'Você já acertou a palavra de hoje. Amanhã tem outra.'
            : `A palavra de hoje era ${resposta}. Amanhã tem outra.`);
        }
      },
      onClose(sheet) { if (sheet && sheet._soltarTeclado) sheet._soltarTeclado(); },
    });
  }

  /* =========================================================
     2) CONTEXTO
     ========================================================= */
  function contexto(child) {
    const desafio = W().doDia(W().CONTEXTO, hoje());
    const total = W().totalContexto(desafio);
    const estado = estadoDe(child, 'contexto', { palpites: [], ganhou: false, dicas: 0, contabilizado: false });
    if (estado.alvo && estado.alvo !== desafio.palavra) {
      estado.palpites = []; estado.ganhou = false; estado.dicas = 0; estado.contabilizado = false;
    }
    estado.alvo = desafio.palavra;

    /** o quanto a palavra está perto, de 0 a 100 */
    const calor = (nota) => Math.max(2, Math.round(100 - ((nota - 1) / total) * 100));
    const faixa = (nota) => (nota === 1 ? 'acertou' : nota <= 12 ? 'quente' : nota <= 40 ? 'morno' : 'frio');
    const recado = (nota) => (nota === 1 ? 'é essa!'
      : nota <= 5 ? 'quase em cima'
        : nota <= 12 ? 'tá quente'
          : nota <= 40 ? 'tá morno'
            : 'tá frio');

    function listaHtml() {
      const ordenados = estado.palpites.slice().sort((a, b) => a.nota - b.nota);
      if (!ordenados.length) {
        return '<p class="tiny center" style="color:var(--muted)">Escreva uma palavra qualquer para começar.</p>';
      }
      return `<div class="ctx-lista">${ordenados.map((g) => `
        <div class="ctx-item ${faixa(g.nota)} ${g.ultimo ? 'novo' : ''}">
          <span class="ctx-pos">${g.nota}</span>
          <span class="ctx-palavra grow">${UI.esc(g.palavra)}</span>
          <span class="ctx-barra"><i style="width:${calor(g.nota)}%"></i></span>
          <span class="tiny ctx-recado">${recado(g.nota)}</span>
        </div>`).join('')}</div>`;
    }

    UI.openSheet({
      title: 'Contexto',
      subtitle: 'Existe uma palavra secreta hoje. Quanto menor o número, mais perto você chegou.',
      body: `
        ${faixaDoDia(child, 'contexto')}
        <form class="ctx-form" data-form autocomplete="off">
          <input class="input grow" name="palpite" placeholder="escreva uma palavra" maxlength="22"
                 autocapitalize="none" autocorrect="off" spellcheck="false" />
          <button class="btn btn-primary" type="submit">Tentar</button>
        </form>
        <div class="ctx-status" data-status></div>
        <div class="ctx-dicas" data-dicas></div>
        <div data-lista>${listaHtml()}</div>`,
      actions: `
        <button class="btn btn-ghost" data-dica>Pedir dica</button>
        <button class="btn btn-ghost" data-sair>Sair</button>`,
      onMount(sheet) {
        const form = sheet.querySelector('[data-form]');
        const campo = form.querySelector('input');
        const lista = sheet.querySelector('[data-lista]');
        const status = sheet.querySelector('[data-status]');
        const caixaDicas = sheet.querySelector('[data-dicas]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        const mostrarDicas = () => {
          caixaDicas.innerHTML = desafio.dicas.slice(0, estado.dicas)
            .map((d) => `<div class="note">${UI.esc(d)}</div>`).join('');
        };
        const dizer = (texto, tipo) => {
          status.innerHTML = texto ? `<span class="chip ${tipo || 'neutral'}">${UI.esc(texto)}</span>` : '';
        };

        mostrarDicas();
        if (estado.ganhou) dizer(`Você já achou: ${desafio.palavra}`, 'lime');
        else dizer(`${estado.palpites.length} palpite(s) hoje`);

        sheet.querySelector('[data-dica]').addEventListener('click', () => {
          if (estado.dicas >= desafio.dicas.length) return UI.toast('As dicas de hoje já acabaram.');
          estado.dicas += 1;
          guardar(child, 'contexto', estado);
          mostrarDicas();
          return undefined;
        });

        form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          if (estado.ganhou) return;
          const bruto = campo.value.trim().toUpperCase();
          const limpa = W().limpar(bruto);
          campo.value = '';
          campo.focus();
          if (!limpa) return;

          if (estado.palpites.some((g) => W().limpar(g.palavra) === limpa)) {
            dizer('Você já tentou essa.', 'neutral');
            return;
          }
          const nota = W().notaContexto(desafio, limpa);
          if (nota === null) {
            dizer('Essa palavra não entra no campo de hoje. Tente outra.', 'warn');
            return;
          }
          estado.palpites.forEach((g) => { g.ultimo = false; });
          estado.palpites.push({ palavra: bruto, nota, ultimo: true });
          if (nota === 1) estado.ganhou = true;
          guardar(child, 'contexto', estado);
          lista.innerHTML = listaHtml();

          if (estado.ganhou) {
            Effects.burst('goal');
            const n = estado.palpites.length;
            dizer(`É isso! A palavra era ${desafio.palavra}.`, 'lime');
            setTimeout(() => encerrar(child, 'contexto', estado, {
              pontos: Math.max(20, 160 - n * 4 - estado.dicas * 15),
              xp: Math.max(3, 7 - Math.floor(n / 10) - estado.dicas),
              resumo: `em ${n} palpite(s)`,
              titulo: 'Achou a palavra!',
            }), 800);
          } else {
            dizer(`${bruto}: posição ${nota} de ${total}. ${recado(nota)}`, nota <= 12 ? 'lime' : 'neutral');
          }
        });
        setTimeout(() => campo.focus(), 120);
      },
    });
  }

  /* =========================================================
     3) TEIA
     ========================================================= */
  const ERROS_MAX = 4;

  function teia(child) {
    const desafio = W().doDia(W().TEIA, hoje());
    const chave = desafio.grupos.map((g) => g.titulo).join('|');
    const estado = estadoDe(child, 'teia', { achados: [], erros: 0, ganhou: false, contabilizado: false });
    if (estado.chave && estado.chave !== chave) {
      estado.achados = []; estado.erros = 0; estado.ganhou = false; estado.contabilizado = false; estado.ordem = null;
    }
    estado.chave = chave;

    const todas = desafio.grupos.flatMap((g) => g.palavras);
    if (!estado.ordem || estado.ordem.length !== todas.length) {
      // a ordem é sorteada uma vez por dia e fica guardada
      estado.ordem = todas.slice().sort(() => Math.random() - 0.5);
    }
    const grupoDe = (p) => desafio.grupos.find((g) => g.palavras.indexOf(p) !== -1);
    const resolvido = (titulo) => estado.achados.indexOf(titulo) !== -1;

    let escolhidas = [];

    const achadosHtml = () => estado.achados.map((titulo) => {
      const g = desafio.grupos.find((x) => x.titulo === titulo);
      return `
        <div class="teia-achado ${g.grad}">
          <div class="nm">${UI.esc(g.titulo)}</div>
          <div class="tiny">${g.palavras.map(UI.esc).join(' • ')}</div>
        </div>`;
    }).join('');

    const gradeHtml = () => estado.ordem
      .filter((p) => !resolvido(grupoDe(p).titulo))
      .map((p) => `
        <button type="button" class="teia-peca ${escolhidas.indexOf(p) !== -1 ? 'on' : ''}" data-peca="${UI.esc(p)}">
          ${UI.esc(p)}
        </button>`).join('');

    const vidasHtml = () => Array.from({ length: ERROS_MAX }, (_, i) =>
      `<span class="teia-vida ${i < estado.erros ? 'gasta' : ''}"></span>`).join('');

    UI.openSheet({
      title: 'Teia',
      subtitle: 'Junte as dezesseis palavras em quatro grupos de quatro.',
      body: `
        ${faixaDoDia(child, 'teia')}
        <div class="teia-achados" data-achados>${achadosHtml()}</div>
        <div class="teia-grade" data-grade>${gradeHtml()}</div>
        <div class="teia-rodape">
          <span class="tiny">Tentativas que sobram</span>
          <span class="teia-vidas" data-vidas>${vidasHtml()}</span>
        </div>
        <p class="tiny center" data-aviso style="color:var(--muted)">Toque em quatro palavras que combinam e depois em Agrupar.</p>`,
      actions: `
        <button class="btn btn-ghost" data-limpar>Limpar</button>
        <button class="btn btn-primary" data-agrupar disabled>Agrupar</button>`,
      onMount(sheet) {
        const grade = sheet.querySelector('[data-grade]');
        const caixaAchados = sheet.querySelector('[data-achados]');
        const vidas = sheet.querySelector('[data-vidas]');
        const aviso = sheet.querySelector('[data-aviso]');
        const btnAgrupar = sheet.querySelector('[data-agrupar]');

        const acabou = () => estado.ganhou || estado.erros >= ERROS_MAX;

        function redesenhar() {
          caixaAchados.innerHTML = achadosHtml();
          grade.innerHTML = gradeHtml();
          vidas.innerHTML = vidasHtml();
          btnAgrupar.disabled = escolhidas.length !== 4 || acabou();
          ligarPecas();
        }

        function ligarPecas() {
          grade.querySelectorAll('[data-peca]').forEach((b) => b.addEventListener('click', () => {
            if (acabou()) return;
            const p = b.getAttribute('data-peca');
            const i = escolhidas.indexOf(p);
            if (i !== -1) escolhidas.splice(i, 1);
            else if (escolhidas.length < 4) escolhidas.push(p);
            else return;
            b.classList.toggle('on');
            btnAgrupar.disabled = escolhidas.length !== 4;
          }));
        }
        ligarPecas();

        sheet.querySelector('[data-limpar]').addEventListener('click', () => {
          escolhidas = [];
          redesenhar();
        });

        btnAgrupar.addEventListener('click', () => {
          if (escolhidas.length !== 4 || acabou()) return;
          const titulos = escolhidas.map((p) => grupoDe(p).titulo);
          const certo = titulos.every((t) => t === titulos[0]);

          if (certo) {
            estado.achados.push(titulos[0]);
            escolhidas = [];
            if (estado.achados.length === desafio.grupos.length) estado.ganhou = true;
            guardar(child, 'teia', estado);
            Effects.burst('task', caixaAchados);
            redesenhar();
            aviso.textContent = estado.ganhou ? 'Fechou a teia inteira!' : 'Isso! Falta menos.';
            if (estado.ganhou) {
              setTimeout(() => encerrar(child, 'teia', estado, {
                pontos: Math.max(20, 120 - estado.erros * 25),
                xp: Math.max(3, 8 - estado.erros * 2),
                resumo: estado.erros ? `com ${estado.erros} erro(s)` : 'sem errar nenhuma',
                titulo: 'Teia completa!',
              }), 700);
            }
            return;
          }

          // quantas do palpite são do mesmo grupo, para dar o aviso do "faltou uma"
          const contagem = {};
          titulos.forEach((t) => { contagem[t] = (contagem[t] || 0) + 1; });
          const maior = Math.max.apply(null, Object.keys(contagem).map((t) => contagem[t]));
          estado.erros += 1;
          guardar(child, 'teia', estado);
          grade.querySelectorAll('.teia-peca.on').forEach((b) => {
            b.classList.remove('treme');
            void b.offsetWidth;
            b.classList.add('treme');
          });
          vidas.innerHTML = vidasHtml();
          aviso.textContent = maior === 3 ? 'Faltou uma! Três estão no mesmo grupo.' : 'Esse grupo não fecha. Tente outro corte.';

          if (estado.erros >= ERROS_MAX) {
            // mostra a resposta e encerra
            desafio.grupos.forEach((g) => { if (!resolvido(g.titulo)) estado.achados.push(g.titulo); });
            guardar(child, 'teia', estado);
            escolhidas = [];
            setTimeout(() => {
              redesenhar();
              encerrar(child, 'teia', estado, {
                pontos: 10, xp: 2,
                resumo: 'as tentativas acabaram',
                titulo: 'Fim das tentativas',
                extra: '<div class="note">Olha aí como era a teia de hoje. Amanhã tem outra.</div>',
              });
            }, 700);
          }
        });

        if (acabou()) {
          aviso.textContent = estado.ganhou
            ? 'Você já fechou a teia de hoje. Amanhã tem outra.'
            : 'As tentativas de hoje acabaram. Amanhã tem outra.';
        }
      },
    });
  }

  /* ---------- resumo para o cartão do jogo na lista ---------- */
  function situacao(child, jogo) {
    const dados = Store.dailyGame(child.id, jogo);
    if (dados && dados.ganhou) return 'Você já fechou o de hoje';
    if (jogo === 'palavrinha' && dados && (dados.tentativas || []).length >= TENTATIVAS) return 'O de hoje acabou';
    if (jogo === 'teia' && dados && dados.erros >= ERROS_MAX) return 'O de hoje acabou';
    if (dados) return 'Você começou o de hoje';
    return 'Ainda não jogou hoje';
  }

  return { palavrinha, contexto, teia, situacao };
})();

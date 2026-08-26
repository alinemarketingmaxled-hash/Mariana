/* =========================================================
   games.js: joguinhos do bichinho.
   Cada partida rende pontos de amizade, com teto diário para
   o nível continuar significando esforço de verdade.
   ========================================================= */
const Games = (() => {
  const LISTA = [
    {
      id: 'matematica',
      nome: 'Conta rápida',
      desc: 'Contas de somar, subtrair, multiplicar e dividir. Acertou seguido, fica mais difícil.',
      icon: 'brain',
      grad: 'g8',
    },
    {
      id: 'bola',
      nome: 'Pega a bola',
      desc: 'As bolinhas caem do céu. Toque em todas antes que cheguem no chão.',
      icon: 'ball',
      grad: 'g5',
    },
    {
      id: 'memoria',
      nome: 'Jogo da memória',
      desc: 'Vire as cartas de duas em duas e encontre todos os pares.',
      icon: 'puzzle',
      grad: 'g6',
    },
    {
      id: 'sequencia',
      nome: 'Repete comigo',
      desc: 'O bichinho mostra uma sequência de cores. Repita na mesma ordem.',
      icon: 'star',
      grad: 'g4',
    },
  ];

  const jogo = (id) => LISTA.find((g) => g.id === id) || LISTA[0];

  /* ---------- tela da aba ---------- */
  let aba = 'jogos';

  function view(child) {
    return `
      <div class="seg-mini" role="group" aria-label="Jogos ou estudo">
        <button data-play-tab="jogos" aria-pressed="${aba === 'jogos'}">Joguinhos</button>
        <button data-play-tab="quiz" aria-pressed="${aba === 'quiz'}">Quiz das matérias</button>
      </div>
      <div class="mt16">${aba === 'quiz' ? Quiz.view(child) : jogosView(child)}</div>`;
  }

  function jogosView(child) {
    const pet = Store.petOf(child.id);
    const recordes = pet.best || {};
    const ganhos = Store.petGamesToday(child.id);
    return `
      <section class="hero">
        <div class="hero-top">
          <div class="hero-ico">${Icons.svg('ball')}</div>
          <div class="grow">
            <div class="label">Joguinhos com ${UI.esc(pet.name)}</div>
            <div class="value">${ganhos.xp}<small style="margin-left:6px">de ${ganhos.max} pontos hoje</small></div>
          </div>
        </div>
        <div class="bar mt16"><i style="width:${Math.round((ganhos.xp / ganhos.max) * 100)}%"></i></div>
        <p class="tiny mt8" style="color:var(--panel-muted)">
          Cada partida rende pontos de amizade. O teto do dia evita que o nível venha só de jogo.
        </p>
      </section>

      <div class="section-title"><h3>Escolha a brincadeira</h3></div>
      <div class="list">
        ${LISTA.map((g) => `
          <button class="game-card ${g.grad}" data-game="${g.id}">
            <span class="game-ico">${Icons.svg(g.icon)}</span>
            <span class="grow">
              <span class="nm block">${UI.esc(g.nome)}</span>
              <span class="tiny block game-desc">${UI.esc(g.desc)}</span>
              <span class="tiny block game-best">
                ${recordes[g.id] ? `Seu recorde: ${recordes[g.id]}` : 'Ainda sem recorde'}
              </span>
            </span>
            <span class="game-play">${Icons.svg('chevron')}</span>
          </button>`).join('')}
      </div>`;
  }

  /* ---------- fim de partida ---------- */
  function terminar(child, gameId, pontos, xpBruto, resumo) {
    const res = Store.petGameResult(child.id, gameId, pontos, xpBruto);
    UI.closeSheet();
    const pet = Store.petOf(child.id);
    UI.openSheet({
      title: res.recorde ? 'Recorde novo!' : 'Fim de jogo',
      subtitle: `${jogo(gameId).nome} • ${resumo}`,
      body: `
        <div class="game-end">
          ${Pet.svg(child, 130, res.xp > 0 ? 'festa' : 'feliz')}
          <div class="stat-row" style="width:100%">
            <div class="stat"><div class="k">pontos</div><div class="v">${pontos}</div></div>
            <div class="stat"><div class="k">recorde</div><div class="v">${(pet.best || {})[gameId] || pontos}</div></div>
            <div class="stat"><div class="k">amizade</div><div class="v">+${res.xp}</div></div>
          </div>
          ${res.xp === 0 ? `<div class="note">${UI.esc(pet.name)} já ganhou todos os pontos de hoje, mas adorou jogar de novo.</div>` : ''}
        </div>`,
      actions: `
        <button class="btn btn-ghost" data-again>Jogar de novo</button>
        <button class="btn btn-primary" data-ok>Pronto</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
        sheet.querySelector('[data-again]').addEventListener('click', () => { UI.closeSheet(); abrir(child, gameId); });
      },
      onClose() { App.render(); },
    });
    if (res.xp > 0) Effects.burst(res.levelUp ? 'goal' : 'approved');
    if (res.levelUp) UI.toast(`${pet.name} subiu de nível!`, 'ok');
  }

  /* ---------- jogo 1: pega a bola ---------- */
  function bola(child) {
    const DURACAO = 30;
    let pontos = 0;
    let perdidas = 0;
    let restante = DURACAO;
    let raf = null;
    let spawn = null;
    let relogio = null;
    let vivo = true;
    const bolas = [];

    UI.openSheet({
      title: 'Pega a bola',
      subtitle: 'Toque nas bolinhas antes que elas cheguem no chão. Três perdidas encerram.',
      body: `
        <div class="game-hud">
          <span class="chip lime" data-pontos>0 pontos</span>
          <span class="chip neutral" data-tempo>${DURACAO}s</span>
          <span class="chip pending" data-vidas>3 vidas</span>
        </div>
        <div class="game-stage" data-stage>
          <div class="game-floor"></div>
          <div class="game-pet">${Pet.svg(child, 74, 'feliz')}</div>
        </div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair do jogo</button>',
      onMount(sheet) {
        const stage = sheet.querySelector('[data-stage]');
        const elPontos = sheet.querySelector('[data-pontos]');
        const elTempo = sheet.querySelector('[data-tempo]');
        const elVidas = sheet.querySelector('[data-vidas]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        const cores = ['g1', 'g2', 'g3', 'g5', 'g6', 'g7'];

        function nova() {
          if (!vivo) return;
          const b = document.createElement('button');
          b.className = `game-ball ${cores[Math.floor(Math.random() * cores.length)]}`;
          b.style.left = `${8 + Math.random() * 78}%`;
          b.dataset.y = '0';
          b.dataset.v = String(1.1 + Math.random() * 1.5 + pontos * 0.012);
          b.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            if (b.dataset.morta) return;
            b.dataset.morta = '1';
            pontos += 1;
            elPontos.textContent = `${pontos} pontos`;
            b.classList.add('estourou');
            Effects.burst('task', b);
            setTimeout(() => b.remove(), 220);
            bolas.splice(bolas.indexOf(b), 1);
          });
          stage.appendChild(b);
          bolas.push(b);
        }

        function passo() {
          if (!vivo) return;
          const alturaMax = stage.clientHeight - 46;
          for (let i = bolas.length - 1; i >= 0; i--) {
            const b = bolas[i];
            const y = Number(b.dataset.y) + Number(b.dataset.v);
            b.dataset.y = String(y);
            b.style.transform = `translateY(${y}px)`;
            if (y >= alturaMax) {
              b.remove();
              bolas.splice(i, 1);
              perdidas += 1;
              elVidas.textContent = `${Math.max(0, 3 - perdidas)} vidas`;
              stage.classList.remove('tremeu');
              void stage.offsetWidth;
              stage.classList.add('tremeu');
              if (perdidas >= 3) return fim();
            }
          }
          raf = requestAnimationFrame(passo);
        }

        function fim() {
          if (!vivo) return;
          vivo = false;
          cancelAnimationFrame(raf);
          clearInterval(spawn);
          clearInterval(relogio);
          terminar(child, 'bola', pontos, Math.floor(pontos / 3),
            perdidas >= 3 ? 'você perdeu 3 bolinhas' : 'tempo esgotado');
        }

        spawn = setInterval(nova, 780);
        relogio = setInterval(() => {
          restante -= 1;
          elTempo.textContent = `${restante}s`;
          if (restante <= 0) fim();
        }, 1000);
        nova();
        raf = requestAnimationFrame(passo);
      },
      onClose() {
        vivo = false;
        cancelAnimationFrame(raf);
        clearInterval(spawn);
        clearInterval(relogio);
      },
    });
  }

  /* ---------- jogo: conta rápida ---------- */
  function matematica(child) {
    const DURACAO = 60;
    let pontos = 0;
    let sequencia = 0;
    let erros = 0;
    let restante = DURACAO;
    let relogio = null;
    let travado = false;
    let atual = null;

    const sortear = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

    /** a dificuldade sobe conforme a criança acerta seguido */
    function novaConta() {
      const nivel = Math.min(4, Math.floor(sequencia / 3));
      let a, b, op, r;
      if (nivel === 0) { a = sortear(2, 20); b = sortear(2, 20); op = '+'; r = a + b; }
      else if (nivel === 1) { a = sortear(10, 40); b = sortear(2, a); op = '-'; r = a - b; }
      else if (nivel === 2) { a = sortear(2, 10); b = sortear(2, 10); op = '×'; r = a * b; }
      else if (nivel === 3) { b = sortear(2, 10); r = sortear(2, 10); a = b * r; op = '÷'; }
      else {
        a = sortear(11, 25); b = sortear(3, 12);
        if (Math.random() > 0.5) { op = '×'; r = a * b; } else { op = '+'; r = a + b; }
      }
      const certo = op === '÷' ? r : r;
      const alternativas = new Set([certo]);
      while (alternativas.size < 4) {
        const desvio = sortear(1, Math.max(4, Math.round(certo * 0.25)));
        const cand = Math.random() > 0.5 ? certo + desvio : certo - desvio;
        if (cand >= 0) alternativas.add(cand);
      }
      return {
        texto: `${a} ${op} ${b}`,
        certo,
        opcoes: Array.from(alternativas).sort(() => Math.random() - 0.5),
      };
    }

    UI.openSheet({
      title: 'Conta rápida',
      subtitle: 'Responda o máximo de contas em 60 segundos.',
      body: `
        <div class="game-hud">
          <span class="chip lime" data-pontos>0 acertos</span>
          <span class="chip neutral" data-tempo>${DURACAO}s</span>
          <span class="chip pending" data-seq>sequência 0</span>
        </div>
        <div class="quiz-pet-row">
          ${Pet.svg(child, 72, 'estudando')}
          <span class="pet-bubble" data-fala>Vamos treinar as contas!</span>
        </div>
        <div class="quiz-q conta" data-conta></div>
        <div class="quiz-options" data-opcoes></div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair do jogo</button>',
      onMount(sheet) {
        const elConta = sheet.querySelector('[data-conta]');
        const elOpcoes = sheet.querySelector('[data-opcoes]');
        const elPontos = sheet.querySelector('[data-pontos]');
        const elTempo = sheet.querySelector('[data-tempo]');
        const elSeq = sheet.querySelector('[data-seq]');
        const elFala = sheet.querySelector('[data-fala]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        function mostrar() {
          travado = false;
          atual = novaConta();
          elConta.textContent = `${atual.texto} = ?`;
          elOpcoes.innerHTML = atual.opcoes
            .map((n) => `<button class="quiz-op" data-op="${n}">${n}</button>`).join('');
          elOpcoes.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => {
            if (travado) return;
            travado = true;
            const certo = Number(b.getAttribute('data-op')) === atual.certo;
            b.classList.add(certo ? 'certa' : 'errada');
            if (certo) {
              pontos += 1;
              sequencia += 1;
              elPontos.textContent = `${pontos} acertos`;
              elSeq.textContent = `sequência ${sequencia}`;
              if (sequencia && sequencia % 3 === 0) elFala.textContent = 'Uau, ficou mais difícil agora!';
              Effects.burst('book', b);
            } else {
              erros += 1;
              sequencia = 0;
              elSeq.textContent = 'sequência 0';
              elFala.textContent = `Era ${atual.certo}. Respira e vem a próxima.`;
              elOpcoes.querySelectorAll('[data-op]').forEach((x) => {
                if (Number(x.getAttribute('data-op')) === atual.certo) x.classList.add('certa');
              });
            }
            setTimeout(mostrar, certo ? 420 : 1100);
          }));
        }

        relogio = setInterval(() => {
          restante -= 1;
          elTempo.textContent = `${restante}s`;
          if (restante <= 0) {
            clearInterval(relogio);
            terminar(child, 'matematica', pontos, Math.floor(pontos / 2),
              `${pontos} acertos e ${erros} erro(s)`);
          }
        }, 1000);
        mostrar();
      },
      onClose() { clearInterval(relogio); },
    });
  }

  /* ---------- jogo 2: memória ---------- */
  function memoria(child) {
    const icones = ['book', 'house', 'heart', 'star', 'ball', 'music', 'leaf', 'drop'];
    const escolhidos = icones.slice(0, 6);
    const cartas = escolhidos
      .concat(escolhidos)
      .map((ic, i) => ({ ic, id: i }))
      .sort(() => Math.random() - 0.5);
    const cores = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
    let virada = null;
    let travado = false;
    let jogadas = 0;
    let achados = 0;

    UI.openSheet({
      title: 'Jogo da memória',
      subtitle: 'Ache os 6 pares usando o menor número de jogadas.',
      body: `
        <div class="game-hud">
          <span class="chip lime" data-jogadas>0 jogadas</span>
          <span class="chip neutral" data-pares>0 de 6 pares</span>
        </div>
        <div class="memo-grid">
          ${cartas.map((c, i) => `
            <button class="memo-card" data-card="${i}" data-ic="${c.ic}">
              <span class="memo-face memo-back">${Icons.svg('star')}</span>
              <span class="memo-face memo-front ${cores[escolhidos.indexOf(c.ic)]}">${Icons.svg(c.ic)}</span>
            </button>`).join('')}
        </div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair do jogo</button>',
      onMount(sheet) {
        const elJogadas = sheet.querySelector('[data-jogadas]');
        const elPares = sheet.querySelector('[data-pares]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        sheet.querySelectorAll('[data-card]').forEach((card) => {
          card.addEventListener('click', () => {
            if (travado || card.classList.contains('aberta') || card.classList.contains('achou')) return;
            card.classList.add('aberta');
            if (!virada) { virada = card; return; }

            jogadas += 1;
            elJogadas.textContent = `${jogadas} jogadas`;
            if (virada.dataset.ic === card.dataset.ic) {
              virada.classList.add('achou');
              card.classList.add('achou');
              virada = null;
              achados += 1;
              elPares.textContent = `${achados} de 6 pares`;
              Effects.burst('task', card);
              if (achados === 6) {
                setTimeout(() => {
                  const pontos = Math.max(10, 100 - (jogadas - 6) * 6);
                  terminar(child, 'memoria', pontos, Math.max(2, Math.round(pontos / 14)),
                    `${jogadas} jogadas`);
                }, 500);
              }
            } else {
              travado = true;
              const anterior = virada;
              virada = null;
              setTimeout(() => {
                anterior.classList.remove('aberta');
                card.classList.remove('aberta');
                travado = false;
              }, 750);
            }
          });
        });
      },
    });
  }

  /* ---------- jogo 3: repete comigo ---------- */
  function sequencia(child) {
    const cores = [
      { id: 0, grad: 'g5' }, { id: 1, grad: 'g6' },
      { id: 2, grad: 'g8' }, { id: 3, grad: 'g2' },
    ];
    let ordem = [];
    let passo = 0;
    let mostrando = false;
    let rodada = 0;
    let timers = [];

    UI.openSheet({
      title: 'Repete comigo',
      subtitle: 'Olhe a sequência que o bichinho mostra e repita tocando na mesma ordem.',
      body: `
        <div class="game-hud">
          <span class="chip lime" data-rodada>Rodada 1</span>
          <span class="chip neutral" data-aviso>Olhe com atenção</span>
        </div>
        <div class="game-pet center">${Pet.svg(child, 92, 'feliz')}</div>
        <div class="simon">
          ${cores.map((c) => `<button class="simon-pad ${c.grad}" data-pad="${c.id}"></button>`).join('')}
        </div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair do jogo</button>',
      onMount(sheet) {
        const elRodada = sheet.querySelector('[data-rodada]');
        const elAviso = sheet.querySelector('[data-aviso]');
        const pads = Array.from(sheet.querySelectorAll('[data-pad]'));
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        const acender = (i, tempo = 420) => {
          const pad = pads[i];
          pad.classList.add('on');
          timers.push(setTimeout(() => pad.classList.remove('on'), tempo));
        };

        function mostrar() {
          mostrando = true;
          elAviso.textContent = 'Olhe com atenção';
          ordem.forEach((cor, i) => {
            timers.push(setTimeout(() => acender(cor), 620 * i + 400));
          });
          timers.push(setTimeout(() => {
            mostrando = false;
            elAviso.textContent = 'Sua vez!';
          }, 620 * ordem.length + 450));
        }

        function proxima() {
          rodada += 1;
          passo = 0;
          ordem.push(Math.floor(Math.random() * 4));
          elRodada.textContent = `Rodada ${rodada}`;
          mostrar();
        }

        pads.forEach((pad, i) => {
          pad.addEventListener('click', () => {
            if (mostrando) return;
            acender(i, 220);
            if (ordem[passo] === i) {
              passo += 1;
              if (passo === ordem.length) {
                Effects.burst('task', pad);
                timers.push(setTimeout(proxima, 700));
              }
            } else {
              const pontos = Math.max(0, rodada - 1);
              elAviso.textContent = 'Ops!';
              timers.push(setTimeout(() => {
                terminar(child, 'sequencia', pontos, Math.min(8, pontos),
                  `${pontos} rodada(s) certas`);
              }, 600));
              mostrando = true;
            }
          });
        });

        proxima();
      },
      onClose() { timers.forEach(clearTimeout); timers = []; },
    });
  }

  function abrir(child, id) {
    if (id === 'matematica') return matematica(child);
    if (id === 'memoria') return memoria(child);
    if (id === 'sequencia') return sequencia(child);
    return bola(child);
  }

  function bind(root, child, rerender) {
    root.querySelectorAll('[data-play-tab]').forEach((b) => b.addEventListener('click', () => {
      aba = b.getAttribute('data-play-tab');
      if (rerender) rerender(); else App.render();
    }));
    root.querySelectorAll('[data-game]').forEach((b) =>
      b.addEventListener('click', () => abrir(child, b.getAttribute('data-game'))));
    Quiz.bind(root, child);
  }

  return { view, bind, abrir, LISTA, aba: () => aba };
})();

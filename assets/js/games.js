/* =========================================================
   games.js: joguinhos do bichinho.
   Cada partida rende pontos de amizade, com teto diário para
   o nível continuar significando esforço de verdade.
   ========================================================= */
const Games = (() => {
  const LISTA = [
    {
      id: 'palavrinha',
      nome: 'Palavrinha',
      desc: 'Uma palavra nova de cinco letras por dia. Seis tentativas para achar.',
      icon: 'pencil',
      grad: 'g4',
      diario: true,
    },
    {
      id: 'contexto',
      nome: 'Contexto',
      desc: 'Existe uma palavra secreta. Cada palpite mostra o quanto você chegou perto.',
      icon: 'target',
      grad: 'g5',
      diario: true,
    },
    {
      id: 'teia',
      nome: 'Teia',
      desc: 'Dezesseis palavras para separar em quatro grupos que combinam.',
      icon: 'grid',
      grad: 'g6',
      diario: true,
    },
    {
      id: 'matematica',
      nome: 'Conta rápida',
      desc: 'Contas e equações no nível da sua série, do 5º ao 9º ano, em 60 segundos.',
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

  const jogo = (id) => LISTA.find((g) => g.id === String(id).split('_')[0]) || LISTA[0];

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
            ${g.diario ? '<span class="game-selo">todo dia</span>' : ''}
            <span class="game-ico">${Icons.svg(g.icon)}</span>
            <span class="grow">
              <span class="nm block">${UI.esc(g.nome)}</span>
              <span class="tiny block game-desc">${UI.esc(g.desc)}</span>
              <span class="tiny block game-best">
                ${(() => {
                  if (g.diario) {
                    const seq = Store.dailyStreak(child.id, g.id);
                    const situacao = WordGames.situacao(child, g.id);
                    return seq > 1 ? `${situacao} • ${seq} dias seguidos` : situacao;
                  }
                  const chaves = Object.keys(recordes).filter((k) => k.split('_')[0] === g.id);
                  const melhor = chaves.reduce((m, k) => Math.max(m, recordes[k]), 0);
                  return melhor ? `Seu recorde: ${melhor}` : 'Ainda sem recorde';
                })()}
              </span>
            </span>
            <span class="game-play">${Icons.svg('chevron')}</span>
          </button>`).join('')}
      </div>`;
  }

  /* ---------- fim de partida ---------- */
  function terminar(child, gameId, pontos, xpBruto, resumo, opcoes) {
    const op = opcoes || {};
    const res = Store.petGameResult(child.id, gameId, pontos, xpBruto);
    Store.logQuiz(child.id, {
      kind: 'jogo', name: jogo(gameId).nome,
      acertos: pontos, total: pontos, ms: jogoDesde ? jogoDesde() : 0,
    });
    jogoDesde = null;
    UI.closeSheet();
    const pet = Store.petOf(child.id);
    UI.openSheet({
      title: op.titulo || (res.recorde ? 'Recorde novo!' : 'Fim de jogo'),
      subtitle: `${jogo(gameId).nome} • ${resumo}`,
      body: `
        <div class="game-end">
          ${Pet.svg(child, 130, res.xp > 0 ? 'festa' : 'feliz')}
          <div class="stat-row" style="width:100%">
            <div class="stat"><div class="k">pontos</div><div class="v">${pontos}</div></div>
            <div class="stat"><div class="k">recorde</div><div class="v">${(pet.best || {})[gameId] || pontos}</div></div>
            <div class="stat"><div class="k">amizade</div><div class="v">+${res.xp}</div></div>
          </div>
          ${op.extra || ''}
          ${res.xp === 0 ? `<div class="note">${UI.esc(pet.name)} já ganhou todos os pontos de hoje, mas adorou jogar de novo.</div>` : ''}
        </div>`,
      actions: `
        ${jogo(gameId).diario ? '' : '<button class="btn btn-ghost" data-again>Jogar de novo</button>'}
        <button class="btn btn-primary" data-ok>Pronto</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
        const denovo = sheet.querySelector('[data-again]');
        if (denovo) denovo.addEventListener('click', () => { UI.closeSheet(); abrir(child, gameId); });
      },
      onClose() { App.render(); },
    });
    if (res.xp > 0) Effects.burst(res.levelUp ? 'goal' : 'approved');
    if (res.levelUp) {
      UI.toast(`${pet.name} subiu de nível!`, 'ok');
      Pet.comemorarFase(child, res.nivelAntes, res.nivelAgora);
    }
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

  /* ---------- jogo: conta rápida, com níveis por série ---------- */
  const SERIES = [
    { id: 'basico', label: 'Até o 5º ano', desc: 'as quatro operações' },
    { id: '6', label: '6º ano', desc: 'frações, porcentagem, MMC e MDC' },
    { id: '7', label: '7º ano', desc: 'números negativos e equações simples' },
    { id: '8', label: '8º ano', desc: 'equações com x dos dois lados, potências e raízes' },
    { id: '9', label: '9º ano', desc: 'equações do 2º grau, funções e Pitágoras' },
  ];

  const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const escolher = (lista) => lista[Math.floor(Math.random() * lista.length)];

  /** cada série tem seus próprios tipos de questão, todas de resposta inteira */
  const GERADORES = {
    basico: [
      () => { const a = rnd(5, 40), b = rnd(2, 40); return { t: `${a} + ${b}`, r: a + b }; },
      () => { const a = rnd(12, 60), b = rnd(2, a); return { t: `${a} - ${b}`, r: a - b }; },
      () => { const a = rnd(2, 10), b = rnd(2, 10); return { t: `${a} × ${b}`, r: a * b }; },
      () => { const b = rnd(2, 10), r = rnd(2, 10); return { t: `${b * r} ÷ ${b}`, r }; },
    ],
    6: [
      () => { const p = escolher([10, 20, 25, 30, 50]), n = rnd(2, 20) * 10; return { t: `${p}% de ${n}`, r: (n * p) / 100 }; },
      () => { const d = escolher([2, 3, 4, 5]), r = rnd(3, 15); return { t: `1/${d} de ${d * r}`, r }; },
      () => { const a = escolher([12, 18, 24, 30, 36]), b = escolher([8, 9, 15, 20, 27]);
              const mdc = (x, y) => (y ? mdc(y, x % y) : x); return { t: `MDC de ${a} e ${b}`, r: mdc(a, b) }; },
      () => { const a = escolher([4, 6, 8, 9]), b = escolher([3, 5, 6, 10]);
              const mdc = (x, y) => (y ? mdc(y, x % y) : x); return { t: `MMC de ${a} e ${b}`, r: (a * b) / mdc(a, b) }; },
      () => { const a = rnd(4, 13); return { t: `${a}²`, r: a * a }; },
      () => { const b = rnd(3, 12), r = rnd(4, 12); return { t: `${b * r} ÷ ${b}`, r }; },
    ],
    7: [
      () => { const a = rnd(3, 20), b = rnd(3, 25); return { t: `(-${a}) + ${b}`, r: b - a }; },
      () => { const a = rnd(2, 12), b = rnd(2, 12); return { t: `(-${a}) × (-${b})`, r: a * b }; },
      () => { const a = rnd(8, 30), b = rnd(2, 12), c = rnd(2, 12); return { t: `${a} - (${b} - ${c})`, r: a - (b - c) }; },
      () => { const x = rnd(2, 20), b = rnd(2, 30); return { t: `x + ${b} = ${x + b}\nx = ?`, r: x }; },
      () => { const a = rnd(2, 9), x = rnd(2, 12); return { t: `${a}x = ${a * x}\nx = ?`, r: x }; },
      () => { const p = escolher([15, 20, 40, 60]), n = rnd(2, 12) * 5; return { t: `${p}% de ${n}`, r: (n * p) / 100 }; },
    ],
    8: [
      () => { const x = rnd(2, 12), a = rnd(2, 6), b = rnd(1, 9);
              return { t: `${a + 1}x + ${b} = ${a}x + ${x + b}\nx = ?`, r: x }; },
      () => { const x = rnd(2, 12), a = rnd(3, 7), c = rnd(1, 9);
              return { t: `${a}x - ${c} = ${a - 1}x + ${x - c}\nx = ?`, r: x }; },
      () => { const a = escolher([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]); return { t: `√${a}`, r: Math.sqrt(a) }; },
      () => { const b = rnd(2, 3), e1 = rnd(2, 3), e2 = rnd(2, 3);
              return { t: `${b}${sup(e1)} × ${b}${sup(e2)}`, r: Math.pow(b, e1 + e2) }; },
      () => { const un = rnd(2, 9), q1 = rnd(2, 6), q2 = rnd(2, 8);
              return { t: `${q1} cadernos custam ${q1 * un} reais.\nQuanto custam ${q2}?`, r: q2 * un }; },
    ],
    9: [
      () => { const x = rnd(2, 15); return { t: `x² = ${x * x}\nx positivo = ?`, r: x }; },
      () => { const r1 = rnd(1, 6), r2 = r1 + rnd(1, 5);
              return { t: `x² - ${r1 + r2}x + ${r1 * r2} = 0\nmaior raiz = ?`, r: r2 }; },
      () => { const par = escolher([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
              return { t: `Triângulo retângulo\ncatetos ${par[0]} e ${par[1]}, hipotenusa = ?`, r: par[2] }; },
      () => { const a = rnd(2, 6), b = rnd(1, 9), x = rnd(2, 9);
              return { t: `f(x) = ${a}x + ${b}\nf(${x}) = ?`, r: a * x + b }; },
      () => { const a = rnd(2, 6), b = rnd(2, 9); return { t: `Δ de x² - ${2 * a}x + ${a * a - b}`, r: 4 * b }; },
      () => { const e = rnd(2, 4); return { t: `10${sup(e)} ÷ 10`, r: Math.pow(10, e - 1) }; },
    ],
  };

  function sup(n) {
    return String(n).replace(/[0-9]/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  }

  /** monta as alternativas em volta da resposta certa */
  function alternativas(certo) {
    const set = new Set([certo]);
    let volta = 0;
    while (set.size < 4 && volta < 40) {
      volta += 1;
      const passo = rnd(1, Math.max(3, Math.round(Math.abs(certo) * 0.3)) || 3);
      const cand = Math.random() > 0.5 ? certo + passo : certo - passo;
      if (cand >= 0 && cand !== certo) set.add(cand);
    }
    while (set.size < 4) set.add(certo + set.size);
    return Array.from(set).sort(() => Math.random() - 0.5);
  }

  /** escolhe a série antes de começar */
  function matematica(child) {
    const pet = Store.petOf(child.id);
    const atual = pet.serie || 'basico';
    UI.openSheet({
      title: 'Conta rápida',
      subtitle: 'Escolha o nível para as contas ficarem na sua medida',
      body: `
        <div class="quiz-pet-row">
          ${Pet.svg(child, 76, 'estudando')}
          <span class="pet-bubble">Em que ano você está? Eu treino junto!</span>
        </div>
        <div class="list">
          ${SERIES.map((s2) => `
            <button class="game-card ${s2.id === atual ? 'g8' : 'g6'}" data-serie="${s2.id}">
              <span class="game-ico">${Icons.svg('brain')}</span>
              <span class="grow">
                <span class="nm block">${UI.esc(s2.label)}</span>
                <span class="tiny block game-desc">${UI.esc(s2.desc)}</span>
                <span class="tiny block game-best">
                  ${(pet.best || {})['matematica_' + s2.id]
                    ? `Seu recorde: ${(pet.best || {})['matematica_' + s2.id]}`
                    : 'Ainda sem recorde'}
                </span>
              </span>
              <span class="game-play">${Icons.svg('chevron')}</span>
            </button>`).join('')}
        </div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Agora não</button>',
      onMount(sheet) {
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);
        sheet.querySelectorAll('[data-serie]').forEach((b) => b.addEventListener('click', () => {
          const serie = b.getAttribute('data-serie');
          Store.savePet(child.id, { name: pet.name, serie });
          UI.closeSheet();
          rodarMatematica(child, serie);
        }));
      },
    });
  }

  function rodarMatematica(child, serie) {
    const DURACAO = 60;
    const info = SERIES.find((s2) => s2.id === serie) || SERIES[0];
    const geradores = GERADORES[serie] || GERADORES.basico;
    let pontos = 0;
    let sequencia = 0;
    let erros = 0;
    let restante = DURACAO;
    let relogio = null;
    let travado = false;
    let atual = null;

    UI.openSheet({
      title: `Conta rápida • ${info.label}`,
      subtitle: `${info.desc}. Você tem 60 segundos.`,
      body: `
        <div class="game-hud">
          <span class="chip lime" data-pontos>0 acertos</span>
          <span class="chip neutral" data-tempo>${DURACAO}s</span>
          <span class="chip pending" data-seq>sequência 0</span>
        </div>
        <div class="quiz-pet-row">
          ${Pet.svg(child, 72, 'estudando')}
          <span class="pet-bubble" data-fala>Vamos nessa!</span>
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
          const q = escolher(geradores)();
          atual = { texto: q.t, certo: q.r, opcoes: alternativas(q.r) };
          elConta.textContent = atual.texto.includes('=') || atual.texto.includes('\n')
            ? atual.texto
            : `${atual.texto} = ?`;
          elConta.classList.toggle('longa', atual.texto.length > 16);
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
              if (sequencia && sequencia % 5 === 0) elFala.textContent = `${sequencia} seguidas! Você tá voando.`;
              Effects.burst('book', b);
            } else {
              erros += 1;
              sequencia = 0;
              elSeq.textContent = 'sequência 0';
              elFala.textContent = `Era ${atual.certo}. Bora para a próxima.`;
              elOpcoes.querySelectorAll('[data-op]').forEach((x) => {
                if (Number(x.getAttribute('data-op')) === atual.certo) x.classList.add('certa');
              });
            }
            setTimeout(mostrar, certo ? 450 : 1300);
          }));
        }

        relogio = setInterval(() => {
          restante -= 1;
          elTempo.textContent = `${restante}s`;
          if (restante <= 0) {
            clearInterval(relogio);
            terminar(child, `matematica_${serie}`, pontos, Math.floor(pontos / 2),
              `${info.label} • ${pontos} acertos e ${erros} erro(s)`);
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

  let jogoDesde = null;

  function abrir(child, id) {
    Uso.entrar('jogos');
    jogoDesde = Uso.cronometro();
    const saida = id === 'palavrinha' ? WordGames.palavrinha(child)
      : id === 'contexto' ? WordGames.contexto(child)
      : id === 'teia' ? WordGames.teia(child)
      : id === 'matematica' ? matematica(child)
      : id === 'memoria' ? memoria(child)
      : id === 'sequencia' ? sequencia(child)
      : bola(child);
    // sair no meio da partida também precisa devolver o relógio para a aba
    let dentro = true;
    UI.aoFechar(() => {
      if (!dentro) return;
      dentro = false;
      Uso.sair();
    });
    return saida;
  }

  const abaAtual = () => aba;

  function bind(root, child, rerender) {
    root.querySelectorAll('[data-play-tab]').forEach((b) => b.addEventListener('click', () => {
      aba = b.getAttribute('data-play-tab');
      if (rerender) rerender(); else App.render();
    }));
    root.querySelectorAll('[data-game]').forEach((b) =>
      b.addEventListener('click', () => abrir(child, b.getAttribute('data-game'))));
    Quiz.bind(root, child);
  }

  return { view, bind, abrir, abaAtual, fim: terminar, LISTA, aba: () => aba };
})();

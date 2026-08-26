/* =========================================================
   quiz.js: espaço de estudo por matéria.
   A criança conta o que caiu na aula (ou cola a lista do
   caderno) e o app monta as cartas de pergunta e resposta.
   O bichinho estuda junto e pergunta no fim.
   ========================================================= */
const Quiz = (() => {
  /* ---------- lista de assuntos ---------- */
  function view(child) {
    const decks = Store.decksOf(child.id);
    const cartas = decks.reduce((s, d) => s + d.cards.length, 0);
    return `
      <div class="stat-row">
        <div class="stat"><div class="k">assuntos</div><div class="v">${decks.length}</div></div>
        <div class="stat"><div class="k">perguntas</div><div class="v">${cartas}</div></div>
        <div class="stat"><div class="k">estudos feitos</div><div class="v">${decks.reduce((s, d) => s + (d.plays || 0), 0)}</div></div>
      </div>

      <button class="btn btn-primary btn-block mt16" data-new-deck>
        ${Icons.svg('plus')} Novo assunto para estudar
      </button>

      ${decks.length ? `<div class="list mt16">
        ${decks.map((d) => {
          const mat = Store.subject(d.subject);
          return `
            <button class="game-card ${mat.grad}" data-deck="${d.id}">
              <span class="game-ico">${Icons.svg(mat.icon)}</span>
              <span class="grow">
                <span class="nm block">${UI.esc(d.name)}</span>
                <span class="tiny block game-desc">${UI.esc(mat.label)} • ${d.cards.length} pergunta(s)</span>
                <span class="tiny block game-best">
                  ${d.plays ? `Melhor resultado: ${d.best} acerto(s) em ${d.plays} estudo(s)` : 'Ainda não estudado'}
                </span>
              </span>
              <span class="game-play">${Icons.svg('chevron')}</span>
            </button>`;
        }).join('')}
      </div>`
      : UI.empty('book', 'Nenhum assunto ainda. Conte o que caiu na aula e o bichinho monta as perguntas com você.')}`;
  }

  /* ---------- criar ou editar assunto ---------- */
  function openDeckForm(child, deck) {
    const editing = !!deck;
    const mat = editing ? deck.subject : 'matematica';

    UI.openSheet({
      title: editing ? 'Editar assunto' : 'Novo assunto',
      subtitle: 'Escreva o que aconteceu na aula e as perguntas que quer treinar',
      body: `
        <form id="deck-form">
          <div class="field">
            <label>Matéria</label>
            <div class="seg-mini wrap" data-pick="subject">
              ${Store.SUBJECTS.map((s) => `
                <button type="button" data-value="${s.id}" aria-pressed="${s.id === mat}">${UI.esc(s.label)}</button>`).join('')}
            </div>
            <input type="hidden" name="subject" value="${UI.esc(mat)}" />
          </div>
          ${UI.field('Assunto', UI.input('name', {
            value: editing ? deck.name : '',
            placeholder: 'ex.: Frações, Revolução Francesa, Verbo to be',
          }))}
          ${UI.field('O que aconteceu na aula (opcional)', `
            <textarea name="notes" rows="3"
              placeholder="a professora explicou..., o que caiu na prova, o que preciso decorar">${editing ? UI.esc(deck.notes || '') : ''}</textarea>`)}
          ${UI.field('Perguntas (uma por linha, no formato pergunta = resposta)', `
            <textarea name="bulk" rows="6"
              placeholder="Quanto é 7 x 8 = 56&#10;Capital do Brasil = Brasília&#10;Verbo to be no passado = was / were"></textarea>`)}
          <div class="note">
            Escreva uma pergunta por linha separando com <b>=</b> (também vale <b>:</b> ou <b>-</b>).
            Depois dá para incluir mais perguntas uma a uma.
          </div>
          ${!editing ? `
            <div class="field">
              <label>Atalho de matemática</label>
              <div class="seg-mini wrap">
                ${[2, 3, 4, 5, 6, 7, 8, 9].map((n) => `
                  <button type="button" data-tabuada="${n}">Tabuada do ${n}</button>`).join('')}
              </div>
            </div>` : ''}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(deck.id)}" />` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>${editing ? 'Salvar' : 'Criar assunto'}</button>`,
      onMount(sheet) {
        const form = sheet.querySelector('#deck-form');
        sheet.querySelectorAll('[data-pick]').forEach((box) => {
          const input = form.querySelector(`input[name="${box.getAttribute('data-pick')}"]`);
          box.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-value]');
            if (!btn) return;
            box.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            input.value = btn.getAttribute('data-value');
          });
        });
        sheet.querySelectorAll('[data-tabuada]').forEach((b) => b.addEventListener('click', () => {
          const n = Number(b.getAttribute('data-tabuada'));
          const linhas = [];
          for (let i = 1; i <= 10; i++) linhas.push(`Quanto é ${n} x ${i} = ${n * i}`);
          const bulk = form.querySelector('textarea[name="bulk"]');
          bulk.value = (bulk.value ? bulk.value.trim() + '\n' : '') + linhas.join('\n');
          const nome = form.querySelector('input[name="name"]');
          if (!nome.value) nome.value = `Tabuada do ${n}`;
        }));
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(form);
          const res = Store.saveDeck(child.id, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast(res.novas ? `${res.novas} pergunta(s) adicionadas` : 'Assunto salvo', 'ok');
          App.render();
          openDeck(child, res.deck.id);
        });
      },
    });
  }

  /* ---------- assunto aberto ---------- */
  function openDeck(child, deckId) {
    const deck = Store.deckById(deckId);
    if (!deck) return;
    const mat = Store.subject(deck.subject);

    UI.openSheet({
      title: deck.name,
      subtitle: `${mat.label} • ${deck.cards.length} pergunta(s)`,
      body: `
        <div class="row" style="gap:10px">
          <button class="btn btn-primary grow" data-start-quiz ${deck.cards.length < 2 ? 'disabled' : ''}>
            ${Icons.svg('ball')} Fazer o quiz
          </button>
          <button class="btn btn-ghost grow" data-start-cards ${deck.cards.length ? '' : 'disabled'}>
            ${Icons.svg('book')} Ver as cartas
          </button>
        </div>
        ${deck.cards.length < 2 ? '<div class="note">Escreva pelo menos duas perguntas para o quiz ficar disponível.</div>' : ''}
        ${deck.notes ? `<p class="diary-text">${UI.esc(deck.notes)}</p>` : ''}

        <form id="card-form" class="card-add">
          ${UI.field('Nova pergunta', UI.input('q', { placeholder: 'ex.: Quanto é 9 x 6' }))}
          ${UI.field('Resposta', UI.input('a', { placeholder: 'ex.: 54' }))}
          <button type="button" class="btn btn-soft btn-sm" data-add-card>${Icons.svg('plus')} Incluir pergunta</button>
        </form>

        <div class="section-title"><h3>Perguntas</h3><span class="small muted">${deck.cards.length}</span></div>
        ${deck.cards.length ? `<div class="list">
          ${deck.cards.map((c) => `
            <div class="mini-row">
              <div class="grow">
                <div class="small bold">${UI.esc(c.q)}</div>
                <div class="tiny muted">${UI.esc(c.a)}</div>
              </div>
              <button class="icon-btn sm" data-del-card="${c.id}" aria-label="Apagar pergunta">${Icons.svg('trash')}</button>
            </div>`).join('')}
        </div>` : UI.empty('pencil', 'Ainda sem perguntas neste assunto.')}`,
      actions: `
        <button class="btn btn-ghost" data-edit-deck>${Icons.svg('pencil')} Editar</button>
        <button class="btn btn-ghost" data-del-deck>${Icons.svg('trash')} Apagar</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-start-quiz]').addEventListener('click', () => {
          UI.closeSheet();
          startQuiz(child, deckId);
        });
        sheet.querySelector('[data-start-cards]').addEventListener('click', () => {
          UI.closeSheet();
          flashcards(child, deckId);
        });
        sheet.querySelector('[data-add-card]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#card-form'));
          const res = Store.addCard(deckId, data.q, data.a);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast('Pergunta incluída', 'ok');
          App.render();
          openDeck(child, deckId);
        });
        sheet.querySelectorAll('[data-del-card]').forEach((b) => b.addEventListener('click', () => {
          Store.removeCard(deckId, b.getAttribute('data-del-card'));
          UI.closeSheet();
          App.render();
          openDeck(child, deckId);
        }));
        sheet.querySelector('[data-edit-deck]').addEventListener('click', () => {
          UI.closeSheet();
          openDeckForm(child, Store.deckById(deckId));
        });
        sheet.querySelector('[data-del-deck]').addEventListener('click', async () => {
          const ok = await UI.confirm({
            title: `Apagar “${deck.name}”?`,
            text: 'Todas as perguntas desse assunto somem.',
            okLabel: 'Apagar', danger: true,
          });
          if (ok) { Store.removeDeck(deckId); UI.toast('Assunto apagado'); App.render(); }
        });
      },
    });
  }

  /* ---------- cartas para revisar ---------- */
  function flashcards(child, deckId) {
    const deck = Store.deckById(deckId);
    if (!deck || !deck.cards.length) return;
    const cartas = deck.cards.slice().sort(() => Math.random() - 0.5);
    let i = 0;

    const pintar = (sheet) => {
      const c = cartas[i];
      sheet.querySelector('[data-flash]').innerHTML = `
        <button class="flash-card" data-flip>
          <span class="flash-face flash-q">${UI.esc(c.q)}</span>
          <span class="flash-face flash-a">${UI.esc(c.a)}</span>
        </button>`;
      sheet.querySelector('[data-pos]').textContent = `${i + 1} de ${cartas.length}`;
      sheet.querySelector('[data-flip]').addEventListener('click', (ev) =>
        ev.currentTarget.classList.toggle('virada'));
    };

    UI.openSheet({
      title: `Cartas de ${deck.name}`,
      subtitle: 'Toque na carta para ver a resposta',
      body: `
        <div class="game-hud"><span class="chip neutral" data-pos></span></div>
        <div data-flash></div>
        <div class="quiz-pet">${Pet.svg(child, 84, 'estudando')}</div>`,
      actions: `
        <button class="btn btn-ghost" data-prev>Anterior</button>
        <button class="btn btn-primary" data-next>Próxima</button>`,
      onMount(sheet) {
        pintar(sheet);
        sheet.querySelector('[data-next]').addEventListener('click', () => {
          i = (i + 1) % cartas.length;
          pintar(sheet);
        });
        sheet.querySelector('[data-prev]').addEventListener('click', () => {
          i = (i - 1 + cartas.length) % cartas.length;
          pintar(sheet);
        });
      },
    });
  }

  /* ---------- quiz de múltipla escolha ---------- */
  /** monta as alternativas com as respostas das outras cartas */
  function opcoes(cards, certa) {
    const outras = cards
      .map((c) => c.a)
      .filter((a) => a.toLowerCase() !== certa.toLowerCase());
    const unicas = Array.from(new Set(outras)).sort(() => Math.random() - 0.5).slice(0, 3);
    return [certa, ...unicas].sort(() => Math.random() - 0.5);
  }

  function startQuiz(child, deckId) {
    const deck = Store.deckById(deckId);
    if (!deck || deck.cards.length < 2) return;
    const rodada = deck.cards.slice().sort(() => Math.random() - 0.5).slice(0, 10);
    const pet = Store.petOf(child.id);
    let i = 0;
    let acertos = 0;
    let travado = false;

    const falas = [
      'Essa eu sei... acho!', 'Pensa com calma.', 'Vai que é sua!',
      'Essa caiu na prova, hein?', 'Se errar tudo bem, a gente aprende.',
    ];

    UI.openSheet({
      title: `Quiz de ${deck.name}`,
      subtitle: `${Store.subject(deck.subject).label} • ${rodada.length} perguntas`,
      body: `
        <div class="game-hud">
          <span class="chip lime" data-acertos>0 acertos</span>
          <span class="chip neutral" data-pos>1 de ${rodada.length}</span>
        </div>
        <div class="quiz-pet-row">
          ${Pet.svg(child, 76, 'estudando')}
          <span class="pet-bubble" data-fala>${UI.esc(pet.name)} está estudando com você.</span>
        </div>
        <div class="quiz-q" data-pergunta></div>
        <div class="quiz-options" data-opcoes></div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair do quiz</button>',
      onMount(sheet) {
        const elPergunta = sheet.querySelector('[data-pergunta]');
        const elOpcoes = sheet.querySelector('[data-opcoes]');
        const elAcertos = sheet.querySelector('[data-acertos]');
        const elPos = sheet.querySelector('[data-pos]');
        const elFala = sheet.querySelector('[data-fala]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        function pergunta() {
          travado = false;
          const c = rodada[i];
          elPos.textContent = `${i + 1} de ${rodada.length}`;
          elPergunta.textContent = c.q;
          elFala.textContent = falas[Math.floor(Math.random() * falas.length)];
          elOpcoes.innerHTML = opcoes(deck.cards, c.a)
            .map((op) => `<button class="quiz-op" data-op="${UI.esc(op)}">${UI.esc(op)}</button>`).join('');
          elOpcoes.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => {
            if (travado) return;
            travado = true;
            const certo = b.getAttribute('data-op').toLowerCase() === c.a.toLowerCase();
            b.classList.add(certo ? 'certa' : 'errada');
            if (!certo) {
              elOpcoes.querySelectorAll('[data-op]').forEach((x) => {
                if (x.getAttribute('data-op').toLowerCase() === c.a.toLowerCase()) x.classList.add('certa');
              });
              elFala.textContent = `A resposta era ${c.a}. Anota aí!`;
            } else {
              acertos += 1;
              elAcertos.textContent = `${acertos} acertos`;
              elFala.textContent = 'Isso! Você mandou bem.';
              Effects.burst('book', b);
            }
            setTimeout(() => {
              i += 1;
              if (i >= rodada.length) return fim();
              pergunta();
            }, certo ? 750 : 1500);
          }));
        }

        function fim() {
          const res = Store.quizResult(child.id, deckId, acertos, rodada.length);
          UI.closeSheet();
          UI.openSheet({
            title: acertos === rodada.length ? 'Gabaritou!' : 'Fim do quiz',
            subtitle: `${deck.name} • ${acertos} de ${rodada.length}`,
            body: `
              <div class="game-end">
                ${Pet.svg(child, 130, acertos >= rodada.length / 2 ? 'festa' : 'feliz')}
                <div class="stat-row" style="width:100%">
                  <div class="stat"><div class="k">acertos</div><div class="v">${acertos}</div></div>
                  <div class="stat"><div class="k">perguntas</div><div class="v">${rodada.length}</div></div>
                  <div class="stat"><div class="k">amizade</div><div class="v">+${res.xp}</div></div>
                </div>
                <div class="note">${UI.esc(pet.name)} ${acertos === rodada.length
                  ? 'aprendeu tudo junto com você.'
                  : 'quer treinar de novo depois para acertar mais.'}</div>
              </div>`,
            actions: `
              <button class="btn btn-ghost" data-again>Estudar de novo</button>
              <button class="btn btn-primary" data-ok>Pronto</button>`,
            onMount(fim2) {
              fim2.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
              fim2.querySelector('[data-again]').addEventListener('click', () => { UI.closeSheet(); startQuiz(child, deckId); });
            },
            onClose() { App.render(); },
          });
          if (res.xp) Effects.burst(res.levelUp ? 'goal' : 'book');
          if (res.levelUp) UI.toast(`${pet.name} subiu de nível!`, 'ok');
        }

        pergunta();
      },
    });
  }

  /* ---------- pergunta surpresa do bichinho ---------- */
  /** o bichinho puxa uma carta de qualquer assunto e pergunta na hora */
  function surpresa(child) {
    const cards = Store.allCards(child.id);
    if (cards.length < 2) return false;
    const c = cards[Math.floor(Math.random() * cards.length)];
    const pet = Store.petOf(child.id);
    const alternativas = opcoes(cards, c.a);

    UI.openSheet({
      title: 'Pergunta surpresa',
      subtitle: `${UI.esc(pet.name)} lembrou de ${UI.esc(c.deck)}`,
      body: `
        <div class="quiz-pet-row">
          ${Pet.svg(child, 76, 'estudando')}
          <span class="pet-bubble">Deixa eu te perguntar uma coisinha...</span>
        </div>
        <div class="quiz-q">${UI.esc(c.q)}</div>
        <div class="quiz-options" data-opcoes>
          ${alternativas.map((op) => `<button class="quiz-op" data-op="${UI.esc(op)}">${UI.esc(op)}</button>`).join('')}
        </div>`,
      actions: '<button class="btn btn-ghost btn-block" data-depois>Agora não</button>',
      onMount(sheet) {
        let respondido = false;
        sheet.querySelector('[data-depois]').addEventListener('click', UI.closeSheet);
        sheet.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => {
          if (respondido) return;
          respondido = true;
          const certo = b.getAttribute('data-op').toLowerCase() === c.a.toLowerCase();
          b.classList.add(certo ? 'certa' : 'errada');
          if (certo) {
            Store.petAddXp(child.id, 2);
            Effects.burst('book', b);
            UI.toast(`Acertou! +2 pontos para ${pet.name}`, 'ok');
          } else {
            UI.toast(`Era ${c.a}. Fica para a próxima!`);
          }
          setTimeout(() => { UI.closeSheet(); App.render(); }, 1100);
        }));
      },
    });
    return true;
  }

  function bind(root, child) {
    root.querySelectorAll('[data-new-deck]').forEach((b) =>
      b.addEventListener('click', () => openDeckForm(child, null)));
    root.querySelectorAll('[data-deck]').forEach((b) =>
      b.addEventListener('click', () => openDeck(child, b.getAttribute('data-deck'))));
  }

  return { view, bind, openDeckForm, openDeck, startQuiz, surpresa };
})();

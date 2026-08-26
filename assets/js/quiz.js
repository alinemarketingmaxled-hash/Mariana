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
    const assuntos = Banco.MATERIAS.reduce((s, m) => s + m.topicos.length, 0);
    const questoes = Banco.MATERIAS.reduce((s, m) => s + Banco.totalQuestoes(m.id), 0);
    return `
      <div class="stat-row">
        <div class="stat"><div class="k">assuntos</div><div class="v">${decks.length}</div></div>
        <div class="stat"><div class="k">perguntas</div><div class="v">${cartas}</div></div>
        <div class="stat"><div class="k">estudos feitos</div><div class="v">${decks.reduce((s, d) => s + (d.plays || 0), 0)}</div></div>
      </div>

      <button class="prova-cta" data-prova>
        <span class="prova-cta-ico">${Icons.svg('brain')}</span>
        <span class="grow">
          <span class="nm block">Montar prova das matérias da escola</span>
          <span class="tiny block">${Banco.MATERIAS.length} matérias, ${assuntos} assuntos e ${questoes} questões prontas</span>
        </span>
        <span class="game-play">${Icons.svg('chevron')}</span>
      </button>

      <button class="btn btn-ghost btn-block mt12" data-new-deck>
        ${Icons.svg('plus')} Novo assunto escrito por você
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
          Pet.Voz.falar(c.q, child, sheet);   // ele lê a pergunta em voz alta
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
              Pet.Voz.falar(`A resposta era ${c.a}`, child, sheet);
            } else {
              acertos += 1;
              elAcertos.textContent = `${acertos} acertos`;
              elFala.textContent = 'Isso! Você mandou bem.';
              Pet.Voz.falar('Isso! Você mandou bem.', child, sheet);
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
        // a pergunta surpresa é falada assim que aparece
        Pet.Voz.falar(`Deixa eu te perguntar. ${c.q}`, child, sheet);
        sheet.querySelector('[data-depois]').addEventListener('click', UI.closeSheet);
        sheet.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => {
          if (respondido) return;
          respondido = true;
          const certo = b.getAttribute('data-op').toLowerCase() === c.a.toLowerCase();
          b.classList.add(certo ? 'certa' : 'errada');
          if (certo) {
            Store.petAddXp(child.id, 2);
            Effects.burst('book', b);
            Pet.Voz.falar('Acertou!', child, sheet);
            UI.toast(`Acertou! +2 pontos para ${pet.name}`, 'ok');
          } else {
            Pet.Voz.falar(`Era ${c.a}`, child, sheet);
            UI.toast(`Era ${c.a}. Fica para a próxima!`);
          }
          setTimeout(() => { UI.closeSheet(); App.render(); }, 1100);
        }));
      },
    });
    return true;
  }

  /* =======================================================
     Prova montada com o banco de conteúdo da escola.
     Ela escolhe as matérias, quantas questões quer e se
     prefere alternativas ou discursivas. O app sorteia.
     ======================================================= */

  const QUANTIDADES = [5, 10, 15, 20];
  const TIPOS = [
    { id: 'alternativas', label: 'Alternativas' },
    { id: 'discursivas', label: 'Discursivas' },
    { id: 'mistas', label: 'Misturadas' },
  ];

  /** tira acento, pontuação e espaço sobrando para comparar respostas */
  function normalizar(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** confere a resposta escrita à mão */
  function respostaCerta(escrita, esperada) {
    const a = normalizar(escrita);
    const b = normalizar(esperada);
    if (!a) return false;
    if (a === b) return true;
    if (b.length >= 4 && a.includes(b)) return true;
    if (a.length >= 4 && b.includes(a) && a.length >= b.length - 2) return true;
    return false;
  }

  function openProva(child) {
    const estado = {
      materias: [],
      topicos: [],
      quantidade: 10,
      tipo: 'alternativas',
    };

    const listaMaterias = () => Banco.MATERIAS.map((m) => `
      <button type="button" class="mat-card" data-mat="${m.id}"
              aria-pressed="${estado.materias.includes(m.id)}">
        <span class="mat-ico ${m.grad}">${Icons.svg(m.icon)}</span>
        <span class="grow">
          <span class="nm block">${UI.esc(m.label)}</span>
          <span class="tiny block">${m.topicos.length} assuntos • ${Banco.totalQuestoes(m.id)} questões</span>
        </span>
        <span class="mat-check">${Icons.svg('check')}</span>
      </button>`).join('');

    const listaTopicos = () => {
      if (!estado.materias.length) {
        return '<div class="note">Escolha ao menos uma matéria para ver os assuntos.</div>';
      }
      return Banco.MATERIAS.filter((m) => estado.materias.includes(m.id)).map((m) => `
        <div class="topico-bloco">
          <div class="tiny bold up">${UI.esc(m.label)}</div>
          <div class="seg-mini wrap">
            ${m.topicos.map((t) => {
              const chave = `${m.id}:${t.id}`;
              return `<button type="button" data-top="${chave}"
                        aria-pressed="${estado.topicos.includes(chave)}">${UI.esc(t.label)}</button>`;
            }).join('')}
          </div>
        </div>`).join('')
        + '<div class="note">Sem marcar nada, a prova sorteia de todos os assuntos das matérias escolhidas.</div>';
    };

    UI.openSheet({
      title: 'Montar prova',
      subtitle: 'Todo o conteúdo da escola, do jeito que você quiser treinar',
      body: `
        <div class="field">
          <label>Matérias</label>
          <div class="mat-grid" data-materias>${listaMaterias()}</div>
        </div>
        <div class="field">
          <label>Assuntos (opcional)</label>
          <div data-topicos>${listaTopicos()}</div>
        </div>
        <div class="field">
          <label>Quantas questões</label>
          <div class="seg-mini wrap" data-qtd>
            ${QUANTIDADES.map((n) => `
              <button type="button" data-value="${n}" aria-pressed="${n === estado.quantidade}">${n} questões</button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label>Tipo de questão</label>
          <div class="seg-mini wrap" data-tipo>
            ${TIPOS.map((t) => `
              <button type="button" data-value="${t.id}" aria-pressed="${t.id === estado.tipo}">${t.label}</button>`).join('')}
          </div>
          <div class="note">
            Nas discursivas você escreve a resposta e o bichinho confere com o gabarito.
          </div>
        </div>
        <div class="prova-resumo" data-resumo></div>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-gerar>Gerar as questões</button>`,
      onMount(sheet) {
        const boxTop = sheet.querySelector('[data-topicos]');
        const resumo = sheet.querySelector('[data-resumo]');
        const btnGerar = sheet.querySelector('[data-gerar]');

        function atualizar() {
          const total = Banco.disponiveis({ materias: estado.materias, topicos: estado.topicos });
          const tipo = TIPOS.find((t) => t.id === estado.tipo).label.toLowerCase();
          resumo.innerHTML = estado.materias.length
            ? `<b>${Math.min(total, estado.quantidade)} questões ${tipo}</b> sorteadas entre as
               ${total} disponíveis de ${estado.materias.length} matéria(s).`
            : 'Escolha as matérias que caíram na prova.';
          btnGerar.disabled = !estado.materias.length || total < 1;
        }

        sheet.querySelector('[data-materias]').addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-mat]');
          if (!b) return;
          const id = b.getAttribute('data-mat');
          if (estado.materias.includes(id)) {
            estado.materias = estado.materias.filter((x) => x !== id);
            estado.topicos = estado.topicos.filter((x) => !x.startsWith(`${id}:`));
          } else {
            estado.materias.push(id);
          }
          b.setAttribute('aria-pressed', estado.materias.includes(id));
          boxTop.innerHTML = listaTopicos();
          atualizar();
        });

        boxTop.addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-top]');
          if (!b) return;
          const chave = b.getAttribute('data-top');
          estado.topicos = estado.topicos.includes(chave)
            ? estado.topicos.filter((x) => x !== chave)
            : estado.topicos.concat([chave]);
          b.setAttribute('aria-pressed', estado.topicos.includes(chave));
          atualizar();
        });

        [['[data-qtd]', 'quantidade'], ['[data-tipo]', 'tipo']].forEach(([sel, campo]) => {
          sheet.querySelector(sel).addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-value]');
            if (!b) return;
            ev.currentTarget.querySelectorAll('[data-value]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
            b.setAttribute('aria-pressed', 'true');
            const v = b.getAttribute('data-value');
            estado[campo] = campo === 'quantidade' ? Number(v) : v;
            atualizar();
          });
        });

        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        btnGerar.addEventListener('click', () => {
          const questoes = Banco.sortear(estado);
          if (!questoes.length) return UI.toast('Nenhuma questão para esse filtro', 'bad');
          UI.closeSheet();
          runProva(child, estado, questoes);
        });
        atualizar();
      },
    });
  }

  /* ---------- a prova rodando ---------- */
  function runProva(child, cfg, questoes) {
    const pet = Store.petOf(child.id);
    const rodada = questoes.map((q, idx) => Object.assign({}, q, {
      modo: cfg.tipo === 'mistas' ? (idx % 2 ? 'discursiva' : 'alternativa') : (cfg.tipo === 'discursivas' ? 'discursiva' : 'alternativa'),
    }));
    const erradas = [];
    let i = 0;
    let acertos = 0;
    let travado = false;

    const materias = Array.from(new Set(rodada.map((q) => q.materia))).join(', ');

    UI.openSheet({
      title: 'Prova da escola',
      subtitle: `${materias} • ${rodada.length} questões`,
      body: `
        <div class="game-hud">
          <span class="chip lime" data-acertos>0 acertos</span>
          <span class="chip neutral" data-pos>1 de ${rodada.length}</span>
        </div>
        <div class="quiz-pet-row">
          ${Pet.svg(child, 76, 'estudando')}
          <span class="pet-bubble" data-fala>${UI.esc(pet.name)} vai ler as questões com você.</span>
        </div>
        <div class="prova-tag" data-tag></div>
        <div class="quiz-q" data-pergunta></div>
        <div data-area></div>`,
      actions: '<button class="btn btn-ghost btn-block" data-sair>Sair da prova</button>',
      onMount(sheet) {
        const elPergunta = sheet.querySelector('[data-pergunta]');
        const elArea = sheet.querySelector('[data-area]');
        const elAcertos = sheet.querySelector('[data-acertos]');
        const elPos = sheet.querySelector('[data-pos]');
        const elFala = sheet.querySelector('[data-fala]');
        const elTag = sheet.querySelector('[data-tag]');
        sheet.querySelector('[data-sair]').addEventListener('click', UI.closeSheet);

        const avancar = (espera) => setTimeout(() => {
          i += 1;
          if (i >= rodada.length) return fim();
          pergunta();
        }, espera);

        function marcar(certo, q, escrita) {
          if (certo) {
            acertos += 1;
            elAcertos.textContent = `${acertos} acertos`;
          } else {
            erradas.push({ q: q.q, a: q.a, sua: escrita || '' });
          }
        }

        function pergunta() {
          travado = false;
          const q = rodada[i];
          elPos.textContent = `${i + 1} de ${rodada.length}`;
          elTag.textContent = `${q.materia} • ${q.topico}`;
          elPergunta.textContent = q.q;
          elFala.textContent = q.modo === 'discursiva'
            ? 'Escreve com suas palavras, eu confiro.'
            : 'Pensa com calma e escolhe.';
          Pet.Voz.falar(q.q, child, sheet);
          if (q.modo === 'discursiva') return discursiva(q);
          return alternativa(q);
        }

        function alternativa(q) {
          const ops = q.opts.slice().sort(() => Math.random() - 0.5);
          elArea.className = 'quiz-options';
          elArea.innerHTML = ops
            .map((op) => `<button class="quiz-op" data-op="${UI.esc(op)}">${UI.esc(op)}</button>`).join('');
          elArea.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => {
            if (travado) return;
            travado = true;
            const certo = normalizar(b.getAttribute('data-op')) === normalizar(q.a);
            b.classList.add(certo ? 'certa' : 'errada');
            if (!certo) {
              elArea.querySelectorAll('[data-op]').forEach((x) => {
                if (normalizar(x.getAttribute('data-op')) === normalizar(q.a)) x.classList.add('certa');
              });
              elFala.textContent = `A resposta era ${q.a}.`;
              Pet.Voz.falar(`A resposta era ${q.a}`, child, sheet);
            } else {
              elFala.textContent = 'Isso! Você mandou bem.';
              Pet.Voz.falar('Isso! Você mandou bem.', child, sheet);
              Effects.burst('book', b);
            }
            marcar(certo, q, b.getAttribute('data-op'));
            avancar(certo ? 800 : 1700);
          }));
        }

        function discursiva(q) {
          elArea.className = 'prova-discursiva';
          elArea.innerHTML = `
            <textarea data-resp rows="3" placeholder="Escreva sua resposta"></textarea>
            <button class="btn btn-primary btn-block" data-conferir>Conferir resposta</button>
            <div data-feedback></div>`;
          const campo = elArea.querySelector('[data-resp]');
          campo.focus();
          const feedback = elArea.querySelector('[data-feedback]');

          elArea.querySelector('[data-conferir]').addEventListener('click', () => {
            if (travado) return;
            const escrita = campo.value.trim();
            if (!escrita) return UI.toast('Escreva alguma coisa antes de conferir');
            travado = true;
            campo.disabled = true;
            const certo = respostaCerta(escrita, q.a);
            marcar(certo, q, escrita);
            elFala.textContent = certo ? 'Isso mesmo!' : `O gabarito diz: ${q.a}.`;
            Pet.Voz.falar(certo ? 'Isso mesmo!' : `O gabarito diz ${q.a}`, child, sheet);
            if (certo) Effects.burst('book', campo);
            feedback.className = `resp-feedback ${certo ? 'ok' : 'nao'}`;
            feedback.innerHTML = `
              <div class="small bold">${certo ? 'Resposta aceita' : 'Compare com o gabarito'}</div>
              <div class="small">Gabarito: <b>${UI.esc(q.a)}</b></div>
              ${certo ? '' : '<button class="btn btn-soft btn-sm mt8" data-eu-acertei>Escrevi certo, conta como acerto</button>'}
              <button class="btn btn-primary btn-block mt8" data-proxima>Próxima questão</button>`;
            const auto = feedback.querySelector('[data-eu-acertei]');
            if (auto) auto.addEventListener('click', () => {
              auto.disabled = true;
              acertos += 1;
              elAcertos.textContent = `${acertos} acertos`;
              const idx = erradas.findIndex((e) => e.q === q.q);
              if (idx >= 0) erradas.splice(idx, 1);
              feedback.classList.remove('nao');
              feedback.classList.add('ok');
              UI.toast('Contado como acerto', 'ok');
            });
            feedback.querySelector('[data-proxima]').addEventListener('click', () => avancar(0));
          });
        }

        function fim() {
          const res = Store.quizResult(child.id, null, acertos, rodada.length);
          UI.closeSheet();
          UI.openSheet({
            title: acertos === rodada.length ? 'Gabaritou a prova!' : 'Prova terminada',
            subtitle: `${acertos} de ${rodada.length} • ${materias}`,
            body: `
              <div class="game-end">
                ${Pet.svg(child, 130, acertos >= rodada.length / 2 ? 'festa' : 'feliz')}
                <div class="stat-row" style="width:100%">
                  <div class="stat"><div class="k">acertos</div><div class="v">${acertos}</div></div>
                  <div class="stat"><div class="k">questões</div><div class="v">${rodada.length}</div></div>
                  <div class="stat"><div class="k">amizade</div><div class="v">+${res.xp}</div></div>
                </div>
              </div>
              ${erradas.length ? `
                <div class="section-title"><h3>Para revisar</h3><span class="small muted">${erradas.length}</span></div>
                <div class="list">
                  ${erradas.map((e) => `
                    <div class="mini-row">
                      <div class="grow">
                        <div class="small bold">${UI.esc(e.q)}</div>
                        <div class="tiny muted">Gabarito: ${UI.esc(e.a)}</div>
                        ${e.sua ? `<div class="tiny muted">Você escreveu: ${UI.esc(e.sua)}</div>` : ''}
                      </div>
                    </div>`).join('')}
                </div>` : '<div class="note">Você não errou nenhuma. Que prova!</div>'}`,
            actions: `
              <button class="btn btn-ghost" data-outra>Outra prova</button>
              <button class="btn btn-primary" data-ok>Pronto</button>`,
            onMount(fim2) {
              fim2.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
              fim2.querySelector('[data-outra]').addEventListener('click', () => { UI.closeSheet(); openProva(child); });
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

  function bind(root, child) {
    root.querySelectorAll('[data-new-deck]').forEach((b) =>
      b.addEventListener('click', () => openDeckForm(child, null)));
    root.querySelectorAll('[data-deck]').forEach((b) =>
      b.addEventListener('click', () => openDeck(child, b.getAttribute('data-deck'))));
    root.querySelectorAll('[data-prova]').forEach((b) =>
      b.addEventListener('click', () => openProva(child)));
  }

  return { view, bind, openDeckForm, openDeck, startQuiz, surpresa, openProva, runProva };
})();

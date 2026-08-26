/* =========================================================
   pet.js: o bichinho do filho.
   Ele reage ao que acontece no app (tarefas, livros, gastos),
   ganha experiência, sobe de nível e pode ser personalizado.
   ========================================================= */
const Pet = (() => {
  const COLORS = [
    { id: 'lime', label: 'Limão', hex: '#d6f154', ink: '#131338' },
    { id: 'blue', label: 'Azul', hex: '#3b4fe4', ink: '#ffffff' },
    { id: 'pink', label: 'Rosa', hex: '#ff8fc8', ink: '#131338' },
    { id: 'orange', label: 'Laranja', hex: '#ffa24b', ink: '#131338' },
    { id: 'mint', label: 'Menta', hex: '#79e3b5', ink: '#131338' },
    { id: 'violet', label: 'Violeta', hex: '#a98cff', ink: '#131338' },
    { id: 'sky', label: 'Céu', hex: '#6fd3ff', ink: '#131338' },
    { id: 'sun', label: 'Sol', hex: '#ffd84b', ink: '#131338' },
  ];

  /** cada corpo é um caminho fechado, no espaço 0..200 */
  const SHAPES = [
    { id: 'blob', label: 'Redondinho', path: 'M100 12c40 0 76 26 82 64 6 40-8 76-40 96-30 18-74 18-104 0C6 152-8 116-2 76 4 38 60 12 100 12z' },
    { id: 'drop', label: 'Gotinha', path: 'M100 8c34 30 74 62 74 106a74 74 0 1 1-148 0C26 70 66 38 100 8z' },
    { id: 'bean', label: 'Feijãozinho', path: 'M52 22c40-18 96-8 118 30 20 34 6 78-16 108-22 30-70 42-104 26C14 170-2 128 4 92 10 56 24 34 52 22z' },
    { id: 'star', label: 'Estrelinha', path: 'M100 6c14 30 26 42 58 50-26 20-34 34-30 66 4 30-14 44-28 60-14-16-32-30-28-60 4-32-4-46-30-66 32-8 44-20 58-50z' },
  ];

  const ACCESSORIES = [
    { id: '', label: 'Sem acessório', level: 1 },
    { id: 'chapeu', label: 'Chapéu', level: 2 },
    { id: 'oculos', label: 'Óculos', level: 3 },
    { id: 'laco', label: 'Laço', level: 4 },
    { id: 'coroa', label: 'Coroa', level: 5 },
    { id: 'fone', label: 'Fone', level: 6 },
  ];

  const XP_POR_NIVEL = 60;
  const CARINHOS_POR_DIA = 5;

  const color = (id) => COLORS.find((c) => c.id === id) || COLORS[0];
  const shape = (id) => SHAPES.find((s) => s.id === id) || SHAPES[0];
  const level = (xp) => Math.floor((xp || 0) / XP_POR_NIVEL) + 1;
  const progress = (xp) => ((xp || 0) % XP_POR_NIVEL) / XP_POR_NIVEL;
  const unlocked = (lv) => ACCESSORIES.filter((a) => a.level <= lv);

  /* ---------- humor ---------- */
  /** o humor sai do que aconteceu hoje, não de um contador escondido */
  function mood(child) {
    const hoje = Store.today();
    const st = Store.dayStatus(child.id, hoje);
    const doDia = Store.entriesOf(child.id, hoje);
    const recusados = doDia.filter((e) => e.status === 'rejected').length;
    const atrasados = Store.upcomingEvents(child.id).filter((e) => !e.done && Store.daysUntil(e.date) < 0).length;

    if (recusados) return { id: 'triste', label: 'meio triste' };
    if (st.required && st.complete) return { id: 'festa', label: 'muito feliz' };
    if (atrasados) return { id: 'preocupado', label: 'preocupado' };
    if (doDia.length) return { id: 'feliz', label: 'animado' };
    return { id: 'dormindo', label: 'com sono' };
  }

  /** frase que o bichinho fala, sempre ligada ao que está acontecendo */
  function phrase(child) {
    const hoje = Store.today();
    const st = Store.dayStatus(child.id, hoje);
    const pendentes = Store.pendingEntries(child.id).length;
    const atrasados = Store.upcomingEvents(child.id).filter((e) => !e.done && Store.daysUntil(e.date) < 0);
    const proximos = Store.upcomingEvents(child.id).filter((e) => !e.done && Store.daysUntil(e.date) >= 0);
    const bal = Store.balance(child.id);
    const meta = Number(child.goalAmount) || 0;

    if (atrasados.length) return `Ficou para trás: ${atrasados[0].title}. Bora resolver?`;
    if (st.required && st.complete) return 'Todas as tarefas do dia feitas. Você é demais!';
    if (proximos.length && Store.daysUntil(proximos[0].date) <= 2) {
      return `${proximos[0].title} está chegando. Já se preparou?`;
    }
    if (st.required && st.filled === 0) return 'Bom dia! Vamos começar pela primeira tarefa?';
    if (st.required) return `Faltam ${st.required - st.filled} tarefas do dia. Você consegue!`;
    if (pendentes) return `${pendentes} coisa(s) esperando a validação. Já já sai.`;
    if (meta && bal >= meta) return 'Você chegou na sua meta! Que orgulho.';
    if (meta) return `Faltam ${Store.money(meta - bal)} para a sua meta.`;
    return 'Tô aqui contigo. Me chama quando fizer alguma coisa!';
  }

  /* ---------- desenho ---------- */
  function accessorySvg(id, hex) {
    if (id === 'chapeu') {
      return `<g><path d="M56 62c10-30 78-30 88 0z" fill="#131338"/><rect x="40" y="58" width="120" height="12" rx="6" fill="#131338"/></g>`;
    }
    if (id === 'oculos') {
      return `<g fill="none" stroke="#131338" stroke-width="7">
        <circle cx="74" cy="96" r="26"/><circle cx="130" cy="96" r="26"/><path d="M100 96h4"/></g>`;
    }
    if (id === 'laco') {
      return `<g fill="#ff8fc8" stroke="#131338" stroke-width="5">
        <path d="M138 44c-16-14-30-6-30 6s16 16 30 6z"/><path d="M164 44c16-14 30-6 30 6s-16 16-30 6z" transform="translate(-26)"/>
        <circle cx="151" cy="50" r="7"/></g>`;
    }
    if (id === 'coroa') {
      return `<path d="M52 62 62 24l20 24 18-30 18 30 20-24 10 38z" fill="#ffd84b" stroke="#131338" stroke-width="5" stroke-linejoin="round"/>`;
    }
    if (id === 'fone') {
      return `<g fill="none" stroke="#131338" stroke-width="8" stroke-linecap="round">
        <path d="M46 100a54 54 0 0 1 108 0"/></g>
        <rect x="30" y="94" width="24" height="38" rx="11" fill="#131338"/>
        <rect x="146" y="94" width="24" height="38" rx="11" fill="#131338"/>`;
    }
    return '';
  }

  function face(moodId) {
    const eyes = moodId === 'dormindo'
      ? `<path d="M60 100q14 14 28 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>
         <path d="M112 100q14 14 28 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>`
      : `<g class="pet-eye">
           <ellipse cx="74" cy="98" rx="17" ry="19" fill="#fff"/>
           <ellipse cx="126" cy="98" rx="17" ry="19" fill="#fff"/>
           <circle class="pet-pupil" cx="74" cy="102" r="9" fill="#131338"/>
           <circle class="pet-pupil" cx="126" cy="102" r="9" fill="#131338"/>
           <circle cx="70" cy="96" r="3" fill="#fff"/><circle cx="122" cy="96" r="3" fill="#fff"/>
         </g>`;
    const mouth = {
      festa: '<path d="M74 132q26 34 52 0q-26 12-52 0z" fill="#131338"/>',
      feliz: '<path d="M76 134q24 24 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>',
      triste: '<path d="M76 142q24-22 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>',
      preocupado: '<path d="M78 138h44" stroke="#131338" stroke-width="8" stroke-linecap="round"/>',
      dormindo: '<ellipse cx="100" cy="136" rx="11" ry="13" fill="#131338"/>',
    }[moodId] || '<path d="M76 134q24 24 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>';

    const extra = moodId === 'dormindo'
      ? `<g class="pet-zzz" fill="#131338" font-family="Archivo,Arial" font-weight="900">
           <text x="150" y="52" font-size="26">z</text>
           <text x="172" y="32" font-size="18">z</text>
         </g>`
      : moodId === 'festa'
        ? `<g class="pet-spark" fill="#131338"><circle cx="34" cy="66" r="5"/><circle cx="170" cy="76" r="6"/><circle cx="158" cy="40" r="4"/></g>`
        : '';

    return eyes + mouth + extra;
  }

  /** desenho do bichinho; `size` é a largura em px */
  function svg(child, size = 180, moodId) {
    const pet = Store.petOf(child.id);
    const c = color(pet.color);
    const sh = shape(pet.shape);
    const m = moodId || mood(child).id;
    return `
      <svg class="pet-svg mood-${m}" viewBox="0 0 200 200" width="${size}" height="${size}"
           role="img" aria-label="${UI.esc(pet.name)}, ${UI.esc(mood(child).label)}">
        <g class="pet-body">
          <ellipse class="pet-foot" cx="74" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
          <ellipse class="pet-foot" cx="126" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
          <path d="${sh.path}" fill="${c.hex}" stroke="#131338" stroke-width="6" stroke-linejoin="round"/>
          <ellipse cx="52" cy="126" rx="11" ry="7" fill="#131338" opacity=".16"/>
          <ellipse cx="148" cy="126" rx="11" ry="7" fill="#131338" opacity=".16"/>
          ${face(m)}
          ${accessorySvg(pet.accessory, c.hex)}
        </g>
      </svg>`;
  }

  /* ---------- cartão da tela inicial ---------- */
  function card(child) {
    const pet = Store.petOf(child.id);
    const lv = level(pet.xp);
    const pct = Math.round(progress(pet.xp) * 100);
    const carinhos = Store.petCareLeft(child.id);
    return `
      <section class="pet-card" data-pet-card>
        <div class="pet-stage">
          <button class="pet-hit" data-pet-touch aria-label="Fazer carinho em ${UI.esc(pet.name)}">
            ${svg(child, 168)}
          </button>
        </div>
        <div class="pet-info">
          <div class="pet-bubble" data-pet-bubble>${UI.esc(phrase(child))}</div>
          <div class="pet-name-row">
            <h3>${UI.esc(pet.name)}</h3>
            <span class="chip lime">nível ${lv}</span>
          </div>
          <div class="bar pet-bar"><i style="width:${pct}%"></i></div>
          <p class="tiny muted">${pet.xp} pontos de amizade • ${carinhos} carinho(s) hoje</p>
          <div class="row" style="gap:9px">
            <button class="btn btn-primary btn-sm grow" data-pet-touch>Fazer carinho</button>
            <button class="btn btn-ghost btn-sm grow" data-pet-open>Cuidar do bichinho</button>
          </div>
        </div>
      </section>`;
  }

  /* ---------- painel de personalização ---------- */
  function openSheet(child) {
    const pet = Store.petOf(child.id);
    const lv = level(pet.xp);
    const liberados = unlocked(lv);

    UI.openSheet({
      title: `Meu bichinho`,
      subtitle: `${pet.name} • nível ${lv} • ${pet.xp} pontos de amizade`,
      body: `
        <div class="pet-preview" data-pet-preview>${svg(child, 150)}</div>
        <form id="pet-form">
          ${UI.field('Nome', UI.input('name', { value: pet.name, placeholder: 'ex.: Pipoca' }))}
          <div class="field">
            <label>Formato</label>
            <div class="pick-grid shapes" data-pick="shape">
              ${SHAPES.map((sh) => `
                <button type="button" data-value="${sh.id}" aria-pressed="${sh.id === pet.shape}" title="${sh.label}">
                  <svg viewBox="0 0 200 200"><path d="${sh.path}" fill="currentColor"/></svg>
                </button>`).join('')}
            </div>
            <input type="hidden" name="shape" value="${UI.esc(pet.shape)}" />
          </div>
          <div class="field">
            <label>Cor</label>
            <div class="pick-grid swatches" data-pick="color">
              ${COLORS.map((c) => `
                <button type="button" data-value="${c.id}" aria-pressed="${c.id === pet.color}"
                        style="background:${c.hex}" aria-label="${c.label}"></button>`).join('')}
            </div>
            <input type="hidden" name="color" value="${UI.esc(pet.color)}" />
          </div>
          <div class="field">
            <label>Acessório</label>
            <div class="seg-mini wrap" data-pick="accessory">
              ${liberados.map((a) => `
                <button type="button" data-value="${a.id}" aria-pressed="${a.id === pet.accessory}">${UI.esc(a.label)}</button>`).join('')}
            </div>
            <input type="hidden" name="accessory" value="${UI.esc(pet.accessory)}" />
          </div>
          ${ACCESSORIES.filter((a) => a.level > lv).length ? `
            <div class="note">
              Ainda bloqueado: ${ACCESSORIES.filter((a) => a.level > lv)
                .map((a) => `${a.label} (nível ${a.level})`).join(', ')}.
              Cada tarefa, livro e compromisso concluído dá pontos de amizade.
            </div>` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Fechar</button>
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        const preview = sheet.querySelector('[data-pet-preview]');
        const repaint = () => {
          const data = UI.formData(sheet.querySelector('#pet-form'));
          const c = color(data.color);
          const sh = shape(data.shape);
          preview.innerHTML = `
            <svg class="pet-svg" viewBox="0 0 200 200" width="150" height="150" aria-hidden="true">
              <g class="pet-body">
                <ellipse cx="74" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
                <ellipse cx="126" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
                <path d="${sh.path}" fill="${c.hex}" stroke="#131338" stroke-width="6" stroke-linejoin="round"/>
                ${face('feliz')}
                ${accessorySvg(data.accessory, c.hex)}
              </g>
            </svg>`;
        };
        sheet.querySelectorAll('[data-pick]').forEach((box) => {
          const input = sheet.querySelector(`input[name="${box.getAttribute('data-pick')}"]`);
          box.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-value]');
            if (!btn) return;
            box.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            if (input) input.value = btn.getAttribute('data-value');
            repaint();
          });
        });
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#pet-form'));
          const res = Store.savePet(child.id, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast(`${res.pet.name} adorou o visual novo`, 'ok');
          App.render();
        });
      },
    });
  }

  /* ---------- interação ---------- */
  function touch(child, el) {
    const res = Store.petCare(child.id);
    const stage = (el && el.closest('.pet-card')) || document;
    const svgEl = stage.querySelector ? stage.querySelector('.pet-svg') : null;
    if (svgEl) {
      svgEl.classList.remove('is-happy');
      void svgEl.offsetWidth;
      svgEl.classList.add('is-happy');
    }
    if (!res.ok) {
      UI.toast(res.error);
      return;
    }
    Effects.burst('task', svgEl || el);
    const bubble = stage.querySelector ? stage.querySelector('[data-pet-bubble]') : null;
    if (bubble) {
      const falas = [
        'Que carinho bom!', 'Hihi, faz de novo!', 'Você é minha pessoa favorita.',
        'Tô cheio de energia agora!', 'Vamos fazer uma tarefa juntos?',
      ];
      bubble.textContent = falas[Math.floor(res.count % falas.length)];
      bubble.classList.remove('pop');
      void bubble.offsetWidth;
      bubble.classList.add('pop');
    }
    if (res.levelUp) {
      Effects.burst('goal');
      UI.toast(`${Store.petOf(child.id).name} subiu para o nível ${level(Store.petOf(child.id).xp)}!`, 'ok');
    }
  }

  function bind(root, child, rerender) {
    root.querySelectorAll('[data-pet-touch]').forEach((b) =>
      b.addEventListener('click', () => touch(child, b)));
    root.querySelectorAll('[data-pet-open]').forEach((b) =>
      b.addEventListener('click', () => openSheet(child)));
  }

  return {
    svg, card, bind, openSheet, touch, mood, phrase,
    level, progress, COLORS, SHAPES, ACCESSORIES, XP_POR_NIVEL, CARINHOS_POR_DIA,
  };
})();

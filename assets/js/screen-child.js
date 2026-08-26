/* =========================================================
   screen-child.js: área do filho(a)
   ========================================================= */
const ChildScreen = (() => {
  let tab = 'home';
  let date = Store.today();
  let filter = 'all';
  let diaryFilter = 'all';

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  /* ---------- topo ---------- */
  function topbar(user) {
    const pend = Store.pendingEntries(user.id).length;
    return `
      <header class="topbar">
        <div class="who">
          <div class="avatar ${user.color || 'g1'}">${UI.esc(user.name.trim().charAt(0).toUpperCase())}</div>
          <div>
            <div class="t1">${greet()}, ${UI.esc(user.name.split(' ')[0])}</div>
            <div class="t2">${Store.labelMonth(Store.monthOf(Store.today()))}</div>
          </div>
        </div>
        <div class="row" style="gap:9px">
          <button class="icon-btn badge" data-count="${pend}" data-go="extrato" aria-label="Lançamentos aguardando">${Icons.svg('clock')}</button>
          <button class="icon-btn" data-menu aria-label="Menu">${Icons.svg('menu')}</button>
        </div>
      </header>`;
  }

  /* ---------- aba: hoje ---------- */
  function heroCard(user) {
    const bal = Store.balance(user.id);
    const t = Store.totals(user.id, Store.monthOf(Store.today()));
    const goal = Number(user.goalAmount) || 0;
    const pct = goal > 0 ? Math.max(0, Math.min(100, (bal / goal) * 100)) : 0;
    return `
      <section class="hero">
        <div class="hero-top">
          <div class="hero-ico">${Icons.svg('wallet')}</div>
          <div class="grow">
            <div class="label">Saldo disponível</div>
            <div class="value"><small>R$</small>${Math.abs(bal).toFixed(2).replace('.', ',')}</div>
          </div>
        </div>
        ${goal > 0 ? `
          <div style="position:relative;margin-top:16px">
            <div class="between" style="margin-bottom:7px">
              <span class="tiny row" style="color:var(--panel-muted);gap:6px">${Icons.svg('target', 'ico-sm')} ${UI.esc(user.goalName || 'Meta')}</span>
              <span class="tiny bold">${pct.toFixed(0)}% de ${Store.money(goal)}</span>
            </div>
            <div class="bar"><i style="width:${pct}%"></i></div>
          </div>` : ''}
        <div class="hero-stats mt16">
          <div class="hero-stat"><div class="k">validado</div><div class="v">${Store.money(t.approved)}</div></div>
          <div class="hero-stat"><div class="k">aguardando</div><div class="v">${Store.money(t.pending)}</div></div>
          <div class="hero-stat"><div class="k">descontos</div><div class="v">${Store.money(-t.penalties)}</div></div>
        </div>
      </section>`;
  }

  function daysStrip(user) {
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(Store.addDays(Store.today(), -i));
    return `
      <div class="days mt16">
        ${days.map((iso) => {
          const d = Store.fromISO(iso);
          const st = Store.dayStatus(user.id, iso);
          const dot = st.complete ? 'on' : (st.total > 0 ? 'pend' : '');
          return `
            <button class="day" data-day="${iso}" aria-pressed="${iso === date}">
              <div class="dw">${Store.WEEKDAYS[d.getDay()]}</div>
              <div class="dd">${d.getDate()}</div>
              <div class="dot ${dot}"></div>
            </button>`;
        }).join('')}
      </div>`;
  }

  function categoryGrid(user) {
    const cats = Store.categories();
    if (!cats.length) return UI.empty('folder', 'Ainda não há categorias. Peça para o responsável criar as ações da mesada.');
    return `
      <div class="grid">
        ${cats.map((c) => {
          const entries = Store.entriesOf(user.id, date).filter((e) => e.catId === c.id);
          const daily = c.items.filter((i) => i.daily).length;
          const doneDaily = entries.filter((e) => {
            const it = c.items.find((i) => i.id === e.itemId);
            return it && it.daily;
          }).length;
          let pin = '';
          if (daily > 0) {
            const cls = doneDaily >= daily ? 'ok' : (doneDaily > 0 ? 'warn' : 'todo');
            pin = `<span class="pin ${cls}">${doneDaily}/${daily}</span>`;
          } else if (entries.length) {
            pin = `<span class="pin ok">${entries.length}</span>`;
          }
          return `
            <button class="tile" data-cat="${c.id}">
              ${pin}
              <span class="em ${c.grad}">${Icons.svg(c.icon)}</span>
              <span class="nm">${UI.esc(c.name)}</span>
              <span class="sub">${c.items.length} ${c.items.length === 1 ? 'ação' : 'ações'}</span>
            </button>`;
        }).join('')}
      </div>`;
  }

  function homeView(user) {
    const st = Store.dayStatus(user.id, date);
    return `
      ${heroCard(user)}
      ${daysStrip(user)}
      <div class="card mt8">
        <div class="between">
          <div>
            <div class="bold" style="font-size:14.5px">${Store.labelDate(date)}</div>
            <div class="small muted mt8">
              ${st.required
                ? `${st.filled} de ${st.required} tarefas do dia preenchidas`
                : 'Sem tarefas obrigatórias configuradas'}
            </div>
          </div>
          <div class="center">
            <div class="tiny muted">do dia</div>
            <div class="bold" style="font-size:17px;color:${st.value < 0 ? 'var(--bad)' : 'var(--ok)'}">
              ${Store.money(st.value)}
            </div>
          </div>
        </div>
        ${st.required ? `
          <div class="bar mt12" style="background:var(--surface-2)">
            <i style="width:${Math.min(100, (st.filled / st.required) * 100)}%"></i>
          </div>` : ''}
      </div>

      <div class="section-title">
        <h3>Categorias</h3>
        <span class="small muted">toque para preencher</span>
      </div>
      ${categoryGrid(user)}

      <div class="section-title"><h3>Marcado ${Store.labelDate(date).toLowerCase()}</h3></div>
      ${dayEntriesList(user)}`;
  }

  function dayEntriesList(user) {
    const list = Store.entriesOf(user.id, date);
    if (!list.length) return UI.empty('pencil', 'Nada marcado ainda. Escolha uma categoria acima e registre o que você fez.');
    return `<div class="list">${list.map(entryRow).join('')}</div>`;
  }

  function entryRow(e) {
    const sign = e.kind === 'penalty' ? '-' : '+';
    return `
      <div class="task">
        <span class="em ${e.grad || 'g1'}">${Icons.svg(e.icon)}</span>
        <div class="grow">
          <div class="nm">${UI.esc(e.name)}</div>
          <div class="mt">
            ${UI.statusChip(e.status)}
            <span>${UI.esc(e.catName || '')}</span>
            ${e.note ? `<span>• ${UI.esc(e.note)}</span>` : ''}
          </div>
          ${UI.photoStrip(e.photos, 'small-thumbs')}
          ${e.reviewNote ? `<div class="note mt8">${UI.esc(e.reviewNote)}</div>` : ''}
        </div>
        <div class="col" style="align-items:flex-end;gap:6px">
          <span class="val ${e.kind === 'penalty' ? 'pen' : 'earn'}">${sign}${Store.money(e.value).replace('R$ ', '')}</span>
          ${e.status === 'pending'
            ? `<button class="btn btn-soft btn-sm" data-note="${e.id}" aria-label="Comentar">${Icons.svg('chat')}</button>` : ''}
        </div>
      </div>`;
  }

  /* ---------- aba: extrato ---------- */
  function extratoView(user) {
    const all = Store.historyOf(user.id, 90);
    const list = all.filter((e) => filter === 'all' || e.status === filter);
    const payouts = Store.payoutsOf(user.id);

    const byDate = {};
    list.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    return `
      <div class="seg-mini mt8" role="group" aria-label="Filtro">
        ${[['all', 'Tudo'], ['pending', 'Aguardando'], ['approved', 'Validado'], ['rejected', 'Recusado']]
          .map(([k, l]) => `<button data-filter="${k}" aria-pressed="${filter === k}">${l}</button>`).join('')}
      </div>

      ${payouts.length ? `
        <div class="section-title"><h3>Pagamentos recebidos</h3></div>
        <div class="list">
          ${payouts.slice(0, 4).map((p) => `
            <div class="mini-row">
              <span class="em g3" style="width:34px;height:34px;border-radius:12px;display:grid;place-items:center">${Icons.svg('banknote')}</span>
              <div class="grow">
                <div class="bold small">${UI.esc(p.note || 'Mesada paga')}</div>
                <div class="tiny muted">${Store.labelDate(p.date)}</div>
              </div>
              <span class="bold">${Store.money(p.amount)}</span>
            </div>`).join('')}
        </div>` : ''}

      <div class="section-title"><h3>Meus lançamentos</h3><span class="small muted">${list.length}</span></div>
      ${dates.length ? dates.map((d) => `
        <div class="date-head"><h4>${Store.labelDate(d)}</h4><span class="ln"></span>
          <span class="tiny muted">${Store.money(byDate[d].filter((e) => e.status !== 'rejected').reduce((s, e) => s + Store.signed(e), 0))}</span>
        </div>
        <div class="list">${byDate[d].map(entryRow).join('')}</div>`).join('')
        : UI.empty('calendar', 'Nenhum lançamento por aqui ainda.')}`;
  }

  /* ---------- aba: diário de livros e lições ---------- */
  function diaryCard(d, editable) {
    const kind = Store.diaryKind(d.kind);
    return `
      <article class="diary">
        <div class="row">
          <span class="em g1" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center">
            ${Icons.svg(kind.icon)}
          </span>
          <div class="grow">
            <div class="nm bold">${UI.esc(d.title)}</div>
            <div class="mt small muted">
              <span class="chip neutral">${UI.esc(kind.label)}</span>
              <span>${[
                `${Store.labelDate(d.date)} às ${d.time}`,
                d.minutes ? `${d.minutes} min` : '',
                d.detail || '',
              ].filter(Boolean).map(UI.esc).join(' • ')}</span>
            </div>
          </div>
          ${UI.statusChip(d.status)}
        </div>
        <p class="diary-text">${UI.esc(d.text)}</p>
        ${UI.photoStrip(d.photos)}
        ${d.reviewNote ? `<div class="note">${UI.esc(d.reviewNote)}</div>` : ''}
        ${editable && d.status === 'pending' ? `
          <div class="row" style="gap:9px">
            <button class="btn btn-ghost btn-sm grow" data-diary-edit="${d.id}">${Icons.svg('pencil')} Editar</button>
            <button class="btn btn-ghost btn-sm grow" data-diary-del="${d.id}">${Icons.svg('trash')} Apagar</button>
          </div>` : ''}
      </article>`;
  }

  function diarioView(user) {
    const all = Store.diaryOf(user.id);
    const list = diaryFilter === 'all' ? all : all.filter((d) => d.kind === diaryFilter);
    const ym = Store.monthOf(Store.today());
    const noMes = all.filter((d) => Store.monthOf(d.date) === ym).length;
    const aguardando = all.filter((d) => d.status === 'pending').length;
    const minutos = all
      .filter((d) => Store.monthOf(d.date) === ym)
      .reduce((sum, d) => sum + (d.minutes || 0), 0);

    const byDate = {};
    list.forEach((d) => { (byDate[d.date] = byDate[d.date] || []).push(d); });
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    return `
      <section class="hero">
        <div class="hero-top">
          <div class="hero-ico">${Icons.svg('book')}</div>
          <div class="grow">
            <div class="label">Livros e lições</div>
            <div class="value">${all.length}<small style="margin-left:6px">${all.length === 1 ? 'registro' : 'registros'}</small></div>
          </div>
        </div>
        <div class="hero-stats mt16">
          <div class="hero-stat"><div class="k">no mês</div><div class="v">${noMes}</div></div>
          <div class="hero-stat"><div class="k">minutos</div><div class="v">${minutos}</div></div>
          <div class="hero-stat"><div class="k">aguardando</div><div class="v">${aguardando}</div></div>
        </div>
      </section>

      <button class="btn btn-primary btn-block mt16" data-diary-new>
        ${Icons.svg('plus')} Escrever registro de hoje
      </button>

      <div class="seg-mini mt12" role="group" aria-label="Filtro do diário">
        <button data-diary-filter="all" aria-pressed="${diaryFilter === 'all'}">Tudo</button>
        ${Store.DIARY_KINDS.map((k) => `
          <button data-diary-filter="${k.id}" aria-pressed="${diaryFilter === k.id}">${UI.esc(k.label)}</button>`).join('')}
      </div>

      ${dates.length ? dates.map((d) => `
        <div class="date-head"><h4>${Store.labelDate(d)}</h4><span class="ln"></span>
          <span class="tiny muted">${byDate[d].length}</span></div>
        <div class="list">${byDate[d].map((rec) => diaryCard(rec, true)).join('')}</div>`).join('')
      : UI.empty('book', 'Nenhum registro ainda. Conte o que você leu ou estudou hoje, com horário e foto.')}`;
  }

  function openDiaryForm(user, record) {
    const editing = !!record;
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const kind = editing ? record.kind : 'livro';
    let picker = null;

    UI.openSheet({
      title: editing ? 'Editar registro' : 'Novo registro',
      subtitle: 'Livros, lições e atividades do dia',
      body: `
        <form id="diary-form">
          <div class="field">
            <label>Tipo</label>
            <div class="seg-mini" data-kind-group>
              ${Store.DIARY_KINDS.map((k) => `
                <button type="button" data-kind="${k.id}" aria-pressed="${kind === k.id}">${UI.esc(k.label)}</button>`).join('')}
            </div>
            <input type="hidden" name="kind" value="${UI.esc(kind)}" />
          </div>
          ${UI.field('Título', UI.input('title', {
            value: editing ? record.title : '',
            placeholder: 'ex.: O Pequeno Príncipe / Matemática',
          }))}
          ${UI.field('Detalhe (opcional)', UI.input('detail', {
            value: editing ? (record.detail || '') : '',
            placeholder: 'ex.: páginas 10 a 24',
          }))}
          <div class="row" style="gap:10px;align-items:stretch">
            <div class="grow">${UI.field('Data', UI.input('date', { type: 'date', value: editing ? record.date : Store.today() }))}</div>
            <div class="grow">${UI.field('Horário', UI.input('time', { type: 'time', value: editing ? record.time : hhmm }))}</div>
          </div>
          ${UI.field('Tempo em minutos (opcional)', UI.input('minutes', {
            type: 'number', value: editing && record.minutes ? record.minutes : '',
            attrs: 'min="0" step="5"', placeholder: '30',
          }))}
          ${UI.field('O que você fez', `
            <textarea name="text" rows="5" placeholder="Escreva com suas palavras o que leu, estudou ou treinou hoje">${editing ? UI.esc(record.text) : ''}</textarea>`)}
          ${UI.photoField('Fotos do que você fez', editing ? record.photos : [])}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(record.id)}" />` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>${editing ? 'Salvar' : 'Enviar registro'}</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        const kindInput = sheet.querySelector('input[name="kind"]');
        sheet.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => {
          sheet.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          kindInput.value = b.getAttribute('data-kind');
        }));
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#diary-form'));
          data.childId = user.id;
          const res = Store.saveDiary(data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast(editing ? 'Registro atualizado' : 'Registro enviado para o responsável', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /* ---------- aba: perfil ---------- */
  function perfilView(user) {
    const t = Store.totals(user.id, Store.monthOf(Store.today()));
    const bal = Store.balance(user.id);
    return `
      <section class="card mt8" style="display:flex;align-items:center;gap:14px">
        <div class="avatar ${user.color || 'g1'}" style="width:58px;height:58px;font-size:24px">${UI.esc(user.name.trim().charAt(0).toUpperCase())}</div>
        <div class="grow">
          <div class="bold" style="font-size:17px">${UI.esc(user.name)}</div>
          <div class="small muted">@${UI.esc(user.username)}</div>
        </div>
      </section>

      <div class="stat-row mt16">
        <div class="stat"><div class="k">saldo</div><div class="v">${Store.money(bal)}</div></div>
        <div class="stat"><div class="k">validadas</div><div class="v">${t.approvedCount}</div></div>
        <div class="stat"><div class="k">aguardando</div><div class="v">${t.pendingCount}</div></div>
      </div>

      ${Number(user.goalAmount) > 0 ? `
        <div class="section-title"><h3>Minha meta</h3></div>
        <div class="card">
          <div class="between">
            <div class="row"><span class="em g4" style="width:38px;height:38px;border-radius:13px;display:grid;place-items:center">${Icons.svg('target')}</span>
              <div><div class="bold small">${UI.esc(user.goalName || 'Meta')}</div>
              <div class="tiny muted">falta ${Store.money(Math.max(0, user.goalAmount - bal))}</div></div>
            </div>
            <span class="bold">${Store.money(user.goalAmount)}</span>
          </div>
          <div class="bar mt12" style="background:var(--surface-2)">
            <i style="width:${Math.max(0, Math.min(100, (bal / user.goalAmount) * 100))}%"></i>
          </div>
        </div>` : ''}

      <div class="section-title"><h3>Conta</h3></div>
      <div class="list">
        <button class="mini-row" data-change-pass>
          ${Icons.svg('lock')}<span class="grow bold small" style="text-align:left">Trocar minha senha</span>${Icons.svg('chevron', 'ico-sm dim')}
        </button>
        <button class="mini-row" data-theme-toggle>
          ${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}
          <span class="grow bold small" style="text-align:left">Tema ${Store.theme() === 'dark' ? 'claro' : 'escuro'}</span>${Icons.svg('chevron', 'ico-sm dim')}
        </button>
        <button class="mini-row" data-logout>
          ${Icons.svg('logout')}<span class="grow bold small" style="text-align:left">Sair da conta</span>${Icons.svg('chevron', 'ico-sm dim')}
        </button>
      </div>`;
  }

  /* ---------- sheet de categoria ---------- */
  function openCategory(user, catId) {
    const cat = Store.categoryById(catId);
    if (!cat) return;
    const body = () => {
      if (!cat.items.length) return UI.empty('star', 'Nenhuma ação nesta categoria ainda.');
      return `<div class="list">
        ${cat.items.map((it) => {
          const e = Store.entryFor(user.id, date, it.id);
          const marked = !!e;
          const locked = e && e.status !== 'pending';
          return `
            <button class="task ${marked ? 'done' : ''}" data-item="${it.id}" ${locked ? 'data-locked="1"' : ''}>
              <span class="check ${marked ? 'on' : ''}">${Icons.svg('check')}</span>
              <div class="grow">
                <div class="nm">${UI.esc(it.name)}</div>
                <div class="mt">
                  ${it.daily ? '<span class="chip neutral">todo dia</span>' : ''}
                  ${e ? UI.statusChip(e.status) : ''}
                  ${locked ? Icons.svg('lock', 'ico-sm dim') : ''}
                </div>
              </div>
              <span class="val ${it.kind === 'penalty' ? 'pen' : 'earn'}">
                ${it.kind === 'penalty' ? '-' : '+'}${Store.money(it.value).replace('R$ ', '')}
              </span>
            </button>`;
        }).join('')}
      </div>`;
    };

    /** liga os toques da lista e atualiza o painel sem fechá-lo */
    function bindItems(sheet) {
      sheet.querySelectorAll('[data-item]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.getAttribute('data-locked')) {
            return UI.toast('Esse item já foi validado pelo responsável');
          }
          const res = Store.toggleEntry(user.id, date, cat.id, btn.getAttribute('data-item'));
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.toast(res.added ? 'Marcado. Aguardando validação.' : 'Desmarcado');
          App.render();                                  // atualiza a tela ao fundo
          sheet.querySelector('.sheet-body').innerHTML = body();
          bindItems(sheet);
        });
      });
    }

    UI.openSheet({
      title: cat.name,
      subtitle: `${Store.labelDate(date)}. Toque para marcar o que você fez.`,
      body: body(),
      actions: '<button class="btn btn-primary btn-block" data-done>Pronto</button>',
      onMount(sheet) {
        sheet.querySelector('[data-done]').addEventListener('click', UI.closeSheet);
        bindItems(sheet);
      },
    });
  }

  function openNote(entryId) {
    const state = Store.get();
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
    let picker = null;
    UI.openSheet({
      title: 'Comentário e fotos',
      subtitle: e.name,
      body: `
        <form id="note-form">
          ${UI.field('Conte como foi (opcional)', `
            <textarea name="note" rows="3" placeholder="ex.: terminei toda a lição de matemática">${UI.esc(e.note)}</textarea>`)}
          ${UI.photoField('Fotos (opcional)', e.photos || [])}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#note-form'));
          Store.setEntryNote(entryId, data.note, picker.ids());
          picker.commit();
          UI.closeSheet();
          UI.toast('Comentário salvo', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  function openDaySummary(user) {
    const list = Store.entriesOf(user.id, date);
    const st = Store.dayStatus(user.id, date);
    UI.openSheet({
      title: `Resumo de ${Store.labelDate(date).toLowerCase()}`,
      subtitle: `${list.length} ${list.length === 1 ? 'lançamento' : 'lançamentos'} • ${Store.money(st.value)}`,
      body: `
        <div class="stat-row">
          <div class="stat"><div class="k">obrigatórias</div><div class="v">${st.filled}/${st.required}</div></div>
          <div class="stat"><div class="k">aguardando</div><div class="v">${st.pending}</div></div>
          <div class="stat"><div class="k">total do dia</div><div class="v">${Store.money(st.value)}</div></div>
        </div>
        ${st.required && !st.complete
          ? `<div class="note">Ainda faltam ${st.required - st.filled} tarefa(s) do dia. Elas contam para a sua mesada.</div>`
          : '<div class="note">Tudo que era obrigatório do dia está preenchido.</div>'}
        ${list.length ? `<div class="list">${list.map(entryRow).join('')}</div>` : UI.empty('pencil', 'Nada marcado neste dia.')}`,
      actions: '<button class="btn btn-primary btn-block" data-ok>Enviar para validação</button>',
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          UI.closeSheet();
          UI.toast(list.length ? 'Enviado. O responsável já pode validar.' : 'Marque alguma tarefa primeiro.',
            list.length ? 'ok' : '');
        });
      },
    });
  }

  function openMenu(user) {
    UI.openSheet({
      title: 'Menu',
      subtitle: user.name,
      body: `
        <div class="list">
          <button class="mini-row" data-m="perfil">${Icons.svg('user')}<span class="grow bold small" style="text-align:left">Meu perfil</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="diario">${Icons.svg('book')}<span class="grow bold small" style="text-align:left">Diário de livros e lições</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="extrato">${Icons.svg('chart')}<span class="grow bold small" style="text-align:left">Extrato completo</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="theme">${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}<span class="grow bold small" style="text-align:left">Trocar tema</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="logout">${Icons.svg('logout')}<span class="grow bold small" style="text-align:left">Sair</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
          const m = b.getAttribute('data-m');
          UI.closeSheet();
          if (m === 'logout') return App.logout();
          if (m === 'theme') { App.toggleTheme(); return App.render(); }
          tab = m;
          App.render();
        }));
      },
    });
  }

  /* ---------- render ---------- */
  function render(root, user) {
    const views = { home: homeView, diario: diarioView, extrato: extratoView, perfil: perfilView };
    const view = (views[tab] || homeView)(user);

    root.innerHTML = `
      <div class="shell">
        ${topbar(user)}
        <div class="scroll">${view}</div>
        <nav class="tabbar">
          <button class="tab" data-tab="home" aria-pressed="${tab === 'home'}">${Icons.svg('home')}Hoje</button>
          <button class="tab" data-tab="diario" aria-pressed="${tab === 'diario'}">${Icons.svg('book')}Diário</button>
          <button class="fab" data-fab aria-label="${tab === 'diario' ? 'Novo registro' : 'Resumo do dia'}">
            ${Icons.svg(tab === 'diario' ? 'plus' : 'check')}</button>
          <button class="tab" data-tab="extrato" aria-pressed="${tab === 'extrato'}">${Icons.svg('chart')}Extrato</button>
          <button class="tab" data-menu>${Icons.svg('menu')}Menu</button>
        </nav>
      </div>`;

    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
      tab = b.getAttribute('data-tab');
      render(root, user);
    }));
    root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      tab = b.getAttribute('data-go');
      render(root, user);
    }));
    root.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', () => openMenu(user)));
    const selectedDay = root.querySelector(`[data-day="${date}"]`);
    if (selectedDay) selectedDay.scrollIntoView({ inline: 'center', block: 'nearest' });

    root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
      date = b.getAttribute('data-day');
      render(root, user);
    }));
    root.querySelectorAll('[data-cat]').forEach((b) =>
      b.addEventListener('click', () => openCategory(user, b.getAttribute('data-cat'))));
    root.querySelectorAll('[data-note]').forEach((b) =>
      b.addEventListener('click', () => openNote(b.getAttribute('data-note'))));
    root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      filter = b.getAttribute('data-filter');
      render(root, user);
    }));
    const fab = root.querySelector('[data-fab]');
    if (fab) fab.addEventListener('click', () => (tab === 'diario' ? openDiaryForm(user, null) : openDaySummary(user)));

    const diaryNew = root.querySelector('[data-diary-new]');
    if (diaryNew) diaryNew.addEventListener('click', () => openDiaryForm(user, null));
    root.querySelectorAll('[data-diary-filter]').forEach((b) => b.addEventListener('click', () => {
      diaryFilter = b.getAttribute('data-diary-filter');
      render(root, user);
    }));
    root.querySelectorAll('[data-diary-edit]').forEach((b) => b.addEventListener('click', () => {
      const rec = Store.diaryById(b.getAttribute('data-diary-edit'));
      if (rec) openDiaryForm(user, rec);
    }));
    root.querySelectorAll('[data-diary-del]').forEach((b) => b.addEventListener('click', async () => {
      const rec = Store.diaryById(b.getAttribute('data-diary-del'));
      if (!rec) return;
      const ok = await UI.confirm({
        title: 'Apagar este registro?',
        text: 'O texto e as fotos desse registro serão apagados.',
        okLabel: 'Apagar', danger: true,
      });
      if (ok) { Store.removeDiary(rec.id); UI.toast('Registro apagado'); App.render(); }
    }));

    const themeBtn = root.querySelector('[data-theme-toggle]');
    if (themeBtn) themeBtn.addEventListener('click', () => { App.toggleTheme(); render(root, user); });
    const logoutBtn = root.querySelector('[data-logout]');
    if (logoutBtn) logoutBtn.addEventListener('click', () => App.logout());
    const passBtn = root.querySelector('[data-change-pass]');
    if (passBtn) passBtn.addEventListener('click', () => App.openChangePassword(user));
  }

  return { render, reset() { tab = 'home'; date = Store.today(); filter = 'all'; diaryFilter = 'all'; } };
})();

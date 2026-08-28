/* =========================================================
   screen-child.js: área do filho(a)
   ========================================================= */
const ChildScreen = (() => {
  let tab = 'home';
  let escolaTab = 'licao';
  let date = Store.today();
  let filter = 'all';
  let diaryFilter = 'all';
  let moneyTab = 'carteira';   // dentro da Carteira: lançamentos ou painel

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

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
          const marcadasDoDia = entries.filter((e) => {
            const it = c.items.find((i) => i.id === e.itemId);
            return it && it.daily;
          });
          // uma tarefa de todo dia só conta como feita depois da foto
          const doneDaily = marcadasDoDia.filter((e) => !Store.entryNeedsPhoto(e)).length;
          const semFoto = marcadasDoDia.filter(Store.entryNeedsPhoto).length;
          let pin = '';
          if (daily > 0) {
            const cls = semFoto ? 'foto' : doneDaily >= daily ? 'ok' : (doneDaily > 0 ? 'warn' : 'todo');
            pin = `<span class="pin ${cls}">${semFoto
              ? Icons.svg('camera', 'ico-sm') + ' ' + doneDaily + '/' + daily
              : doneDaily + '/' + daily}</span>`;
          } else if (entries.length) {
            pin = `<span class="pin ok">${entries.length}</span>`;
          }
          return `
            <button class="tile ${c.photo ? 'has-photo' : c.grad}" data-cat="${c.id}">
              ${pin}
              ${c.photo
                ? `<span class="tile-ico photo"><img data-photo="${UI.esc(c.photo)}" alt="" /></span>`
                : `<span class="tile-ico">${Icons.svg(c.icon)}</span>`}
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
        ${UI.entryVisual(e)}
        <div class="grow">
          <div class="nm">${UI.esc(e.name)}</div>
          <div class="mt">
            ${UI.statusChip(e.status)}
            <span>${UI.esc(e.catName || '')}</span>
            ${Store.entryNeedsPhoto(e) ? '<span class="chip warn">falta a foto</span>' : ''}
            ${e.note ? `<span>• ${UI.esc(e.note)}</span>` : ''}
          </div>
          ${UI.photoStrip(e.photos, 'small-thumbs')}
          ${e.reviewNote ? `<div class="note mt8">${UI.esc(e.reviewNote)}</div>` : ''}
        </div>
        <div class="col" style="align-items:flex-end;gap:6px">
          <span class="val ${e.kind === 'penalty' ? 'pen' : 'earn'}">${sign}${Store.money(e.value).replace('R$ ', '')}</span>
          ${e.status === 'pending'
            ? `<button class="btn ${Store.entryNeedsPhoto(e) ? 'btn-primary' : 'btn-soft'} btn-sm"
                 data-note="${e.id}" aria-label="Comentar e enviar foto">
                 ${Icons.svg('camera')}</button>` : ''}
        </div>
      </div>`;
  }

  /* ---------- gastos: o que o filho comprou ---------- */
  function purchaseRow(pc) {
    const kind = Store.purchaseKind(pc.kind);
    return `
      <button class="spend-row" data-purchase-edit="${pc.id}">
        <span class="em ${kind.grad}" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center">
          ${Icons.svg(kind.icon)}
        </span>
        <span class="grow">
          <span class="nm block">${UI.esc(pc.title)}</span>
          <span class="tiny muted block">${UI.esc(kind.label)} • ${UI.esc(Store.labelDate(pc.date))}${pc.note ? ' • ' + UI.esc(pc.note) : ''}</span>
        </span>
        <span class="val pen">-${Store.money(pc.value).replace('R$ ', '')}</span>
      </button>`;
  }

  function carteiraCard(user) {
    const c = Store.cash(user.id);
    return `
      <section class="card">
        <div class="between">
          <div class="row">
            <span class="em g3" style="width:42px;height:42px;border-radius:15px;display:grid;place-items:center">
              ${Icons.svg('wallet')}
            </span>
            <div>
              <div class="tiny muted">Dinheiro na carteira</div>
              <div class="bold" style="font-size:19px;color:${c.left < 0 ? 'var(--bad)' : 'var(--ink)'}" data-cash>
                ${Store.money(c.left)}
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" data-new-purchase>${Icons.svg('coins')} Registrar gasto</button>
        </div>
        <div class="stat-row mt12">
          <div class="stat"><div class="k">recebido</div><div class="v">${Store.money(c.received)}</div></div>
          <div class="stat"><div class="k">gastei</div><div class="v">${Store.money(c.spent)}</div></div>
          <div class="stat"><div class="k">sobrou</div><div class="v">${Store.money(c.left)}</div></div>
        </div>
        ${c.left < 0 ? `<div class="note mt12">
          Você anotou mais gastos do que recebeu pelo app. Peça para o responsável registrar os
          pagamentos que já foram feitos.
        </div>` : ''}
      </section>`;
  }

  function openPurchaseForm(user, purchase) {
    const editing = !!purchase;
    const kind = editing ? purchase.kind : 'lanche';
    let picker = null;
    UI.openSheet({
      title: editing ? 'Editar gasto' : 'O que você comprou?',
      subtitle: 'Anote o que comprou com o seu dinheiro',
      body: `
        <form id="purchase-form">
          <div class="field">
            <label>Tipo</label>
            <div class="seg-mini wrap">
              ${Store.PURCHASE_KINDS.map((k) => `
                <button type="button" data-kind="${k.id}" aria-pressed="${kind === k.id}">${UI.esc(k.label)}</button>`).join('')}
            </div>
            <input type="hidden" name="kind" value="${UI.esc(kind)}" />
          </div>
          ${UI.field('O que foi', UI.input('title', {
            value: editing ? purchase.title : '', placeholder: 'ex.: lanche na cantina',
          }))}
          ${UI.field('Quanto custou (R$)', UI.input('value', {
            type: 'number', value: editing ? purchase.value : '', attrs: 'min="0" step="0.01"', placeholder: '5,00',
          }))}
          ${UI.field('Data', UI.input('date', { type: 'date', value: editing ? purchase.date : Store.today() }))}
          ${UI.field('Observação (opcional)', UI.input('note', {
            value: editing ? (purchase.note || '') : '', placeholder: 'onde comprou, com quem',
          }))}
          ${UI.photoField('Foto do que comprou (opcional)', editing ? purchase.photos : [])}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(purchase.id)}" />` : ''}
        </form>`,
      actions: `
        ${editing
          ? '<button class="btn btn-ghost" data-del>Excluir</button>'
          : '<button class="btn btn-ghost" data-cancel>Cancelar</button>'}
        <button class="btn btn-primary" data-ok>${editing ? 'Salvar' : 'Registrar gasto'}</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        const kindInput = sheet.querySelector('input[name="kind"]');
        sheet.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => {
          sheet.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          kindInput.value = b.getAttribute('data-kind');
        }));
        const cancel = sheet.querySelector('[data-cancel]');
        if (cancel) cancel.addEventListener('click', UI.closeSheet);
        const del = sheet.querySelector('[data-del]');
        if (del) del.addEventListener('click', async () => {
          const ok = await UI.confirm({
            title: 'Apagar este gasto?',
            text: 'O valor volta para a sua carteira.',
            okLabel: 'Apagar', danger: true,
          });
          if (ok) {
            Store.removePurchase(purchase.id);
            picker.commit();
            UI.closeSheet();
            UI.toast('Gasto apagado');
            App.render();
          }
        });
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#purchase-form'));
          const res = Store.savePurchase(user.id, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast(editing ? 'Gasto atualizado' : 'Gasto registrado', 'ok');
          App.render();
          Effects.burst('spend');
          Effects.floatValue(`-${Store.money(res.purchase.value)}`, document.querySelector('[data-cash]'), 'spend');
          Effects.pulse('[data-cash]');
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /* ---------- aba: extrato ---------- */
  function extratoView(user) {
    const abas = `
      <div class="seg-tabs" data-money>
        <button type="button" data-money-tab="carteira" aria-pressed="${moneyTab === 'carteira'}">
          ${Icons.svg('wallet')} Carteira
        </button>
        <button type="button" data-money-tab="painel" aria-pressed="${moneyTab === 'painel'}">
          ${Icons.svg('chart')} Meu dinheiro
        </button>
      </div>`;
    if (moneyTab === 'painel') return abas + Dash.view(user);
    return abas + lancamentosView(user);
  }

  function lancamentosView(user) {
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

      ${carteiraCard(user)}

      <div class="section-title">
        <h3>Meus gastos</h3>
        <button class="link" data-new-purchase>+ registrar</button>
      </div>
      ${(() => {
        const gastos = Store.purchasesOf(user.id);
        return gastos.length
          ? `<div class="list">${gastos.map(purchaseRow).join('')}</div>`
          : UI.empty('coins', 'Você ainda não anotou nenhum gasto. Registre o que comprar com a sua mesada.');
      })()}

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
          Effects.burst(res.record.kind === 'livro' ? 'book' : 'task');
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /* ---------- aba: perfil ---------- */
  /* ---------- lembrete diário ---------- */
  const HORAS = ['07:00', '08:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  function lembreteCard(user) {
    const r = Store.reminderOf(user.id);
    const perm = Notify.permissao();
    return `
      <div class="section-title mt16"><h3>Meu lembrete de todo dia</h3></div>
      <section class="card">
        <div class="between">
          <div class="row">
            <span class="em ${r.on ? 'g8' : 'g6'}" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center">
              ${Icons.svg('bell')}
            </span>
            <div>
              <div class="bold small">${r.on ? `Ligado para as ${r.hora}` : 'Desligado'}</div>
              <div class="tiny muted">
                ${r.on
                  ? 'Todo dia nesse horário o bichinho chama você.'
                  : 'Um toque por dia para não esquecer as tarefas e a leitura.'}
              </div>
            </div>
          </div>
          <button type="button" class="switch" data-lembrete aria-pressed="${r.on}" aria-label="Lembrete de todo dia"></button>
        </div>

        <div class="field mt12">
          <label>Que horas você quer ser lembrada</label>
          <div class="seg-mini" data-horas>
            ${HORAS.map((h) => `<button type="button" data-hora="${h}" aria-pressed="${h === r.hora}">${h}</button>`).join('')}
          </div>
        </div>

        ${perm === 'denied' ? `<div class="note aviso">
            Este celular bloqueou os avisos do app. Para liberar, abra as configurações do
            navegador, procure este site e ligue as notificações.
          </div>` : ''}

        <div class="note mt12">
          <b>Para o aviso chegar mesmo com o app fechado:</b> guarde o app na tela de início do
          celular (no menu do navegador, "adicionar à tela de início"). No iPhone isso é obrigatório.
          Se mesmo assim não chegar, use o botão do calendário aqui embaixo: o próprio celular
          passa a avisar todo dia, sem depender do app.
        </div>

        <div class="acts mt12">
          <button class="btn btn-soft btn-sm" data-lembrete-testar>${Icons.svg('bell')} Testar agora</button>
          <button class="btn btn-soft btn-sm" data-lembrete-agenda>${Icons.svg('calendar')} Pôr no calendário</button>
        </div>
      </section>`;
  }

  function ligarLembrete(root, user) {
    const troca = root.querySelector('[data-lembrete]');
    if (troca) {
      troca.addEventListener('click', async () => {
        const ligando = troca.getAttribute('aria-pressed') !== 'true';
        if (!ligando) {
          Notify.desligar(user);
          UI.toast('Lembrete desligado');
          App.render();
          return;
        }
        const res = await Notify.ligar(user, Store.reminderOf(user.id).hora);
        if (!res.ok) { UI.toast(res.error, 'bad'); App.render(); return; }
        UI.toast('Lembrete ligado. Já já ele te chama.', 'ok');
        await Notify.mostrar(user);
        App.render();
      });
    }
    root.querySelectorAll('[data-hora]').forEach((b) => b.addEventListener('click', async () => {
      const hora = b.getAttribute('data-hora');
      Store.setReminder(user.id, { hora, ultimo: '' });
      if (Store.reminderOf(user.id).on) Notify.agendar(user);
      UI.toast(`Lembrete às ${hora}`);
      App.render();
    }));
    const testar = root.querySelector('[data-lembrete-testar]');
    if (testar) testar.addEventListener('click', async () => {
      const ok = await Notify.pedir();
      if (!ok) return UI.toast('Você precisa permitir os avisos primeiro', 'bad');
      const foi = await Notify.mostrar(user);
      UI.toast(foi ? 'Mandei o aviso. Olha a tela do celular.' : 'Não deu para mostrar o aviso neste aparelho', foi ? 'ok' : 'bad');
      return undefined;
    });
    const agenda = root.querySelector('[data-lembrete-agenda]');
    if (agenda) agenda.addEventListener('click', () => openCalendario(user));
  }

  /**
   * Lembrete no calendário do celular. O caminho normal é baixar o
   * arquivo, mas alguns visualizadores bloqueiam download, então o texto
   * fica aqui do lado para ela copiar e nunca ficar sem saída.
   */
  function openCalendario(user) {
    const texto = Notify.calendario(user);
    const r = Store.reminderOf(user.id);
    UI.openSheet({
      title: 'Pôr o lembrete no calendário',
      subtitle: `Todo dia às ${r.hora}, direto no celular`,
      body: `
        <div class="note">
          Esse é o jeito que funciona em <b>qualquer celular</b>, mesmo com o app fechado e sem
          internet: quem avisa passa a ser o calendário do próprio aparelho.
        </div>
        <ol class="passos">
          <li>Toque em <b>Baixar o arquivo</b> aqui embaixo.</li>
          <li>Abra o arquivo que baixou (ele se chama <b>lembrete-da-mesada.ics</b>).</li>
          <li>O celular pergunta se quer guardar no calendário. Diga que sim.</li>
        </ol>
        <div class="note aviso">
          Se o botão não baixar nada, use o <b>Copiar o texto</b>: cole num arquivo chamado
          <b>lembrete.ics</b> e abra ele no celular. Dá no mesmo.
        </div>
        <details class="mt12">
          <summary class="small bold">Ver o texto do lembrete</summary>
          <textarea class="ics-texto mt8" rows="10" readonly data-ics>${UI.esc(texto)}</textarea>
        </details>`,
      actions: `
        <button class="btn btn-ghost" data-copiar>Copiar o texto</button>
        <button class="btn btn-primary" data-baixar>Baixar o arquivo</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-baixar]').addEventListener('click', () => {
          Notify.baixarCalendario(user);
          UI.toast('Abra o arquivo baixado para o celular guardar o lembrete', 'ok');
        });
        sheet.querySelector('[data-copiar]').addEventListener('click', async () => {
          const campo = sheet.querySelector('[data-ics]');
          try {
            await navigator.clipboard.writeText(texto);
            UI.toast('Texto copiado', 'ok');
          } catch (e) {
            campo.closest('details').open = true;
            campo.focus();
            campo.select();
            UI.toast('Selecione o texto e copie na mão');
          }
        });
      },
    });
  }

  function perfilView(user) {
    const t = Store.totals(user.id, Store.monthOf(Store.today()));
    const bal = Store.balance(user.id);
    return `
      <section class="card mt8" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        ${UI.avatar(user, '', 'width:64px;height:64px;font-size:26px')}
        <div class="grow" style="min-width:150px">
          <div class="bold" style="font-size:17px">${UI.esc(user.name)}</div>
          <div class="small muted">@${UI.esc(user.username)}</div>
        </div>
        <button class="btn btn-soft btn-sm" data-photo-profile>
          ${Icons.svg('camera')} ${user.photo ? 'Trocar foto' : 'Colocar foto'}
        </button>
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

      ${lembreteCard(user)}

      <div class="section-title"><h3>Meu tempo no app</h3>
        <span class="small muted">${Store.duracao(Store.usageToday(user.id))} hoje</span></div>
      ${Dash.tempo(user, { compacto: true })}

      <div class="section-title"><h3>Conta</h3></div>
      <div class="list">
        <button class="mini-row" data-photo-profile>
          ${Icons.svg('camera')}<span class="grow bold small" style="text-align:left">Foto do perfil</span>${Icons.svg('chevron', 'ico-sm dim')}
        </button>
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
          const semFoto = Store.entryNeedsPhoto(e);
          return `
            <button class="task ${marked ? 'done' : ''} ${semFoto ? 'sem-foto' : ''}" data-item="${it.id}" ${locked ? 'data-locked="1"' : ''}>
              <span class="check ${marked ? 'on' : ''}">${Icons.svg('check')}</span>
              <div class="grow">
                <div class="nm">${UI.esc(it.name)}</div>
                <div class="mt">
                  ${it.daily ? `<span class="chip ${Store.photoRequired() ? 'sun' : 'neutral'}">
                    todo dia${Store.photoRequired() ? ' com foto' : ''}</span>` : ''}
                  ${e ? UI.statusChip(e.status) : ''}
                  ${semFoto ? '<span class="chip warn">falta a foto</span>' : ''}
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
          const pedeLeitura = res.added && res.entry && Store.entryIsReading(res.entry);
          const pedeFoto = !pedeLeitura && res.added && res.entry && Store.entryNeedsPhoto(res.entry);
          UI.toast(!res.added ? 'Desmarcado'
            : pedeLeitura ? 'Agora conte o que você leu'
              : pedeFoto ? 'Agora mande a foto desta tarefa' : 'Marcado. Aguardando validação.');
          if (res.added) {
            const item = cat.items.find((i) => i.id === btn.getAttribute('data-item'));
            const cena = item && item.kind === 'penalty' ? 'spend'
              : /livro|ler|lição|licao|estud/i.test(cat.name + ' ' + (item ? item.name : '')) ? 'book'
              : 'task';
            Effects.burst(cena, btn);
            if (item) {
              Effects.floatValue(
                `${item.kind === 'penalty' ? '-' : '+'}${Store.money(item.value)}`,
                btn, item.kind === 'penalty' ? 'spend' : 'good'
              );
            }
          }
          App.render();                                  // atualiza a tela ao fundo
          sheet.querySelector('.sheet-body').innerHTML = body();
          bindItems(sheet);

          // leitura recém-marcada: o resumo e as páginas grifadas vêm já
          if (pedeLeitura) {
            openLeitura(res.entry.id, { novaMarca: true, voltarPara: { user, catId: cat.id } });
          } else if (pedeFoto) {
            // tarefa de todo dia recém-marcada: a foto vem já
            openNote(res.entry.id, {
              novaMarca: true, exigeFoto: true,
              voltarPara: { user, catId: cat.id },
            });
          }
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

  /**
   * Registro de leitura.
   *
   * Ler não é só marcar: ela escreve o resumo do capítulo, grifa a lápis
   * as partes que mais gostou e manda a foto de cada página grifada. A
   * lista de pendências fica sempre à vista e o botão só libera quando
   * tudo está lá.
   */
  function openLeitura(entryId, opcoes = {}) {
    const st = Store.get();
    const e = st.entries.find((x) => x.id === entryId);
    if (!e) return;
    const novaMarca = !!opcoes.novaMarca;
    const antigo = e.reading || {};
    let picker = null;
    let salvo = false;

    const dados = () => {
      const f = document.querySelector('#leitura-form');
      if (!f) return antigo;
      return {
        livro: f.livro.value,
        paginaDe: f.paginaDe.value,
        paginaAte: f.paginaAte.value,
        resumo: f.resumo.value,
        partes: f.partes.value,
        grifou: f.querySelector('[data-switch="grifou"]').getAttribute('aria-pressed') === 'true',
      };
    };

    UI.openSheet({
      title: 'O que você leu',
      subtitle: e.name,
      size: 'larga',
      body: `
        <div class="note aviso">
          Para esta valer, faltam três coisas: <b>escrever o resumo</b> do capítulo,
          <b>grifar a lápis</b> as partes que você mais gostou e mandar a
          <b>foto de cada página</b> que você grifou.
        </div>
        <form id="leitura-form">
          ${UI.field('Livro e capítulo', UI.input('livro', {
            value: antigo.livro || '', placeholder: 'ex.: O Pequeno Príncipe, capítulo 4',
          }))}
          <div class="dois-campos">
            ${UI.field('Da página', UI.input('paginaDe', {
              type: 'number', value: antigo.paginaDe || '', attrs: 'min="1" step="1"', placeholder: '12',
            }))}
            ${UI.field('Até a página', UI.input('paginaAte', {
              type: 'number', value: antigo.paginaAte || '', attrs: 'min="1" step="1"', placeholder: '20',
            }))}
          </div>
          ${UI.field(`Resumo do capítulo (pelo menos ${Store.RESUMO_MINIMO} letras)`, `
            <textarea name="resumo" rows="7" placeholder="Conte com as suas palavras o que aconteceu no capítulo: quem apareceu, o que fizeram e como terminou.">${UI.esc(antigo.resumo || '')}</textarea>`)}
          <div class="mini-row">
            <div class="grow">
              <div class="small bold">Grifei a lápis o que mais gostei</div>
              <div class="tiny muted">passe o lápis nas partes que você mais gostou antes de fotografar</div>
            </div>
            <button type="button" class="switch" data-switch="grifou"
                    aria-pressed="${antigo.grifou ? 'true' : 'false'}" aria-label="Grifei a lápis"></button>
          </div>
          ${UI.field('As partes que você grifou (opcional)', `
            <textarea name="partes" rows="3" placeholder="ex.: a parte em que ele encontra a raposa">${UI.esc(antigo.partes || '')}</textarea>`)}
          ${UI.photoField('Foto de cada página grifada', e.photos || [], Store.FOTOS_LEITURA)}
        </form>
        <div class="leitura-faltas" data-faltas></div>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>${novaMarca ? 'Desmarcar' : 'Cancelar'}</button>
        <button class="btn btn-primary" data-save disabled>Salvar leitura</button>`,
      onMount(sheet) {
        const btnSalvar = sheet.querySelector('[data-save]');
        const caixa = sheet.querySelector('[data-faltas]');
        UI.bindSwitches(sheet);

        function conferir() {
          const check = Store.checarLeitura(dados(), picker ? picker.ids() : []);
          btnSalvar.disabled = !check.ok;
          caixa.innerHTML = check.ok
            ? '<div class="note ok-note">Está tudo aí. Pode salvar.</div>'
            : `<div class="note aviso">
                 <b>Ainda falta:</b>
                 <ul class="leitura-lista">${check.faltas.map((f) => `<li>${UI.esc(f)}</li>`).join('')}</ul>
               </div>`;
        }

        picker = UI.bindPhotos(sheet, conferir);
        sheet.querySelectorAll('#leitura-form input, #leitura-form textarea')
          .forEach((el) => el.addEventListener('input', conferir));
        sheet.querySelectorAll('#leitura-form [data-switch]')
          .forEach((el) => el.addEventListener('click', () => setTimeout(conferir, 0)));
        conferir();

        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        btnSalvar.addEventListener('click', () => {
          const res = Store.setEntryReading(entryId, dados(), picker.ids());
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          salvo = true;
          UI.closeSheet();
          UI.toast('Leitura registrada. Aguardando validação.', 'ok');
          Effects.burst('book');
          App.render();
          if (opcoes.voltarPara) openCategory(opcoes.voltarPara.user, opcoes.voltarPara.catId);
          return undefined;
        });
      },
      onClose() {
        if (picker) picker.discard();
        // desistiu no meio de uma leitura recém-marcada: desmarca
        if (!salvo && novaMarca) {
          Store.removeEntry(entryId);
          UI.toast('Leitura desmarcada: sem o resumo e as páginas ela não conta');
          App.render();
          if (opcoes.voltarPara) openCategory(opcoes.voltarPara.user, opcoes.voltarPara.catId);
        }
      },
    });
  }

  /**
   * Comentário e fotos de um lançamento.
   * Nas tarefas de todo dia a foto é obrigatória: sem foto o botão não
   * libera, e se ela desistir a tarefa volta a ficar desmarcada.
   */
  function openNote(entryId, opcoes = {}) {
    const state = Store.get();
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
    if (Store.entryIsReading(e) && e.status === 'pending') { openLeitura(entryId, opcoes); return; }
    const exige = Store.entryNeedsPhoto(e) || (opcoes.exigeFoto && Store.photoRequired());
    const novaMarca = !!opcoes.novaMarca;
    let picker = null;
    let salvo = false;

    UI.openSheet({
      title: exige ? 'Mande a foto da tarefa' : 'Comentário e fotos',
      subtitle: e.name,
      body: `
        ${exige ? `<div class="note aviso">
          Esta é uma tarefa de <b>todo dia</b>: ela só conta com uma foto mostrando o que foi feito.
        </div>` : ''}
        <form id="note-form">
          ${UI.photoField(exige ? 'Foto da tarefa (obrigatória)' : 'Fotos (opcional)', e.photos || [])}
          ${UI.field('Conte como foi (opcional)', `
            <textarea name="note" rows="3" placeholder="ex.: terminei toda a lição de matemática">${UI.esc(e.note)}</textarea>`)}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>${novaMarca ? 'Desmarcar' : 'Cancelar'}</button>
        <button class="btn btn-primary" data-save ${exige ? 'disabled' : ''}>Salvar</button>`,
      onMount(sheet) {
        const btnSalvar = sheet.querySelector('[data-save]');
        picker = UI.bindPhotos(sheet, (quantas) => {
          if (exige) btnSalvar.disabled = quantas < 1;
        });
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        btnSalvar.addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#note-form'));
          if (exige && !picker.ids().length) return UI.toast('Falta a foto desta tarefa', 'bad');
          Store.setEntryNote(entryId, data.note, picker.ids());
          picker.commit();
          salvo = true;
          UI.closeSheet();
          UI.toast(exige ? 'Foto enviada. Tarefa marcada!' : 'Comentário salvo', 'ok');
          App.render();
          if (picker.ids().length) Effects.burst('photo');
          // volta para a lista da categoria para ela seguir marcando
          if (opcoes.voltarPara) openCategory(opcoes.voltarPara.user, opcoes.voltarPara.catId);
        });
      },
      onClose() {
        if (picker) picker.discard();
        // desistiu de mandar a foto de uma tarefa recém-marcada: desmarca
        if (!salvo && novaMarca && exige) {
          Store.removeEntry(entryId);
          UI.toast('Tarefa desmarcada: sem foto ela não conta');
          App.render();
          if (opcoes.voltarPara) openCategory(opcoes.voltarPara.user, opcoes.voltarPara.catId);
        }
      },
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
        ${st.semFoto ? `<div class="note aviso">
            ${st.semFoto === 1
              ? 'Uma tarefa de todo dia ainda está <b>sem foto</b>.'
              : `${st.semFoto} tarefas de todo dia ainda estão <b>sem foto</b>.`}
            Toque na câmera para mandar a foto: sem ela a tarefa não conta.
          </div>`
          : st.required && !st.complete
            ? `<div class="note">Ainda faltam ${st.required - st.filled} tarefa(s) do dia. Elas contam para a sua mesada.</div>`
            : '<div class="note">Tudo que era obrigatório do dia está preenchido.</div>'}
        ${list.length ? `<div class="list">${list.map(entryRow).join('')}</div>` : UI.empty('pencil', 'Nada marcado neste dia.')}`,
      actions: `<button class="btn btn-primary btn-block" data-ok ${st.semFoto ? 'disabled' : ''}>
        ${st.semFoto ? (st.semFoto === 1 ? 'Falta 1 foto' : `Faltam ${st.semFoto} fotos`) : 'Enviar para validação'}</button>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-note]').forEach((b) => b.addEventListener('click', () => {
          UI.closeSheet();
          openNote(b.getAttribute('data-note'));
        }));
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          if (!list.length) {
            UI.closeSheet();
            return UI.toast('Marque alguma tarefa primeiro.');
          }
          const aviso = Notify.avisarResponsavel(user, date);
          UI.closeSheet();
          Effects.burst(st.complete ? 'goal' : 'task');
          // o link tem que abrir no próprio toque dela, senão o navegador
          // entende como janela indesejada e bloqueia
          if (aviso.ok) {
            window.open(aviso.link, '_blank', 'noopener');
            UI.toast('Enviado. O aviso já foi para quem confirma.', 'ok');
            return;
          }
          if (aviso.motivo === 'sem-numero') {
            // ela não pode resolver isso: avisa sem transformar em sermão
            UI.toast('Enviado! Peça para ligarem o aviso no app do responsável.', 'ok');
            return;
          }
          UI.toast('Enviado. O responsável já pode validar.', 'ok');
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
          <button class="mini-row" data-m="jogos">${Icons.svg('ball')}<span class="grow bold small" style="text-align:left">Joguinhos</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="pet">${Icons.svg('heart')}<span class="grow bold small" style="text-align:left">Meu bichinho</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="agenda">${Icons.svg('calendar')}<span class="grow bold small" style="text-align:left">Agenda</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="diario">${Icons.svg('book')}<span class="grow bold small" style="text-align:left">Diário de livros e lições</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="extrato">${Icons.svg('chart')}<span class="grow bold small" style="text-align:left">Extrato completo</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="theme">${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}<span class="grow bold small" style="text-align:left">Trocar tema</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="logout">${Icons.svg('logout')}<span class="grow bold small" style="text-align:left">Sair</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
          const m = b.getAttribute('data-m');
          UI.closeSheet();
          if (m === 'pet') return Pet.openSheet(user);
          if (m === 'logout') return App.logout();
          if (m === 'theme') { App.toggleTheme(); return App.render(); }
          tab = m;
          App.render();
        }));
      },
    });
  }

  /* ---------- painéis da coluna lateral ---------- */
  function metaPanel(user) {
    const bal = Store.balance(user.id);
    const goal = Number(user.goalAmount) || 0;
    if (!goal) return '';
    const pct = Math.max(0, Math.min(100, (bal / goal) * 100));
    return UI.panel('Minha meta', 'target', `
      <div class="between">
        <span class="bold small">${UI.esc(user.goalName || 'Meta')}</span>
        <span class="bold small">${Store.money(goal)}</span>
      </div>
      <div class="bar mt12" style="background:var(--surface-2)"><i style="width:${pct}%"></i></div>
      <p class="tiny muted mt8">Faltam ${Store.money(Math.max(0, goal - bal))} para chegar lá.</p>`);
  }

  /** o combinado do mês: quanto vale a mesada e o quanto já foi conquistado */
  function mesadaPanel(user) {
    const m = Store.mesadaStatus(user.id);
    if (!m.mesada) return '';
    const pl = Store.planoMesada(user.id);
    const leitura = pl.categorias.filter((c) => c.leitura).reduce((sum, c) => sum + c.noMes, 0);
    return UI.panel('Minha mesada', 'banknote', `
      <div class="between">
        <span class="bold small">Combinado do mês</span>
        <span class="bold small">${Store.money(m.mesada)}</span>
      </div>
      <div class="bar mt12" style="background:var(--surface-2)"><i style="width:${m.pct}%"></i></div>
      <p class="tiny muted mt8">
        ${m.liquido > 0 ? `Você já garantiu ${Store.money(m.liquido)}.` : 'Ainda não tem nada validado neste mês.'}
        ${m.falta > 0 ? ` Faltam ${Store.money(m.falta)} para fechar.` : ' Mesada fechada!'}
      </p>
      ${m.esperando > 0 ? `<p class="tiny muted mt8">${Store.money(m.esperando)} esperando a validação.</p>` : ''}
      ${leitura > 0 ? `<p class="tiny muted mt8">A leitura sozinha vale ${Store.money(leitura)} no mês: é a parte que mais rende.</p>` : ''}`);
  }

  function resumoPanel(user) {
    const t = Store.totals(user.id, Store.monthOf(Store.today()));
    const st = Store.dayStatus(user.id, date);
    return UI.panel('Resumo do mês', 'chart', `
      <div class="panel-list">
        <div class="up-row"><span class="grow small">Validado</span><span class="bold small">${Store.money(t.approved)}</span></div>
        <div class="up-row"><span class="grow small">Aguardando</span><span class="bold small">${Store.money(t.pending)}</span></div>
        <div class="up-row"><span class="grow small">Descontos</span><span class="bold small">${Store.money(-t.penalties)}</span></div>
        <div class="up-row"><span class="grow small">Tarefas de hoje</span><span class="bold small">${st.filled}/${st.required}</span></div>
      </div>`);
  }

  /* ---------- render ---------- */
  /* ---------- aba escola: lição de casa e notas ---------- */
  /** que jeito a lição está: para hoje, atrasada, entregue */
  function licaoChip(l) {
    const st = Store.situacaoLicao(l);
    if (st === 'no-prazo') return '<span class="chip lime">entregue no prazo</span>';
    if (st === 'atrasada') return '<span class="chip">entregue atrasada</span>';
    if (st === 'vencida') return '<span class="chip alerta">passou do prazo</span>';
    if (l.entrega === Store.today()) return '<span class="chip alerta">é para hoje</span>';
    return `<span class="chip">${UI.esc(Store.labelDate(l.entrega))}</span>`;
  }

  function licaoRow(l) {
    const feita = !!l.feitaEm;
    return `
      <div class="card licao-row ${feita ? 'feita' : ''}">
        <div class="between">
          <div class="grow">
            <div class="small bold">${UI.esc(l.materia)}</div>
            <div class="tiny muted">${UI.esc(l.oque)}</div>
          </div>
          ${licaoChip(l)}
        </div>
        ${feita ? '' : `
          <div class="row mt12" style="gap:8px">
            <button class="btn btn-ghost btn-sm" data-licao-editar="${l.id}">${Icons.svg('pencil')} Mudar</button>
            <button class="btn btn-ghost btn-sm" data-licao-apagar="${l.id}">${Icons.svg('trash')} Apagar</button>
            <button class="btn btn-primary btn-sm grow" data-licao-fiz="${l.id}">${Icons.svg('check')} Já fiz</button>
          </div>`}
      </div>`;
  }

  function notaRow(e) {
    const n = e.nota;
    const sinal = e.kind === 'penalty' ? -e.value : e.value;
    return `
      <div class="card nota-row faixa-${UI.esc(n.faixa || '')}">
        <div class="between">
          <div class="grow">
            <div class="small bold">${UI.esc(n.materia)}${n.avaliacao ? ` • ${UI.esc(n.avaliacao)}` : ''}</div>
            <div class="tiny muted">${UI.esc(Store.labelDate(e.date))} • ${UI.esc(Store.FAIXA_LABEL[n.faixa] || '')}</div>
          </div>
          <div class="nota-valor">
            <div class="nota-numero">${String(n.nota).replace('.', ',')}</div>
            <div class="tiny ${sinal < 0 ? 'ruim' : 'bom'}">${sinal ? Store.money(sinal) : '—'}</div>
          </div>
        </div>
        ${UI.statusChip(e.status)}
      </div>`;
  }

  function escolaView(user) {
    const st = Store.licaoStatus(user.id);
    const lista = Store.licoesOf(user.id, true);
    const abertas = lista.filter((l) => !l.feitaEm);
    const feitas = lista.filter((l) => l.feitaEm).slice(0, 6);
    const r = Store.regraNotas();
    const notas = Store.notasOf(user.id).slice(0, 8);
    const media = Store.mediaNotas(user.id, Store.monthOf(Store.today()));
    const rl = Store.regraLicao();

    return `
      <section class="hero">
        <div class="hero-top">
          <div class="hero-ico">${Icons.svg('backpack')}</div>
          <div class="grow">
            <div class="label">Lição de casa</div>
            <div class="value">${st.abertas}<small style="margin-left:6px">${st.abertas === 1 ? 'aberta' : 'abertas'}</small></div>
          </div>
        </div>
        <div class="hero-stats mt16">
          <div class="hero-stat"><div class="k">é para hoje</div><div class="v">${st.hoje}</div></div>
          <div class="hero-stat"><div class="k">passou do prazo</div><div class="v">${st.vencidas}</div></div>
          <div class="hero-stat"><div class="k">média do mês</div><div class="v">${media === null ? '—' : String(media).replace('.', ',')}</div></div>
        </div>
      </section>

      <div class="seg-mini mt16" role="group" aria-label="O que ver">
        <button data-escola-tab="licao" aria-pressed="${escolaTab === 'licao'}">Lição de casa</button>
        <button data-escola-tab="notas" aria-pressed="${escolaTab === 'notas'}">Notas</button>
      </div>

      ${escolaTab === 'licao' ? `
        ${rl.ativo ? `<div class="note mt12">
          Entregar no prazo vale <b>${Store.money(rl.valor)}</b>.
          Entregar atrasada vale ${Store.money(rl.atraso)}.
        </div>` : ''}
        ${abertas.length ? `<div class="list mt12">${abertas.map(licaoRow).join('')}</div>`
          : UI.empty('backpack', 'Nenhuma lição anotada. Toque no + quando a professora passar uma.')}
        ${feitas.length ? `
          <h4 class="mt16">Já entregues</h4>
          <div class="list mt8">${feitas.map(licaoRow).join('')}</div>` : ''}`
      : `
        ${r.ativo ? `<div class="note mt12">
          O combinado: <b>${String(r.otima.de).replace('.', ',')} ou mais</b> vale ${Store.money(r.otima.valor)},
          de <b>${String(r.boa.de).replace('.', ',')}</b> vale ${Store.money(r.boa.valor)},
          de <b>${String(r.ok.de).replace('.', ',')}</b> vale ${Store.money(r.ok.valor)},
          e abaixo disso desconta ${Store.money(Math.abs(r.ruim.valor))}.
        </div>` : ''}
        <button class="btn btn-primary btn-block mt12" data-nova-nota>${Icons.svg('star')} Registrar uma nota</button>
        ${notas.length ? `<div class="list mt12">${notas.map(notaRow).join('')}</div>`
          : UI.empty('star', 'Nenhuma nota registrada ainda.')}`}`;
  }

  /** anotar uma lição que a professora passou */
  function openLicaoForm(user, id) {
    const l = id ? Store.licoesOf(user.id, true).find((x) => x.id === id) : null;
    UI.openSheet({
      title: l ? 'Mudar a lição' : 'Anotar uma lição',
      subtitle: l ? UI.esc(l.materia) : 'o que a professora passou',
      body: `
        <form id="licao-form">
          ${UI.field('Matéria', UI.input('materia', { value: l ? l.materia : '', placeholder: 'Matemática' }))}
          ${UI.field('O que foi passado', `
            <textarea name="oque" rows="3" placeholder="Página 42, exercícios 1 a 8">${l ? UI.esc(l.oque) : ''}</textarea>`)}
          ${UI.field('Entregar em', UI.input('entrega', {
            type: 'date', value: l ? l.entrega : Store.addDays(Store.today(), 1),
          }))}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>${l ? 'Salvar' : 'Anotar'}</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const dados = UI.formData(sheet.querySelector('#licao-form'));
          const res = Store.saveLicao(Object.assign({ childId: user.id, id: l ? l.id : '' }, dados));
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast(l ? 'Lição atualizada' : 'Lição anotada', 'ok');
          App.render();
        });
      },
    });
  }

  /** ela fez a lição: pede a foto do caderno e manda para validação */
  function openLicaoFeita(user, id) {
    const l = Store.licoesOf(user.id, true).find((x) => x.id === id);
    if (!l) return;
    const r = Store.regraLicao();
    const atrasada = Store.today() > l.entrega;
    let picker = null;
    UI.openSheet({
      title: 'Já fiz esta lição',
      subtitle: `${l.materia} • ${l.oque}`,
      body: `
        <form id="licao-feita-form">
          ${UI.photoField('Foto do caderno (ajuda muito na validação)', [], 4)}
        </form>
        <div class="note ${atrasada ? 'aviso' : ''}">
          ${atrasada
            ? `Esta lição era para ${UI.esc(Store.labelDate(l.entrega))}. Entregue atrasada, vale ${Store.money(r.atraso)}.`
            : `Entregue no prazo: vale ${Store.money(r.valor)}.`}
        </div>
        <p class="tiny muted mt8">Vai para o responsável validar, como as outras tarefas.</p>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Ainda não</button>
        <button class="btn btn-primary" data-save>Marcar como feita</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const res = Store.entregarLicao(l.id, picker.ids());
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          Effects.burst(res.atrasada ? 'task' : 'goal');
          UI.toast(res.atrasada ? 'Marcada. Da próxima, capricha no prazo!' : 'Boa! No prazo.', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /** registrar a nota de uma prova */
  function openNotaForm(user) {
    const r = Store.regraNotas();
    let picker = null;
    UI.openSheet({
      title: 'Registrar uma nota',
      subtitle: 'a nota de uma prova ou trabalho',
      body: `
        <form id="nota-form">
          ${UI.field('Matéria', UI.input('materia', { placeholder: 'Matemática' }))}
          <div class="dois-campos">
            ${UI.field(`Nota (0 a ${String(r.maxima).replace('.', ',')})`, UI.input('nota', {
              type: 'number', attrs: `min="0" max="${r.maxima}" step="0.1" inputmode="decimal"`,
            }))}
            ${UI.field('Data', UI.input('data', { type: 'date', value: Store.today() }))}
          </div>
          ${UI.field('Qual avaliação (opcional)', UI.input('avaliacao', { placeholder: '2º bimestre, prova de frações' }))}
          ${UI.photoField('Foto da prova ou do boletim', [], 4)}
        </form>
        <div class="note" data-previa>Escreva a nota para eu mostrar quanto vale.</div>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>Registrar</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        const previa = sheet.querySelector('[data-previa]');
        const campo = sheet.querySelector('input[name=nota]');
        const atualizar = () => {
          const v = campo.value;
          if (v === '') {
            previa.className = 'note';
            previa.textContent = 'Escreva a nota para eu mostrar quanto vale.';
            return;
          }
          const conta = Store.valorDaNota(v);
          previa.className = `note ${conta.valor < 0 ? 'aviso' : ''}`;
          previa.innerHTML = conta.valor === 0
            ? `<b>${UI.esc(Store.FAIXA_LABEL[conta.faixa] || '')}</b>: não ganha nem perde nada.`
            : conta.valor > 0
              ? `<b>${UI.esc(Store.FAIXA_LABEL[conta.faixa] || '')}</b>: ganha ${Store.money(conta.valor)} a mais.`
              : `<b>${UI.esc(Store.FAIXA_LABEL[conta.faixa] || '')}</b>: desconta ${Store.money(Math.abs(conta.valor))}.`;
        };
        campo.addEventListener('input', atualizar);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const dados = UI.formData(sheet.querySelector('#nota-form'));
          const res = Store.registrarNota(user.id, dados, picker.ids());
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          Effects.burst(res.valor < 0 ? 'task' : 'goal');
          UI.toast(res.valor > 0 ? `Nota registrada: ${Store.money(res.valor)} a mais!`
            : res.valor < 0 ? 'Nota registrada. Na próxima a gente melhora.'
              : 'Nota registrada.', res.valor < 0 ? '' : 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  const PAGES = {
    home: { title: 'Hoje', subtitle: 'Marque o que você fez e envie para validação' },
    escola: { title: 'Escola', subtitle: 'Lição de casa e as notas das provas' },
    diario: { title: 'Diário', subtitle: 'Livros, lições e atividades do dia' },
    agenda: { title: 'Agenda', subtitle: 'Provas, trabalhos e eventos' },
    jogos: { title: 'Jogos e estudo', subtitle: 'Brinque com o bichinho e treine as matérias da escola' },
    extrato: { title: 'Carteira', subtitle: 'O que entrou, o que você gastou e o que sobrou' },
    extratoPainel: { title: 'Meu dinheiro', subtitle: 'Quanto você ganhou, recebeu e gastou' },
    perfil: { title: 'Perfil', subtitle: 'Sua conta e sua meta' },
  };

  /** cada aba é uma área de uso diferente no relógio */
  const AREA_DA_ABA = {
    home: 'tarefas', diario: 'diario', jogos: 'jogos', escola: 'tarefas',
    agenda: 'agenda', extrato: 'carteira', perfil: 'carteira',
  };

  function render(root, user) {
    Uso.aba(tab === 'jogos' && Games.abaAtual() === 'quiz' ? 'estudo' : (AREA_DA_ABA[tab] || 'tarefas'));
    const page = (tab === 'extrato' && moneyTab === 'painel' ? PAGES.extratoPainel : PAGES[tab]) || PAGES.home;
    const pending = Store.pendingEntries(user.id).length;
    const proximos = Store.upcomingEvents(user.id).filter((e) => !e.done).length;
    const licaoAberta = Store.licaoStatus(user.id).abertas;

    const main = tab === 'home' ? homeView(user)
      : tab === 'escola' ? escolaView(user)
      : tab === 'diario' ? diarioView(user)
      : tab === 'agenda' ? Agenda.view(user, user.id, false)
      : tab === 'jogos' ? Games.view(user)
      : tab === 'extrato' ? extratoView(user)
      : perfilView(user);

    const semColuna = tab === 'agenda' || tab === 'jogos'
      || (tab === 'extrato' && moneyTab === 'painel');
    const aside = semColuna ? ''
      : `${tab === 'home' ? mesadaPanel(user) : ''}${metaPanel(user)}${Agenda.upcoming(user.id, false)}` +
        `${tab === 'home' ? resumoPanel(user) : ''}${Pet.panel(user)}`;

    const actions = tab === 'escola'
      ? `<button class="btn btn-primary btn-sm" data-nova-licao>${Icons.svg('plus')} Lição</button>`
      : tab === 'agenda'
      ? `<button class="btn btn-primary btn-sm" data-new-event>${Icons.svg('plus')} Compromisso</button>`
      : tab === 'diario'
        ? `<button class="btn btn-primary btn-sm" data-diary-new>${Icons.svg('plus')} Registro</button>`
        : tab === 'extrato'
          ? `<button class="btn btn-primary btn-sm" data-new-purchase>${Icons.svg('coins')} Gasto</button>`
          : '';

    root.innerHTML = UI.shell({
      user,
      roleLabel: 'Filho(a)',
      tab,
      title: page.title,
      subtitle: page.subtitle,
      actions,
      main,
      aside,
      fab: tab === 'escola' ? { icon: 'plus', label: 'Anotar lição' }
        : tab === 'diario' ? { icon: 'plus', label: 'Novo registro' }
        : tab === 'agenda' ? { icon: 'plus', label: 'Novo compromisso' }
        : tab === 'jogos' ? { icon: 'ball', label: 'Jogar agora' }
        : tab === 'extrato' ? { icon: 'coins', label: 'Registrar gasto' }
        : { icon: 'check', label: 'Resumo do dia' },
      nav: [
        { id: 'home', label: 'Hoje', icon: 'home' },
        { id: 'escola', label: 'Escola', icon: 'backpack', count: licaoAberta },
        { id: 'diario', label: 'Diário', icon: 'book' },
        { id: 'jogos', label: 'Jogos', icon: 'ball' },
        { id: 'agenda', label: 'Agenda', icon: 'calendar', count: proximos },
        { id: 'extrato', label: 'Carteira', icon: 'wallet', count: pending },
      ],
    });

    const rerender = () => render(root, user);

    UI.bindShell(root, {
      onTab(id) { tab = id; rerender(); },
      onMenu() { openMenu(user); },
      onFab() {
        if (tab === 'escola') return openLicaoForm(user, null);
        if (tab === 'diario') return openDiaryForm(user, null);
        if (tab === 'agenda') return Agenda.openForm(user, null, { date: Agenda.selectedDate(), childId: user.id });
        if (tab === 'jogos') {
          const sorteio = Games.LISTA[Math.floor(Math.random() * Games.LISTA.length)];
          return Games.abrir(user, sorteio.id);
        }
        if (tab === 'extrato') return openPurchaseForm(user, null);
        return openDaySummary(user);
      },
    });
    Agenda.bind(root, user, rerender);
    Pet.bind(root, user, rerender);
    Games.bind(root, user, rerender);

    root.querySelectorAll('[data-money-tab]').forEach((b) => b.addEventListener('click', () => {
      moneyTab = b.getAttribute('data-money-tab');
      rerender();
    }));

    root.querySelectorAll('[data-escola-tab]').forEach((b) => b.addEventListener('click', () => {
      escolaTab = b.getAttribute('data-escola-tab');
      rerender();
    }));
    root.querySelectorAll('[data-nova-licao]').forEach((b) =>
      b.addEventListener('click', () => openLicaoForm(user, null)));
    root.querySelectorAll('[data-licao-editar]').forEach((b) =>
      b.addEventListener('click', () => openLicaoForm(user, b.getAttribute('data-licao-editar'))));
    root.querySelectorAll('[data-licao-fiz]').forEach((b) =>
      b.addEventListener('click', () => openLicaoFeita(user, b.getAttribute('data-licao-fiz'))));
    root.querySelectorAll('[data-licao-apagar]').forEach((b) => b.addEventListener('click', async () => {
      const ok = await UI.confirm({
        title: 'Apagar esta lição?',
        text: 'Ela some da sua lista. Se a professora passou mesmo, é melhor deixar.',
        okLabel: 'Apagar', danger: true,
      });
      if (!ok) return;
      const res = Store.removeLicao(b.getAttribute('data-licao-apagar'));
      if (!res.ok) return UI.toast(res.error, 'bad');
      UI.toast('Lição apagada');
      rerender();
    }));
    root.querySelectorAll('[data-nova-nota]').forEach((b) =>
      b.addEventListener('click', () => openNotaForm(user)));

    root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      tab = b.getAttribute('data-go');
      rerender();
    }));
    root.querySelectorAll('[data-goto-agenda]').forEach((b) => b.addEventListener('click', () => {
      tab = 'agenda';
      rerender();
    }));

    // centraliza o dia escolhido na tira, sem mexer na rolagem da página
    const strip = root.querySelector('.days');
    const selectedDay = root.querySelector(`.days [data-day="${date}"]`);
    if (strip && selectedDay) {
      strip.scrollLeft = Math.max(0,
        selectedDay.offsetLeft - (strip.clientWidth - selectedDay.offsetWidth) / 2);
    }
    root.querySelectorAll('.days [data-day]').forEach((b) => b.addEventListener('click', () => {
      date = b.getAttribute('data-day');
      rerender();
    }));

    root.querySelectorAll('[data-cat]').forEach((b) =>
      b.addEventListener('click', () => openCategory(user, b.getAttribute('data-cat'))));
    root.querySelectorAll('[data-note]').forEach((b) =>
      b.addEventListener('click', () => openNote(b.getAttribute('data-note'))));
    root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      filter = b.getAttribute('data-filter');
      rerender();
    }));

    root.querySelectorAll('[data-diary-new]').forEach((b) =>
      b.addEventListener('click', () => openDiaryForm(user, null)));
    root.querySelectorAll('[data-diary-filter]').forEach((b) => b.addEventListener('click', () => {
      diaryFilter = b.getAttribute('data-diary-filter');
      rerender();
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

    root.querySelectorAll('[data-new-purchase]').forEach((b) =>
      b.addEventListener('click', () => openPurchaseForm(user, null)));
    root.querySelectorAll('[data-purchase-edit]').forEach((b) => b.addEventListener('click', () =>
      openPurchaseForm(user, Store.purchaseById(b.getAttribute('data-purchase-edit')))));

    const passBtn = root.querySelector('[data-change-pass]');
    if (passBtn) passBtn.addEventListener('click', () => App.openChangePassword(user));
    root.querySelectorAll('[data-photo-profile]').forEach((b) =>
      b.addEventListener('click', () => App.openProfilePhoto(user)));
    ligarLembrete(root, user);
  }

  return {
    render,
    reset() {
      tab = 'home';
      date = Store.today();
      filter = 'all';
      diaryFilter = 'all';
      Agenda.reset();
    },
  };
})();

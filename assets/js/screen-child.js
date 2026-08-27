/* =========================================================
   screen-child.js: área do filho(a)
   ========================================================= */
const ChildScreen = (() => {
  let tab = 'home';
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
          const pedeFoto = res.added && res.entry && Store.entryNeedsPhoto(res.entry);
          UI.toast(!res.added ? 'Desmarcado'
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

          // tarefa de todo dia recém-marcada: a foto vem já
          if (pedeFoto) {
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
   * Comentário e fotos de um lançamento.
   * Nas tarefas de todo dia a foto é obrigatória: sem foto o botão não
   * libera, e se ela desistir a tarefa volta a ficar desmarcada.
   */
  function openNote(entryId, opcoes = {}) {
    const state = Store.get();
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
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
          UI.closeSheet();
          UI.toast(list.length ? 'Enviado. O responsável já pode validar.' : 'Marque alguma tarefa primeiro.',
            list.length ? 'ok' : '');
          if (list.length) Effects.burst(st.complete ? 'goal' : 'task');
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
  const PAGES = {
    home: { title: 'Hoje', subtitle: 'Marque o que você fez e envie para validação' },
    diario: { title: 'Diário', subtitle: 'Livros, lições e atividades do dia' },
    agenda: { title: 'Agenda', subtitle: 'Provas, trabalhos e eventos' },
    jogos: { title: 'Jogos e estudo', subtitle: 'Brinque com o bichinho e treine as matérias da escola' },
    extrato: { title: 'Carteira', subtitle: 'O que entrou, o que você gastou e o que sobrou' },
    extratoPainel: { title: 'Meu dinheiro', subtitle: 'Quanto você ganhou, recebeu e gastou' },
    perfil: { title: 'Perfil', subtitle: 'Sua conta e sua meta' },
  };

  /** cada aba é uma área de uso diferente no relógio */
  const AREA_DA_ABA = {
    home: 'tarefas', diario: 'diario', jogos: 'jogos',
    agenda: 'agenda', extrato: 'carteira', perfil: 'carteira',
  };

  function render(root, user) {
    Uso.aba(tab === 'jogos' && Games.abaAtual() === 'quiz' ? 'estudo' : (AREA_DA_ABA[tab] || 'tarefas'));
    const page = (tab === 'extrato' && moneyTab === 'painel' ? PAGES.extratoPainel : PAGES[tab]) || PAGES.home;
    const pending = Store.pendingEntries(user.id).length;
    const proximos = Store.upcomingEvents(user.id).filter((e) => !e.done).length;

    const main = tab === 'home' ? homeView(user)
      : tab === 'diario' ? diarioView(user)
      : tab === 'agenda' ? Agenda.view(user, user.id, false)
      : tab === 'jogos' ? Games.view(user)
      : tab === 'extrato' ? extratoView(user)
      : perfilView(user);

    const semColuna = tab === 'agenda' || tab === 'jogos'
      || (tab === 'extrato' && moneyTab === 'painel');
    const aside = semColuna ? ''
      : `${metaPanel(user)}${Agenda.upcoming(user.id, false)}` +
        `${tab === 'home' ? resumoPanel(user) : ''}${Pet.panel(user)}`;

    const actions = tab === 'agenda'
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
      fab: tab === 'diario' ? { icon: 'plus', label: 'Novo registro' }
        : tab === 'agenda' ? { icon: 'plus', label: 'Novo compromisso' }
        : tab === 'jogos' ? { icon: 'ball', label: 'Jogar agora' }
        : tab === 'extrato' ? { icon: 'coins', label: 'Registrar gasto' }
        : { icon: 'check', label: 'Resumo do dia' },
      nav: [
        { id: 'home', label: 'Hoje', icon: 'home' },
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

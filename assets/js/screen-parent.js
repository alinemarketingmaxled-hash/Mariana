/* =========================================================
   screen-parent.js: área do responsável
   ========================================================= */
const ParentScreen = (() => {
  let tab = 'validar';
  let childFilter = 'all';

  /* ---------- topo ---------- */
  function topbar(user) {
    const pend = Store.pendingEntries().length + Store.pendingDiary().length;
    return `
      <header class="topbar">
        <div class="who">
          <div class="avatar ${user.color || 'g4'}">${UI.esc(user.name.trim().charAt(0).toUpperCase())}</div>
          <div>
            <div class="t1">${UI.esc(user.name)}</div>
            <div class="t2">Painel do responsável</div>
          </div>
        </div>
        <div class="row" style="gap:9px">
          <button class="icon-btn badge" data-count="${pend}" data-go="validar" aria-label="Pendências">${Icons.svg('bell')}</button>
          <button class="icon-btn" data-menu aria-label="Menu">${Icons.svg('menu')}</button>
        </div>
      </header>`;
  }

  /* ---------- aba: validar ---------- */
  function validarView() {
    const kids = Store.children();
    const pending = Store.pendingEntries().filter((e) => childFilter === 'all' || e.childId === childFilter);
    const totalPend = pending.reduce((s, e) => s + Store.signed(e), 0);

    const groups = {};
    pending.forEach((e) => {
      const k = e.childId + '|' + e.date;
      (groups[k] = groups[k] || []).push(e);
    });
    const keys = Object.keys(groups).sort((a, b) => b.split('|')[1].localeCompare(a.split('|')[1]));

    return `
      <section class="hero">
        <div class="hero-top">
          <div class="hero-ico">${Icons.svg('clipboard')}</div>
          <div class="grow">
            <div class="label">Aguardando sua validação</div>
            <div class="value">${pending.length}<small style="margin-left:6px">${pending.length === 1 ? 'item' : 'itens'}</small></div>
          </div>
        </div>
        <div class="hero-stats mt16">
          <div class="hero-stat"><div class="k">em análise</div><div class="v">${Store.money(totalPend)}</div></div>
          <div class="hero-stat"><div class="k">filhos ativos</div><div class="v">${kids.length}</div></div>
        </div>
      </section>

      ${kids.length > 1 ? `
        <div class="seg-mini mt16" role="group" aria-label="Filtrar por filho">
          <button data-kid-filter="all" aria-pressed="${childFilter === 'all'}">Todos</button>
          ${kids.map((k) => `<button data-kid-filter="${k.id}" aria-pressed="${childFilter === k.id}">${UI.esc(k.name.split(' ')[0])}</button>`).join('')}
        </div>` : ''}

      ${keys.length ? keys.map((k) => {
        const [childId, d] = k.split('|');
        const kid = Store.userById(childId);
        const list = groups[k];
        const sum = list.reduce((s, e) => s + Store.signed(e), 0);
        return `
          <div class="date-head">
            <h4>${kid ? UI.esc(kid.name.split(' ')[0]) : 'Filho(a)'} • ${Store.labelDate(d)}</h4>
            <span class="ln"></span>
            <span class="tiny muted">${Store.money(sum)}</span>
          </div>
          <div class="list">
            ${list.map(approvalCard).join('')}
            <button class="btn btn-soft btn-sm" data-approve-all="${k}">${Icons.svg('check')}
              ${list.length === 1 ? 'Validar este item' : `Validar os ${list.length} itens deste dia`}</button>
          </div>`;
      }).join('') : UI.empty('check', 'Nada pendente por aqui. Tudo validado.')}

      ${diarySection()}`;
  }

  /** registros de livros e lições esperando leitura do responsável */
  function diarySection() {
    const list = Store.pendingDiary().filter((d) => childFilter === 'all' || d.childId === childFilter);
    if (!list.length) return '';
    return `
      <div class="section-title">
        <h3>Diário de livros e lições</h3>
        <span class="small muted">${list.length}</span>
      </div>
      <div class="list">${list.map(diaryApprovalCard).join('')}</div>`;
  }

  function diaryApprovalCard(d) {
    const kid = Store.userById(d.childId);
    const kind = Store.diaryKind(d.kind);
    return `
      <article class="appr">
        <div class="row">
          <span class="em g1" style="width:42px;height:42px;border-radius:15px;display:grid;place-items:center">
            ${Icons.svg(kind.icon)}
          </span>
          <div class="grow">
            <div class="nm bold" style="font-size:14px">${UI.esc(d.title)}</div>
            <div class="mt small muted">
              ${UI.esc(kind.label)} • ${kid ? UI.esc(kid.name.split(' ')[0]) : ''} •
              ${Store.labelDate(d.date)} às ${UI.esc(d.time)}${d.minutes ? ` • ${d.minutes} min` : ''}
            </div>
          </div>
        </div>
        ${d.detail ? `<div class="small muted">${UI.esc(d.detail)}</div>` : ''}
        <p class="diary-text">${UI.esc(d.text)}</p>
        ${UI.photoStrip(d.photos)}
        <div class="acts">
          <button class="btn btn-ghost btn-sm" data-diary-reject="${d.id}">${Icons.svg('close')} Pedir revisão</button>
          <button class="btn btn-primary btn-sm" data-diary-approve="${d.id}">${Icons.svg('check')} Validar</button>
        </div>
      </article>`;
  }

  function approvalCard(e) {
    const kid = Store.userById(e.childId);
    return `
      <article class="appr">
        <div class="row">
          <span class="em ${e.grad || 'g1'}" style="width:42px;height:42px;border-radius:15px;display:grid;place-items:center">${Icons.svg(e.icon)}</span>
          <div class="grow">
            <div class="nm bold" style="font-size:14px">${UI.esc(e.name)}</div>
            <div class="mt small muted">${UI.esc(e.catName || '')} • ${kid ? UI.esc(kid.name.split(' ')[0]) : ''}</div>
          </div>
          <span class="val ${e.kind === 'penalty' ? 'pen' : 'earn'}">
            ${e.kind === 'penalty' ? '-' : '+'}${Store.money(e.value).replace('R$ ', '')}
          </span>
        </div>
        ${e.note ? `<div class="note">${UI.esc(e.note)}</div>` : ''}
        ${UI.photoStrip(e.photos)}
        <div class="acts">
          <button class="btn btn-ghost btn-sm" data-reject="${e.id}">${Icons.svg('close')} Recusar</button>
          <button class="btn btn-primary btn-sm" data-approve="${e.id}">${Icons.svg('check')} Validar</button>
        </div>
      </article>`;
  }

  /* ---------- aba: filhos ---------- */
  function filhosView() {
    const kids = Store.children();
    return `
      <div class="section-title">
        <h3>Filhos cadastrados</h3>
        <button class="link" data-new-child>+ adicionar</button>
      </div>
      ${kids.length ? `<div class="list">
        ${kids.map((k) => {
          const bal = Store.balance(k.id);
          const t = Store.totals(k.id, Store.monthOf(Store.today()));
          return `
            <button class="kid-card" data-kid="${k.id}">
              <span class="avatar ${k.color || 'g1'}">${UI.esc(k.name.trim().charAt(0).toUpperCase())}</span>
              <div class="grow">
                <div class="bold" style="font-size:15px">${UI.esc(k.name)}</div>
                <div class="small muted">@${UI.esc(k.username)} • ${t.pendingCount} aguardando • ${Store.diaryOf(k.id).length} no diário</div>
                ${Number(k.goalAmount) > 0 ? `
                  <div class="bar mt8" style="background:var(--surface-2);height:6px">
                    <i style="width:${Math.max(0, Math.min(100, (bal / k.goalAmount) * 100))}%"></i>
                  </div>` : ''}
              </div>
              <div class="col" style="align-items:flex-end">
                <span class="tiny muted">saldo</span>
                <span class="bold" style="font-size:16px">${Store.money(bal)}</span>
              </div>
            </button>`;
        }).join('')}
      </div>` : UI.empty('users', 'Nenhum filho cadastrado. Toque em “+ adicionar”.')}`;
  }

  /* ---------- aba: categorias ---------- */
  function categoriasView() {
    const cats = Store.categories();
    return `
      <div class="section-title">
        <h3>Ações da mesada</h3>
        <button class="link" data-new-cat>+ categoria</button>
      </div>
      <p class="small muted" style="line-height:1.6;padding:0 2px">
        Cada categoria tem subcategorias (as ações do dia a dia). O valor é somado quando você valida.
        Os itens marcados como <b>desconto</b> são subtraídos da mesada.
      </p>
      ${cats.length ? cats.map((c) => `
        <section class="card mt16">
          <div class="between">
            <div class="row">
              <span class="em ${c.grad}" style="width:44px;height:44px;border-radius:16px;display:grid;place-items:center">${Icons.svg(c.icon)}</span>
              <div>
                <div class="bold" style="font-size:15px">${UI.esc(c.name)}</div>
                <div class="tiny muted">${c.items.length} ${c.items.length === 1 ? 'ação' : 'ações'}</div>
              </div>
            </div>
            <div class="row" style="gap:7px">
              <button class="icon-btn sm" data-edit-cat="${c.id}" aria-label="Editar categoria">${Icons.svg('pencil')}</button>
              <button class="icon-btn sm" data-del-cat="${c.id}" aria-label="Excluir categoria">${Icons.svg('trash')}</button>
            </div>
          </div>
          <div class="list mt12">
            ${c.items.map((it) => `
              <div class="mini-row">
                <span class="chip ${it.kind === 'penalty' ? 'rejected' : 'approved'}">${it.kind === 'penalty' ? '-' : '+'} ${Store.money(it.value)}</span>
                <div class="grow">
                  <div class="small bold">${UI.esc(it.name)}</div>
                  ${it.daily ? '<div class="tiny muted">obrigatória todo dia</div>' : ''}
                </div>
                <button class="icon-btn sm" data-edit-item="${c.id}:${it.id}" aria-label="Editar ação">${Icons.svg('pencil')}</button>
              </div>`).join('')}
            <button class="btn btn-soft btn-sm" data-new-item="${c.id}">+ nova ação em ${UI.esc(c.name)}</button>
          </div>
        </section>`).join('')
      : UI.empty('folder', 'Crie a primeira categoria para começar.')}`;
  }

  /* ---------- aba: relatório ---------- */
  function relatorioView() {
    const kids = Store.children();
    const ym = Store.monthOf(Store.today());
    if (!kids.length) return UI.empty('trending', 'Cadastre um filho para ver os relatórios.');

    return kids.map((k) => {
      const t = Store.totals(k.id, ym);
      const bal = Store.balance(k.id);
      const days = [];
      for (let i = 6; i >= 0; i--) days.push(Store.addDays(Store.today(), -i));
      const vals = days.map((d) => {
        const st = Store.dayStatus(k.id, d);
        return Math.max(0, st.value);
      });
      const max = Math.max(1, ...vals);
      return `
        <div class="section-title"><h3>${UI.esc(k.name)}</h3>
          <span class="small muted">${Store.labelMonth(ym)}</span></div>
        <section class="card">
          <div class="stat-row">
            <div class="stat"><div class="k">validado</div><div class="v">${Store.money(t.approved)}</div></div>
            <div class="stat"><div class="k">pago</div><div class="v">${Store.money(t.paid)}</div></div>
            <div class="stat"><div class="k">saldo</div><div class="v">${Store.money(bal)}</div></div>
          </div>
          <div class="chart">
            ${days.map((d, i) => `
              <div class="cb" title="${Store.labelDate(d)}: ${Store.money(vals[i])}">
                <i style="height:${(vals[i] / max) * 100}%"></i>
                <span>${Store.WEEKDAYS[Store.fromISO(d).getDay()]}</span>
              </div>`).join('')}
          </div>
          <div class="row mt12" style="gap:9px">
            <button class="btn btn-ghost btn-sm grow" data-diary="${k.id}">${Icons.svg('book')} Diário</button>
            <button class="btn btn-primary btn-sm grow" data-pay="${k.id}">${Icons.svg('banknote')} Pagar mesada</button>
          </div>
        </section>`;
    }).join('');
  }

  /* ---------- sheets ---------- */
  function openReject(entryId, parentId, isDiary) {
    UI.openSheet({
      title: isDiary ? 'Pedir revisão' : 'Recusar lançamento',
      subtitle: 'Explique o motivo para o(a) filho(a) entender.',
      body: `<form id="rej-form">${UI.field('Motivo (opcional)', `
        <textarea name="reviewNote" rows="3" placeholder="ex.: a cama não foi arrumada hoje"></textarea>`)}</form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Voltar</button>
        <button class="btn btn-danger" data-ok>${isDiary ? 'Pedir revisão' : 'Recusar'}</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#rej-form'));
          if (isDiary) Store.reviewDiary(entryId, 'rejected', data.reviewNote, parentId);
          else Store.review(entryId, 'rejected', data.reviewNote, parentId);
          UI.closeSheet();
          UI.toast(isDiary ? 'Revisão pedida' : 'Lançamento recusado');
          App.render();
        });
      },
    });
  }

  function openChildForm(kid) {
    const editing = !!kid;
    UI.openSheet({
      title: editing ? 'Editar filho(a)' : 'Novo filho(a)',
      subtitle: editing ? kid.name : 'Crie o acesso que ele(a) vai usar para entrar',
      body: `
        <form id="kid-form">
          ${UI.field('Nome', UI.input('name', { value: editing ? kid.name : '', placeholder: 'ex.: Mariana' }))}
          ${UI.field('Usuário (login)', UI.input('username', { value: editing ? kid.username : '', placeholder: 'ex.: mariana' }))}
          ${UI.field(editing ? 'Nova senha (deixe vazio para manter)' : 'Senha', UI.input('password', { type: 'password', placeholder: '••••' }))}
          ${UI.gradPicker('color', editing ? (kid.color || 'g1') : 'g1', 'Cor do perfil')}
          ${UI.field('Meta (opcional)', UI.input('goalName', { value: editing ? (kid.goalName || '') : '', placeholder: 'ex.: Patins novos' }))}
          ${UI.field('Valor da meta (R$)', UI.input('goalAmount', { type: 'number', value: editing ? (kid.goalAmount || '') : '', attrs: 'min="0" step="0.01"', placeholder: '150' }))}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(kid.id)}" />` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>${editing ? 'Salvar' : 'Criar acesso'}</button>`,
      onMount(sheet) {
        UI.bindPickers(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#kid-form'));
          const res = Store.saveChild(data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast(editing ? 'Dados atualizados' : `Acesso de ${res.user.name} criado`, 'ok');
          App.render();
        });
      },
    });
  }

  function openChildDetail(kid) {
    const bal = Store.balance(kid.id);
    const t = Store.totals(kid.id, Store.monthOf(Store.today()));
    UI.openSheet({
      title: kid.name,
      subtitle: `@${kid.username}`,
      body: `
        <div class="stat-row">
          <div class="stat"><div class="k">saldo</div><div class="v">${Store.money(bal)}</div></div>
          <div class="stat"><div class="k">validado no mês</div><div class="v">${Store.money(t.approved)}</div></div>
          <div class="stat"><div class="k">aguardando</div><div class="v">${t.pendingCount}</div></div>
        </div>
        <div class="list">
          <button class="mini-row" data-a="pay">${Icons.svg('banknote')}<span class="grow bold small" style="text-align:left">Registrar pagamento</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="diary">${Icons.svg('book')}<span class="grow bold small" style="text-align:left">Ver diário de livros e lições</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="history">${Icons.svg('chart')}<span class="grow bold small" style="text-align:left">Ver histórico</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="edit">${Icons.svg('pencil')}<span class="grow bold small" style="text-align:left">Editar dados e meta</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="del"><span style="color:var(--bad);display:grid">${Icons.svg('trash')}</span><span class="grow bold small" style="text-align:left;color:var(--bad)">Excluir filho(a)</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', async () => {
          const a = b.getAttribute('data-a');
          UI.closeSheet();
          if (a === 'pay') return openPayForm(kid);
          if (a === 'history') return openHistory(kid);
          if (a === 'diary') return openDiary(kid);
          if (a === 'edit') return openChildForm(kid);
          if (a === 'del') {
            const ok = await UI.confirm({
              title: `Excluir ${kid.name}?`,
              text: 'Todos os lançamentos e pagamentos desse filho(a) serão apagados. Não dá para desfazer.',
              okLabel: 'Excluir', danger: true,
            });
            if (ok) { Store.removeChild(kid.id); UI.toast('Filho(a) removido(a)'); App.render(); }
          }
        }));
      },
    });
  }

  function openPayForm(kid) {
    const bal = Store.balance(kid.id);
    UI.openSheet({
      title: 'Registrar pagamento',
      subtitle: `${kid.name}. Saldo atual ${Store.money(bal)}.`,
      body: `
        <form id="pay-form">
          ${UI.field('Valor pago (R$)', UI.input('amount', { type: 'number', value: bal > 0 ? bal.toFixed(2) : '', attrs: 'min="0" step="0.01"', placeholder: '0,00' }))}
          ${UI.field('Observação', UI.input('note', { placeholder: 'ex.: mesada de agosto (PIX)' }))}
          ${UI.field('Data', UI.input('date', { type: 'date', value: Store.today() }))}
        </form>
        <div class="note">O valor pago é descontado do saldo disponível e fica registrado no extrato.</div>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-ok>Registrar</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#pay-form'));
          const res = Store.addPayout(kid.id, data.amount, data.note, data.date);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast('Pagamento registrado', 'ok');
          App.render();
        });
      },
    });
  }

  function openHistory(kid) {
    const list = Store.historyOf(kid.id, 90);
    const byDate = {};
    list.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    UI.openSheet({
      title: `Histórico de ${kid.name}`,
      subtitle: `${list.length} lançamentos nos últimos 90 dias`,
      body: dates.length ? dates.map((d) => `
        <div class="date-head"><h4>${Store.labelDate(d)}</h4><span class="ln"></span>
          <span class="tiny muted">${Store.money(byDate[d].filter((e) => e.status === 'approved').reduce((s, e) => s + Store.signed(e), 0))}</span></div>
        <div class="list">
          ${byDate[d].map((e) => `
            <div class="mini-row">
              <span class="em ${e.grad || 'g1'}" style="width:34px;height:34px;border-radius:12px;display:grid;place-items:center">${Icons.svg(e.icon)}</span>
              <div class="grow">
                <div class="small bold">${UI.esc(e.name)}</div>
                <div class="tiny muted">${UI.statusChip(e.status)}</div>
              </div>
              <span class="val ${e.kind === 'penalty' ? 'pen' : 'earn'}">${e.kind === 'penalty' ? '-' : '+'}${Store.money(e.value).replace('R$ ', '')}</span>
            </div>`).join('')}
        </div>`).join('') : UI.empty('calendar', 'Sem lançamentos ainda.'),
    });
  }

  function openDiary(kid) {
    const list = Store.diaryOf(kid.id);
    const minutos = list.reduce((sum, d) => sum + (d.minutes || 0), 0);
    UI.openSheet({
      title: `Diário de ${kid.name}`,
      subtitle: `${list.length} ${list.length === 1 ? 'registro' : 'registros'} • ${minutos} minutos somados`,
      body: list.length ? list.map((d) => {
        const kind = Store.diaryKind(d.kind);
        return `
          <article class="diary">
            <div class="row">
              <span class="em g1" style="width:38px;height:38px;border-radius:13px;display:grid;place-items:center">
                ${Icons.svg(kind.icon)}
              </span>
              <div class="grow">
                <div class="bold small">${UI.esc(d.title)}</div>
                <div class="tiny muted">${UI.esc(kind.label)} • ${Store.labelDate(d.date)} às ${UI.esc(d.time)}${d.minutes ? ` • ${d.minutes} min` : ''}</div>
              </div>
              ${UI.statusChip(d.status)}
            </div>
            ${d.detail ? `<div class="tiny muted">${UI.esc(d.detail)}</div>` : ''}
            <p class="diary-text">${UI.esc(d.text)}</p>
            ${UI.photoStrip(d.photos)}
            ${d.reviewNote ? `<div class="note">${UI.esc(d.reviewNote)}</div>` : ''}
          </article>`;
      }).join('') : UI.empty('book', 'Esse filho(a) ainda não escreveu nenhum registro.'),
    });
  }

  function openCatForm(cat) {
    const editing = !!cat;
    UI.openSheet({
      title: editing ? 'Editar categoria' : 'Nova categoria',
      body: `
        <form id="cat-form">
          ${UI.field('Nome', UI.input('name', { value: editing ? cat.name : '', placeholder: 'ex.: Estudos' }))}
          ${UI.iconPicker('icon', editing ? cat.icon : 'star')}
          ${UI.gradPicker('grad', editing ? cat.grad : 'g1')}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(cat.id)}" />` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        UI.bindPickers(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#cat-form'));
          const res = Store.saveCategory(data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast('Categoria salva', 'ok');
          App.render();
        });
      },
    });
  }

  function openItemForm(catId, item) {
    const editing = !!item;
    UI.openSheet({
      title: editing ? 'Editar ação' : 'Nova ação',
      subtitle: (Store.categoryById(catId) || {}).name || '',
      body: `
        <form id="item-form">
          ${UI.field('O que precisa ser feito', UI.input('name', { value: editing ? item.name : '', placeholder: 'ex.: Arrumar a cama' }))}
          ${UI.field('Valor (R$)', UI.input('value', { type: 'number', value: editing ? item.value : '', attrs: 'min="0" step="0.01"', placeholder: '2,00' }))}
          <div class="field">
            <label>Tipo</label>
            <div class="seg-mini" data-kind-group>
              <button type="button" data-kind="earn" aria-pressed="${!editing || item.kind !== 'penalty'}">+ Ganha</button>
              <button type="button" data-kind="penalty" aria-pressed="${editing && item.kind === 'penalty'}">- Desconta</button>
            </div>
            <input type="hidden" name="kind" value="${editing && item.kind === 'penalty' ? 'penalty' : 'earn'}" />
          </div>
          <div class="mini-row">
            <div class="grow">
              <div class="small bold">Obrigatória todo dia</div>
              <div class="tiny muted">entra na contagem diária do(a) filho(a)</div>
            </div>
            <button type="button" class="switch" data-switch="daily" aria-pressed="${editing ? !!item.daily : false}" aria-label="Obrigatória todo dia"></button>
          </div>
          <input type="hidden" name="catId" value="${UI.esc(catId)}" />
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(item.id)}" />` : ''}
        </form>`,
      actions: `
        ${editing ? '<button class="btn btn-ghost" data-del>Excluir</button>' : '<button class="btn btn-ghost" data-cancel>Cancelar</button>'}
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        UI.bindSwitches(sheet);
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
            title: 'Excluir esta ação?',
            text: 'Os lançamentos já feitos continuam no histórico.',
            okLabel: 'Excluir', danger: true,
          });
          if (ok) { Store.removeItem(catId, item.id); UI.toast('Ação excluída'); App.render(); }
        });
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#item-form'));
          const res = Store.saveItem(catId, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast('Ação salva', 'ok');
          App.render();
        });
      },
    });
  }

  function openQuickAdd(user) {
    UI.openSheet({
      title: 'O que você quer fazer?',
      body: `
        <div class="list">
          <button class="mini-row" data-q="child">${Icons.svg('users')}<span class="grow bold small" style="text-align:left">Cadastrar filho(a)</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-q="cat">${Icons.svg('folder')}<span class="grow bold small" style="text-align:left">Criar categoria</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-q="pay">${Icons.svg('banknote')}<span class="grow bold small" style="text-align:left">Registrar pagamento</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-q="approve">${Icons.svg('check')}<span class="grow bold small" style="text-align:left">Validar tudo que está pendente</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', async () => {
          const q = b.getAttribute('data-q');
          UI.closeSheet();
          if (q === 'child') return openChildForm(null);
          if (q === 'cat') return openCatForm(null);
          if (q === 'pay') {
            const kids = Store.children();
            if (!kids.length) return UI.toast('Cadastre um filho(a) primeiro', 'bad');
            if (kids.length === 1) return openPayForm(kids[0]);
            tab = 'filhos';
            App.render();
            return UI.toast('Escolha o filho(a) para registrar o pagamento');
          }
          if (q === 'approve') {
            const ids = Store.pendingEntries().map((e) => e.id);
            const diaryIds = Store.pendingDiary().map((d) => d.id);
            const total = ids.length + diaryIds.length;
            if (!total) return UI.toast('Não há nada pendente');
            const ok = await UI.confirm({
              title: `Validar ${total} ${total === 1 ? 'item' : 'itens'}?`,
              text: 'Todos os lançamentos e registros pendentes serão aprovados de uma vez.',
              okLabel: 'Validar tudo',
            });
            if (ok) {
              Store.reviewMany(ids, 'approved', user.id);
              diaryIds.forEach((id) => Store.reviewDiary(id, 'approved', '', user.id));
              UI.toast('Tudo validado', 'ok');
              App.render();
            }
          }
        }));
      },
    });
  }

  function openMenu(user) {
    UI.openSheet({
      title: 'Menu',
      subtitle: user.name,
      body: `
        <div class="list">
          <button class="mini-row" data-m="theme">${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}<span class="grow bold small" style="text-align:left">Trocar tema</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="pass">${Icons.svg('lock')}<span class="grow bold small" style="text-align:left">Trocar minha senha</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="reset">${Icons.svg('refresh')}<span class="grow bold small" style="text-align:left">Restaurar dados de exemplo</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="logout">${Icons.svg('logout')}<span class="grow bold small" style="text-align:left">Sair</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', async () => {
          const m = b.getAttribute('data-m');
          UI.closeSheet();
          if (m === 'logout') return App.logout();
          if (m === 'theme') { App.toggleTheme(); return App.render(); }
          if (m === 'pass') return App.openChangePassword(user);
          if (m === 'reset') {
            const ok = await UI.confirm({
              title: 'Restaurar dados de exemplo?',
              text: 'Todos os filhos, categorias e lançamentos criados serão apagados e o app volta ao estado inicial.',
              okLabel: 'Restaurar', danger: true,
            });
            if (ok) { Store.resetAll(); UI.toast('Dados restaurados'); App.render(); }
          }
        }));
      },
    });
  }

  /* ---------- render ---------- */
  function render(root, user) {
    const views = { validar: validarView, filhos: filhosView, categorias: categoriasView, relatorio: relatorioView };
    const view = (views[tab] || validarView)();

    root.innerHTML = `
      <div class="shell">
        ${topbar(user)}
        <div class="scroll">${view}</div>
        <nav class="tabbar">
          <button class="tab" data-tab="validar" aria-pressed="${tab === 'validar'}">${Icons.svg('check')}Validar</button>
          <button class="tab" data-tab="filhos" aria-pressed="${tab === 'filhos'}">${Icons.svg('users')}Filhos</button>
          <button class="fab" data-fab aria-label="Ações rápidas">${Icons.svg('plus')}</button>
          <button class="tab" data-tab="categorias" aria-pressed="${tab === 'categorias'}">${Icons.svg('folder')}Ações</button>
          <button class="tab" data-tab="relatorio" aria-pressed="${tab === 'relatorio'}">${Icons.svg('trending')}Relatório</button>
        </nav>
      </div>`;

    const rerender = () => render(root, user);

    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
      tab = b.getAttribute('data-tab'); rerender();
    }));
    root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      tab = b.getAttribute('data-go'); rerender();
    }));
    root.querySelectorAll('[data-kid-filter]').forEach((b) => b.addEventListener('click', () => {
      childFilter = b.getAttribute('data-kid-filter'); rerender();
    }));
    root.querySelectorAll('[data-approve]').forEach((b) => b.addEventListener('click', () => {
      Store.review(b.getAttribute('data-approve'), 'approved', '', user.id);
      UI.toast('Validado', 'ok');
      App.render();
    }));
    root.querySelectorAll('[data-reject]').forEach((b) =>
      b.addEventListener('click', () => openReject(b.getAttribute('data-reject'), user.id, false)));
    root.querySelectorAll('[data-diary-reject]').forEach((b) =>
      b.addEventListener('click', () => openReject(b.getAttribute('data-diary-reject'), user.id, true)));
    root.querySelectorAll('[data-diary-approve]').forEach((b) => b.addEventListener('click', () => {
      Store.reviewDiary(b.getAttribute('data-diary-approve'), 'approved', '', user.id);
      UI.toast('Registro validado', 'ok');
      App.render();
    }));
    root.querySelectorAll('[data-diary]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-diary'));
      if (kid) openDiary(kid);
    }));
    root.querySelectorAll('[data-approve-all]').forEach((b) => b.addEventListener('click', () => {
      const [childId, d] = b.getAttribute('data-approve-all').split('|');
      const ids = Store.pendingEntries(childId).filter((e) => e.date === d).map((e) => e.id);
      Store.reviewMany(ids, 'approved', user.id);
      UI.toast(`${ids.length} ${ids.length === 1 ? 'item validado' : 'itens validados'}`, 'ok');
      App.render();
    }));
    root.querySelectorAll('[data-kid]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-kid'));
      if (kid) openChildDetail(kid);
    }));
    root.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-pay'));
      if (kid) openPayForm(kid);
    }));
    root.querySelectorAll('[data-history]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-history'));
      if (kid) openHistory(kid);
    }));
    const newChild = root.querySelector('[data-new-child]');
    if (newChild) newChild.addEventListener('click', () => openChildForm(null));
    const newCat = root.querySelector('[data-new-cat]');
    if (newCat) newCat.addEventListener('click', () => openCatForm(null));
    root.querySelectorAll('[data-edit-cat]').forEach((b) =>
      b.addEventListener('click', () => openCatForm(Store.categoryById(b.getAttribute('data-edit-cat')))));
    root.querySelectorAll('[data-del-cat]').forEach((b) => b.addEventListener('click', async () => {
      const c = Store.categoryById(b.getAttribute('data-del-cat'));
      if (!c) return;
      const ok = await UI.confirm({
        title: `Excluir “${c.name}”?`,
        text: 'As ações dessa categoria somem do app. O histórico já validado continua no extrato.',
        okLabel: 'Excluir', danger: true,
      });
      if (ok) { Store.removeCategory(c.id); UI.toast('Categoria excluída'); App.render(); }
    }));
    root.querySelectorAll('[data-new-item]').forEach((b) =>
      b.addEventListener('click', () => openItemForm(b.getAttribute('data-new-item'), null)));
    root.querySelectorAll('[data-edit-item]').forEach((b) => b.addEventListener('click', () => {
      const [catId, itemId] = b.getAttribute('data-edit-item').split(':');
      const cat = Store.categoryById(catId);
      const item = cat && cat.items.find((i) => i.id === itemId);
      if (item) openItemForm(catId, item);
    }));
    root.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', () => openMenu(user)));
    const fab = root.querySelector('[data-fab]');
    if (fab) fab.addEventListener('click', () => openQuickAdd(user));
  }

  return { render, reset() { tab = 'validar'; childFilter = 'all'; } };
})();

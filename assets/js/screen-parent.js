/* =========================================================
   screen-parent.js: área do responsável
   ========================================================= */
const ParentScreen = (() => {
  let tab = 'validar';
  let childFilter = 'all';
  let relTab = 'dinheiro';   // dentro do relatório: dinheiro ou tempo de uso

  /**
   * O empurrãozinho para ligar o aviso. Fica na aba de validar, que é
   * onde ela vem quando quer saber o que a filha mandou, e some sozinho
   * assim que o número estiver posto.
   */
  function avisoNudge() {
    if (Store.avisoPronto()) return '';
    const a = Store.avisoOf();
    return `
      <button class="card aviso-nudge mt16" data-ligar-aviso>
        <span class="aviso-nudge-ico">${Icons.svg('bell')}</span>
        <span class="grow">
          <span class="small bold block">${a.on ? 'Receba um aviso quando ela enviar' : 'O aviso está desligado'}</span>
          <span class="tiny muted block">Assim você não precisa ficar abrindo o app para ver se chegou algo.</span>
        </span>
        ${Icons.svg('chevron', 'ico-sm dim')}
      </button>`;
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

      ${avisoNudge()}

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
            <button class="btn btn-soft btn-sm list-action" data-approve-all="${k}">${Icons.svg('check')}
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

  /** o registro de leitura como a mãe vê: livro, páginas, resumo e grifos */
  function leituraBloco(e) {
    const r = e.reading || {};
    const paginas = r.paginaDe && r.paginaAte ? `páginas ${r.paginaDe} a ${r.paginaAte}` : '';
    const quantas = (e.photos || []).length;
    return `
      <div class="leitura-selo">
        <span class="chip lime">${Icons.svg('book')} ${UI.esc(r.livro || 'leitura')}</span>
        ${paginas ? `<span class="chip neutral">${paginas}</span>` : ''}
        ${r.grifou ? '<span class="chip approved">grifou a lápis</span>' : '<span class="chip warn">não grifou</span>'}
        <span class="chip neutral">${quantas} ${quantas === 1 ? 'página fotografada' : 'páginas fotografadas'}</span>
      </div>
      ${r.resumo ? `<div class="leitura-resumo">${UI.esc(r.resumo)}</div>` : ''}
      ${r.partes ? `<div class="note mt8"><b>O que ela mais gostou:</b> ${UI.esc(r.partes)}</div>` : ''}`;
  }

  function approvalCard(e) {
    const kid = Store.userById(e.childId);
    return `
      <article class="appr">
        <div class="row">
          ${UI.entryVisual(e, 'width:42px;height:42px;border-radius:15px;display:grid;place-items:center')}
          <div class="grow">
            <div class="nm bold" style="font-size:14px">${UI.esc(e.name)}</div>
            <div class="mt small muted">${UI.esc(e.catName || '')} • ${kid ? UI.esc(kid.name.split(' ')[0]) : ''}</div>
            ${Store.entryNeedsPhoto(e) ? '<div class="mt"><span class="chip warn">sem a foto obrigatória</span></div>' : ''}
            ${Store.entryReadingPending(e) ? '<div class="mt"><span class="chip warn">registro de leitura incompleto</span></div>' : ''}
          </div>
          <span class="val ${e.kind === 'penalty' ? 'pen' : 'earn'}">
            ${e.kind === 'penalty' ? '-' : '+'}${Store.money(e.value).replace('R$ ', '')}
          </span>
        </div>
        ${e.reading ? leituraBloco(e) : (e.note ? `<div class="note">${UI.esc(e.note)}</div>` : '')}
        ${UI.photoStrip(e.photos)}
        <div class="acts">
          <button class="btn btn-ghost btn-sm" data-reject="${e.id}">${Icons.svg('close')} Recusar</button>
          <button class="btn btn-ghost btn-sm" data-adjust="${e.id}">${Icons.svg('pencil')} Ajustar</button>
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
              ${UI.avatar(k, '', 'width:50px;height:50px;font-size:21px')}
              <span class="kid-pet">${Pet.svg(k, 54)}</span>
              <div class="grow">
                <div class="bold" style="font-size:15px">${UI.esc(k.name)}</div>
                <div class="small muted">@${UI.esc(k.username)} • ${t.pendingCount} aguardando •
                  ${UI.esc(Store.petOf(k.id).name)} nível ${Pet.level(Store.petOf(k.id).xp)}</div>
                <div class="tiny muted">${Icons.svg('clock', 'ico-sm dim')} ${Store.duracao(Store.usageToday(k.id))} no app hoje</div>
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
    const exigeFoto = Store.photoRequired();
    return `
      <section class="panel">
        <header class="panel-head"><h3>${Icons.svg('camera')} Regra das fotos</h3></header>
        <button class="up-row" data-toggle-photo aria-pressed="${exigeFoto}">
          <span class="grow" style="text-align:left">
            <span class="bold small block">Foto obrigatória nas atividades diárias</span>
            <span class="tiny muted block">
              ${exigeFoto
                ? 'Ligado: as tarefas de todo dia só contam quando o filho manda uma foto.'
                : 'Desligado: a foto continua disponível, mas não é exigida.'}
            </span>
          </span>
          <span class="switch" aria-hidden="true"></span>
        </button>
      </section>

      <section class="panel mt16">
        <header class="panel-head"><h3>${Icons.svg('banknote')} Valor da mesada</h3></header>
        ${Store.children().length ? Store.children().map((k) => {
          const valor = Store.allowanceOf(k.id);
          const pl = valor ? Store.planoMesada(k.id) : null;
          return `
            <button class="up-row" data-mesada-kid="${k.id}">
              <span class="grow" style="text-align:left">
                <span class="bold small block">${UI.esc(k.name)}</span>
                <span class="tiny muted block">
                  ${valor
                    ? `${Store.money(valor)} por mês. Fazendo tudo dá ${Store.money(pl.total)}, com ${pl.leituraPct}% em leitura.`
                    : 'Ainda sem valor. Toque para dizer quanto vale a mesada do mês.'}
                </span>
              </span>
              ${Icons.svg('chevron', 'ico-sm dim')}
            </button>`;
        }).join('') : '<p class="small muted" style="padding:0 2px">Cadastre um filho para dividir a mesada.</p>'}
      </section>

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
              ${UI.catVisual(c, 'width:44px;height:44px;border-radius:16px;display:grid;place-items:center')}
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
                  <div class="tiny muted">
                    ${it.kind === 'penalty' ? 'desconto'
                      : `${it.daily ? 'todo dia' : `${it.vezesMes || 8}x no mês`}`
                        + `${(it.esforco || 1) > 1 ? ` • esforço ${it.esforco}` : ''}`
                        + ` • ${Store.money((it.value || 0) * (it.vezesMes || 0))} no mês`}
                  </div>
                </div>
                <button class="icon-btn sm" data-edit-item="${c.id}:${it.id}" aria-label="Editar ação">${Icons.svg('pencil')}</button>
              </div>`).join('')}
            <button class="btn btn-soft btn-sm list-action" data-new-item="${c.id}">+ nova ação em ${UI.esc(c.name)}</button>
          </div>
        </section>`).join('')
      : UI.empty('folder', 'Crie a primeira categoria para começar.')}`;
  }

  /* ---------- aba: relatório ---------- */
  function relatorioView() {
    const kids = Store.children();
    if (!kids.length) return UI.empty('trending', 'Cadastre um filho para ver os relatórios.');
    const abas = `
      <div class="seg-tabs" data-rel>
        <button type="button" data-rel-tab="dinheiro" aria-pressed="${relTab === 'dinheiro'}">
          ${Icons.svg('coins')} Dinheiro
        </button>
        <button type="button" data-rel-tab="tempo" aria-pressed="${relTab === 'tempo'}">
          ${Icons.svg('clock')} Tempo de uso
        </button>
      </div>`;
    return abas + (relTab === 'tempo' ? tempoView(kids) : dinheiroView(kids));
  }

  /* ---------- relatório: quanto tempo cada filho usa o app ---------- */
  function tempoView(kids) {
    return kids.map((k) => {
      const u = Store.usageOf(k.id, 7);
      const q = Store.quizStats(k.id, 30);
      return `
        <div class="section-title"><h3>${UI.esc(k.name)}</h3>
          <span class="small muted">${Store.duracao(u.hoje)} hoje</span></div>
        <section class="card">
          <div class="stat-row">
            <div class="stat"><div class="k">hoje</div><div class="v">${Store.duracao(u.hoje)}</div></div>
            <div class="stat"><div class="k">7 dias</div><div class="v">${Store.duracao(u.total)}</div></div>
            <div class="stat"><div class="k">por dia</div><div class="v">${Store.duracao(u.media)}</div></div>
          </div>
          <div class="stat-row mt12">
            <div class="stat"><div class="k">joguinhos</div><div class="v">${Store.duracao(u.jogos)}</div></div>
            <div class="stat"><div class="k">estudo</div><div class="v">${Store.duracao(u.estudo)}</div></div>
            <div class="stat"><div class="k">quizzes</div><div class="v">${q.quizzes}</div></div>
          </div>
          ${u.total ? `
            <div class="chart mt16">
              ${u.porDia.map((d) => `
                <div class="cb" title="${Store.labelDate(d.date)}: ${Store.duracao(d.ms)}">
                  <i style="height:${Math.max(2, (d.ms / Math.max(1, ...u.porDia.map((x) => x.ms))) * 100)}%"></i>
                  <span>${Store.WEEKDAYS[Store.fromISO(d.date).getDay()]}</span>
                </div>`).join('')}
            </div>` : '<p class="tiny muted mt12">Ainda não há tempo de uso registrado nesta semana.</p>'}
          ${u.porArea.length ? `
            <div class="chip-row mt16">
              ${u.porArea.map((a) => `
                <span class="chip neutral">${UI.esc(a.label)}: ${Store.duracao(a.ms)}</span>`).join('')}
            </div>` : ''}
          <button class="btn btn-ghost btn-sm btn-block mt16" data-tempo="${k.id}">
            ${Icons.svg('chart')} Ver tudo de ${UI.esc(k.name)}
          </button>
        </section>`;
    }).join('');
  }

  function dinheiroView(kids) {
    const ym = Store.monthOf(Store.today());
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
            <div class="stat"><div class="k">a receber</div><div class="v">${Store.money(bal)}</div></div>
            <div class="stat"><div class="k">na carteira</div><div class="v">${Store.money(Store.cash(k.id).left)}</div></div>
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
            <button class="btn btn-ghost btn-sm grow" data-manual="${k.id}">${Icons.svg('coins')} Ajuste</button>
            <button class="btn btn-primary btn-sm grow" data-pay="${k.id}">${Icons.svg('banknote')} Pagamentos</button>
          </div>
        </section>`;
    }).join('');
  }

  /* ---------- folha com o tempo de uso completo de um filho ---------- */
  function openTempo(kid) {
    const u = Store.usageOf(kid.id, 7);
    UI.openSheet({
      size: 'larga',
      title: `Tempo de ${kid.name}`,
      subtitle: `${Store.duracao(u.hoje)} hoje • ${Store.duracao(u.total)} nos últimos 7 dias`,
      body: Dash.tempo(kid),
      actions: '<button class="btn btn-primary btn-block" data-ok>Pronto</button>',
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', UI.closeSheet);
      },
    });
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

  /** o responsável corrige valor, descrição e fotos de um lançamento */
  function openAdjust(entryId) {
    const e = Store.get().entries.find((x) => x.id === entryId);
    if (!e) return;
    let picker = null;
    UI.openSheet({
      title: 'Ajustar lançamento',
      subtitle: `${e.catName || ''} • ${Store.labelDate(e.date)}`,
      body: `
        <form id="adjust-form">
          ${UI.field('Descrição', UI.input('name', { value: e.name }))}
          ${UI.field('Valor (R$)', UI.input('value', { type: 'number', value: e.value, attrs: 'min="0" step="0.01"' }))}
          <div class="field">
            <label>Tipo</label>
            <div class="seg-mini">
              <button type="button" data-kind="earn" aria-pressed="${e.kind !== 'penalty'}">+ Ganha</button>
              <button type="button" data-kind="penalty" aria-pressed="${e.kind === 'penalty'}">- Desconta</button>
            </div>
            <input type="hidden" name="kind" value="${e.kind === 'penalty' ? 'penalty' : 'earn'}" />
          </div>
          ${UI.field('Observação para o(a) filho(a)', `
            <textarea name="reviewNote" rows="2" placeholder="ex.: combinamos metade hoje">${UI.esc(e.reviewNote || '')}</textarea>`)}
          ${UI.photoField('Fotos do lançamento', e.photos || [])}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-del>${Icons.svg('trash')} Excluir</button>
        <button class="btn btn-primary" data-save>Salvar ajuste</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        const kindInput = sheet.querySelector('input[name="kind"]');
        sheet.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => {
          sheet.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          kindInput.value = b.getAttribute('data-kind');
        }));
        sheet.querySelector('[data-del]').addEventListener('click', async () => {
          const ok = await UI.confirm({
            title: 'Excluir este lançamento?',
            text: 'Ele sai do extrato e do saldo. As fotos anexadas também são apagadas.',
            okLabel: 'Excluir', danger: true,
          });
          if (ok) {
            Store.removeEntry(entryId);
            picker.commit();
            UI.closeSheet();
            UI.toast('Lançamento excluído');
            App.render();
          }
        });
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#adjust-form'));
          const res = Store.adjustEntry(entryId, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast('Lançamento ajustado', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /** bônus ou desconto avulso, lançado direto pelo responsável */
  function openManualEntry(kid, parentId) {
    let picker = null;
    UI.openSheet({
      title: 'Lançamento avulso',
      subtitle: `${kid.name}. Entra no saldo já validado.`,
      body: `
        <form id="manual-form">
          ${UI.field('Descrição', UI.input('name', { placeholder: 'ex.: ajudou na mudança' }))}
          ${UI.field('Valor (R$)', UI.input('value', { type: 'number', attrs: 'min="0" step="0.01"', placeholder: '10,00' }))}
          <div class="field">
            <label>Tipo</label>
            <div class="seg-mini">
              <button type="button" data-kind="earn" aria-pressed="true">+ Ganha</button>
              <button type="button" data-kind="penalty" aria-pressed="false">- Desconta</button>
            </div>
            <input type="hidden" name="kind" value="earn" />
          </div>
          ${UI.field('Data', UI.input('date', { type: 'date', value: Store.today() }))}
          ${UI.field('Observação (opcional)', `<textarea name="note" rows="2" placeholder="por que esse valor"></textarea>`)}
          ${UI.photoField('Fotos (opcional)', [])}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-ok>Lançar</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        const kindInput = sheet.querySelector('input[name="kind"]');
        sheet.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => {
          sheet.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          kindInput.value = b.getAttribute('data-kind');
        }));
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#manual-form'));
          const res = Store.addManualEntry(kid.id, data, parentId);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast('Lançamento registrado', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /** o que o filho comprou com o dinheiro que recebeu */
  function openPurchases(kid) {
    const list = Store.purchasesOf(kid.id);
    const c = Store.cash(kid.id);
    UI.openSheet({
      title: `Gastos de ${kid.name}`,
      subtitle: `Recebeu ${Store.money(c.received)} • gastou ${Store.money(c.spent)} • sobrou ${Store.money(c.left)}`,
      body: list.length ? `<div class="list">${list.map((pc) => {
        const kind = Store.purchaseKind(pc.kind);
        return `
          <article class="diary">
            <div class="row">
              <span class="em ${kind.grad}" style="width:38px;height:38px;border-radius:13px;display:grid;place-items:center">
                ${Icons.svg(kind.icon)}
              </span>
              <div class="grow">
                <div class="bold small">${UI.esc(pc.title)}</div>
                <div class="tiny muted">${UI.esc(kind.label)} • ${UI.esc(Store.labelDate(pc.date))}${pc.note ? ' • ' + UI.esc(pc.note) : ''}</div>
              </div>
              <span class="val pen">-${Store.money(pc.value).replace('R$ ', '')}</span>
            </div>
            ${UI.photoStrip(pc.photos, 'small-thumbs')}
          </article>`;
      }).join('')}</div>` : UI.empty('coins', 'Esse filho(a) ainda não anotou nenhum gasto.'),
    });
  }

  /** lista de pagamentos de um filho, com edição, exclusão e comprovante */
  function openPayouts(kid) {
    const list = Store.payoutsOf(kid.id);
    UI.openSheet({
      title: `Pagamentos de ${kid.name}`,
      subtitle: `${list.length} ${list.length === 1 ? 'pagamento' : 'pagamentos'} • saldo atual ${Store.money(Store.balance(kid.id))}`,
      body: `
        <button class="btn btn-primary btn-block" data-new-pay>${Icons.svg('plus')} Registrar pagamento</button>
        ${list.length ? `<div class="list">${list.map((p) => `
          <article class="diary">
            <div class="row">
              <span class="em g3" style="width:38px;height:38px;border-radius:13px;display:grid;place-items:center">
                ${Icons.svg('banknote')}
              </span>
              <div class="grow">
                <div class="bold small">${Store.money(p.amount)}</div>
                <div class="tiny muted">${Store.labelDate(p.date)}${p.note ? ' • ' + UI.esc(p.note) : ''}</div>
              </div>
              <button class="icon-btn sm" data-edit-pay="${p.id}" aria-label="Editar pagamento">${Icons.svg('pencil')}</button>
            </div>
            ${UI.photoStrip(p.photos, 'small-thumbs')}
          </article>`).join('')}</div>`
        : UI.empty('banknote', 'Nenhum pagamento registrado ainda.')}`,
      onMount(sheet) {
        sheet.querySelector('[data-new-pay]').addEventListener('click', () => openPayForm(kid, null));
        sheet.querySelectorAll('[data-edit-pay]').forEach((b) => b.addEventListener('click', () =>
          openPayForm(kid, Store.payoutById(b.getAttribute('data-edit-pay')))));
      },
    });
  }

  function openChildForm(kid) {
    const editing = !!kid;
    let picker = null;
    UI.openSheet({
      title: editing ? 'Editar filho(a)' : 'Novo filho(a)',
      subtitle: editing ? kid.name : 'Crie o acesso que ele(a) vai usar para entrar',
      body: `
        <form id="kid-form">
          ${UI.field('Nome', UI.input('name', { value: editing ? kid.name : '', placeholder: 'ex.: Mariana' }))}
          ${UI.field('Usuário (login)', UI.input('username', { value: editing ? kid.username : '', placeholder: 'ex.: mariana' }))}
          ${UI.field(editing ? 'Nova senha (deixe vazio para manter)' : 'Senha', UI.input('password', { type: 'password', placeholder: '••••' }))}
          ${UI.gradPicker('color', editing ? (kid.color || 'g1') : 'g1', 'Cor do perfil')}
          ${UI.photoField('Foto do perfil (opcional)', editing && kid.photo ? [kid.photo] : [])}
          ${UI.field('Meta (opcional)', UI.input('goalName', { value: editing ? (kid.goalName || '') : '', placeholder: 'ex.: Patins novos' }))}
          ${UI.field('Valor da meta (R$)', UI.input('goalAmount', { type: 'number', value: editing ? (kid.goalAmount || '') : '', attrs: 'min="0" step="0.01"', placeholder: '150' }))}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(kid.id)}" />` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>${editing ? 'Salvar' : 'Criar acesso'}</button>`,
      onMount(sheet) {
        UI.bindPickers(sheet);
        picker = UI.bindPhotos(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#kid-form'));
          const res = Store.saveChild(data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast(editing ? 'Dados atualizados' : `Acesso de ${res.user.name} criado`, 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  function openChildDetail(kid) {
    const hoje = Store.today();
    const bal = Store.balance(kid.id);
    const t = Store.totals(kid.id, Store.monthOf(hoje));
    const caixa = Store.cash(kid.id);
    const st = Store.dayStatus(kid.id, hoje);
    const uso = Store.usageOf(kid.id, 7);
    const estudo = Store.quizStats(kid.id, 30);
    const pet = Store.petOf(kid.id);
    const proximos = Store.upcomingEvents(kid.id).filter((e) => !e.done).slice(0, 3);
    const ultimos = Store.historyOf(kid.id, 14).slice(0, 6);
    const compras = Store.purchasesOf(kid.id).slice(0, 3);
    const linha = (icone, texto, valor, grad) => `
      <div class="mini-row">
        <span class="em ${grad || 'g7'}" style="width:34px;height:34px;border-radius:12px;display:grid;place-items:center;color:#fff">
          ${Icons.svg(icone)}
        </span>
        <span class="grow small bold" style="text-align:left">${texto}</span>
        <span class="bold small">${valor}</span>
      </div>`;

    UI.openSheet({
      size: 'larga',
      title: kid.name,
      subtitle: `@${kid.username} • ${pet.name} nível ${Pet.level(pet.xp)}`,
      body: `
        <div class="pet-atualiza cartao-filho">
          <div class="pet-atualiza-art">${Pet.svg(kid, 150, 'feliz', { room: true })}</div>
          <div class="pet-atualiza-side">
            <div class="stat-row" style="width:100%">
              <div class="stat"><div class="k">a receber</div><div class="v">${Store.money(bal)}</div></div>
              <div class="stat"><div class="k">na carteira</div><div class="v">${Store.money(caixa.left)}</div></div>
              <div class="stat"><div class="k">aguardando</div><div class="v">${t.pendingCount}</div></div>
            </div>
            <div class="pet-atualiza-tags">
              <span class="chip lime">${Store.duracao(Store.usageToday(kid.id))} no app hoje</span>
              ${st.semFoto ? `<span class="chip warn">${st.semFoto} sem foto</span>` : ''}
            </div>
          </div>
        </div>

        <section class="panel">
          <header class="panel-head"><h3>${Icons.svg('check')} Tarefas de hoje</h3>
            <span class="tiny muted">${st.filled} de ${st.required}</span>
          </header>
          <div class="bar" style="background:var(--surface-2)">
            <i style="width:${st.required ? Math.min(100, (st.filled / st.required) * 100) : 0}%"></i>
          </div>
          <p class="tiny muted mt8">
            ${st.required === 0 ? 'Nenhuma tarefa marcada como obrigatória todo dia.'
              : st.complete ? 'Tudo o que era obrigatório já foi feito hoje.'
              : `Faltam ${st.required - st.filled} tarefa(s) do dia${st.semFoto
                ? `, e ${st.semFoto} marcada(s) ainda estão sem a foto obrigatória` : ''}.`}
          </p>
          <div class="panel-list mt12">
            ${linha('coins', 'Validado no mês', Store.money(t.approved), 'g3')}
            ${linha('clock', 'Aguardando validação', Store.money(t.pending), 'g2')}
            ${linha('basket', 'Já gastou', Store.money(caixa.spent), 'g5')}
          </div>
        </section>

        <section class="panel">
          <header class="panel-head"><h3>${Icons.svg('chart')} Tempo e estudo</h3>
            <span class="tiny muted">últimos 7 dias</span>
          </header>
          <div class="stat-row">
            <div class="stat"><div class="k">no app</div><div class="v">${Store.duracao(uso.total)}</div></div>
            <div class="stat"><div class="k">joguinhos</div><div class="v">${Store.duracao(uso.jogos)}</div></div>
            <div class="stat"><div class="k">estudando</div><div class="v">${Store.duracao(uso.estudo)}</div></div>
          </div>
          <p class="tiny muted mt8">
            ${estudo.quizzes
              ? `${estudo.quizzes} quiz(zes) e prova(s) no mês, com ${Math.round(estudo.aproveitamento)}% de acerto.`
              : 'Nenhum quiz ou prova feito no último mês.'}
          </p>
          <button class="btn btn-ghost btn-sm btn-block mt12" data-a="tempo">
            ${Icons.svg('clock')} Ver o tempo de uso completo
          </button>
        </section>

        ${proximos.length ? `
          <section class="panel">
            <header class="panel-head"><h3>${Icons.svg('calendar')} Próximos compromissos</h3></header>
            <div class="panel-list">
              ${proximos.map((e) => {
                const k = Store.eventKind(e.kind);
                return linha(k.icon, UI.esc(e.title), Store.labelDate(e.date), k.grad);
              }).join('')}
            </div>
          </section>` : ''}

        ${ultimos.length ? `
          <section class="panel">
            <header class="panel-head"><h3>${Icons.svg('star')} Últimos lançamentos</h3></header>
            <div class="panel-list">
              ${ultimos.map((e) => linha(e.icon || 'star', UI.esc(e.name),
                `${e.kind === 'penalty' ? '-' : '+'}${Store.money(e.value).replace('R$ ', '')}`,
                e.grad || 'g7')).join('')}
            </div>
          </section>` : ''}

        ${compras.length ? `
          <section class="panel">
            <header class="panel-head"><h3>${Icons.svg('basket')} Últimos gastos</h3></header>
            <div class="panel-list">
              ${compras.map((c) => {
                const k = Store.purchaseKind(c.kind);
                return linha(k.icon, UI.esc(c.title), '-' + Store.money(c.value).replace('R$ ', ''), k.grad);
              }).join('')}
            </div>
          </section>` : ''}

        <div class="section-title"><h3>O que dá para fazer</h3></div>
        <div class="list">
          <button class="mini-row" data-a="pay">${Icons.svg('banknote')}<span class="grow bold small" style="text-align:left">Pagamentos e comprovantes</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="gastos">${Icons.svg('coins')}<span class="grow bold small" style="text-align:left">Gastos do filho(a)</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="manual">${Icons.svg('coins')}<span class="grow bold small" style="text-align:left">Lançamento avulso (bônus ou desconto)</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="photo">${Icons.svg('camera')}<span class="grow bold small" style="text-align:left">Foto do perfil</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="diary">${Icons.svg('book')}<span class="grow bold small" style="text-align:left">Ver diário de livros e lições</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="history">${Icons.svg('chart')}<span class="grow bold small" style="text-align:left">Ver histórico</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="edit">${Icons.svg('pencil')}<span class="grow bold small" style="text-align:left">Editar dados e meta</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-a="del"><span style="color:var(--bad);display:grid">${Icons.svg('trash')}</span><span class="grow bold small" style="text-align:left;color:var(--bad)">Excluir filho(a)</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', async () => {
          const a = b.getAttribute('data-a');
          UI.closeSheet();
          if (a === 'pay') return openPayouts(kid);
          if (a === 'gastos') return openPurchases(kid);
          if (a === 'manual') return openManualEntry(kid, Store.currentUser() && Store.currentUser().id);
          if (a === 'photo') return App.openProfilePhoto(kid);
          if (a === 'history') return openHistory(kid);
          if (a === 'diary') return openDiary(kid);
          if (a === 'tempo') return openTempo(kid);
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

  function openPayForm(kid, payout) {
    const editing = !!payout;
    const bal = Store.balance(kid.id);
    let picker = null;
    UI.openSheet({
      title: editing ? 'Editar pagamento' : 'Registrar pagamento',
      subtitle: `${kid.name}. Saldo atual ${Store.money(bal)}.`,
      body: `
        <form id="pay-form">
          ${UI.field('Valor pago (R$)', UI.input('amount', {
            type: 'number',
            value: editing ? payout.amount : (bal > 0 ? bal.toFixed(2) : ''),
            attrs: 'min="0" step="0.01"', placeholder: '0,00',
          }))}
          ${UI.field('Observação', UI.input('note', {
            value: editing ? (payout.note || '') : '', placeholder: 'ex.: mesada de agosto (PIX)',
          }))}
          ${UI.field('Data', UI.input('date', { type: 'date', value: editing ? payout.date : Store.today() }))}
          ${UI.photoField('Comprovante (opcional)', editing ? payout.photos : [])}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(payout.id)}" />` : ''}
        </form>
        <div class="note">O valor pago é descontado do saldo disponível e fica registrado no extrato.</div>`,
      actions: `
        ${editing
          ? '<button class="btn btn-ghost" data-del>Excluir</button>'
          : '<button class="btn btn-ghost" data-cancel>Cancelar</button>'}
        <button class="btn btn-primary" data-ok>${editing ? 'Salvar' : 'Registrar'}</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        const cancel = sheet.querySelector('[data-cancel]');
        if (cancel) cancel.addEventListener('click', UI.closeSheet);
        const del = sheet.querySelector('[data-del]');
        if (del) del.addEventListener('click', async () => {
          const ok = await UI.confirm({
            title: 'Excluir este pagamento?',
            text: 'O valor volta para o saldo disponível do(a) filho(a).',
            okLabel: 'Excluir', danger: true,
          });
          if (ok) {
            Store.removePayout(payout.id);
            picker.commit();
            UI.closeSheet();
            UI.toast('Pagamento excluído');
            App.render();
          }
        });
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#pay-form'));
          const res = Store.savePayout(kid.id, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast(editing ? 'Pagamento atualizado' : 'Pagamento registrado', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
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
              ${UI.entryVisual(e, 'width:34px;height:34px;border-radius:12px;display:grid;place-items:center')}
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
    let picker = null;
    UI.openSheet({
      title: editing ? 'Editar categoria' : 'Nova categoria',
      body: `
        <form id="cat-form">
          ${UI.field('Nome', UI.input('name', { value: editing ? cat.name : '', placeholder: 'ex.: Estudos' }))}
          ${UI.iconPicker('icon', editing ? cat.icon : 'star')}
          ${UI.gradPicker('grad', editing ? cat.grad : 'g1')}
          <div class="mini-row">
            <div class="grow">
              <div class="small bold">Esta é a parte de leitura</div>
              <div class="tiny muted">as ações novas já nascem pedindo o resumo e as páginas grifadas</div>
            </div>
            <button type="button" class="switch" data-switch="leitura"
                    aria-pressed="${editing ? !!cat.leitura : false}" aria-label="Esta é a parte de leitura"></button>
          </div>
          ${UI.photoField('Foto de capa (opcional)', editing && cat.photo ? [cat.photo] : [])}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(cat.id)}" />` : ''}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        UI.bindPickers(sheet);
        UI.bindSwitches(sheet);
        picker = UI.bindPhotos(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#cat-form'));
          const res = Store.saveCategory(data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          UI.closeSheet();
          UI.toast('Categoria salva', 'ok');
          App.render();
        });
      },
      onClose() { if (picker) picker.discard(); },
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
          <div class="mini-row">
            <div class="grow">
              <div class="small bold">Pedir a ficha de leitura</div>
              <div class="tiny muted">resumo do capítulo, grifar a lápis e a foto de cada página grifada</div>
            </div>
            <button type="button" class="switch" data-switch="ficha"
                    aria-pressed="${editing ? !!item.ficha : !!(Store.categoryById(catId) || {}).leitura}"
                    aria-label="Pedir a ficha de leitura"></button>
          </div>
          ${editing ? '' : `
            <div class="dois-campos">
              ${UI.field('Vezes por mês', UI.input('vezesMes', {
                type: 'number', value: 8, attrs: `min="1" max="${Store.DIAS_MES}" step="1"`,
              }))}
              ${UI.field('Esforço (1 a 10)', UI.input('esforco', {
                type: 'number', value: 1, attrs: 'min="1" max="10" step="1"',
              }))}
            </div>`}
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

  /* =========================================================
     Planejador da mesada.

     A mãe diz quanto vale a mesada no mês. O app divide esse valor
     entre as partes pelo peso de cada uma (a leitura tem o maior) e
     mostra, ação por ação, o que o filho precisa fazer para fechar.
     ========================================================= */
  function openMesada(kidInicial) {
    const kids = Store.children();
    if (!kids.length) return UI.toast('Cadastre um filho(a) primeiro', 'bad');

    let kid = kidInicial && kids.find((k) => k.id === kidInicial.id) ? kidInicial : kids[0];
    let mesada = Store.allowanceOf(kid.id) || 100;
    const pesos = {};
    const vezes = {};
    const esforcos = {};
    let aberta = null;   // categoria com os detalhes abertos

    const opcoes = () => ({ mesada, pesos, vezes, esforcos });
    const plano = () => Store.planoMesada(kid.id, opcoes());

    const NIVEIS = [
      { v: 1, rot: 'pouco' }, { v: 2, rot: 'normal' }, { v: 3, rot: 'bastante' },
      { v: 4, rot: 'muito' }, { v: 5, rot: 'o que mais vale' },
    ];

    function resumoHtml(pl) {
      const perto = Math.abs(pl.diferenca) < 0.06;
      return `
        <section class="hero mesada-hero">
          <div class="hero-top">
            <div class="hero-ico">${Icons.svg('banknote')}</div>
            <div class="grow">
              <div class="label">Fazendo tudo o que foi combinado</div>
              <div class="value">${Store.money(pl.total)}<small style="margin-left:6px">no mês</small></div>
            </div>
          </div>
          <div class="bar mt16"><i style="width:${Math.min(100, pl.mesada ? (pl.total / pl.mesada) * 100 : 0)}%"></i></div>
          <p class="tiny mt8" style="color:var(--panel-muted);line-height:1.6">
            ${perto
              ? `Fecha certinho nos ${Store.money(pl.mesada)} combinados.`
              : `A mesada combinada é ${Store.money(pl.mesada)}. A diferença de ${Store.money(Math.abs(pl.diferenca))} é do arredondamento dos centavos.`}
            A leitura leva ${Store.money(pl.leitura)}, ou ${pl.leituraPct}% do total.
          </p>
        </section>`;
    }

    function fatiasHtml(pl) {
      return `
        <div class="section-title mt16"><h3>Como o dinheiro se divide</h3></div>
        <div class="mesada-fatias">
          ${pl.categorias.map((c) => `
            <div class="mesada-fatia">
              <span class="em ${c.grad}" style="width:34px;height:34px;border-radius:12px;display:grid;place-items:center">${Icons.svg(c.icon)}</span>
              <div class="grow">
                <div class="small bold">${UI.esc(c.name)}${c.leitura ? ' <span class="chip lime tiny">a que mais vale</span>' : ''}</div>
                <div class="barrinha"><i class="${c.grad}" style="width:${c.pct}%"></i></div>
              </div>
              <div class="mesada-fatia-val">
                <div class="small bold">${Store.money(c.noMes)}</div>
                <div class="tiny muted">${c.pct}%</div>
              </div>
            </div>`).join('')}
        </div>`;
    }

    function pesosHtml(pl) {
      return `
        <div class="section-title mt16"><h3>O que vale mais</h3></div>
        <p class="small muted" style="line-height:1.6;padding:0 2px">
          Quanto maior o peso, maior a fatia da mesada que vai para aquela parte.
        </p>
        <div class="list mt12">
          ${pl.categorias.map((c) => `
            <div class="card mesada-cat">
              <div class="between">
                <div class="row">
                  <span class="em ${c.grad}" style="width:38px;height:38px;border-radius:13px;display:grid;place-items:center">${Icons.svg(c.icon)}</span>
                  <div>
                    <div class="bold small">${UI.esc(c.name)}</div>
                    <div class="tiny muted">${Store.money(c.noMes)} no mês</div>
                  </div>
                </div>
                <button class="btn btn-soft btn-sm" data-abrir="${c.id}">
                  ${aberta === c.id ? 'Fechar' : 'Ver ações'}
                </button>
              </div>
              <div class="seg-mini mt12" data-peso-grupo="${c.id}">
                ${NIVEIS.map((n) => `
                  <button type="button" data-peso="${c.id}:${n.v}" aria-pressed="${c.peso === n.v}">${n.rot}</button>`).join('')}
              </div>
              ${aberta === c.id ? `
                <div class="list mt12">
                  ${c.itens.map((i) => `
                    <div class="mesada-item">
                      <div class="grow">
                        <div class="small bold">${UI.esc(i.name)}</div>
                        <div class="tiny muted">
                          ${i.kind === 'penalty'
                            ? `desconto de ${Store.money(i.valor)}`
                            : `${Store.money(i.valor)} por vez, ${i.vezesMes}x no mês = <b>${Store.money(i.noMes)}</b>`}
                        </div>
                      </div>
                      ${i.kind === 'penalty' ? '' : `
                        <label class="mesada-campo">
                          <span class="tiny muted">vezes</span>
                          <input type="number" min="1" max="${Store.DIAS_MES}" step="1"
                                 value="${i.vezesMes}" data-vezes="${i.id}"
                                 ${i.daily ? 'disabled title="ação de todo dia"' : ''} />
                        </label>
                        <label class="mesada-campo">
                          <span class="tiny muted">esforço</span>
                          <input type="number" min="1" max="10" step="1" value="${i.esforco}" data-esforco="${i.id}" />
                        </label>`}
                    </div>`).join('')}
                </div>` : ''}
            </div>`).join('')}
        </div>`;
    }

    function corpo() {
      const pl = plano();
      return `
        ${kids.length > 1 ? `
          <div class="seg-mini" data-kid-grupo>
            ${kids.map((k) => `<button type="button" data-kid="${k.id}" aria-pressed="${k.id === kid.id}">${UI.esc(k.name)}</button>`).join('')}
          </div>` : ''}
        <div class="field mt12">
          <label>Quanto ${UI.esc(kid.name)} recebe por mês</label>
          <div class="mesada-valor">
            <span class="prefixo">R$</span>
            <input class="input" type="number" min="1" step="1" value="${mesada}" data-mesada
                   inputmode="decimal" aria-label="Valor da mesada por mês" />
          </div>
          <p class="tiny muted mt8" style="line-height:1.5">
            O mês de conta tem ${Store.DIAS_MES} dias. As ações e os valores são os mesmos para todos os filhos.
          </p>
        </div>
        ${resumoHtml(pl)}
        ${fatiasHtml(pl)}
        ${pesosHtml(pl)}`;
    }

    function montar(sheet) {
      const corpoEl = sheet.querySelector('.sheet-body');
      const redesenhar = () => {
        const rolagem = corpoEl.scrollTop;
        corpoEl.innerHTML = corpo();
        corpoEl.scrollTop = rolagem;
        ligar(sheet);
      };
      sheet._redesenhar = redesenhar;
      ligar(sheet);
    }

    function ligar(sheet) {
      const redesenhar = sheet._redesenhar || (() => {});

      sheet.querySelectorAll('[data-kid]').forEach((b) => b.addEventListener('click', () => {
        kid = kids.find((k) => k.id === b.getAttribute('data-kid')) || kid;
        mesada = Store.allowanceOf(kid.id) || mesada;
        redesenhar();
      }));

      const campo = sheet.querySelector('[data-mesada]');
      if (campo) {
        let relogio = null;
        campo.addEventListener('input', () => {
          clearTimeout(relogio);
          relogio = setTimeout(() => {
            const v = Math.abs(Number(String(campo.value).replace(',', '.'))) || 0;
            if (!v) return;
            mesada = v;
            const foco = document.activeElement === campo;
            redesenhar();
            // campo de número não aceita mexer no cursor, então só devolve o foco
            if (foco) {
              const novo = sheet.querySelector('[data-mesada]');
              if (novo) novo.focus();
            }
          }, 450);
        });
      }

      sheet.querySelectorAll('[data-peso]').forEach((b) => b.addEventListener('click', () => {
        const [catId, valor] = b.getAttribute('data-peso').split(':');
        pesos[catId] = Number(valor);
        redesenhar();
      }));

      sheet.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => {
        const id = b.getAttribute('data-abrir');
        aberta = aberta === id ? null : id;
        redesenhar();
      }));

      sheet.querySelectorAll('[data-vezes]').forEach((el) => el.addEventListener('change', () => {
        vezes[el.getAttribute('data-vezes')] = el.value;
        redesenhar();
      }));
      sheet.querySelectorAll('[data-esforco]').forEach((el) => el.addEventListener('change', () => {
        esforcos[el.getAttribute('data-esforco')] = el.value;
        redesenhar();
      }));
    }

    UI.openSheet({
      title: 'Planejador da mesada',
      subtitle: 'Diga o valor do mês e o app divide entre as ações',
      size: 'larga',
      body: corpo(),
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-aplicar>Aplicar na mesada</button>`,
      onMount(sheet) {
        montar(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-aplicar]').addEventListener('click', async () => {
          const pl = plano();
          const ok = await UI.confirm({
            title: `Valer ${Store.money(pl.mesada)} por mês?`,
            text: `Os valores de todas as ${pl.categorias.reduce((n, c) => n + c.itens.length, 0)} ações vão ser trocados. `
              + `Fazendo tudo, ${kid.name} fecha o mês em ${Store.money(pl.total)}, sendo ${Store.money(pl.leitura)} de leitura. `
              + 'Os lançamentos que já foram feitos continuam com o valor antigo.',
            okLabel: 'Aplicar',
          });
          if (!ok) return;
          const res = Store.aplicarPlano(kid.id, opcoes());
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast('Mesada dividida entre as ações', 'ok');
          Effects.burst('goal');
          App.render();
          return undefined;
        });
      },
    });
    return undefined;
  }

  /** a cor de cada gradiente, para pintar as bolinhas */
  const COR = {
    g1: '#a98cff', g2: '#ffa24b', g3: '#79e3b5', g4: '#3b4fe4',
    g5: '#ff8fc8', g6: '#6fd3ff', g7: '#ffd84b', g8: '#d6f154',
  };
  const corDe = (grad) => COR[grad] || COR.g7;

  /**
   * Bolinhas em volta do botão de mais: as ações rápidas do responsável.
   * "Nova ação" abre um segundo leque com as categorias, cada uma na sua cor,
   * para ele criar a subcategoria já dentro dela e com valor.
   */
  function abrirBolinhas(user, ancora) {
    const kids = Store.children();
    const cats = Store.categories();
    const pendentes = Store.pendingEntries().length + Store.pendingDiary().length;

    const escolherFilho = (oQue, acao) => {
      if (!kids.length) return UI.toast('Cadastre um filho(a) primeiro', 'bad');
      if (kids.length === 1) return acao(kids[0]);
      tab = 'filhos';
      App.render();
      UI.toast(`Escolha o filho(a) para ${oQue}`);
    };

    UI.openRadial(ancora, [
      {
        id: 'acao', label: 'Nova ação', icone: 'plus', cor: '#d6f154',
        onClick() {
          if (!cats.length) return openCatForm(null);
          // segundo leque: uma bolinha por categoria, na cor dela
          UI.openRadial(ancora, cats.slice(0, 8).map((c) => ({
            id: c.id, label: c.name, icone: c.icon, cor: corDe(c.grad),
            onClick: () => openItemForm(c.id, null),
          })).concat([{
            id: 'nova-cat', label: 'Nova categoria', icone: 'folder', cor: '#ffffff',
            onClick: () => openCatForm(null),
          }]));
        },
      },
      {
        id: 'mesada', label: 'Mesada', icone: 'banknote', cor: '#d6f154',
        onClick: () => escolherFilho('dividir a mesada', (k) => openMesada(k)),
      },
      { id: 'cat', label: 'Categoria', icone: 'folder', cor: '#a98cff', onClick: () => openCatForm(null) },
      { id: 'filho', label: 'Filho', icone: 'users', cor: '#6fd3ff', onClick: () => openChildForm(null) },
      {
        id: 'pagar', label: 'Pagar', icone: 'wallet', cor: '#79e3b5',
        onClick: () => escolherFilho('registrar o pagamento', (k) => openPayouts(k)),
      },
      {
        id: 'ajuste', label: 'Bônus', icone: 'coins', cor: '#ffa24b',
        onClick: () => escolherFilho('o lançamento', (k) => openManualEntry(k, user.id)),
      },
      {
        id: 'validar', label: pendentes ? `Validar ${pendentes}` : 'Validar', icone: 'check', cor: '#ff8fc8',
        onClick() {
          if (!pendentes) { tab = 'validar'; return App.render(); }
          const ids = Store.pendingEntries().map((e) => e.id);
          const diaryIds = Store.pendingDiary().map((d) => d.id);
          Store.reviewMany(ids, 'approved', user.id);
          diaryIds.forEach((id) => Store.reviewDiary(id, 'approved', '', user.id));
          UI.toast(`${ids.length + diaryIds.length} item(ns) validado(s)`, 'ok');
          Effects.burst('approved');
          App.render();
        },
      },
    ]);
  }


  /**
   * O aviso que chega no celular de quem confirma quando a filha manda as
   * tarefas. Sem servidor nada sai daqui sozinho, então o que o app faz é
   * abrir o WhatsApp no celular dela com o recado já escrito. Aqui a mãe
   * diz para qual número.
   */
  function openAviso(user) {
    const a = Store.avisoOf();
    const kids = Store.children();
    // o exemplo mostra o recado de verdade quando há algo esperando hoje;
    // senão mostra um de mentirinha, para ela ver o formato
    const real = kids.length ? Notify.recadoEnvio(kids[0], Store.today()) : null;
    const primeiro = kids.length ? String(kids[0].name).split(' ')[0] : 'Mariana';
    const exemplo = real && real.quantos ? real : {
      texto: [
        `${primeiro} mandou 3 tarefas para você confirmar (hoje):`, '',
        '\u2022 Ler 20 minutos', '\u2022 Arrumar a cama', '\u2022 Terminar um capítulo', '',
        'Total: R$ 12,50',
        'Tem leitura com resumo e fotos das páginas.', '',
        'Abra o app para validar.',
      ].join('\n'),
    };

    UI.openSheet({
      title: 'Avisar quando ela enviar',
      subtitle: 'o recado chega no seu celular',
      size: 'larga',
      body: `
        <form id="aviso-form">
          <div class="mini-row">
            <div class="grow">
              <div class="small bold">Ligar o aviso</div>
              <div class="tiny muted">quando ela toca em "Enviar para validação"</div>
            </div>
            <button type="button" class="switch" data-switch="on"
                    aria-pressed="${!!a.on}" aria-label="Ligar o aviso"></button>
          </div>

          <div class="seg-mini mt12" role="group" aria-label="Por onde chega o recado">
            <button type="button" data-canal="whatsapp" aria-pressed="${a.canal !== 'sms'}">WhatsApp</button>
            <button type="button" data-canal="sms" aria-pressed="${a.canal === 'sms'}">Mensagem (SMS)</button>
          </div>

          ${UI.field('Seu número, com DDD', UI.input('numero', {
            type: 'tel', value: a.numero ? a.numero.replace(/^55/, '') : '',
            placeholder: '11 91234-5678',
            attrs: 'inputmode="tel" autocomplete="tel"',
          }))}
        </form>

        <div class="note">
          <b>Como funciona, sem enrolação:</b> o app não tem servidor, então
          nada sai daqui sozinho para outro celular. O que acontece é que o
          celular <b>dela</b> abre o WhatsApp com o recado já escrito e ela
          toca em enviar. Chega no seu celular como qualquer mensagem dela.
        </div>
        <p class="tiny muted mt8">
          Se vocês usam o <b>mesmo aparelho</b>, o aviso também aparece
          sozinho na tela, sem precisar de WhatsApp nenhum.
        </p>

        <div class="note mt12" style="white-space:pre-wrap">${UI.esc(exemplo.texto)}</div>
        <p class="tiny muted mt8 center">é mais ou menos assim que o recado chega</p>`,
      actions: `
        <button class="btn btn-ghost" data-testar>Testar agora</button>
        <button class="btn btn-primary" data-ok>Salvar</button>`,
      onMount(sheet) {
        UI.bindSwitches(sheet);
        let canal = a.canal === 'sms' ? 'sms' : 'whatsapp';
        sheet.querySelectorAll('[data-canal]').forEach((b2) => b2.addEventListener('click', () => {
          canal = b2.getAttribute('data-canal');
          sheet.querySelectorAll('[data-canal]').forEach((o) =>
            o.setAttribute('aria-pressed', String(o === b2)));
        }));

        const lido = () => {
          const dados = UI.formData(sheet.querySelector('#aviso-form'));
          return { on: dados.on, canal, numero: dados.numero };
        };

        sheet.querySelector('[data-testar]').addEventListener('click', () => {
          const d = lido();
          const limpo = Store.numeroLimpo(d.numero);
          if (!limpo || limpo.length < 12) return UI.toast('Escreva o número com o DDD primeiro.', 'bad');
          Store.setAviso(d);
          const texto = `Teste do app Minha Mesada: é assim que o aviso vai chegar quando ${
            kids.length ? String(kids[0].name).split(' ')[0] : 'ela'} mandar as tarefas para você confirmar.`;
          window.open(Notify.linkAviso(texto), '_blank', 'noopener');
        });

        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const d = lido();
          const limpo = Store.numeroLimpo(d.numero);
          if (d.on && (!limpo || limpo.length < 12))
            return UI.toast('Para ligar o aviso, escreva o número com o DDD.', 'bad');
          Store.setAviso(d);
          UI.closeSheet();
          UI.toast(d.on ? 'Aviso ligado' : 'Aviso desligado', 'ok');
          App.render();
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
          <button class="mini-row" data-m="aviso">${Icons.svg('bell')}<span class="grow bold small" style="text-align:left">Avisar quando ela enviar</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="theme">${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}<span class="grow bold small" style="text-align:left">Trocar tema</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
          <button class="mini-row" data-m="photo">${Icons.svg('camera')}<span class="grow bold small" style="text-align:left">Minha foto de perfil</span>${Icons.svg('chevron', 'ico-sm dim')}</button>
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
          if (m === 'photo') return App.openProfilePhoto(user);
          if (m === 'aviso') return openAviso(user);
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

  /** agenda com o filtro de filho no topo */
  function agendaView(user, agendaChild) {
    const kids = Store.children();
    const filtro = kids.length > 1 ? `
      <div class="seg-mini" role="group" aria-label="Filtrar por filho">
        <button data-kid-filter="all" aria-pressed="${childFilter === 'all'}">Todos</button>
        ${kids.map((k) => `
          <button data-kid-filter="${k.id}" aria-pressed="${childFilter === k.id}">${UI.esc(k.name.split(' ')[0])}</button>`).join('')}
      </div>` : '';
    return filtro + Agenda.view(user, agendaChild, true);
  }

  /* ---------- painéis da coluna lateral ---------- */
  function filhosPanel() {
    const kids = Store.children();
    if (!kids.length) return '';
    return UI.panel('Filhos', 'users', `
      <div class="panel-list">
        ${kids.map((k) => {
          const t = Store.totals(k.id, Store.monthOf(Store.today()));
          return `
            <button class="up-row" data-kid="${k.id}">
              ${UI.avatar(k, '', 'width:34px;height:34px;font-size:14px;border-radius:12px')}
              <span class="grow">
                <span class="bold small block">${UI.esc(k.name)}</span>
                <span class="tiny muted block">${t.pendingCount} aguardando</span>
              </span>
              <span class="bold small">${Store.money(Store.balance(k.id))}</span>
            </button>`;
        }).join('')}
      </div>`, '<button class="link" data-new-child>+ novo</button>');
  }

  /* ---------- render ---------- */
  const PAGES = {
    validar: { title: 'Validar', subtitle: 'Confira o que os filhos marcaram e aprove' },
    filhos: { title: 'Filhos', subtitle: 'Acessos, metas, pagamentos e ajustes' },
    agenda: { title: 'Agenda', subtitle: 'Provas, trabalhos e eventos da família' },
    categorias: { title: 'Ações da mesada', subtitle: 'Categorias, valores e descontos' },
    relatorio: { title: 'Relatório', subtitle: 'Como está o mês de cada filho' },
    relatorioTempo: { title: 'Relatório', subtitle: 'Quanto tempo cada filho usa o app' },
  };

  function render(root, user) {
    const page = (tab === 'relatorio' && relTab === 'tempo' ? PAGES.relatorioTempo : PAGES[tab]) || PAGES.validar;
    const pend = Store.pendingEntries().length + Store.pendingDiary().length;
    const proximos = Store.upcomingEvents(null).filter((e) => !e.done).length;
    const agendaChild = childFilter === 'all' ? null : childFilter;

    const main = tab === 'validar' ? validarView()
      : tab === 'filhos' ? filhosView()
      : tab === 'agenda' ? agendaView(user, agendaChild)
      : tab === 'categorias' ? categoriasView()
      : relatorioView();

    const aside = tab === 'agenda' ? ''
      : `${filhosPanel()}${Agenda.upcoming(null, true)}`;

    const actions = tab === 'agenda'
      ? `<button class="btn btn-primary btn-sm" data-new-event>${Icons.svg('plus')} Compromisso</button>`
      : tab === 'filhos'
        ? `<button class="btn btn-primary btn-sm" data-new-child>${Icons.svg('plus')} Filho(a)</button>`
        : tab === 'categorias'
          ? `<button class="btn btn-primary btn-sm" data-new-cat>${Icons.svg('plus')} Categoria</button>`
          : '';

    root.innerHTML = UI.shell({
      user,
      roleLabel: 'Responsável',
      tab,
      title: page.title,
      subtitle: page.subtitle,
      actions,
      main,
      aside,
      fab: tab === 'agenda' ? { icon: 'plus', label: 'Novo compromisso' } : { icon: 'plus', label: 'Ações rápidas' },
      nav: [
        { id: 'validar', label: 'Validar', icon: 'check', count: pend },
        { id: 'filhos', label: 'Filhos', icon: 'users' },
        { id: 'agenda', label: 'Agenda', icon: 'calendar', count: proximos },
        { id: 'categorias', label: 'Ações', icon: 'folder' },
        { id: 'relatorio', label: 'Relatório', icon: 'trending' },
      ],
    });

    const rerender = () => render(root, user);

    UI.bindShell(root, {
      onTab(id) { tab = id; rerender(); },
      onMenu() { openMenu(user); },
      onFab() {
        if (tab === 'agenda') return Agenda.openForm(user, null, { date: Agenda.selectedDate() });
        const botao = root.querySelector('[data-fab]');
        return abrirBolinhas(user, botao);
      },
    });
    Agenda.bind(root, user, rerender);

    root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      tab = b.getAttribute('data-go'); rerender();
    }));
    root.querySelectorAll('[data-goto-agenda]').forEach((b) => b.addEventListener('click', () => {
      tab = 'agenda'; rerender();
    }));
    root.querySelectorAll('[data-kid-filter]').forEach((b) => b.addEventListener('click', () => {
      childFilter = b.getAttribute('data-kid-filter'); rerender();
    }));
    root.querySelectorAll('[data-ligar-aviso]').forEach((b) => b.addEventListener('click', () => {
      openAviso(user);
    }));
    root.querySelectorAll('[data-approve]').forEach((b) => b.addEventListener('click', () => {
      Store.review(b.getAttribute('data-approve'), 'approved', '', user.id);
      UI.toast('Validado', 'ok');
      Effects.burst('approved', b);
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
    root.querySelectorAll('[data-toggle-photo]').forEach((b) => b.addEventListener('click', () => {
      const novo = !Store.photoRequired();
      Store.setPhotoRequired(novo);
      UI.toast(novo ? 'Foto passou a ser obrigatória nas tarefas de todo dia'
        : 'Foto deixou de ser obrigatória');
      App.render();
    }));
    root.querySelectorAll('[data-rel-tab]').forEach((b) => b.addEventListener('click', () => {
      relTab = b.getAttribute('data-rel-tab');
      App.render();
    }));
    root.querySelectorAll('[data-tempo]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-tempo'));
      if (kid) openTempo(kid);
    }));
    root.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-pay'));
      if (kid) openPayouts(kid);
    }));
    root.querySelectorAll('[data-manual]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-manual'));
      if (kid) openManualEntry(kid, user.id);
    }));
    root.querySelectorAll('[data-adjust]').forEach((b) =>
      b.addEventListener('click', () => openAdjust(b.getAttribute('data-adjust'))));
    root.querySelectorAll('[data-history]').forEach((b) => b.addEventListener('click', () => {
      const kid = Store.userById(b.getAttribute('data-history'));
      if (kid) openHistory(kid);
    }));
    root.querySelectorAll('[data-new-child]').forEach((b) =>
      b.addEventListener('click', () => openChildForm(null)));
    root.querySelectorAll('[data-mesada-kid]').forEach((b) => b.addEventListener('click', () => {
      const k = Store.children().find((x) => x.id === b.getAttribute('data-mesada-kid'));
      if (k) openMesada(k);
    }));
    root.querySelectorAll('[data-new-cat]').forEach((b) =>
      b.addEventListener('click', () => openCatForm(null)));
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
  }

  return {
    render,
    reset() {
      tab = 'validar';
      childFilter = 'all';
      Agenda.reset();
    },
  };
})();

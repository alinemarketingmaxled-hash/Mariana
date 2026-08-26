/* =========================================================
   agenda.js: calendário de provas, trabalhos e eventos.
   A mesma tela serve para o filho e para o responsável; muda
   apenas de quem são os compromissos que aparecem.
   ========================================================= */
const Agenda = (() => {
  let month = Store.monthOf(Store.today());
  let selected = Store.today();
  let kindFilter = 'all';

  const shiftMonth = (ym, delta) => {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  /** dias mostrados na grade: começa no domingo da primeira semana */
  function monthGrid(ym) {
    const [y, m] = ym.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const start = new Date(y, m - 1, 1 - first.getDay());
    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      days.push({ iso: Store.toISO(d), inMonth: d.getMonth() === m - 1, day: d.getDate() });
      if (i >= 34 && Store.toISO(d) >= `${ym}-31`) break;
    }
    return days;
  }

  const chipFor = (ev) => {
    const kind = Store.eventKind(ev.kind);
    return `<span class="cal-chip ${kind.grad} ${ev.done ? 'done' : ''}">${UI.esc(ev.title)}</span>`;
  };

  /* ---------- grade do mês ---------- */
  function calendar(childId) {
    const days = monthGrid(month);
    const list = Store.eventsOf(childId, kindFilter);
    const byDay = {};
    list.forEach((e) => { (byDay[e.date] = byDay[e.date] || []).push(e); });

    return `
      <section class="card cal-card">
        <div class="cal-head">
          <button class="icon-btn sm" data-month="-1" aria-label="Mês anterior">${Icons.svg('chevron', 'flip')}</button>
          <h3>${Store.labelMonth(month)}</h3>
          <button class="icon-btn sm" data-month="1" aria-label="Próximo mês">${Icons.svg('chevron')}</button>
          <button class="btn btn-soft btn-sm" data-month="0">Hoje</button>
        </div>
        <div class="cal-week">
          ${Store.WEEKDAYS.map((w) => `<span>${w}</span>`).join('')}
        </div>
        <div class="cal-grid">
          ${days.map((d) => {
            const evs = byDay[d.iso] || [];
            const classes = [
              'cal-day',
              d.inMonth ? '' : 'out',
              d.iso === Store.today() ? 'today' : '',
              d.iso === selected ? 'sel' : '',
            ].filter(Boolean).join(' ');
            return `
              <button class="${classes}" data-day="${d.iso}">
                <span class="n">${d.day}</span>
                <span class="evs">
                  ${evs.slice(0, 2).map(chipFor).join('')}
                  ${evs.length > 2 ? `<span class="cal-more">+${evs.length - 2}</span>` : ''}
                </span>
              </button>`;
          }).join('')}
        </div>
      </section>`;
  }

  /* ---------- lista de um dia ---------- */
  function dayList(childId, showWho) {
    const evs = Store.eventsOfDay(childId, selected);
    return `
      <div class="section-title">
        <h3>${Store.labelDate(selected)}</h3>
        <button class="link" data-new-event>+ compromisso</button>
      </div>
      ${evs.length
        ? `<div class="list">${evs.map((e) => eventCard(e, showWho)).join('')}</div>`
        : UI.empty('calendar', 'Nada marcado nesse dia. Toque em “+ compromisso” para incluir uma prova, um trabalho ou um evento.')}`;
  }

  function eventCard(ev, showWho) {
    const kind = Store.eventKind(ev.kind);
    const kid = Store.userById(ev.childId);
    const falta = Store.daysUntil(ev.date);
    const prazo = ev.done ? 'concluído'
      : falta === 0 ? 'é hoje'
      : falta === 1 ? 'é amanhã'
      : falta > 0 ? `faltam ${falta} dias`
      : `há ${Math.abs(falta)} dia${Math.abs(falta) === 1 ? '' : 's'}`;
    return `
      <article class="event ${ev.done ? 'done' : ''}">
        <div class="row">
          <span class="em ${kind.grad}" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center">
            ${Icons.svg(kind.icon)}
          </span>
          <div class="grow">
            <div class="nm bold">${UI.esc(ev.title)}</div>
            <div class="mt small muted">
              <span class="chip neutral">${UI.esc(kind.label)}</span>
              <span>${[
                Store.labelDate(ev.date),
                ev.time ? `às ${ev.time}` : '',
                ev.place || '',
              ].filter(Boolean).map(UI.esc).join(' • ')}</span>
            </div>
          </div>
          <span class="chip ${ev.done ? 'approved' : (falta < 0 ? 'rejected' : (falta <= 2 ? 'pending' : 'neutral'))}">${prazo}</span>
        </div>
        ${ev.notes ? `<p class="diary-text">${UI.esc(ev.notes)}</p>` : ''}
        ${UI.photoStrip(ev.photos, 'small-thumbs')}
        <div class="mt small muted">
          ${showWho && kid ? `De ${UI.esc(kid.name.split(' ')[0])} • ` : ''}
          anotado por ${UI.esc(ev.createdByName || (ev.createdByRole === 'child' ? 'filho(a)' : 'responsável'))}
        </div>
        <div class="row" style="gap:9px">
          <button class="btn btn-ghost btn-sm grow" data-event-done="${ev.id}">
            ${Icons.svg('check')} ${ev.done ? 'Reabrir' : 'Concluir'}
          </button>
          <button class="btn btn-ghost btn-sm grow" data-event-edit="${ev.id}">${Icons.svg('pencil')} Editar</button>
        </div>
      </article>`;
  }

  /* ---------- o que vem pela frente (coluna lateral) ---------- */
  function upcoming(childId, showWho, limit = 5) {
    const list = Store.upcomingEvents(childId).filter((e) => !e.done).slice(0, limit);
    return `
      <section class="panel">
        <header class="panel-head">
          <h3>${Icons.svg('calendar')} Próximos compromissos</h3>
          <button class="link" data-goto-agenda>ver agenda</button>
        </header>
        ${list.length ? `<div class="panel-list">
          ${list.map((ev) => {
            const kind = Store.eventKind(ev.kind);
            const kid = Store.userById(ev.childId);
            const falta = Store.daysUntil(ev.date);
            return `
              <button class="up-row" data-event-edit="${ev.id}">
                <span class="em ${kind.grad}" style="width:34px;height:34px;border-radius:12px;display:grid;place-items:center">
                  ${Icons.svg(kind.icon)}
                </span>
                <span class="grow">
                  <span class="bold small block">${UI.esc(ev.title)}</span>
                  <span class="tiny muted block">
                    ${UI.esc(kind.label)} • ${UI.esc(Store.labelDate(ev.date))}${ev.time ? ' às ' + UI.esc(ev.time) : ''}
                    ${showWho && kid ? ' • ' + UI.esc(kid.name.split(' ')[0]) : ''}
                  </span>
                </span>
                <span class="chip ${falta < 0 ? 'rejected' : (falta <= 2 ? 'pending' : 'neutral')}">
                  ${falta === 0 ? 'hoje' : falta === 1 ? 'amanhã' : falta > 0 ? falta + 'd' : 'atrasado'}
                </span>
              </button>`;
          }).join('')}
        </div>` : `<p class="panel-empty">Nenhuma prova, trabalho ou evento marcado.</p>`}
      </section>`;
  }

  /* ---------- tela cheia da agenda ---------- */
  function view(user, childId, showWho) {
    const list = Store.eventsOf(childId);
    const abertos = list.filter((e) => !e.done && Store.daysUntil(e.date) >= 0).length;
    const atrasados = list.filter((e) => !e.done && Store.daysUntil(e.date) < 0).length;
    return `
      <div class="stat-row">
        <div class="stat"><div class="k">no mês</div><div class="v">${Store.eventsOfMonth(childId, month).length}</div></div>
        <div class="stat"><div class="k">em aberto</div><div class="v">${abertos}</div></div>
        <div class="stat"><div class="k">atrasados</div><div class="v">${atrasados}</div></div>
      </div>

      <div class="seg-mini mt16" role="group" aria-label="Filtrar por tipo">
        <button data-kind-filter="all" aria-pressed="${kindFilter === 'all'}">Tudo</button>
        ${Store.EVENT_KINDS.map((k) => `
          <button data-kind-filter="${k.id}" aria-pressed="${kindFilter === k.id}">${UI.esc(k.label)}</button>`).join('')}
      </div>

      <div class="mt16">${calendar(childId)}</div>
      ${dayList(childId, showWho)}`;
  }

  /* ---------- formulário ---------- */
  function openForm(user, ev, defaults) {
    const editing = !!ev;
    const kids = Store.children();
    const kind = editing ? ev.kind : 'prova';
    const childId = editing ? ev.childId : (defaults && defaults.childId) || (kids[0] && kids[0].id) || '';
    let picker = null;

    UI.openSheet({
      title: editing ? 'Editar compromisso' : 'Novo compromisso',
      subtitle: 'Provas, trabalhos, aulas e eventos da família',
      body: `
        <form id="event-form">
          <div class="field">
            <label>Tipo</label>
            <div class="seg-mini wrap" data-kind-group>
              ${Store.EVENT_KINDS.map((k) => `
                <button type="button" data-kind="${k.id}" aria-pressed="${kind === k.id}">${UI.esc(k.label)}</button>`).join('')}
            </div>
            <input type="hidden" name="kind" value="${UI.esc(kind)}" />
          </div>
          ${UI.field('O que é', UI.input('title', {
            value: editing ? ev.title : '',
            placeholder: 'ex.: Prova de matemática',
          }))}
          ${kids.length > 1 || user.role === 'parent' ? `
            <div class="field">
              <label>De quem é</label>
              <div class="input-wrap">
                ${Icons.svg('user')}
                <select name="childId">
                  ${kids.map((k) => `<option value="${UI.esc(k.id)}" ${k.id === childId ? 'selected' : ''}>${UI.esc(k.name)}</option>`).join('')}
                </select>
              </div>
            </div>` : `<input type="hidden" name="childId" value="${UI.esc(childId)}" />`}
          <div class="row" style="gap:10px;align-items:stretch">
            <div class="grow">${UI.field('Data', UI.input('date', {
              type: 'date', value: editing ? ev.date : (defaults && defaults.date) || Store.today(),
            }))}</div>
            <div class="grow">${UI.field('Horário', UI.input('time', {
              type: 'time', value: editing ? (ev.time || '') : '',
            }))}</div>
          </div>
          ${UI.field('Onde (opcional)', UI.input('place', {
            value: editing ? (ev.place || '') : '', placeholder: 'ex.: escola, sala 12',
          }))}
          ${UI.field('Detalhes (opcional)', `
            <textarea name="notes" rows="4" placeholder="o que estudar, o que levar, o que precisa entregar">${editing ? UI.esc(ev.notes || '') : ''}</textarea>`)}
          ${UI.photoField('Fotos (opcional)', editing ? ev.photos : [])}
          ${editing ? `<input type="hidden" name="id" value="${UI.esc(ev.id)}" />` : ''}
        </form>`,
      actions: `
        ${editing
          ? '<button class="btn btn-ghost" data-del>Excluir</button>'
          : '<button class="btn btn-ghost" data-cancel>Cancelar</button>'}
        <button class="btn btn-primary" data-save>${editing ? 'Salvar' : 'Marcar na agenda'}</button>`,
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
            title: 'Excluir este compromisso?',
            text: 'Ele some da agenda dos dois, junto com as fotos anexadas.',
            okLabel: 'Excluir', danger: true,
          });
          if (ok) {
            Store.removeEvent(ev.id);
            picker.commit();
            UI.closeSheet();
            UI.toast('Compromisso excluído');
            App.render();
          }
        });
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#event-form'));
          const res = Store.saveEvent(data, user);
          if (!res.ok) return UI.toast(res.error, 'bad');
          picker.commit();
          selected = res.event.date;
          month = Store.monthOf(res.event.date);
          UI.closeSheet();
          UI.toast(editing ? 'Compromisso atualizado' : 'Compromisso marcado', 'ok');
          App.render();
          Effects.burst('event');
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /* ---------- eventos de tela ---------- */
  function bind(root, user, rerender) {
    root.querySelectorAll('[data-month]').forEach((b) => b.addEventListener('click', () => {
      const delta = Number(b.getAttribute('data-month'));
      if (delta === 0) {
        month = Store.monthOf(Store.today());
        selected = Store.today();
      } else {
        month = shiftMonth(month, delta);
      }
      rerender();
    }));
    root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
      selected = b.getAttribute('data-day');
      if (Store.monthOf(selected) !== month) month = Store.monthOf(selected);
      rerender();
    }));
    root.querySelectorAll('[data-kind-filter]').forEach((b) => b.addEventListener('click', () => {
      kindFilter = b.getAttribute('data-kind-filter');
      rerender();
    }));
    root.querySelectorAll('[data-new-event]').forEach((b) => b.addEventListener('click', () =>
      openForm(user, null, { date: selected, childId: user.role === 'child' ? user.id : null })));
    root.querySelectorAll('[data-event-edit]').forEach((b) => b.addEventListener('click', () => {
      const ev = Store.eventById(b.getAttribute('data-event-edit'));
      if (ev) openForm(user, ev);
    }));
    root.querySelectorAll('[data-event-done]').forEach((b) => b.addEventListener('click', () => {
      const ev = Store.toggleEventDone(b.getAttribute('data-event-done'));
      UI.toast(ev && ev.done ? 'Marcado como concluído' : 'Compromisso reaberto');
      if (ev && ev.done) Effects.burst('approved', b);
      App.render();
    }));
  }

  return {
    view, upcoming, bind, openForm,
    selectedDate: () => selected,
    reset() {
      month = Store.monthOf(Store.today());
      selected = Store.today();
      kindFilter = 'all';
    },
  };
})();

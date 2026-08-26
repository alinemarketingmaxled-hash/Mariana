/* =========================================================
   ui.js: helpers de interface (toast, bottom-sheet, ícones)
   ========================================================= */
const UI = (() => {
  const sheetRoot = () => document.getElementById('sheet-root');
  const toastRoot = () => document.getElementById('toast-root');

  /** escapa texto vindo do usuário antes de ir para o innerHTML */
  const esc = (v) =>
    String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ---------- toast ---------- */
  function toast(message, kind = '') {
    const root = toastRoot();
    if (!root) return;
    while (root.children.length >= 2) root.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      setTimeout(() => el.remove(), 260);
    }, 2400);
  }

  /* ---------- bottom sheet ---------- */
  let onCloseHook = null;

  function closeSheet() {
    const root = sheetRoot();
    if (!root) return;
    root.innerHTML = '';
    root.hidden = true;
    document.removeEventListener('keydown', escHandler);
    if (onCloseHook) { const f = onCloseHook; onCloseHook = null; f(); }
  }

  function escHandler(ev) { if (ev.key === 'Escape') closeSheet(); }

  /**
   * openSheet({ title, subtitle, body, actions, onMount, onClose })
   * `body` e `actions` são HTML; `onMount(sheetEl)` conecta os eventos.
   */
  function openSheet({ title = '', subtitle = '', body = '', actions = '', onMount, onClose } = {}) {
    const root = sheetRoot();
    root.hidden = false;
    onCloseHook = onClose || null;
    root.innerHTML = `
      <div class="sheet-bg" data-close></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="grabber"></div>
        <header class="sheet-head">
          <div>
            <h3>${esc(title)}</h3>
            ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
          </div>
          <button class="icon-btn" data-close aria-label="Fechar">${Icons.svg('close')}</button>
        </header>
        <div class="sheet-body">${body}</div>
        ${actions ? `<div class="sheet-actions">${actions}</div>` : ''}
      </section>`;
    root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeSheet));
    document.addEventListener('keydown', escHandler);
    const sheet = root.querySelector('.sheet');
    if (onMount) onMount(sheet);
    Photos.hydrate(sheet);
    bindPhotoViewers(sheet);
    const firstInput = sheet.querySelector('input:not([type=hidden]), textarea');
    if (firstInput && window.matchMedia('(min-width:900px)').matches) firstInput.focus();
    return sheet;
  }

  /** confirmação com visual do app (substitui window.confirm) */
  function confirm({ title, text = '', okLabel = 'Confirmar', danger = false }) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (v) => { if (done) return; done = true; resolve(v); };
      openSheet({
        title,
        body: text ? `<p class="small muted" style="line-height:1.6">${esc(text)}</p>` : '',
        actions: `
          <button class="btn btn-ghost" data-no>Cancelar</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(okLabel)}</button>`,
        onMount(sheet) {
          sheet.querySelector('[data-yes]').addEventListener('click', () => { finish(true); closeSheet(); });
          sheet.querySelector('[data-no]').addEventListener('click', () => { finish(false); closeSheet(); });
        },
        onClose: () => finish(false),
      });
    });
  }

  /* ---------- componentes reutilizáveis ---------- */
  const GRADS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

  const iconPicker = (name, selected) => `
    <div class="field">
      <label>Ícone</label>
      <div class="pick-grid" data-pick="${esc(name)}">
        ${Icons.CATEGORY_ICONS.map((ic) => `
          <button type="button" data-value="${esc(ic)}" aria-pressed="${ic === selected}">${Icons.svg(ic)}</button>`).join('')}
      </div>
      <input type="hidden" name="${esc(name)}" value="${esc(selected || Icons.CATEGORY_ICONS[0])}" />
    </div>`;

  const gradPicker = (name, selected, label = 'Cor') => `
    <div class="field">
      <label>${esc(label)}</label>
      <div class="pick-grid swatches" data-pick="${esc(name)}">
        ${GRADS.map((g) => `<button type="button" class="${g}" data-value="${g}" aria-pressed="${g === selected}" aria-label="Cor ${g.slice(1)}"></button>`).join('')}
      </div>
      <input type="hidden" name="${esc(name)}" value="${esc(selected || 'g1')}" />
    </div>`;

  /** liga os seletores (ícone/cor) dentro de um container */
  function bindPickers(scope) {
    scope.querySelectorAll('[data-pick]').forEach((box) => {
      const field = box.getAttribute('data-pick');
      const input = scope.querySelector(`input[name="${field}"]`);
      box.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-value]');
        if (!btn) return;
        box.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        if (input) input.value = btn.getAttribute('data-value');
      });
    });
  }

  const field = (label, inner) => `
    <div class="field"><label>${esc(label)}</label><div class="input-wrap">${inner}</div></div>`;

  const input = (name, opts = {}) => `
    <input name="${esc(name)}" type="${opts.type || 'text'}" value="${esc(opts.value || '')}"
      placeholder="${esc(opts.placeholder || '')}" ${opts.attrs || ''} />`;

  /** tira de fotos somente leitura; toca para abrir em tela cheia */
  const photoStrip = (ids, cls = '') => {
    const list = (ids || []).filter(Boolean);
    if (!list.length) return '';
    return `<div class="thumbs ${cls}" data-view-photos="${esc(list.join(','))}">
      ${list.map((id, i) => `
        <button type="button" class="thumb" data-index="${i}" aria-label="Ver foto ${i + 1}">
          <img data-photo="${esc(id)}" alt="Foto ${i + 1}" />
        </button>`).join('')}
    </div>`;
  };

  /** liga as tiras de fotos somente leitura dentro de um container */
  function bindPhotoViewers(scope) {
    scope.querySelectorAll('[data-view-photos]').forEach((box) => {
      if (box.dataset.bound) return;
      box.dataset.bound = '1';
      box.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-index]');
        if (!btn) return;
        Photos.view(box.getAttribute('data-view-photos').split(','), Number(btn.getAttribute('data-index')));
      });
    });
  }

  /** campo de fotos para formulários (câmera ou galeria) */
  const photoField = (label, ids = []) => `
    <div class="field">
      <label>${esc(label)}</label>
      <div class="photo-picker" data-photo-picker>
        <div class="thumbs" data-thumbs></div>
        <label class="photo-add">
          <input type="file" accept="image/*" multiple hidden data-file />
          <span class="photo-add-in">Adicionar foto</span>
        </label>
        <p class="tiny muted" data-photo-hint>Até ${Photos.MAX_PER_RECORD} fotos. Elas ficam salvas neste aparelho.</p>
      </div>
      <input type="hidden" name="photos" value="${esc((ids || []).join(','))}" />
    </div>`;

  /**
   * Liga o campo de fotos. Devolve { ids, commit, discard }: as fotos novas
   * só ficam definitivas quando o formulário é salvo (commit).
   */
  function bindPhotos(scope) {
    const box = scope.querySelector('[data-photo-picker]');
    if (!box) return { ids: () => [], commit() {}, discard() {} };

    const hidden = scope.querySelector('input[name="photos"]');
    const thumbs = box.querySelector('[data-thumbs]');
    const file = box.querySelector('[data-file]');
    let ids = (hidden.value ? hidden.value.split(',') : []).filter(Boolean);
    const added = [];
    const removed = [];
    let committed = false;

    function paint() {
      hidden.value = ids.join(',');
      thumbs.innerHTML = ids.map((id, i) => `
        <div class="thumb">
          <img data-photo="${esc(id)}" alt="Foto ${i + 1}" />
          <button type="button" class="thumb-x" data-remove="${esc(id)}" aria-label="Remover foto">
            ${Icons.svg('close')}
          </button>
        </div>`).join('');
      Photos.hydrate(thumbs);
      box.querySelector('.photo-add').classList.toggle('hidden', ids.length >= Photos.MAX_PER_RECORD);
    }

    thumbs.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-remove]');
      if (!btn) return;
      const id = btn.getAttribute('data-remove');
      ids = ids.filter((x) => x !== id);
      (added.includes(id) ? added : removed).push(id);
      paint();
    });

    file.addEventListener('change', async () => {
      const chosen = Array.from(file.files || []);
      file.value = '';
      for (const f of chosen) {
        if (ids.length >= Photos.MAX_PER_RECORD) {
          toast(`Máximo de ${Photos.MAX_PER_RECORD} fotos por registro`, 'bad');
          break;
        }
        try {
          const id = await Photos.save(await Photos.fromFile(f));
          ids.push(id);
          added.push(id);
          paint();
        } catch (err) {
          toast(err.message || 'Não consegui usar essa foto', 'bad');
        }
      }
    });

    paint();

    return {
      ids: () => ids.slice(),
      commit() {
        committed = true;
        Photos.removeMany(removed);   // apaga de vez as que foram tiradas do registro
      },
      discard() {
        if (committed) return;
        Photos.removeMany(added);     // formulário cancelado: some com as fotos novas
      },
    };
  }

  const empty = (icon, text) =>
    `<div class="empty">${Icons.svg(icon, 'ico-lg')}<p>${esc(text)}</p></div>`;

  const statusChip = (status) => {
    const map = {
      pending: ['pending', 'aguardando'],
      approved: ['approved', 'validado'],
      rejected: ['rejected', 'recusado'],
    };
    const [cls, txt] = map[status] || map.pending;
    return `<span class="chip ${cls}">${txt}</span>`;
  };

  /** lê um <form> como objeto simples */
  const formData = (form) => {
    const out = {};
    new FormData(form).forEach((v, k) => { out[k] = typeof v === 'string' ? v.trim() : v; });
    form.querySelectorAll('[data-switch]').forEach((s) => {
      out[s.getAttribute('data-switch')] = s.getAttribute('aria-pressed') === 'true';
    });
    return out;
  };

  /** liga botões-interruptor (aria-pressed) */
  function bindSwitches(scope) {
    scope.querySelectorAll('[data-switch]').forEach((sw) => {
      sw.addEventListener('click', () =>
        sw.setAttribute('aria-pressed', sw.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'));
    });
  }

  return {
    esc, toast, openSheet, closeSheet, confirm,
    iconPicker, gradPicker, bindPickers, bindSwitches,
    photoField, bindPhotos, photoStrip, bindPhotoViewers,
    field, input, empty, statusChip, formData,
    GRADS,
  };
})();

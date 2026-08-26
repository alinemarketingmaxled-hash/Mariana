/* =========================================================
   ui.js — helpers de interface (toast, bottom-sheet, ícones)
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
          <button class="icon-btn" data-close aria-label="Fechar">✕</button>
        </header>
        <div class="sheet-body">${body}</div>
        ${actions ? `<div class="sheet-actions">${actions}</div>` : ''}
      </section>`;
    root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeSheet));
    document.addEventListener('keydown', escHandler);
    const sheet = root.querySelector('.sheet');
    if (onMount) onMount(sheet);
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
  const EMOJIS = [
    '📚','🏠','🪥','⭐','🎯','🎨','⚽','🎸','🧹','🐶','🌱','💧','🛏️','🍎','🧠','💪',
    '🧺','🚿','🎒','🧩','🕹️','🎹','🩰','🚲','🧽','🍽️','📝','🌈','🦄','🐣','🐱','🚀',
  ];

  const emojiPicker = (name, selected, list = EMOJIS) => `
    <div class="field">
      <label>Ícone</label>
      <div class="emoji-pick" data-emoji-pick="${esc(name)}">
        ${list.map((e) => `<button type="button" data-emoji="${esc(e)}" aria-pressed="${e === selected}">${e}</button>`).join('')}
      </div>
      <input type="hidden" name="${esc(name)}" value="${esc(selected || list[0])}" />
    </div>`;

  const gradPicker = (name, selected) => `
    <div class="field">
      <label>Cor</label>
      <div class="emoji-pick" data-emoji-pick="${esc(name)}">
        ${GRADS.map((g) => `<button type="button" class="${g}" data-emoji="${g}" aria-pressed="${g === selected}" style="color:transparent">•</button>`).join('')}
      </div>
      <input type="hidden" name="${esc(name)}" value="${esc(selected || 'g1')}" />
    </div>`;

  /** liga os seletores (emoji/cor) dentro de um container */
  function bindPickers(scope) {
    scope.querySelectorAll('[data-emoji-pick]').forEach((box) => {
      const field = box.getAttribute('data-emoji-pick');
      const input = scope.querySelector(`input[name="${field}"]`);
      box.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-emoji]');
        if (!btn) return;
        box.querySelectorAll('[data-emoji]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        if (input) input.value = btn.getAttribute('data-emoji');
      });
    });
  }

  const field = (label, inner) => `
    <div class="field"><label>${esc(label)}</label><div class="input-wrap">${inner}</div></div>`;

  const input = (name, opts = {}) => `
    <input name="${esc(name)}" type="${opts.type || 'text'}" value="${esc(opts.value || '')}"
      placeholder="${esc(opts.placeholder || '')}" ${opts.attrs || ''} />`;

  const empty = (emoji, text) =>
    `<div class="empty"><span class="em">${emoji}</span><p>${esc(text)}</p></div>`;

  const statusChip = (status) => {
    const map = {
      pending: ['pending', '⏳ aguardando'],
      approved: ['approved', '✓ validado'],
      rejected: ['rejected', '✕ recusado'],
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
    emojiPicker, gradPicker, bindPickers, bindSwitches,
    field, input, empty, statusChip, formData,
    GRADS, EMOJIS,
  };
})();

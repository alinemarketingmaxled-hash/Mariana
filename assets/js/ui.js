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
    fecharRadial();
    if (typeof Pet !== 'undefined' && Pet.Voz) Pet.Voz.parar();
    // a folha vai embora, mas quem se despede ainda precisa dela para
    // desligar o que tiver ligado (ouvintes de teclado, relógios e afins)
    const folha = root.querySelector('.sheet');
    root.innerHTML = '';
    root.hidden = true;
    document.removeEventListener('keydown', escHandler);
    if (onCloseHook) { const f = onCloseHook; onCloseHook = null; f(folha); }
  }

  /** tem alguma folha aberta agora? */
  const folhaAberta = () => {
    const root = sheetRoot();
    return !!(root && !root.hidden && root.querySelector('.sheet'));
  };

  /** pendura mais uma despedida na folha aberta, sem apagar a que já existe */
  function aoFechar(fn) {
    const anterior = onCloseHook;
    onCloseHook = (folha) => {
      if (anterior) anterior(folha);
      fn(folha);
    };
  }

  function escHandler(ev) { if (ev.key === 'Escape') closeSheet(); }

  /**
   * openSheet({ title, subtitle, body, actions, onMount, onClose })
   * `body` e `actions` são HTML; `onMount(sheetEl)` conecta os eventos.
   */
  function openSheet({ title = '', subtitle = '', body = '', actions = '', size = '', onMount, onClose } = {}) {
    const root = sheetRoot();
    // se já havia uma folha aberta, avisa que ela fechou antes de trocar
    if (onCloseHook) { const f = onCloseHook; onCloseHook = null; f(root.querySelector('.sheet')); }
    root.hidden = false;
    onCloseHook = onClose || null;
    root.innerHTML = `
      <div class="sheet-bg" data-close></div>
      <section class="sheet ${esc(size)}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
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

  /* ---------- menu em bolinhas em volta de um botão ---------- */
  let radialAberto = null;

  function fecharRadial() {
    if (!radialAberto) return;
    radialAberto.remove();
    radialAberto = null;
    document.removeEventListener('pointerdown', foraDoRadial, true);
    document.removeEventListener('keydown', escRadial, true);
  }
  function foraDoRadial(ev) {
    if (radialAberto && !radialAberto.contains(ev.target)) fecharRadial();
  }
  function escRadial(ev) { if (ev.key === 'Escape') fecharRadial(); }

  /**
   * Abre bolinhas coloridas em volta de um botão.
   * O leque abre para o lado onde há espaço na tela.
   * itens: [{ id, label, icone, cor, onClick }]
   */
  function openRadial(ancora, itens) {
    if (radialAberto) { fecharRadial(); return null; }
    if (!ancora || !itens || !itens.length) return null;

    const r = ancora.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const TAM = 54;
    const ESPACO = 80;          // distância mínima entre as bolinhas
    const W = window.innerWidth;
    const H = window.innerHeight;

    // o leque abre na direção onde há mais tela livre
    const dx = cx < W / 2 ? 1 : -1;
    const dy = cy < H / 2 ? 1 : -1;
    const centro = (Math.atan2(dy, dx) * 180) / Math.PI;
    const abertura = 120;   // um leque mais fechado não volta para cima da tela
    // o raio cresce com a quantidade, para as bolinhas não se encostarem
    const arco = (abertura * Math.PI) / 180;
    const raio = Math.max(92, Math.min(210,
      itens.length > 1 ? ((itens.length - 1) * ESPACO) / arco : 96));
    const inicio = centro - abertura / 2;
    const passo = itens.length > 1 ? abertura / (itens.length - 1) : 0;
    const dentro = (v, min, max) => Math.max(min, Math.min(max, v));
    // no celular a barra de baixo é fixa: as bolinhas param acima dela
    const barra = document.querySelector('.side');
    const rodape = barra && getComputedStyle(barra).position === 'fixed'
      ? barra.getBoundingClientRect().height + 26 : 36;

    const caixa = document.createElement('div');
    caixa.className = 'radial';
    caixa.innerHTML = `<span class="radial-bg"></span>` + itens.map((it, i) => {
      const ang = ((inicio + i * passo) * Math.PI) / 180;
      const x = Math.round(dentro(cx + raio * Math.cos(ang) - TAM / 2, 8, W - TAM - 8));
      const y = Math.round(dentro(cy + raio * Math.sin(ang) - TAM / 2, 8, H - TAM - rodape));
      /* O nome sai para fora do leque, longe do vizinho. Entre os quatro
         lados, fica no primeiro que couber inteiro na tela. */
      const cos = Math.cos(ang);
      const largura = it.label.length * 7.6 + 24;   // estimativa da etiqueta
      const meio = x + TAM / 2;
      const cabeMeio = meio - largura / 2 >= 6 && meio + largura / 2 <= W - 6;
      const cabe = {
        dir: x + TAM + 8 + largura <= W - 6,
        esq: x - 8 - largura >= 6,
        cima: cabeMeio && y - 26 >= 6,
        baixo: cabeMeio && y + TAM + 26 <= H - 6,
      };
      const ordem = cos > 0.4 ? ['dir', 'baixo', 'cima', 'esq']
        : cos < -0.4 ? ['esq', 'baixo', 'cima', 'dir']
        : (Math.sin(ang) < 0 ? ['cima', 'dir', 'esq', 'baixo'] : ['baixo', 'dir', 'esq', 'cima']);
      const pos = ordem.find((k) => cabe[k]) || 'baixo';
      return `
        <button type="button" class="radial-bolha" data-radial="${esc(it.id)}"
                style="left:${x}px; top:${y}px; background:${it.cor}; animation-delay:${i * 40}ms"
                aria-label="${esc(it.label)}">
          ${Icons.svg(it.icone)}
          <span class="radial-nome" data-pos="${pos}">${esc(it.label)}</span>
        </button>`;
    }).join('');
    document.body.appendChild(caixa);
    radialAberto = caixa;

    // depois da animação, ajusta qualquer etiqueta que ainda passe da borda
    setTimeout(() => {
      if (radialAberto !== caixa) return;
      caixa.querySelectorAll('.radial-nome').forEach((nome) => {
        const r = nome.getBoundingClientRect();
        if (r.right > W - 6) nome.style.marginLeft = `${Math.round(W - 6 - r.right)}px`;
        else if (r.left < 6) nome.style.marginLeft = `${Math.round(6 - r.left)}px`;
      });
    }, 340);

    // tocar no fundo escurecido fecha o leque
    caixa.querySelector('.radial-bg').addEventListener('click', fecharRadial);
    caixa.querySelectorAll('[data-radial]').forEach((b) => {
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const item = itens.find((x) => x.id === b.getAttribute('data-radial'));
        fecharRadial();
        if (item && item.onClick) item.onClick();
      });
    });
    setTimeout(() => {
      document.addEventListener('pointerdown', foraDoRadial, true);
      document.addEventListener('keydown', escRadial, true);
    }, 0);
    return caixa;
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

  /**
   * Estrutura da tela: barra lateral (marca, usuário, ação principal, navegação,
   * rodapé) + cabeçalho da página + conteúdo em duas colunas.
   */
  function shell({ user, roleLabel, tab, nav, title, subtitle, actions = '', main, aside = '', fab }) {
    return `
      <div class="shell">
        <aside class="side">
          <div class="side-brand">
            <span class="side-mark">${Icons.svg('wallet')}</span>
            <span class="wordmark">Minha Mesada</span>
          </div>
          <div class="side-user">
            ${avatar(user, '', 'width:40px;height:40px;font-size:16px')}
            <span class="grow">
              <span class="t1 block">${esc(user.name)}</span>
              <span class="t2 block">${esc(roleLabel)}</span>
            </span>
          </div>
          ${fab ? `<button class="fab" data-fab aria-label="${esc(fab.label)}">
            ${Icons.svg(fab.icon)}<span class="fab-label">${esc(fab.label)}</span></button>` : ''}
          <nav class="side-nav">
            ${nav.map((n) => `
              <button class="tab" data-tab="${esc(n.id)}" aria-pressed="${n.id === tab}">
                ${Icons.svg(n.icon)}
                <span class="tab-label">${esc(n.label)}</span>
                ${n.count ? `<span class="nav-count">${n.count}</span>` : ''}
              </button>`).join('')}
          </nav>
          <div class="side-foot">
            <button class="mini-row" data-theme-toggle>
              ${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}
              <span class="grow bold tiny" style="text-align:left">Tema ${Store.theme() === 'dark' ? 'claro' : 'escuro'}</span>
            </button>
            <button class="mini-row" data-logout>
              ${Icons.svg('logout')}<span class="grow bold tiny" style="text-align:left">Sair</span>
            </button>
          </div>
        </aside>

        <div class="content">
          <header class="page-head">
            <div class="page-avatar">${avatar(user, '', 'width:40px;height:40px;font-size:16px;border-radius:14px')}</div>
            <div class="page-title-box">
              <h2>${esc(title)}</h2>
              ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
            </div>
            ${actions ? `<div class="page-actions">${actions}</div>` : ''}
            <button class="icon-btn page-menu" data-menu aria-label="Menu">${Icons.svg('menu')}</button>
          </header>
          <div class="page ${aside ? '' : 'solo'}">
            <main class="page-main">${main}</main>
            ${aside ? `<aside class="page-aside">${aside}</aside>` : ''}
          </div>
        </div>
      </div>`;
  }

  /** liga navegação, ação principal, tema, sair e menu da estrutura */
  function bindShell(root, { onTab, onFab, onMenu }) {
    root.querySelectorAll('[data-tab]').forEach((b) =>
      b.addEventListener('click', () => onTab && onTab(b.getAttribute('data-tab'))));
    const fab = root.querySelector('[data-fab]');
    if (fab && onFab) fab.addEventListener('click', onFab);
    root.querySelectorAll('[data-menu]').forEach((b) =>
      b.addEventListener('click', () => onMenu && onMenu()));
    root.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
      App.toggleTheme();
      App.render();
    }));
    root.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', () => App.logout()));
  }

  /** painel da coluna lateral */
  const panel = (title, icon, body, link = '') => `
    <section class="panel">
      <header class="panel-head">
        <h3>${Icons.svg(icon)} ${esc(title)}</h3>
        ${link}
      </header>
      ${body}
    </section>`;

  /** avatar do usuário: foto quando existir, senão a inicial sobre a cor */
  const avatar = (user, cls = '', style = '') => {
    if (!user) return `<div class="avatar ${cls}" style="${style}"></div>`;
    if (user.photo) {
      return `<div class="avatar photo ${cls}" style="${style}">
        <img data-photo="${esc(user.photo)}" alt="${esc(user.name)}" /></div>`;
    }
    const initial = String(user.name || '?').trim().charAt(0).toUpperCase();
    return `<div class="avatar ${user.color || 'g1'} ${cls}" style="${style}">${esc(initial)}</div>`;
  };

  /** símbolo da categoria: foto de capa quando existir, senão o ícone */
  const catVisual = (cat, style = '') => {
    if (!cat) return '';
    if (cat.photo) {
      return `<span class="em photo" style="${style}"><img data-photo="${esc(cat.photo)}" alt="" /></span>`;
    }
    return `<span class="em ${cat.grad || 'g1'}" style="${style}">${Icons.svg(cat.icon)}</span>`;
  };

  /** símbolo de um lançamento já registrado (guarda ícone e cor no momento do registro) */
  const entryVisual = (entry, style = '') => {
    if (entry && entry.coverPhoto) {
      return `<span class="em photo" style="${style}"><img data-photo="${esc(entry.coverPhoto)}" alt="" /></span>`;
    }
    return `<span class="em ${(entry && entry.grad) || 'g1'}" style="${style}">${Icons.svg(entry && entry.icon)}</span>`;
  };

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
  const photoField = (label, ids = [], max) => {
    const teto = Math.max(1, Number(max) || Photos.MAX_PER_RECORD);
    return `
    <div class="field">
      <label>${esc(label)}</label>
      <div class="photo-picker" data-photo-picker data-max="${teto}">
        <div class="thumbs" data-thumbs></div>
        <label class="photo-add">
          <input type="file" accept="image/*" multiple hidden data-file />
          <span class="photo-add-in">Adicionar foto</span>
        </label>
        <p class="tiny muted" data-photo-hint>Até ${teto} fotos. Elas ficam salvas neste aparelho.</p>
      </div>
      <input type="hidden" name="photos" value="${esc((ids || []).join(','))}" />
    </div>`;
  };

  /**
   * Liga o campo de fotos. Devolve { ids, commit, discard }: as fotos novas
   * só ficam definitivas quando o formulário é salvo (commit).
   */
  function bindPhotos(scope, aoMudar) {
    const box = scope.querySelector('[data-photo-picker]');
    if (!box) return { ids: () => [], commit() {}, discard() {} };

    const hidden = scope.querySelector('input[name="photos"]');
    const thumbs = box.querySelector('[data-thumbs]');
    const file = box.querySelector('[data-file]');
    const teto = Math.max(1, Number(box.getAttribute('data-max')) || Photos.MAX_PER_RECORD);
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
      box.querySelector('.photo-add').classList.toggle('hidden', ids.length >= teto);
      if (aoMudar) aoMudar(ids.length);
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
        if (ids.length >= teto) {
          toast(`Máximo de ${teto} fotos por registro`, 'bad');
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

  const empty = (icon, text) => `
    <div class="empty">
      <span class="empty-blob">${Icons.svg(icon, 'ico-lg')}</span>
      <p>${esc(text)}</p>
    </div>`;

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
    esc, toast, openSheet, closeSheet, confirm, openRadial, fecharRadial,
    iconPicker, gradPicker, bindPickers, bindSwitches,
    photoField, bindPhotos, photoStrip, bindPhotoViewers, avatar, catVisual, entryVisual,
    shell, bindShell, panel, aoFechar, folhaAberta,
    field, input, empty, statusChip, formData,
    GRADS,
  };
})();

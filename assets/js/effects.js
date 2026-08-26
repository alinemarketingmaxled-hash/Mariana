/* =========================================================
   effects.js: animações de resposta às ações do filho.
   Marcou tarefa, registrou livro, gastou dinheiro: cada ação
   solta uma chuva de ícones que sai da própria tela.
   ========================================================= */
const Effects = (() => {
  const reduced = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** cada cena diz quais ícones voam, para onde e com que cara */
  const SCENES = {
    task:     { icons: ['check', 'star'],            tone: 'good', dir: 'up',   count: 14 },
    money:    { icons: ['coins', 'banknote'],        tone: 'good', dir: 'up',   count: 16 },
    spend:    { icons: ['coins', 'banknote'],        tone: 'spend', dir: 'down', count: 18 },
    book:     { icons: ['book', 'pencil'],           tone: 'study', dir: 'up',   count: 15 },
    event:    { icons: ['calendar', 'bell'],         tone: 'cal',  dir: 'up',   count: 12 },
    approved: { icons: ['check', 'trophy', 'star'],  tone: 'good', dir: 'up',   count: 18 },
    photo:    { icons: ['camera', 'image'],          tone: 'cal',  dir: 'up',   count: 12 },
    goal:     { icons: ['target', 'trophy', 'star'], tone: 'good', dir: 'up',   count: 20 },
  };

  const TONES = {
    good:  ['#7c6cf7', '#b48bf6', '#2fbf8f', '#8fd8ff'],
    spend: ['#f2607d', '#ff9ecb', '#f2a33c', '#b48bf6'],
    study: ['#7c6cf7', '#8fd8ff', '#69d38f', '#ffb347'],
    cal:   ['#8fd8ff', '#b48bf6', '#ffb347', '#7c6cf7'],
  };

  function layer() {
    let el = document.getElementById('fx-layer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fx-layer';
      el.className = 'fx-layer';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }

  const rand = (min, max) => min + Math.random() * (max - min);

  /**
   * burst(scene, from)
   * `from` pode ser um elemento, um {x, y} ou nada (usa o centro da tela).
   */
  function burst(scene, from) {
    const cfg = SCENES[scene] || SCENES.task;
    if (reduced()) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.42;
    if (from && from.getBoundingClientRect) {
      const r = from.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    } else if (from && typeof from.x === 'number') {
      x = from.x;
      y = from.y;
    }

    const colors = TONES[cfg.tone] || TONES.good;
    const root = layer();

    for (let i = 0; i < cfg.count; i++) {
      const piece = document.createElement('span');
      piece.className = 'fx-piece';
      piece.innerHTML = Icons.svg(cfg.icons[i % cfg.icons.length]);
      const size = rand(18, 34);
      const spreadX = rand(-160, 160);
      const rise = cfg.dir === 'down' ? rand(160, 320) : rand(-320, -170);
      const spin = rand(-220, 220);
      const delay = rand(0, 220);
      const dur = rand(900, 1500);

      piece.style.cssText = `
        left:${x}px; top:${y}px; width:${size}px; height:${size}px; color:${colors[i % colors.length]};
        --dx:${spreadX}px; --dy:${rise}px; --spin:${spin}deg;
        animation-duration:${dur}ms; animation-delay:${delay}ms;`;
      piece.addEventListener('animationend', () => piece.remove());
      root.appendChild(piece);
    }

    // limpeza de segurança, caso algum animationend não dispare
    setTimeout(() => {
      if (root.childElementCount > 120) root.innerHTML = '';
    }, 2200);
  }

  /** número que sobe e some, para mostrar quanto entrou ou saiu */
  function floatValue(text, from, tone = 'good') {
    if (reduced()) return;
    const root = layer();
    const el = document.createElement('span');
    el.className = `fx-value ${tone}`;
    el.textContent = text;
    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.4;
    if (from && from.getBoundingClientRect) {
      const r = from.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.addEventListener('animationend', () => el.remove());
    root.appendChild(el);
  }

  /** dá um pulinho no elemento (usado no saldo quando ele muda) */
  function pulse(selector) {
    if (reduced()) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    el.classList.remove('fx-pulse');
    void el.offsetWidth;
    el.classList.add('fx-pulse');
  }

  return { burst, floatValue, pulse, SCENES };
})();

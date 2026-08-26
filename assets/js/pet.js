/* =========================================================
   pet.js: o bichinho do filho.
   Ele reage ao que acontece no app (tarefas, livros, gastos),
   ganha experiência, sobe de nível e pode ser personalizado.
   ========================================================= */
const Pet = (() => {
  const COLORS = [
    { id: 'lime', label: 'Limão', hex: '#d6f154', ink: '#131338' },
    { id: 'blue', label: 'Azul', hex: '#3b4fe4', ink: '#ffffff' },
    { id: 'pink', label: 'Rosa', hex: '#ff8fc8', ink: '#131338' },
    { id: 'orange', label: 'Laranja', hex: '#ffa24b', ink: '#131338' },
    { id: 'mint', label: 'Menta', hex: '#79e3b5', ink: '#131338' },
    { id: 'violet', label: 'Violeta', hex: '#a98cff', ink: '#131338' },
    { id: 'sky', label: 'Céu', hex: '#6fd3ff', ink: '#131338' },
    { id: 'sun', label: 'Sol', hex: '#ffd84b', ink: '#131338' },
  ];

  /** cada corpo é um caminho fechado, no espaço 0..200 */
  const SHAPES = [
    {
      id: 'blob', label: 'Redondinho',
      path: 'M100 12c40 0 76 26 82 64 6 40-8 76-40 96-30 18-74 18-104 0C6 152-8 116-2 76 4 38 60 12 100 12z',
      fit: { tx: 0, ty: 0, sx: 1, sy: 1 },      // ajuste da roupinha em cada corpo
    },
    {
      id: 'drop', label: 'Gotinha',
      path: 'M100 8c34 30 74 62 74 106a74 74 0 1 1-148 0C26 70 66 38 100 8z',
      fit: { tx: 0, ty: 8, sx: 1.14, sy: 1.05 },
    },
    {
      id: 'bean', label: 'Feijãozinho',
      path: 'M52 22c40-18 96-8 118 30 20 34 6 78-16 108-22 30-70 42-104 26C14 170-2 128 4 92 10 56 24 34 52 22z',
      fit: { tx: -4, ty: 6, sx: 1.04, sy: 1.02 },
    },
    {
      id: 'star', label: 'Estrelinha',
      path: 'M100 6c14 30 26 42 58 50-26 20-34 34-30 66 4 30-14 44-28 60-14-16-32-30-28-60 4-32-4-46-30-66 32-8 44-20 58-50z',
      fit: { tx: 0, ty: -12, sx: .58, sy: .72 },
    },
  ];

  const ACCESSORIES = [
    { id: '', label: 'Sem acessório', level: 1 },
    { id: 'chapeu', label: 'Chapéu', level: 2 },
    { id: 'oculos', label: 'Óculos', level: 3 },
    { id: 'laco', label: 'Laço', level: 4 },
    { id: 'coroa', label: 'Coroa', level: 5 },
    { id: 'fone', label: 'Fone', level: 6 },
  ];

  /** roupinhas: a primeira já vem com o bichinho, o resto abre por nível */
  const OUTFITS = [
    { id: 'camiseta', label: 'Camiseta', level: 1, cor: '#ffffff' },
    { id: 'moletom', label: 'Moletom', level: 2, cor: '#ff8fc8' },
    { id: 'listrada', label: 'Listrada', level: 3, cor: '#6fd3ff' },
    { id: 'vestido', label: 'Vestido', level: 4, cor: '#ffd84b' },
    { id: 'uniforme', label: 'Uniforme', level: 5, cor: '#3b4fe4' },
    { id: 'capa', label: 'Capa de herói', level: 6, cor: '#e0447a' },
    { id: 'pijama', label: 'Pijama', level: 7, cor: '#a98cff' },
    { id: 'espacial', label: 'Traje espacial', level: 8, cor: '#79e3b5' },
  ];

  /** camas: onde ele dorme quando bate o sono */
  const BEDS = [
    { id: 'colchonete', label: 'Colchonete', level: 1, cor: '#ffa24b' },
    { id: 'caminha', label: 'Caminha', level: 3, cor: '#79e3b5' },
    { id: 'nuvem', label: 'Nuvem', level: 5, cor: '#6fd3ff' },
    { id: 'realeza', label: 'Cama de realeza', level: 7, cor: '#ffd84b' },
  ];

  /** quartos: o cenário onde ele vive, também abre por nível */
  const ROOMS = [
    { id: 'quartinho', label: 'Quartinho', level: 1, cor: '#cfe0ff', chao: '#a9c4ff', ceu: '#e8f0ff' },
    { id: 'jardim', label: 'Jardim', level: 1, cor: '#79e3b5', chao: '#4fc78f', ceu: '#d9f7ea' },
    { id: 'praia', label: 'Praia', level: 3, cor: '#ffd84b', chao: '#ffdf8c', ceu: '#bfeaff' },
    { id: 'espaco', label: 'Espaço', level: 5, cor: '#3b4fe4', chao: '#2b3390', ceu: '#191a4d' },
    { id: 'castelo', label: 'Castelo', level: 7, cor: '#a98cff', chao: '#8f6ff0', ceu: '#efe8ff' },
  ];

  const XP_POR_NIVEL = 60;
  const CARINHOS_POR_DIA = 5;

  const color = (id) => COLORS.find((c) => c.id === id) || COLORS[0];
  const shape = (id) => SHAPES.find((s) => s.id === id) || SHAPES[0];
  const level = (xp) => Math.floor((xp || 0) / XP_POR_NIVEL) + 1;
  const progress = (xp) => ((xp || 0) % XP_POR_NIVEL) / XP_POR_NIVEL;
  const unlocked = (lv) => ACCESSORIES.filter((a) => a.level <= lv);
  const outfit = (id) => OUTFITS.find((o) => o.id === id) || OUTFITS[0];
  const bed = (id) => BEDS.find((b) => b.id === id) || BEDS[0];
  const room = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0];
  const faltaParaSubir = (xp) => XP_POR_NIVEL - ((xp || 0) % XP_POR_NIVEL);

  /** tudo o que a lojinha oferece, com o nível que abre cada item */
  const catalogo = () => [
    ...OUTFITS.map((o) => ({ ...o, tipo: 'outfit', tipoLabel: 'Roupinha' })),
    ...BEDS.map((b) => ({ ...b, tipo: 'bed', tipoLabel: 'Cama' })),
    ...ACCESSORIES.filter((a) => a.id).map((a) => ({ ...a, tipo: 'accessory', tipoLabel: 'Acessório', cor: '#a98cff' })),
    ...ROOMS.map((r) => ({ ...r, tipo: 'room', tipoLabel: 'Quarto' })),
  ];

  /* ---------- voz ---------- */
  /**
   * O bichinho fala em voz alta usando a síntese de voz do navegador.
   * Se o aparelho não tiver voz disponível, o balão de texto continua
   * funcionando normalmente.
   */
  const Voz = (() => {
    const suportada = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
    let vozBR = null;

    function escolherVoz() {
      if (!suportada()) return null;
      if (vozBR) return vozBR;
      const vozes = window.speechSynthesis.getVoices() || [];
      vozBR = vozes.find((v) => /pt[-_]BR/i.test(v.lang))
        || vozes.find((v) => /^pt/i.test(v.lang))
        || vozes[0] || null;
      return vozBR;
    }

    if (suportada() && typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', () => { vozBR = null; escolherVoz(); });
    }

    /** marca as carinhas na tela como falando, para a boca mexer */
    function bocaMexendo(ligar, alvo) {
      const alvos = alvo && alvo.querySelectorAll
        ? alvo.querySelectorAll('.pet-svg')
        : document.querySelectorAll('.pet-svg');
      alvos.forEach((el) => el.classList.toggle('is-falando', ligar));
    }

    function falar(texto, child, alvo) {
      const limpo = String(texto || '').trim();
      if (!limpo) return false;
      if (child && Store.petOf(child.id).voice === false) return false;
      if (!suportada()) return false;
      try {
        window.speechSynthesis.cancel();
        const fala = new SpeechSynthesisUtterance(limpo);
        const v = escolherVoz();
        if (v) fala.voice = v;
        fala.lang = (v && v.lang) || 'pt-BR';
        fala.rate = 0.98;
        fala.pitch = 1.35;   // vozinha mais aguda, de bichinho
        fala.onstart = () => bocaMexendo(true, alvo);
        fala.onend = () => bocaMexendo(false, alvo);
        fala.onerror = () => bocaMexendo(false, alvo);
        window.speechSynthesis.speak(fala);
        return true;
      } catch (err) {
        return false;
      }
    }

    function parar() {
      if (!suportada()) return;
      try { window.speechSynthesis.cancel(); } catch (err) { /* nada a fazer */ }
      bocaMexendo(false);
    }

    return { falar, parar, suportada };
  })();

  /* ---------- humor ---------- */
  /** o humor sai do que aconteceu hoje, não de um contador escondido */
  function mood(child) {
    const hoje = Store.today();
    const st = Store.dayStatus(child.id, hoje);
    const doDia = Store.entriesOf(child.id, hoje);
    const recusados = doDia.filter((e) => e.status === 'rejected').length;
    const atrasados = Store.upcomingEvents(child.id).filter((e) => !e.done && Store.daysUntil(e.date) < 0).length;

    const hora = new Date().getHours();
    if (Store.petSleeping(child.id)) return { id: 'dormindo', label: 'tirando um cochilo' };
    if (recusados) return { id: 'triste', label: 'meio triste' };
    if (st.required && st.complete) return { id: 'festa', label: 'muito feliz' };
    if (atrasados) return { id: 'preocupado', label: 'preocupado' };
    if (doDia.length) return { id: 'feliz', label: 'animado' };
    // só dorme de madrugada; no resto do dia fica acordado esperando
    if (hora >= 22 || hora < 6) return { id: 'dormindo', label: 'dormindo' };
    return { id: 'feliz', label: 'acordado' };
  }

  /** frase que o bichinho fala, sempre ligada ao que está acontecendo */
  function phrase(child) {
    const hoje = Store.today();
    const st = Store.dayStatus(child.id, hoje);
    const pendentes = Store.pendingEntries(child.id).length;
    const atrasados = Store.upcomingEvents(child.id).filter((e) => !e.done && Store.daysUntil(e.date) < 0);
    const proximos = Store.upcomingEvents(child.id).filter((e) => !e.done && Store.daysUntil(e.date) >= 0);
    const bal = Store.balance(child.id);
    const meta = Number(child.goalAmount) || 0;

    if (atrasados.length) return `Ficou para trás: ${atrasados[0].title}. Bora resolver?`;
    if (st.required && st.complete) return 'Todas as tarefas do dia feitas. Você é demais!';
    if (proximos.length && Store.daysUntil(proximos[0].date) <= 2) {
      return `${proximos[0].title} está chegando. Já se preparou?`;
    }
    if (st.required && st.filled === 0) return 'Bom dia! Vamos começar pela primeira tarefa?';
    if (st.required) return `Faltam ${st.required - st.filled} tarefas do dia. Você consegue!`;
    if (pendentes) return `${pendentes} coisa(s) esperando a validação. Já já sai.`;
    if (meta && bal >= meta) return 'Você chegou na sua meta! Que orgulho.';
    if (meta) return `Faltam ${Store.money(meta - bal)} para a sua meta.`;
    return 'Tô aqui contigo. Me chama quando fizer alguma coisa!';
  }

  /* ---------- desenho ---------- */
  function accessorySvg(id, hex) {
    if (id === 'chapeu') {
      return `<g><path d="M56 62c10-30 78-30 88 0z" fill="#131338"/><rect x="40" y="58" width="120" height="12" rx="6" fill="#131338"/></g>`;
    }
    if (id === 'oculos') {
      return `<g fill="none" stroke="#131338" stroke-width="7">
        <circle cx="74" cy="96" r="26"/><circle cx="130" cy="96" r="26"/><path d="M100 96h4"/></g>`;
    }
    if (id === 'laco') {
      return `<g fill="#ff8fc8" stroke="#131338" stroke-width="5">
        <path d="M138 44c-16-14-30-6-30 6s16 16 30 6z"/><path d="M164 44c16-14 30-6 30 6s-16 16-30 6z" transform="translate(-26)"/>
        <circle cx="151" cy="50" r="7"/></g>`;
    }
    if (id === 'coroa') {
      return `<path d="M52 62 62 24l20 24 18-30 18 30 20-24 10 38z" fill="#ffd84b" stroke="#131338" stroke-width="5" stroke-linejoin="round"/>`;
    }
    if (id === 'fone') {
      return `<g fill="none" stroke="#131338" stroke-width="8" stroke-linecap="round">
        <path d="M46 100a54 54 0 0 1 108 0"/></g>
        <rect x="30" y="94" width="24" height="38" rx="11" fill="#131338"/>
        <rect x="146" y="94" width="24" height="38" rx="11" fill="#131338"/>`;
    }
    return '';
  }

  /** roupinha desenhada na barriga, ajustada ao formato do corpo */
  function outfitSvg(id, shapeId) {
    const f = shape(shapeId).fit || { tx: 0, ty: 0, sx: 1, sy: 1 };
    const o = outfit(id);
    const base = `<path d="M52 150h96v20a54 42 0 0 1-96 0z" fill="${o.cor}" stroke="#131338" stroke-width="5" stroke-linejoin="round"/>`;

    let desenho = base;
    if (id === 'moletom') {
      desenho = base + `<path d="M66 152v32M134 152v32" stroke="#131338" stroke-width="4" opacity=".5"/>
        <path d="M86 150h28v10a14 12 0 0 1-28 0z" fill="#131338" opacity=".2"/>`;
    } else if (id === 'listrada') {
      desenho = base + `<path d="M55 160h90M58 170h84M66 180h68" stroke="#131338" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
    } else if (id === 'vestido') {
      desenho = `<path d="M58 150h84l14 30a60 42 0 0 1-112 0z" fill="${o.cor}" stroke="#131338" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="100" cy="164" r="5" fill="#131338"/>`;
    } else if (id === 'uniforme') {
      desenho = base + `<path d="M88 150l12 14 12-14" fill="#fff" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>
        <path d="M96 164h8v16h-8z" fill="#e0447a" stroke="#131338" stroke-width="3"/>`;
    } else if (id === 'capa') {
      desenho = `<path d="M48 142c-14 24-12 44 6 58 12 9 80 9 92 0 18-14 20-34 6-58-14 16-90 16-104 0z" fill="${o.cor}" stroke="#131338" stroke-width="5" stroke-linejoin="round"/>` + base;
    } else if (id === 'pijama') {
      desenho = base + `<g fill="#131338" opacity=".4">
        <circle cx="74" cy="164" r="4"/><circle cx="100" cy="176" r="4"/><circle cx="126" cy="163" r="4"/></g>`;
    } else if (id === 'espacial') {
      desenho = base + `<circle cx="100" cy="168" r="12" fill="#fff" stroke="#131338" stroke-width="4"/>
        <path d="M95 168h10M100 163v10" stroke="#131338" stroke-width="3"/>`;
    }

    return `<g transform="translate(${100 + f.tx} ${168 + f.ty}) scale(${f.sx} ${f.sy}) translate(-100 -168)">${desenho}</g>`;
  }

  /** cama, desenhada atrás do bichinho quando ele dorme */
  function bedSvg(id) {
    const b = bed(id);
    if (id === 'nuvem') {
      return `<g><path d="M18 176c-12 0-18-8-18-16s8-16 18-14c4-14 20-18 30-10 8-10 26-10 34 2 12-6 28 0 30 12 12 0 18 8 18 16s-8 12-18 12z" fill="#fff" stroke="#131338" stroke-width="5" stroke-linejoin="round" transform="translate(24,10) scale(1.05)"/></g>`;
    }
    if (id === 'realeza') {
      return `<g>
        <rect x="8" y="150" width="184" height="44" rx="16" fill="${b.cor}" stroke="#131338" stroke-width="5"/>
        <rect x="20" y="132" width="60" height="26" rx="12" fill="#fff" stroke="#131338" stroke-width="5"/>
        <path d="M8 150v-34M192 150v-34" stroke="#131338" stroke-width="6" stroke-linecap="round"/>
        <path d="M0 116h200" stroke="${b.cor}" stroke-width="10" stroke-linecap="round"/></g>`;
    }
    if (id === 'caminha') {
      return `<g>
        <rect x="14" y="152" width="172" height="40" rx="18" fill="${b.cor}" stroke="#131338" stroke-width="5"/>
        <rect x="26" y="138" width="54" height="24" rx="11" fill="#fff" stroke="#131338" stroke-width="5"/></g>`;
    }
    return `<rect x="18" y="162" width="164" height="30" rx="14" fill="${b.cor}" stroke="#131338" stroke-width="5"/>`;
  }

  /** cenário do quarto, desenhado atrás de tudo */
  function roomSvg(id) {
    const r = room(id);
    const fundo = `<rect x="0" y="0" width="200" height="200" rx="26" fill="${r.ceu}"/>
      <path d="M0 152h200v22a26 26 0 0 1-26 26H26A26 26 0 0 1 0 174z" fill="${r.chao}"/>`;
    if (id === 'jardim') {
      return `${fundo}
        <circle cx="164" cy="42" r="18" fill="#ffd84b" stroke="#131338" stroke-width="4"/>
        <path d="M30 152v-30M30 130c-14 0-18-14-6-18 8-2 12 6 6 18zM30 132c14-2 20-16 8-20-8-2-14 8-8 20z"
              fill="#4fc78f" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>
        <path d="M176 152v-24M176 132c-10 0-14-10-4-13 6-2 9 5 4 13z"
              fill="#4fc78f" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>`;
    }
    if (id === 'praia') {
      return `${fundo}
        <circle cx="42" cy="40" r="18" fill="#ffd84b" stroke="#131338" stroke-width="4"/>
        <path d="M0 138h200" stroke="#6fd3ff" stroke-width="14"/>
        <path d="M168 152v-40M168 116c-16-10-30-4-30 4 12 2 22 0 30-4zM168 116c14-12 28-8 30 0-12 4-22 4-30 0z"
              fill="#4fc78f" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>`;
    }
    if (id === 'espaco') {
      return `${fundo}
        <g fill="#fff"><circle cx="30" cy="36" r="3"/><circle cx="66" cy="18" r="2.4"/><circle cx="152" cy="30" r="3.4"/>
          <circle cx="184" cy="66" r="2.6"/><circle cx="18" cy="88" r="2.4"/><circle cx="118" cy="46" r="2.2"/></g>
        <circle cx="46" cy="52" r="16" fill="#a98cff" stroke="#131338" stroke-width="4"/>
        <ellipse cx="46" cy="52" rx="26" ry="7" fill="none" stroke="#131338" stroke-width="4"/>`;
    }
    if (id === 'castelo') {
      return `${fundo}
        <path d="M22 152v-52h14v-14h14v14h14v52z" fill="${r.cor}" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>
        <path d="M144 152v-64h16v-16h14v16h16v64z" fill="${r.cor}" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>
        <path d="M50 86l6-16 6 16M174 72l6-16 6 16" fill="#ff8fc8" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>`;
    }
    return `${fundo}
      <rect x="12" y="36" width="52" height="46" rx="10" fill="#fff" stroke="#131338" stroke-width="5"/>
      <path d="M38 36v46M12 59h52" stroke="#131338" stroke-width="4"/>
      <path d="M150 112v-16h22v16z" fill="#ffd84b" stroke="#131338" stroke-width="4" stroke-linejoin="round"/>
      <rect x="134" y="112" width="54" height="12" rx="6" fill="${r.cor}" stroke="#131338" stroke-width="4"/>
      <path d="M142 124v28M180 124v28" stroke="#131338" stroke-width="5" stroke-linecap="round"/>`;
  }

  function face(moodId) {
    if (moodId === 'tonto') {
      return `
        <g fill="none" stroke="#131338" stroke-width="6" stroke-linecap="round">
          <path d="M74 98m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0M74 98m-8 0a8 8 0 1 0 16 0"/>
          <path d="M126 98m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0M126 98m-8 0a8 8 0 1 0 16 0"/>
        </g>
        <g class="pet-mouth">
          <path d="M74 138q13 16 26 0t26 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>
        </g>
        <g class="pet-stars" fill="#ffd84b" stroke="#131338" stroke-width="3">
          <path d="M40 44l5 11 12 2-9 8 3 12-11-6-11 6 3-12-9-8 12-2z"/>
          <path d="M160 38l4 9 10 2-7 7 2 10-9-5-9 5 2-10-7-7 10-2z"/>
        </g>`;
    }
    const eyes = moodId === 'dormindo'
      ? `<path d="M60 100q14 14 28 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>
         <path d="M112 100q14 14 28 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>`
      : `<g class="pet-eye">
           <ellipse cx="74" cy="98" rx="17" ry="19" fill="#fff"/>
           <ellipse cx="126" cy="98" rx="17" ry="19" fill="#fff"/>
           <circle class="pet-pupil" cx="74" cy="102" r="9" fill="#131338"/>
           <circle class="pet-pupil" cx="126" cy="102" r="9" fill="#131338"/>
           <circle cx="70" cy="96" r="3" fill="#fff"/><circle cx="122" cy="96" r="3" fill="#fff"/>
         </g>`;
    const mouth = {
      tonto: '<path d="M74 138q13 16 26 0t26 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>',
      festa: '<path d="M74 132q26 34 52 0q-26 12-52 0z" fill="#131338"/>',
      feliz: '<path d="M76 134q24 24 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>',
      triste: '<path d="M76 142q24-22 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>',
      preocupado: '<path d="M78 138h44" stroke="#131338" stroke-width="8" stroke-linecap="round"/>',
      dormindo: '<ellipse cx="100" cy="136" rx="11" ry="13" fill="#131338"/>',
    }[moodId] || '<path d="M76 134q24 24 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>';
    const bocaAnimada = `<g class="pet-mouth">${mouth}</g>`;

    if (moodId === 'estudando') {
      return `
        <g class="pet-eye">
          <ellipse cx="74" cy="98" rx="16" ry="17" fill="#fff"/>
          <ellipse cx="126" cy="98" rx="16" ry="17" fill="#fff"/>
          <circle cx="74" cy="104" r="8" fill="#131338"/><circle cx="126" cy="104" r="8" fill="#131338"/>
        </g>
        <path d="M56 78q16-10 32-2M112 76q16-8 32 2" stroke="#131338" stroke-width="6" fill="none" stroke-linecap="round"/>
        <g class="pet-mouth"><path d="M84 136h32" stroke="#131338" stroke-width="8" stroke-linecap="round"/></g>`;
    }
    const extra = moodId === 'dormindo'
      ? `<g class="pet-zzz" fill="#131338" font-family="Archivo,Arial" font-weight="900">
           <text x="150" y="52" font-size="26">z</text>
           <text x="172" y="32" font-size="18">z</text>
         </g>`
      : moodId === 'festa'
        ? `<g class="pet-spark" fill="#131338"><circle cx="34" cy="66" r="5"/><circle cx="170" cy="76" r="6"/><circle cx="158" cy="40" r="4"/></g>`
        : '';

    return eyes + bocaAnimada + extra;
  }

  /** desenho do bichinho; `size` é a largura em px */
  function svg(child, size = 180, moodId, opts) {
    const pet = Store.petOf(child.id);
    const c = color(pet.color);
    const sh = shape(pet.shape);
    const m = moodId || mood(child).id;
    const comCama = (opts && opts.bed) || m === 'dormindo';
    const comQuarto = !!(opts && opts.room);
    const quartoId = (opts && opts.roomId) || pet.room;
    // dentro do quarto o bichinho fica um pouco menor, para caber no cenário
    const dentro = comQuarto ? ' transform="translate(30,22) scale(.7)"' : '';
    return `
      <svg class="pet-svg mood-${m}" viewBox="0 0 200 200" width="${size}" height="${size}"
           role="img" aria-label="${UI.esc(pet.name)}, ${UI.esc(mood(child).label)}">
        ${comQuarto ? `<g class="pet-room">${roomSvg(quartoId)}</g>` : ''}
        <g class="pet-cena"${dentro}>
        ${comCama ? `<g class="pet-bed">${bedSvg(pet.bed)}</g>` : ''}
        <g class="pet-body">
          <ellipse class="pet-foot" cx="74" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
          <ellipse class="pet-foot" cx="126" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
          <path d="${sh.path}" fill="${c.hex}" stroke="#131338" stroke-width="6" stroke-linejoin="round"/>
          ${outfitSvg(pet.outfit, pet.shape)}
          <ellipse cx="52" cy="120" rx="11" ry="7" fill="#131338" opacity=".16"/>
          <ellipse cx="148" cy="120" rx="11" ry="7" fill="#131338" opacity=".16"/>
          ${face(m)}
          ${accessorySvg(pet.accessory, c.hex)}
        </g>
        </g>
      </svg>`;
  }

  /** desenho de teste: mostra como o bichinho vai ficar antes de salvar */
  function previewSvg(data, size = 150, moodId = 'feliz', opts) {
    const c = color(data.color);
    const sh = shape(data.shape);
    const comQuarto = !!(opts && opts.room);
    const comCama = !!(opts && opts.bed);
    const dentro = comQuarto ? ' transform="translate(30,22) scale(.7)"' : '';
    return `
      <svg class="pet-svg mood-${moodId}" viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true">
        ${comQuarto ? `<g class="pet-room">${roomSvg(data.room)}</g>` : ''}
        <g class="pet-cena"${dentro}>
          ${comCama ? `<g class="pet-bed">${bedSvg(data.bed)}</g>` : ''}
          <g class="pet-body">
            <ellipse class="pet-foot" cx="74" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
            <ellipse class="pet-foot" cx="126" cy="188" rx="17" ry="9" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
            <path d="${sh.path}" fill="${c.hex}" stroke="#131338" stroke-width="6" stroke-linejoin="round"/>
            ${outfitSvg(data.outfit, data.shape)}
            <ellipse cx="52" cy="120" rx="11" ry="7" fill="#131338" opacity=".16"/>
            <ellipse cx="148" cy="120" rx="11" ry="7" fill="#131338" opacity=".16"/>
            ${face(moodId)}
            ${accessorySvg(data.accessory, c.hex)}
          </g>
        </g>
      </svg>`;
  }

  /** rosquinha de progresso: no meio o nível, na volta o quanto falta */
  function ringSvg(xp) {
    const volta = 2 * Math.PI * 50;
    const feito = Math.max(0.02, progress(xp)) * volta;
    return `
      <div class="pet-ring" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle class="ring-track" cx="60" cy="60" r="50"/>
          <circle class="ring-fill" cx="60" cy="60" r="50"
                  stroke-dasharray="${feito.toFixed(1)} ${volta.toFixed(1)}"/>
        </svg>
        <span class="pet-ring-mid">
          <b>${level(xp)}</b>
          <i>nível</i>
        </span>
      </div>`;
  }

  /* ---------- painel compacto da coluna lateral ---------- */
  function panel(child) {
    const pet = Store.petOf(child.id);
    const dormindo = Store.petSleeping(child.id);
    const vozLigada = pet.voice !== false;
    const lv = level(pet.xp);
    const pct = Math.round(progress(pet.xp) * 100);
    const carinhos = Store.petCareLeft(child.id);
    return `
      <section class="panel pet-panel">
        <header class="panel-head">
          <h3>${Icons.svg('heart')} Meu bichinho</h3>
          <div class="row" style="gap:8px">
            <button class="icon-btn sm" data-pet-voice
                    aria-label="${vozLigada ? 'Desligar a voz' : 'Ligar a voz'}"
                    aria-pressed="${vozLigada}">
              ${Icons.svg(vozLigada ? 'speaker' : 'speakerOff')}
            </button>
            <button class="link" data-pet-open>cuidar</button>
          </div>
        </header>
        <div class="pet-panel-top">
          <button class="pet-hit" data-pet-touch aria-label="Fazer carinho em ${UI.esc(pet.name)}">
            ${svg(child, 104, null, { bed: true, room: true })}
          </button>
          <div class="grow">
            <div class="pet-name-row">
              <h4>${UI.esc(pet.name)}</h4>
              <span class="chip lime">nível ${lv}</span>
            </div>
            <div class="bar mt8" style="background:var(--surface-2)"><i style="width:${pct}%"></i></div>
            <p class="tiny muted mt8">${pet.xp} pontos • ${carinhos} carinho(s) hoje</p>
          </div>
        </div>
        <div class="pet-bubble mini" data-pet-bubble>${UI.esc(phrase(child))}</div>
        <div class="pet-actions">
          <button class="btn btn-primary btn-sm" data-pet-touch>Carinho</button>
          <button class="btn btn-ghost btn-sm" data-pet-chat>${Icons.svg('chat')} Conversar</button>
          <button class="btn btn-ghost btn-sm" data-pet-shop>${Icons.svg('coins')} Lojinha</button>
          <button class="btn btn-ghost btn-sm" data-pet-nap>
            ${Icons.svg(dormindo ? 'sun' : 'moon')} ${dormindo ? 'Acordar' : 'Dormir'}
          </button>
        </div>
      </section>`;
  }

  /* ---------- cartão de atualizar o bichinho ---------- */
  function openSheet(child) {
    const pet = Store.petOf(child.id);
    const lv = level(pet.xp);
    const falta = faltaParaSubir(pet.xp);
    const liberados = unlocked(lv);
    const quartos = ROOMS.filter((r) => r.level <= lv);
    const bloqueados = ROOMS.filter((r) => r.level > lv);

    const grade = (campo, itens, atual, render) => `
      <div class="pick-grid ${campo}" data-pick="${campo}">
        ${itens.map((it) => render(it, it.id === atual)).join('')}
      </div>
      <input type="hidden" name="${campo}" value="${UI.esc(atual || '')}" />`;

    UI.openSheet({
      title: 'Atualizar o bichinho',
      subtitle: `${pet.name} • ${pet.xp} pontos de amizade`,
      body: `
        <div class="pet-atualiza">
          <div class="pet-atualiza-art" data-pet-preview>
            ${previewSvg(pet, 160, 'feliz', { room: true })}
          </div>
          <div class="pet-atualiza-side">
            ${ringSvg(pet.xp)}
            <p class="tiny muted center">
              faltam <b data-falta>${falta}</b> ponto(s)<br/>para o nível ${lv + 1}
            </p>
          </div>
        </div>

        <form id="pet-form">
          ${UI.field('Nome', UI.input('name', { value: pet.name, placeholder: 'ex.: Pipoca' }))}

          <div class="field">
            <label>Modelo do bonequinho</label>
            ${grade('shape', SHAPES, pet.shape, (sh, on) => `
              <button type="button" data-value="${sh.id}" aria-pressed="${on}" title="${sh.label}">
                <svg viewBox="0 0 200 200"><path d="${sh.path}" fill="currentColor"/></svg>
                <span class="tiny">${UI.esc(sh.label)}</span>
              </button>`)}
          </div>

          <div class="field">
            <label>Cor</label>
            ${grade('color', COLORS, pet.color, (c, on) => `
              <button type="button" data-value="${c.id}" aria-pressed="${on}"
                      style="background:${c.hex}" aria-label="${c.label}" title="${c.label}"></button>`)}
          </div>

          <div class="field">
            <label>Acessórios disponíveis</label>
            ${grade('accessory', liberados, pet.accessory, (a, on) => `
              <button type="button" class="pick-tile" data-value="${a.id}" aria-pressed="${on}">
                <span class="tiny">${UI.esc(a.label)}</span>
              </button>`)}
            ${ACCESSORIES.filter((a) => a.level > lv).length ? `
              <div class="note">
                Ainda bloqueado: ${ACCESSORIES.filter((a) => a.level > lv)
                  .map((a) => `${a.label} (nível ${a.level})`).join(', ')}.
              </div>` : ''}
          </div>

          <div class="field">
            <label>Quarto</label>
            ${grade('room', quartos, pet.room, (r, on) => `
              <button type="button" class="pick-room" data-value="${r.id}" aria-pressed="${on}" title="${r.label}">
                <svg viewBox="0 0 200 200">${roomSvg(r.id)}</svg>
                <span class="tiny">${UI.esc(r.label)}</span>
              </button>`)}
            ${bloqueados.length ? `
              <div class="note">
                Novos quartos: ${bloqueados.map((r) => `${r.label} (nível ${r.level})`).join(', ')}.
              </div>` : ''}
          </div>
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-loja>${Icons.svg('coins')} Lojinha</button>
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        const preview = sheet.querySelector('[data-pet-preview]');
        const form = sheet.querySelector('#pet-form');
        const repaint = () => {
          const data = Object.assign({}, Store.petOf(child.id), UI.formData(form));
          preview.innerHTML = previewSvg(data, 160, 'feliz', { room: true });
        };
        sheet.querySelectorAll('[data-pick]').forEach((box) => {
          const input = form.querySelector(`input[name="${box.getAttribute('data-pick')}"]`);
          box.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-value]');
            if (!btn) return;
            box.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            if (input) input.value = btn.getAttribute('data-value');
            repaint();
          });
        });
        sheet.querySelector('[data-loja]').addEventListener('click', () => {
          UI.closeSheet();
          openShop(child);
        });
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const data = UI.formData(form);
          const res = Store.savePet(child.id, data);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast(`${res.pet.name} adorou o visual novo`, 'ok');
          App.render();
        });
      },
    });
  }

  /* ---------- lojinha de roupinhas ---------- */
  function openShop(child) {
    const pet = Store.petOf(child.id);
    const lv = level(pet.xp);
    const itens = catalogo();
    const grupos = [
      { tipo: 'outfit', titulo: 'Roupinhas', atual: pet.outfit },
      { tipo: 'bed', titulo: 'Camas', atual: pet.bed },
      { tipo: 'accessory', titulo: 'Acessórios', atual: pet.accessory },
      { tipo: 'room', titulo: 'Quartos', atual: pet.room },
    ];

    UI.openSheet({
      title: 'Lojinha do bichinho',
      subtitle: `Nível ${lv} • cada nível libera peças novas`,
      body: `
        <div class="shop-preview" data-shop-preview>${svg(child, 150, 'feliz', { room: true })}</div>
        ${grupos.map((g) => `
          <div class="section-title"><h3>${g.titulo}</h3></div>
          <div class="shop-grid">
            ${itens.filter((i) => i.tipo === g.tipo).map((i) => {
              const aberto = i.level <= lv;
              const usando = i.id === g.atual;
              return `
                <button class="shop-item ${aberto ? '' : 'locked'} ${usando ? 'usando' : ''}"
                        data-shop="${i.tipo}:${i.id}" ${aberto ? '' : 'disabled'}>
                  <span class="shop-chip" style="background:${i.cor}"></span>
                  <span class="shop-nome">${UI.esc(i.label)}</span>
                  <span class="shop-tag">${aberto ? (usando ? 'em uso' : 'usar') : `nível ${i.level}`}</span>
                  ${aberto ? '' : `<span class="shop-lock">${Icons.svg('lock')}</span>`}
                </button>`;
            }).join('')}
          </div>`).join('')}
        <div class="note">
          Ganhe pontos de amizade fazendo tarefas, estudando e jogando. A cada ${XP_POR_NIVEL} pontos
          o bichinho sobe de nível e abre peças novas.
        </div>`,
      actions: '<button class="btn btn-primary btn-block" data-ok>Pronto</button>',
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
        sheet.querySelectorAll('[data-shop]').forEach((b) => b.addEventListener('click', () => {
          const [tipo, id] = b.getAttribute('data-shop').split(':');
          Store.savePet(child.id, { name: Store.petOf(child.id).name, [tipo]: id });
          sheet.querySelectorAll(`[data-shop^="${tipo}:"]`).forEach((x) => {
            x.classList.remove('usando');
            const tag = x.querySelector('.shop-tag');
            if (tag && !x.classList.contains('locked')) tag.textContent = 'usar';
          });
          b.classList.add('usando');
          const tag = b.querySelector('.shop-tag');
          if (tag) tag.textContent = 'em uso';
          sheet.querySelector('[data-shop-preview]').innerHTML =
            svg(child, 150, tipo === 'bed' ? 'dormindo' : 'feliz', { room: true, bed: tipo === 'bed' });
          UI.toast(`${Store.petOf(child.id).name} vestiu isso`, 'ok');
        }));
      },
    });
  }

  /* ---------- conversa com o bichinho ---------- */
  const ATALHOS = [
    'Oi!', 'Fiz minhas tarefas', 'Tô cansada', 'Me faz uma pergunta',
    'Como você tá?', 'Quero brincar', 'Tô com medo da prova', 'Te amo',
  ];

  /** resposta do bichinho: sai do que ele sabe sobre o dia dela */
  function responder(child, texto) {
    const t = String(texto || '').toLowerCase();
    const pet = Store.petOf(child.id);
    const st = Store.dayStatus(child.id, Store.today());
    const pendentes = Store.pendingEntries(child.id).length;
    const proximos = Store.upcomingEvents(child.id).filter((e) => !e.done);
    const bal = Store.balance(child.id);
    const meta = Number(child.goalAmount) || 0;

    if (/pergunt|quiz|desafi/.test(t)) return { texto: 'Deixa comigo, pensei numa aqui!', pergunta: true };
    if (/oi|olá|ola|eaí|opa|bom dia|boa tarde|boa noite/.test(t)) {
      return { texto: st.required && st.complete
        ? 'Oi! Hoje você já fez tudo, tô muito orgulhoso.'
        : `Oi! Faltam ${Math.max(0, st.required - st.filled)} tarefas do dia.` };
    }
    if (/tarefa|lição|licao|dever/.test(t)) {
      return { texto: pendentes
        ? `Você tem ${pendentes} lançamento(s) esperando validação. Já já o responsável vê.`
        : 'Marque as tarefas na aba Hoje que eu conto os pontos!' };
    }
    if (/prova|trabalho|test/.test(t)) {
      return { texto: proximos.length
        ? `${proximos[0].title} está marcado para ${Store.labelDate(proximos[0].date)}. Quer treinar no quiz?`
        : 'Não tem prova marcada na agenda. Quer anotar uma?' };
    }
    if (/cansad|sono|dormir/.test(t)) return { texto: 'Descansa um pouco. Eu vou cochilar aqui do seu lado.' };
    if (/trist|chate|medo|nervos|ansi/.test(t)) {
      return { texto: 'Vem cá, respira fundo. Uma coisa de cada vez, eu tô contigo.' };
    }
    if (/brinc|jog/.test(t)) return { texto: 'Aeee! Vamos na aba Jogos, escolhe um que eu topo.' };
    if (/dinheir|mesada|meta|saldo/.test(t)) {
      return { texto: meta
        ? `Você tem ${Store.money(bal)} e faltam ${Store.money(Math.max(0, meta - bal))} para ${child.goalName || 'a sua meta'}.`
        : `Você tem ${Store.money(bal)} para receber.` };
    }
    if (/amo|gosto|fofo|lindo/.test(t)) return { texto: 'Também gosto muito de você! Meu coração fez pum.' };
    if (/nome|quem é você|quem e voce/.test(t)) return { texto: `Eu sou o ${pet.name}, seu bichinho nível ${level(pet.xp)}.` };
    if (/como você tá|como voce ta|tudo bem/.test(t)) {
      return { texto: `Tô ${mood(child).label}. E você, como foi o seu dia?` };
    }
    return {
      texto: escolherFrase([
        'Entendi! Me conta mais.',
        'Anotei aqui na minha cabecinha.',
        'Legal! E o que mais aconteceu hoje?',
        'Você quer treinar alguma matéria comigo?',
        'Se quiser, eu te faço uma pergunta surpresa.',
      ]),
    };
  }

  const escolherFrase = (lista) => lista[Math.floor(Math.random() * lista.length)];

  function openChat(child) {
    const pet = Store.petOf(child.id);
    if (!Store.petChat(child.id).length) {
      Store.petSay(child.id, 'pet', phrase(child));
    }

    const linhas = () => Store.petChat(child.id).map((m) => `
      <div class="chat-line ${m.from === 'me' ? 'me' : 'pet'}">
        <span class="chat-bubble">${UI.esc(m.text)}</span>
      </div>`).join('');

    UI.openSheet({
      title: `Conversar com ${pet.name}`,
      subtitle: 'Escolha uma resposta ou escreva o que quiser contar',
      body: `
        <div class="chat-head">${svg(child, 74)}</div>
        <div class="chat-box" data-chat>${linhas()}</div>
        <div class="chat-atalhos">
          ${ATALHOS.map((a) => `<button class="chip-btn" data-atalho="${UI.esc(a)}">${UI.esc(a)}</button>`).join('')}
        </div>
        <form id="chat-form" class="chat-form">
          <div class="input-wrap">
            ${Icons.svg('chat')}
            <input name="texto" type="text" placeholder="Escreva para ${UI.esc(pet.name)}" autocomplete="off" />
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
        </form>`,
      actions: '<button class="btn btn-ghost btn-block" data-ok>Fechar</button>',
      onMount(sheet) {
        const box = sheet.querySelector('[data-chat]');
        const form = sheet.querySelector('#chat-form');
        const input = form.querySelector('input[name="texto"]');
        const rolar = () => { box.scrollTop = box.scrollHeight; };
        rolar();

        function enviar(texto) {
          const limpo = String(texto || '').trim();
          if (!limpo) return;
          Store.petSay(child.id, 'me', limpo);
          box.innerHTML = linhas();
          rolar();
          input.value = '';
          const resposta = responder(child, limpo);
          setTimeout(() => {
            Store.petSay(child.id, 'pet', resposta.texto);
            box.innerHTML = linhas();
            rolar();
            Voz.falar(resposta.texto, child, sheet);
            if (resposta.pergunta) {
              setTimeout(() => {
                UI.closeSheet();
                if (!Quiz.surpresa(child)) {
                  UI.toast('Crie um assunto no quiz para eu ter perguntas!');
                }
              }, 700);
            }
          }, 550);
        }

        sheet.querySelectorAll('[data-atalho]').forEach((b) =>
          b.addEventListener('click', () => enviar(b.getAttribute('data-atalho'))));
        form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          enviar(input.value);
        });
        sheet.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
      },
      onClose() { App.render(); },
    });
  }

  /* ---------- interação ---------- */
  function touch(child, el) {
    const res = Store.petCare(child.id);
    const stage = (el && el.closest('.pet-panel')) || document;
    const svgEl = stage.querySelector ? stage.querySelector('.pet-svg') : null;
    if (svgEl) {
      svgEl.classList.remove('is-happy');
      void svgEl.offsetWidth;
      svgEl.classList.add('is-happy');
    }
    if (!res.ok) {
      UI.toast(res.error);
      return;
    }
    Effects.burst('task', svgEl || el);
    const bubble = stage.querySelector ? stage.querySelector('[data-pet-bubble]') : null;
    if (bubble) {
      const falas = [
        'Que carinho bom!', 'Hihi, faz de novo!', 'Você é minha pessoa favorita.',
        'Tô cheio de energia agora!', 'Vamos fazer uma tarefa juntos?',
      ];
      const escolhida = falas[Math.floor(res.count % falas.length)];
      bubble.textContent = escolhida;
      Voz.falar(escolhida, child);
      bubble.classList.remove('pop');
      void bubble.offsetWidth;
      bubble.classList.add('pop');
    }
    if (res.levelUp) {
      Effects.burst('goal');
      UI.toast(`${Store.petOf(child.id).name} subiu para o nível ${level(Store.petOf(child.id).xp)}!`, 'ok');
    }
  }

  function bind(root, child, rerender) {
    root.querySelectorAll('[data-pet-touch]').forEach((b) =>
      b.addEventListener('click', () => touch(child, b)));
    root.querySelectorAll('[data-pet-open]').forEach((b) =>
      b.addEventListener('click', () => openSheet(child)));
    root.querySelectorAll('[data-pet-shop]').forEach((b) =>
      b.addEventListener('click', () => openShop(child)));
    root.querySelectorAll('[data-pet-chat]').forEach((b) =>
      b.addEventListener('click', () => openChat(child)));
    root.querySelectorAll('[data-pet-voice]').forEach((b) => b.addEventListener('click', () => {
      const pet = Store.petOf(child.id);
      const ligar = pet.voice === false;
      Store.savePet(child.id, { name: pet.name, voice: ligar });
      Voz.parar();
      UI.toast(ligar ? `${pet.name} vai falar em voz alta` : `${pet.name} ficou mudinho`);
      if (ligar) Voz.falar('Oi! Agora você me escuta.', child);
      App.render();
    }));
    root.querySelectorAll('[data-pet-nap]').forEach((b) => b.addEventListener('click', () => {
      const dormindo = Store.petSleeping(child.id);
      Store.petNap(child.id, dormindo ? 0 : 20);
      UI.toast(dormindo ? `${Store.petOf(child.id).name} acordou` : `${Store.petOf(child.id).name} foi tirar um cochilo`);
      App.render();
    }));
  }

  /* =======================================================
     Companheiro que fica solto na tela, acima da navegação.
     Ele brinca sozinho e responde ao toque, ao chacoalhão,
     ao aperto longo e às quedas.
     ======================================================= */
  const Buddy = (() => {
    const SIZE = 96;
    const GRAVIDADE = 0.9;
    const QUIQUE = 0.45;

    let el = null;
    let ball = null;
    let child = null;
    let raf = null;
    let idleTimer = null;
    let holdTimer = null;
    let dizzyTimer = null;
    let menuAberto = false;

    const pos = { x: 0, y: 0, vx: 0, vy: 0 };
    let dragging = false;
    let pressed = false;
    let pointerId = null;
    let pressStart = 0;
    let moved = 0;
    let quedaMax = 0;
    let shake = { dirs: 0, lastSign: 0, dist: 0, since: 0 };
    let estado = 'parado';
    let ultimaInteracao = Date.now();
    const registrarInteracao = () => { ultimaInteracao = Date.now(); };

    const reduced = () =>
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const chaoY = () => {
      const barra = document.querySelector('.side');
      const emBaixo = barra && getComputedStyle(barra).position === 'fixed';
      const folga = emBaixo ? barra.getBoundingClientRect().height + 26 : 28;
      return window.innerHeight - SIZE - folga;
    };
    const limiteX = () => window.innerWidth - SIZE - 10;

    function aplicar() {
      if (!el) return;
      el.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0)`;
    }

    function setEstado(novo) {
      if (!el || estado === novo) return;
      estado = novo;
      el.className = `pet-buddy is-${novo}`;
      const m = novo === 'dormindo' ? 'dormindo'
        : novo === 'tonto' || novo === 'derretendo' ? 'tonto'
        : novo === 'estudando' ? 'estudando'
        : novo === 'brincando' || novo === 'pulando' ? 'festa'
        : mood(child).id;
      el.querySelector('.pet-buddy-art').innerHTML = svg(child, SIZE, m);
      if (ball) ball.hidden = novo !== 'brincando';
    }

    /* ---------- física ---------- */
    function loop() {
      raf = null;
      if (!el || dragging) return;
      pos.vy += GRAVIDADE;
      pos.x += pos.vx;
      pos.y += pos.vy;

      if (pos.x < 10) { pos.x = 10; pos.vx = -pos.vx * 0.6; }
      if (pos.x > limiteX()) { pos.x = limiteX(); pos.vx = -pos.vx * 0.6; }
      if (pos.y < 6) { pos.y = 6; pos.vy = Math.abs(pos.vy) * 0.4; }  // bateu no teto

      const chao = chaoY();
      if (pos.y >= chao) {
        pos.y = chao;
        quedaMax = Math.max(quedaMax, Math.abs(pos.vy));
        if (Math.abs(pos.vy) > 2.4) {
          pos.vy = -pos.vy * QUIQUE;
          pos.vx *= 0.82;
          el.classList.remove('is-squash');
          void el.offsetWidth;
          el.classList.add('is-squash');
        } else {
          pos.vy = 0;
          pos.vx *= 0.7;
          if (Math.abs(pos.vx) < 0.2) pos.vx = 0;
          if (quedaMax > 17) {
            ficarTonto(`Uau! Que voo... tô tonto.`);
          } else if (estado === 'caindo') {
            setEstado('parado');
            agendarBrincadeira();
          }
          quedaMax = 0;
        }
      }
      aplicar();
      if (pos.vy !== 0 || pos.vx !== 0 || pos.y < chao) raf = requestAnimationFrame(loop);
    }

    const mover = () => { if (!raf) raf = requestAnimationFrame(loop); };

    /* ---------- reações ---------- */
    function fala(texto) {
      if (!el) return;
      const balao = el.querySelector('.buddy-bubble');
      balao.textContent = texto;
      balao.hidden = false;
      balao.classList.remove('pop');
      void balao.offsetWidth;
      balao.classList.add('pop');
      clearTimeout(balao._t);
      balao._t = setTimeout(() => { balao.hidden = true; }, 2600);
    }

    function ficarTonto(texto) {
      setEstado('tonto');
      fala(texto || 'Ei, para de me sacudir!');
      clearTimeout(dizzyTimer);
      dizzyTimer = setTimeout(() => {
        setEstado('parado');
        agendarBrincadeira();
      }, 4200);
    }

    function derreter() {
      setEstado('derretendo');
      fala('Tô derretendo...');
      Effects.burst('spend', el);
      clearTimeout(dizzyTimer);
      dizzyTimer = setTimeout(() => ficarTonto('Ufa, voltei. Que tontura!'), 1800);
    }

    /* ---------- menu em bolinhas em volta dele ---------- */
    const ACOES = [
      { id: 'dormir', label: 'Dormir', icone: 'moon', cor: '#a98cff' },
      { id: 'brincar', label: 'Brincar', icone: 'ball', cor: '#ffa24b' },
      { id: 'estudar', label: 'Estudar', icone: 'brain', cor: '#6fd3ff' },
      { id: 'conversar', label: 'Conversar', icone: 'chat', cor: '#79e3b5' },
      { id: 'atualizar', label: 'Atualizar', icone: 'refresh', cor: '#d6f154' },
    ];

    /** posiciona as cinco bolinhas num arco por cima do bichinho */
    function desenharMenu() {
      const dormindo = Store.petSleeping(child.id);
      const raio = 90;
      const inicio = 190;
      const passo = 40;
      return ACOES.map((a, idx) => {
        const ang = ((inicio + idx * passo) * Math.PI) / 180;
        const x = Math.round(SIZE / 2 + raio * Math.cos(ang) - 24);
        const y = Math.round(SIZE / 2 + raio * Math.sin(ang) - 24);
        const label = a.id === 'dormir' && dormindo ? 'Acordar' : a.label;
        const icone = a.id === 'dormir' && dormindo ? 'sun' : a.icone;
        return `
          <button type="button" class="pet-menu-bolha" data-acao="${a.id}"
                  style="left:${x}px; top:${y}px; background:${a.cor}; animation-delay:${idx * 45}ms"
                  aria-label="${label}">
            ${Icons.svg(icone)}
            <span class="pet-menu-nome" data-pos="${idx === 0 ? 'esq' : idx === ACOES.length - 1 ? 'dir' : 'cima'}">${label}</span>
          </button>`;
      }).join('');
    }

    function fecharMenu() {
      if (!el) return;
      menuAberto = false;
      const caixa = el.querySelector('.pet-menu');
      if (caixa) { caixa.hidden = true; caixa.innerHTML = ''; }
      el.classList.remove('is-menu');
    }

    function abrirMenu() {
      if (!el) return;
      menuAberto = true;
      const caixa = el.querySelector('.pet-menu');
      caixa.innerHTML = desenharMenu();
      caixa.hidden = false;
      el.classList.add('is-menu');
      caixa.querySelectorAll('[data-acao]').forEach((b) => {
        b.addEventListener('pointerdown', (ev) => ev.stopPropagation());
        b.addEventListener('click', (ev) => {
          ev.stopPropagation();
          escolher(b.getAttribute('data-acao'));
        });
      });
    }

    const alternarMenu = () => (menuAberto ? fecharMenu() : abrirMenu());

    function escolher(acao) {
      fecharMenu();
      registrarInteracao();
      if (acao === 'dormir') {
        const dormindo = Store.petSleeping(child.id);
        Store.petNap(child.id, dormindo ? 0 : 20);
        setEstado(dormindo ? 'parado' : 'dormindo');
        fala(dormindo ? 'Acordei! Bora?' : 'Vou tirar um cochilo...');
        App.render();
        return;
      }
      if (acao === 'brincar') {
        setEstado('brincando');
        fala('Joga a bola pra mim!');
        pos.vy = -12;
        mover();
        setTimeout(() => { if (estado === 'brincando') { setEstado('parado'); agendarBrincadeira(); } }, 6000);
        return;
      }
      if (acao === 'estudar') {
        setEstado('estudando');
        if (!Quiz.surpresa(child)) {
          fala('Ainda não tenho perguntas. Monta uma prova comigo!');
          Quiz.openProva(child);
        }
        return;
      }
      if (acao === 'conversar') { openChat(child); return; }
      openSheet(child);
    }

    /* ---------- brincadeiras sozinho ---------- */
    function agendarBrincadeira() {
      clearTimeout(idleTimer);
      if (reduced()) return;
      idleTimer = setTimeout(() => {
        if (!el || dragging || estado === 'tonto' || estado === 'derretendo') return agendarBrincadeira();
        const hora = new Date().getHours();
        const madrugada = hora >= 22 || hora < 6;
        const paradoHaMuito = Date.now() - ultimaInteracao > 12 * 60 * 1000;
        const temEstudo = child && Store.allCards(child.id).length >= 2;
        // ele só cochila de madrugada ou depois de muito tempo sem ninguém por perto
        const opcoes = madrugada
          ? ['dormindo', 'dormindo', 'parado']
          : paradoHaMuito
            ? ['parado', 'dormindo', 'andando', 'pulando']
            : temEstudo
              ? ['pulando', 'brincando', 'parado', 'andando', 'estudando', 'pergunta']
              : ['pulando', 'brincando', 'parado', 'andando', 'estudando'];
        const escolha = opcoes[Math.floor(Math.random() * opcoes.length)];

        if (escolha === 'pergunta') {
          setEstado('estudando');
          if (Quiz.surpresa(child)) {
            registrarInteracao();
          }
          agendarBrincadeira();
          return;
        }
        if (escolha === 'estudando') {
          setEstado('estudando');
          fala('Bora revisar uma matéria?');
          setTimeout(() => { if (estado === 'estudando') setEstado('parado'); }, 3200);
          agendarBrincadeira();
          return;
        }
        if (escolha === 'andando') {
          setEstado('parado');
          pos.vx = Math.random() > 0.5 ? 2.4 : -2.4;
          pos.vy = -6;
          mover();
        } else if (escolha === 'pulando') {
          setEstado('pulando');
          pos.vy = -13;
          mover();
          setTimeout(() => { if (estado === 'pulando') setEstado('parado'); }, 1200);
        } else {
          setEstado(escolha);
        }
        agendarBrincadeira();
      }, 5200 + Math.random() * 5200);
    }

    /* ---------- toque ---------- */
    function onDown(ev) {
      registrarInteracao();
      pressed = true;
      dragging = false;
      pointerId = ev.pointerId;
      pressStart = Date.now();
      moved = 0;
      quedaMax = 0;
      shake = { dirs: 0, lastSign: 0, dist: 0, since: Date.now() };
      el.setPointerCapture(ev.pointerId);
      el.classList.add('is-grab');
      clearTimeout(holdTimer);
      holdTimer = setTimeout(derreter, 4000);
    }

    function onMove(ev) {
      if (!pressed || ev.pointerId !== pointerId) return;
      const dx = ev.movementX || 0;
      const dy = ev.movementY || 0;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 8) {
        dragging = true;
        clearTimeout(holdTimer);
        if (menuAberto) fecharMenu();
        if (estado !== 'tonto' && estado !== 'derretendo') setEstado('segurado');
      }
      if (!dragging) return;

      pos.x = Math.max(10, Math.min(limiteX(), pos.x + dx));
      pos.y = Math.max(10, Math.min(window.innerHeight - SIZE - 6, pos.y + dy));
      pos.vx = dx;
      pos.vy = dy;
      aplicar();

      // chacoalhão: muitas trocas de direção em pouco tempo
      const sinal = Math.sign(dx);
      if (sinal && sinal !== shake.lastSign) {
        shake.dirs += 1;
        shake.lastSign = sinal;
      }
      shake.dist += Math.abs(dx);
      if (Date.now() - shake.since > 900) shake = { dirs: 0, lastSign: sinal, dist: 0, since: Date.now() };
      if (shake.dirs >= 5 && shake.dist > 130 && estado !== 'tonto') {
        shake = { dirs: 0, lastSign: 0, dist: 0, since: Date.now() };
        ficarTonto('Ei, para de me sacudir!');
      }
    }

    function onUp(ev) {
      if (!pressed) return;
      pressed = false;
      clearTimeout(holdTimer);
      el.classList.remove('is-grab');
      try { el.releasePointerCapture(ev.pointerId); } catch (e) { /* já solto */ }
      const rapido = Date.now() - pressStart < 500;

      if (!dragging && rapido) {
        alternarMenu();
        return;
      }
      dragging = false;
      if (estado === 'segurado') setEstado('caindo');
      pos.vx = Math.max(-22, Math.min(22, pos.vx * 1.6));
      pos.vy = Math.max(-24, Math.min(24, pos.vy * 1.4));
      mover();
    }

    /* ---------- ciclo de vida ---------- */
    function mount(user) {
      child = user;
      if (el) {
        el.querySelector('.pet-buddy-art').innerHTML = svg(child, SIZE, estado === 'tonto' ? 'tonto' : undefined);
        return;
      }
      el = document.createElement('div');
      el.className = 'pet-buddy is-parado';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'Seu bichinho. Toque para cuidar dele.');
      el.innerHTML = `
        <div class="buddy-bubble" hidden></div>
        <div class="pet-buddy-art">${svg(child, SIZE)}</div>
        <div class="pet-menu" hidden></div>`;
      document.body.appendChild(el);

      ball = document.createElement('span');
      ball.className = 'pet-ball';
      ball.hidden = true;
      document.body.appendChild(ball);

      pos.x = Math.min(limiteX(), window.innerWidth / 2 - SIZE / 2);
      pos.y = chaoY();
      aplicar();

      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alternarMenu(); }
        if (ev.key === 'Escape') fecharMenu();
      });
      document.addEventListener('pointerdown', (ev) => {
        if (menuAberto && el && !el.contains(ev.target)) fecharMenu();
      });
      document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') fecharMenu();
      });
      window.addEventListener('resize', () => {
        pos.x = Math.min(pos.x, limiteX());
        pos.y = Math.min(pos.y, chaoY());
        aplicar();
        if (ball) posicionarBola();
      });

      agendarBrincadeira();
      requestAnimationFrame(function seguirBola() {
        if (!el) return;
        if (estado === 'brincando') posicionarBola();
        requestAnimationFrame(seguirBola);
      });
    }

    function posicionarBola() {
      if (!ball) return;
      ball.style.transform = `translate3d(${Math.round(pos.x + SIZE - 12)}px, ${Math.round(pos.y + SIZE - 34)}px, 0)`;
    }

    function unmount() {
      menuAberto = false;
      clearTimeout(idleTimer);
      clearTimeout(holdTimer);
      clearTimeout(dizzyTimer);
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (el) el.remove();
      if (ball) ball.remove();
      el = null;
      ball = null;
      child = null;
      estado = 'parado';
    }

    return { mount, unmount, fala, setEstado, registrarInteracao };
  })();

  return {
    svg, panel, bind, openSheet, openChat, touch, mood, phrase, Voz,
    mountBuddy: Buddy.mount, unmountBuddy: Buddy.unmount, buddySay: Buddy.fala,
    openShop, outfit, bed, room, roomSvg, ringSvg, previewSvg, faltaParaSubir,
    level, progress, COLORS, SHAPES, ACCESSORIES, OUTFITS, BEDS, ROOMS, catalogo,
    XP_POR_NIVEL, CARINHOS_POR_DIA,
  };
})();

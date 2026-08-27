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
      id: 'blob', label: 'Redondinho', level: 1,
      path: 'M100 12c40 0 76 26 82 64 6 40-8 76-40 96-30 18-74 18-104 0C6 152-8 116-2 76 4 38 60 12 100 12z',
      fit: { tx: 0, ty: 0, sx: 1, sy: 1 },      // ajuste da roupinha em cada corpo
    },
    {
      id: 'drop', label: 'Gotinha', level: 1,
      path: 'M100 8c34 30 74 62 74 106a74 74 0 1 1-148 0C26 70 66 38 100 8z',
      fit: { tx: 0, ty: 8, sx: 1.14, sy: 1.05 },
    },
    {
      id: 'bean', label: 'Feijãozinho', level: 1,
      path: 'M52 22c40-18 96-8 118 30 20 34 6 78-16 108-22 30-70 42-104 26C14 170-2 128 4 92 10 56 24 34 52 22z',
      fit: { tx: -4, ty: 6, sx: 1.04, sy: 1.02 },
    },
    {
      id: 'star', label: 'Estrelinha', level: 2,
      path: 'M100 6c14 30 26 42 58 50-26 20-34 34-30 66 4 30-14 44-28 60-14-16-32-30-28-60 4-32-4-46-30-66 32-8 44-20 58-50z',
      fit: { tx: 0, ty: -12, sx: .58, sy: .72 },
    },
    {
      id: 'gato', label: 'Gatinho', level: 3,
      path: 'M46 46l-6-34 34 20c16-6 36-6 52 0l34-20-6 34c14 16 20 36 18 56-4 40-32 62-72 62s-68-22-72-62c-2-20 4-40 18-56z',
      fit: { tx: 0, ty: 6, sx: 1.02, sy: 1 },
    },
    {
      id: 'coelho', label: 'Coelhinho', level: 4,
      path: 'M70 66C60 44 56 20 66 10c12-12 22 12 24 44 6-2 14-2 20 0 2-32 12-56 24-44 10 10 6 34-4 56 20 14 30 34 28 56-4 38-30 58-58 58s-54-20-58-58c-2-22 8-42 28-56z',
      fit: { tx: 0, ty: 14, sx: .94, sy: .96 },
    },
    {
      id: 'urso', label: 'Ursinho', level: 5,
      path: 'M52 52a22 22 0 1 1 22-22 88 88 0 0 1 52 0 22 22 0 1 1 22 22c14 16 20 36 18 56-4 40-32 62-72 62s-68-22-72-62c-2-20 4-40 18-56z',
      fit: { tx: 0, ty: 6, sx: 1.02, sy: 1 },
    },
    {
      id: 'robo', label: 'Robozinho', level: 6,
      path: 'M100 8v22M84 30h32a44 44 0 0 1 44 44v56a44 44 0 0 1-44 44H84a44 44 0 0 1-44-44V74a44 44 0 0 1 44-44z',
      fit: { tx: 0, ty: 4, sx: 1, sy: 1 },
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

  /** cores de parede, liberadas aos poucos */
  const PAREDES = [
    { id: 'nuvem', label: 'Nuvem', hex: '#e8f0ff', level: 1 },
    { id: 'menta', label: 'Menta', hex: '#d9f7ea', level: 1 },
    { id: 'algodao', label: 'Algodão', hex: '#ffe6f2', level: 1 },
    { id: 'areia', label: 'Areia', hex: '#fdf0d5', level: 2 },
    { id: 'lavanda', label: 'Lavanda', hex: '#ece4ff', level: 3 },
    { id: 'ceu', label: 'Céu', hex: '#d5efff', level: 4 },
    { id: 'limao', label: 'Limão', hex: '#eef9c8', level: 5 },
    { id: 'noite', label: 'Noite', hex: '#191a4d', level: 6 },
  ];

  /** cores de chão */
  const CHAOS = [
    { id: 'madeira', label: 'Madeira', hex: '#e0b184', level: 1 },
    { id: 'azulejo', label: 'Azulejo', hex: '#a9c4ff', level: 1 },
    { id: 'grama', label: 'Grama', hex: '#4fc78f', level: 1 },
    { id: 'areia-chao', label: 'Areia', hex: '#ffdf8c', level: 2 },
    { id: 'rosado', label: 'Rosado', hex: '#ffc2de', level: 3 },
    { id: 'cinza', label: 'Cinza', hex: '#cfd3e6', level: 4 },
    { id: 'uva', label: 'Uva', hex: '#8f6ff0', level: 5 },
    { id: 'espacial-chao', label: 'Espacial', hex: '#2b3390', level: 6 },
  ];

  /** cada cantinho do quarto aceita um móvel de cada vez */
  const SLOTS = [
    { id: 'pdEsq', label: 'Parede à esquerda' },
    { id: 'pdDir', label: 'Parede à direita' },
    { id: 'chEsq', label: 'Cantinho da esquerda' },
    { id: 'chDir', label: 'Cantinho da direita' },
    { id: 'chao', label: 'No chão' },
    { id: 'alto', label: 'No teto' },
  ];

  /** móveis que ela ganha subindo de nível */
  const MOVEIS = [
    { id: 'janela', label: 'Janela', slot: 'pdEsq', level: 1, cor: '#ffffff' },
    { id: 'quadro', label: 'Quadro', slot: 'pdEsq', level: 3, cor: '#ff8fc8' },
    { id: 'prateleira', label: 'Prateleira', slot: 'pdEsq', level: 5, cor: '#ffa24b' },
    { id: 'relogio', label: 'Relógio', slot: 'pdDir', level: 2, cor: '#ffd84b' },
    { id: 'tv', label: 'Televisão', slot: 'pdDir', level: 4, cor: '#131338' },
    { id: 'mural', label: 'Mural de fotos', slot: 'pdDir', level: 6, cor: '#6fd3ff' },
    { id: 'estante', label: 'Estante de livros', slot: 'chEsq', level: 1, cor: '#ffa24b' },
    { id: 'planta', label: 'Plantinha', slot: 'chEsq', level: 2, cor: '#4fc78f' },
    { id: 'violao', label: 'Violão', slot: 'chEsq', level: 5, cor: '#e0b184' },
    { id: 'mesa', label: 'Mesinha de estudo', slot: 'chDir', level: 1, cor: '#a98cff' },
    { id: 'pufe', label: 'Pufe', slot: 'chDir', level: 3, cor: '#6fd3ff' },
    { id: 'bau', label: 'Baú de brinquedos', slot: 'chDir', level: 6, cor: '#ff8fc8' },
    { id: 'tapete', label: 'Tapete', slot: 'chao', level: 2, cor: '#ff8fc8' },
    { id: 'almofadas', label: 'Almofadas', slot: 'chao', level: 4, cor: '#79e3b5' },
    { id: 'lustre', label: 'Luminária', slot: 'alto', level: 3, cor: '#ffd84b' },
    { id: 'bandeirinhas', label: 'Bandeirinhas', slot: 'alto', level: 5, cor: '#a98cff' },
  ];

  /** temas prontos: arrumam parede, chão e móveis de uma vez */
  const ROOMS = [
    { id: 'quartinho', label: 'Quartinho', level: 1, cor: '#cfe0ff',
      parede: 'nuvem', piso: 'azulejo', moveis: ['janela', 'mesa'] },
    { id: 'jardim', label: 'Jardim', level: 1, cor: '#79e3b5',
      parede: 'menta', piso: 'grama', moveis: ['planta'] },
    { id: 'praia', label: 'Praia', level: 3, cor: '#ffd84b',
      parede: 'ceu', piso: 'areia-chao', moveis: ['janela', 'pufe'] },
    { id: 'espaco', label: 'Espaço', level: 5, cor: '#3b4fe4',
      parede: 'noite', piso: 'espacial-chao', moveis: ['relogio', 'lustre'] },
    { id: 'castelo', label: 'Castelo', level: 7, cor: '#a98cff',
      parede: 'lavanda', piso: 'uva', moveis: ['quadro', 'bau', 'tapete'] },
  ];

  const XP_POR_NIVEL = 60;
  const CARINHOS_POR_DIA = 5;

  /* ---------- fases de vida ----------
     O bichinho não muda só de número: ele cresce junto com ela. A cada
     fase o corpo muda de tamanho e de jeito, e aparecem partes novas.
     ------------------------------------------------------------------ */
  const FASES = [
    {
      id: 'filhote', nome: 'Filhotinho', nivel: 1, escala: 0.62, olhos: 1.16,
      conta: 'Acabou de nascer. Cabeção, olho enorme e um cachinho na cabeça.',
      vira: 'Com o nível 3 ele vira Criancinha.',
    },
    {
      id: 'crianca', nome: 'Criancinha', nivel: 3, escala: 0.71, olhos: 1.08,
      conta: 'Cresceu um tanto e ganhou orelhinhas.',
      vira: 'Com o nível 6 ele vira Jovem.',
    },
    {
      id: 'jovem', nome: 'Jovem', nivel: 6, escala: 0.79, olhos: 1,
      conta: 'Ficou do tamanho de gente grande, com topete e sardinhas.',
      vira: 'Com o nível 10 ele fica Crescido.',
    },
    {
      id: 'crescido', nome: 'Crescido', nivel: 10, escala: 0.86, olhos: 0.95,
      conta: 'Maior, com sobrancelha e cara de quem já sabe das coisas.',
      vira: 'Com o nível 15 ele vira Lendário.',
    },
    {
      id: 'lendario', nome: 'Lendário', nivel: 15, escala: 0.92, olhos: 0.92,
      conta: 'A última fase: ganhou uma auréola dourada e estrelas em volta.',
      vira: 'Essa é a última fase. Daqui ele só fica mais forte.',
    },
  ];

  /** a fase de vida de um nível */
  function fase(lv) {
    let atual = FASES[0];
    FASES.forEach((f) => { if ((lv || 1) >= f.nivel) atual = f; });
    return atual;
  }

  /** a fase seguinte, ou null quando já chegou na última */
  const proximaFase = (lv) => FASES.find((f) => f.nivel > (lv || 1)) || null;

  const color = (id) => COLORS.find((c) => c.id === id) || COLORS[0];
  const shape = (id) => SHAPES.find((s) => s.id === id) || SHAPES[0];
  const level = (xp) => Math.floor((xp || 0) / XP_POR_NIVEL) + 1;
  const progress = (xp) => ((xp || 0) % XP_POR_NIVEL) / XP_POR_NIVEL;
  const unlocked = (lv) => ACCESSORIES.filter((a) => a.level <= lv);
  const outfit = (id) => OUTFITS.find((o) => o.id === id) || OUTFITS[0];
  const bed = (id) => BEDS.find((b) => b.id === id) || BEDS[0];
  const room = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0];
  const faltaParaSubir = (xp) => XP_POR_NIVEL - ((xp || 0) % XP_POR_NIVEL);


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
  /** há quantos dias ela não marca nada; 99 quando nunca marcou */
  function diasSemAparecer(childId) {
    const historico = Store.historyOf(childId, 30);
    if (!historico.length) return 99;
    const ultimo = historico[0].date;
    return Math.max(0, -Store.daysUntil(ultimo));
  }

  /**
   * O humor sai do que está acontecendo de verdade, nunca de um contador
   * escondido. A ordem importa: o que é mais forte vem primeiro.
   */
  function mood(child) {
    const hoje = Store.today();
    const st = Store.dayStatus(child.id, hoje);
    const doDia = Store.entriesOf(child.id, hoje);
    const recusados = doDia.filter((e) => e.status === 'rejected').length;
    const eventos = Store.upcomingEvents(child.id).filter((e) => !e.done);
    const atrasados = eventos.filter((e) => Store.daysUntil(e.date) < 0).length;
    const amanha = eventos.filter((e) => Store.daysUntil(e.date) >= 0 && Store.daysUntil(e.date) <= 1).length;
    const leuHoje = doDia.some((e) => Store.entryIsReading(e) || /leitur|livro|ler /i.test(e.catName || ''));
    const carinhos = CARINHOS_POR_DIA - Store.petCareLeft(child.id);
    const sumida = diasSemAparecer(child.id);
    const hora = new Date().getHours();

    if (Store.petSleeping(child.id)) return { id: 'dormindo', label: 'tirando um cochilo' };
    if (recusados) return { id: 'triste', label: 'meio triste' };
    if (sumida >= 3) return { id: 'saudade', label: 'com saudade de você' };
    if (atrasados) return { id: 'assustado', label: 'assustado com o atraso' };
    // dia completo e com leitura é o motivo de mais orgulho que existe
    if (st.required && st.complete && leuHoje) return { id: 'orgulhoso', label: 'muito orgulhoso' };
    if (st.required && st.complete) return { id: 'festa', label: 'em festa' };
    if (carinhos >= 4) return { id: 'amoroso', label: 'derretido de carinho' };
    if (leuHoje) return { id: 'animado', label: 'animado com a leitura' };
    if (amanha) return { id: 'curioso', label: 'curioso com o que vem aí' };
    if (hora >= 21 && hora < 22) return { id: 'sonolento', label: 'morrendo de sono' };
    if (hora >= 22 || hora < 6) return { id: 'dormindo', label: 'dormindo' };
    if (doDia.length) return { id: 'feliz', label: 'contente' };
    if (st.required && hora >= 17) return { id: 'preocupado', label: 'preocupado com o dia' };
    if (sumida >= 1) return { id: 'entediado', label: 'entediado' };
    return { id: 'feliz', label: 'esperando você' };
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

  const parede = (id) => PAREDES.find((p) => p.id === id) || PAREDES[0];
  const chao = (id) => CHAOS.find((c) => c.id === id) || CHAOS[0];
  const movel = (id) => MOVEIS.find((m) => m.id === id) || null;

  /** o quarto do bichinho já com os padrões preenchidos */
  function quartoDe(pet) {
    const tema = ROOMS.find((r) => r.id === pet.room) || ROOMS[0];
    return {
      tema: tema.id,
      parede: pet.parede || tema.parede,
      piso: pet.piso || tema.piso,
      moveis: Array.isArray(pet.moveis) ? pet.moveis : tema.moveis.slice(),
    };
  }

  /** desenho de cada móvel, no cantinho que é dele */
  function movelSvg(id) {
    const m = movel(id);
    if (!m) return '';
    const traco = 'stroke="#131338" stroke-width="4" stroke-linejoin="round"';
    if (id === 'janela') {
      return `<g><rect x="12" y="34" width="52" height="46" rx="9" fill="#cfeaff" ${traco}/>
        <path d="M38 34v46M12 57h52" stroke="#131338" stroke-width="4"/>
        <rect x="12" y="34" width="52" height="46" rx="9" fill="none" ${traco}/></g>`;
    }
    if (id === 'quadro') {
      return `<g><rect x="14" y="34" width="48" height="42" rx="7" fill="${m.cor}" ${traco}/>
        <path d="M22 66l12-16 10 12 8-8 10 12z" fill="#fff" ${traco}/>
        <circle cx="50" cy="46" r="5" fill="#ffd84b" ${traco}/></g>`;
    }
    if (id === 'prateleira') {
      return `<g><rect x="10" y="66" width="56" height="8" rx="4" fill="${m.cor}" ${traco}/>
        <rect x="18" y="44" width="11" height="22" rx="2" fill="#ff8fc8" ${traco}/>
        <rect x="32" y="38" width="11" height="28" rx="2" fill="#6fd3ff" ${traco}/>
        <rect x="46" y="48" width="11" height="18" rx="2" fill="#79e3b5" ${traco}/></g>`;
    }
    if (id === 'relogio') {
      return `<g><circle cx="164" cy="52" r="22" fill="${m.cor}" ${traco}/>
        <path d="M164 40v13l9 7" stroke="#131338" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    }
    if (id === 'tv') {
      return `<g><rect x="132" y="34" width="58" height="42" rx="7" fill="${m.cor}" ${traco}/>
        <rect x="140" y="42" width="42" height="26" rx="4" fill="#6fd3ff"/>
        <path d="M155 76v8h12v-8" fill="none" ${traco}/></g>`;
    }
    if (id === 'mural') {
      return `<g><rect x="132" y="32" width="58" height="46" rx="7" fill="${m.cor}" ${traco}/>
        <rect x="140" y="40" width="18" height="14" rx="2" fill="#fff" ${traco}/>
        <rect x="164" y="40" width="18" height="14" rx="2" fill="#fff" ${traco}/>
        <rect x="152" y="58" width="18" height="14" rx="2" fill="#fff" ${traco}/></g>`;
    }
    if (id === 'estante') {
      return `<g><rect x="8" y="84" width="52" height="68" rx="7" fill="${m.cor}" ${traco}/>
        <path d="M8 110h52M8 132h52" stroke="#131338" stroke-width="4"/>
        <rect x="14" y="90" width="9" height="18" rx="2" fill="#ff8fc8" ${traco}/>
        <rect x="26" y="92" width="9" height="16" rx="2" fill="#6fd3ff" ${traco}/>
        <rect x="38" y="88" width="9" height="20" rx="2" fill="#79e3b5" ${traco}/>
        <rect x="16" y="114" width="9" height="16" rx="2" fill="#ffd84b" ${traco}/></g>`;
    }
    if (id === 'planta') {
      return `<g><path d="M22 152l-4-30h34l-4 30z" fill="#ffa24b" ${traco}/>
        <path d="M36 122V96M36 104c-14 0-18-14-6-18 8-2 12 6 6 18zM36 106c14-2 20-16 8-20-8-2-14 8-8 20z"
              fill="${m.cor}" ${traco}/></g>`;
    }
    if (id === 'violao') {
      return `<g>
        <path d="M32 62v40" stroke="#131338" stroke-width="7" stroke-linecap="round"/>
        <rect x="24" y="52" width="16" height="14" rx="4" fill="#131338"/>
        <ellipse cx="32" cy="112" rx="17" ry="15" fill="${m.cor}" ${traco}/>
        <ellipse cx="32" cy="136" rx="22" ry="19" fill="${m.cor}" ${traco}/>
        <circle cx="32" cy="122" r="6" fill="#131338"/></g>`;
    }
    if (id === 'mesa') {
      return `<g><path d="M150 112v-18h24v18z" fill="#ffd84b" ${traco}/>
        <rect x="134" y="112" width="56" height="12" rx="6" fill="${m.cor}" ${traco}/>
        <path d="M142 124v28M182 124v28" stroke="#131338" stroke-width="5" stroke-linecap="round"/></g>`;
    }
    if (id === 'pufe') {
      return `<g><ellipse cx="164" cy="136" rx="28" ry="18" fill="${m.cor}" ${traco}/>
        <path d="M140 132c14 8 34 8 48 0" fill="none" stroke="#131338" stroke-width="3" opacity=".5"/></g>`;
    }
    if (id === 'bau') {
      return `<g><rect x="134" y="116" width="56" height="36" rx="7" fill="${m.cor}" ${traco}/>
        <path d="M134 128h56" stroke="#131338" stroke-width="4"/>
        <rect x="156" y="122" width="12" height="12" rx="3" fill="#ffd84b" ${traco}/></g>`;
    }
    if (id === 'tapete') {
      return `<ellipse cx="100" cy="170" rx="66" ry="20" fill="${m.cor}" ${traco}/>`;
    }
    if (id === 'almofadas') {
      return `<g><rect x="60" y="158" width="34" height="26" rx="9" fill="${m.cor}" ${traco}/>
        <rect x="106" y="162" width="32" height="22" rx="8" fill="#ffd84b" ${traco}/></g>`;
    }
    if (id === 'lustre') {
      return `<g><path d="M100 0v20" stroke="#131338" stroke-width="4"/>
        <path d="M78 44c0-14 10-24 22-24s22 10 22 24z" fill="${m.cor}" ${traco}/></g>`;
    }
    if (id === 'bandeirinhas') {
      return `<g><path d="M4 16q96 26 192 0" fill="none" stroke="#131338" stroke-width="3"/>
        ${[20, 56, 92, 128, 164].map((x, i) => {
          const cores = ['#ff8fc8', '#6fd3ff', '#ffd84b', '#79e3b5', '#a98cff'];
          const y = 20 + (i === 2 ? 6 : i === 1 || i === 3 ? 5 : 2);
          return `<path d="M${x} ${y}h20l-10 20z" fill="${cores[i]}" ${traco}/>`;
        }).join('')}</g>`;
    }
    return '';
  }

  /** cenário do quarto: parede, chão e os móveis escolhidos */
  function roomSvg(quarto) {
    const q = typeof quarto === 'string'
      ? quartoDe({ room: quarto })
      : quarto;
    const cp = parede(q.parede).hex;
    const cc = chao(q.piso).hex;
    const noite = q.parede === 'noite';
    return `
      <rect x="0" y="0" width="200" height="200" rx="26" fill="${cp}"/>
      ${noite ? `<g fill="#fff" opacity=".9">
        <circle cx="30" cy="24" r="3"/><circle cx="70" cy="14" r="2.2"/><circle cx="150" cy="20" r="3.2"/>
        <circle cx="186" cy="60" r="2.4"/><circle cx="16" cy="80" r="2.2"/><circle cx="120" cy="30" r="2"/></g>` : ''}
      <path d="M0 152h200v22a26 26 0 0 1-26 26H26A26 26 0 0 1 0 174z" fill="${cc}"/>
      <path d="M0 152h200" stroke="#131338" stroke-width="3" opacity=".25"/>
      ${(q.moveis || []).map((id) => movelSvg(id)).join('')}`;
  }

  /* ---------- carinhas ----------
     Os olhos e a boca saem de duas listas, e cada humor escolhe um par.
     Assim dá para acrescentar sentimento novo sem redesenhar tudo.
     ------------------------------------------------------------------ */

  /** olho redondo e brilhante, do jeito que criança desenha */
  function olhoFofo(cx, cy, opcoes) {
    const o = opcoes || {};
    const rx = o.rx || 19;
    const ry = o.ry || 21;
    const pupila = o.pupila || 10;
    const dy = o.dy === undefined ? 3 : o.dy;
    return `
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="#131338" stroke-width="3.5"/>
      <circle class="pet-pupil" cx="${cx + (o.dx || 0)}" cy="${cy + dy}" r="${pupila}" fill="#131338"/>
      <circle cx="${cx - pupila * 0.45}" cy="${cy + dy - pupila * 0.5}" r="${pupila * 0.42}" fill="#fff"/>
      <circle cx="${cx + pupila * 0.5}" cy="${cy + dy + pupila * 0.45}" r="${pupila * 0.2}" fill="#fff" opacity=".85"/>`;
  }

  /** coraçãozinho, usado nos olhos apaixonados e flutuando em volta */
  const coracao = (cx, cy, r, cor) => `
    <path d="M${cx} ${cy + r * 0.85}
             c-${r * 1.15} -${r * 0.8} -${r * 0.75} -${r * 1.75} 0 -${r * 0.95}
             c${r * 0.75} -${r * 0.8} ${r * 1.15} ${r * 0.15} 0 ${r * 0.95}z"
          fill="${cor || '#ff5f9e'}" stroke="#131338" stroke-width="3" stroke-linejoin="round"/>`;

  /** cada par de olhos entra num grupo, para a fase poder aumentar */
  const olhar = (svgOlhos) => `<g class="pet-olhos">${svgOlhos}</g>`;

  const OLHOS_BASE = {
    normal: olhoFofo(74, 98) + olhoFofo(126, 98),
    grande: olhoFofo(74, 96, { rx: 22, ry: 24, pupila: 12 }) + olhoFofo(126, 96, { rx: 22, ry: 24, pupila: 12 }),
    // olhando para os lados, curioso
    curioso: olhoFofo(74, 97, { dx: 5, rx: 20, ry: 22 }) + olhoFofo(126, 97, { dx: 5, rx: 20, ry: 22 }),
    // fechadinhos e arqueados: a cara de quem está muito contente
    felizes: `<g fill="none" stroke="#131338" stroke-width="7" stroke-linecap="round">
        <path d="M60 104q14-18 28 0"/><path d="M112 104q14-18 28 0"/></g>`,
    dormindo: `<g fill="none" stroke="#131338" stroke-width="7" stroke-linecap="round">
        <path d="M60 98q14 16 28 0"/><path d="M112 98q14 16 28 0"/></g>`,
    // metade da pálpebra caída, de sono
    sonolentos: `<g>
        ${olhoFofo(74, 100, { ry: 18, pupila: 9, dy: 4 })}
        ${olhoFofo(126, 100, { ry: 18, pupila: 9, dy: 4 })}
        <path d="M55 92q19-9 38 0M107 92q19-9 38 0" fill="none" stroke="#131338" stroke-width="9" stroke-linecap="round"/>
      </g>`,
    // reta em cima do olho: entediado
    entediados: `<g>
        ${olhoFofo(74, 100, { ry: 16, pupila: 8, dy: 3 })}
        ${olhoFofo(126, 100, { ry: 16, pupila: 8, dy: 3 })}
        <path d="M56 86h36M108 86h36" stroke="#131338" stroke-width="7" stroke-linecap="round"/>
      </g>`,
    apaixonados: `<g class="pet-coracoes">
        ${coracao(74, 88, 17)}${coracao(126, 88, 17)}</g>`,
    estrelas: `<g class="pet-estrelinhas" stroke="#131338" stroke-width="3" stroke-linejoin="round" fill="#ffd84b">
        <path d="M74 78l6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z"/>
        <path d="M126 78l6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z"/></g>`,
    chorosos: `<g>
        ${olhoFofo(74, 98, { rx: 18, ry: 21, dy: 5 })}
        ${olhoFofo(126, 98, { rx: 18, ry: 21, dy: 5 })}
        <path d="M55 88q19-12 38-2M107 86q19-10 38 2" fill="none" stroke="#131338" stroke-width="6" stroke-linecap="round"/>
      </g>`,
    assustados: `<g>
        ${olhoFofo(74, 96, { rx: 23, ry: 25, pupila: 7, dy: 0 })}
        ${olhoFofo(126, 96, { rx: 23, ry: 25, pupila: 7, dy: 0 })}
      </g>`,
    xis: `<g fill="none" stroke="#131338" stroke-width="7" stroke-linecap="round">
        <path d="M62 88l24 16M86 88l-24 16"/><path d="M114 88l24 16M138 88l-24 16"/></g>`,
    rodando: `<g fill="none" stroke="#131338" stroke-width="6" stroke-linecap="round">
        <path d="M74 98m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0M74 98m-8 0a8 8 0 1 0 16 0"/>
        <path d="M126 98m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0M126 98m-8 0a8 8 0 1 0 16 0"/></g>`,
  };

  const OLHOS = Object.keys(OLHOS_BASE).reduce((acc, k) => {
    acc[k] = olhar(OLHOS_BASE[k]);
    return acc;
  }, {});

  const BOCAS = {
    sorriso: '<path d="M76 132q24 26 48 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>',
    sorrisao: '<path d="M74 130q26 34 52 0q-26 13-52 0z" fill="#131338"/>',
    // aberta com a linguinha aparecendo
    gargalhada: `<path d="M70 126q30 40 60 0q-30 16-60 0z" fill="#131338"/>
      <path d="M92 145q8 9 16 0z" fill="#ff8fc8"/>`,
    triste: '<path d="M78 144q22-22 44 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>',
    reta: '<path d="M82 138h36" stroke="#131338" stroke-width="8" stroke-linecap="round"/>',
    ondinha: '<path d="M76 138q12 14 24 0t24 0" stroke="#131338" stroke-width="7" fill="none" stroke-linecap="round"/>',
    bocejo: '<ellipse cx="100" cy="134" rx="14" ry="15" fill="#131338"/>',
    dormindo: '<ellipse cx="100" cy="134" rx="11" ry="12" fill="#131338"/>',
    o: '<ellipse cx="100" cy="135" rx="11" ry="12" fill="#131338"/>',
    aberta: '<path d="M76 122q24 22 48 0 2 32-24 32t-24-32z" fill="#131338"/>',
    orgulho: `<path d="M74 130q26 26 52 0" stroke="#131338" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M88 122q12-8 24 0" stroke="#131338" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`,
  };

  /** bochecha rosada: é ela que deixa a carinha fofa */
  const bochechas = (op = 0.6, ry = 9) => `
    <g class="pet-bochecha" fill="#ff8fc8" opacity="${op}">
      <ellipse cx="48" cy="120" rx="15" ry="${ry}"/>
      <ellipse cx="152" cy="120" rx="15" ry="${ry}"/>
    </g>`;

  /** o que flutua em volta da cabeça em cada sentimento */
  const ENFEITES = {
    zzz: `<g class="pet-zzz" fill="#131338" font-family="Archivo,Arial" font-weight="900"
             stroke="#fff" stroke-width="5" paint-order="stroke">
        <text x="146" y="52" font-size="26">z</text><text x="172" y="30" font-size="18">z</text></g>`,
    brilhos: `<g class="pet-spark" fill="#ffd84b" stroke="#131338" stroke-width="2.5" stroke-linejoin="round">
        <path d="M34 62l4 9 9 2-7 6 2 10-8-5-8 5 2-10-7-6 9-2z"/>
        <path d="M168 72l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/>
        <path d="M158 36l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></g>`,
    coracoes: `<g class="pet-love">
        ${coracao(36, 62, 11)}${coracao(166, 70, 9)}${coracao(152, 34, 7)}</g>`,
    interrogacao: `<g class="pet-pergunta" fill="#131338" font-family="Archivo,Arial" font-weight="900"
             stroke="#fff" stroke-width="6" paint-order="stroke">
        <text x="150" y="50" font-size="42">?</text></g>`,
    gota: `<g class="pet-gota" fill="#6fd3ff" stroke="#131338" stroke-width="3.5" stroke-linejoin="round">
        <path d="M158 62q10 14 10 21a10 10 0 0 1-20 0q0-7 10-21z"/></g>`,
    lagrima: `<g class="pet-lagrima" fill="#6fd3ff" stroke="#131338" stroke-width="3">
        <path d="M58 118q7 11 7 16a7 7 0 0 1-14 0q0-5 7-16z"/>
        <path d="M142 120q6 9 6 13a6 6 0 0 1-12 0q0-4 6-13z"/></g>`,
    estrelinhas: `<g class="pet-stars" fill="#ffd84b" stroke="#131338" stroke-width="3">
        <path d="M40 44l5 11 12 2-9 8 3 12-11-6-11 6 3-12-9-8 12-2z"/>
        <path d="M160 38l4 9 10 2-7 7 2 10-9-5-9 5 2-10-7-7 10-2z"/></g>`,
    haha: `<g class="pet-haha" fill="#131338" font-family="Archivo,Arial" font-weight="900"
             stroke="#fff" stroke-width="6" stroke-linejoin="round" paint-order="stroke">
        <text x="140" y="42" font-size="24">ha</text><text x="18" y="60" font-size="18">ha</text></g>`,
    nota: `<g class="pet-nota" fill="#131338" stroke="#fff" stroke-width="4" paint-order="stroke">
        <path d="M150 30v34a11 9 0 1 1-7-8V38l22-5v26a11 9 0 1 1-7-8V26z"/></g>`,
    suspiro: `<g class="pet-suspiro" fill="none" stroke="#131338" stroke-width="5" stroke-linecap="round" opacity=".55">
        <path d="M128 150q14-6 22 2"/><path d="M136 162q16-5 24 4"/></g>`,
  };

  /**
   * A carinha de cada sentimento: quais olhos, qual boca, o que flutua
   * em volta e o quanto a bochecha fica corada.
   */
  const HUMORES = {
    feliz: { olhos: 'normal', boca: 'sorriso', bochecha: 0.55 },
    festa: { olhos: 'felizes', boca: 'sorrisao', enfeite: 'brilhos', bochecha: 0.7 },
    animado: { olhos: 'estrelas', boca: 'sorrisao', enfeite: 'brilhos', bochecha: 0.7 },
    orgulhoso: { olhos: 'felizes', boca: 'orgulho', enfeite: 'brilhos', bochecha: 0.6 },
    amoroso: { olhos: 'apaixonados', boca: 'sorrisao', enfeite: 'coracoes', bochecha: 0.85 },
    rindo: { olhos: 'felizes', boca: 'gargalhada', enfeite: 'haha', bochecha: 0.7 },
    curioso: { olhos: 'curioso', boca: 'o', enfeite: 'interrogacao', bochecha: 0.5 },
    triste: { olhos: 'chorosos', boca: 'triste', bochecha: 0.35 },
    saudade: { olhos: 'chorosos', boca: 'triste', enfeite: 'lagrima', bochecha: 0.35 },
    preocupado: { olhos: 'grande', boca: 'ondinha', enfeite: 'gota', bochecha: 0.4 },
    assustado: { olhos: 'assustados', boca: 'o', enfeite: 'gota', bochecha: 0.3 },
    entediado: { olhos: 'entediados', boca: 'reta', enfeite: 'suspiro', bochecha: 0.35 },
    sonolento: { olhos: 'sonolentos', boca: 'bocejo', enfeite: 'zzz', bochecha: 0.45 },
    dormindo: { olhos: 'dormindo', boca: 'dormindo', enfeite: 'zzz', bochecha: 0.5 },
    tonto: { olhos: 'rodando', boca: 'ondinha', enfeite: 'estrelinhas', bochecha: 0.4 },
    cantando: { olhos: 'felizes', boca: 'sorrisao', enfeite: 'nota', bochecha: 0.6 },
  };

  /** bracinhos curtos, que balançam junto com o corpo */
  const bracos = (hex) => `
    <g class="pet-bracos" stroke="#131338" stroke-width="5" fill="${hex}" stroke-linejoin="round">
      <ellipse class="pet-braco esq" cx="28" cy="146" rx="15" ry="11"/>
      <ellipse class="pet-braco dir" cx="172" cy="146" rx="15" ry="11"/>
    </g>`;

  /**
   * As partes que aparecem em cada fase de vida. O que vai atrás do
   * corpo (orelhinhas) sai em `atras`, e o que vai na frente
   * (cachinho, orelhinha, topete) sai em `frente`.
   */
  function faseSvg(faseId, hex) {
    const traco = 'stroke="#131338" stroke-width="5" stroke-linejoin="round"';
    // cachinho de bebê, saindo do alto da cabeça
    const cachinho = `
      <path class="pet-cachinho" d="M100 20C98 2 110-8 120-2c9 6 4 16-6 16 9 3 10 14 1 18"
            fill="none" stroke="#131338" stroke-width="7" stroke-linecap="round"/>`;
    // orelhinhas redondas, atrás da cabeça
    const orelhas = `
      <g class="pet-orelhas" fill="${hex}" ${traco}>
        <ellipse cx="56" cy="16" rx="21" ry="24"/>
        <ellipse cx="144" cy="16" rx="21" ry="24"/>
      </g>`;
    // topete de quem já cresceu
    const topete = `
      <path class="pet-topete" d="M74 26C70-2 96-14 114-4c14 8 8 22-4 24 14 4 14 18 0 22"
            fill="${hex}" ${traco}/>`;
    const sardas = `
      <g class="pet-sardas" fill="#131338" opacity=".26">
        <circle cx="30" cy="104" r="3"/><circle cx="40" cy="96" r="2.4"/><circle cx="24" cy="94" r="2.4"/>
        <circle cx="170" cy="104" r="3"/><circle cx="160" cy="96" r="2.4"/><circle cx="176" cy="94" r="2.4"/>
      </g>`;
    const sobrancelhas = `
      <g class="pet-sobrancelhas" fill="none" stroke="#131338" stroke-width="5" stroke-linecap="round">
        <path d="M56 58q18-9 34-2"/><path d="M110 56q18-7 34 2"/>
      </g>`;
    // auréola dourada por cima da cabeça: a marca da última fase
    const aureola = `
      <g class="pet-aureola">
        <ellipse cx="100" cy="2" rx="40" ry="11" fill="none" stroke="#ffd84b" stroke-width="9"/>
        <ellipse cx="100" cy="2" rx="40" ry="11" fill="none" stroke="#131338" stroke-width="3"/>
        <ellipse cx="100" cy="2" rx="31" ry="4" fill="none" stroke="#131338" stroke-width="2.5" opacity=".4"/>
      </g>`;
    const aura = `
      <g class="pet-aura" fill="#ffd84b" stroke="#131338" stroke-width="2.5" stroke-linejoin="round">
        <path d="M2 84l4 10 10 2-7 6 2 10-9-5-9 5 2-10-7-6 10-2z"/>
        <path d="M198 84l4 10 10 2-7 6 2 10-9-5-9 5 2-10-7-6 10-2z"/>
        <path d="M10 20l3 7 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1z"/>
        <path d="M190 20l3 7 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1z"/>
      </g>`;

    if (faseId === 'filhote') return { atras: '', frente: cachinho };
    if (faseId === 'crianca') return { atras: orelhas, frente: cachinho };
    if (faseId === 'jovem') return { atras: orelhas, frente: topete + sardas };
    if (faseId === 'crescido') return { atras: orelhas, frente: topete + sardas + sobrancelhas };
    if (faseId === 'lendario') return { atras: orelhas, frente: topete + sardas + sobrancelhas + aureola + aura };
    return { atras: '', frente: '' };
  }

  /** sombrinha na barriga: é ela que dá volume ao corpo */
  const volumeCorpo = `
    <ellipse class="pet-volume" cx="100" cy="164" rx="62" ry="30" fill="#131338" opacity=".08"/>`;

  /** o brilhinho do plástico novo, no alto do corpo */
  const brilhoCorpo = `
    <g class="pet-brilho" fill="#fff" opacity=".38">
      <ellipse cx="66" cy="62" rx="17" ry="11" transform="rotate(-28 66 62)"/>
      <ellipse cx="88" cy="50" rx="7" ry="5" transform="rotate(-28 88 50)"/>
    </g>`;

  function face(moodId) {
    // enjoado tem o jorro saindo da boca, então é desenhado à parte
    if (moodId === 'enjoado') {
      return `
        ${OLHOS.xis}
        <g fill="#79e3b5" opacity=".75">
          <ellipse cx="48" cy="116" rx="14" ry="9"/><ellipse cx="152" cy="116" rx="14" ry="9"/>
        </g>
        <g class="pet-mouth">${BOCAS.aberta}</g>
        <g class="pet-jorro" fill="#4fc78f" stroke="#131338" stroke-width="4" stroke-linejoin="round">
          <path d="M82 138q18 18 36 0 8 24-18 52-26-28-18-52z"/>
          <circle cx="70" cy="172" r="6"/><circle cx="130" cy="166" r="5"/><circle cx="100" cy="194" r="6"/>
        </g>`;
    }
    // estudando: sobrancelha concentrada e boca de quem está pensando
    if (moodId === 'estudando') {
      return `
        ${olhoFofo(74, 100, { rx: 17, ry: 18, pupila: 9 })}
        ${olhoFofo(126, 100, { rx: 17, ry: 18, pupila: 9 })}
        <path d="M56 78q16-10 32-2M112 76q16-8 32 2" stroke="#131338" stroke-width="6" fill="none" stroke-linecap="round"/>
        ${bochechas(0.45)}
        <g class="pet-mouth">${BOCAS.reta}</g>`;
    }

    const h = HUMORES[moodId] || HUMORES.feliz;
    return `
      ${OLHOS[h.olhos] || OLHOS.normal}
      ${bochechas(h.bochecha === undefined ? 0.55 : h.bochecha)}
      <g class="pet-mouth">${BOCAS[h.boca] || BOCAS.sorriso}</g>
      ${h.enfeite ? ENFEITES[h.enfeite] || '' : ''}`;
  }

  /** desenho do bichinho; `size` é a largura em px */
  /**
   * O corpo inteiro, já com a fase de vida aplicada. A fase muda o
   * tamanho (o filhote é menor, o lendário é maior) e acrescenta as
   * partes que ele ganhou ao crescer.
   */
  function corpoSvg(dados, moodId, nivel) {
    const c = color(dados.color);
    const sh = shape(dados.shape);
    const f = fase(nivel);
    const partes = faseSvg(f.id, c.hex);
    // cresce a partir dos pés, senão ele flutuaria ao mudar de tamanho.
    // a escala fica num grupo de fora porque a animação do corpo também
    // usa transform e uma sobrescreveria a outra
    const cresce = `translate(100 190) scale(${f.escala}) translate(-100 -190)`;
    return `
      <g class="pet-fase fase-${f.id}" transform="${cresce}">
      <g class="pet-body">
        ${partes.atras}
        <ellipse class="pet-foot" cx="74" cy="188" rx="17" ry="10" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
        <ellipse class="pet-foot" cx="126" cy="188" rx="17" ry="10" fill="${c.hex}" stroke="#131338" stroke-width="5"/>
        ${bracos(c.hex)}
        <path d="${sh.path}" fill="${c.hex}" stroke="#131338" stroke-width="6" stroke-linejoin="round"/>
        ${volumeCorpo}
        ${brilhoCorpo}
        ${outfitSvg(dados.outfit, dados.shape)}
        <g class="pet-face" style="--olhos:${f.olhos}">${face(moodId)}</g>
        ${partes.frente}
        ${accessorySvg(dados.accessory, c.hex)}
      </g>
      </g>`;
  }

  function svg(child, size = 180, moodId, opts) {
    const pet = Store.petOf(child.id);
    const m = moodId || mood(child).id;
    const comCama = (opts && opts.bed) || m === 'dormindo';
    const comQuarto = !!(opts && opts.room);
    const quarto = (opts && opts.quarto) || quartoDe(pet);
    const f = fase(level(pet.xp));
    // dentro do quarto o bichinho fica um pouco menor, para caber no cenário
    const dentro = comQuarto ? ' transform="translate(30,22) scale(.7)"' : '';
    return `
      <svg class="pet-svg mood-${m} vida-${f.id}" viewBox="0 0 200 200" width="${size}" height="${size}"
           role="img" aria-label="${UI.esc(pet.name)}, ${UI.esc(f.nome)}, ${UI.esc(mood(child).label)}">
        ${comQuarto ? `<g class="pet-room">${roomSvg(quarto)}</g>` : ''}
        <g class="pet-cena"${dentro}>
        ${comCama ? `<g class="pet-bed">${bedSvg(pet.bed)}</g>` : ''}
        ${corpoSvg(pet, m, level(pet.xp))}
        </g>
      </svg>`;
  }

  /** desenho de teste: mostra como o bichinho vai ficar antes de salvar */
  function previewSvg(data, size = 150, moodId = 'feliz', opts) {
    const comQuarto = !!(opts && opts.room);
    const comCama = !!(opts && opts.bed);
    const dentro = comQuarto ? ' transform="translate(30,22) scale(.7)"' : '';
    // o preview pode pedir uma fase, para mostrar como ele vai ficar
    const nivel = (opts && opts.nivel) || data.nivel || 6;
    const f = fase(nivel);
    return `
      <svg class="pet-svg mood-${moodId} vida-${f.id}" viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true">
        ${comQuarto ? `<g class="pet-room">${roomSvg(quartoDe(data))}</g>` : ''}
        <g class="pet-cena"${dentro}>
          ${comCama ? `<g class="pet-bed">${bedSvg(data.bed)}</g>` : ''}
          ${corpoSvg(data, moodId, nivel)}
        </g>
      </svg>`;
  }

  /**
   * A linha do tempo das fases: onde ele está agora, o que já passou e o
   * que ainda vem. É o que mostra que ele cresce junto com ela.
   */
  function faseCard(lv, pet) {
    const dono = pet || {};
    const atual = fase(lv);
    const prox = proximaFase(lv);
    return `
      <section class="card pet-vida">
        <div class="between">
          <div>
            <div class="bold small">${UI.esc(atual.nome)}</div>
            <div class="tiny muted">${UI.esc(atual.conta)}</div>
          </div>
          <span class="chip lime">fase ${FASES.indexOf(atual) + 1} de ${FASES.length}</span>
        </div>
        <div class="pet-vida-linha">
          ${FASES.map((f, i) => {
            const passou = lv >= f.nivel;
            const agora = f.id === atual.id;
            return `
              <div class="pet-vida-passo ${passou ? 'aberta' : ''} ${agora ? 'agora' : ''}">
                <div class="pet-vida-art">
                  ${passou
                    ? previewSvg({ color: dono.color, shape: dono.shape }, 62, 'feliz', { nivel: f.nivel })
                    : `<span class="pet-vida-lock">${Icons.svg('lock')}</span>`}
                </div>
                <div class="tiny bold">${UI.esc(f.nome)}</div>
                <div class="tiny muted">nível ${f.nivel}</div>
              </div>`;
          }).join('')}
        </div>
        <p class="tiny muted mt8">${UI.esc(atual.vira)}</p>
        ${prox ? `<div class="bar mt8" style="background:var(--surface-2)">
            <i style="width:${Math.round((Math.min(lv, prox.nivel) / prox.nivel) * 100)}%"></i>
          </div>` : ''}
      </section>`;
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
            <div class="pet-fase-chip">${UI.esc(fase(lv).nome)}</div>
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

  /* ---------- cartão grande de atualizar o bichinho ---------- */
  const ABAS = [
    { id: 'bichinho', label: 'Bichinho', icone: 'paw' },
    { id: 'quarto', label: 'Quarto', icone: 'house' },
    { id: 'roupas', label: 'Roupas', icone: 'basket' },
  ];

  function openSheet(child, abaInicial) {
    const pet = Store.petOf(child.id);
    const lv = level(pet.xp);
    // tudo o que ela mexe fica aqui até apertar salvar
    const draft = {
      name: pet.name,
      shape: pet.shape,
      color: pet.color,
      accessory: pet.accessory,
      outfit: pet.outfit,
      bed: pet.bed,
      room: pet.room,
      parede: quartoDe(pet).parede,
      piso: quartoDe(pet).piso,
      moveis: quartoDe(pet).moveis.slice(),
    };
    let aba = abaInicial || 'bichinho';

    const aberto = (item) => (item.level || 1) <= lv;

    /** grade de escolhas com cadeado no que ainda não abriu */
    const grade = (campo, itens, atual, render, classe = '') => `
      <div class="pick-grid ${campo} ${classe}" data-pick="${campo}">
        ${itens.map((it) => {
          const on = it.id === atual;
          const livre = aberto(it);
          return `
            <button type="button" data-value="${it.id}" aria-pressed="${on}"
                    class="${livre ? '' : 'travado'}" ${livre ? '' : 'disabled'}
                    title="${UI.esc(it.label)}${livre ? '' : ` (nível ${it.level})`}">
              ${render(it)}
              <span class="tiny">${livre ? UI.esc(it.label) : `nível ${it.level}`}</span>
              ${livre ? '' : `<span class="pick-lock">${Icons.svg('lock')}</span>`}
            </button>`;
        }).join('')}
      </div>`;

    const abaBichinho = () => `
      <div class="field">
        <label>Nome</label>
        <div class="input-wrap"><input data-nome value="${UI.esc(draft.name)}" placeholder="ex.: Pipoca" /></div>
      </div>
      <div class="field">
        <label>Modelo do bonequinho</label>
        ${grade('shape', SHAPES, draft.shape, (sh) =>
          `<svg viewBox="0 0 200 200"><path d="${sh.path}" fill="currentColor"/></svg>`)}
      </div>
      <div class="field">
        <label>Cor do bonequinho</label>
        ${grade('color', COLORS.map((c) => ({ ...c, level: 1 })), draft.color, (c) =>
          `<span class="pick-cor" style="background:${c.hex}"></span>`)}
      </div>
      <div class="field">
        <label>Acessórios</label>
        ${grade('accessory', ACCESSORIES, draft.accessory, (a) =>
          `<span class="pick-cor" style="background:${a.id ? '#a98cff' : 'var(--surface-2)'}"></span>`)}
      </div>`;

    const abaQuarto = () => `
      <div class="field">
        <label>Tema pronto do quarto</label>
        ${grade('room', ROOMS, draft.room, (r) =>
          `<svg viewBox="0 0 200 200">${roomSvg({
            parede: r.parede, piso: r.piso, moveis: r.moveis,
          })}</svg>`, 'temas')}
        <div class="note">O tema arruma parede, chão e móveis de uma vez. Depois dá para mudar cada coisa.</div>
      </div>
      <div class="field">
        <label>Cor da parede</label>
        ${grade('parede', PAREDES, draft.parede, (c) =>
          `<span class="pick-cor" style="background:${c.hex}"></span>`)}
      </div>
      <div class="field">
        <label>Cor do chão</label>
        ${grade('piso', CHAOS, draft.piso, (c) =>
          `<span class="pick-cor" style="background:${c.hex}"></span>`)}
      </div>
      ${SLOTS.map((slot) => {
        const doSlot = MOVEIS.filter((m) => m.slot === slot.id);
        const atual = draft.moveis.find((id) => (movel(id) || {}).slot === slot.id) || '';
        return `
          <div class="field">
            <label>${UI.esc(slot.label)}</label>
            <div class="pick-grid movel" data-slot="${slot.id}">
              <button type="button" data-value="" aria-pressed="${!atual}">
                <svg viewBox="0 0 200 200" class="movel-mini">
                  ${roomSvg({ parede: draft.parede, piso: draft.piso, moveis: [] })}
                </svg>
                <span class="tiny">Vazio</span>
              </button>
              ${doSlot.map((m) => {
                const livre = aberto(m);
                return `
                  <button type="button" data-value="${m.id}" aria-pressed="${m.id === atual}"
                          class="${livre ? '' : 'travado'}" ${livre ? '' : 'disabled'}>
                    <svg viewBox="0 0 200 200" class="movel-mini">
                      ${roomSvg({ parede: draft.parede, piso: draft.piso, moveis: [m.id] })}
                    </svg>
                    <span class="tiny">${livre ? UI.esc(m.label) : `nível ${m.level}`}</span>
                    ${livre ? '' : `<span class="pick-lock">${Icons.svg('lock')}</span>`}
                  </button>`;
              }).join('')}
            </div>
          </div>`;
      }).join('')}`;

    const abaRoupas = () => `
      <div class="field">
        <label>Roupinha</label>
        ${grade('outfit', OUTFITS, draft.outfit, (o) =>
          `<span class="pick-cor" style="background:${o.cor}"></span>`)}
      </div>
      <div class="field">
        <label>Caminha</label>
        ${grade('bed', BEDS, draft.bed, (b) =>
          `<svg viewBox="0 0 200 200" class="movel-mini">
            ${roomSvg({ parede: draft.parede, piso: draft.piso, moveis: [] })}
            ${bedSvg(b.id)}
          </svg>`)}
      </div>
      <div class="note">
        Cada ${XP_POR_NIVEL} pontos de amizade sobem um nível e abrem peças novas:
        modelos do bonequinho, roupinhas, camas, acessórios, cores de parede e chão e móveis.
      </div>`;

    Uso.entrar('bichinho');
    UI.openSheet({
      size: 'larga',
      onClose() { Uso.sair(); },
      title: 'Atualizar o bichinho',
      subtitle: `${pet.name} • ${pet.xp} pontos de amizade`,
      body: `
        <div class="pet-atualiza">
          <div class="pet-atualiza-art" data-pet-preview>
            ${previewSvg(draft, 220, 'feliz', { room: true, quarto: draft })}
          </div>
          <div class="pet-atualiza-side">
            ${ringSvg(pet.xp)}
            <p class="tiny muted center">
              faltam <b data-falta>${faltaParaSubir(pet.xp)}</b> ponto(s)<br/>para o nível ${lv + 1}
            </p>
            <div class="pet-atualiza-tags">
              <span class="chip lime">nível ${lv}</span>
              <span class="chip neutral">${desbloqueados(lv)} peças abertas</span>
            </div>
          </div>
        </div>

        ${faseCard(lv, pet)}

        <div class="seg-tabs" data-abas>
          ${ABAS.map((a) => `
            <button type="button" data-aba="${a.id}" aria-pressed="${a.id === aba}">
              ${Icons.svg(a.icone)} ${a.label}
            </button>`).join('')}
        </div>

        <div data-conteudo>${abaBichinho()}</div>`,
      actions: `
        <button class="btn btn-ghost" data-loja>${Icons.svg('coins')} Ver tudo</button>
        <button class="btn btn-primary" data-save>Salvar</button>`,
      onMount(sheet) {
        const preview = sheet.querySelector('[data-pet-preview]');
        const conteudo = sheet.querySelector('[data-conteudo]');
        const nome = () => sheet.querySelector('[data-nome]');

        const repaint = () => {
          preview.innerHTML = previewSvg(draft, 220, 'feliz', { room: true, quarto: draft });
        };

        function pintarAba() {
          conteudo.innerHTML = aba === 'bichinho' ? abaBichinho()
            : aba === 'quarto' ? abaQuarto()
            : abaRoupas();
          ligar();
        }

        function ligar() {
          const campo = nome();
          if (campo) campo.addEventListener('input', () => { draft.name = campo.value; });

          conteudo.querySelectorAll('[data-pick]').forEach((box) => {
            box.addEventListener('click', (ev) => {
              const btn = ev.target.closest('[data-value]:not([disabled])');
              if (!btn) return;
              const chave = box.getAttribute('data-pick');
              const valor = btn.getAttribute('data-value');
              box.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
              btn.setAttribute('aria-pressed', 'true');
              draft[chave] = valor;
              // escolher um tema pronto arruma parede, chão e móveis
              if (chave === 'room') {
                const tema = ROOMS.find((r) => r.id === valor);
                draft.parede = tema.parede;
                draft.piso = tema.piso;
                draft.moveis = tema.moveis.filter((id) => aberto(movel(id) || { level: 1 }));
                pintarAba();
              }
              repaint();
            });
          });

          conteudo.querySelectorAll('[data-slot]').forEach((box) => {
            box.addEventListener('click', (ev) => {
              const btn = ev.target.closest('[data-value]:not([disabled])');
              if (!btn) return;
              const slot = box.getAttribute('data-slot');
              const valor = btn.getAttribute('data-value');
              box.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
              btn.setAttribute('aria-pressed', 'true');
              draft.moveis = draft.moveis.filter((id) => (movel(id) || {}).slot !== slot);
              if (valor) draft.moveis.push(valor);
              repaint();
            });
          });
        }

        sheet.querySelector('[data-abas]').addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-aba]');
          if (!b) return;
          aba = b.getAttribute('data-aba');
          sheet.querySelectorAll('[data-aba]').forEach((x) =>
            x.setAttribute('aria-pressed', x.getAttribute('data-aba') === aba));
          pintarAba();
        });

        sheet.querySelector('[data-loja]').addEventListener('click', () => {
          UI.closeSheet();
          openShop(child);
        });
        sheet.querySelector('[data-save]').addEventListener('click', () => {
          const res = Store.savePet(child.id, draft);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast(`${res.pet.name} adorou o quarto novo`, 'ok');
          App.render();
        });

        ligar();
      },
    });
  }

  /** quantas peças já estão liberadas para o nível atual */
  function desbloqueados(lv) {
    const conta = (lista) => lista.filter((i) => (i.level || 1) <= lv).length;
    return conta(SHAPES) + conta(OUTFITS) + conta(BEDS) + conta(ACCESSORIES)
      + conta(PAREDES) + conta(CHAOS) + conta(MOVEIS) + conta(ROOMS);
  }

  /* ---------- catálogo: tudo o que existe e o que ainda falta ---------- */
  function openShop(child) {
    const pet = Store.petOf(child.id);
    const lv = level(pet.xp);
    const q = quartoDe(pet);
    const grupos = [
      { titulo: 'Modelos do bonequinho', itens: SHAPES, atual: [pet.shape] },
      { titulo: 'Roupinhas', itens: OUTFITS, atual: [pet.outfit] },
      { titulo: 'Camas', itens: BEDS, atual: [pet.bed] },
      { titulo: 'Acessórios', itens: ACCESSORIES.filter((a) => a.id), atual: [pet.accessory] },
      { titulo: 'Temas de quarto', itens: ROOMS, atual: [pet.room] },
      { titulo: 'Cores de parede', itens: PAREDES, atual: [q.parede] },
      { titulo: 'Cores de chão', itens: CHAOS, atual: [q.piso] },
      { titulo: 'Móveis', itens: MOVEIS, atual: q.moveis },
    ];
    const total = grupos.reduce((soma, g) => soma + g.itens.length, 0);
    const abertos = grupos.reduce((soma, g) => soma + g.itens.filter((i) => (i.level || 1) <= lv).length, 0);
    const proximo = grupos
      .flatMap((g) => g.itens.map((i) => ({ ...i, grupo: g.titulo })))
      .filter((i) => (i.level || 1) > lv)
      .sort((a, b) => a.level - b.level)[0];

    Uso.entrar('bichinho');
    UI.openSheet({
      size: 'larga',
      onClose() { Uso.sair(); },
      title: 'Tudo do bichinho',
      subtitle: `Nível ${lv} • ${abertos} de ${total} peças já liberadas`,
      body: `
        <div class="pet-atualiza">
          <div class="pet-atualiza-art">${svg(child, 200, 'feliz', { room: true })}</div>
          <div class="pet-atualiza-side">
            ${ringSvg(pet.xp)}
            <p class="tiny muted center">
              faltam <b>${faltaParaSubir(pet.xp)}</b> ponto(s)<br/>para o nível ${lv + 1}
            </p>
            ${proximo ? `<p class="tiny muted center">
              A próxima peça é <b>${UI.esc(proximo.label)}</b>, no nível ${proximo.level}.
            </p>` : '<p class="tiny muted center">Você já abriu tudo!</p>'}
          </div>
        </div>
        ${grupos.map((g) => `
          <div class="section-title"><h3>${g.titulo}</h3>
            <span class="small muted">${g.itens.filter((i) => (i.level || 1) <= lv).length}/${g.itens.length}</span>
          </div>
          <div class="shop-grid">
            ${g.itens.map((i) => {
              const livre = (i.level || 1) <= lv;
              const usando = g.atual.includes(i.id);
              return `
                <div class="shop-item ${livre ? '' : 'locked'} ${usando ? 'usando' : ''}">
                  <span class="shop-chip" style="background:${i.cor || i.hex || '#a98cff'}"></span>
                  <span class="shop-nome">${UI.esc(i.label)}</span>
                  <span class="shop-tag">${livre ? (usando ? 'em uso' : 'liberado') : `nível ${i.level}`}</span>
                  ${livre ? '' : `<span class="shop-lock">${Icons.svg('lock')}</span>`}
                </div>`;
            }).join('')}
          </div>`).join('')}
        <div class="note">
          Cada tarefa, livro, compromisso, jogo e prova rende pontos de amizade.
          A cada ${XP_POR_NIVEL} pontos o bichinho sobe de nível e abre peças novas.
        </div>`,
      actions: `
        <button class="btn btn-ghost" data-voltar>Personalizar</button>
        <button class="btn btn-primary" data-ok>Pronto</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
        sheet.querySelector('[data-voltar]').addEventListener('click', () => {
          UI.closeSheet();
          openSheet(child, 'quarto');
        });
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

    Uso.entrar('bichinho');
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
      onClose() { Uso.sair(); App.render(); },
    });
  }

  /* ---------- subir de fase ---------- */
  /**
   * O bichinho cresceu de verdade. Mostra a fase nova, com o antes e o
   * depois lado a lado, para ela ver o que mudou.
   */
  function comemorarFase(child, nivelAntes, nivelAgora) {
    const de = fase(nivelAntes);
    const para = fase(nivelAgora);
    if (de.id === para.id) return false;
    // com uma folha aberta (o fim de um jogo, por exemplo) a festa espera
    // ela fechar, senão uma tela comeria a outra
    if (UI.folhaAberta()) {
      UI.aoFechar(() => setTimeout(() => mostrarFase(child, de, para), 60));
      return true;
    }
    mostrarFase(child, de, para);
    return true;
  }

  function mostrarFase(child, de, para) {
    const pet = Store.petOf(child.id);
    Effects.burst('goal');
    Voz.falar(`Eu cresci! Agora eu sou ${para.nome}.`, child);
    UI.openSheet({
      title: `${pet.name} cresceu!`,
      subtitle: `De ${de.nome} para ${para.nome}`,
      body: `
        <div class="pet-cresceu">
          <div class="pet-cresceu-lado">
            ${previewSvg(pet, 130, 'feliz', { nivel: de.nivel })}
            <div class="tiny muted">${UI.esc(de.nome)}</div>
          </div>
          <span class="pet-cresceu-seta">${Icons.svg('arrow')}</span>
          <div class="pet-cresceu-lado agora">
            <div class="pet-cresceu-novo">${previewSvg(pet, 150, 'festa', { nivel: para.nivel })}</div>
            <div class="tiny bold">${UI.esc(para.nome)}</div>
          </div>
        </div>
        <div class="note">${UI.esc(para.conta)}</div>
        <p class="tiny muted center mt8">${UI.esc(para.vira)}</p>`,
      actions: '<button class="btn btn-primary btn-block" data-ok>Que legal!</button>',
      onMount(sheet) {
        sheet.querySelector('[data-ok]').addEventListener('click', () => { UI.closeSheet(); App.render(); });
        const novo = sheet.querySelector('.pet-cresceu-novo .pet-svg');
        if (novo) novo.classList.add('subiu-fase');
      },
      onClose() { App.render(); },
    });
  }

  /* ---------- interação ---------- */
  /** troca a carinha do desenho por alguns instantes e depois volta ao normal */
  function humorRelampago(svgEl, moodId, ms = 1800) {
    if (!svgEl) return;
    const rosto = svgEl.querySelector('.pet-face');
    if (!rosto) return;
    if (!svgEl._humorAntigo) {
      const base = (svgEl.getAttribute('class') || '').replace(/\bis-happy\b/g, '').trim();
      svgEl._humorAntigo = { classe: base, rosto: rosto.innerHTML };
    }
    clearTimeout(svgEl._humorTimer);
    svgEl.setAttribute('class', `pet-svg mood-${moodId}`);
    rosto.innerHTML = face(moodId);
    svgEl._humorTimer = setTimeout(() => {
      const antigo = svgEl._humorAntigo;
      if (!antigo) return;
      svgEl.setAttribute('class', antigo.classe);
      const atual = svgEl.querySelector('.pet-face');
      if (atual) atual.innerHTML = antigo.rosto;
      svgEl._humorAntigo = null;
    }, ms);
  }

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
    // carinho faz cócegas: ele abre o sorrisão e cai na gargalhada
    humorRelampago(svgEl, 'rindo', 2000);
    Buddy.rir();
    const bubble = stage.querySelector ? stage.querySelector('[data-pet-bubble]') : null;
    if (bubble) {
      const falas = [
        'Ha ha ha! Que cócegas!', 'Hihi, faz de novo!', 'Ha ha! Você é minha pessoa favorita.',
        'Ha ha ha! Tô cheio de energia agora!', 'Hihihi! Vamos fazer uma tarefa juntos?',
      ];
      const escolhida = falas[Math.floor(res.count % falas.length)];
      bubble.textContent = escolhida;
      Voz.falar(escolhida, child);
      bubble.classList.remove('pop');
      void bubble.offsetWidth;
      bubble.classList.add('pop');
    }
    if (res.levelUp && comemorarFase(child, res.nivelAntes, res.nivelAgora)) return;
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
    let arremessos = 0;       // quantas vezes seguidas ela jogou o bichinho
    let ultimoArremesso = 0;  // para saber se ainda é a mesma brincadeira
    let paraquedas = false;
    let voando = null;        // rede de segurança do voo de paraquedas
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
        : novo === 'vomitando' ? 'enjoado'
        : novo === 'rindo' ? 'rindo'
        : novo === 'estudando' ? 'estudando'
        : novo === 'brincando' || novo === 'pulando' || novo === 'festa' ? 'festa'
        : novo === 'planando' ? 'animado'
        : mood(child).id;
      el.querySelector('.pet-buddy-art').innerHTML = svg(child, SIZE, m);
      if (ball) ball.hidden = novo !== 'brincando';
    }

    /* ---------- física ---------- */
    function loop() {
      raf = null;
      if (!el || dragging) return;
      if (paraquedas) {
        // de paraquedas ele desce devagarinho e vai de um lado para o outro
        pos.vy = Math.min(pos.vy + GRAVIDADE * 0.16, 2.6);
        pos.vx *= 0.94;
        pos.x += pos.vx + Math.sin(pos.y / 26) * 1.3;
        pos.y += pos.vy;
      } else {
        pos.vy += GRAVIDADE;
        pos.x += pos.vx;
        pos.y += pos.vy;
      }

      if (pos.x < 10) { pos.x = 10; pos.vx = -pos.vx * 0.6; }
      if (pos.x > limiteX()) { pos.x = limiteX(); pos.vx = -pos.vx * 0.6; }
      // teto: de paraquedas ele para mais embaixo, para a cúpula caber na tela
      const teto = paraquedas ? 94 : 6;
      if (pos.y < teto) { pos.y = teto; pos.vy = Math.abs(pos.vy) * (paraquedas ? 0 : 0.4); }

      const chao = chaoY();
      if (pos.y >= chao) {
        pos.y = chao;
        if (paraquedas) {
          pos.vy = 0;
          pos.vx = 0;
          pousarDeParaquedas();
          aplicar();
          return;
        }
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
      if (paraquedas || pos.vy !== 0 || pos.vx !== 0 || pos.y < chao) raf = requestAnimationFrame(loop);
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

    /* ---------- o paraquedas da sétima vez ----------
       Jogar o bichinho seis vezes seguidas ele aguenta. Na sétima ele já
       se preparou: abre um paraquedas e desce planando até o chão. */
    const ARREMESSOS_ATE_PARAQUEDAS = 7;
    const JANELA_ARREMESSO = 25000;   // 25s entre um e outro ainda é a mesma brincadeira

    const paraquedaSvg = `
      <svg class="buddy-paraquedas" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true">
        <path d="M6 40a54 54 0 0 1 108 0c-14-8-26-8-36 0-8-8-20-8-36 0-10-8-22-8-36 0z"
              fill="#ff8fc8" stroke="#131338" stroke-width="5" stroke-linejoin="round"/>
        <path d="M42 40c0-22 6-38 18-38s18 16 18 38" fill="#d6f154" stroke="#131338" stroke-width="5"/>
        <path d="M8 42 46 88M42 41 54 88M78 41 66 88M112 42 74 88"
              stroke="#131338" stroke-width="4" stroke-linecap="round" fill="none"/>
      </svg>`;

    /** conta mais um arremesso e diz se é hora de abrir o paraquedas */
    function contarArremesso() {
      const agora = Date.now();
      if (agora - ultimoArremesso > JANELA_ARREMESSO) arremessos = 0;
      ultimoArremesso = agora;
      arremessos += 1;
      if (arremessos < ARREMESSOS_ATE_PARAQUEDAS) {
        // do quarto em diante ele já avisa que está ficando esperto
        if (arremessos === 4) fala('De novo? Tá bom, eu já vou me preparar...');
        if (arremessos === 6) fala('Mais uma e você vai ver só.');
        return false;
      }
      arremessos = 0;
      abrirParaquedas();
      return true;
    }

    function abrirParaquedas() {
      if (!el || paraquedas) return;
      paraquedas = true;
      clearTimeout(dizzyTimer);
      clearTimeout(holdTimer);
      setEstado('planando');
      el.classList.add('is-paraquedas');
      if (!el.querySelector('.buddy-paraquedas')) {
        el.insertAdjacentHTML('afterbegin', paraquedaSvg);
      }
      // se já estiver perto do chão, dá um pulo antes, para o voo aparecer
      pos.vy = pos.y > chaoY() - 130 ? -15 : Math.min(pos.vy, -2);
      // a cúpula fica acima dele: se estiver colado no topo, desce um pouco
      if (pos.y < 94) pos.y = 94;
      fala('Paraquedas! Eu estava esperando essa.');
      Voz.falar('Paraquedas!', child);
      Effects.burst('goal', el);
      // se alguma coisa travar o voo, ele pousa do mesmo jeito
      clearTimeout(voando);
      voando = setTimeout(() => { if (paraquedas) { pos.y = chaoY(); pousarDeParaquedas(); aplicar(); } }, 12000);
      mover();
    }

    function pousarDeParaquedas() {
      if (!paraquedas) return;
      paraquedas = false;
      clearTimeout(voando);
      quedaMax = 0;
      el.classList.remove('is-paraquedas');
      const p = el.querySelector('.buddy-paraquedas');
      if (p) p.remove();
      setEstado('festa');
      fala('Pousei! Que voo lindo.');
      Effects.burst('approved', el);
      clearTimeout(dizzyTimer);
      dizzyTimer = setTimeout(() => {
        setEstado('parado');
        agendarBrincadeira();
      }, 2200);
    }

    /** chacoalhou demais: ele passa mal, vomita e depois fica tonto */
    function vomitar(texto) {
      setEstado('vomitando');
      fala(texto || 'Blergh... para de me sacudir!');
      Voz.falar('Blergh! Tô enjoado.', child);
      Effects.burst('spend', el);
      clearTimeout(dizzyTimer);
      dizzyTimer = setTimeout(() => ficarTonto('Ufa... que enjoo.'), 2200);
    }

    /** carinho no painel: o bichinho da tela também cai na risada */
    function rir(texto) {
      if (!el || estado === 'dormindo' || estado === 'vomitando') return;
      const anterior = estado === 'rindo' ? 'parado' : estado;
      setEstado('rindo');
      fala(texto || 'Ha ha ha! Que cócegas!');
      clearTimeout(dizzyTimer);
      dizzyTimer = setTimeout(() => {
        setEstado(anterior === 'segurado' || anterior === 'caindo' ? 'parado' : anterior);
        agendarBrincadeira();
      }, 2000);
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
        if (!el || dragging || paraquedas
          || estado === 'tonto' || estado === 'derretendo' || estado === 'vomitando') {
          return agendarBrincadeira();
        }
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
        if (paraquedas) {
          // pegou ele no ar: o paraquedas fecha e a brincadeira recomeça
          paraquedas = false;
          clearTimeout(voando);
          el.classList.remove('is-paraquedas');
          const pq = el.querySelector('.buddy-paraquedas');
          if (pq) pq.remove();
        }
        if (estado !== 'tonto' && estado !== 'derretendo' && estado !== 'vomitando') setEstado('segurado');
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
      if (shake.dirs >= 5 && shake.dist > 130 && estado !== 'tonto' && estado !== 'vomitando') {
        shake = { dirs: 0, lastSign: 0, dist: 0, since: Date.now() };
        vomitar();
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
      pos.vx = Math.max(-22, Math.min(22, pos.vx * 1.6));
      pos.vy = Math.max(-24, Math.min(24, pos.vy * 1.4));
      // soltou com força: isso conta como arremesso
      const forca = Math.abs(pos.vx) + Math.abs(pos.vy);
      const arremessou = forca > 7 && !paraquedas;
      if (estado === 'segurado') setEstado('caindo');
      if (arremessou && contarArremesso()) return;
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

      // no celular ele começa na esquerda: o botão redondo de ação fica na direita
      pos.x = window.innerWidth < 1000
        ? 10
        : Math.min(limiteX(), window.innerWidth / 2 - SIZE / 2);
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
      clearTimeout(voando);
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (el) el.remove();
      if (ball) ball.remove();
      el = null;
      ball = null;
      child = null;
      estado = 'parado';
      paraquedas = false;
      arremessos = 0;
    }

    return {
      mount, unmount, fala, setEstado, registrarInteracao, rir, vomitar,
      arremessar: contarArremesso,
      arremessos: () => arremessos,
      planando: () => paraquedas,
    };
  })();

  return {
    svg, panel, bind, openSheet, openChat, touch, mood, phrase, Voz,
    mountBuddy: Buddy.mount, unmountBuddy: Buddy.unmount, buddySay: Buddy.fala,
    buddyRir: Buddy.rir, buddyVomitar: Buddy.vomitar,
    buddyArremessar: Buddy.arremessar, buddyArremessos: Buddy.arremessos,
    buddyPlanando: Buddy.planando,
    openShop, outfit, bed, roomSvg, movelSvg, quartoDe, ringSvg, previewSvg, faltaParaSubir,
    level, progress, COLORS, SHAPES, ACCESSORIES, OUTFITS, BEDS, ROOMS, PAREDES, CHAOS, MOVEIS, SLOTS,
    XP_POR_NIVEL, CARINHOS_POR_DIA,
    fase, proximaFase, corpoSvg, comemorarFase, FASES,
  };
})();

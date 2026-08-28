/* =========================================================
   store.js: estado, persistência (localStorage) e regras
   ========================================================= */
const Store = (() => {
  const KEY = 'mesada.state.v2';
  const OLD_KEY = 'mesada.state.v1';
  const SESSION_KEY = 'mesada.session.v1';

  /* ---------- utilitários ---------- */
  const uid = (p = 'id') =>
    p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /** hash simples (djb2 + xorshift). Não é criptografia: o app guarda tudo no
   *  navegador, o objetivo é apenas não deixar a senha em texto puro. */
  function hash(text) {
    const salt = 'mesada::';
    let h = 5381;
    const s = salt + String(text);
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    let x = h;
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    return (h.toString(16) + x.toString(16)).padStart(16, '0');
  }

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => toISO(new Date());
  const fromISO = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const addDays = (iso, n) => {
    const d = fromISO(iso);
    d.setDate(d.getDate() + n);
    return toISO(d);
  };
  const monthOf = (iso) => iso.slice(0, 7);

  const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  function labelDate(iso) {
    if (iso === today()) return 'Hoje';
    if (iso === addDays(today(), -1)) return 'Ontem';
    const d = fromISO(iso);
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()].slice(0, 3)}`;
  }
  const labelMonth = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    return `${MONTHS[m - 1]} de ${y}`;
  };
  const money = (v) =>
    (v < 0 ? '-' : '') + 'R$ ' + Math.abs(Number(v) || 0).toFixed(2).replace('.', ',');

  /* ---------- dados iniciais ---------- */
  function seed() {
    const parentId = uid('u');
    const childId = uid('u');
    return {
      version: 1,
      settings: {
        // respeita a preferência do aparelho no primeiro acesso
        theme: (typeof window !== 'undefined' && window.matchMedia
          && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
      },
      users: [
        {
          id: parentId, role: 'parent', name: 'Mãe / Pai',
          username: 'pai', pass: hash('1234'), color: 'g4',
        },
        {
          id: childId, role: 'child', name: 'Mariana',
          username: 'mariana', pass: hash('1234'), color: 'g1',
          goalName: 'Patins novos', goalAmount: 150,
          allowance: 120,
        },
      ],
      categories: [
        {
          // a leitura é a parte que mais vale: peso 5 contra 2 das outras
          id: uid('c'), name: 'Leitura', icon: 'book', grad: 'g6', peso: 5, leitura: true, items: [
            { id: uid('s'), name: 'Ler 20 minutos', value: 3, kind: 'earn', daily: true, vezesMes: 30, ficha: false },
            { id: uid('s'), name: 'Terminar um capítulo', value: 3, kind: 'earn', daily: false, vezesMes: 12, esforco: 2, ficha: true },
            { id: uid('s'), name: 'Ler em voz alta para alguém', value: 3, kind: 'earn', daily: false, vezesMes: 8, ficha: false },
            { id: uid('s'), name: 'Terminar um livro', value: 10, kind: 'earn', daily: false, vezesMes: 1, esforco: 8, ficha: true },
          ],
        },
        {
          id: uid('c'), name: 'Estudos', icon: 'pencil', grad: 'g1', peso: 3, items: [
            { id: uid('s'), name: 'Fazer a lição de casa', value: 3, kind: 'earn', daily: true, vezesMes: 30 },
            { id: uid('s'), name: 'Estudar 30 minutos', value: 2, kind: 'earn', daily: true, vezesMes: 30 },
            { id: uid('s'), name: 'Revisar para a prova', value: 2, kind: 'earn', daily: false, vezesMes: 6, esforco: 2 },
          ],
        },
        {
          id: uid('c'), name: 'Casa', icon: 'house', grad: 'g2', peso: 2, items: [
            { id: uid('s'), name: 'Arrumar a cama', value: 1, kind: 'earn', daily: true, vezesMes: 30 },
            { id: uid('s'), name: 'Organizar o quarto', value: 2, kind: 'earn', daily: false, vezesMes: 8 },
            { id: uid('s'), name: 'Ajudar na louça', value: 3, kind: 'earn', daily: false, vezesMes: 12, esforco: 2 },
            { id: uid('s'), name: 'Tirar o lixo', value: 1, kind: 'earn', daily: false, vezesMes: 12 },
          ],
        },
        {
          id: uid('c'), name: 'Saúde', icon: 'heart', grad: 'g3', peso: 1, items: [
            { id: uid('s'), name: 'Escovar os dentes 3x', value: 1, kind: 'earn', daily: true, vezesMes: 30 },
            { id: uid('s'), name: 'Tomar banho', value: 1, kind: 'earn', daily: true, vezesMes: 30 },
            { id: uid('s'), name: 'Beber bastante água', value: 1, kind: 'earn', daily: true, vezesMes: 30 },
          ],
        },
        {
          id: uid('c'), name: 'Atitude', icon: 'star', grad: 'g4', peso: 2, items: [
            { id: uid('s'), name: 'Ajudar sem pedirem', value: 3, kind: 'earn', daily: false, vezesMes: 8, esforco: 2 },
            { id: uid('s'), name: 'Cumprir os combinados', value: 2, kind: 'earn', daily: true, vezesMes: 30 },
            { id: uid('s'), name: 'Faltar com respeito', value: 3, kind: 'penalty', daily: false, vezesMes: 0 },
            { id: uid('s'), name: 'Passar do tempo de tela', value: 2, kind: 'penalty', daily: false, vezesMes: 0 },
          ],
        },
        {
          id: uid('c'), name: 'Extras', icon: 'target', grad: 'g5', peso: 2, items: [
            { id: uid('s'), name: 'Atividade física', value: 2, kind: 'earn', daily: false, vezesMes: 8 },
            { id: uid('s'), name: 'Ajudar nas compras', value: 3, kind: 'earn', daily: false, vezesMes: 4, esforco: 2 },
            { id: uid('s'), name: 'Cuidar do pet', value: 2, kind: 'earn', daily: true, vezesMes: 30 },
          ],
        },
      ],
      entries: [],
      payouts: [],
      diary: [],
      events: [],
      purchases: [],
      decks: [],
      usage: [],
      quizLog: [],
      daily: [],
      licoes: [],
    };
  }

  /* ---------- carga / gravação ---------- */
  let state = load();

  /** de-para usado ao migrar dados salvos na versão com emoji */
  const ICON_FROM_EMOJI = {
    '📚': 'book', '🏠': 'house', '🪥': 'heart', '⭐': 'star', '🎯': 'target',
    '🎨': 'palette', '⚽': 'ball', '🎸': 'music', '🧹': 'broom', '🐶': 'paw',
    '🌱': 'leaf', '💧': 'drop', '🛏️': 'bed', '🍎': 'apple', '🧠': 'brain',
    '💪': 'dumbbell', '🧺': 'basket', '🚿': 'shower', '🎒': 'backpack',
    '🧩': 'puzzle', '🚲': 'bike', '🍽️': 'utensils', '📝': 'pencil', '🏆': 'trophy',
  };

  /** converte um estado salvo na v1 (com emoji) para o formato atual */
  function migrate(old) {
    const grads = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];
    (old.users || []).forEach((u, i) => {
      if (!u.color) u.color = grads[i % grads.length];
      delete u.emoji;
    });
    (old.categories || []).forEach((c) => {
      if (!c.icon) c.icon = ICON_FROM_EMOJI[c.emoji] || 'star';
      delete c.emoji;
    });
    (old.entries || []).forEach((e) => {
      if (!e.icon) e.icon = ICON_FROM_EMOJI[e.emoji] || 'star';
      delete e.emoji;
    });
    old.version = 2;
    return old;
  }

  /** DIAS_MES: o mês de referência do planejador. Trinta dias deixa a conta
   *  redonda e não muda de mês para mês, o que ajuda a explicar o valor. */
  const DIAS_MES = 30;
  const VEZES_PADRAO = 8;   // ações que não são de todo dia: duas vezes por semana

  /** completa os campos do planejador em dados salvos antes dele existir */
  function ajustarPlano(st) {
    (st.categories || []).forEach((c) => {
      if (typeof c.peso !== 'number' || !(c.peso > 0)) {
        c.peso = /leitur|livro|ler\b/i.test(c.name) ? 5 : 2;
      }
      if (c.leitura === undefined) c.leitura = /leitur|livro|ler\b/i.test(c.name);
      (c.items || []).forEach((it) => {
        if (typeof it.vezesMes !== 'number') {
          it.vezesMes = it.kind === 'penalty' ? 0 : (it.daily ? DIAS_MES : VEZES_PADRAO);
        }
        if (typeof it.esforco !== 'number' || !(it.esforco > 0)) it.esforco = 1;
        // a ficha de leitura (resumo, grifos e fotos das páginas) começa
        // ligada nas ações de leitura que não são de todo dia
        if (it.ficha === undefined) it.ficha = !!c.leitura && !it.daily && it.kind !== 'penalty';
      });
    });
    (st.users || []).forEach((u) => {
      if (u.role === 'child' && typeof u.allowance !== 'number') u.allowance = 0;
    });
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          const st = parsed.version === 2 ? parsed : migrate(parsed);
          if (!Array.isArray(st.diary)) st.diary = [];
          if (!Array.isArray(st.events)) st.events = [];
          if (!Array.isArray(st.purchases)) st.purchases = [];
          if (!Array.isArray(st.decks)) st.decks = [];
          if (!Array.isArray(st.usage)) st.usage = [];
          if (!Array.isArray(st.quizLog)) st.quizLog = [];
          if (!Array.isArray(st.daily)) st.daily = [];
          if (!Array.isArray(st.licoes)) st.licoes = [];
          ajustarPlano(st);
          return st;
        }
      }
    } catch (e) {
      console.warn('Não foi possível ler os dados salvos:', e);
    }
    const fresh = seed();
    try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) { /* modo privado */ }
    return fresh;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Não foi possível salvar:', e);
    }
  }

  const get = () => state;

  /** põe no lugar tudo que veio de uma cópia de segurança */
  function substituirTudo(novo) {
    if (!novo || !Array.isArray(novo.users) || !novo.users.length)
      return { ok: false, error: 'Essa cópia não tem gente dentro. Confira o arquivo.' };
    state = novo.version === 2 ? novo : migrate(novo);
    if (!Array.isArray(state.diary)) state.diary = [];
    if (!Array.isArray(state.events)) state.events = [];
    if (!Array.isArray(state.purchases)) state.purchases = [];
    if (!Array.isArray(state.decks)) state.decks = [];
    if (!Array.isArray(state.usage)) state.usage = [];
    if (!Array.isArray(state.quizLog)) state.quizLog = [];
    if (!Array.isArray(state.daily)) state.daily = [];
    if (!Array.isArray(state.licoes)) state.licoes = [];
    ajustarPlano(state);
    save();
    return { ok: true };
  }

  /** um retrato do que existe agora, para mostrar antes de trocar */
  const retrato = (st) => {
    const alvo = st || state;
    const filhos = (alvo.users || []).filter((u) => u.role === 'child');
    return {
      filhos: filhos.length,
      nomes: filhos.map((u) => u.name),
      categorias: (alvo.categories || []).length,
      tarefas: (alvo.categories || []).reduce((t, c) => t + ((c.items || []).length), 0),
      lancamentos: (alvo.entries || []).length,
      fotos: (alvo.entries || []).reduce((t, e) => t + ((e.photos || []).length), 0),
    };
  };

  function resetAll() {
    state = seed();
    save();
    logout();
  }

  /* ---------- sessão / autenticação ---------- */
  function login(role, username, password) {
    const u = state.users.find(
      (x) => x.username.toLowerCase() === String(username).trim().toLowerCase()
    );
    if (!u) return { ok: false, error: 'Usuário não encontrado.' };
    if (u.pass !== hash(password)) return { ok: false, error: 'Senha incorreta.' };
    if (u.role !== role) {
      return {
        ok: false,
        error: u.role === 'parent'
          ? 'Esse acesso é de responsável. Troque a opção acima.'
          : 'Esse acesso é de filho(a). Troque a opção acima.',
      };
    }
    try { sessionStorageSet(u.id); } catch (e) { /* ignore */ }
    return { ok: true, user: u };
  }

  function sessionStorageSet(id) { localStorage.setItem(SESSION_KEY, id); }
  function logout() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }
  function currentUser() {
    try {
      const id = localStorage.getItem(SESSION_KEY);
      return state.users.find((u) => u.id === id) || null;
    } catch (e) { return null; }
  }

  function changePassword(userId, oldPass, newPass) {
    const u = state.users.find((x) => x.id === userId);
    if (!u) return { ok: false, error: 'Usuário não encontrado.' };
    if (u.pass !== hash(oldPass)) return { ok: false, error: 'A senha atual não confere.' };
    if (!newPass || newPass.length < 4) return { ok: false, error: 'A nova senha precisa ter ao menos 4 caracteres.' };
    u.pass = hash(newPass);
    save();
    return { ok: true };
  }

  /* ---------- usuários ---------- */
  const children = () => state.users.filter((u) => u.role === 'child');
  const userById = (id) => state.users.find((u) => u.id === id) || null;

  function saveChild(data) {
    const username = String(data.username || '').trim().toLowerCase();
    if (!data.name || !data.name.trim()) return { ok: false, error: 'Informe o nome.' };
    if (!username) return { ok: false, error: 'Informe um usuário para o login.' };
    const clash = state.users.find((u) => u.username.toLowerCase() === username && u.id !== data.id);
    if (clash) return { ok: false, error: 'Esse usuário já existe. Escolha outro.' };

    if (data.id) {
      const u = userById(data.id);
      if (!u) return { ok: false, error: 'Filho(a) não encontrado(a).' };
      const photo = String(data.photos || '').split(',').filter(Boolean)[0] || '';
      if (u.photo && u.photo !== photo) Photos.remove(u.photo);
      Object.assign(u, {
        name: data.name.trim(),
        username,
        color: data.color || u.color || 'g1',
        photo,
        goalName: data.goalName || '',
        goalAmount: Number(data.goalAmount) || 0,
      });
      if (data.password) u.pass = hash(data.password);
      save();
      return { ok: true, user: u };
    }

    if (!data.password || data.password.length < 4)
      return { ok: false, error: 'A senha precisa ter ao menos 4 caracteres.' };

    const u = {
      id: uid('u'), role: 'child', name: data.name.trim(), username,
      pass: hash(data.password), color: data.color || 'g1',
      photo: String(data.photos || '').split(',').filter(Boolean)[0] || '',
      goalName: data.goalName || '', goalAmount: Number(data.goalAmount) || 0,
    };
    state.users.push(u);
    save();
    return { ok: true, user: u };
  }

  /** troca a foto de perfil de qualquer usuário (filho ou responsável) */
  function setUserPhoto(userId, photoId) {
    const u = userById(userId);
    if (!u) return { ok: false, error: 'Usuário não encontrado.' };
    const next = photoId || '';
    if (u.photo && u.photo !== next) Photos.remove(u.photo);
    u.photo = next;
    save();
    return { ok: true, user: u };
  }

  function removeChild(id) {
    const trash = [];
    const kid = userById(id);
    if (kid && kid.photo) trash.push(kid.photo);
    state.entries.forEach((e) => { if (e.childId === id && e.photos) trash.push(...e.photos); });
    state.diary.forEach((d) => { if (d.childId === id && d.photos) trash.push(...d.photos); });
    state.payouts.forEach((p) => { if (p.childId === id && p.photos) trash.push(...p.photos); });
    state.events.forEach((e) => { if (e.childId === id && e.photos) trash.push(...e.photos); });
    state.purchases.forEach((p) => { if (p.childId === id && p.photos) trash.push(...p.photos); });
    if (trash.length) Photos.removeMany(trash);
    state.users = state.users.filter((u) => u.id !== id);
    state.entries = state.entries.filter((e) => e.childId !== id);
    state.payouts = state.payouts.filter((p) => p.childId !== id);
    state.diary = state.diary.filter((d) => d.childId !== id);
    state.events = state.events.filter((e) => e.childId !== id);
    state.purchases = state.purchases.filter((p) => p.childId !== id);
    state.decks = state.decks.filter((d) => d.childId !== id);
    save();
  }

  /* ---------- categorias e subcategorias ---------- */
  const categories = () => state.categories;
  const categoryById = (id) => state.categories.find((c) => c.id === id) || null;

  /** o peso vai de 1 a 5: quanto maior, mais aquela parte vale na mesada */
  const pesoValido = (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 2)));

  function saveCategory(data) {
    if (!data.name || !data.name.trim()) return { ok: false, error: 'Informe o nome da categoria.' };
    if (data.id) {
      const c = categoryById(data.id);
      if (!c) return { ok: false, error: 'Categoria não encontrada.' };
      const photo = String(data.photos || '').split(',').filter(Boolean)[0] || '';
      if (c.photo && c.photo !== photo) Photos.remove(c.photo);
      c.name = data.name.trim();
      c.icon = data.icon || c.icon;
      c.grad = data.grad || c.grad;
      c.photo = photo;
      if (data.peso !== undefined) c.peso = pesoValido(data.peso);
      if (data.leitura !== undefined) c.leitura = !!data.leitura;
      save();
      return { ok: true, category: c };
    }
    const c = {
      id: uid('c'), name: data.name.trim(), icon: data.icon || 'star',
      grad: data.grad || 'g1', items: [],
      photo: String(data.photos || '').split(',').filter(Boolean)[0] || '',
      peso: data.peso === undefined ? 2 : pesoValido(data.peso),
      leitura: !!data.leitura,
    };
    state.categories.push(c);
    save();
    return { ok: true, category: c };
  }

  function removeCategory(id) {
    const c = categoryById(id);
    if (c && c.photo) Photos.remove(c.photo);
    state.categories = state.categories.filter((c2) => c2.id !== id);
    save();
  }

  /**
   * Quantas vezes no mês se espera aquela ação. Desconto não entra na conta,
   * ação de todo dia vale o mês inteiro e o resto fica entre 1 e 30.
   */
  /** o esforço da ação: 1 é uma ação comum, e vai até 10 para o que dá muito trabalho */
  const esforcoValido = (v) => Math.max(1, Math.min(10, Math.round(Number(v) || 1)));

  function vezesValidas(bruto, kind, daily, anterior) {
    if (kind === 'penalty') return 0;
    if (daily) return DIAS_MES;
    const n = Math.round(Number(String(bruto === undefined || bruto === '' ? '' : bruto).replace(',', '.')));
    if (!Number.isFinite(n) || n <= 0) {
      return typeof anterior === 'number' && anterior > 0 ? anterior : VEZES_PADRAO;
    }
    return Math.max(1, Math.min(DIAS_MES, n));
  }

  function saveItem(catId, data) {
    const c = categoryById(catId);
    if (!c) return { ok: false, error: 'Categoria não encontrada.' };
    if (!data.name || !data.name.trim()) return { ok: false, error: 'Informe o nome da ação.' };
    const value = Math.abs(Number(String(data.value).replace(',', '.'))) || 0;
    if (data.id) {
      const it = c.items.find((i) => i.id === data.id);
      if (!it) return { ok: false, error: 'Ação não encontrada.' };
      const tipo = data.kind === 'penalty' ? 'penalty' : 'earn';
      Object.assign(it, {
        name: data.name.trim(), value, kind: tipo, daily: !!data.daily,
        vezesMes: vezesValidas(data.vezesMes, tipo, data.daily, it.vezesMes),
        esforco: data.esforco === undefined ? (it.esforco || 1) : esforcoValido(data.esforco),
        ficha: data.ficha === undefined ? !!it.ficha : !!data.ficha,
      });
      save();
      return { ok: true, item: it };
    }
    const tipo = data.kind === 'penalty' ? 'penalty' : 'earn';
    const it = {
      id: uid('s'), name: data.name.trim(), value, kind: tipo, daily: !!data.daily,
      vezesMes: vezesValidas(data.vezesMes, tipo, data.daily),
      esforco: esforcoValido(data.esforco),
      ficha: data.ficha === undefined ? (!!c.leitura && !data.daily && tipo !== 'penalty') : !!data.ficha,
    };
    c.items.push(it);
    save();
    return { ok: true, item: it };
  }

  function removeItem(catId, itemId) {
    const c = categoryById(catId);
    if (!c) return;
    c.items = c.items.filter((i) => i.id !== itemId);
    save();
  }

  /* ---------- lançamentos do dia ---------- */
  const entriesOf = (childId, date) =>
    state.entries.filter((e) => e.childId === childId && e.date === date);

  const entryFor = (childId, date, itemId) =>
    state.entries.find((e) => e.childId === childId && e.date === date && e.itemId === itemId) || null;

  /** marca/desmarca uma ação do dia. Só é possível desmarcar enquanto está
   *  pendente. Depois da validação do responsável o registro fica travado. */
  function toggleEntry(childId, date, catId, itemId) {
    const cat = categoryById(catId);
    const item = cat && cat.items.find((i) => i.id === itemId);
    if (!item) return { ok: false, error: 'Ação não encontrada.' };

    const existing = entryFor(childId, date, itemId);
    if (existing) {
      if (existing.status !== 'pending')
        return { ok: false, error: 'Já validado pelo responsável, não dá para alterar.' };
      state.entries = state.entries.filter((e) => e.id !== existing.id);
      if (existing.photos && existing.photos.length) Photos.removeMany(existing.photos);
      save();
      return { ok: true, removed: true };
    }

    petAddXp(childId, 2);
    const nova = {
      id: uid('e'), childId, date, catId, itemId,
      name: item.name, value: item.value, kind: item.kind, daily: !!item.daily,
      icon: cat.icon, grad: cat.grad, catName: cat.name, leitura: !!item.ficha,
      note: '', photos: [], status: 'pending',
      reviewNote: '', reviewedBy: null, reviewedAt: null,
      createdAt: new Date().toISOString(),
    };
    state.entries.push(nova);
    save();
    return { ok: true, added: true, entry: nova };
  }

  function setEntryNote(entryId, note, photos) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
    e.note = String(note || '').slice(0, 240);
    if (photos) e.photos = photos.filter(Boolean).slice(0, entryIsReading(e) ? FOTOS_LEITURA : 8);
    save();
  }

  /* =========================================================
     Registro de leitura.

     Ler não é só marcar a tarefa: ela escreve o resumo do capítulo,
     grifa a lápis o que mais gostou e manda a foto de cada página que
     grifou. Só assim o lançamento vai para a validação.
     ========================================================= */
  const FOTOS_LEITURA = 30;      // um capítulo cabe em trinta páginas
  const RESUMO_MINIMO = 140;     // caracteres: o bastante para um resumo de verdade

  /** essa tarefa pede a ficha de leitura (resumo, grifos e fotos das páginas)? */
  function entryIsReading(e) {
    if (!e) return false;
    if (e.leitura !== undefined) return !!e.leitura;
    const cat = categoryById(e.catId);
    const item = cat && cat.items.find((i) => i.id === e.itemId);
    return !!(item && item.ficha);
  }

  /** quantas páginas o capítulo tem, pelo que ela informou */
  function paginasDe(dados) {
    const de = Math.max(0, Math.round(Number(dados && dados.paginaDe) || 0));
    const ate = Math.max(0, Math.round(Number(dados && dados.paginaAte) || 0));
    if (!de || !ate || ate < de) return 0;
    return Math.min(FOTOS_LEITURA, ate - de + 1);
  }

  /**
   * Confere o registro de leitura e diz o que ainda falta. Devolve
   * { ok, faltas: [...], paginas } para a tela mostrar a lista.
   */
  function checarLeitura(dados, fotos) {
    const d = dados || {};
    const faltas = [];
    const livro = String(d.livro || '').trim();
    const resumo = String(d.resumo || '').trim();
    const paginas = paginasDe(d);
    const n = (fotos || []).filter(Boolean).length;

    if (!livro) faltas.push('Escreva o nome do livro e do capítulo.');
    if (!paginas) faltas.push('Diga de que página até que página vai o capítulo.');
    if (resumo.length < RESUMO_MINIMO) {
      faltas.push(`Falta escrever o resumo do capítulo: ${resumo.length} de ${RESUMO_MINIMO} letras.`);
    }
    if (!d.grifou) faltas.push('Marque que você grifou a lápis as partes que mais gostou.');
    if (paginas && n < paginas) {
      faltas.push(`Mande a foto de cada página grifada: ${n} de ${paginas}.`);
    } else if (!paginas && !n) {
      faltas.push('Mande as fotos das páginas grifadas.');
    }
    return { ok: !faltas.length, faltas, paginas, fotos: n, resumo: resumo.length };
  }

  /** guarda o registro de leitura junto do lançamento */
  function setEntryReading(entryId, dados, fotos) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return { ok: false, error: 'Lançamento não encontrado.' };
    if (e.status !== 'pending') return { ok: false, error: 'Já validado, não dá para alterar.' };
    const d = dados || {};
    const lista = (fotos || []).filter(Boolean).slice(0, FOTOS_LEITURA);
    const gone = (e.photos || []).filter((id) => lista.indexOf(id) === -1);
    if (gone.length) Photos.removeMany(gone);
    e.photos = lista;
    e.reading = {
      livro: String(d.livro || '').trim().slice(0, 120),
      paginaDe: Math.max(0, Math.round(Number(d.paginaDe) || 0)),
      paginaAte: Math.max(0, Math.round(Number(d.paginaAte) || 0)),
      resumo: String(d.resumo || '').trim().slice(0, 4000),
      grifou: !!d.grifou,
      partes: String(d.partes || '').trim().slice(0, 1000),
    };
    e.note = e.reading.livro;
    save();
    return { ok: true, entry: e, check: checarLeitura(e.reading, e.photos) };
  }

  /** o lançamento de leitura ainda está incompleto? */
  const entryReadingPending = (e) =>
    !!e && entryIsReading(e) && e.status === 'pending'
    && !checarLeitura(e.reading, e.photos).ok;

  /** quantos registros de leitura do dia ainda estão pela metade */
  const missingReading = (childId, date) =>
    entriesOf(childId, date).filter(entryReadingPending).length;

  /** o responsável corrige valor, descrição, observação ou fotos de um lançamento */
  function adjustEntry(entryId, data) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return { ok: false, error: 'Lançamento não encontrado.' };
    const name = String(data.name || '').trim();
    if (!name) return { ok: false, error: 'Informe a descrição.' };
    const value = Math.abs(Number(String(data.value).replace(',', '.'))) || 0;
    const photos = String(data.photos || '').split(',').filter(Boolean).slice(0, 8);
    const gone = (e.photos || []).filter((id) => !photos.includes(id));
    if (gone.length) Photos.removeMany(gone);
    Object.assign(e, {
      name: name.slice(0, 90),
      value,
      kind: data.kind === 'penalty' ? 'penalty' : 'earn',
      reviewNote: String(data.reviewNote || e.reviewNote || '').slice(0, 240),
      photos,
    });
    save();
    return { ok: true, entry: e };
  }

  /** lançamento avulso criado pelo responsável (bônus ou desconto), já validado */
  function addManualEntry(childId, data, parentId) {
    const name = String(data.name || '').trim();
    if (!name) return { ok: false, error: 'Informe a descrição.' };
    const value = Math.abs(Number(String(data.value).replace(',', '.'))) || 0;
    if (!value) return { ok: false, error: 'Informe um valor maior que zero.' };
    const cat = categoryById(data.catId) || null;
    const entry = {
      id: uid('e'), childId, date: data.date || today(),
      catId: cat ? cat.id : null, itemId: null,
      name: name.slice(0, 90), value,
      kind: data.kind === 'penalty' ? 'penalty' : 'earn',
      icon: cat ? cat.icon : (data.kind === 'penalty' ? 'close' : 'star'),
      grad: cat ? cat.grad : 'g4',
      catName: cat ? cat.name : 'Ajuste do responsável',
      note: String(data.note || '').slice(0, 240),
      photos: String(data.photos || '').split(',').filter(Boolean).slice(0, 8),
      status: 'approved', reviewNote: '', reviewedBy: parentId || null,
      reviewedAt: new Date().toISOString(), manual: true,
      createdAt: new Date().toISOString(),
    };
    state.entries.push(entry);
    save();
    return { ok: true, entry };
  }

  function removeEntry(entryId) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
    if (e.photos && e.photos.length) Photos.removeMany(e.photos);
    state.entries = state.entries.filter((x) => x.id !== entryId);
    save();
  }

  function review(entryId, status, reviewNote, parentId) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return { ok: false, error: 'Registro não encontrado.' };
    const antes = e.status;
    e.status = status === 'approved' ? 'approved' : 'rejected';
    e.reviewNote = String(reviewNote || '').slice(0, 240);
    e.reviewedBy = parentId || null;
    e.reviewedAt = new Date().toISOString();
    if (e.status === 'approved' && antes !== 'approved') petAddXp(e.childId, 5);
    save();
    return { ok: true, entry: e };
  }

  function reviewMany(ids, status, parentId) {
    ids.forEach((id) => review(id, status, '', parentId));
    return ids.length;
  }

  const pendingEntries = (childId) =>
    state.entries
      .filter((e) => e.status === 'pending' && (!childId || e.childId === childId))
      .sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)));

  const historyOf = (childId, limitDays = 60) => {
    const min = addDays(today(), -limitDays);
    return state.entries
      .filter((e) => e.childId === childId && e.date >= min)
      .sort((a, b) => (b.date.localeCompare(a.date)) || b.createdAt.localeCompare(a.createdAt));
  };

  /* ---------- diário de livros e lições ---------- */
  const DIARY_KINDS = [
    { id: 'livro', label: 'Livro', icon: 'book' },
    { id: 'licao', label: 'Lição', icon: 'pencil' },
    { id: 'atividade', label: 'Atividade', icon: 'star' },
  ];

  const diaryKind = (id) => DIARY_KINDS.find((k) => k.id === id) || DIARY_KINDS[2];

  function saveDiary(data) {
    const title = String(data.title || '').trim();
    const text = String(data.text || '').trim();
    if (!title) return { ok: false, error: 'Escreva o título (o livro, a matéria ou a atividade).' };
    if (!text) return { ok: false, error: 'Conte o que você fez.' };
    if (!data.date) return { ok: false, error: 'Informe a data.' };
    if (!data.time) return { ok: false, error: 'Informe o horário.' };

    const photos = String(data.photos || '').split(',').filter(Boolean).slice(0, 8);
    const fields = {
      kind: diaryKind(data.kind).id,
      title: title.slice(0, 90),
      text: text.slice(0, 2000),
      date: data.date,
      time: data.time,
      detail: String(data.detail || '').trim().slice(0, 60),
      minutes: Math.max(0, Number(data.minutes) || 0),
      photos,
    };

    if (data.id) {
      const d = state.diary.find((x) => x.id === data.id);
      if (!d) return { ok: false, error: 'Registro não encontrado.' };
      if (d.status !== 'pending') {
        return { ok: false, error: 'Esse registro já foi visto pelo responsável, não dá para editar.' };
      }
      const gone = (d.photos || []).filter((id) => !photos.includes(id));
      if (gone.length) Photos.removeMany(gone);
      Object.assign(d, fields);
      save();
      return { ok: true, record: d };
    }

    const record = Object.assign({
      id: uid('d'), childId: data.childId,
      status: 'pending', reviewNote: '', reviewedBy: null, reviewedAt: null,
      createdAt: new Date().toISOString(),
    }, fields);
    state.diary.push(record);
    petAddXp(data.childId, 8);
    save();
    return { ok: true, record };
  }

  function removeDiary(id) {
    const d = state.diary.find((x) => x.id === id);
    if (!d) return;
    if (d.photos && d.photos.length) Photos.removeMany(d.photos);
    state.diary = state.diary.filter((x) => x.id !== id);
    save();
  }

  const diaryOf = (childId, filter) =>
    state.diary
      .filter((d) => d.childId === childId && (!filter || filter === 'all' || d.status === filter))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const pendingDiary = (childId) =>
    state.diary
      .filter((d) => d.status === 'pending' && (!childId || d.childId === childId))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const diaryById = (id) => state.diary.find((d) => d.id === id) || null;

  function reviewDiary(id, status, reviewNote, parentId) {
    const d = diaryById(id);
    if (!d) return { ok: false, error: 'Registro não encontrado.' };
    d.status = status === 'approved' ? 'approved' : 'rejected';
    d.reviewNote = String(reviewNote || '').slice(0, 240);
    d.reviewedBy = parentId || null;
    d.reviewedAt = new Date().toISOString();
    save();
    return { ok: true, record: d };
  }

  /* ---------- bichinho do filho ---------- */
  const PET_DEFAULT = {
    name: 'Pip', shape: 'blob', color: 'lime', accessory: '',
    outfit: 'camiseta', bed: 'colchonete', room: 'quartinho', xp: 0,
  };
  const XP_NIVEL = 60;
  const CARINHOS_DIA = 5;

  /** devolve o bichinho do filho, criando um padrão na primeira vez */
  function petOf(childId) {
    const u = userById(childId);
    if (!u) return Object.assign({}, PET_DEFAULT);
    if (!u.pet) {
      u.pet = Object.assign({}, PET_DEFAULT, { care: { date: today(), count: 0 } });
      save();
    }
    if (!u.pet.care) u.pet.care = { date: today(), count: 0 };
    if (!u.pet.outfit) u.pet.outfit = 'camiseta';
    if (!u.pet.bed) u.pet.bed = 'colchonete';
    if (!u.pet.room) u.pet.room = 'quartinho';
    return u.pet;
  }

  function savePet(childId, data) {
    const u = userById(childId);
    if (!u) return { ok: false, error: 'Filho(a) não encontrado(a).' };
    const pet = petOf(childId);
    const name = String(data.name || '').trim();
    if (!name) return { ok: false, error: 'Dê um nome para o bichinho.' };
    pet.name = name.slice(0, 20);
    pet.shape = data.shape || pet.shape;
    pet.color = data.color || pet.color;
    pet.accessory = data.accessory === undefined ? pet.accessory : data.accessory;
    if (data.outfit) pet.outfit = data.outfit;
    if (data.serie) pet.serie = data.serie;
    if (data.voice !== undefined) pet.voice = !!data.voice;
    if (data.bed) pet.bed = data.bed;
    if (data.room) pet.room = data.room;
    if (data.parede) pet.parede = data.parede;
    if (data.piso) pet.piso = data.piso;
    if (Array.isArray(data.moveis)) pet.moveis = data.moveis.slice();
    save();
    return { ok: true, pet };
  }

  /** coloca o bichinho para dormir por um tempo (ou acorda) */
  function petNap(childId, minutos) {
    const pet = petOf(childId);
    pet.nap = minutos ? Date.now() + minutos * 60000 : 0;
    save();
    return pet;
  }

  const petSleeping = (childId) => {
    const pet = petOf(childId);
    return !!(pet.nap && Date.now() < pet.nap);
  };

  /** conversa entre a criança e o bichinho, guardada no aparelho */
  function petChat(childId) {
    const pet = petOf(childId);
    if (!Array.isArray(pet.chat)) pet.chat = [];
    return pet.chat;
  }

  function petSay(childId, from, text) {
    const pet = petOf(childId);
    const chat = petChat(childId);
    chat.push({ from, text: String(text || '').slice(0, 200), at: new Date().toISOString() });
    if (chat.length > 40) pet.chat = chat.slice(-40);
    save();
    return pet.chat;
  }

  /** pontos de amizade: cada ação do filho alimenta o bichinho */
  function petAddXp(childId, amount) {
    const pet = petOf(childId);
    if (!pet || !amount) return null;
    const antes = Math.floor(pet.xp / XP_NIVEL);
    pet.xp = Math.max(0, pet.xp + amount);
    save();
    const depois = Math.floor(pet.xp / XP_NIVEL);
    return {
      xp: pet.xp, levelUp: depois > antes,
      nivelAntes: antes + 1, nivelAgora: depois + 1,
    };
  }

  const petCareLeft = (childId) => {
    const pet = petOf(childId);
    const usados = pet.care && pet.care.date === today() ? pet.care.count : 0;
    return Math.max(0, CARINHOS_DIA - usados);
  };

  /** carinho: dá pontos, com limite por dia para não virar clique infinito */
  function petCare(childId) {
    const pet = petOf(childId);
    if (!pet.care || pet.care.date !== today()) pet.care = { date: today(), count: 0 };
    if (pet.care.count >= CARINHOS_DIA) {
      return { ok: false, error: 'Seu bichinho já recebeu carinho demais hoje. Volte amanhã!' };
    }
    pet.care.count += 1;
    const res = petAddXp(childId, 3) || {};
    save();
    return {
      ok: true, count: pet.care.count, levelUp: !!res.levelUp,
      nivelAntes: res.nivelAntes, nivelAgora: res.nivelAgora,
    };
  }

  /* =========================================================
     Tempo de uso: quanto tempo o filho passa no app e em quê.
     Guardamos um total por dia e por área, para o registro não
     crescer sem parar.
     ========================================================= */
  const AREAS = [
    { id: 'tarefas', label: 'Tarefas do dia', icon: 'home', grad: 'g1' },
    { id: 'diario', label: 'Diário', icon: 'book', grad: 'g5' },
    { id: 'jogos', label: 'Joguinhos', icon: 'ball', grad: 'g2' },
    { id: 'estudo', label: 'Estudo e provas', icon: 'brain', grad: 'g4' },
    { id: 'bichinho', label: 'Bichinho', icon: 'heart', grad: 'g3' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar', grad: 'g6' },
    { id: 'carteira', label: 'Carteira', icon: 'wallet', grad: 'g7' },
  ];
  const area = (id) => AREAS.find((a) => a.id === id) || AREAS[0];

  /** soma um tempinho de uso na área, no dia de hoje */
  function trackUse(childId, areaId, ms) {
    if (!childId || !ms || ms < 400) return;
    if (ms > 5 * 60000) ms = 5 * 60000;          // nada de saltos absurdos
    const hoje = today();
    const id = area(areaId).id;
    let linha = state.usage.find((u) => u.childId === childId && u.date === hoje && u.area === id);
    if (!linha) {
      linha = { childId, date: hoje, area: id, ms: 0 };
      state.usage.push(linha);
    }
    linha.ms += Math.round(ms);
    // guarda no máximo 120 dias de registro
    const limite = addDays(hoje, -120);
    if (state.usage.length > 900) state.usage = state.usage.filter((u) => u.date >= limite);
    save();
  }

  /** resumo do tempo de uso dos últimos dias */
  function usageOf(childId, dias = 7) {
    const inicio = addDays(today(), -(dias - 1));
    const linhas = state.usage.filter((u) => u.childId === childId && u.date >= inicio);
    const porDia = [];
    for (let i = dias - 1; i >= 0; i--) {
      const d = addDays(today(), -i);
      porDia.push({ date: d, ms: linhas.filter((u) => u.date === d).reduce((s2, u) => s2 + u.ms, 0) });
    }
    // menos de meio minuto numa área é só passagem, não conta na divisão
    const porArea = AREAS.map((a) => ({
      ...a, ms: linhas.filter((u) => u.area === a.id).reduce((s2, u) => s2 + u.ms, 0),
    })).filter((a) => a.ms >= 30000).sort((a, b) => b.ms - a.ms);
    const total = linhas.reduce((s2, u) => s2 + u.ms, 0);
    const diasComUso = porDia.filter((d) => d.ms > 0).length;
    const hoje = porDia[porDia.length - 1] ? porDia[porDia.length - 1].ms : 0;
    const pega = (id) => (porArea.find((a) => a.id === id) || { ms: 0 }).ms;
    return {
      total, hoje, porDia, porArea,
      media: diasComUso ? total / diasComUso : 0,
      jogos: pega('jogos'),
      estudo: pega('estudo'),
      telaMaior: porArea[0] || null,
      totalGeral: state.usage.filter((u) => u.childId === childId).reduce((s2, u) => s2 + u.ms, 0),
    };
  }

  /** o tempo de uso do dia inteiro, somando todas as áreas */
  const usageToday = (childId) =>
    state.usage.filter((u) => u.childId === childId && u.date === today())
      .reduce((s2, u) => s2 + u.ms, 0);

  /* ---------- histórico de quizzes, provas e jogos ---------- */
  const QUIZ_KINDS = [
    { id: 'prova', label: 'Prova da escola', icon: 'brain', grad: 'g4' },
    { id: 'assunto', label: 'Quiz de assunto', icon: 'book', grad: 'g5' },
    { id: 'cartas', label: 'Cartas de revisão', icon: 'book', grad: 'g1' },
    { id: 'surpresa', label: 'Pergunta surpresa', icon: 'star', grad: 'g2' },
    { id: 'jogo', label: 'Joguinho', icon: 'ball', grad: 'g6' },
  ];
  const quizKind = (id) => QUIZ_KINDS.find((k) => k.id === id) || QUIZ_KINDS[0];

  /** anota uma partida ou prova terminada */
  function logQuiz(childId, dados) {
    if (!childId) return null;
    const item = {
      id: uid('q'),
      childId,
      date: today(),
      at: new Date().toISOString(),
      kind: quizKind(dados.kind).id,
      name: String(dados.name || '').slice(0, 60),
      subjects: Array.isArray(dados.subjects) ? dados.subjects.slice(0, 6) : [],
      acertos: Number(dados.acertos) || 0,
      total: Number(dados.total) || 0,
      ms: Math.max(0, Math.round(Number(dados.ms) || 0)),
    };
    state.quizLog.unshift(item);
    if (state.quizLog.length > 400) state.quizLog.length = 400;
    save();
    return item;
  }

  /** resumo do que já foi estudado e jogado */
  function quizStats(childId, dias = 30) {
    const inicio = addDays(today(), -(dias - 1));
    const todos = state.quizLog.filter((q) => q.childId === childId);
    const periodo = todos.filter((q) => q.date >= inicio);
    const estudo = periodo.filter((q) => q.kind !== 'jogo');
    const jogos = periodo.filter((q) => q.kind === 'jogo');
    // cartas de revisão não têm pergunta respondida, então contam à parte
    const respondidos = estudo.filter((q) => q.total > 0);
    const revisoes = estudo.filter((q) => q.total === 0);
    const soma = (lista, campo) => lista.reduce((s2, q) => s2 + (q[campo] || 0), 0);
    const perguntas = soma(respondidos, 'total');
    const acertos = soma(respondidos, 'acertos');
    const porMateria = {};
    respondidos.forEach((q) => {
      (q.subjects.length ? q.subjects : ['Outros']).forEach((m) => {
        const atual = porMateria[m] || { nome: m, feitos: 0, acertos: 0, total: 0 };
        atual.feitos += 1;
        atual.acertos += q.acertos;
        atual.total += q.total;
        porMateria[m] = atual;
      });
    });
    return {
      lista: periodo,
      ultimos: todos.slice(0, 12),
      quizzes: respondidos.length,
      revisoes: revisoes.length,
      jogosCount: jogos.length,
      perguntas,
      acertos,
      aproveitamento: perguntas ? (acertos / perguntas) * 100 : 0,
      tempoEstudo: soma(estudo, 'ms'),
      tempoJogos: soma(jogos, 'ms'),
      porMateria: Object.values(porMateria).sort((a, b) => b.total - a.total),
      totalGeral: todos.length,
    };
  }

  /** 1h 12min, 45min, 30s */
  function duracao(ms) {
    const seg = Math.round((ms || 0) / 1000);
    if (seg < 60) return `${seg}s`;
    const min = Math.round(seg / 60);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const resto = min % 60;
    return resto ? `${h}h ${resto}min` : `${h}h`;
  }

  /* ---------- quizzes das matérias ---------- */
  const SUBJECTS = [
    { id: 'matematica', label: 'Matemática', icon: 'brain', grad: 'g4' },
    { id: 'portugues', label: 'Português', icon: 'book', grad: 'g5' },
    { id: 'ciencias', label: 'Ciências', icon: 'leaf', grad: 'g3' },
    { id: 'historia', label: 'História', icon: 'trophy', grad: 'g2' },
    { id: 'geografia', label: 'Geografia', icon: 'target', grad: 'g6' },
    { id: 'ingles', label: 'Inglês', icon: 'chat', grad: 'g1' },
    { id: 'outra', label: 'Outra matéria', icon: 'star', grad: 'g7' },
  ];

  const subject = (id) => SUBJECTS.find((s2) => s2.id === id) || SUBJECTS[6];

  /** transforma o que a criança escreveu em cartas de pergunta e resposta */
  function parseCards(texto) {
    return String(texto || '')
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter(Boolean)
      .map((linha) => {
        const m = linha.match(/^(.+?)\s*(?:=|\||\t|:| - | -- | > )\s*(.+)$/);
        if (!m) return null;
        const q = m[1].trim();
        const a = m[2].trim();
        if (!q || !a) return null;
        return { id: uid('c'), q: q.slice(0, 160), a: a.slice(0, 160) };
      })
      .filter(Boolean);
  }

  function saveDeck(childId, data) {
    const name = String(data.name || '').trim();
    if (!name) return { ok: false, error: 'Dê um nome para o assunto.' };
    const novas = parseCards(data.bulk);
    const fields = {
      subject: subject(data.subject).id,
      name: name.slice(0, 60),
      notes: String(data.notes || '').trim().slice(0, 800),
    };
    if (data.id) {
      const d = state.decks.find((x) => x.id === data.id);
      if (!d) return { ok: false, error: 'Assunto não encontrado.' };
      Object.assign(d, fields);
      d.cards = d.cards.concat(novas).slice(0, 120);
      save();
      return { ok: true, deck: d, novas: novas.length };
    }
    const deck = Object.assign({
      id: uid('dk'), childId, cards: novas.slice(0, 120),
      plays: 0, best: 0, createdAt: new Date().toISOString(),
    }, fields);
    state.decks.push(deck);
    save();
    return { ok: true, deck, novas: novas.length };
  }

  function addCard(deckId, q, a) {
    const d = deckById(deckId);
    if (!d) return { ok: false, error: 'Assunto não encontrado.' };
    const pergunta = String(q || '').trim();
    const resposta = String(a || '').trim();
    if (!pergunta || !resposta) return { ok: false, error: 'Escreva a pergunta e a resposta.' };
    if (d.cards.length >= 120) return { ok: false, error: 'Esse assunto já tem 120 perguntas.' };
    d.cards.push({ id: uid('c'), q: pergunta.slice(0, 160), a: resposta.slice(0, 160) });
    save();
    return { ok: true, deck: d };
  }

  function removeCard(deckId, cardId) {
    const d = deckById(deckId);
    if (!d) return;
    d.cards = d.cards.filter((c) => c.id !== cardId);
    save();
  }

  function removeDeck(id) {
    state.decks = state.decks.filter((d) => d.id !== id);
    save();
  }

  const deckById = (id) => state.decks.find((d) => d.id === id) || null;
  const decksOf = (childId) =>
    state.decks.filter((d) => d.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  /** todas as cartas do filho, usadas nas perguntas surpresa do bichinho */
  const allCards = (childId) =>
    decksOf(childId).flatMap((d) => d.cards.map((c) => Object.assign({ deck: d.name, subject: d.subject }, c)));

  /** guarda o resultado do quiz e devolve os pontos ganhos */
  function quizResult(childId, deckId, acertos, total) {
    const d = deckById(deckId);
    if (d) {
      d.plays = (d.plays || 0) + 1;
      d.best = Math.max(d.best || 0, acertos);
      d.lastPlayed = new Date().toISOString();
    }
    const hoje = petGamesToday(childId);
    const xp = Math.max(0, Math.min(acertos * 2, hoje.left));
    const pet = petOf(childId);
    pet.games.xp += xp;
    const res = xp ? petAddXp(childId, xp) : null;
    save();
    return {
      xp, levelUp: !!(res && res.levelUp), acertos, total,
      nivelAntes: res && res.nivelAntes, nivelAgora: res && res.nivelAgora,
    };
  }

  const XP_JOGOS_DIA = 20;

  /** quanto os joguinhos já renderam hoje */
  function petGamesToday(childId) {
    const pet = petOf(childId);
    if (!pet.games || pet.games.date !== today()) pet.games = { date: today(), xp: 0 };
    return { xp: pet.games.xp, max: XP_JOGOS_DIA, left: Math.max(0, XP_JOGOS_DIA - pet.games.xp) };
  }

  /** guarda o resultado da partida, respeitando o teto de pontos do dia */
  function petGameResult(childId, gameId, score, xpBruto) {
    const pet = petOf(childId);
    const hoje = petGamesToday(childId);
    const xp = Math.max(0, Math.min(Math.round(xpBruto) || 0, hoje.left));
    pet.games.xp += xp;
    pet.best = pet.best || {};
    const recorde = (pet.best[gameId] || 0) < score;
    if (recorde) pet.best[gameId] = score;
    const res = xp ? petAddXp(childId, xp) : null;
    save();
    return {
      xp, recorde, levelUp: !!(res && res.levelUp),
      nivelAntes: res && res.nivelAntes, nivelAgora: res && res.nivelAgora,
    };
  }

  /* ---------- desafios do dia (palavrinha, contexto, teia) ---------- */
  /** número do dia, usado para escolher sempre o mesmo desafio para todo mundo */
  function dayNumber(iso) {
    const d = fromISO(iso || today());
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  /** o que já foi jogado hoje nesse desafio */
  function dailyGame(childId, jogo, date) {
    const dia = date || today();
    const linha = state.daily.find((d) => d.childId === childId && d.jogo === jogo && d.date === dia);
    return linha ? linha.dados : null;
  }

  /** guarda o andamento do desafio do dia; só o dia de hoje importa */
  function saveDailyGame(childId, jogo, dados) {
    const dia = today();
    let linha = state.daily.find((d) => d.childId === childId && d.jogo === jogo && d.date === dia);
    if (!linha) {
      linha = { childId, jogo, date: dia };
      state.daily.push(linha);
    }
    linha.dados = dados;
    // guarda pouca coisa: só os últimos 60 dias de cada filho
    const limite = addDays(dia, -60);
    if (state.daily.length > 240) state.daily = state.daily.filter((d) => d.date >= limite);
    save();
    return linha.dados;
  }

  /** quantos dias seguidos ela terminou esse desafio, contando de hoje para trás */
  function dailyStreak(childId, jogo) {
    let n = 0;
    for (let i = 0; i < 60; i += 1) {
      const dados = dailyGame(childId, jogo, addDays(today(), -i));
      if (dados && dados.ganhou) { n += 1; continue; }
      if (i === 0) continue; // hoje ela ainda pode jogar, então não quebra a sequência
      break;
    }
    return n;
  }

  /* ---------- gastos do filho (o que ele comprou) ---------- */
  const PURCHASE_KINDS = [
    { id: 'lanche', label: 'Lanche', icon: 'apple', grad: 'g2' },
    { id: 'brinquedo', label: 'Brinquedo', icon: 'puzzle', grad: 'g4' },
    { id: 'jogo', label: 'Jogo', icon: 'ball', grad: 'g6' },
    { id: 'presente', label: 'Presente', icon: 'star', grad: 'g5' },
    { id: 'roupa', label: 'Roupa', icon: 'backpack', grad: 'g3' },
    { id: 'outro', label: 'Outro', icon: 'coins', grad: 'g7' },
  ];

  const purchaseKind = (id) => PURCHASE_KINDS.find((k) => k.id === id) || PURCHASE_KINDS[5];

  function savePurchase(childId, data) {
    const title = String(data.title || '').trim();
    if (!title) return { ok: false, error: 'Escreva o que você comprou.' };
    const value = Math.abs(Number(String(data.value).replace(',', '.'))) || 0;
    if (!value) return { ok: false, error: 'Informe quanto custou.' };

    const photos = String(data.photos || '').split(',').filter(Boolean).slice(0, 4);
    const fields = {
      kind: purchaseKind(data.kind).id,
      title: title.slice(0, 90),
      value,
      date: data.date || today(),
      note: String(data.note || '').trim().slice(0, 240),
      photos,
    };

    if (data.id) {
      const pc = state.purchases.find((x) => x.id === data.id);
      if (!pc) return { ok: false, error: 'Gasto não encontrado.' };
      const gone = (pc.photos || []).filter((id) => !photos.includes(id));
      if (gone.length) Photos.removeMany(gone);
      Object.assign(pc, fields);
      save();
      return { ok: true, purchase: pc };
    }

    const purchase = Object.assign({
      id: uid('gc'), childId, createdAt: new Date().toISOString(),
    }, fields);
    state.purchases.push(purchase);
    petAddXp(childId, 1);
    save();
    return { ok: true, purchase };
  }

  function removePurchase(id) {
    const pc = state.purchases.find((x) => x.id === id);
    if (!pc) return;
    if (pc.photos && pc.photos.length) Photos.removeMany(pc.photos);
    state.purchases = state.purchases.filter((x) => x.id !== id);
    save();
  }

  const purchaseById = (id) => state.purchases.find((p) => p.id === id) || null;

  const purchasesOf = (childId, ym) =>
    state.purchases
      .filter((p) => p.childId === childId && (!ym || monthOf(p.date) === ym))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  /** dinheiro que já foi entregue e ainda não foi gasto */
  function cash(childId) {
    const received = state.payouts
      .filter((p) => p.childId === childId)
      .reduce((sum, p) => sum + p.amount, 0);
    const spent = state.purchases
      .filter((p) => p.childId === childId)
      .reduce((sum, p) => sum + p.value, 0);
    return { received, spent, left: received - spent };
  }

  /* ---------- agenda: provas, trabalhos e eventos ---------- */
  const EVENT_KINDS = [
    { id: 'prova', label: 'Prova', icon: 'brain', grad: 'g5' },
    { id: 'trabalho', label: 'Trabalho', icon: 'pencil', grad: 'g1' },
    { id: 'evento', label: 'Evento', icon: 'star', grad: 'g2' },
    { id: 'aula', label: 'Aula', icon: 'book', grad: 'g6' },
    { id: 'lembrete', label: 'Lembrete', icon: 'bell', grad: 'g7' },
  ];

  const eventKind = (id) => EVENT_KINDS.find((k) => k.id === id) || EVENT_KINDS[2];

  function saveEvent(data, author) {
    const title = String(data.title || '').trim();
    if (!title) return { ok: false, error: 'Escreva o nome do compromisso.' };
    if (!data.date) return { ok: false, error: 'Informe a data.' };
    if (!data.childId) return { ok: false, error: 'Escolha de quem é o compromisso.' };

    const photos = String(data.photos || '').split(',').filter(Boolean).slice(0, 4);
    const fields = {
      childId: data.childId,
      kind: eventKind(data.kind).id,
      title: title.slice(0, 90),
      date: data.date,
      time: data.time || '',
      place: String(data.place || '').trim().slice(0, 60),
      notes: String(data.notes || '').trim().slice(0, 600),
      photos,
    };

    if (data.id) {
      const ev = state.events.find((x) => x.id === data.id);
      if (!ev) return { ok: false, error: 'Compromisso não encontrado.' };
      const gone = (ev.photos || []).filter((id) => !photos.includes(id));
      if (gone.length) Photos.removeMany(gone);
      Object.assign(ev, fields);
      save();
      return { ok: true, event: ev };
    }

    const ev = Object.assign({
      id: uid('ev'),
      done: false,
      createdBy: (author && author.id) || null,
      createdByName: (author && author.name) || '',
      createdByRole: (author && author.role) || 'parent',
      createdAt: new Date().toISOString(),
    }, fields);
    state.events.push(ev);
    petAddXp(ev.childId, 3);
    save();
    return { ok: true, event: ev };
  }

  function removeEvent(id) {
    const ev = state.events.find((x) => x.id === id);
    if (!ev) return;
    if (ev.photos && ev.photos.length) Photos.removeMany(ev.photos);
    state.events = state.events.filter((x) => x.id !== id);
    save();
  }

  function toggleEventDone(id) {
    const ev = state.events.find((x) => x.id === id);
    if (!ev) return;
    ev.done = !ev.done;
    if (ev.done) petAddXp(ev.childId, 4);
    save();
    return ev;
  }

  const eventById = (id) => state.events.find((e) => e.id === id) || null;

  const byWhen = (a, b) => (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99'));

  /** compromissos de um filho (ou de todos, quando childId é vazio) */
  const eventsOf = (childId, filter) =>
    state.events
      .filter((e) => (!childId || e.childId === childId))
      .filter((e) => (!filter || filter === 'all' || e.kind === filter))
      .sort(byWhen);

  const eventsOfMonth = (childId, ym) =>
    eventsOf(childId).filter((e) => monthOf(e.date) === ym);

  const eventsOfDay = (childId, date) =>
    eventsOf(childId).filter((e) => e.date === date);

  /** o que vem pela frente, incluindo o que passou e continua em aberto */
  function upcomingEvents(childId, days = 21) {
    const from = today();
    const to = addDays(from, days);
    return eventsOf(childId)
      .filter((e) => (e.date >= from && e.date <= to) || (e.date < from && !e.done))
      .sort(byWhen);
  }

  /** quantos dias faltam (negativo quando já passou) */
  const daysUntil = (iso) =>
    Math.round((fromISO(iso) - fromISO(today())) / 86400000);

  /* ---------- dinheiro ---------- */
  const signed = (e) => (e.kind === 'penalty' ? -e.value : e.value);

  function totals(childId, ym) {
    const inMonth = (d) => !ym || monthOf(d) === ym;
    let approved = 0, pending = 0, penalties = 0, approvedCount = 0, pendingCount = 0;
    state.entries.forEach((e) => {
      if (e.childId !== childId || !inMonth(e.date)) return;
      if (e.status === 'approved') {
        approved += signed(e);
        approvedCount++;
        if (e.kind === 'penalty') penalties += e.value;
      } else if (e.status === 'pending') {
        pending += signed(e);
        pendingCount++;
      }
    });
    const paid = state.payouts
      .filter((p) => p.childId === childId && inMonth(p.date))
      .reduce((s, p) => s + p.amount, 0);
    return { approved, pending, penalties, paid, approvedCount, pendingCount };
  }

  /**
   * Números do painel: o que ela ganhou, o que recebeu e o que gastou,
   * mês a mês e por categoria.
   */
  function dashboard(childId, meses = 6) {
    const hoje = today();
    const lista = [];
    const base = new Date(`${hoje}T12:00:00`);
    for (let i = meses - 1; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      lista.push({ ym, label: MONTHS[d.getMonth()].slice(0, 3), ano: d.getFullYear(),
        ganho: 0, desconto: 0, recebido: 0, gasto: 0 });
    }
    const porMes = {};
    lista.forEach((m) => { porMes[m.ym] = m; });

    let ganho = 0, desconto = 0, aguardando = 0;
    const porCategoria = {};
    state.entries.forEach((e) => {
      if (e.childId !== childId) return;
      const mes = porMes[monthOf(e.date)];
      if (e.status === 'pending') { aguardando += signed(e); return; }
      if (e.status !== 'approved') return;
      if (e.kind === 'penalty') {
        desconto += e.value;
        if (mes) mes.desconto += e.value;
      } else {
        ganho += e.value;
        if (mes) mes.ganho += e.value;
        const chave = e.catName || 'Outros';
        const atual = porCategoria[chave] || { nome: chave, grad: e.grad || 'g7', icon: e.icon || 'star', total: 0, vezes: 0 };
        atual.total += e.value;
        atual.vezes += 1;
        porCategoria[chave] = atual;
      }
    });

    let recebido = 0;
    state.payouts.forEach((p) => {
      if (p.childId !== childId) return;
      recebido += p.amount;
      const mes = porMes[monthOf(p.date)];
      if (mes) mes.recebido += p.amount;
    });

    let gasto = 0;
    const porTipo = {};
    const compras = state.purchases.filter((p) => p.childId === childId);
    compras.forEach((p) => {
      gasto += p.value;
      const mes = porMes[monthOf(p.date)];
      if (mes) mes.gasto += p.value;
      const k = purchaseKind(p.kind);
      const atual = porTipo[k.id] || { id: k.id, nome: k.label, grad: k.grad, icon: k.icon, total: 0, vezes: 0 };
      atual.total += p.value;
      atual.vezes += 1;
      porTipo[k.id] = atual;
    });

    const ordenar = (obj) => Object.values(obj).sort((a, b) => b.total - a.total);
    const mesesComGasto = lista.filter((m) => m.gasto > 0).length;
    const mesesComGanho = lista.filter((m) => m.ganho > 0).length;

    return {
      meses: lista,
      ganho, desconto, recebido, gasto, aguardando,
      liquido: ganho - desconto,
      aReceber: balance(childId),
      naCarteira: recebido - gasto,
      guardado: Math.max(0, recebido - gasto),
      gastosPorTipo: ordenar(porTipo),
      ganhosPorCategoria: ordenar(porCategoria),
      maioresGastos: compras.slice().sort((a, b) => b.value - a.value).slice(0, 5),
      mediaGasto: mesesComGasto ? gasto / mesesComGasto : 0,
      mediaGanho: mesesComGanho ? ganho / mesesComGanho : 0,
      comprasCount: compras.length,
      // quanto de cada real recebido ela ainda tem guardado
      guardadoPct: recebido ? Math.max(0, (recebido - gasto) / recebido) * 100 : 0,
    };
  }

  /** saldo disponível = tudo que já foi aprovado (menos descontos) - pagamentos */
  function balance(childId) {
    const earned = state.entries
      .filter((e) => e.childId === childId && e.status === 'approved')
      .reduce((s, e) => s + signed(e), 0);
    const paid = state.payouts
      .filter((p) => p.childId === childId)
      .reduce((s, p) => s + p.amount, 0);
    return earned - paid;
  }

  /** cria ou edita um pagamento; aceita foto do comprovante */
  function savePayout(childId, data) {
    const amount = Math.abs(Number(String(data.amount).replace(',', '.'))) || 0;
    if (!amount) return { ok: false, error: 'Informe um valor maior que zero.' };
    const photos = String(data.photos || '').split(',').filter(Boolean).slice(0, 4);
    const fields = {
      amount,
      note: String(data.note || '').slice(0, 120),
      date: data.date || today(),
      photos,
    };
    if (data.id) {
      const p = state.payouts.find((x) => x.id === data.id);
      if (!p) return { ok: false, error: 'Pagamento não encontrado.' };
      const gone = (p.photos || []).filter((id) => !photos.includes(id));
      if (gone.length) Photos.removeMany(gone);
      Object.assign(p, fields);
      save();
      return { ok: true, payout: p };
    }
    const payout = Object.assign({ id: uid('p'), childId, createdAt: new Date().toISOString() }, fields);
    state.payouts.push(payout);
    save();
    return { ok: true, payout };
  }

  function removePayout(id) {
    const p = state.payouts.find((x) => x.id === id);
    if (!p) return;
    if (p.photos && p.photos.length) Photos.removeMany(p.photos);
    state.payouts = state.payouts.filter((x) => x.id !== id);
    save();
  }

  const payoutById = (id) => state.payouts.find((p) => p.id === id) || null;

  const payoutsOf = (childId) =>
    state.payouts.filter((p) => p.childId === childId).sort((a, b) => b.date.localeCompare(a.date));

  /** situação do dia: quantas ações diárias obrigatórias já foram preenchidas */
  function dayStatus(childId, date) {
    const required = state.categories.flatMap((c) => c.items.filter((i) => i.daily).map((i) => i.id));
    const entries = entriesOf(childId, date);
    const marcadas = entries.filter((e) => required.includes(e.itemId));
    // uma tarefa de todo dia só conta como feita quando tem a foto,
    // e a de leitura só quando o resumo e as páginas grifadas estão lá
    const incompleta = (e) => entryNeedsPhoto(e) || entryReadingPending(e);
    const filled = marcadas.filter((e) => !incompleta(e)).length;
    const semFoto = marcadas.filter(entryNeedsPhoto).length;
    const semLeitura = entries.filter(entryReadingPending).length;
    const pending = entries.filter((e) => e.status === 'pending').length;
    return {
      required: required.length,
      filled,
      marcadas: marcadas.length,
      semFoto,
      semLeitura,
      complete: required.length > 0 && filled >= required.length,
      total: entries.length,
      pending,
      value: entries.filter((e) => e.status !== 'rejected').reduce((s, e) => s + signed(e), 0),
    };
  }

  /* =========================================================
     Planejador da mesada.

     O responsável diz quanto vale a mesada no mês. A partir daí o app
     divide esse valor entre as categorias pelo peso de cada uma (a
     leitura tem o maior) e depois entre as ações, na conta de quantas
     vezes por mês se espera cada uma. Assim, se o filho fizer tudo o
     que foi combinado, o mês fecha exatamente na mesada.
     ========================================================= */

  /** arredonda para o múltiplo de 5 centavos, nunca abaixo de 5 centavos */
  const arredondar = (v) => Math.max(0.05, Math.round(v * 20) / 20);

  const pesoDe = (cat) => pesoValido(cat && cat.peso);
  const vezesDe = (item) => {
    if (!item || item.kind === 'penalty') return 0;
    if (item.daily) return DIAS_MES;
    return typeof item.vezesMes === 'number' && item.vezesMes > 0 ? item.vezesMes : VEZES_PADRAO;
  };

  /** o valor combinado da mesada do filho */
  function allowanceOf(childId) {
    const c = userById(childId);
    return c && typeof c.allowance === 'number' ? c.allowance : 0;
  }

  function setAllowance(childId, valor) {
    const c = userById(childId);
    if (!c) return { ok: false, error: 'Filho não encontrado.' };
    const v = Math.abs(Number(String(valor).replace(',', '.'))) || 0;
    if (!v) return { ok: false, error: 'Informe um valor maior que zero.' };
    c.allowance = Math.round(v * 100) / 100;
    save();
    return { ok: true, allowance: c.allowance };
  }

  /**
   * Monta o plano sem gravar nada: devolve quanto cada categoria e cada
   * ação passariam a valer para o mês fechar na mesada.
   * opcoes: { mesada, pesos: {catId: peso}, vezes: {itemId: n} }
   */
  function planoMesada(childId, opcoes) {
    const op = opcoes || {};
    const mesada = op.mesada !== undefined
      ? Math.abs(Number(String(op.mesada).replace(',', '.'))) || 0
      : allowanceOf(childId);

    const peso = (c) => (op.pesos && op.pesos[c.id] !== undefined ? pesoValido(op.pesos[c.id]) : pesoDe(c));
    const vezes = (it) => (op.vezes && op.vezes[it.id] !== undefined
      ? vezesValidas(op.vezes[it.id], it.kind, it.daily)
      : vezesDe(it));
    const esforco = (it) => (op.esforcos && op.esforcos[it.id] !== undefined
      ? esforcoValido(op.esforcos[it.id])
      : esforcoValido(it.esforco));

    // total de "pontos do mês": cada ação vale o peso da categoria dela,
    // multiplicado pelas vezes que se espera no mês
    let pontos = 0;
    state.categories.forEach((c) => {
      c.items.forEach((it) => {
        if (it.kind === 'penalty') return;
        pontos += peso(c) * esforco(it) * vezes(it);
      });
    });

    /* O valor de cada ação sai arredondado em 10 centavos, e arredondar
       para cima empurraria o mês para longe da mesada. Então o app procura,
       por tentativa, o valor por ponto em que o total arredondado fica o
       mais perto possível do combinado. */
    function totalCom(vp) {
      let soma = 0;
      state.categories.forEach((c) => {
        const p = peso(c);
        c.items.forEach((it) => {
          if (it.kind === 'penalty') return;
          soma += arredondar(vp * p * esforco(it)) * vezes(it);
        });
      });
      return soma;
    }

    let porPonto = pontos > 0 ? mesada / pontos : 0;
    if (pontos > 0 && mesada > 0) {
      let baixo = 0;
      let alto = porPonto * 4 + 1;
      for (let i = 0; i < 40; i += 1) {
        const meio = (baixo + alto) / 2;
        if (totalCom(meio) > mesada) alto = meio; else baixo = meio;
      }
      // entre a tentativa que fica abaixo e a que passa, fica a que erra menos
      porPonto = Math.abs(totalCom(baixo) - mesada) <= Math.abs(totalCom(alto) - mesada) ? baixo : alto;
    }

    const categorias = state.categories.map((c) => {
      const p = peso(c);
      const itens = c.items.map((it) => {
        const n = vezes(it);
        const f = esforco(it);
        // desconto custa o dobro de uma ação normal daquela categoria
        const valor = it.kind === 'penalty'
          ? arredondar(porPonto * p * 2)
          : arredondar(porPonto * p * f);
        return {
          id: it.id, name: it.name, kind: it.kind, daily: !!it.daily,
          vezesMes: n, esforco: f, valorAtual: it.value, valor,
          noMes: it.kind === 'penalty' ? 0 : Math.round(valor * n * 100) / 100,
        };
      });
      const noMes = itens.reduce((sum, i) => sum + i.noMes, 0);
      return {
        id: c.id, name: c.name, icon: c.icon, grad: c.grad, photo: c.photo,
        peso: p, leitura: !!c.leitura, itens, noMes,
      };
    });

    /* Depois do arredondamento ainda sobra (ou falta) troco. O acerto final
       mexe no máximo cinco centavos por ação, das que mais se repetem para as
       que menos, até o mês encostar no valor combinado. */
    if (mesada > 0) {
      const todas = categorias.flatMap((c) => c.itens.filter((i) => i.kind !== 'penalty'))
        .sort((a2, b2) => b2.vezesMes - a2.vezesMes);
      for (let volta = 0; volta < 3; volta += 1) {
        let sobra = mesada - categorias.reduce((sum, c) => sum + c.noMes, 0);
        if (Math.abs(sobra) < 0.05) break;
        todas.forEach((i) => {
          const passo = sobra > 0 ? 0.05 : -0.05;
          const mexe = passo * i.vezesMes;
          if (Math.abs(mexe) > Math.abs(sobra) + 0.0001) return;
          if (i.valor + passo < 0.05) return;
          i.valor = Math.round((i.valor + passo) * 100) / 100;
          i.noMes = Math.round(i.valor * i.vezesMes * 100) / 100;
          sobra = Math.round((sobra - mexe) * 100) / 100;
        });
        categorias.forEach((c) => {
          c.noMes = Math.round(c.itens.reduce((sum, i) => sum + i.noMes, 0) * 100) / 100;
        });
      }
    }

    const total = categorias.reduce((sum, c) => sum + c.noMes, 0);
    const leitura = categorias.filter((c) => c.leitura).reduce((sum, c) => sum + c.noMes, 0);
    return {
      mesada,
      total: Math.round(total * 100) / 100,
      diferenca: Math.round((total - mesada) * 100) / 100,
      leitura: Math.round(leitura * 100) / 100,
      leituraPct: total > 0 ? Math.round((leitura / total) * 100) : 0,
      categorias: categorias.map((c) => Object.assign({}, c, {
        pct: total > 0 ? Math.round((c.noMes / total) * 100) : 0,
      })),
      pontos,
    };
  }

  /** grava o plano: guarda a mesada, os pesos, as vezes e os valores novos */
  function aplicarPlano(childId, opcoes) {
    const op = opcoes || {};
    const plano = planoMesada(childId, op);
    if (!plano.mesada) return { ok: false, error: 'Informe o valor da mesada.' };
    if (!plano.pontos) return { ok: false, error: 'Crie pelo menos uma ação antes de dividir a mesada.' };

    const kid = userById(childId);
    if (kid) kid.allowance = Math.round(plano.mesada * 100) / 100;

    plano.categorias.forEach((pc) => {
      const c = categoryById(pc.id);
      if (!c) return;
      c.peso = pc.peso;
      pc.itens.forEach((pi) => {
        const it = c.items.find((i) => i.id === pi.id);
        if (!it) return;
        it.value = pi.valor;
        it.vezesMes = pi.vezesMes;
        it.esforco = pi.esforco;
      });
    });
    save();
    return { ok: true, plano };
  }

  /**
   * Como está a mesada do mês: o combinado, o que já foi validado, o que
   * ainda espera validação e o quanto falta para fechar.
   */
  function mesadaStatus(childId, mes) {
    const alvo = mes || monthOf(today());
    const mesada = allowanceOf(childId);
    let validado = 0;
    let esperando = 0;
    let descontos = 0;
    state.entries.filter((e) => e.childId === childId && monthOf(e.date) === alvo).forEach((e) => {
      if (e.status === 'approved') {
        if (e.kind === 'penalty') descontos += e.value;
        else validado += e.value;
      } else if (e.status === 'pending') {
        if (e.kind !== 'penalty') esperando += e.value;
      }
    });
    const liquido = Math.max(0, validado - descontos);
    return {
      mes: alvo, mesada, validado, esperando, descontos, liquido,
      falta: Math.max(0, Math.round((mesada - liquido) * 100) / 100),
      pct: mesada > 0 ? Math.min(100, Math.round((liquido / mesada) * 100)) : 0,
    };
  }

  /* =========================================================
     Receber o que veio do outro celular

     Cada aparelho tem os próprios dados, e começou com ids sorteados
     só dele. Então a filha que manda pode não existir aqui, e é
     preciso achá-la pelo nome de usuário em vez do id.
     ========================================================= */

  /** acha a filha pelo nome de usuário; cria quando ela ainda não existe aqui */
  function acharOuCriarFilho(dados) {
    const usuario = String((dados && dados.u) || '').trim().toLowerCase();
    if (!usuario) return null;
    const achado = state.users.find(
      (u) => u.role === 'child' && String(u.username || '').toLowerCase() === usuario);
    if (achado) return achado;

    const novo = {
      id: uid('u'), role: 'child', name: String((dados && dados.n) || usuario).trim(),
      username: usuario, pass: hash('1234'), color: 'g1', photo: '',
      goalName: '', goalAmount: 0,
      allowance: Number((dados && dados.a) || 0) || 0,
      // veio de outro aparelho: fica marcada, para a tela poder contar isso
      deOutroAparelho: true,
    };
    state.users.push(novo);
    save();
    return novo;
  }

  /**
   * Guarda um lançamento que veio pronto do outro celular. O id vem de
   * lá de propósito: é por ele que a resposta da mãe volta e encontra a
   * tarefa certa no celular da filha.
   */
  function receberLancamento(entrada) {
    const antigo = state.entries.find((e) => e.id === entrada.id);
    if (antigo) {
      // já tinha chegado: só atualiza o que ela pode ter mexido depois,
      // e nunca mexe no que a mãe já decidiu
      if (antigo.status === 'pending') {
        antigo.note = entrada.note || antigo.note;
        antigo.reading = entrada.reading || antigo.reading;
        antigo.fotosLa = entrada.fotosLa || antigo.fotosLa;
        save();
      }
      return { ok: true, novo: false, entry: antigo };
    }
    entrada.veioDeLink = true;
    state.entries.push(entrada);
    save();
    return { ok: true, novo: true, entry: entrada };
  }

  /** aplica no celular da filha a decisão que a mãe tomou lá */
  function receberDecisao(entryId, status, recado) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return { ok: false, error: 'Este lançamento não existe mais aqui.' };
    const antes = e.status;
    e.status = status === 'approved' ? 'approved' : 'rejected';
    e.reviewNote = String(recado || '').slice(0, 400);
    e.reviewedAt = new Date().toISOString();
    // o bichinho ganha os pontos da validação, igual quando é no mesmo aparelho
    if (e.status === 'approved' && antes !== 'approved') petAddXp(e.childId, 5);
    save();
    return { ok: true, entry: e };
  }

  /** o que chegou por link, já foi decidido, e a resposta ainda não voltou */
  const aguardandoResposta = (childId, date) =>
    state.entries.filter((e) => e.veioDeLink && !e.respondido
      && (e.status === 'approved' || e.status === 'rejected')
      && (!childId || e.childId === childId) && (!date || e.date === date));

  /** marca que a resposta daquele dia já foi devolvida */
  function marcarRespondido(childId, date) {
    let n = 0;
    state.entries.forEach((e) => {
      if (e.childId === childId && e.date === date && e.veioDeLink && !e.respondido
        && (e.status === 'approved' || e.status === 'rejected')) {
        e.respondido = true;
        n++;
      }
    });
    if (n) save();
    return n;
  }

  /* ---------- aviso para a mãe quando a filha manda para confirmar ----------
     O app não tem servidor, então nada sai daqui sozinho para outro
     celular. O que dá para fazer é o celular dela abrir o WhatsApp (ou o
     SMS) com o recado já escrito, e ela tocar em enviar. O número de quem
     confirma fica guardado aqui, posto uma vez pelo responsável. */
  const AVISO_PADRAO = { on: true, canal: 'whatsapp', numero: '', nome: '' };

  /** só os dígitos, já com o 55 do Brasil quando faltar */
  function numeroLimpo(bruto) {
    let d = String(bruto || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.length === 10 || d.length === 11) d = '55' + d;  // veio sem o país
    return d;
  }

  const avisoOf = () => Object.assign({}, AVISO_PADRAO, state.aviso || {});

  /** guarda o aviso; só mexe no que vier */
  function setAviso(dados) {
    const atual = avisoOf();
    const d = dados || {};
    state.aviso = {
      on: d.on === undefined ? atual.on : !!d.on,
      canal: d.canal === 'sms' || d.canal === 'whatsapp' ? d.canal : atual.canal,
      numero: d.numero === undefined ? atual.numero : numeroLimpo(d.numero),
      nome: d.nome === undefined ? atual.nome : String(d.nome || '').trim(),
    };
    save();
    return state.aviso;
  }

  /** o aviso está pronto para funcionar? */
  const avisoPronto = () => {
    const a = avisoOf();
    return !!(a.on && a.numero && a.numero.length >= 12);
  };

  /* =========================================================
     Notas da escola

     A regra é da mãe: acima de tal nota ganha um extra, abaixo de tal
     nota desconta. Uma nota registrada vira um lançamento comum, igual
     a uma tarefa: fica esperando validação, aparece no extrato, viaja
     no link para o outro celular. Assim não existe uma segunda
     contabilidade correndo por fora.
     ========================================================= */
  const NOTAS_PADRAO = {
    ativo: true,
    maxima: 10,
    otima: { de: 9, valor: 15 },
    boa: { de: 8, valor: 8 },
    ok: { de: 7, valor: 0 },
    ruim: { valor: -8 },
  };

  /* As matérias já vêm prontas, para ela não ter que digitar "Matemática"
     toda vez. São as mesmas do banco de conteúdo da escola, então a
     matéria da nota é a mesma matéria do quiz. A lista é editável: o
     responsável tira o que a escola não tem e põe o que falta, e uma
     matéria escrita na mão entra sozinha na lista. */
  const MATERIAS_PADRAO = [
    'Português', 'Matemática', 'Ciências', 'História', 'Geografia',
    'Inglês', 'Redação', 'Artes', 'Educação Física',
  ];

  const materias = () => {
    const guardadas = Array.isArray(state.materias) ? state.materias : null;
    return (guardadas && guardadas.length ? guardadas : MATERIAS_PADRAO).slice();
  };

  /** guarda a lista, sem repetidas e sem vazias */
  function setMaterias(lista) {
    const limpa = [];
    (lista || []).forEach((m) => {
      const nome = String(m || '').trim();
      if (!nome) return;
      if (limpa.some((x) => x.toLowerCase() === nome.toLowerCase())) return;
      limpa.push(nome);
    });
    state.materias = limpa.length ? limpa : MATERIAS_PADRAO.slice();
    save();
    return materias();
  }

  /** põe uma matéria nova no fim da lista, se ela ainda não estiver lá */
  function lembrarMateria(nome) {
    const limpo = String(nome || '').trim();
    if (!limpo) return materias();
    const atual = materias();
    if (atual.some((x) => x.toLowerCase() === limpo.toLowerCase())) return atual;
    return setMaterias(atual.concat(limpo));
  }

  /* As avaliações mais comuns, também prontas. */
  const AVALIACOES = [
    '1º bimestre', '2º bimestre', '3º bimestre', '4º bimestre',
    'Prova', 'Trabalho', 'Recuperação', 'Simulado',
  ];

  const regraNotas = () => {
    const r = Object.assign({}, NOTAS_PADRAO, state.notas || {});
    ['otima', 'boa', 'ok'].forEach((k) => { r[k] = Object.assign({}, NOTAS_PADRAO[k], r[k]); });
    r.ruim = Object.assign({}, NOTAS_PADRAO.ruim, r.ruim);
    return r;
  };

  const numero = (v, padrao) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : padrao;
  };

  /** guarda a regra; as faixas ficam sempre em ordem decrescente */
  function setRegraNotas(dados) {
    const atual = regraNotas();
    const d = dados || {};
    const faixa = (k) => ({
      de: Math.max(0, numero(d[k + 'De'], atual[k].de)),
      valor: numero(d[k + 'Valor'], atual[k].valor),
    });
    const nova = {
      ativo: d.ativo === undefined ? atual.ativo : !!d.ativo,
      maxima: Math.max(1, numero(d.maxima, atual.maxima)),
      otima: faixa('otima'),
      boa: faixa('boa'),
      ok: faixa('ok'),
      ruim: { valor: numero(d.ruimValor, atual.ruim.valor) },
    };
    // uma faixa nunca pode começar abaixo da de baixo, senão nada cai nela
    if (nova.boa.de >= nova.otima.de) nova.boa.de = Math.max(0, nova.otima.de - 1);
    if (nova.ok.de >= nova.boa.de) nova.ok.de = Math.max(0, nova.boa.de - 1);
    state.notas = nova;
    save();
    return nova;
  }

  /** quanto vale uma nota, pela regra de casa */
  function valorDaNota(nota) {
    const r = regraNotas();
    const n = numero(nota, -1);
    if (n < 0) return { valor: 0, faixa: null };
    if (n >= r.otima.de) return { valor: r.otima.valor, faixa: 'otima' };
    if (n >= r.boa.de) return { valor: r.boa.valor, faixa: 'boa' };
    if (n >= r.ok.de) return { valor: r.ok.valor, faixa: 'ok' };
    return { valor: r.ruim.valor, faixa: 'ruim' };
  }

  const FAIXA_LABEL = {
    otima: 'Nota ótima', boa: 'Nota boa', ok: 'Passou', ruim: 'Abaixo do combinado',
  };

  /**
   * Registra uma nota. Vira um lançamento pendente, com o valor já
   * calculado pela regra. Nota que não vale dinheiro entra do mesmo
   * jeito, com valor zero: a mãe precisa ver todas, não só as que pagam.
   */
  function registrarNota(childId, dados, fotos) {
    const materia = String((dados && dados.materia) || '').trim();
    if (!materia) return { ok: false, error: 'Diga de qual matéria é a nota.' };
    const r = regraNotas();
    const nota = numero(dados.nota, -1);
    if (nota < 0 || nota > r.maxima)
      return { ok: false, error: `A nota precisa estar entre 0 e ${r.maxima}.` };
    const data = dados.data || today();
    const conta = valorDaNota(nota);
    const avaliacao = String(dados.avaliacao || '').trim();

    const nova = {
      id: uid('e'), childId, date: data, itemId: 'nota',
      name: `${materia}: ${String(nota).replace('.', ',')}${avaliacao ? ` (${avaliacao})` : ''}`,
      value: Math.abs(conta.valor),
      kind: conta.valor < 0 ? 'penalty' : 'earn',
      catName: 'Notas da escola', icon: 'star', grad: 'g2',
      daily: false, leitura: false,
      nota: { materia, avaliacao, nota, maxima: r.maxima, faixa: conta.faixa },
      note: avaliacao, photos: (fotos || []).filter(Boolean).slice(0, 4),
      status: 'pending', reviewNote: '', reviewedBy: null, reviewedAt: null,
      createdAt: new Date().toISOString(),
    };
    state.entries.push(nova);
    if (conta.valor > 0) petAddXp(childId, 4);
    lembrarMateria(materia);
    save();
    return { ok: true, entry: nova, valor: conta.valor, faixa: conta.faixa };
  }

  /** as notas já registradas, da mais nova para a mais velha */
  const notasOf = (childId, mes) =>
    state.entries
      .filter((e) => e.nota && (!childId || e.childId === childId)
        && (!mes || monthOf(e.date) === mes))
      .sort((a, b) => b.date.localeCompare(a.date));

  /** média das notas do mês, para a tela mostrar como ela está indo */
  function mediaNotas(childId, mes) {
    const lista = notasOf(childId, mes);
    if (!lista.length) return null;
    const soma = lista.reduce((t, e) => t + e.nota.nota, 0);
    return Math.round((soma / lista.length) * 10) / 10;
  }

  /* =========================================================
     Lição de casa

     Diferente de uma tarefa do dia: a lição tem prazo. O que importa é
     o que foi passado, para quando, e se foi feita a tempo. Fazer no
     prazo vale uma coisa; fazer atrasada vale outra, que a mãe decide.
     ========================================================= */
  const LICAO_PADRAO = { ativo: true, valor: 3, atraso: 1, esquecida: -2 };

  const regraLicao = () => Object.assign({}, LICAO_PADRAO, state.licaoRegra || {});

  function setRegraLicao(dados) {
    const atual = regraLicao();
    const d = dados || {};
    state.licaoRegra = {
      ativo: d.ativo === undefined ? atual.ativo : !!d.ativo,
      valor: Math.max(0, numero(d.valor, atual.valor)),
      atraso: Math.max(0, numero(d.atraso, atual.atraso)),
      esquecida: Math.min(0, numero(d.esquecida, atual.esquecida)),
    };
    save();
    return state.licaoRegra;
  }

  const licoes = () => (Array.isArray(state.licoes) ? state.licoes : (state.licoes = []));

  /** anota uma lição que foi passada */
  function saveLicao(dados) {
    const d = dados || {};
    const materia = String(d.materia || '').trim();
    const oque = String(d.oque || '').trim();
    if (!materia) return { ok: false, error: 'Diga de qual matéria é a lição.' };
    if (!oque) return { ok: false, error: 'Escreva o que foi passado.' };
    if (!d.entrega) return { ok: false, error: 'Diga para quando é a entrega.' };

    if (d.id) {
      const l = licoes().find((x) => x.id === d.id);
      if (!l) return { ok: false, error: 'Lição não encontrada.' };
      if (l.feitaEm) return { ok: false, error: 'Essa lição já foi entregue.' };
      Object.assign(l, { materia, oque, entrega: d.entrega });
      save();
      return { ok: true, licao: l };
    }

    const nova = {
      id: uid('l'), childId: d.childId, materia, oque,
      entrega: d.entrega, criadaEm: today(),
      feitaEm: '', entryId: '',
    };
    lembrarMateria(materia);
    licoes().push(nova);
    save();
    return { ok: true, licao: nova };
  }

  function removeLicao(id) {
    const l = licoes().find((x) => x.id === id);
    if (!l) return { ok: false, error: 'Lição não encontrada.' };
    if (l.feitaEm) return { ok: false, error: 'Já entregue: não dá para apagar.' };
    state.licoes = licoes().filter((x) => x.id !== id);
    save();
    return { ok: true };
  }

  /** no prazo, atrasada, ou ainda por fazer */
  function situacaoLicao(l) {
    if (l.feitaEm) return l.feitaEm <= l.entrega ? 'no-prazo' : 'atrasada';
    return today() > l.entrega ? 'vencida' : 'aberta';
  }

  /**
   * Ela entregou a lição. Vira um lançamento pendente, com o valor do
   * prazo ou o do atraso, e com a foto do caderno quando houver.
   */
  function entregarLicao(id, fotos) {
    const l = licoes().find((x) => x.id === id);
    if (!l) return { ok: false, error: 'Lição não encontrada.' };
    if (l.feitaEm) return { ok: false, error: 'Essa lição já foi entregue.' };
    const r = regraLicao();
    const hoje = today();
    const atrasada = hoje > l.entrega;
    const valor = atrasada ? r.atraso : r.valor;

    const nova = {
      id: uid('e'), childId: l.childId, date: hoje, itemId: 'licao',
      name: `Lição de ${l.materia}${atrasada ? ' (entregue atrasada)' : ''}`,
      value: Math.abs(valor), kind: valor < 0 ? 'penalty' : 'earn',
      catName: 'Lição de casa', icon: 'pencil', grad: 'g1',
      daily: false, leitura: false,
      licao: { id: l.id, materia: l.materia, oque: l.oque, entrega: l.entrega, atrasada },
      note: l.oque, photos: (fotos || []).filter(Boolean).slice(0, 4),
      status: 'pending', reviewNote: '', reviewedBy: null, reviewedAt: null,
      createdAt: new Date().toISOString(),
    };
    state.entries.push(nova);
    l.feitaEm = hoje;
    l.entryId = nova.id;
    petAddXp(l.childId, atrasada ? 2 : 4);
    save();
    return { ok: true, entry: nova, atrasada, valor };
  }

  /**
   * Guarda uma lição que veio do outro celular. A lição já entregue de
   * um lado manda no outro: entrega é fato consumado, não se desfaz.
   */
  function receberLicao(vinda) {
    const antiga = licoes().find((l) => l.id === vinda.id);
    if (!antiga) {
      licoes().push(Object.assign({ feitaEm: '', entryId: '' }, vinda));
      save();
      return { ok: true, nova: true };
    }
    if (!antiga.feitaEm && vinda.feitaEm) {
      antiga.feitaEm = vinda.feitaEm;
      antiga.entryId = vinda.entryId || antiga.entryId;
    }
    if (!antiga.feitaEm) {
      antiga.materia = vinda.materia || antiga.materia;
      antiga.oque = vinda.oque || antiga.oque;
      antiga.entrega = vinda.entrega || antiga.entrega;
    }
    save();
    return { ok: true, nova: false };
  }

  /** as lições de um filho, as abertas primeiro e pela entrega mais próxima */
  function licoesOf(childId, incluirFeitas) {
    return licoes()
      .filter((l) => (!childId || l.childId === childId) && (incluirFeitas || !l.feitaEm))
      .sort((a, b) => {
        if (!!a.feitaEm !== !!b.feitaEm) return a.feitaEm ? 1 : -1;
        return a.entrega.localeCompare(b.entrega);
      });
  }

  /** o resumo que a tela mostra no topo */
  function licaoStatus(childId) {
    const lista = licoesOf(childId, true);
    const abertas = lista.filter((l) => !l.feitaEm);
    return {
      total: lista.length,
      abertas: abertas.length,
      hoje: abertas.filter((l) => l.entrega === today()).length,
      vencidas: abertas.filter((l) => l.entrega < today()).length,
      feitas: lista.filter((l) => l.feitaEm).length,
    };
  }

  /* ---------- lembrete diário no celular do filho ---------- */
  const LEMBRETE_PADRAO = { on: false, hora: '19:00', ultimo: '' };

  const reminderOf = (childId) => {
    const c = userById(childId);
    return Object.assign({}, LEMBRETE_PADRAO, (c && c.reminder) || {});
  };

  /** liga, desliga ou muda a hora do lembrete; só mexe no que vier */
  function setReminder(childId, dados) {
    const c = userById(childId);
    if (!c) return reminderOf(childId);
    const atual = reminderOf(childId);
    const d = dados || {};
    c.reminder = {
      on: d.on === undefined ? atual.on : !!d.on,
      hora: /^\d{1,2}:\d{2}$/.test(d.hora || '') ? d.hora : atual.hora,
      ultimo: d.ultimo === undefined ? atual.ultimo : d.ultimo,
    };
    save();
    return c.reminder;
  }

  /* ---------- foto obrigatória nas tarefas de todo dia ---------- */
  /** liga ou desliga a exigência de foto (o responsável decide) */
  function setPhotoRequired(valor) {
    state.settings = state.settings || {};
    state.settings.photoRequired = !!valor;
    save();
    return state.settings.photoRequired;
  }

  /** por padrão a foto é obrigatória nas atividades diárias */
  const photoRequired = () =>
    !state.settings || state.settings.photoRequired === undefined
      ? true
      : !!state.settings.photoRequired;

  /** essa tarefa é das de todo dia? (entradas antigas não guardavam o campo) */
  function entryIsDaily(e) {
    if (!e) return false;
    if (e.daily !== undefined) return !!e.daily;
    const cat = categoryById(e.catId);
    const item = cat && cat.items.find((i) => i.id === e.itemId);
    return !!(item && item.daily);
  }

  /** a tarefa está marcada mas ainda sem a foto que ela exige */
  const entryNeedsPhoto = (e) =>
    !!e && photoRequired() && entryIsDaily(e) && e.status === 'pending'
    && !(e.photos && e.photos.length);

  /** quantas tarefas do dia ainda estão sem foto */
  const missingPhotos = (childId, date) =>
    entriesOf(childId, date).filter(entryNeedsPhoto).length;

  /* ---------- tema ---------- */
  function setTheme(theme) {
    state.settings = state.settings || {};
    state.settings.theme = theme === 'dark' ? 'dark' : 'light';
    save();
    return state.settings.theme;
  }
  const theme = () => (state.settings && state.settings.theme) || 'light';

  return {
    // dados
    get, save, resetAll,
    // sessão
    login, logout, currentUser, changePassword,
    // usuários
    children, userById, saveChild, removeChild, setUserPhoto,
    // categorias
    categories, categoryById, saveCategory, removeCategory, saveItem, removeItem,
    // lançamentos
    entriesOf, entryFor, toggleEntry, setEntryNote, review, reviewMany,
    pendingEntries, historyOf, dayStatus, signed, adjustEntry, addManualEntry, removeEntry,
    // diário
    saveDiary, removeDiary, diaryOf, diaryById, pendingDiary, reviewDiary, diaryKind, DIARY_KINDS,
    // bichinho
    petOf, savePet, petAddXp, petCare, petCareLeft, petGamesToday, petGameResult,
    petNap, petSleeping, petChat, petSay,
    // desafios do dia
    dayNumber, dailyGame, saveDailyGame, dailyStreak,
    // estudos
    saveDeck, removeDeck, deckById, decksOf, addCard, removeCard, allCards, quizResult,
    parseCards, subject, SUBJECTS,
    // gastos
    savePurchase, removePurchase, purchaseById, purchasesOf, cash, purchaseKind, PURCHASE_KINDS,
    // agenda
    saveEvent, removeEvent, toggleEventDone, eventById, eventsOf, eventsOfMonth,
    eventsOfDay, upcomingEvents, daysUntil, eventKind, EVENT_KINDS,
    // dinheiro
    totals, balance, dashboard, savePayout,
    // tempo de uso e histórico de estudo
    trackUse, usageOf, usageToday, logQuiz, quizStats, duracao, area, quizKind, AREAS, QUIZ_KINDS, removePayout, payoutById, payoutsOf,
    // planejador da mesada
    allowanceOf, setAllowance, planoMesada, aplicarPlano, mesadaStatus, DIAS_MES,
    // lembrete diário
    reminderOf, setReminder,
    avisoOf, setAviso, avisoPronto, numeroLimpo,
    // notas da escola
    regraNotas, setRegraNotas, valorDaNota, registrarNota, notasOf, mediaNotas, FAIXA_LABEL,
    materias, setMaterias, lembrarMateria, MATERIAS_PADRAO, AVALIACOES,
    // lição de casa
    regraLicao, setRegraLicao, saveLicao, removeLicao, entregarLicao, licoesOf,
    situacaoLicao, licaoStatus, receberLicao,
    acharOuCriarFilho, receberLancamento, receberDecisao, aguardandoResposta, marcarRespondido,
    substituirTudo, retrato,
    // tema e regras
    setTheme, theme, setPhotoRequired, photoRequired, entryIsDaily, entryNeedsPhoto, missingPhotos,
    // registro de leitura
    entryIsReading, setEntryReading, checarLeitura, entryReadingPending, missingReading,
    FOTOS_LEITURA, RESUMO_MINIMO,
    // helpers
    uid, today, toISO, fromISO, addDays, monthOf, labelDate, labelMonth, money,
    WEEKDAYS, MONTHS,
  };
})();

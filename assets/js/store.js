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
        },
      ],
      categories: [
        {
          id: uid('c'), name: 'Estudos', icon: 'book', grad: 'g1', items: [
            { id: uid('s'), name: 'Fazer a lição de casa', value: 3, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Estudar 30 minutos', value: 2, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Ler um capítulo', value: 2, kind: 'earn', daily: false },
          ],
        },
        {
          id: uid('c'), name: 'Casa', icon: 'house', grad: 'g2', items: [
            { id: uid('s'), name: 'Arrumar a cama', value: 1, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Organizar o quarto', value: 2, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Ajudar na louça', value: 3, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Tirar o lixo', value: 1, kind: 'earn', daily: false },
          ],
        },
        {
          id: uid('c'), name: 'Saúde', icon: 'heart', grad: 'g3', items: [
            { id: uid('s'), name: 'Escovar os dentes 3x', value: 1, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Tomar banho', value: 1, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Beber bastante água', value: 1, kind: 'earn', daily: true },
          ],
        },
        {
          id: uid('c'), name: 'Atitude', icon: 'star', grad: 'g4', items: [
            { id: uid('s'), name: 'Ajudar sem pedirem', value: 3, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Cumprir os combinados', value: 2, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Faltar com respeito', value: 3, kind: 'penalty', daily: false },
            { id: uid('s'), name: 'Passar do tempo de tela', value: 2, kind: 'penalty', daily: false },
          ],
        },
        {
          id: uid('c'), name: 'Extras', icon: 'target', grad: 'g5', items: [
            { id: uid('s'), name: 'Atividade física', value: 2, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Ajudar nas compras', value: 3, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Cuidar do pet', value: 2, kind: 'earn', daily: true },
          ],
        },
      ],
      entries: [],
      payouts: [],
      diary: [],
      events: [],
      purchases: [],
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
    save();
  }

  /* ---------- categorias e subcategorias ---------- */
  const categories = () => state.categories;
  const categoryById = (id) => state.categories.find((c) => c.id === id) || null;

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
      save();
      return { ok: true, category: c };
    }
    const c = {
      id: uid('c'), name: data.name.trim(), icon: data.icon || 'star',
      grad: data.grad || 'g1', items: [],
      photo: String(data.photos || '').split(',').filter(Boolean)[0] || '',
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

  function saveItem(catId, data) {
    const c = categoryById(catId);
    if (!c) return { ok: false, error: 'Categoria não encontrada.' };
    if (!data.name || !data.name.trim()) return { ok: false, error: 'Informe o nome da ação.' };
    const value = Math.abs(Number(String(data.value).replace(',', '.'))) || 0;
    if (data.id) {
      const it = c.items.find((i) => i.id === data.id);
      if (!it) return { ok: false, error: 'Ação não encontrada.' };
      Object.assign(it, {
        name: data.name.trim(), value,
        kind: data.kind === 'penalty' ? 'penalty' : 'earn',
        daily: !!data.daily,
      });
      save();
      return { ok: true, item: it };
    }
    const it = {
      id: uid('s'), name: data.name.trim(), value,
      kind: data.kind === 'penalty' ? 'penalty' : 'earn',
      daily: !!data.daily,
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
    state.entries.push({
      id: uid('e'), childId, date, catId, itemId,
      name: item.name, value: item.value, kind: item.kind,
      icon: cat.icon, grad: cat.grad, catName: cat.name,
      note: '', photos: [], status: 'pending',
      reviewNote: '', reviewedBy: null, reviewedAt: null,
      createdAt: new Date().toISOString(),
    });
    save();
    return { ok: true, added: true };
  }

  function setEntryNote(entryId, note, photos) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
    e.note = String(note || '').slice(0, 240);
    if (photos) e.photos = photos.filter(Boolean).slice(0, 8);
    save();
  }

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
  const PET_DEFAULT = { name: 'Pip', shape: 'blob', color: 'lime', accessory: '', xp: 0 };
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
    save();
    return { ok: true, pet };
  }

  /** pontos de amizade: cada ação do filho alimenta o bichinho */
  function petAddXp(childId, amount) {
    const pet = petOf(childId);
    if (!pet || !amount) return null;
    const antes = Math.floor(pet.xp / XP_NIVEL);
    pet.xp = Math.max(0, pet.xp + amount);
    save();
    return { xp: pet.xp, levelUp: Math.floor(pet.xp / XP_NIVEL) > antes };
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
    return { ok: true, count: pet.care.count, levelUp: !!res.levelUp };
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
    return { xp, recorde, levelUp: !!(res && res.levelUp) };
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
    const filled = entries.filter((e) => required.includes(e.itemId)).length;
    const pending = entries.filter((e) => e.status === 'pending').length;
    return {
      required: required.length,
      filled,
      complete: required.length > 0 && filled >= required.length,
      total: entries.length,
      pending,
      value: entries.filter((e) => e.status !== 'rejected').reduce((s, e) => s + signed(e), 0),
    };
  }

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
    // gastos
    savePurchase, removePurchase, purchaseById, purchasesOf, cash, purchaseKind, PURCHASE_KINDS,
    // agenda
    saveEvent, removeEvent, toggleEventDone, eventById, eventsOf, eventsOfMonth,
    eventsOfDay, upcomingEvents, daysUntil, eventKind, EVENT_KINDS,
    // dinheiro
    totals, balance, savePayout, removePayout, payoutById, payoutsOf,
    // tema
    setTheme, theme,
    // helpers
    uid, today, toISO, fromISO, addDays, monthOf, labelDate, labelMonth, money,
    WEEKDAYS, MONTHS,
  };
})();

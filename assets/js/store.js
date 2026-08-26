/* =========================================================
   store.js — estado, persistência (localStorage) e regras
   ========================================================= */
const Store = (() => {
  const KEY = 'mesada.state.v1';
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
      settings: { theme: 'light' },
      users: [
        {
          id: parentId, role: 'parent', name: 'Mãe / Pai',
          username: 'pai', pass: hash('1234'), emoji: '👩‍👧',
        },
        {
          id: childId, role: 'child', name: 'Mariana',
          username: 'mariana', pass: hash('1234'), emoji: '🦄',
          goalName: 'Patins novos', goalAmount: 150,
        },
      ],
      categories: [
        {
          id: uid('c'), name: 'Estudos', emoji: '📚', grad: 'g1', items: [
            { id: uid('s'), name: 'Fazer a lição de casa', value: 3, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Estudar 30 minutos', value: 2, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Ler um capítulo', value: 2, kind: 'earn', daily: false },
          ],
        },
        {
          id: uid('c'), name: 'Casa', emoji: '🏠', grad: 'g2', items: [
            { id: uid('s'), name: 'Arrumar a cama', value: 1, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Organizar o quarto', value: 2, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Ajudar na louça', value: 3, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Tirar o lixo', value: 1, kind: 'earn', daily: false },
          ],
        },
        {
          id: uid('c'), name: 'Saúde', emoji: '🪥', grad: 'g3', items: [
            { id: uid('s'), name: 'Escovar os dentes 3x', value: 1, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Tomar banho', value: 1, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Beber bastante água', value: 1, kind: 'earn', daily: true },
          ],
        },
        {
          id: uid('c'), name: 'Atitude', emoji: '⭐', grad: 'g4', items: [
            { id: uid('s'), name: 'Ajudar sem pedirem', value: 3, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Cumprir os combinados', value: 2, kind: 'earn', daily: true },
            { id: uid('s'), name: 'Faltar com respeito', value: 3, kind: 'penalty', daily: false },
            { id: uid('s'), name: 'Passar do tempo de tela', value: 2, kind: 'penalty', daily: false },
          ],
        },
        {
          id: uid('c'), name: 'Extras', emoji: '🎯', grad: 'g5', items: [
            { id: uid('s'), name: 'Atividade física', value: 2, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Ajudar nas compras', value: 3, kind: 'earn', daily: false },
            { id: uid('s'), name: 'Cuidar do pet', value: 2, kind: 'earn', daily: true },
          ],
        },
      ],
      entries: [],
      payouts: [],
    };
  }

  /* ---------- carga / gravação ---------- */
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) return parsed;
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
      Object.assign(u, {
        name: data.name.trim(),
        username,
        emoji: data.emoji || u.emoji,
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
      pass: hash(data.password), emoji: data.emoji || '🙂',
      goalName: data.goalName || '', goalAmount: Number(data.goalAmount) || 0,
    };
    state.users.push(u);
    save();
    return { ok: true, user: u };
  }

  function removeChild(id) {
    state.users = state.users.filter((u) => u.id !== id);
    state.entries = state.entries.filter((e) => e.childId !== id);
    state.payouts = state.payouts.filter((p) => p.childId !== id);
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
      c.name = data.name.trim();
      c.emoji = data.emoji || c.emoji;
      c.grad = data.grad || c.grad;
      save();
      return { ok: true, category: c };
    }
    const c = {
      id: uid('c'), name: data.name.trim(), emoji: data.emoji || '✨',
      grad: data.grad || 'g1', items: [],
    };
    state.categories.push(c);
    save();
    return { ok: true, category: c };
  }

  function removeCategory(id) {
    state.categories = state.categories.filter((c) => c.id !== id);
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
   *  pendente — depois da validação do responsável o registro fica travado. */
  function toggleEntry(childId, date, catId, itemId) {
    const cat = categoryById(catId);
    const item = cat && cat.items.find((i) => i.id === itemId);
    if (!item) return { ok: false, error: 'Ação não encontrada.' };

    const existing = entryFor(childId, date, itemId);
    if (existing) {
      if (existing.status !== 'pending')
        return { ok: false, error: 'Já validado pelo responsável — não dá para alterar.' };
      state.entries = state.entries.filter((e) => e.id !== existing.id);
      save();
      return { ok: true, removed: true };
    }

    state.entries.push({
      id: uid('e'), childId, date, catId, itemId,
      name: item.name, value: item.value, kind: item.kind,
      emoji: cat.emoji, grad: cat.grad, catName: cat.name,
      note: '', status: 'pending',
      reviewNote: '', reviewedBy: null, reviewedAt: null,
      createdAt: new Date().toISOString(),
    });
    save();
    return { ok: true, added: true };
  }

  function setEntryNote(entryId, note) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return;
    e.note = String(note || '').slice(0, 240);
    save();
  }

  function review(entryId, status, reviewNote, parentId) {
    const e = state.entries.find((x) => x.id === entryId);
    if (!e) return { ok: false, error: 'Registro não encontrado.' };
    e.status = status === 'approved' ? 'approved' : 'rejected';
    e.reviewNote = String(reviewNote || '').slice(0, 240);
    e.reviewedBy = parentId || null;
    e.reviewedAt = new Date().toISOString();
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

  function addPayout(childId, amount, note, date) {
    const val = Math.abs(Number(String(amount).replace(',', '.'))) || 0;
    if (!val) return { ok: false, error: 'Informe um valor maior que zero.' };
    state.payouts.push({
      id: uid('p'), childId, amount: val,
      note: String(note || '').slice(0, 120),
      date: date || today(), createdAt: new Date().toISOString(),
    });
    save();
    return { ok: true };
  }

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
    children, userById, saveChild, removeChild,
    // categorias
    categories, categoryById, saveCategory, removeCategory, saveItem, removeItem,
    // lançamentos
    entriesOf, entryFor, toggleEntry, setEntryNote, review, reviewMany,
    pendingEntries, historyOf, dayStatus, signed,
    // dinheiro
    totals, balance, addPayout, payoutsOf,
    // tema
    setTheme, theme,
    // helpers
    uid, today, toISO, fromISO, addDays, monthOf, labelDate, labelMonth, money,
    WEEKDAYS, MONTHS,
  };
})();

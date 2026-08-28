/* =========================================================
   photos.js: captura, compressão e armazenamento das fotos
   As imagens ficam no IndexedDB do aparelho (o localStorage
   guarda só os identificadores), com fallback em memória.
   ========================================================= */
const Photos = (() => {
  const DB_NAME = 'mesada-photos';
  const STORE = 'photos';
  const MAX_SIDE = 1100;      // maior lado da imagem salva
  const QUALITY = 0.72;       // compressão JPEG
  const MAX_PER_RECORD = 4;

  const memory = new Map();   // usado quando o IndexedDB não está disponível
  let dbPromise = null;

  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('sem indexedDB'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('indexedDB indisponível'));
    }).catch((err) => {
      console.warn('Fotos: usando armazenamento temporário.', err);
      return null;
    });
    return dbPromise;
  }

  function tx(mode, run) {
    return db().then((conn) => {
      if (!conn) return null;
      return new Promise((resolve, reject) => {
        const t = conn.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        t.oncomplete = () => resolve(req && req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      });
    });
  }

  const newId = () => 'ph_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /** guarda a imagem já comprimida e devolve o id */
  async function save(dataUrl) {
    const id = newId();
    memory.set(id, dataUrl);
    try {
      await tx('readwrite', (store) => store.put(dataUrl, id));
    } catch (err) {
      console.warn('Fotos: não foi possível gravar no aparelho.', err);
    }
    return id;
  }

  async function get(id) {
    if (memory.has(id)) return memory.get(id);
    try {
      const value = await tx('readonly', (store) => store.get(id));
      if (value) memory.set(id, value);
      return value || null;
    } catch (err) {
      return null;
    }
  }

  async function remove(id) {
    memory.delete(id);
    try { await tx('readwrite', (store) => store.delete(id)); } catch (err) { /* já foi */ }
  }

  const removeMany = (ids) => Promise.all((ids || []).map(remove));

  /** lê o arquivo escolhido, redimensiona e devolve um data URL leve */
  function fromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) {
        return reject(new Error('Escolha uma foto (JPG, PNG ou HEIC convertido).'));
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        } catch (err) {
          reject(new Error('Não consegui processar essa imagem.'));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Não consegui abrir essa imagem.'));
      };
      img.src = url;
    });
  }

  /** preenche os <img data-photo="id"> que já estão na tela */
  function hydrate(scope) {
    const root = scope || document;
    root.querySelectorAll('img[data-photo]:not([data-loaded])').forEach((img) => {
      img.setAttribute('data-loaded', '1');
      get(img.getAttribute('data-photo')).then((url) => {
        if (url) img.src = url;
        else img.parentElement && img.parentElement.classList.add('thumb-missing');
      });
    });
  }

  /** abre a foto em tela cheia */
  async function view(ids, index = 0) {
    const list = (ids || []).filter(Boolean);
    if (!list.length) return;
    let i = Math.max(0, Math.min(index, list.length - 1));
    const url = await get(list[i]);
    UI.openSheet({
      title: 'Foto',
      subtitle: list.length > 1 ? `${i + 1} de ${list.length}` : '',
      body: `<div class="photo-full"><img alt="Foto do registro" src="${url || ''}" /></div>`,
      actions: list.length > 1
        ? `<button class="btn btn-ghost" data-prev>Anterior</button>
           <button class="btn btn-ghost" data-next>Próxima</button>`
        : '',
      onMount(sheet) {
        const img = sheet.querySelector('.photo-full img');
        const label = sheet.querySelector('.sheet-head p');
        const step = (delta) => {
          i = (i + delta + list.length) % list.length;
          get(list[i]).then((next) => { if (next) img.src = next; });
          if (label) label.textContent = `${i + 1} de ${list.length}`;
        };
        const prev = sheet.querySelector('[data-prev]');
        const next = sheet.querySelector('[data-next]');
        if (prev) prev.addEventListener('click', () => step(-1));
        if (next) next.addEventListener('click', () => step(1));
      },
    });
  }

  /* ---------- mudar de aparelho ou de endereço ----------
     As fotos ficam no armazenamento do navegador, que é separado por
     endereço. Para levar tudo junto elas precisam sair daqui e entrar lá
     do outro lado, com o mesmo id: é pelo id que cada lançamento acha a
     foto dele. */

  /** todas as fotos guardadas, no formato { id: imagem } */
  async function exportarTodas() {
    const saida = {};
    memory.forEach((valor, id) => { saida[id] = valor; });
    try {
      const conn = await db();
      if (conn) {
        await new Promise((resolve, reject) => {
          const t = conn.transaction(STORE, 'readonly');
          const store = t.objectStore(STORE);
          const req = store.openCursor();
          req.onsuccess = () => {
            const cursor = req.result;
            if (!cursor) return resolve();
            saida[cursor.key] = cursor.value;
            cursor.continue();
          };
          req.onerror = () => reject(req.error);
        });
      }
    } catch (err) {
      console.warn('Fotos: não consegui ler todas para exportar.', err);
    }
    return saida;
  }

  /** guarda de volta as fotos que vieram de outro aparelho, com os ids de lá */
  async function importarTodas(mapa) {
    const ids = Object.keys(mapa || {});
    ids.forEach((id) => memory.set(id, mapa[id]));
    try {
      await tx('readwrite', (store) => { ids.forEach((id) => store.put(mapa[id], id)); });
    } catch (err) {
      console.warn('Fotos: não consegui gravar as que vieram.', err);
    }
    return ids.length;
  }

  return {
    save, get, remove, removeMany, fromFile, hydrate, view, MAX_PER_RECORD,
    exportarTodas, importarTodas,
  };
})();

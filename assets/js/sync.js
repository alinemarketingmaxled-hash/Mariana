/* =========================================================
   sync.js: a ponte entre o celular da filha e o da mãe.

   O app guarda tudo no próprio aparelho, sem servidor. Isso quer dizer
   que o que ela marca no celular dela não existe no celular da mãe: são
   duas cópias separadas do mesmo app. Sem uma ponte, a mãe nunca vê o
   que a filha mandou, e como a tarefa só entra na conta depois de
   validada, nada nunca contabiliza.

   A ponte é um link. O envio dela vira um endereço do próprio app com
   os dados dentro, que vai junto no WhatsApp. A mãe toca no link, o app
   abre e pergunta se ela quer receber. Depois de validar, o caminho de
   volta é outro link, que devolve as respostas para a filha.

   O que não viaja: as fotos. Trinta fotos de páginas não cabem num
   link, e não existe onde guardá-las no meio do caminho. O resumo, o
   livro, as páginas e o "grifou" viajam; as fotos ficam no celular
   dela, para mostrar de perto.
   ========================================================= */
const Sync = (() => {
  const VERSAO = 1;
  /* acima disso o WhatsApp e o navegador começam a cortar o link */
  const LIMITE_LINK = 7000;

  /* ---------- empacotar ---------- */
  /** texto -> base64 que pode andar dentro de um endereço */
  function paraBase64(texto) {
    const bytes = new TextEncoder().encode(texto);
    let bruto = '';
    bytes.forEach((b) => { bruto += String.fromCharCode(b); });
    return btoa(bruto).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /** o caminho de volta */
  function deBase64(txt) {
    const limpo = String(txt || '').replace(/-/g, '+').replace(/_/g, '/');
    const bruto = atob(limpo + '==='.slice((limpo.length + 3) % 4));
    const bytes = new Uint8Array(bruto.length);
    for (let i = 0; i < bruto.length; i++) bytes[i] = bruto.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  const codificar = (obj) => paraBase64(JSON.stringify(obj));

  function decodificar(txt) {
    try {
      const o = JSON.parse(deBase64(txt));
      return o && o.v === VERSAO ? o : null;
    } catch (e) {
      return null;
    }
  }

  /* ---------- o pacote que a filha manda ---------- */
  /**
   * Tudo que a mãe precisa para validar o dia: quem mandou, quando, e
   * cada tarefa com o que ela escreveu. As chaves são curtas de
   * propósito: cada letra a menos é link mais curto.
   */
  /** as lições ainda abertas, para a lista existir dos dois lados */
  const licoesDoPacote = (child) => Store.licoesOf(child.id, false)
    .map((l) => ({ i: l.id, m: l.materia, o: l.oque, e: l.entrega }));

  /**
   * Vai tudo que está esperando validação, de todos os dias. Mandar só o
   * dia aberto na tela deixava para trás o que ela fez ontem e
   * anteontem, e aquilo nunca chegava na mãe.
   */
  function pacoteEnvio(child, date) {
    const lista = date
      ? Store.entriesOf(child.id, date).filter((e) => e.status === 'pending')
      : Store.prontasParaEnviar(child.id);
    const abertas = licoesDoPacote(child);
    if (!lista.length && !abertas.length) return null;
    return {
      v: VERSAO,
      t: 'envio',
      d: date || Store.today(),
      c: { u: child.username, n: child.name, a: Store.allowanceOf(child.id) || 0 },
      h: abertas,
      e: lista.map((e) => {
        const linha = {
          i: e.id, s: e.itemId, n: e.name, x: e.value, k: e.kind,
          c: e.catName || '', g: e.grad || '', o: e.icon || '',
          f: (e.photos || []).length,
        };
        // cada lançamento leva o seu próprio dia: o pacote não é mais de um dia só
        if (e.date !== (date || Store.today())) linha.t = e.date;
        if (e.extra) linha.j = 1;
        if (e.note) linha.b = e.note;
        if (e.daily) linha.y = 1;
        if (e.leitura) linha.z = 1;
        if (e.nota) {
          linha.q = {
            m: e.nota.materia, a: e.nota.avaliacao || '', n: e.nota.nota,
            x: e.nota.maxima, f: e.nota.faixa || '',
          };
        }
        if (e.licao) {
          linha.w = {
            m: e.licao.materia, o: e.licao.oque, e: e.licao.entrega,
            a: e.licao.atrasada ? 1 : 0,
          };
        }
        if (e.reading) {
          linha.r = {
            l: e.reading.livro || '', a: e.reading.paginaDe || 0, b: e.reading.paginaAte || 0,
            s: e.reading.resumo || '', g: e.reading.grifou ? 1 : 0,
          };
          if (e.reading.partes) linha.r.p = e.reading.partes;
        }
        return linha;
      }),
    };
  }

  /* ---------- o pacote que a mãe devolve ---------- */
  /** só as decisões: o que foi aprovado, o que não, e o recado de cada uma */
  function pacoteResposta(child, date) {
    const lista = date
      ? Store.entriesOf(child.id, date)
        .filter((e) => e.status === 'approved' || e.status === 'rejected')
      : Store.aguardandoResposta(child.id);
    if (!lista.length && !Store.licoesOf(child.id, false).length) return null;
    return {
      v: VERSAO,
      t: 'resposta',
      d: date || Store.today(),
      c: { u: child.username, n: child.name },
      // a lição que a mãe anotou também precisa chegar nela
      h: licoesDoPacote(child),
      e: lista.map((e) => {
        const linha = { i: e.id, q: e.status === 'approved' ? 1 : 0 };
        if (e.reviewNote) linha.m = e.reviewNote;
        return linha;
      }),
    };
  }

  /* ---------- o endereço ---------- */
  /** o app no endereço em que ele está agora, sem o que veio depois */
  const base = () => location.origin + location.pathname;

  const link = (pacote) => (pacote ? `${base()}#mesada=${codificar(pacote)}` : '');

  /** o link ficou grande demais para passar inteiro? */
  const linkGrande = (l) => l.length > LIMITE_LINK;

  /* ---------- receber ---------- */
  /**
   * Põe no app da mãe o que a filha mandou. A filha pode nem existir
   * neste aparelho (cada celular começa com os dados dele), então ela é
   * procurada pelo nome de usuário e criada quando não houver.
   */
  function aplicarEnvio(pacote) {
    if (!pacote || pacote.t !== 'envio') return { ok: false, error: 'Este link não é um envio.' };
    const kid = Store.acharOuCriarFilho(pacote.c);
    if (!kid) return { ok: false, error: 'Não consegui encontrar de quem é este envio.' };

    let novos = 0;
    let repetidos = 0;
    (pacote.e || []).forEach((l) => {
      const entrada = {
        id: l.i, childId: kid.id, date: l.t || pacote.d, itemId: l.s,
        name: l.n, value: l.x, kind: l.k,
        catName: l.c, grad: l.g, icon: l.o,
        daily: !!l.y, leitura: !!l.z,
        note: l.b || '', photos: [], fotosLa: l.f || 0, extra: !!l.j,
        status: 'pending', reviewNote: '', reviewedBy: null, reviewedAt: null,
        createdAt: new Date().toISOString(),
      };
      if (l.q) {
        entrada.nota = {
          materia: l.q.m, avaliacao: l.q.a || '', nota: l.q.n,
          maxima: l.q.x, faixa: l.q.f || '',
        };
      }
      if (l.w) {
        entrada.licao = {
          materia: l.w.m, oque: l.w.o, entrega: l.w.e, atrasada: !!l.w.a,
        };
      }
      if (l.r) {
        entrada.reading = {
          livro: l.r.l || '', paginaDe: l.r.a || 0, paginaAte: l.r.b || 0,
          resumo: l.r.s || '', grifou: !!l.r.g, partes: l.r.p || '',
        };
      }
      const res = Store.receberLancamento(entrada);
      if (res.novo) novos++; else repetidos++;
    });

    const licoes = guardarLicoes(kid.id, pacote.h);

    return {
      ok: true, child: kid, novos, repetidos, licoes,
      total: (pacote.e || []).length, date: pacote.d,
    };
  }

  /** guarda as lições que vieram, sempre ligadas a quem é daqui */
  function guardarLicoes(childId, vindas) {
    let novas = 0;
    (vindas || []).forEach((l) => {
      const res = Store.receberLicao({
        id: l.i, childId, materia: l.m, oque: l.o, entrega: l.e,
        criadaEm: l.e,
      });
      if (res.nova) novas++;
    });
    return novas;
  }

  /** Põe no app da filha as decisões que a mãe tomou. */
  function aplicarResposta(pacote) {
    if (!pacote || pacote.t !== 'resposta') return { ok: false, error: 'Este link não é uma resposta.' };
    const kid = Store.acharOuCriarFilho(pacote.c);
    let aprovadas = 0;
    let recusadas = 0;
    let perdidas = 0;
    (pacote.e || []).forEach((l) => {
      const res = Store.receberDecisao(l.i, l.q ? 'approved' : 'rejected', l.m || '');
      if (!res.ok) perdidas++;
      else if (l.q) aprovadas++;
      else recusadas++;
    });
    const licoes = kid ? guardarLicoes(kid.id, pacote.h) : 0;
    return { ok: true, aprovadas, recusadas, perdidas, licoes, date: pacote.d };
  }

  /* ---------- o link que chegou ---------- */
  /** lê o pacote que veio no endereço e limpa o endereço em seguida */
  function pacoteDoEndereco() {
    const m = String(location.hash || '').match(/#mesada=([A-Za-z0-9\-_]+)/);
    if (!m) return null;
    const pacote = decodificar(m[1]);
    // tira o pacote da barra de endereço: senão recarregar a página
    // ofereceria a mesma coisa de novo, e o link fica exposto no
    // histórico do navegador
    try {
      history.replaceState(null, '', base());
    } catch (e) {
      location.hash = '';
    }
    return pacote;
  }

  return {
    VERSAO, LIMITE_LINK,
    codificar, decodificar, link, linkGrande,
    pacoteEnvio, pacoteResposta, aplicarEnvio, aplicarResposta, pacoteDoEndereco,
  };
})();

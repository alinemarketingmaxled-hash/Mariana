/* =========================================================
   notify.js: o lembrete diário no celular da filha.

   O app não tem servidor, então não existe "push" de verdade: nada
   sai daqui para o celular dela quando o app está fechado. O que dá
   para fazer, e é o que este arquivo faz, são três coisas:

   1. Aviso do próprio celular, mostrado pelo service worker. Funciona
      sozinho no Android com o app instalado na tela de início, porque
      o navegador acorda o app de tempos em tempos (periodicsync).
   2. Aviso de recuperação: se a hora passou e o lembrete do dia não
      apareceu, ele aparece assim que ela abre o app.
   3. Lembrete no calendário do celular: um arquivo que ela salva uma
      vez e o próprio celular avisa todo dia, no horário escolhido,
      mesmo sem internet e sem o app aberto. Esse é o único jeito que
      funciona igual em qualquer aparelho.
   ========================================================= */
const Notify = (() => {
  const suportada = () =>
    typeof window !== 'undefined' && 'Notification' in window;

  const permissao = () => (suportada() ? Notification.permission : 'unsupported');

  /** pede a permissão ao celular; devolve true se ela deixou */
  async function pedir() {
    if (!suportada()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try {
      return (await Notification.requestPermission()) === 'granted';
    } catch (e) {
      return false;
    }
  }

  /** o texto do lembrete, montado com o que está faltando de verdade */
  function recado(child) {
    const pet = Store.petOf(child.id);
    const hoje = Store.today();
    const st = Store.dayStatus(child.id, hoje);
    const faltam = Math.max(0, st.required - st.filled);
    const m = Store.mesadaStatus(child.id);
    const leu = Store.entriesOf(child.id, hoje)
      .some((e) => Store.entryIsReading(e) || /leitur|livro/i.test(e.catName || ''));

    if (faltam === 0 && st.required) {
      return {
        titulo: `${pet.name} está orgulhoso de você!`,
        texto: leu
          ? 'Dia completo e ainda com leitura. Que orgulho.'
          : 'Todas as tarefas do dia estão feitas. Só falta a leitura de hoje.',
      };
    }
    if (!leu) {
      return {
        titulo: `${pet.name} está esperando a leitura de hoje`,
        texto: faltam
          ? `Faltam ${faltam} tarefa(s) e a leitura. A leitura é a que mais rende.`
          : 'A leitura é a parte que mais rende na sua mesada.',
      };
    }
    return {
      titulo: `${pet.name} quer ver você hoje`,
      texto: faltam
        ? `Faltam ${faltam} tarefa(s) do dia. Faltam ${Store.money(m.falta)} para fechar a mesada.`
        : 'Passa aqui para dar um carinho e fazer os desafios do dia.',
    };
  }

  /** mostra o aviso agora, pelo service worker quando der */
  async function mostrar(child) {
    if (!suportada() || Notification.permission !== 'granted') return false;
    const r = recado(child);
    const opcoes = {
      body: r.texto,
      icon: 'assets/icon.svg',
      badge: 'assets/icon.svg',
      tag: 'mesada-lembrete',
      renotify: true,
      lang: 'pt-BR',
      data: { url: './' },
    };
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(r.titulo, opcoes);
        return true;
      }
      // eslint-disable-next-line no-new
      new Notification(r.titulo, opcoes);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- ligar e desligar ---------- */
  async function ligar(child, hora) {
    const ok = await pedir();
    if (!ok) {
      return {
        ok: false,
        error: permissao() === 'denied'
          ? 'O celular bloqueou os avisos deste site. Libere nas configurações do navegador.'
          : 'Você precisa permitir os avisos para o lembrete funcionar.',
      };
    }
    Store.setReminder(child.id, { on: true, hora });
    pedirSyncPeriodico();
    agendar(child);
    return { ok: true };
  }

  function desligar(child) {
    Store.setReminder(child.id, { on: false });
    clearTimeout(relogio);
    relogio = null;
    return { ok: true };
  }

  /** pede ao navegador para acordar o app de vez em quando (só Android) */
  async function pedirSyncPeriodico() {
    try {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      if (!reg.periodicSync) return false;
      const estado = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (estado.state !== 'granted') return false;
      await reg.periodicSync.register('lembrete-mesada', { minInterval: 12 * 60 * 60 * 1000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  /** o navegador vai conseguir avisar sozinho com o app fechado? */
  async function sozinho() {
    try {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      if (!reg.periodicSync) return false;
      const tags = await reg.periodicSync.getTags();
      return tags.indexOf('lembrete-mesada') !== -1;
    } catch (e) {
      return false;
    }
  }

  /* ---------- o relógio enquanto o app está aberto ---------- */
  let relogio = null;

  const minutosDe = (hhmm) => {
    const [h, m] = String(hhmm || '19:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  /**
   * Se a hora do lembrete já passou hoje e o aviso ainda não saiu,
   * mostra agora. É isso que salva o dia quando o celular não acorda
   * o app sozinho.
   */
  async function checar(child) {
    if (!child) return false;
    const r = Store.reminderOf(child.id);
    if (!r.on) return false;
    const agora = new Date();
    const minutos = agora.getHours() * 60 + agora.getMinutes();
    if (minutos < minutosDe(r.hora)) return false;
    if (r.ultimo === Store.today()) return false;
    const foi = await mostrar(child);
    if (foi) Store.setReminder(child.id, { ultimo: Store.today() });
    return foi;
  }

  /** deixa o aviso marcado para a hora certa enquanto o app estiver aberto */
  function agendar(child) {
    clearTimeout(relogio);
    relogio = null;
    if (!child) return;
    const r = Store.reminderOf(child.id);
    if (!r.on) return;
    checar(child);
    const agora = new Date();
    const alvo = new Date(agora);
    const [h, m] = String(r.hora || '19:00').split(':').map(Number);
    alvo.setHours(h || 0, m || 0, 0, 0);
    if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
    // o setTimeout do navegador não passa de 24 dias, e um dia cabe bem
    relogio = setTimeout(() => {
      checar(child);
      agendar(child);
    }, Math.min(alvo - agora + 1000, 24 * 60 * 60 * 1000));
  }

  function parar() {
    clearTimeout(relogio);
    relogio = null;
  }

  /* ---------- lembrete no calendário do celular ---------- */
  /** escapa o que o formato do calendário não aceita solto */
  const ics = (t) => String(t || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

  /** monta o arquivo de calendário com um lembrete que se repete todo dia */
  function calendario(child) {
    const r = Store.reminderOf(child.id);
    const [h, m] = String(r.hora || '19:00').split(':').map(Number);
    const dois = (n) => String(n).padStart(2, '0');
    const d = new Date();
    const dia = `${d.getFullYear()}${dois(d.getMonth() + 1)}${dois(d.getDate())}`;
    const inicio = `${dia}T${dois(h || 0)}${dois(m || 0)}00`;
    const fim = `${dia}T${dois((h || 0) + ((m || 0) + 15 >= 60 ? 1 : 0))}${dois(((m || 0) + 15) % 60)}00`;
    const carimbo = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const pet = Store.petOf(child.id);

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Minha Mesada//PT-BR//',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:mesada-${child.id}@minhamesada`,
      `DTSTAMP:${carimbo}`,
      `DTSTART:${inicio}`,
      `DTEND:${fim}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${ics(`Minha Mesada: ${pet.name} está esperando`)}`,
      `DESCRIPTION:${ics('Marque as tarefas do dia, faça a leitura e cuide do bichinho.')}`,
      'BEGIN:VALARM',
      'TRIGGER:PT0M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${ics(`${pet.name} está esperando você`)}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
  }

  /** entrega o arquivo do calendário para ela salvar no celular */
  function baixarCalendario(child) {
    const blob = new Blob([calendario(child)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lembrete-da-mesada.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return {
    suportada, permissao, pedir, ligar, desligar, checar, agendar, parar,
    mostrar, recado, sozinho, pedirSyncPeriodico, calendario, baixarCalendario,
  };
})();

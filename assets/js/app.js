/* =========================================================
   app.js: inicialização e roteamento entre as telas
   ========================================================= */
const App = (() => {
  const root = () => document.getElementById('app');

  /* O carimbo da versão. Aparece embaixo da tela de entrar, e serve para
     saber, olhando, se o aparelho já pegou o app novo ou ainda está com o
     velho guardado. Sobe de número a cada mudança publicada. */
  const VERSAO = '29';
  const DATA_VERSAO = '27/08';

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', Store.theme());
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', Store.theme() === 'dark' ? '#171334' : '#eceafb');
  }

  function toggleTheme() {
    Store.setTheme(Store.theme() === 'dark' ? 'light' : 'dark');
    applyTheme();
  }

  function render() {
    const el = root();
    const user = Store.currentUser();
    if (!user) {
      Pet.unmountBuddy();
      Uso.parar();
      Notify.parar();
      AuthScreen.render(el);
      return;
    }
    if (user.role === 'parent') {
      ParentScreen.render(el, user);
      Pet.unmountBuddy();
      Uso.parar();
      Notify.parar();
    } else {
      ChildScreen.render(el, user);
      Pet.mountBuddy(user);
      Uso.iniciar(user);
      // o lembrete do dia: mostra o que ficou para trás e marca a próxima hora
      Notify.agendar(user);
    }
    Photos.hydrate(el);
    UI.bindPhotoViewers(el);
  }

  function logout() {
    Uso.parar();
    Notify.parar();
    Pet.unmountBuddy();
    Store.logout();
    AuthScreen.reset();
    ChildScreen.reset();
    ParentScreen.reset();
    UI.closeSheet();
    UI.toast('Até logo!');
    render();
  }

  function openChangePassword(user) {
    UI.openSheet({
      title: 'Trocar senha',
      subtitle: user.name,
      body: `
        <form id="pass-form">
          ${UI.field('Senha atual', UI.input('oldPass', { type: 'password', placeholder: '••••' }))}
          ${UI.field('Nova senha', UI.input('newPass', { type: 'password', placeholder: 'mínimo 4 caracteres' }))}
        </form>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-ok>Salvar</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const data = UI.formData(sheet.querySelector('#pass-form'));
          const res = Store.changePassword(user.id, data.oldPass, data.newPass);
          if (!res.ok) return UI.toast(res.error, 'bad');
          UI.closeSheet();
          UI.toast('Senha atualizada', 'ok');
        });
      },
    });
  }

  /** troca a foto de perfil de quem está logado (ou de um filho, pelo responsável) */
  function openProfilePhoto(user) {
    let picker = null;
    UI.openSheet({
      title: 'Foto do perfil',
      subtitle: user.name,
      body: `
        <form id="profile-photo-form">
          ${UI.photoField('Escolha ou tire uma foto', user.photo ? [user.photo] : [])}
        </form>
        <div class="note">A foto aparece no topo do app e nas listas. Fica salva só neste aparelho.</div>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Cancelar</button>
        <button class="btn btn-primary" data-ok>Salvar</button>`,
      onMount(sheet) {
        picker = UI.bindPhotos(sheet);
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          Store.setUserPhoto(user.id, picker.ids()[0] || '');
          picker.commit();
          UI.closeSheet();
          UI.toast('Foto atualizada', 'ok');
          render();
        });
      },
      onClose() { if (picker) picker.discard(); },
    });
  }

  /**
   * Alguém tocou num link que veio do outro celular. Mostra o que
   * chegou e pergunta antes de mexer em qualquer coisa: ninguém gosta
   * de abrir um link e ver o app mudar sozinho.
   */
  function receberDoLink(pacote) {
    if (pacote.t === 'envio') return receberEnvio(pacote);
    if (pacote.t === 'resposta') return receberResposta(pacote);
    return UI.toast('Não entendi esse link.', 'bad');
  }

  function receberEnvio(pacote) {
    const nome = String((pacote.c && pacote.c.n) || 'Ela').split(' ')[0];
    const itens = pacote.e || [];
    const total = itens.reduce((t, l) => t + (l.k === 'penalty' ? -l.x : l.x), 0);
    const comFoto = itens.reduce((t, l) => t + (l.f || 0), 0);
    UI.openSheet({
      title: `${nome} mandou para você confirmar`,
      subtitle: Store.labelDate(pacote.d),
      body: `
        <div class="stat-row">
          <div class="stat"><div class="k">tarefas</div><div class="v">${itens.length}</div></div>
          <div class="stat"><div class="k">total</div><div class="v">${Store.money(total)}</div></div>
        </div>
        <div class="list mt12">
          ${itens.map((l) => `
            <div class="mini-row">
              <span class="grow">
                <span class="small bold block">${UI.esc(l.n)}</span>
                <span class="tiny muted block">${UI.esc(l.c || '')}${l.r ? ` • ${UI.esc(l.r.l || 'leitura')}` : ''}</span>
              </span>
              <span class="small bold">${Store.money(l.k === 'penalty' ? -l.x : l.x)}</span>
            </div>`).join('')}
        </div>
        ${comFoto ? `<div class="note">
          ${comFoto === 1 ? 'Tem 1 foto' : `Tem ${comFoto} fotos`} que ficaram no celular
          d${nome === 'Ela' ? 'ela' : 'a ' + UI.esc(nome)}: foto não cabe num link. O resumo e o
          que ela escreveu vieram inteiros; as fotos ela mostra de perto.
        </div>` : ''}`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Agora não</button>
        <button class="btn btn-primary" data-ok>Receber</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const res = Sync.aplicarEnvio(pacote);
          UI.closeSheet();
          if (!res.ok) return UI.toast(res.error, 'bad');
          Effects.burst('approved');
          UI.toast(res.novos
            ? `Recebido: ${res.novos} para validar.`
            : 'Isso já tinha chegado antes.', 'ok');
          render();
        });
      },
    });
  }

  function receberResposta(pacote) {
    const aprovadas = (pacote.e || []).filter((l) => l.q).length;
    const recusadas = (pacote.e || []).length - aprovadas;
    UI.openSheet({
      title: 'A resposta chegou!',
      subtitle: Store.labelDate(pacote.d),
      body: `
        <div class="stat-row">
          <div class="stat"><div class="k">validadas</div><div class="v">${aprovadas}</div></div>
          <div class="stat"><div class="k">não passaram</div><div class="v">${recusadas}</div></div>
        </div>
        <div class="note">Depois de receber, o que foi validado entra na conta da sua mesada.</div>`,
      actions: `
        <button class="btn btn-ghost" data-cancel>Agora não</button>
        <button class="btn btn-primary" data-ok>Receber</button>`,
      onMount(sheet) {
        sheet.querySelector('[data-cancel]').addEventListener('click', UI.closeSheet);
        sheet.querySelector('[data-ok]').addEventListener('click', () => {
          const res = Sync.aplicarResposta(pacote);
          UI.closeSheet();
          if (!res.ok) return UI.toast(res.error, 'bad');
          Effects.burst(res.aprovadas ? 'goal' : 'task');
          UI.toast(res.aprovadas
            ? `${res.aprovadas} tarefa(s) validada(s)! Já entrou na conta.`
            : 'Resposta recebida.', 'ok');
          render();
        });
      },
    });
  }

  function start() {
    applyTheme();
    render();
    // um link vindo do outro celular chega pelo endereço
    const pacote = Sync.pacoteDoEndereco();
    if (pacote) setTimeout(() => receberDoLink(pacote), 300);
    // com o app já aberto, tocar no link só troca o endereço e a página
    // não recarrega: sem isto o envio passaria batido
    window.addEventListener('hashchange', () => {
      const vindo = Sync.pacoteDoEndereco();
      if (vindo) receberDoLink(vindo);
    });
    // permite instalar na tela inicial e abrir offline
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      // Quando sai uma versão nova, quem guarda o app offline assume o
      // comando na hora, mas a tela continua com o código velho que já
      // estava na memória. Então o app se recarrega uma vez sozinho, senão
      // a mudança só apareceria depois de fechar todas as abas.
      const jaTinhaDono = !!navigator.serviceWorker.controller;
      let recarregando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!jaTinhaDono || recarregando) return;
        recarregando = true;
        window.location.reload();
      });
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline é opcional */ });
    }
    // mantém abas do mesmo navegador sincronizadas
    window.addEventListener('storage', (ev) => {
      if (ev.key && ev.key.startsWith('mesada.')) window.location.reload();
    });
  }

  return { start, render, logout, toggleTheme, openChangePassword, openProfilePhoto, applyTheme, receberDoLink, VERSAO, DATA_VERSAO };
})();

document.addEventListener('DOMContentLoaded', App.start);

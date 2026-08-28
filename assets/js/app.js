/* =========================================================
   app.js: inicialização e roteamento entre as telas
   ========================================================= */
const App = (() => {
  const root = () => document.getElementById('app');

  /* O carimbo da versão. Aparece embaixo da tela de entrar, e serve para
     saber, olhando, se o aparelho já pegou o app novo ou ainda está com o
     velho guardado. Sobe de número a cada mudança publicada. */
  const VERSAO = '23';
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

  function start() {
    applyTheme();
    render();
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

  return { start, render, logout, toggleTheme, openChangePassword, openProfilePhoto, applyTheme, VERSAO, DATA_VERSAO };
})();

document.addEventListener('DOMContentLoaded', App.start);

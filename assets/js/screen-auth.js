/* =========================================================
   screen-auth.js: tela de login (filho(a) / responsável)
   ========================================================= */
const AuthScreen = (() => {
  let role = 'child';
  let error = '';
  let showPass = false;

  function render(root) {
    const isChild = role === 'child';
    root.innerHTML = `
      <section class="auth">
        <div class="brand">
          <div class="brand-mark">${Icons.svg('wallet')}</div>
          <h1>Minha Mesada</h1>
          <p>As tarefas do dia em um lugar só: o filho preenche, o responsável valida.</p>
        </div>

        <form class="auth-card glass" id="login-form" autocomplete="on" novalidate>
          <div class="segmented" role="group" aria-label="Tipo de acesso">
            <button type="button" class="seg" data-role="child" aria-pressed="${isChild}">
              ${Icons.svg('user')} Filho(a)
            </button>
            <button type="button" class="seg" data-role="parent" aria-pressed="${!isChild}">
              ${Icons.svg('users')} Responsável
            </button>
          </div>

          ${UI.field('Usuário', `
            ${Icons.svg('user')}
            <input name="username" type="text" autocomplete="username"
                   placeholder="${isChild ? 'ex.: mariana' : 'ex.: pai'}" />`)}

          ${UI.field('Senha', `
            ${Icons.svg('lock')}
            <input name="password" type="${showPass ? 'text' : 'password'}"
                   autocomplete="current-password" placeholder="••••" />
            <button type="button" class="eye" data-eye aria-label="Mostrar senha">
              ${Icons.svg(showPass ? 'eyeOff' : 'eye')}</button>`)}

          ${error ? `<div class="err">${UI.esc(error)}</div>` : ''}

          <button type="submit" class="btn btn-primary btn-block">
            Entrar ${isChild ? 'como filho(a)' : 'como responsável'} ${Icons.svg('arrow')}
          </button>

          <p class="auth-hint">
            Acesso de teste. Responsável: <b>pai</b> / <b>1234</b><br />
            Filha: <b>mariana</b> / <b>1234</b>
          </p>
        </form>

        <div class="row" style="justify-content:center;gap:10px">
          <button class="btn btn-ghost btn-sm" data-theme-toggle>
            ${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}
            ${Store.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
        </div>
      </section>`;

    root.querySelectorAll('[data-role]').forEach((b) =>
      b.addEventListener('click', () => {
        role = b.getAttribute('data-role');
        error = '';
        render(root);
      }));

    const eye = root.querySelector('[data-eye]');
    if (eye) eye.addEventListener('click', () => { showPass = !showPass; render(root); });

    root.querySelector('[data-theme-toggle]').addEventListener('click', () => {
      App.toggleTheme();
      render(root);
    });

    root.querySelector('#login-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = UI.formData(ev.currentTarget);
      if (!data.username || !data.password) {
        error = 'Preencha usuário e senha.';
        return render(root);
      }
      const res = Store.login(role, data.username, data.password);
      if (!res.ok) {
        error = res.error;
        return render(root);
      }
      error = '';
      UI.toast(`Bem-vindo(a), ${res.user.name.split(' ')[0]}!`, 'ok');
      App.render();
    });
  }

  return { render, reset() { error = ''; showPass = false; } };
})();

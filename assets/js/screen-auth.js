/* =========================================================
   screen-auth.js: tela de login (filho(a) / responsável)
   ========================================================= */
const AuthScreen = (() => {
  let role = 'child';
  let error = '';
  let showPass = false;
  let swap = '';   // direção da animação quando troca de perfil

  /** carinha que muda de cor e de expressão conforme o perfil escolhido */
  const mascot = (isChild) => `
    <div class="mascot ${isChild ? 'child' : 'parent'}">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <g>
          <ellipse cx="33" cy="44" rx="15" ry="16" fill="#fff" />
          <ellipse cx="67" cy="44" rx="15" ry="16" fill="#fff" />
          <circle class="pupil" cx="33" cy="47" r="7" fill="#231d47" />
          <circle class="pupil" cx="67" cy="47" r="7" fill="#231d47" />
          <circle cx="30" cy="43" r="2.4" fill="#fff" />
          <circle cx="64" cy="43" r="2.4" fill="#fff" />
          <ellipse class="lid" cx="33" cy="44" rx="15.5" ry="16.5" fill="${isChild ? '#a98cff' : '#8fb2ff'}" />
          <ellipse class="lid" cx="67" cy="44" rx="15.5" ry="16.5" fill="${isChild ? '#a98cff' : '#8fb2ff'}" />
        </g>
        ${isChild
          ? '<path d="M36 70q14 12 28 0" stroke="#231d47" stroke-width="5" stroke-linecap="round" fill="none" />'
          : '<path d="M36 72q14 7 28 0" stroke="#231d47" stroke-width="5" stroke-linecap="round" fill="none" />'}
        ${isChild
          ? '<path d="M18 24q8 -10 16 -2" stroke="#231d47" stroke-width="4.5" stroke-linecap="round" fill="none" /><path d="M66 22q8 -8 16 2" stroke="#231d47" stroke-width="4.5" stroke-linecap="round" fill="none" />'
          : '<path d="M18 22h16" stroke="#231d47" stroke-width="4.5" stroke-linecap="round" /><path d="M66 22h16" stroke="#231d47" stroke-width="4.5" stroke-linecap="round" />'}
      </svg>
    </div>`;

  function render(root) {
    const isChild = role === 'child';
    root.innerHTML = `
      <section class="auth">
        <div class="brand">
          ${mascot(isChild)}
          <h1>Minha Mesada</h1>
          <p>${isChild
            ? 'Marque o que você fez, conte o que leu e acompanhe sua mesada crescer.'
            : 'Confira o que os filhos marcaram, valide e acompanhe tudo de perto.'}</p>
        </div>

        <form class="auth-card glass ${swap}" id="login-form" autocomplete="on" novalidate>
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

        </form>

        <div class="row" style="justify-content:center;gap:10px">
          <button class="btn btn-ghost btn-sm" data-theme-toggle>
            ${Icons.svg(Store.theme() === 'dark' ? 'sun' : 'moon')}
            ${Store.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
        </div>

        <p class="tiny muted center mt8">versão ${UI.esc(App.VERSAO)} • ${UI.esc(App.DATA_VERSAO)}</p>
      </section>`;

    root.querySelectorAll('[data-role]').forEach((b) =>
      b.addEventListener('click', () => {
        const next = b.getAttribute('data-role');
        if (next === role) return;
        swap = next === 'parent' ? 'from-right' : 'from-left';
        role = next;
        error = '';
        render(root);
      }));

    const eye = root.querySelector('[data-eye]');
    if (eye) eye.addEventListener('click', () => { swap = ''; showPass = !showPass; render(root); });

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
      Effects.burst(res.user.role === 'child' ? 'task' : 'approved');
    });
  }

  return { render, reset() { error = ''; showPass = false; swap = ''; } };
})();

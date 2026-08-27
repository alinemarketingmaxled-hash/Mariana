/* =========================================================
   usage.js: relógio de uso do app.
   Conta o tempo que o filho realmente passa em cada parte,
   parando quando a tela sai de foco ou quando ninguém mexe
   em nada por alguns minutos.
   ========================================================= */
const Uso = (() => {
  const PASSO = 10000;             // grava a cada 10 segundos
  const OCIOSO = 3 * 60000;        // 3 minutos sem tocar em nada = parou de usar
  const SALTO_MAX = 2 * 60000;     // ignora buracos maiores (computador dormiu)

  let childId = null;
  let marcado = 0;                 // início do pedaço que ainda não foi gravado
  let ultimaAcao = 0;
  let relogio = null;
  const pilha = ['tarefas'];       // a área da aba fica na base; folhas empilham em cima

  const atual = () => pilha[pilha.length - 1] || 'tarefas';
  const parado = () =>
    (typeof document !== 'undefined' && document.hidden)
    || Date.now() - ultimaAcao > OCIOSO;

  /** fecha o pedaço aberto e soma no registro */
  function fechar() {
    if (!childId || !marcado) return;
    const agora = Date.now();
    const gasto = agora - marcado;
    marcado = agora;
    if (gasto <= 0 || gasto > SALTO_MAX) return;
    if (parado()) return;
    Store.trackUse(childId, atual(), gasto);
  }

  const acordar = () => { ultimaAcao = Date.now(); if (!marcado) marcado = Date.now(); };

  /** liga o relógio para um filho */
  function iniciar(user) {
    if (!user || user.role !== 'child') return parar();
    if (childId === user.id) return;
    parar();
    childId = user.id;
    marcado = Date.now();
    ultimaAcao = Date.now();
    relogio = setInterval(fechar, PASSO);
  }

  function parar() {
    fechar();
    clearInterval(relogio);
    relogio = null;
    childId = null;
    marcado = 0;
    pilha.length = 1;
  }

  /** troca a área da aba (a base da pilha) */
  function aba(nome) {
    fechar();
    pilha[0] = nome || 'tarefas';
  }

  /** entra numa atividade por cima da aba (jogo, prova, bichinho) */
  function entrar(nome) {
    fechar();
    if (pilha.length > 6) pilha.length = 1;   // trava de segurança contra empilhar sem fim
    pilha.push(nome);
  }

  /** sai da atividade e volta para o que estava por baixo */
  function sair() {
    fechar();
    if (pilha.length > 1) pilha.pop();
  }

  /** quanto tempo passou desde uma marca, para anotar a duração de uma prova */
  const cronometro = () => {
    const inicio = Date.now();
    return () => Date.now() - inicio;
  };

  if (typeof document !== 'undefined') {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
      document.addEventListener(ev, acordar, { passive: true }));
    document.addEventListener('visibilitychange', () => {
      fechar();
      if (!document.hidden) acordar();
    });
    window.addEventListener('pagehide', fechar);
    window.addEventListener('beforeunload', fechar);
  }

  return { iniciar, parar, aba, entrar, sair, fechar, cronometro, atual, profundidade: () => pilha.length };
})();

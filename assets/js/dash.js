/* =========================================================
   dash.js: painel de dinheiro.
   Mostra o quanto ela ganhou, o quanto recebeu e o quanto
   gastou, mês a mês e por categoria.
   ========================================================= */
const Dash = (() => {
  const pct = (parte, todo) => (todo > 0 ? Math.max(0, Math.min(100, (parte / todo) * 100)) : 0);

  /** a cor de cada categoria, para pintar as barrinhas */
  const CORES = {
    g1: 'var(--violet)', g2: 'var(--orange)', g3: 'var(--mint)', g4: 'var(--blue)',
    g5: 'var(--pink)', g6: 'var(--sky)', g7: 'var(--sun)',
  };
  const cor = (grad) => CORES[grad] || CORES.g7;

  /** cartão grande com um número em destaque */
  function cartao({ titulo, valor, detalhe, icone, classe = '' }) {
    return `
      <div class="dash-card ${classe}">
        <span class="dash-ico">${Icons.svg(icone)}</span>
        <span class="dash-k">${titulo}</span>
        <span class="dash-v">${valor}</span>
        ${detalhe ? `<span class="dash-d">${detalhe}</span>` : ''}
      </div>`;
  }

  /** barras de ganho e gasto lado a lado, mês a mês */
  function grafico(d) {
    const teto = Math.max(1, ...d.meses.map((m) => Math.max(m.ganho, m.gasto, m.recebido)));
    return `
      <section class="panel">
        <header class="panel-head">
          <h3>${Icons.svg('chart')} Mês a mês</h3>
          <span class="tiny muted">últimos ${d.meses.length} meses</span>
        </header>
        <div class="dash-legend">
          <span><i class="dash-pin ganho"></i> ganhou</span>
          <span><i class="dash-pin recebido"></i> recebeu</span>
          <span><i class="dash-pin gasto"></i> gastou</span>
        </div>
        <div class="dash-chart">
          ${d.meses.map((m) => `
            <div class="dash-col">
              <div class="dash-bars">
                <i class="ganho" style="height:${pct(m.ganho, teto)}%" title="Ganhou ${Store.money(m.ganho)}"></i>
                <i class="recebido" style="height:${pct(m.recebido, teto)}%" title="Recebeu ${Store.money(m.recebido)}"></i>
                <i class="gasto" style="height:${pct(m.gasto, teto)}%" title="Gastou ${Store.money(m.gasto)}"></i>
              </div>
              <span class="dash-mes">${m.label}</span>
            </div>`).join('')}
        </div>
      </section>`;
  }

  /** lista de categorias com barra de proporção */
  function fatias(titulo, icone, itens, total, vazio) {
    return `
      <section class="panel">
        <header class="panel-head"><h3>${Icons.svg(icone)} ${titulo}</h3>
          <span class="tiny muted">${Store.money(total)}</span>
        </header>
        ${itens.length ? `<div class="dash-fatias">
          ${itens.map((i) => `
            <div class="dash-fatia">
              <span class="em ${i.grad}">${Icons.svg(i.icon)}</span>
              <span class="grow">
                <span class="between">
                  <b class="small">${UI.esc(i.nome)}</b>
                  <b class="small">${Store.money(i.total)}</b>
                </span>
                <span class="bar mini"><i style="width:${pct(i.total, total)}%;background:${cor(i.grad)}"></i></span>
                <span class="tiny muted">${Math.round(pct(i.total, total))}% • ${i.vezes} vez(es)</span>
              </span>
            </div>`).join('')}
        </div>` : `<p class="tiny muted">${vazio}</p>`}
      </section>`;
  }

  /** rosquinha do quanto ela guardou do que recebeu */
  function guardado(d) {
    const volta = 2 * Math.PI * 50;
    const feito = (d.guardadoPct / 100) * volta;
    return `
      <section class="panel">
        <header class="panel-head"><h3>${Icons.svg('target')} Quanto sobrou</h3></header>
        <div class="dash-anel">
          <div class="pet-ring">
            <svg viewBox="0 0 120 120">
              <circle class="ring-track" cx="60" cy="60" r="50"/>
              <circle class="ring-fill" cx="60" cy="60" r="50"
                      stroke-dasharray="${feito.toFixed(1)} ${volta.toFixed(1)}"/>
            </svg>
            <span class="pet-ring-mid">
              <b>${Math.round(d.guardadoPct)}%</b>
              <i>guardado</i>
            </span>
          </div>
          <div class="grow">
            <div class="panel-list">
              <div class="up-row"><span class="grow small">Recebeu</span><span class="bold small">${Store.money(d.recebido)}</span></div>
              <div class="up-row"><span class="grow small">Gastou</span><span class="bold small">${Store.money(d.gasto)}</span></div>
              <div class="up-row"><span class="grow small">Ainda tem</span><span class="bold small">${Store.money(d.naCarteira)}</span></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function view(user) {
    const d = Store.dashboard(user.id, 6);
    const meta = Number(user.goalAmount) || 0;

    return `
      <div class="dash-grid">
        ${cartao({ titulo: 'Já ganhou', valor: Store.money(d.ganho), icone: 'trophy', classe: 'g3',
          detalhe: d.desconto ? `menos ${Store.money(d.desconto)} de desconto` : 'tudo o que foi validado' })}
        ${cartao({ titulo: 'Já recebeu', valor: Store.money(d.recebido), icone: 'banknote', classe: 'g6',
          detalhe: 'mesada paga em dinheiro' })}
        ${cartao({ titulo: 'Já gastou', valor: Store.money(d.gasto), icone: 'coins', classe: 'g2',
          detalhe: `${d.comprasCount} compra(s) anotada(s)` })}
        ${cartao({ titulo: 'Tem agora', valor: Store.money(d.naCarteira), icone: 'wallet', classe: 'g4',
          detalhe: d.naCarteira < 0
            ? 'você anotou mais gastos do que recebeu'
            : 'na carteira, para gastar' })}
      </div>

      <div class="dash-grid dois">
        ${d.aReceber < 0
          ? cartao({ titulo: 'Adiantado', valor: Store.money(-d.aReceber), icone: 'check',
            detalhe: 'você recebeu mais do que já foi validado' })
          : cartao({ titulo: 'A receber', valor: Store.money(d.aReceber), icone: 'check',
            detalhe: 'validado e ainda não pago' })}
        ${cartao({ titulo: 'Aguardando', valor: Store.money(d.aguardando), icone: 'clock',
          detalhe: 'esperando o responsável validar' })}
        ${cartao({ titulo: 'Média por mês', valor: Store.money(d.mediaGanho), icone: 'chart',
          detalhe: 'do que você ganha' })}
        ${cartao({ titulo: 'Gasto por mês', valor: Store.money(d.mediaGasto), icone: 'basket',
          detalhe: 'média do que sai' })}
      </div>

      ${grafico(d)}
      ${guardado(d)}
      ${fatias('Onde o dinheiro foi', 'basket', d.gastosPorTipo, d.gasto,
        'Você ainda não anotou nenhum gasto. Registre na Carteira.')}
      ${fatias('De onde o dinheiro veio', 'star', d.ganhosPorCategoria, d.ganho,
        'Assim que o responsável validar suas tarefas, elas aparecem aqui.')}

      ${d.maioresGastos.length ? `
        <section class="panel">
          <header class="panel-head"><h3>${Icons.svg('coins')} Maiores gastos</h3></header>
          <div class="list">
            ${d.maioresGastos.map((p) => {
              const k = Store.purchaseKind(p.kind);
              return `
                <div class="mini-row">
                  <span class="em ${k.grad}">${Icons.svg(k.icon)}</span>
                  <div class="grow">
                    <div class="bold small">${UI.esc(p.title)}</div>
                    <div class="tiny muted">${UI.esc(k.label)} • ${Store.labelDate(p.date)}</div>
                  </div>
                  <span class="bold">${Store.money(p.value)}</span>
                </div>`;
            }).join('')}
          </div>
        </section>` : ''}

      ${meta ? `
        <section class="panel">
          <header class="panel-head"><h3>${Icons.svg('target')} ${UI.esc(user.goalName || 'Minha meta')}</h3>
            <span class="tiny muted">${Store.money(meta)}</span>
          </header>
          ${(() => {
            const tem = Math.max(0, d.aReceber) + Math.max(0, d.naCarteira);
            return `
              <div class="bar mt8" style="background:var(--surface-2)">
                <i style="width:${pct(tem, meta)}%"></i>
              </div>
              <p class="tiny muted mt8">
                Somando o que você tem na carteira e o que ainda vai receber, você já tem
                ${Store.money(tem)} e faltam ${Store.money(Math.max(0, meta - tem))}.
              </p>`;
          })()}
        </section>` : ''}

      <div class="note">
        O que você <b>ganha</b> é o que o responsável valida. O que você <b>recebe</b> é a
        mesada paga em dinheiro. O que sobra na carteira é o recebido menos o que você gastou.
      </div>`;
  }

  return { view };
})();

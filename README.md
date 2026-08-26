# 💜 Minha Mesada

Aplicativo para acompanhar a **mesada dos filhos**: a criança preenche todo dia as ações que
realizou (organizadas em categorias e subcategorias) e o responsável **valida ou recusa** cada
lançamento. Só o que é validado entra no saldo.

Visual inspirado em *neumorphism / glassmorphism* (lavanda, cartões suaves, painéis escuros),
feito em **HTML + CSS + JavaScript puro** — sem instalação, sem servidor, sem banco de dados.

---

## Como abrir

**Jeito mais simples:** abra o arquivo `index.html` no navegador (duplo clique).

**Servindo localmente** (necessário para instalar como app no celular):

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Publicando em qualquer hospedagem estática (GitHub Pages, Vercel, Netlify), o app pode ser
adicionado à tela inicial do celular — ele tem `manifest.json` e service worker, então abre
em tela cheia e funciona offline.

## Acessos de teste

| Perfil | Usuário | Senha |
| --- | --- | --- |
| Responsável | `pai` | `1234` |
| Filha | `mariana` | `1234` |

O responsável pode criar quantos filhos quiser (cada um com o próprio login e senha) e trocar
as senhas em **Menu → Trocar minha senha**.

---

## O que dá para fazer

### 👧 Filho(a)

- **Hoje** — saldo disponível, progresso da meta, tira dos últimos 7 dias e o quanto já rendeu no dia.
- **Categorias** — toca na categoria (Estudos, Casa, Saúde, Atitude, Extras…) e marca as ações feitas.
  Cada marcação vira um lançamento **aguardando validação**.
- **Comentário** — pode explicar o que fez em cada lançamento pendente.
- **Resumo do dia** (botão central) — mostra quantas tarefas obrigatórias faltam e envia para validação.
- **Extrato** — histórico completo, com filtro por situação e os pagamentos recebidos.
- **Perfil** — meta, estatísticas, troca de senha e tema.

Depois que o responsável valida ou recusa, o item fica **travado** — a criança não consegue mais alterar.

### 👨‍👩‍👧 Responsável

- **Validar** — lista tudo o que está pendente, agrupado por filho e por dia.
  Valida item a item, recusa com justificativa ou valida o dia inteiro de uma vez.
- **Filhos** — cadastra/edita acessos, define **meta** (ex.: “Patins novos — R$ 150”),
  registra pagamentos e vê o histórico de cada um.
- **Ações** — cria categorias e subcategorias com valor em R$, marca quais são
  **obrigatórias todo dia** e cadastra **descontos** (valores que saem da mesada).
- **Relatório** — validado no mês, pago, saldo e um gráfico dos últimos 7 dias por filho.

### 💰 Como o saldo é calculado

```
saldo = (ações validadas que somam) − (descontos validados) − (pagamentos já feitos)
```

Lançamentos pendentes aparecem separados, em “aguardando”, e não entram no saldo.

---

## Estrutura

```
index.html            # casca do app
manifest.json, sw.js  # instalação na tela inicial + offline
assets/
  styles.css          # design system (neumorphism, glass, tema claro/escuro)
  icon.svg            # ícone do app
  js/
    store.js          # dados, regras de negócio e localStorage
    ui.js             # toast, bottom-sheet, formulários
    screen-auth.js    # login (filho(a) / responsável)
    screen-child.js   # área do filho(a)
    screen-parent.js  # área do responsável
    app.js            # inicialização e roteamento
```

## Onde os dados ficam

Tudo é salvo no **`localStorage` do próprio navegador** (chave `mesada.state.v1`) — nada é
enviado para nenhum servidor. Consequências:

- Cada aparelho/navegador tem os seus próprios dados: hoje pai e filho precisam usar o mesmo
  aparelho (ou cada um mantém o seu). Para sincronizar entre celulares seria preciso um backend.
- Limpar os dados do site apaga tudo. Em **Menu → Restaurar dados de exemplo** dá para voltar
  ao estado inicial de propósito.
- As senhas são guardadas como hash simples, apenas para não ficarem em texto puro. É um
  controle familiar, não um sistema de segurança.

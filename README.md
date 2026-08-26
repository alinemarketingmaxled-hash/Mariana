# Minha Mesada

Aplicativo para acompanhar a **mesada dos filhos**: a criança preenche todo dia as ações que
realizou (organizadas em categorias e subcategorias) e o responsável **valida ou recusa** cada
lançamento. Só o que é validado entra no saldo.

Visual inspirado em *neumorphism / glassmorphism* (lavanda, cartões suaves, painéis escuros),
com tipografia grotesca pesada (Archivo, hospedada no próprio projeto) e ícones vetoriais próprios.
Feito em **HTML + CSS + JavaScript puro**, sem instalação, sem servidor e sem banco de dados.

---

## Como abrir

**Jeito mais simples:** abra o arquivo `index.html` no navegador (duplo clique).

**Servindo localmente** (necessário para instalar como app no celular):

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Publicando em qualquer hospedagem estática (GitHub Pages, Vercel, Netlify), o app pode ser
adicionado à tela inicial do celular: ele tem `manifest.json` e service worker, então abre
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

### Filho(a)

- **Hoje**: saldo disponível, progresso da meta, tira dos últimos 7 dias e o quanto já rendeu no dia.
- **Diário de livros e lições**: escreve um registro por atividade com **tipo** (livro, lição ou
  atividade), título, detalhe (ex.: páginas lidas), **data**, **horário**, tempo em minutos,
  o texto do que fez e **até 4 fotos**. Enquanto está aguardando, dá para editar ou apagar.
- **Categorias**: toca na categoria (Estudos, Casa, Saúde, Atitude, Extras) e marca as ações feitas.
  Cada marcação vira um lançamento **aguardando validação**.
- **Comentário e fotos**: em cada lançamento pendente dá para escrever um comentário e anexar fotos
  (tiradas na hora pela câmera ou escolhidas da galeria).
- **Resumo do dia** (botão central): mostra quantas tarefas obrigatórias faltam e envia para validação.
- **Extrato**: histórico completo, com filtro por situação e os pagamentos recebidos.
- **Perfil**: meta, estatísticas, troca de senha e tema.

Depois que o responsável valida ou recusa, o item fica **travado**: a criança não consegue mais alterar.

### Responsável

- **Validar**: lista tudo o que está pendente, agrupado por filho e por dia, com as fotos anexadas.
  Valida item a item, recusa com justificativa ou valida o dia inteiro de uma vez.
  Abaixo das tarefas aparece a seção **Diário de livros e lições**, com o texto, o horário e as fotos
  de cada registro para validar ou pedir revisão.
- **Filhos**: cadastra/edita acessos, define **meta** (ex.: “Patins novos, R$ 150”),
  registra pagamentos e abre o histórico e o diário completo de cada um.
- **Ações**: cria categorias e subcategorias com valor em R$, escolhe o ícone e a cor,
  marca quais são **obrigatórias todo dia** e cadastra **descontos** (valores que saem da mesada).
- **Relatório**: validado no mês, pago, saldo e um gráfico dos últimos 7 dias por filho.

### Como o saldo é calculado

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
  styles.css          # design system (neumorphism, glass, tipografia, tema claro/escuro)
  icon.svg            # ícone do app
  fonts/              # Archivo (woff2) hospedada localmente, funciona offline
  js/
    icons.js          # biblioteca de ícones vetoriais (sem emoji)
    photos.js         # câmera/galeria, compressão e IndexedDB das fotos
    store.js          # dados, regras de negócio e localStorage
    ui.js             # toast, bottom-sheet, formulários
    screen-auth.js    # login (filho(a) / responsável)
    screen-child.js   # área do filho(a)
    screen-parent.js  # área do responsável
    app.js            # inicialização e roteamento
```

## Onde os dados ficam

Os textos e valores ficam no **`localStorage` do navegador** (chave `mesada.state.v2`) e as
**fotos no IndexedDB** do mesmo aparelho (banco `mesada-photos`). Nada é enviado para nenhum
servidor. Consequências:

- Cada aparelho/navegador tem os seus próprios dados: hoje pai e filho precisam usar o mesmo
  aparelho (ou cada um mantém o seu). Para sincronizar entre celulares seria preciso um backend.
- Limpar os dados do site apaga tudo, fotos incluídas. Em **Menu > Restaurar dados de exemplo**
  dá para voltar ao estado inicial de propósito.
- As fotos são reduzidas para no máximo 1100px e recomprimidas em JPEG antes de salvar, para
  caber com folga no armazenamento do navegador.
- As senhas são guardadas como hash simples, apenas para não ficarem em texto puro. É um
  controle familiar, não um sistema de segurança.

# Minha Mesada

Aplicativo para acompanhar a **mesada dos filhos**: a criança preenche todo dia as ações que
realizou (organizadas em categorias e subcategorias) e o responsável **valida ou recusa** cada
lançamento. Só o que é validado entra no saldo.

Visual de blocos de cor chapados (limão, azul, rosa, laranja), formas arredondadas, personagens
desenhados em SVG e tipografia grotesca pesada (Archivo, hospedada no próprio projeto).
Feito em **HTML + CSS + JavaScript puro**, sem instalação, sem servidor e sem banco de dados.

O layout é de site: no celular a navegação fica na barra de baixo, em telas largas vira um
menu lateral fixo com marca, perfil e ação principal, e cada página tem cabeçalho próprio
(título, descrição e ação) com o conteúdo em duas colunas.

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

## Deploy no Vercel

O site é estático: basta apontar um projeto do Vercel para este repositório, sem build.
O `vercel.json` na raiz cuida das URLs limpas e do cache (o `index.html` e o `sw.js` são
revalidados a cada visita, as fontes ficam em cache longo).

A pasta `deploy/` existe só enquanto o projeto do Vercel **não** estiver conectado ao GitHub.
Nesse caso o deploy é feito enviando os três arquivos dela; o `build.mjs` baixa o código
deste repositório e o publica. Depois de conectar o repositório em *Settings > Git* no
painel do Vercel, cada push passa a gerar um deploy sozinho e a pasta `deploy/` deixa de
ser usada.

## Acessos iniciais

A tela de login não mostra nenhuma senha. Os acessos que já vêm criados são:

| Perfil | Usuário | Senha |
| --- | --- | --- |
| Responsável | `pai` | `1234` |
| Filha | `mariana` | `1234` |

Troque as duas senhas no primeiro uso em **Menu > Trocar minha senha**. O responsável pode criar
quantos filhos quiser, cada um com o próprio login e senha.

---

## O que dá para fazer

### Filho(a)

- **Bichinho solto na tela**: ele fica acima da barra de navegação e vive sozinho: pula, brinca de
  bola, anda, estuda e só **dorme de madrugada** (das 22h às 6h) ou depois de muito tempo sem
  ninguém por perto, e quando dorme aparece na **cama** dele. **Um toque** abre o painel
  para cuidar dele; **segurar por 4 segundos** faz ele derreter e ficar tonto; **sacudir** deixa ele
  zonzo; e dá para **arrastar e jogar de qualquer altura** (ele cai, quica no chão, bate no teto e,
  se a queda for feia, fica vendo estrelinhas).
- **Jogos e estudo**: uma aba com dois espaços.
  - *Joguinhos*: **Conta rápida** (contas de somar, subtrair, multiplicar e dividir, com
    dificuldade que sobe conforme a criança acerta seguido), *Pega a bola*, *Jogo da memória* e
    *Repete comigo*. Cada partida rende pontos de amizade, com teto de 20 por dia e recorde por jogo.
  - *Quiz das matérias*: a criança cria um assunto (matéria, nome, o que aconteceu na aula) e
    escreve as perguntas, uma por linha no formato `pergunta = resposta`; o app monta as cartas.
    Há atalho para gerar a tabuada de qualquer número. Cada assunto pode ser estudado como
    **cartas para virar** ou como **quiz de múltipla escolha** (as alternativas erradas saem das
    respostas das outras cartas). O bichinho estuda junto, comenta e ainda faz **perguntas
    surpresa** sozinho enquanto ela usa o app.

  > O app funciona sem internet e sem servidor, então ele não inventa perguntas a partir de um texto
  > livre: as perguntas são as que a criança escreve, cola do caderno ou gera pelos atalhos.
- **Bichinho**: o mesmo personagem também aparece no cartão da tela inicial, reage ao que acontece no dia (dorme quando
  nada foi feito, fica animado quando tem tarefa marcada, comemora quando o dia está completo,
  fica preocupado com compromisso atrasado) e fala frases ligadas ao que está pendente. Recebe
  carinho (até 5 por dia), ganha **pontos de amizade** a cada tarefa, livro, compromisso e
  validação, sobe de nível e libera acessórios. Dá para trocar nome, formato, cor e acessório.
- **Hoje**: saldo disponível, progresso da meta, tira dos últimos 7 dias e o quanto já rendeu no dia.
- **Diário de livros e lições**: escreve um registro por atividade com **tipo** (livro, lição ou
  atividade), título, detalhe (ex.: páginas lidas), **data**, **horário**, tempo em minutos,
  o texto do que fez e **até 4 fotos**. Enquanto está aguardando, dá para editar ou apagar.
- **Categorias**: toca na categoria (Estudos, Casa, Saúde, Atitude, Extras) e marca as ações feitas.
  Cada marcação vira um lançamento **aguardando validação**.
- **Comentário e fotos**: cada lançamento pendente tem um botão de câmera para escrever um
  comentário e anexar fotos (tiradas na hora ou escolhidas da galeria).
- **Foto do perfil**: em *Perfil* dá para colocar ou trocar a própria foto.
- **Resumo do dia** (botão central): mostra quantas tarefas obrigatórias faltam e envia para validação.
- **Extrato**: histórico completo, com filtro por situação e os pagamentos recebidos.
- **Agenda**: calendário do mês com provas, trabalhos, aulas, eventos e lembretes. O filho e o
  responsável marcam compromissos na mesma agenda, com data, horário, local, detalhes e fotos;
  dá para concluir, editar e excluir, e os próximos aparecem na coluna lateral de todas as telas.
- **Carteira**: além do extrato, o filho registra **o que comprou** (lanche, brinquedo, jogo,
  presente, roupa ou outro) com valor, data, observação e foto. O app mostra quanto recebeu,
  quanto gastou e quanto sobrou.
- **Perfil**: meta, estatísticas, foto, troca de senha e tema.

Cada ação do filho responde com uma animação: tarefa marcada solta estrelas, registro de livro
solta livrinhos, gasto mostra o dinheiro indo embora e o valor sobe na tela. Quem prefere menos
movimento é atendido automaticamente pela preferência de *reduzir animações* do sistema.

Depois que o responsável valida ou recusa, o item fica **travado**: a criança não consegue mais alterar.

### Responsável

- **Validar**: lista tudo o que está pendente, agrupado por filho e por dia, com as fotos anexadas.
  Valida item a item, recusa com justificativa ou valida o dia inteiro de uma vez. Em **Ajustar**
  dá para corrigir o valor, a descrição e o tipo do lançamento, anexar fotos, deixar uma
  observação para o filho ou excluir o lançamento.
  Abaixo das tarefas aparece a seção **Diário de livros e lições**, com o texto, o horário e as fotos
  de cada registro para validar ou pedir revisão.
- **Filhos**: cadastra/edita acessos com **foto de perfil**, define **meta** (ex.: “Patins novos,
  R$ 150”), abre o histórico e o diário completo e lança **valores avulsos** (bônus ou desconto
  fora das categorias, com data, observação e fotos).
- **Pagamentos**: lista de tudo o que já foi pago, com **foto do comprovante**; cada pagamento
  pode ser editado ou excluído (o valor volta para o saldo).
- **Gastos do filho**: o responsável vê tudo o que a criança comprou, com fotos, e acompanha
  quanto ainda sobra na carteira dela.
- **Agenda da família**: mesma agenda do filho, com filtro por criança; o responsável marca
  provas, reuniões e eventos que aparecem na tela da criança.
- **Ações**: cria categorias e subcategorias com valor em R$, escolhe ícone, cor e até uma
  **foto de capa**, marca quais são **obrigatórias todo dia** e cadastra **descontos**
  (valores que saem da mesada). Qualquer valor pode ser alterado depois.
- **Relatório**: validado no mês, pago, saldo e um gráfico dos últimos 7 dias por filho.

### Como o saldo é calculado

```
a receber      = (ações validadas que somam) - (descontos validados) - (pagamentos já feitos)
na carteira    = (pagamentos recebidos) - (gastos anotados pelo filho)
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
    effects.js        # animações de resposta (moedas, livros, estrelas)
    agenda.js         # calendário compartilhado de provas, trabalhos e eventos
    store.js          # dados, regras de negócio e localStorage
    ui.js             # toast, bottom-sheet, formulários
    screen-auth.js    # login (filho(a) / responsável)
    screen-child.js   # área do filho(a)
    screen-parent.js  # área do responsável
    app.js            # inicialização e roteamento
```

## Onde os dados ficam

Os textos e valores ficam no **`localStorage` do navegador** (chave `mesada.state.v2`) e as
**fotos no IndexedDB** do mesmo aparelho (banco `mesada-photos`). Fotos aparecem em toda parte:
perfil de quem usa, capa das categorias, lançamentos do dia, registros do diário e comprovantes
de pagamento. Nada é enviado para nenhum
servidor. Consequências:

- Cada aparelho/navegador tem os seus próprios dados: hoje pai e filho precisam usar o mesmo
  aparelho (ou cada um mantém o seu). Para sincronizar entre celulares seria preciso um backend.
- Limpar os dados do site apaga tudo, fotos incluídas. Em **Menu > Restaurar dados de exemplo**
  dá para voltar ao estado inicial de propósito.
- As fotos são reduzidas para no máximo 1100px e recomprimidas em JPEG antes de salvar, para
  caber com folga no armazenamento do navegador.
- As senhas são guardadas como hash simples, apenas para não ficarem em texto puro. É um
  controle familiar, não um sistema de segurança.

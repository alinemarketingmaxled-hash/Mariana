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
  ninguém por perto, e quando dorme aparece na **cama** dele. **Um toque** abre **cinco bolinhas
  em volta dele**: *dormir* (ou acordar), *brincar*, *estudar*, *conversar* e *atualizar*;
  **segurar por 4 segundos** faz ele derreter e ficar tonto; **sacudir ele deixa enjoado e ele
  vomita** (olho em X, bochecha verde e um jorro caindo, e depois fica tonto até se recuperar); e
  dá para **arrastar e jogar de qualquer altura** (ele cai, quica no chão, bate no teto e,
  se a queda for feia, fica vendo estrelinhas).
- **O paraquedas da sétima vez**: jogar ele **sete vezes seguidas** e na sétima ele já estava
  preparado: abre um **paraquedas** e desce planando, balançando no ar, até pousar de leve e
  comemorar. Na quarta e na sexta jogada ele avisa que está tramando alguma coisa. Pegar ele no
  meio do voo fecha o paraquedas, e passar muito tempo sem jogar zera a contagem.
- **Atualizar o bichinho**: a bolinha de atualizar abre uma tela grande com ele dentro do
  **quarto** e, ao lado, um **gráfico de círculo** que mostra o **nível no meio** e quantos pontos
  faltam para evoluir. A tela tem três abas:
  - *Bichinho*: nome, **8 modelos de bonequinho** (Redondinho, Gotinha, Feijãozinho, Estrelinha,
    Gatinho, Coelhinho, Ursinho e Robozinho), 8 cores e os acessórios.
  - *Quarto*: **tema pronto** (Quartinho, Jardim, Praia, Espaço, Castelo), **8 cores de parede**,
    **8 cores de chão** e **16 móveis** distribuídos em seis cantinhos (parede da esquerda, parede
    da direita, cantinho da esquerda, cantinho da direita, no chão e no teto): janela, quadro,
    prateleira, relógio, televisão, mural de fotos, estante de livros, plantinha, violão, mesinha
    de estudo, pufe, baú, tapete, almofadas, luminária e bandeirinhas.
  - *Roupas e cama*: as 8 roupinhas e as 4 camas.

  Tudo o que ainda está bloqueado aparece com cadeado e o nível que falta, e o botão **Ver tudo**
  abre o catálogo completo com o que já foi liberado e qual é a próxima peça.
- **Lembrete de todo dia**: no *Perfil* ela liga o lembrete e escolhe a hora. O app pede a
  permissão do celular e, no horário, o bichinho chama ela por uma notificação com o que ainda
  falta ("faltam 3 tarefas e a leitura"). Se o aviso não sair na hora, ele aparece assim que ela
  abre o app, e nunca sai duas vezes no mesmo dia. Tem também **"pôr no calendário"**, que salva
  um lembrete que se repete todo dia no calendário do próprio celular: esse funciona em qualquer
  aparelho, sem internet e sem o app aberto. A tela do calendário traz o passo a passo, o botão
  de baixar e o texto do arquivo para copiar na mão, caso o navegador bloqueie o download.
- **Minha mesada**: o cartão da tela inicial mostra o valor combinado do mês, quanto já foi
  validado, quanto está esperando e quanto falta para fechar. Também lembra que a leitura é a
  parte que mais rende.
- **Jogos e estudo**: uma aba com dois espaços.
  - *Desafios do dia*: três jogos de palavra que **trocam sozinhos toda meia-noite** e são
    **iguais para todo mundo no mesmo dia**. O andamento fica salvo, então dá para fechar o app
    no meio e voltar depois, e a aba mostra **quantos dias seguidos** ela vem fechando cada um.
    - **Palavrinha**: uma palavra de **cinco letras** por dia, em até **seis tentativas**.
      Verde é letra certa no lugar certo, amarelo é letra certa no lugar errado e escuro é letra
      que não entra. O teclado da tela vai guardando o que já foi descoberto, e no computador dá
      para digitar direto. Acento não atrapalha: "avião" e "aviao" valem a mesma coisa.
      São **216 palavras** no rodízio.
    - **Contexto**: existe uma palavra secreta e cada palpite recebe uma **posição**. Quanto menor
      o número, mais perto ela chegou, com a barra e o aviso de "tá frio", "tá morno" e "tá quente".
      São **16 palavras secretas**, cada uma com o campo de palavras que gira em volta dela, e dá
      para **pedir dica** quando empacar.
    - **Teia**: **dezesseis palavras** para separar em **quatro grupos de quatro**, com **quatro
      tentativas**. Quando três das quatro escolhidas são do mesmo grupo, o jogo avisa que
      "faltou uma". Tem pegadinha de propósito: em um dos desafios *março* aparece entre palavras
      que também são verbos, e não entre os meses. São **12 teias** no rodízio.
  - *Joguinhos*: **Conta rápida**, com **níveis por série** (até o 5º ano, 6º, 7º, 8º e 9º) e
    questões próprias de cada ano: quatro operações, frações, porcentagem, MMC e MDC, números
    negativos, **equações do 1º grau**, potências e raízes, regra de três, **equações do 2º grau**,
    funções e Pitágoras. Também *Pega a bola*, *Jogo da memória* e *Repete comigo*. Cada partida rende pontos de amizade, com teto de 20 por dia e recorde por jogo.
  - *Montar prova*: um **levantamento do conteúdo da escola** já vem pronto no app, com
    **16 matérias**, **57 submatérias** e **285 questões**. As matérias saem de uma
    **lista oculta** separada por área:
    - *Linguagens*: Português, Literatura, Redação, Inglês, Espanhol, Artes e Educação Física
    - *Matemática*
    - *Ciências da Natureza*: Ciências, Biologia, Física e Química
    - *Ciências Humanas*: História, Geografia, Filosofia e Sociologia

    Ela escolhe uma matéria por vez na lista e ela vira uma etiqueta. Depois abre a segunda
    lista oculta e marca as **submatérias estudadas** (ou escreve uma que a professora passou
    e não está na lista). No campo **o que foi passado nas últimas aulas** ela conta o que caiu:
    o app usa essas palavras para trazer primeiro as questões que combinam com a aula dela.
    Se escrever uma linha no formato `pergunta = resposta`, essa pergunta entra na prova.
    Ela **digita quantas questões** quer (de 1 a 50) e escolhe o **tipo**: *alternativas*,
    *discursivas* ou *misturadas*. Nas discursivas ela escreve a resposta e o
    bichinho compara com o gabarito (ignorando acento, maiúscula e pontuação); se a resposta
    dela estiver certa de outro jeito, o botão **"escrevi certo"** conta como acerto. No fim
    aparece a lista do que errou, com o gabarito, para revisar.
  - *Quiz das matérias*: a criança cria um assunto (matéria, nome, o que aconteceu na aula) e
    escreve as perguntas, uma por linha no formato `pergunta = resposta`; o app monta as cartas.
    Há atalho para gerar a tabuada de qualquer número. Cada assunto pode ser estudado como
    **cartas para virar** ou como **quiz de múltipla escolha** (as alternativas erradas saem das
    respostas das outras cartas). O bichinho estuda junto, comenta e ainda faz **perguntas
    surpresa** sozinho enquanto ela usa o app.

  > O app funciona sem internet e sem servidor, então ele não inventa perguntas a partir de um texto
  > livre: as perguntas saem do **banco de conteúdo da escola** que já vem embutido, ou são as que
  > a criança escreve, cola do caderno ou gera pelos atalhos.
- **O bichinho cresce junto com ela**: ele não muda só de número, muda de corpo. São **cinco
  fases de vida**, e a cada uma ele fica maior e ganha uma parte nova:
  - **Filhotinho** (nível 1): pequenininho, cabeção, olhos enormes e um cachinho na cabeça.
  - **Criancinha** (nível 3): cresceu e ganhou **orelhinhas**.
  - **Jovem** (nível 6): ficou do tamanho de gente grande, com **topete** e **sardinhas**.
  - **Crescido** (nível 10): maior, com **sobrancelhas** e cara de quem já sabe das coisas.
  - **Lendário** (nível 15): o maior de todos, com **auréola dourada** e **estrelas** em volta.

  Quando ele passa de fase o app abre uma tela mostrando **o antes e o depois lado a lado**, e
  na tela de atualizar tem a **linha do tempo das cinco fases**, com as que já passaram
  desenhadas e as que ainda vêm com cadeado.
- **Notas da escola**: o combinado e' da mae (Menu -> Notas da escola): a partir de tal nota ganha
  um extra, a partir de tal outra ganha menos, e abaixo do combinado **desconta**. A filha
  registra a nota com a materia, a avaliacao e a **foto da prova**; o app calcula o valor pela
  regra e mostra na hora quanto aquela nota vale. A nota vira um lancamento comum: fica esperando
  validacao, aparece no extrato e viaja no link para o outro celular.
- **Licao de casa** (aba **Escola**): ela anota o que a professora passou e **para quando**. A
  lista mostra o que e' para hoje e o que ja passou do prazo. Quando ela marca "ja fiz", pede a
  **foto do caderno** e vira um lancamento para validar. Entregar **no prazo** vale mais do que
  entregar **atrasada** - os dois valores quem define e' a mae (Menu -> Licao de casa).
- **Levar meus dados** (Menu do responsável): o app guarda tudo **no navegador**, e o navegador
  separa por **endereço**. Se o endereço do app mudar, ele abre zerado — **nada foi apagado**,
  ficou no endereço antigo. Esta tela tira uma cópia completa de um lado (personalização,
  categorias, tarefas, lançamentos e **as fotos**) e põe do outro, por **arquivo** ou por
  **copiar e colar**. Antes de trocar, ela mostra o que veio e pergunta.
- **A ponte entre os dois celulares**: o app guarda tudo no proprio aparelho, sem servidor. Se a
  filha usa o celular dela e a mae o dela, sao **duas copias separadas** do mesmo app: o que ela
  marca nao existe no celular da mae. E como a tarefa so entra na conta **depois de validada**,
  nada nunca contabilizaria. A ponte e um link:
  1. Ela toca em **Enviar para validação** → a mensagem do WhatsApp sai com um **link** dentro.
  2. A mae toca no link → o app abre, mostra o que chegou e pergunta antes de mexer em nada.
  3. A mae valida → aparece o cartao **"falta devolver"**, com um link de volta.
  4. Ela toca nesse link → as tarefas validadas **entram na conta** e o bichinho ganha os pontos.

  > O que nao viaja: as **fotos**. Trinta fotos de paginas nao cabem num link e nao ha onde
  > guarda-las no meio do caminho. O resumo, o livro, as paginas e o "grifou" atravessam
  > inteiros; a tela da mae diz quantas fotos ficaram no celular dela, para ver de perto.
- **Aviso para quem confirma**: quando ela toca em **Enviar para validação**, o recado sai na
  hora para o celular do responsável, com a lista do que foi mandado, o total e se tem leitura.
  O responsável põe o número dele uma vez em **Menu → Avisar quando ela enviar**, e escolhe se
  quer por **WhatsApp** ou por **SMS**.

  > O app não tem servidor, então nada sai daqui sozinho para outro aparelho. O que acontece é
  > que o celular **dela** abre o WhatsApp com o recado já escrito e ela toca em enviar — chega
  > no celular da mãe como qualquer mensagem. Se as duas usam o **mesmo aparelho**, o aviso
  > aparece sozinho na tela, sem precisar de WhatsApp nenhum.
- **Bichinho**: o mesmo personagem também aparece no cartão da tela inicial e tem **dezoito
  sentimentos**, todos ligados ao que está acontecendo de verdade, nunca a um contador escondido:
  fica **orgulhoso** quando o dia fecha completo e com leitura, **em festa** quando fecha o dia,
  **animado** quando ela lê, **derretido de amor** depois de muito carinho (com coração no lugar
  dos olhos), **curioso** na véspera de uma prova, **preocupado** quando a tarde vira sem nada
  marcado, **assustado** com compromisso atrasado, **triste** quando alguma coisa é recusada,
  **com saudade** e lagriminha quando ela some por três dias, **entediado** quando o dia passa
  em branco, **com sono** perto das 21h, e ainda **dormindo**, **tonto**, **enjoado**,
  **rindo**, **estudando**, **cantando** e **feliz**. O desenho ganhou olhos maiores e brilhantes,
  bochecha corada, bracinhos que balançam e um brilho no corpo. Fala frases ligadas ao que está pendente. Recebe
  carinho (até 5 por dia) e, quando recebe, **cai na gargalhada**: fecha os olhinhos, abre o
  sorrisão, solta um "ha ha" e ri em voz alta (o bichinho solto na tela ri junto). Ganha
  **pontos de amizade** a cada tarefa, livro, compromisso e
  validação, sobe de nível e libera roupinhas, camas, acessórios e quartos. Ele também **fala em
  voz alta** as perguntas e as respostas (dá para desligar no alto-falante do painel).
- **Hoje**: saldo disponível, progresso da meta, tira dos últimos 7 dias e o quanto já rendeu no dia.
- **Registro de leitura**: as ações da categoria **Leitura** não contam só com um toque. Ao marcar
  uma delas o app abre a folha de leitura, e o botão de salvar só libera quando estiver tudo lá:
  - o **livro e o capítulo** e de que **página até que página** ele vai;
  - o **resumo do capítulo** escrito por ela, com pelo menos 140 letras;
  - a confirmação de que ela **grifou a lápis** as partes que mais gostou, e um campo para contar
    quais foram;
  - a **foto de cada página grifada**: o app conta as páginas que ela informou e cobra uma foto
    para cada uma, aceitando até 30.

  Enquanto falta alguma coisa, a lista de pendências fica à vista dizendo exatamente o que é
  ("faltam 2 de 5 fotos", "faltam 40 letras no resumo"). Se ela desistir no meio, a ação volta a
  ficar desmarcada. O responsável vê o resumo inteiro, as páginas e as fotos na hora de validar.
- **Diário de livros e lições**: escreve um registro por atividade com **tipo** (livro, lição ou
  atividade), título, detalhe (ex.: páginas lidas), **data**, **horário**, tempo em minutos,
  o texto do que fez e **até 4 fotos**. Enquanto está aguardando, dá para editar ou apagar.
- **Categorias**: toca na categoria (Estudos, Casa, Saúde, Atitude, Extras) e marca as ações feitas.
  Cada marcação vira um lançamento **aguardando validação**.
- **Foto obrigatória nas atividades diárias**: ao marcar uma tarefa de **todo dia**, o app já
  abre a câmera e só libera o *Salvar* depois que ela manda a foto do que foi feito. Se
  desistir, a tarefa volta a ficar desmarcada. Enquanto faltar foto, a tarefa aparece com a
  etiqueta *falta a foto*, não conta no progresso do dia e o botão *Enviar para validação*
  fica travado. O responsável vê o aviso no cartão de validação e pode desligar a regra em
  **Ações > Regra das fotos**.
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
- **Meu dinheiro**: dentro da *Carteira*, na aba **Meu dinheiro**, um painel só de números,
  com o quanto ela **já ganhou** (validado),
  **já recebeu** (mesada paga), **já gastou** e **tem agora** na carteira, mais o que está
  a receber, o que está aguardando validação e as médias por mês. Tem um **gráfico de barras
  mês a mês** comparando ganhou, recebeu e gastou nos últimos 6 meses, um **anel** com quanto
  por cento do recebido ainda está guardado, a divisão de **onde o dinheiro foi** (por tipo de
  gasto) e **de onde veio** (por categoria de tarefa), os cinco maiores gastos e o progresso
  da meta.
- **Meu tempo no app**: no *Perfil* aparece quanto tempo ela passou no app hoje e nos últimos
  7 dias, a média por dia, quanto foi em joguinho e quanto foi estudando, um gráfico por dia,
  a divisão por área e a lista dos últimos quizzes, provas e partidas com a nota e a duração.
- **Perfil**: meta, estatísticas, foto, troca de senha e tema.

Cada ação do filho responde com uma animação: tarefa marcada solta estrelas, registro de livro
solta livrinhos, gasto mostra o dinheiro indo embora e o valor sobe na tela. Quem prefere menos
movimento é atendido automaticamente pela preferência de *reduzir animações* do sistema.

Depois que o responsável valida ou recusa, o item fica **travado**: a criança não consegue mais alterar.

### Responsável


- **Botão de mais com bolinhas**: o botão redondo abre um leque de bolinhas coloridas em volta
  dele, uma para cada ação: *Nova ação*, *Categoria*, *Filho*, *Pagar*, *Bônus* e *Validar*
  (mostrando quantos itens estão esperando). A bolinha de **Nova ação** abre um segundo leque
  com **uma bolinha por categoria, cada uma na cor dela**: escolhendo a categoria, o formulário
  já abre dentro dela para escrever o nome, o **valor**, se ganha ou desconta e se é obrigatória
  todo dia. O leque abre para o lado com mais espaço na tela e fecha tocando fora ou no Esc.
- **Planejador da mesada**: o responsável digita **quanto vale a mesada no mês** e o app divide
  esse valor entre as ações, para que o mês feche exatamente nesse número se o filho fizer tudo
  o que foi combinado.
  - Cada categoria tem um **peso** de *pouco* a *o que mais vale*. A **Leitura** já vem com o
    maior de todos e fica com cerca de **um terço da mesada**.
  - Cada ação tem **quantas vezes por mês** se espera (as de todo dia valem os 30 dias) e um
    **esforço** de 1 a 10, para separar "ler 20 minutos" de "terminar um livro".
  - A tela mostra ao vivo a divisão em porcentagem, o valor de cada ação, quantas vezes ela
    rende no mês e o total, com o quanto a leitura leva. O acerto de centavos fecha o mês na
    diferença de no máximo cinco centavos.
  - Ao aplicar, os valores de todas as ações são reescritos. Os lançamentos já feitos continuam
    com o valor antigo.
- **Painel do filho**: tocar no filho abre um painel com tudo dele: o bichinho no quarto, o que
  tem a receber, o que está na carteira e quantos itens aguardam validação; o progresso das
  tarefas de hoje (com aviso das que estão sem a foto obrigatória); validado, aguardando e
  gasto no mês; o tempo no app, em joguinhos e estudando nos últimos 7 dias com o aproveitamento
  dos quizzes; os próximos compromissos, os últimos lançamentos e os últimos gastos. Embaixo
  ficam os atalhos: pagamentos, gastos, lançamento avulso, foto, diário, histórico, tempo de uso
  completo, editar e excluir.
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

### Tempo de uso e estudo

O app tem um relógio próprio que mede quanto tempo o filho realmente passa nele:

- Conta a cada 10 segundos, separando por área: **tarefas do dia, diário, joguinhos,
  estudo e provas, bichinho, agenda e carteira**.
- **Para de contar** quando o app vai para segundo plano ou quando ninguém mexe em nada
  por 3 minutos, e ignora buracos grandes (aparelho que dormiu com o app aberto).
- Guarda um total por dia e por área, então o registro não cresce sem parar: são 120 dias
  de histórico.
- Cada **quiz, prova, revisão de cartas, pergunta surpresa e partida de joguinho** que termina
  vira um registro com a data, o nome, as matérias, o número de acertos e quanto tempo levou.

O responsável vê tudo em **Relatório > Tempo de uso**: por filho, o tempo de hoje, dos 7 dias
e a média por dia, quanto foi em joguinho e quanto em estudo, quantos quizzes fez, o gráfico
dia a dia e a divisão por área. O botão *Ver tudo* abre o relatório completo, com o
aproveitamento por matéria e a lista das últimas atividades. Na aba **Filhos**, cada cartão
mostra o tempo de app do dia.

O filho vê o mesmo resumo do seu próprio uso no **Perfil**.

### Como o saldo é calculado

```
a receber      = (ações validadas que somam) - (descontos validados) - (pagamentos já feitos)
na carteira    = (pagamentos recebidos) - (gastos anotados pelo filho)
```

Lançamentos pendentes aparecem separados, em “aguardando”, e não entram no saldo.

---

## No celular

O app foi ajustado para ser usado principalmente no celular:

- **Barra de baixo com cinco abas** (Hoje, Diário, Jogos, Agenda, Carteira), com ícone e nome
  legível. Carteira reúne os lançamentos e o painel *Meu dinheiro* em um seletor no topo da página.
- **Alvos grandes para o dedo**: todo botão, link, chip e opção de quiz tem pelo menos 40px de
  altura, com a área de toque maior que o desenho.
- **Campos com letra de 16px**, que é o tamanho a partir do qual o iPhone não dá zoom sozinho
  ao tocar em um campo.
- **Folhas (as janelas que sobem de baixo)** ocupam quase a tela toda, com o **título fixo no
  topo** e os **botões fixos embaixo**: dá para rolar uma lista longa sem perder o Salvar de vista.
- **Avisos aparecem embaixo**, acima da barra de navegação, e sobem mais quando há uma folha
  aberta, para não taparem os botões.
- **O bichinho** continua podendo ser arrastado, sacudido (aí ele vomita) e jogado para qualquer canto.
- **Tira de dias com deslize** e o dia de hoje já centralizado.
- **Sem atraso no toque** e sem o retângulo cinza que alguns navegadores desenham ao tocar.
- **Nada some no celular**: o desenho do bichinho no quarto continua no painel lateral, os
  filtros que não cabem deslizam de lado em vez de serem cortados, os selos de contagem
  (2/2, 1/1) aparecem inteiros e o cabeçalho põe o botão de ação numa linha própria, para o
  título e o menu não se espremerem.
- **No calendário** cada compromisso vira uma barrinha colorida no dia, em vez de um texto
  cortado que não dava para ler; tocando no dia a lista completa aparece embaixo.
- **O bichinho começa no canto de baixo à esquerda**, longe do botão redondo de ação, que fica
  à direita: assim ele nunca cobre um botão.
- **Celular deitado**: a barra e o botão flutuante encolhem para sobrar tela.
- Instalável na tela inicial (PWA) com nome, ícone, cor da barra de status clara e escura,
  e funcionando offline.

Testado em 320, 360, 375, 390 e 412 pixels de largura, em pé e deitado, sem rolagem horizontal
e sem nada estourando a tela.

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
    bank.js           # banco de conteúdo da escola (matérias, submatérias e questões)
    notify.js         # o lembrete de todo dia e o arquivo de calendário
    wordbank.js       # palavras dos desafios do dia (palavrinha, contexto e teia)
    wordgames.js      # os três desafios do dia
    dash.js           # painel de ganhos, gastos e tempo de uso
    usage.js          # relógio de uso: conta o tempo em cada parte do app
    pet.js            # o bichinho: desenho, quartos, menu em bolinhas, voz e lojinha
    quiz.js           # montar prova, assuntos escritos por ela, cartas e quizzes
    games.js          # joguinhos e a aba de estudo
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

/* =========================================================
   wordbank.js: as palavras dos três desafios do dia.

   Palavrinha: uma palavra de cinco letras por dia.
   Contexto:   uma palavra secreta e as palavras que giram em volta
               dela, das mais próximas para as mais distantes.
   Teia:       dezesseis palavras para separar em quatro grupos.

   Tudo fica guardado sem acento e em maiúscula. O app tira o acento
   do que ela digita antes de comparar, então "AVIÃO" e "AVIAO" valem
   a mesma coisa.
   ========================================================= */
const WordBank = (() => {
  /** tira acento, deixa maiúscula e joga fora o que não é letra */
  function limpar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }

  /* ---------- palavrinha: palavras de cinco letras ---------- */
  const PALAVRAS = [
    'AMIGO', 'AMORA', 'ANJOS', 'ARROZ', 'ARTES', 'AULAS', 'AVIAO', 'AZEDO',
    'BAILE', 'BALAO', 'BANHO', 'BARCO', 'BEIJO', 'BOLSA', 'BONDE', 'BRAVO',
    'BRISA', 'CABRA', 'CAIXA', 'CALMA', 'CAMPO', 'CANTO', 'CARRO', 'CARTA',
    'CASAL', 'CASCA', 'CHAVE', 'CHUVA', 'CIRCO', 'CLARO', 'COBRA', 'COPOS',
    'CORAL', 'CORPO', 'COURO', 'CRAVO', 'CREME', 'CURSO', 'DEDOS', 'DENTE',
    'DOCES', 'DUPLA', 'ERVAS', 'FACIL', 'FALAR', 'FAVOR', 'FEIRA', 'FERRO',
    'FESTA', 'FICHA', 'FILHA', 'FILME', 'FLORA', 'FOLHA', 'FORCA', 'FORNO',
    'FRACO', 'FRUTA', 'GALHO', 'GANSO', 'GARRA', 'GENIO', 'GESSO', 'GIRAR',
    'GLOBO', 'GRAMA', 'GRAVE', 'GRITO', 'GRUPO', 'HORTA', 'IGUAL', 'ILHAS',
    'IRMAO', 'JOGOS', 'JOVEM', 'JUSTO', 'LAGOA', 'LARGO', 'LEITE', 'LENTE',
    'LEOES', 'LETRA', 'LIMAO', 'LINDO', 'LIVRO', 'LOUCO', 'LUCRO', 'LUVAS',
    'MAGIA', 'MANGA', 'MAPAS', 'MARCA', 'MASSA', 'MEDIA', 'MELAO', 'MESAS',
    'METAL', 'MILHO', 'MOLHO', 'MOTOR', 'MUNDO', 'MUSEU', 'NADAR', 'NAVIO',
    'NEVOA', 'NOBRE', 'NOITE', 'NOVOS', 'NUVEM', 'OBRAS', 'OLHOS', 'ONDAS',
    'OSSOS', 'OUROS', 'OUTRO', 'PALCO', 'PAPEL', 'PASTA', 'PATAS', 'PEDRA',
    'PEIXE', 'PENAS', 'PERTO', 'PESCA', 'PIANO', 'PILHA', 'PINTO', 'PISTA',
    'PLACA', 'PLANO', 'POBRE', 'PONTE', 'PORTA', 'POSTE', 'PRADO', 'PRAIA',
    'PRATO', 'PRECO', 'PRESA', 'PRETO', 'PRIMO', 'PULSO', 'QUEDA', 'RADIO',
    'RAMOS', 'RATOS', 'REDES', 'REGRA', 'REINO', 'RELVA', 'REMOS', 'RISCO',
    'RITMO', 'ROCHA', 'RODAS', 'ROSAS', 'ROUPA', 'SABIA', 'SABOR', 'SALAS',
    'SALTO', 'SANTO', 'SAPOS', 'SAUDE', 'SELVA', 'SERRA', 'SIGNO', 'SINAL',
    'SOFAS', 'SOLTO', 'SONHO', 'SORTE', 'SUCOS', 'SURDO', 'TAPAS', 'TARDE',
    'TEIAS', 'TEMPO', 'TENDA', 'TERRA', 'TESTE', 'TIGRE', 'TINTA', 'TIPOS',
    'TOCAR', 'TOMAR', 'TORRE', 'TRAJE', 'TRAVA', 'TREVO', 'TRIBO', 'TRIGO',
    'TROCA', 'TROPA', 'TUBOS', 'TURMA', 'UNHAS', 'URSOS', 'VAGAO', 'VALES',
    'VAPOR', 'VASOS', 'VEIAS', 'VELAS', 'VENTO', 'VERDE', 'VIDAS', 'VIDRO',
    'VINHO', 'VIOLA', 'VIRAR', 'VISTA', 'VIVER', 'VOLTA', 'VOZES', 'ZEBRA',
  ];

  const conhecida = (p) => PALAVRAS.indexOf(limpar(p)) !== -1;

  /* ---------- contexto: palavras que giram em volta de uma secreta ----------
     As listas vão da mais parecida para a mais distante. A posição da
     palavra na lista vira a nota que aparece na tela.
     ------------------------------------------------------------------ */

  /** palavras comuns que entram no fim de todos os desafios, para quase
      nada ficar sem nota */
  const COMUNS = [
    'CASA', 'PESSOA', 'GENTE', 'COISA', 'LUGAR', 'TEMPO', 'DIA', 'NOITE',
    'AGUA', 'COMIDA', 'MAO', 'OLHO', 'CABECA', 'CORPO', 'RUA', 'CIDADE',
    'CARRO', 'DINHEIRO', 'TRABALHO', 'FAMILIA', 'AMIGO', 'CRIANCA', 'ANIMAL',
    'CACHORRO', 'GATO', 'ARVORE', 'FLOR', 'SOL', 'LUA', 'CEU', 'CHUVA',
    'PEDRA', 'PAPEL', 'PORTA', 'JANELA', 'MESA', 'CADEIRA', 'ROUPA', 'SAPATO',
    'COR', 'NOME', 'PALAVRA', 'NUMERO', 'MUSICA', 'FESTA', 'JOGO', 'BRINQUEDO',
  ];

  const CONTEXTO = [
    {
      palavra: 'ESCOLA',
      dicas: ['Você vai para lá quase todo dia de manhã.', 'Tem sala, quadro e recreio.'],
      tiers: [
        ['COLEGIO', 'AULA', 'SALA', 'PROFESSOR', 'ALUNO', 'ESTUDO'],
        ['CADERNO', 'LICAO', 'PROVA', 'MOCHILA', 'RECREIO', 'TURMA', 'MATERIA', 'QUADRO'],
        ['LIVRO', 'LAPIS', 'BORRACHA', 'CANETA', 'NOTA', 'BOLETIM', 'DIRETORA', 'UNIFORME'],
        ['UNIVERSIDADE', 'CRECHE', 'BIBLIOTECA', 'MERENDA', 'ONIBUS', 'PATIO', 'TAREFA', 'FERIAS'],
        ['APRENDER', 'ENSINAR', 'LER', 'ESCREVER', 'MATEMATICA', 'PORTUGUES', 'HISTORIA', 'CIENCIAS'],
      ],
    },
    {
      palavra: 'PRAIA',
      dicas: ['Tem areia embaixo dos pés.', 'Vai e volta o dia inteiro, mas nunca sai do lugar.'],
      tiers: [
        ['MAR', 'AREIA', 'ONDA', 'OCEANO', 'BEIRA', 'LITORAL'],
        ['SOL', 'BIQUINI', 'GUARDASOL', 'BRONZEADO', 'MERGULHO', 'BOIA', 'CONCHA', 'MARE'],
        ['PEIXE', 'BARCO', 'CARANGUEJO', 'COQUEIRO', 'CASTELO', 'PICOLE', 'TOALHA', 'CHINELO'],
        ['VERAO', 'FERIAS', 'VIAGEM', 'CALOR', 'AGUA', 'SAL', 'VENTO', 'GAIVOTA'],
        ['PISCINA', 'RIO', 'LAGO', 'CACHOEIRA', 'NADAR', 'SURFE', 'PESCA', 'ILHA'],
      ],
    },
    {
      palavra: 'CACHORRO',
      dicas: ['Ele abana o rabo quando você chega.', 'Late.'],
      tiers: [
        ['CAO', 'FILHOTE', 'LATIDO', 'VIRALATA', 'DOG', 'CACHORRINHO'],
        ['GATO', 'COLEIRA', 'OSSO', 'PATA', 'RABO', 'FOCINHO', 'RACAO', 'PASSEIO'],
        ['BICHO', 'ANIMAL', 'PET', 'DONO', 'VETERINARIO', 'CASINHA', 'BANHO', 'LATIR'],
        ['COELHO', 'HAMSTER', 'PASSARO', 'PEIXE', 'TARTARUGA', 'CAVALO', 'VACA', 'PORCO'],
        ['AMIGO', 'CARINHO', 'BRINCAR', 'CORRER', 'MORDER', 'PELO', 'ORELHA', 'LINGUA'],
      ],
    },
    {
      palavra: 'CHOCOLATE',
      dicas: ['Derrete na mão.', 'Vem em barra e também em ovo, uma vez por ano.'],
      tiers: [
        ['DOCE', 'BOMBOM', 'BARRA', 'CACAU', 'BRIGADEIRO', 'TRUFA'],
        ['ACUCAR', 'BOLO', 'SORVETE', 'BISCOITO', 'LEITE', 'RECHEIO', 'CALDA', 'MOUSSE'],
        ['PASCOA', 'OVO', 'COELHO', 'PRESENTE', 'SOBREMESA', 'GULOSEIMA', 'BALA', 'PIRULITO'],
        ['CAFE', 'AMARGO', 'BRANCO', 'MEIOAMARGO', 'DERRETER', 'GELADEIRA', 'FORNO', 'RECEITA'],
        ['COMIDA', 'LANCHE', 'FOME', 'GOSTOSO', 'SABOR', 'FRUTA', 'MORANGO', 'BANANA'],
      ],
    },
    {
      palavra: 'MUSICA',
      dicas: ['Entra pelo ouvido.', 'Tem letra, mas não se lê.'],
      tiers: [
        ['CANCAO', 'SOM', 'MELODIA', 'CANTAR', 'RITMO', 'HARMONIA'],
        ['VIOLAO', 'PIANO', 'GUITARRA', 'BATERIA', 'FLAUTA', 'INSTRUMENTO', 'BANDA', 'CANTOR'],
        ['LETRA', 'REFRAO', 'NOTA', 'PARTITURA', 'ALBUM', 'PLAYLIST', 'FONE', 'RADIO'],
        ['DANCA', 'SHOW', 'PALCO', 'MICROFONE', 'CAIXA', 'VOLUME', 'ENSAIO', 'CORO'],
        ['ARTE', 'SAMBA', 'ROCK', 'FUNK', 'SERTANEJO', 'CLASSICA', 'ORQUESTRA', 'MAESTRO'],
      ],
    },
    {
      palavra: 'INVERNO',
      dicas: ['A estação em que a gente puxa o cobertor.', 'Junho, julho e agosto por aqui.'],
      tiers: [
        ['FRIO', 'ESTACAO', 'GELADO', 'NEVE', 'GELO', 'TEMPERATURA'],
        ['CASACO', 'COBERTOR', 'MEIA', 'CACHECOL', 'LUVA', 'TOUCA', 'BLUSA', 'LAREIRA'],
        ['VERAO', 'OUTONO', 'PRIMAVERA', 'CHUVA', 'VENTO', 'NEBLINA', 'GEADA', 'NUVEM'],
        ['SOPA', 'CHOCOLATEQUENTE', 'CHA', 'CAFE', 'FOGUEIRA', 'JUNHO', 'JULHO', 'AGOSTO'],
        ['CLIMA', 'TEMPO', 'SOL', 'CALOR', 'NOITE', 'MANHA', 'MONTANHA', 'SERRA'],
      ],
    },
    {
      palavra: 'BIBLIOTECA',
      dicas: ['Um lugar cheio de histórias emprestadas.', 'Fale baixo lá dentro.'],
      tiers: [
        ['LIVRO', 'LEITURA', 'ESTANTE', 'ACERVO', 'LIVRARIA', 'LER'],
        ['EMPRESTIMO', 'SILENCIO', 'PRATELEIRA', 'BIBLIOTECARIA', 'PAGINA', 'CAPA', 'AUTOR', 'ROMANCE'],
        ['ESCOLA', 'ESTUDO', 'PESQUISA', 'MESA', 'CADEIRA', 'FICHA', 'CATALOGO', 'DICIONARIO'],
        ['HISTORIA', 'CONTO', 'POESIA', 'REVISTA', 'JORNAL', 'GIBI', 'ENCICLOPEDIA', 'MAPA'],
        ['PAPEL', 'PALAVRA', 'LETRA', 'ESCREVER', 'APRENDER', 'PROFESSOR', 'ALUNO', 'PROVA'],
      ],
    },
    {
      palavra: 'FUTEBOL',
      dicas: ['Onze de cada lado.', 'Só o goleiro pode usar a mão.'],
      tiers: [
        ['BOLA', 'GOL', 'JOGO', 'TIME', 'PARTIDA', 'CAMPO'],
        ['GOLEIRO', 'ZAGUEIRO', 'ATACANTE', 'JUIZ', 'TORCIDA', 'ESTADIO', 'CHUTE', 'PENALTI'],
        ['CAMPEONATO', 'COPA', 'TROFEU', 'UNIFORME', 'CHUTEIRA', 'TRAVE', 'REDE', 'CARTAO'],
        ['ESPORTE', 'VOLEI', 'BASQUETE', 'HANDEBOL', 'NATACAO', 'CORRIDA', 'TENIS', 'GINASTICA'],
        ['CORRER', 'GANHAR', 'PERDER', 'EMPATE', 'PONTO', 'TREINO', 'TECNICO', 'JOGADOR'],
      ],
    },
    {
      palavra: 'ANIVERSARIO',
      dicas: ['Uma vez por ano, com vela em cima.', 'Todo mundo canta a mesma música.'],
      tiers: [
        ['FESTA', 'BOLO', 'VELA', 'PARABENS', 'COMEMORACAO', 'IDADE'],
        ['PRESENTE', 'CONVIDADO', 'BALAO', 'DOCE', 'BRIGADEIRO', 'REFRIGERANTE', 'CONVITE', 'SALGADINHO'],
        ['AMIGO', 'FAMILIA', 'FOTO', 'MUSICA', 'DANCA', 'SURPRESA', 'DECORACAO', 'MESA'],
        ['ANO', 'DATA', 'CALENDARIO', 'NASCIMENTO', 'CRESCER', 'DESEJO', 'PEDIDO', 'ABRACO'],
        ['ALEGRIA', 'FELIZ', 'CRIANCA', 'BRINQUEDO', 'CASA', 'TEMPO', 'DIA', 'NOITE'],
      ],
    },
    {
      palavra: 'FLORESTA',
      dicas: ['Verde por todo lado, e alto.', 'A Amazônia é uma delas.'],
      tiers: [
        ['MATA', 'ARVORE', 'SELVA', 'BOSQUE', 'VEGETACAO', 'AMAZONIA'],
        ['FOLHA', 'GALHO', 'TRONCO', 'RAIZ', 'MADEIRA', 'SOMBRA', 'TRILHA', 'CIPO'],
        ['MACACO', 'ONCA', 'PASSARO', 'COBRA', 'INSETO', 'BICHO', 'NINHO', 'PENA'],
        ['NATUREZA', 'MEIOAMBIENTE', 'RIO', 'CACHOEIRA', 'CHUVA', 'TERRA', 'BARRO', 'MUSGO'],
        ['DESMATAMENTO', 'QUEIMADA', 'PRESERVAR', 'PLANTAR', 'PARQUE', 'CAMPO', 'MONTANHA', 'SERRA'],
      ],
    },
    {
      palavra: 'COZINHA',
      dicas: ['O cômodo que cheira melhor.', 'Fogão, pia e geladeira moram aí.'],
      tiers: [
        ['FOGAO', 'PANELA', 'COMIDA', 'COZINHAR', 'GELADEIRA', 'PIA'],
        ['PRATO', 'TALHER', 'GARFO', 'FACA', 'COLHER', 'COPO', 'FORNO', 'FRIGIDEIRA'],
        ['RECEITA', 'TEMPERO', 'SAL', 'OLEO', 'ARROZ', 'FEIJAO', 'MASSA', 'CARNE'],
        ['ALMOCO', 'JANTAR', 'CAFEDAMANHA', 'LANCHE', 'FOME', 'SABOR', 'CHEIRO', 'LOUCA'],
        ['CASA', 'SALA', 'QUARTO', 'BANHEIRO', 'MESA', 'CADEIRA', 'ARMARIO', 'TORNEIRA'],
      ],
    },
    {
      palavra: 'ESTRELA',
      dicas: ['De dia elas continuam lá, você é que não vê.', 'O Sol é uma.'],
      tiers: [
        ['CEU', 'SOL', 'CONSTELACAO', 'BRILHO', 'ASTRO', 'GALAXIA'],
        ['LUA', 'PLANETA', 'UNIVERSO', 'ESPACO', 'COMETA', 'METEORO', 'TELESCOPIO', 'ORBITA'],
        ['NOITE', 'ESCURO', 'LUZ', 'PISCAR', 'CRUZEIRODOSUL', 'VIALACTEA', 'ASTRONAUTA', 'FOGUETE'],
        ['TERRA', 'MARTE', 'SATURNO', 'JUPITER', 'VENUS', 'MERCURIO', 'NETUNO', 'URANO'],
        ['CIENCIA', 'ASTRONOMIA', 'DISTANCIA', 'ANOLUZ', 'GRAVIDADE', 'NUVEM', 'CEUABERTO', 'SONHO'],
      ],
    },
    {
      palavra: 'AMIZADE',
      dicas: ['Não se compra, mas se cuida.', 'Feita de tempo e confiança.'],
      tiers: [
        ['AMIGO', 'COMPANHEIRO', 'COLEGA', 'CONFIANCA', 'CARINHO', 'PARCERIA'],
        ['CONVERSA', 'ABRACO', 'RISADA', 'SEGREDO', 'APOIO', 'LEALDADE', 'RESPEITO', 'CUMPLICIDADE'],
        ['AMOR', 'FAMILIA', 'IRMAO', 'TURMA', 'GRUPO', 'ESCOLA', 'BRINCAR', 'BRIGA'],
        ['SAUDADE', 'PERDAO', 'AJUDA', 'PRESENTE', 'FESTA', 'ENCONTRO', 'MENSAGEM', 'VISITA'],
        ['SENTIMENTO', 'CORACAO', 'ALEGRIA', 'TRISTEZA', 'PESSOA', 'GENTE', 'TEMPO', 'VIDA'],
      ],
    },
    {
      palavra: 'BICICLETA',
      dicas: ['Duas rodas e nenhum motor.', 'O capacete vem junto.'],
      tiers: [
        ['RODA', 'PEDAL', 'GUIDAO', 'BIKE', 'PEDALAR', 'SELIM'],
        ['CAPACETE', 'FREIO', 'CORRENTE', 'CAMPAINHA', 'PNEU', 'CICLOVIA', 'MARCHA', 'CESTINHA'],
        ['PASSEIO', 'PARQUE', 'RUA', 'CALCADA', 'EQUILIBRIO', 'QUEDA', 'JOELHEIRA', 'VELOCIDADE'],
        ['PATINETE', 'SKATE', 'PATINS', 'MOTO', 'CARRO', 'ONIBUS', 'TRANSPORTE', 'CAMINHO'],
        ['ESPORTE', 'EXERCICIO', 'CORRIDA', 'BRINCAR', 'CRIANCA', 'AMIGO', 'SOL', 'TARDE'],
      ],
    },
    {
      palavra: 'HOSPITAL',
      dicas: ['Ninguém quer ficar, mas todo mundo agradece que exista.', 'Cheira a álcool.'],
      tiers: [
        ['MEDICO', 'ENFERMEIRA', 'DOENTE', 'SAUDE', 'CLINICA', 'PACIENTE'],
        ['REMEDIO', 'INJECAO', 'CONSULTA', 'EXAME', 'CIRURGIA', 'AMBULANCIA', 'MACA', 'LEITO'],
        ['FEBRE', 'DOR', 'GRIPE', 'MACHUCADO', 'GESSO', 'CURATIVO', 'VACINA', 'RECEITA'],
        ['FARMACIA', 'DENTISTA', 'POSTO', 'EMERGENCIA', 'PLANTAO', 'JALECO', 'TERMOMETRO', 'SANGUE'],
        ['CORPO', 'CURA', 'CUIDADO', 'DESCANSO', 'CAMA', 'VISITA', 'FAMILIA', 'MEDO'],
      ],
    },
    {
      palavra: 'VIAGEM',
      dicas: ['Começa com a mala aberta em cima da cama.', 'Tem ida e volta.'],
      tiers: [
        ['MALA', 'PASSEIO', 'DESTINO', 'TURISMO', 'VIAJAR', 'ROTEIRO'],
        ['AVIAO', 'ONIBUS', 'CARRO', 'TREM', 'NAVIO', 'AEROPORTO', 'RODOVIARIA', 'PASSAGEM'],
        ['HOTEL', 'POUSADA', 'FERIAS', 'MAPA', 'ESTRADA', 'CAMINHO', 'BAGAGEM', 'FOTO'],
        ['PRAIA', 'MONTANHA', 'CIDADE', 'PAIS', 'EXTERIOR', 'PASSAPORTE', 'SOUVENIR', 'GUIA'],
        ['FAMILIA', 'AMIGO', 'AVENTURA', 'DESCANSO', 'SAUDADE', 'CHEGADA', 'PARTIDA', 'TEMPO'],
      ],
    },
  ];

  /* ---------- teia: dezesseis palavras, quatro grupos ---------- */
  const TEIA = [
    {
      grupos: [
        { titulo: 'Frutas', grad: 'g2', palavras: ['UVA', 'PERA', 'CAJU', 'AMORA'] },
        { titulo: 'Instrumentos', grad: 'g6', palavras: ['VIOLA', 'FLAUTA', 'PIANO', 'CAVAQUINHO'] },
        { titulo: 'Cores', grad: 'g4', palavras: ['ROSA', 'VERDE', 'LILAS', 'CREME'] },
        { titulo: 'Coisas de jardim', grad: 'g8', palavras: ['REGADOR', 'VASO', 'TERRA', 'SEMENTE'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Animais da fazenda', grad: 'g2', palavras: ['VACA', 'PORCO', 'GALINHA', 'CAVALO'] },
        { titulo: 'Peças do xadrez', grad: 'g5', palavras: ['TORRE', 'BISPO', 'PEAO', 'RAINHA'] },
        { titulo: 'Partes da casa', grad: 'g6', palavras: ['SALA', 'COZINHA', 'QUARTO', 'GARAGEM'] },
        { titulo: 'Tipos de chuva', grad: 'g3', palavras: ['GAROA', 'TEMPORAL', 'PANCADA', 'CHUVISCO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Material escolar', grad: 'g4', palavras: ['LAPIS', 'BORRACHA', 'REGUA', 'APONTADOR'] },
        { titulo: 'Planetas', grad: 'g8', palavras: ['MARTE', 'VENUS', 'SATURNO', 'NETUNO'] },
        { titulo: 'Esportes com bola', grad: 'g5', palavras: ['VOLEI', 'BASQUETE', 'TENIS', 'HANDEBOL'] },
        { titulo: 'Vêm em cachos', grad: 'g2', palavras: ['BANANA', 'UVA', 'CHAVE', 'CABELO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Doces de festa', grad: 'g2', palavras: ['BRIGADEIRO', 'BEIJINHO', 'CAJUZINHO', 'OLHODESOGRA'] },
        { titulo: 'Estados do Brasil', grad: 'g6', palavras: ['BAHIA', 'CEARA', 'GOIAS', 'PARANA'] },
        { titulo: 'Bichos de estimação', grad: 'g5', palavras: ['GATO', 'HAMSTER', 'CALOPSITA', 'TARTARUGA'] },
        { titulo: 'Podem ser "de mesa"', grad: 'g3', palavras: ['TENIS', 'JOGO', 'TOALHA', 'VINHO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Meses do ano', grad: 'g4', palavras: ['JANEIRO', 'ABRIL', 'AGOSTO', 'OUTUBRO'] },
        { titulo: 'Partes do corpo', grad: 'g2', palavras: ['JOELHO', 'COTOVELO', 'TORNOZELO', 'OMBRO'] },
        { titulo: 'Matérias da escola', grad: 'g8', palavras: ['HISTORIA', 'QUIMICA', 'FILOSOFIA', 'GEOGRAFIA'] },
        { titulo: 'Também são verbos', grad: 'g5', palavras: ['MARCO', 'CANTO', 'JOGO', 'CONTO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Aves', grad: 'g6', palavras: ['ARARA', 'TUCANO', 'PARDAL', 'BEIJAFLOR'] },
        { titulo: 'Meios de transporte', grad: 'g5', palavras: ['METRO', 'BALSA', 'TELEFERICO', 'PATINETE'] },
        { titulo: 'Sabores de sorvete', grad: 'g2', palavras: ['FLOCOS', 'MORANGO', 'NAPOLITANO', 'PISTACHE'] },
        { titulo: 'Unidades de medida', grad: 'g3', palavras: ['QUILO', 'LITRO', 'GRAMA', 'HORA'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Peças de roupa', grad: 'g4', palavras: ['CALCA', 'MEIA', 'CASACO', 'SAIA'] },
        { titulo: 'Formas', grad: 'g8', palavras: ['CIRCULO', 'LOSANGO', 'TRAPEZIO', 'CUBO'] },
        { titulo: 'Coisas do banheiro', grad: 'g6', palavras: ['SABONETE', 'ESCOVA', 'TOALHA', 'CHUVEIRO'] },
        { titulo: 'Vêm em par', grad: 'g5', palavras: ['SAPATO', 'LUVA', 'OCULOS', 'BRINCO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Bichos do mar', grad: 'g6', palavras: ['POLVO', 'BALEIA', 'TUBARAO', 'ARRAIA'] },
        { titulo: 'Festas do calendário', grad: 'g2', palavras: ['NATAL', 'PASCOA', 'CARNAVAL', 'JUNINA'] },
        { titulo: 'Coisas com folha', grad: 'g5', palavras: ['CADERNO', 'ARVORE', 'ALFACE', 'PORTA'] },
        { titulo: 'Vêm depois de "PONTO DE"', grad: 'g3', palavras: ['ONIBUS', 'VISTA', 'ENCONTRO', 'PARTIDA'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Brincadeiras de rua', grad: 'g4', palavras: ['AMARELINHA', 'PETECA', 'QUEIMADA', 'PULACORDA'] },
        { titulo: 'Continentes', grad: 'g8', palavras: ['EUROPA', 'ASIA', 'AFRICA', 'OCEANIA'] },
        { titulo: 'Objetos redondos', grad: 'g2', palavras: ['MOEDA', 'PIZZA', 'RODA', 'BOTAO'] },
        { titulo: 'Têm ponteiro', grad: 'g5', palavras: ['RELOGIO', 'BUSSOLA', 'BALANCA', 'VELOCIMETRO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Personagens de folclore', grad: 'g6', palavras: ['SACI', 'CURUPIRA', 'IARA', 'BOITATA'] },
        { titulo: 'Verduras e legumes', grad: 'g2', palavras: ['CENOURA', 'BETERRABA', 'ABOBRINHA', 'CHUCHU'] },
        { titulo: 'Sinais de pontuação', grad: 'g8', palavras: ['VIRGULA', 'CRASE', 'TRAVESSAO', 'PARENTESES'] },
        { titulo: 'Podem ser "de ouro"', grad: 'g5', palavras: ['MEDALHA', 'REGRA', 'BOLA', 'CORACAO'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Coisas de cozinha', grad: 'g2', palavras: ['PANELA', 'PENEIRA', 'ESPATULA', 'BATEDEIRA'] },
        { titulo: 'Coisas da praia', grad: 'g6', palavras: ['CARANGUEJO', 'GAIVOTA', 'SIRI', 'CONCHA'] },
        { titulo: 'Instrumentos de percussão', grad: 'g5', palavras: ['TAMBOR', 'PANDEIRO', 'CHOCALHO', 'SURDO'] },
        { titulo: 'Figuras da geometria', grad: 'g8', palavras: ['TRIANGULO', 'QUADRADO', 'ESFERA', 'PIRAMIDE'] },
      ],
    },
    {
      grupos: [
        { titulo: 'Profissões da escola', grad: 'g4', palavras: ['PROFESSOR', 'DIRETORA', 'PORTEIRO', 'MERENDEIRA'] },
        { titulo: 'Aparelhos de casa', grad: 'g6', palavras: ['GELADEIRA', 'ASPIRADOR', 'VENTILADOR', 'MICROONDAS'] },
        { titulo: 'Palavras com "LH"', grad: 'g5', palavras: ['FILHO', 'ORELHA', 'MOLHO', 'TRABALHO'] },
        { titulo: 'Podem ser de dente', grad: 'g2', palavras: ['ESCOVA', 'FIO', 'PASTA', 'FADA'] },
      ],
    },
  ];

  /** escolhe sempre o mesmo item do dia, para todo mundo */
  const doDia = (lista, dia) => lista[((dia % lista.length) + lista.length) % lista.length];

  /* ---------- contas do contexto ---------- */
  /** monta a lista ordenada de um desafio, já com as palavras comuns no fim */
  function ordemDe(desafio) {
    const vistas = new Set([limpar(desafio.palavra)]);
    const fora = [];
    desafio.tiers.forEach((tier) => tier.forEach((p) => {
      const c = limpar(p);
      if (c && !vistas.has(c)) { vistas.add(c); fora.push(c); }
    }));
    COMUNS.forEach((p) => {
      const c = limpar(p);
      if (c && !vistas.has(c)) { vistas.add(c); fora.push(c); }
    });
    return fora;
  }

  /**
   * Nota do palpite: 1 é a palavra secreta, 2 é a mais próxima e assim por
   * diante. Devolve `null` quando a palavra não está no campo do desafio.
   */
  function notaContexto(desafio, palpite) {
    const alvo = limpar(desafio.palavra);
    const c = limpar(palpite);
    if (!c) return null;
    if (c === alvo) return 1;
    const pos = ordemDe(desafio).indexOf(c);
    return pos === -1 ? null : pos + 2;
  }

  const totalContexto = (desafio) => ordemDe(desafio).length + 1;

  /* ---------- contas da palavrinha ---------- */
  /**
   * Compara o palpite com a resposta e devolve o estado de cada letra:
   * 'certa' (letra e lugar), 'quase' (a letra existe em outro lugar) e
   * 'fora'. Letra repetida só marca "quase" enquanto sobrar na resposta.
   */
  function conferir(palpite, resposta) {
    const p = limpar(palpite).split('');
    const r = limpar(resposta).split('');
    const saida = p.map(() => 'fora');
    const sobra = {};

    p.forEach((letra, i) => {
      if (letra === r[i]) saida[i] = 'certa';
      else sobra[r[i]] = (sobra[r[i]] || 0) + 1;
    });
    p.forEach((letra, i) => {
      if (saida[i] === 'certa') return;
      if (sobra[letra] > 0) { saida[i] = 'quase'; sobra[letra] -= 1; }
    });
    return saida;
  }

  /** junta o que já se sabe de cada letra depois de várias tentativas */
  function tecladoDe(tentativas, resposta) {
    const mapa = {};
    const peso = { fora: 1, quase: 2, certa: 3 };
    tentativas.forEach((t) => {
      const estados = conferir(t, resposta);
      limpar(t).split('').forEach((letra, i) => {
        if (!mapa[letra] || peso[estados[i]] > peso[mapa[letra]]) mapa[letra] = estados[i];
      });
    });
    return mapa;
  }

  return {
    limpar, conhecida, doDia,
    PALAVRAS, CONTEXTO, TEIA, COMUNS,
    conferir, tecladoDe,
    notaContexto, totalContexto, ordemDe,
  };
})();

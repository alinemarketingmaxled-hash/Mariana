/* =========================================================
   bank.js: banco de conteúdo escolar do ensino fundamental II.
   Cada matéria tem tópicos e cada tópico tem questões com a
   resposta curta e quatro alternativas, para servir tanto às
   provas de múltipla escolha quanto às discursivas.
   ========================================================= */
const Banco = (() => {
  /** as matérias agrupadas por área, do jeito que a escola separa */
  const AREAS = [
    { id: 'linguagens', label: 'Linguagens', materias: ['portugues', 'literatura', 'redacao', 'ingles', 'espanhol', 'artes', 'edfisica'] },
    { id: 'matematica', label: 'Matemática', materias: ['matematica'] },
    { id: 'natureza', label: 'Ciências da Natureza', materias: ['ciencias', 'biologia', 'fisica', 'quimica'] },
    { id: 'humanas', label: 'Ciências Humanas', materias: ['historia', 'geografia', 'filosofia', 'sociologia'] },
  ];

  const MATERIAS = [
    {
      id: 'portugues', label: 'Português', icon: 'book', grad: 'g5',
      topicos: [
        {
          id: 'classes', label: 'Classes de palavras',
          questoes: [
            { q: 'Qual classe de palavra dá nome aos seres e às coisas?', a: 'Substantivo',
              opts: ['Substantivo', 'Adjetivo', 'Advérbio', 'Preposição'] },
            { q: 'Em "menina esperta", qual é o adjetivo?', a: 'Esperta',
              opts: ['Esperta', 'Menina', 'Nenhum', 'Os dois'] },
            { q: 'Qual classe indica ação, estado ou fenômeno?', a: 'Verbo',
              opts: ['Verbo', 'Numeral', 'Artigo', 'Interjeição'] },
            { q: 'Em "ele correu rapidamente", o que é "rapidamente"?', a: 'Advérbio',
              opts: ['Advérbio', 'Adjetivo', 'Verbo', 'Pronome'] },
            { q: 'Qual palavra é um pronome pessoal?', a: 'Nós',
              opts: ['Nós', 'Casa', 'Correr', 'Bonito'] },
          ],
        },
        {
          id: 'ortografia', label: 'Ortografia e acentuação',
          questoes: [
            { q: 'A palavra "você" é acentuada porque é...', a: 'Oxítona terminada em E',
              opts: ['Oxítona terminada em E', 'Paroxítona', 'Proparoxítona', 'Monossílaba'] },
            { q: 'Toda palavra proparoxítona é acentuada?', a: 'Sim',
              opts: ['Sim', 'Não', 'Só as terminadas em A', 'Só no plural'] },
            { q: 'Qual grafia está certa?', a: 'Exceção',
              opts: ['Exceção', 'Esceção', 'Excessão', 'Ecceção'] },
            { q: 'Quando se usa "mas"?', a: 'Para indicar oposição',
              opts: ['Para indicar oposição', 'Como sinônimo de mais', 'Antes de verbo', 'No plural'] },
            { q: 'Qual palavra tem hiato?', a: 'Saída',
              opts: ['Saída', 'Cadeira', 'Pouco', 'Guerra'] },
          ],
        },
        {
          id: 'sintaxe', label: 'Sujeito, predicado e objetos',
          questoes: [
            { q: 'Em "As crianças brincaram no parque", qual é o sujeito?', a: 'As crianças',
              opts: ['As crianças', 'Brincaram', 'No parque', 'Não há sujeito'] },
            { q: 'O que é o predicado da oração?', a: 'O que se diz do sujeito',
              opts: ['O que se diz do sujeito', 'Quem pratica a ação', 'O adjetivo', 'A pontuação'] },
            { q: 'Objeto direto é o complemento que vem...', a: 'Sem preposição',
              opts: ['Sem preposição', 'Sempre com preposição', 'Antes do sujeito', 'No fim do texto'] },
            { q: 'Em "Choveu muito ontem", o sujeito é...', a: 'Inexistente',
              opts: ['Inexistente', 'Oculto', 'Simples', 'Composto'] },
            { q: 'Em "Ana e Pedro chegaram", o sujeito é...', a: 'Composto',
              opts: ['Composto', 'Simples', 'Oculto', 'Indeterminado'] },
          ],
        },
        {
          id: 'figuras', label: 'Figuras de linguagem',
          questoes: [
            { q: '"Chorei rios de lágrimas" é exemplo de...', a: 'Hipérbole',
              opts: ['Hipérbole', 'Metáfora', 'Ironia', 'Antítese'] },
            { q: 'Comparação sem usar "como" é...', a: 'Metáfora',
              opts: ['Metáfora', 'Símile', 'Metonímia', 'Pleonasmo'] },
            { q: '"O vento sussurrou no meu ouvido" usa...', a: 'Personificação',
              opts: ['Personificação', 'Hipérbole', 'Elipse', 'Antítese'] },
            { q: 'Dizer o contrário do que se pensa, com humor, é...', a: 'Ironia',
              opts: ['Ironia', 'Metáfora', 'Hipérbole', 'Aliteração'] },
            { q: 'Repetir sons parecidos, como "o rato roeu a roupa", é...', a: 'Aliteração',
              opts: ['Aliteração', 'Onomatopeia', 'Antítese', 'Eufemismo'] },
          ],
        },
        {
          id: 'generos', label: 'Gêneros e interpretação',
          questoes: [
            { q: 'Qual gênero tem manchete, lide e é publicado em jornal?', a: 'Notícia',
              opts: ['Notícia', 'Conto', 'Poema', 'Receita'] },
            { q: 'Texto que defende uma opinião com argumentos é...', a: 'Dissertativo-argumentativo',
              opts: ['Dissertativo-argumentativo', 'Narrativo', 'Descritivo', 'Injuntivo'] },
            { q: 'Receita de bolo e manual de instruções são textos...', a: 'Injuntivos',
              opts: ['Injuntivos', 'Narrativos', 'Líricos', 'Expositivos'] },
            { q: 'Numa narrativa, quem conta a história é o...', a: 'Narrador',
              opts: ['Narrador', 'Autor', 'Personagem', 'Leitor'] },
            { q: 'O tema de um texto é...', a: 'O assunto principal',
              opts: ['O assunto principal', 'O título', 'A conclusão', 'O primeiro parágrafo'] },
          ],
        },
      ],
    },
    {
      id: 'matematica', label: 'Matemática', icon: 'brain', grad: 'g4',
      topicos: [
        {
          id: 'operacoes', label: 'Operações e frações',
          questoes: [
            { q: 'Quanto é 3/4 de 40?', a: '30', opts: ['30', '32', '24', '34'] },
            { q: 'Quanto é 1/2 + 1/4?', a: '3/4', opts: ['3/4', '2/6', '1/6', '1/8'] },
            { q: 'Qual é o resultado de 144 ÷ 12?', a: '12', opts: ['12', '14', '11', '16'] },
            { q: 'Qual fração é equivalente a 2/5?', a: '4/10', opts: ['4/10', '2/10', '5/2', '3/5'] },
            { q: 'Quanto é 2³?', a: '8', opts: ['8', '6', '9', '12'] },
          ],
        },
        {
          id: 'porcentagem', label: 'Porcentagem e proporção',
          questoes: [
            { q: 'Quanto é 25% de 200?', a: '50', opts: ['50', '25', '75', '40'] },
            { q: 'Um produto de R$ 80 com 10% de desconto sai por...', a: 'R$ 72', opts: ['R$ 72', 'R$ 70', 'R$ 78', 'R$ 8'] },
            { q: 'Se 4 canetas custam R$ 12, quanto custam 6?', a: 'R$ 18', opts: ['R$ 18', 'R$ 16', 'R$ 20', 'R$ 24'] },
            { q: '0,5 corresponde a qual porcentagem?', a: '50%', opts: ['50%', '5%', '0,5%', '500%'] },
            { q: 'A razão entre 8 e 4 é...', a: '2', opts: ['2', '4', '12', '0,5'] },
          ],
        },
        {
          id: 'algebra', label: 'Álgebra e equações',
          questoes: [
            { q: 'Na equação x + 9 = 15, quanto vale x?', a: '6', opts: ['6', '5', '24', '9'] },
            { q: 'Na equação 3x = 21, quanto vale x?', a: '7', opts: ['7', '18', '24', '63'] },
            { q: 'Na equação 2x + 4 = x + 10, quanto vale x?', a: '6', opts: ['6', '4', '14', '2'] },
            { q: 'Qual é a maior raiz de x² - 5x + 6 = 0?', a: '3', opts: ['3', '2', '5', '6'] },
            { q: 'Se f(x) = 2x + 1, quanto é f(5)?', a: '11', opts: ['11', '10', '12', '7'] },
          ],
        },
        {
          id: 'geometria', label: 'Geometria',
          questoes: [
            { q: 'Qual é a área de um quadrado de lado 6 cm?', a: '36 cm²', opts: ['36 cm²', '24 cm²', '12 cm²', '18 cm²'] },
            { q: 'Qual é o perímetro de um retângulo 5 cm por 3 cm?', a: '16 cm', opts: ['16 cm', '15 cm', '8 cm', '30 cm'] },
            { q: 'A soma dos ângulos internos de um triângulo é...', a: '180 graus', opts: ['180 graus', '90 graus', '360 graus', '270 graus'] },
            { q: 'Num triângulo retângulo de catetos 3 e 4, a hipotenusa é...', a: '5', opts: ['5', '6', '7', '12'] },
            { q: 'Quantas faces tem um cubo?', a: '6', opts: ['6', '4', '8', '12'] },
          ],
        },
        {
          id: 'estatistica', label: 'Estatística e medidas',
          questoes: [
            { q: 'Qual é a média de 4, 6 e 8?', a: '6', opts: ['6', '5', '9', '18'] },
            { q: 'Na sequência 2, 3, 3, 7, qual é a moda?', a: '3', opts: ['3', '2', '7', '15'] },
            { q: 'Quantos centímetros tem 1 metro?', a: '100', opts: ['100', '10', '1000', '50'] },
            { q: 'Quantos gramas tem 1 quilo?', a: '1000', opts: ['1000', '100', '10', '10000'] },
            { q: 'Meia hora tem quantos minutos?', a: '30', opts: ['30', '60', '15', '45'] },
          ],
        },
      ],
    },
    {
      id: 'ciencias', label: 'Ciências', icon: 'leaf', grad: 'g3',
      topicos: [
        {
          id: 'corpo', label: 'Corpo humano',
          questoes: [
            { q: 'Qual órgão bombeia o sangue pelo corpo?', a: 'Coração',
              opts: ['Coração', 'Pulmão', 'Fígado', 'Rim'] },
            { q: 'Onde acontece a troca de gases na respiração?', a: 'Nos alvéolos pulmonares',
              opts: ['Nos alvéolos pulmonares', 'No estômago', 'No coração', 'Nos rins'] },
            { q: 'Qual sistema é responsável por filtrar o sangue e formar a urina?', a: 'Urinário',
              opts: ['Urinário', 'Digestório', 'Nervoso', 'Respiratório'] },
            { q: 'Qual é o maior órgão do corpo humano?', a: 'Pele',
              opts: ['Pele', 'Fígado', 'Intestino', 'Cérebro'] },
            { q: 'A digestão começa em qual parte do corpo?', a: 'Boca',
              opts: ['Boca', 'Estômago', 'Intestino', 'Esôfago'] },
          ],
        },
        {
          id: 'seresvivos', label: 'Células e seres vivos',
          questoes: [
            { q: 'Qual é a unidade básica dos seres vivos?', a: 'Célula',
              opts: ['Célula', 'Átomo', 'Tecido', 'Órgão'] },
            { q: 'Qual parte da célula guarda o material genético?', a: 'Núcleo',
              opts: ['Núcleo', 'Membrana', 'Citoplasma', 'Parede celular'] },
            { q: 'Como se chama o processo em que a planta produz seu alimento?', a: 'Fotossíntese',
              opts: ['Fotossíntese', 'Respiração', 'Digestão', 'Fermentação'] },
            { q: 'Qual gás as plantas absorvem na fotossíntese?', a: 'Gás carbônico',
              opts: ['Gás carbônico', 'Oxigênio', 'Nitrogênio', 'Hidrogênio'] },
            { q: 'Animais que mamam quando filhotes são chamados de...', a: 'Mamíferos',
              opts: ['Mamíferos', 'Répteis', 'Anfíbios', 'Aves'] },
          ],
        },
        {
          id: 'ecologia', label: 'Ecologia e meio ambiente',
          questoes: [
            { q: 'Numa cadeia alimentar, as plantas são...', a: 'Produtoras',
              opts: ['Produtoras', 'Consumidoras', 'Decompositoras', 'Predadoras'] },
            { q: 'Quem decompõe a matéria orgânica no ambiente?', a: 'Fungos e bactérias',
              opts: ['Fungos e bactérias', 'Plantas', 'Aves', 'Peixes'] },
            { q: 'Qual dessas é uma fonte de energia renovável?', a: 'Energia solar',
              opts: ['Energia solar', 'Carvão', 'Petróleo', 'Gás natural'] },
            { q: 'O conjunto de seres vivos e o ambiente onde vivem formam o...', a: 'Ecossistema',
              opts: ['Ecossistema', 'População', 'Bioma isolado', 'Habitat único'] },
            { q: 'Qual bioma brasileiro é conhecido pela maior floresta tropical?', a: 'Amazônia',
              opts: ['Amazônia', 'Cerrado', 'Caatinga', 'Pampa'] },
          ],
        },
        {
          id: 'materia', label: 'Matéria e energia',
          questoes: [
            { q: 'A passagem do estado líquido para o gasoso chama-se...', a: 'Vaporização',
              opts: ['Vaporização', 'Fusão', 'Solidificação', 'Condensação'] },
            { q: 'A água ferve, ao nível do mar, a quantos graus Celsius?', a: '100',
              opts: ['100', '90', '50', '212'] },
            { q: 'Qual é a fórmula química da água?', a: 'H2O',
              opts: ['H2O', 'CO2', 'O2', 'NaCl'] },
            { q: 'Mistura de areia e água é um exemplo de mistura...', a: 'Heterogênea',
              opts: ['Heterogênea', 'Homogênea', 'Pura', 'Simples'] },
            { q: 'A força que puxa os corpos para o centro da Terra é a...', a: 'Gravidade',
              opts: ['Gravidade', 'Fricção', 'Magnética', 'Elástica'] },
          ],
        },
        {
          id: 'universo', label: 'Terra e universo',
          questoes: [
            { q: 'Quanto tempo a Terra leva para dar uma volta em torno do Sol?', a: 'Um ano',
              opts: ['Um ano', 'Um dia', 'Um mês', 'Uma semana'] },
            { q: 'O movimento de rotação da Terra causa...', a: 'O dia e a noite',
              opts: ['O dia e a noite', 'As estações do ano', 'As marés altas apenas', 'Os eclipses'] },
            { q: 'Qual é o satélite natural da Terra?', a: 'Lua',
              opts: ['Lua', 'Marte', 'Vênus', 'Sol'] },
            { q: 'Qual planeta é o mais próximo do Sol?', a: 'Mercúrio',
              opts: ['Mercúrio', 'Vênus', 'Terra', 'Marte'] },
            { q: 'O Sol é uma...', a: 'Estrela',
              opts: ['Estrela', 'Planeta', 'Lua', 'Galáxia'] },
          ],
        },
      ],
    },
    {
      id: 'historia', label: 'História', icon: 'trophy', grad: 'g2',
      topicos: [
        {
          id: 'antiguidade', label: 'Antiguidade',
          questoes: [
            { q: 'Qual rio foi essencial para a civilização egípcia?', a: 'Nilo',
              opts: ['Nilo', 'Tigre', 'Amazonas', 'Ganges'] },
            { q: 'A democracia nasceu em qual cidade da Grécia Antiga?', a: 'Atenas',
              opts: ['Atenas', 'Esparta', 'Roma', 'Tebas'] },
            { q: 'Como se chamava a escrita dos egípcios?', a: 'Hieróglifos',
              opts: ['Hieróglifos', 'Cuneiforme', 'Alfabeto latino', 'Runas'] },
            { q: 'Quem foi o primeiro imperador de Roma?', a: 'Augusto',
              opts: ['Augusto', 'Júlio César', 'Nero', 'Rômulo'] },
            { q: 'As pirâmides do Egito serviam principalmente como...', a: 'Túmulos dos faraós',
              opts: ['Túmulos dos faraós', 'Escolas', 'Mercados', 'Fortalezas'] },
          ],
        },
        {
          id: 'medieval', label: 'Idade Média',
          questoes: [
            { q: 'Qual era a base econômica do feudalismo?', a: 'A terra e a agricultura',
              opts: ['A terra e a agricultura', 'A indústria', 'O comércio marítimo', 'A mineração'] },
            { q: 'Quem trabalhava na terra do senhor feudal?', a: 'Os servos',
              opts: ['Os servos', 'Os nobres', 'Os reis', 'Os mercadores'] },
            { q: 'Qual instituição tinha grande poder na Europa medieval?', a: 'A Igreja Católica',
              opts: ['A Igreja Católica', 'O parlamento', 'As universidades', 'Os bancos'] },
            { q: 'As Cruzadas foram expedições de caráter...', a: 'Religioso e militar',
              opts: ['Religioso e militar', 'Apenas comercial', 'Científico', 'Esportivo'] },
            { q: 'A peste negra atingiu a Europa em qual século?', a: 'Século XIV',
              opts: ['Século XIV', 'Século X', 'Século XVIII', 'Século XX'] },
          ],
        },
        {
          id: 'colonia', label: 'Brasil Colônia',
          questoes: [
            { q: 'Em que ano os portugueses chegaram ao Brasil?', a: '1500',
              opts: ['1500', '1492', '1600', '1822'] },
            { q: 'Qual foi o primeiro produto explorado pelos portugueses no Brasil?', a: 'Pau-brasil',
              opts: ['Pau-brasil', 'Café', 'Ouro', 'Borracha'] },
            { q: 'Qual sistema dividiu o Brasil em faixas de terra doadas a nobres?', a: 'Capitanias hereditárias',
              opts: ['Capitanias hereditárias', 'Sesmarias urbanas', 'Feudos', 'Vice-reinados'] },
            { q: 'Que atividade movimentou a economia de Minas Gerais no século XVIII?', a: 'Mineração de ouro',
              opts: ['Mineração de ouro', 'Cultivo de café', 'Pesca', 'Indústria têxtil'] },
            { q: 'Como se chamavam as comunidades formadas por pessoas escravizadas que fugiam?', a: 'Quilombos',
              opts: ['Quilombos', 'Vilas', 'Aldeias', 'Fortes'] },
          ],
        },
        {
          id: 'imperio', label: 'Independência e Império',
          questoes: [
            { q: 'Em que ano o Brasil se tornou independente?', a: '1822',
              opts: ['1822', '1889', '1500', '1808'] },
            { q: 'Quem proclamou a Independência do Brasil?', a: 'Dom Pedro I',
              opts: ['Dom Pedro I', 'Dom Pedro II', 'Tiradentes', 'Marechal Deodoro'] },
            { q: 'Em que ano foi assinada a Lei Áurea?', a: '1888',
              opts: ['1888', '1822', '1889', '1850'] },
            { q: 'Quem assinou a Lei Áurea?', a: 'Princesa Isabel',
              opts: ['Princesa Isabel', 'Dom Pedro I', 'Dom João VI', 'Duque de Caxias'] },
            { q: 'A vinda da família real portuguesa para o Brasil aconteceu em...', a: '1808',
              opts: ['1808', '1822', '1889', '1500'] },
          ],
        },
        {
          id: 'republica', label: 'República e século XX',
          questoes: [
            { q: 'Em que ano foi proclamada a República no Brasil?', a: '1889',
              opts: ['1889', '1822', '1930', '1888'] },
            { q: 'Quem proclamou a República?', a: 'Marechal Deodoro da Fonseca',
              opts: ['Marechal Deodoro da Fonseca', 'Getúlio Vargas', 'Dom Pedro II', 'Juscelino Kubitschek'] },
            { q: 'Qual presidente construiu Brasília?', a: 'Juscelino Kubitschek',
              opts: ['Juscelino Kubitschek', 'Getúlio Vargas', 'Jânio Quadros', 'Castelo Branco'] },
            { q: 'A ditadura militar no Brasil começou em...', a: '1964',
              opts: ['1964', '1930', '1985', '1889'] },
            { q: 'A Segunda Guerra Mundial terminou em que ano?', a: '1945',
              opts: ['1945', '1918', '1939', '1950'] },
          ],
        },
      ],
    },
    {
      id: 'geografia', label: 'Geografia', icon: 'target', grad: 'g6',
      topicos: [
        {
          id: 'cartografia', label: 'Mapas e orientação',
          questoes: [
            { q: 'As linhas horizontais que cortam o globo são os...', a: 'Paralelos',
              opts: ['Paralelos', 'Meridianos', 'Trópicos apenas', 'Fusos'] },
            { q: 'Qual linha divide a Terra em hemisfério norte e sul?', a: 'Linha do Equador',
              opts: ['Linha do Equador', 'Meridiano de Greenwich', 'Trópico de Câncer', 'Círculo Polar'] },
            { q: 'A escala de um mapa mostra...', a: 'A relação entre o mapa e o tamanho real',
              opts: ['A relação entre o mapa e o tamanho real', 'A altitude', 'A temperatura', 'A população'] },
            { q: 'A rosa dos ventos indica os...', a: 'Pontos cardeais',
              opts: ['Pontos cardeais', 'Rios', 'Climas', 'Relevos'] },
            { q: 'O Sol nasce aproximadamente em qual direção?', a: 'Leste',
              opts: ['Leste', 'Oeste', 'Norte', 'Sul'] },
          ],
        },
        {
          id: 'natureza', label: 'Relevo, clima e vegetação',
          questoes: [
            { q: 'Qual instrumento mede a temperatura do ar?', a: 'Termômetro',
              opts: ['Termômetro', 'Barômetro', 'Pluviômetro', 'Anemômetro'] },
            { q: 'Chuva, temperatura e umidade fazem parte do estudo do...', a: 'Clima',
              opts: ['Clima', 'Relevo', 'Solo', 'Hidrografia'] },
            { q: 'Planalto, planície e depressão são formas de...', a: 'Relevo',
              opts: ['Relevo', 'Clima', 'Vegetação', 'População'] },
            { q: 'Qual bioma brasileiro é típico do sertão nordestino?', a: 'Caatinga',
              opts: ['Caatinga', 'Amazônia', 'Pantanal', 'Mata Atlântica'] },
            { q: 'O desgaste das rochas pela chuva e pelo vento chama-se...', a: 'Erosão',
              opts: ['Erosão', 'Sedimentação', 'Vulcanismo', 'Tectonismo'] },
          ],
        },
        {
          id: 'brasil', label: 'Brasil: regiões e estados',
          questoes: [
            { q: 'Quantas regiões tem o Brasil?', a: '5', opts: ['5', '4', '6', '27'] },
            { q: 'Qual é a capital do Brasil?', a: 'Brasília',
              opts: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'] },
            { q: 'Quantos estados o Brasil possui?', a: '26 estados e o Distrito Federal',
              opts: ['26 estados e o Distrito Federal', '27 estados', '25 estados', '30 estados'] },
            { q: 'Em qual região fica o estado do Amazonas?', a: 'Norte',
              opts: ['Norte', 'Nordeste', 'Sudeste', 'Sul'] },
            { q: 'Qual é o maior rio em volume de água do mundo, no Brasil?', a: 'Rio Amazonas',
              opts: ['Rio Amazonas', 'Rio São Francisco', 'Rio Paraná', 'Rio Tietê'] },
          ],
        },
        {
          id: 'populacao', label: 'População e cidades',
          questoes: [
            { q: 'O movimento de pessoas do campo para a cidade chama-se...', a: 'Êxodo rural',
              opts: ['Êxodo rural', 'Imigração', 'Urbanização natural', 'Nomadismo'] },
            { q: 'O crescimento das cidades é chamado de...', a: 'Urbanização',
              opts: ['Urbanização', 'Industrialização', 'Globalização', 'Migração pendular'] },
            { q: 'A quantidade de pessoas por quilômetro quadrado é a...', a: 'Densidade demográfica',
              opts: ['Densidade demográfica', 'Taxa de natalidade', 'Expectativa de vida', 'Renda per capita'] },
            { q: 'Qual órgão faz o censo da população brasileira?', a: 'IBGE',
              opts: ['IBGE', 'INSS', 'IBAMA', 'INEP'] },
            { q: 'Pessoas que saem do país para morar em outro são...', a: 'Emigrantes',
              opts: ['Emigrantes', 'Imigrantes', 'Turistas', 'Refugiados apenas'] },
          ],
        },
      ],
    },
    {
      id: 'ingles', label: 'Inglês', icon: 'chat', grad: 'g1',
      topicos: [
        {
          id: 'tobe', label: 'Verbo to be e pronomes',
          questoes: [
            { q: 'Complete: I ___ a student.', a: 'am', opts: ['am', 'is', 'are', 'be'] },
            { q: 'Complete: She ___ my sister.', a: 'is', opts: ['is', 'am', 'are', 'do'] },
            { q: 'Qual é o plural de "child"?', a: 'children', opts: ['children', 'childs', 'childes', 'child'] },
            { q: 'Qual pronome substitui "my brother"?', a: 'he', opts: ['he', 'she', 'it', 'they'] },
            { q: 'Como se diz "nós somos amigos"?', a: 'We are friends',
              opts: ['We are friends', 'We is friends', 'They are friends', 'You are friends'] },
          ],
        },
        {
          id: 'tempos', label: 'Presente e passado',
          questoes: [
            { q: 'Complete: He ___ soccer every Sunday.', a: 'plays', opts: ['plays', 'play', 'playing', 'played'] },
            { q: 'Qual é o passado de "go"?', a: 'went', opts: ['went', 'goed', 'gone', 'going'] },
            { q: 'Complete: They ___ studying now.', a: 'are', opts: ['are', 'is', 'am', 'be'] },
            { q: 'Qual é o passado de "eat"?', a: 'ate', opts: ['ate', 'eated', 'eaten', 'eating'] },
            { q: 'Como se pergunta "você gosta de música?"', a: 'Do you like music?',
              opts: ['Do you like music?', 'You like music?', 'Does you like music?', 'Are you like music?'] },
          ],
        },
        {
          id: 'vocabulario', label: 'Vocabulário do dia a dia',
          questoes: [
            { q: 'O que significa "breakfast"?', a: 'Café da manhã',
              opts: ['Café da manhã', 'Almoço', 'Jantar', 'Lanche da tarde'] },
            { q: 'Como se diz "quarta-feira" em inglês?', a: 'Wednesday',
              opts: ['Wednesday', 'Tuesday', 'Thursday', 'Saturday'] },
            { q: 'O que significa "homework"?', a: 'Lição de casa',
              opts: ['Lição de casa', 'Trabalho em casa', 'Casa nova', 'Sala de aula'] },
            { q: 'Como se diz "vinte" em inglês?', a: 'twenty',
              opts: ['twenty', 'twelve', 'ten', 'two'] },
            { q: 'O que significa "library"?', a: 'Biblioteca',
              opts: ['Biblioteca', 'Livraria', 'Liberdade', 'Escritório'] },
          ],
        },
      ],
    },
    {
      id: 'literatura', label: 'Literatura', icon: 'book', grad: 'g2',
      topicos: [
        {
          id: 'generos', label: 'Gêneros literários',
          questoes: [
            { q: 'Qual gênero literário é escrito em versos?', a: 'Lírico',
              opts: ['Lírico', 'Narrativo', 'Dramático', 'Dissertativo'] },
            { q: 'Romance, conto e crônica pertencem a qual gênero?', a: 'Narrativo',
              opts: ['Narrativo', 'Lírico', 'Dramático', 'Épico'] },
            { q: 'Qual gênero foi feito para ser encenado?', a: 'Dramático',
              opts: ['Dramático', 'Lírico', 'Narrativo', 'Epistolar'] },
            { q: 'Como se chama o conjunto de versos de um poema?', a: 'Estrofe',
              opts: ['Estrofe', 'Parágrafo', 'Capítulo', 'Ato'] },
            { q: 'Qual texto narrativo é mais curto e tem poucos personagens?', a: 'Conto',
              opts: ['Conto', 'Romance', 'Novela', 'Epopeia'] },
          ],
        },
        {
          id: 'escolas', label: 'Escolas literárias',
          questoes: [
            { q: 'Qual movimento valorizava a emoção, a natureza e o amor idealizado?', a: 'Romantismo',
              opts: ['Romantismo', 'Realismo', 'Barroco', 'Modernismo'] },
            { q: 'Qual escola criticava a sociedade com olhar analítico e objetivo?', a: 'Realismo',
              opts: ['Realismo', 'Romantismo', 'Arcadismo', 'Simbolismo'] },
            { q: 'Quem escreveu "Dom Casmurro"?', a: 'Machado de Assis',
              opts: ['Machado de Assis', 'José de Alencar', 'Carlos Drummond', 'Clarice Lispector'] },
            { q: 'A Semana de Arte Moderna de 1922 marcou o início de qual movimento no Brasil?', a: 'Modernismo',
              opts: ['Modernismo', 'Realismo', 'Romantismo', 'Parnasianismo'] },
            { q: 'Qual estilo usa contrastes como céu e terra, corpo e alma?', a: 'Barroco',
              opts: ['Barroco', 'Arcadismo', 'Realismo', 'Modernismo'] },
          ],
        },
        {
          id: 'analise', label: 'Análise de texto',
          questoes: [
            { q: 'Quem conta a história em um texto narrativo?', a: 'Narrador',
              opts: ['Narrador', 'Autor', 'Protagonista', 'Leitor'] },
            { q: 'Como se chama o personagem principal?', a: 'Protagonista',
              opts: ['Protagonista', 'Antagonista', 'Coadjuvante', 'Narrador'] },
            { q: 'O que é o enredo de uma história?', a: 'A sequência dos acontecimentos',
              opts: ['A sequência dos acontecimentos', 'O lugar da história', 'O tempo da história', 'A opinião do autor'] },
            { q: 'Quando o narrador participa da história, ele é narrador de que pessoa?', a: 'Primeira pessoa',
              opts: ['Primeira pessoa', 'Terceira pessoa', 'Segunda pessoa', 'Nenhuma'] },
            { q: 'O que é o clímax de uma narrativa?', a: 'O momento de maior tensão',
              opts: ['O momento de maior tensão', 'O começo', 'A apresentação', 'A conclusão'] },
          ],
        },
      ],
    },
    {
      id: 'redacao', label: 'Redação', icon: 'pencil', grad: 'g5',
      topicos: [
        {
          id: 'estrutura', label: 'Estrutura do texto',
          questoes: [
            { q: 'Quais são as três partes de uma redação dissertativa?', a: 'Introdução, desenvolvimento e conclusão',
              opts: ['Introdução, desenvolvimento e conclusão', 'Título, meio e fim', 'Tese, verso e prosa', 'Começo, clímax e desfecho'] },
            { q: 'Em qual parte aparece a tese, a ideia que será defendida?', a: 'Introdução',
              opts: ['Introdução', 'Desenvolvimento', 'Conclusão', 'Título'] },
            { q: 'O que deve aparecer na conclusão de um texto dissertativo?', a: 'A retomada da tese e a proposta',
              opts: ['A retomada da tese e a proposta', 'Um assunto novo', 'Uma pergunta sem resposta', 'A biografia do autor'] },
            { q: 'Qual é a função dos parágrafos de desenvolvimento?', a: 'Apresentar argumentos',
              opts: ['Apresentar argumentos', 'Repetir a introdução', 'Contar uma piada', 'Listar o título'] },
            { q: 'Um bom argumento se apoia principalmente em quê?', a: 'Dados e exemplos',
              opts: ['Dados e exemplos', 'Opinião sem base', 'Palavras difíceis', 'Frases prontas'] },
          ],
        },
        {
          id: 'tipos', label: 'Tipos de texto',
          questoes: [
            { q: 'Que tipo de texto defende um ponto de vista?', a: 'Dissertativo-argumentativo',
              opts: ['Dissertativo-argumentativo', 'Narrativo', 'Descritivo', 'Injuntivo'] },
            { q: 'Que tipo de texto conta uma história com personagens e tempo?', a: 'Narrativo',
              opts: ['Narrativo', 'Dissertativo', 'Descritivo', 'Expositivo'] },
            { q: 'Uma receita de bolo é um texto de que tipo?', a: 'Injuntivo',
              opts: ['Injuntivo', 'Narrativo', 'Argumentativo', 'Lírico'] },
            { q: 'Que tipo de texto detalha como algo ou alguém é?', a: 'Descritivo',
              opts: ['Descritivo', 'Narrativo', 'Injuntivo', 'Dissertativo'] },
            { q: 'Uma carta de leitor enviada a um jornal tem qual objetivo principal?', a: 'Opinar sobre um assunto',
              opts: ['Opinar sobre um assunto', 'Contar uma história', 'Ensinar um passo a passo', 'Descrever uma paisagem'] },
          ],
        },
        {
          id: 'coesao', label: 'Coesão e coerência',
          questoes: [
            { q: 'O que é coesão em um texto?', a: 'A ligação entre as partes do texto',
              opts: ['A ligação entre as partes do texto', 'O tamanho dos parágrafos', 'A letra bonita', 'O número de linhas'] },
            { q: 'O que é coerência?', a: 'O sentido lógico das ideias',
              opts: ['O sentido lógico das ideias', 'A pontuação correta', 'A margem da folha', 'A quantidade de palavras'] },
            { q: 'Qual conectivo indica oposição?', a: 'Entretanto',
              opts: ['Entretanto', 'Portanto', 'Além disso', 'Assim'] },
            { q: 'Qual conectivo indica conclusão?', a: 'Portanto',
              opts: ['Portanto', 'Porém', 'Embora', 'Também'] },
            { q: 'Repetir a mesma palavra muitas vezes é um problema de quê?', a: 'Coesão',
              opts: ['Coesão', 'Ortografia', 'Acentuação', 'Caligrafia'] },
          ],
        },
      ],
    },
    {
      id: 'filosofia', label: 'Filosofia', icon: 'brain', grad: 'g1',
      topicos: [
        {
          id: 'origem', label: 'Origem da filosofia',
          questoes: [
            { q: 'Em qual país nasceu a filosofia ocidental?', a: 'Grécia',
              opts: ['Grécia', 'Egito', 'Roma', 'Pérsia'] },
            { q: 'Quem disse "só sei que nada sei"?', a: 'Sócrates',
              opts: ['Sócrates', 'Platão', 'Aristóteles', 'Tales'] },
            { q: 'Quem escreveu o mito da caverna?', a: 'Platão',
              opts: ['Platão', 'Sócrates', 'Aristóteles', 'Epicuro'] },
            { q: 'Quem foi o filósofo que criou a lógica e foi mestre de Alexandre?', a: 'Aristóteles',
              opts: ['Aristóteles', 'Platão', 'Sócrates', 'Heráclito'] },
            { q: 'O que significa a palavra filosofia?', a: 'Amor à sabedoria',
              opts: ['Amor à sabedoria', 'Estudo dos astros', 'Ciência dos números', 'Arte de falar'] },
          ],
        },
        {
          id: 'etica', label: 'Ética e moral',
          questoes: [
            { q: 'O que a ética estuda?', a: 'Os princípios que orientam a conduta',
              opts: ['Os princípios que orientam a conduta', 'As leis da física', 'A origem das palavras', 'Os astros'] },
            { q: 'Qual a diferença entre moral e ética?', a: 'Moral são os costumes, ética é a reflexão sobre eles',
              opts: ['Moral são os costumes, ética é a reflexão sobre eles', 'São a mesma coisa', 'Ética é lei, moral é crime', 'Moral é religiosa, ética é científica'] },
            { q: 'Para Kant, uma ação é boa quando é feita por quê?', a: 'Por dever',
              opts: ['Por dever', 'Por medo', 'Por interesse', 'Por costume'] },
            { q: 'O que é autonomia moral?', a: 'Decidir com base na própria razão',
              opts: ['Decidir com base na própria razão', 'Obedecer sem pensar', 'Seguir a maioria', 'Fugir da escolha'] },
            { q: 'Qual filósofo defendeu que o ser humano é livre e responsável por suas escolhas?', a: 'Sartre',
              opts: ['Sartre', 'Descartes', 'Tales', 'Pitágoras'] },
          ],
        },
        {
          id: 'conhecimento', label: 'Conhecimento e verdade',
          questoes: [
            { q: 'Quem disse "penso, logo existo"?', a: 'Descartes',
              opts: ['Descartes', 'Sócrates', 'Kant', 'Locke'] },
            { q: 'Como se chama a corrente que diz que o conhecimento vem da experiência?', a: 'Empirismo',
              opts: ['Empirismo', 'Racionalismo', 'Ceticismo', 'Idealismo'] },
            { q: 'Como se chama a corrente que valoriza a razão como fonte do conhecimento?', a: 'Racionalismo',
              opts: ['Racionalismo', 'Empirismo', 'Materialismo', 'Estoicismo'] },
            { q: 'O que é senso comum?', a: 'O conhecimento do dia a dia, sem análise crítica',
              opts: ['O conhecimento do dia a dia, sem análise crítica', 'O conhecimento científico', 'A opinião dos filósofos', 'Uma lei natural'] },
            { q: 'Qual método usa perguntas para fazer a pessoa pensar por si mesma?', a: 'Maiêutica',
              opts: ['Maiêutica', 'Dialética hegeliana', 'Indução', 'Dedução'] },
          ],
        },
      ],
    },
    {
      id: 'sociologia', label: 'Sociologia', icon: 'heart', grad: 'g3',
      topicos: [
        {
          id: 'sociedade', label: 'Sociedade e cultura',
          questoes: [
            { q: 'O que a sociologia estuda?', a: 'A sociedade e as relações entre as pessoas',
              opts: ['A sociedade e as relações entre as pessoas', 'Os astros', 'As plantas', 'Os números'] },
            { q: 'O que é cultura?', a: 'O conjunto de costumes, crenças e saberes de um povo',
              opts: ['O conjunto de costumes, crenças e saberes de um povo', 'Só a arte erudita', 'A economia de um país', 'O clima de uma região'] },
            { q: 'Como se chama julgar outra cultura pelos valores da sua?', a: 'Etnocentrismo',
              opts: ['Etnocentrismo', 'Relativismo', 'Xenofilia', 'Pluralismo'] },
            { q: 'Como se chama o processo de aprender as regras da sociedade desde criança?', a: 'Socialização',
              opts: ['Socialização', 'Urbanização', 'Globalização', 'Estratificação'] },
            { q: 'Família, escola e igreja são exemplos de quê?', a: 'Instituições sociais',
              opts: ['Instituições sociais', 'Classes sociais', 'Movimentos sociais', 'Partidos políticos'] },
          ],
        },
        {
          id: 'trabalho', label: 'Trabalho e desigualdade',
          questoes: [
            { q: 'Qual pensador analisou a luta de classes entre burguesia e proletariado?', a: 'Karl Marx',
              opts: ['Karl Marx', 'Durkheim', 'Weber', 'Comte'] },
            { q: 'O que é desigualdade social?', a: 'A diferença de acesso a bens e oportunidades',
              opts: ['A diferença de acesso a bens e oportunidades', 'A diferença de altura', 'A diversidade cultural', 'A troca de mercadorias'] },
            { q: 'Como se chama a divisão da sociedade em camadas?', a: 'Estratificação social',
              opts: ['Estratificação social', 'Mobilidade urbana', 'Globalização', 'Socialização'] },
            { q: 'O trabalho em linha de montagem, repetitivo e cronometrado, ficou conhecido como o quê?', a: 'Fordismo',
              opts: ['Fordismo', 'Artesanato', 'Cooperativismo', 'Feudalismo'] },
            { q: 'O que é trabalho informal?', a: 'Trabalho sem registro e sem direitos garantidos',
              opts: ['Trabalho sem registro e sem direitos garantidos', 'Trabalho com carteira assinada', 'Trabalho voluntário', 'Trabalho público'] },
          ],
        },
        {
          id: 'cidadania', label: 'Cidadania e direitos',
          questoes: [
            { q: 'O que é cidadania?', a: 'O exercício de direitos e deveres na sociedade',
              opts: ['O exercício de direitos e deveres na sociedade', 'Ter documento de identidade', 'Morar na cidade', 'Pagar imposto'] },
            { q: 'Qual documento brasileiro garante os direitos de crianças e adolescentes?', a: 'ECA',
              opts: ['ECA', 'CLT', 'Código Civil', 'Código Penal'] },
            { q: 'Em que ano foi promulgada a Constituição brasileira em vigor?', a: '1988',
              opts: ['1988', '1964', '1946', '2000'] },
            { q: 'Como se chama a organização de pessoas para reivindicar direitos?', a: 'Movimento social',
              opts: ['Movimento social', 'Empresa', 'Sindicato patronal', 'Instituição religiosa'] },
            { q: 'Saúde, educação e moradia são exemplos de que tipo de direito?', a: 'Direitos sociais',
              opts: ['Direitos sociais', 'Direitos políticos', 'Direitos civis', 'Deveres fiscais'] },
          ],
        },
      ],
    },
    {
      id: 'artes', label: 'Artes', icon: 'star', grad: 'g2',
      topicos: [
        {
          id: 'elementos', label: 'Elementos visuais',
          questoes: [
            { q: 'Quais são as três cores primárias na pintura?', a: 'Vermelho, azul e amarelo',
              opts: ['Vermelho, azul e amarelo', 'Verde, laranja e roxo', 'Preto, branco e cinza', 'Rosa, ciano e bege'] },
            { q: 'Qual cor se forma misturando azul e amarelo?', a: 'Verde',
              opts: ['Verde', 'Roxo', 'Laranja', 'Marrom'] },
            { q: 'Como se chamam as cores opostas no círculo cromático?', a: 'Complementares',
              opts: ['Complementares', 'Análogas', 'Neutras', 'Quentes'] },
            { q: 'Vermelho, laranja e amarelo são cores de que tipo?', a: 'Quentes',
              opts: ['Quentes', 'Frias', 'Neutras', 'Primárias'] },
            { q: 'Qual elemento da arte cria a sensação de profundidade em um desenho?', a: 'Perspectiva',
              opts: ['Perspectiva', 'Textura', 'Ritmo', 'Simetria'] },
          ],
        },
        {
          id: 'historia-arte', label: 'História da arte',
          questoes: [
            { q: 'Quem pintou a Mona Lisa?', a: 'Leonardo da Vinci',
              opts: ['Leonardo da Vinci', 'Michelangelo', 'Van Gogh', 'Picasso'] },
            { q: 'Quem pintou "Abaporu", símbolo do modernismo brasileiro?', a: 'Tarsila do Amaral',
              opts: ['Tarsila do Amaral', 'Anita Malfatti', 'Portinari', 'Di Cavalcanti'] },
            { q: 'Qual movimento decompôs as formas em figuras geométricas?', a: 'Cubismo',
              opts: ['Cubismo', 'Impressionismo', 'Barroco', 'Surrealismo'] },
            { q: 'Qual movimento pintava a luz e o momento, com pinceladas soltas?', a: 'Impressionismo',
              opts: ['Impressionismo', 'Realismo', 'Cubismo', 'Renascimento'] },
            { q: 'Quem foi o escultor brasileiro do período barroco em Minas Gerais?', a: 'Aleijadinho',
              opts: ['Aleijadinho', 'Portinari', 'Niemeyer', 'Volpi'] },
          ],
        },
        {
          id: 'musica-teatro', label: 'Música e teatro',
          questoes: [
            { q: 'Quantas notas musicais formam a escala básica?', a: 'Sete',
              opts: ['Sete', 'Cinco', 'Oito', 'Doze'] },
            { q: 'O que é ritmo na música?', a: 'A organização dos sons no tempo',
              opts: ['A organização dos sons no tempo', 'A altura das notas', 'O volume do som', 'O timbre do instrumento'] },
            { q: 'Como se chama o texto que o ator segue no teatro?', a: 'Roteiro',
              opts: ['Roteiro', 'Partitura', 'Ensaio', 'Cenário'] },
            { q: 'Quem organiza e comanda a montagem de uma peça de teatro?', a: 'Diretor',
              opts: ['Diretor', 'Figurinista', 'Cenógrafo', 'Público'] },
            { q: 'Qual ritmo brasileiro nasceu no Rio de Janeiro e virou símbolo do carnaval?', a: 'Samba',
              opts: ['Samba', 'Frevo', 'Baião', 'Maracatu'] },
          ],
        },
      ],
    },
    {
      id: 'edfisica', label: 'Educação Física', icon: 'dumbbell', grad: 'g6',
      topicos: [
        {
          id: 'esportes', label: 'Esportes e regras',
          questoes: [
            { q: 'Quantos jogadores em quadra tem um time de vôlei?', a: 'Seis',
              opts: ['Seis', 'Cinco', 'Sete', 'Onze'] },
            { q: 'Quantos jogadores tem um time de basquete em quadra?', a: 'Cinco',
              opts: ['Cinco', 'Seis', 'Sete', 'Quatro'] },
            { q: 'Quantos jogadores um time de futebol de campo tem em jogo?', a: 'Onze',
              opts: ['Onze', 'Dez', 'Doze', 'Nove'] },
            { q: 'No handebol, quantos jogadores ficam em quadra por time?', a: 'Sete',
              opts: ['Sete', 'Seis', 'Cinco', 'Oito'] },
            { q: 'De quantos em quantos anos acontecem os Jogos Olímpicos de verão?', a: 'Quatro anos',
              opts: ['Quatro anos', 'Dois anos', 'Três anos', 'Cinco anos'] },
          ],
        },
        {
          id: 'corpo-saude', label: 'Corpo e saúde',
          questoes: [
            { q: 'Qual exercício melhora principalmente o fôlego e o coração?', a: 'Aeróbico',
              opts: ['Aeróbico', 'Isométrico', 'De força máxima', 'De flexibilidade'] },
            { q: 'Para que serve o aquecimento antes da atividade física?', a: 'Preparar o corpo e evitar lesões',
              opts: ['Preparar o corpo e evitar lesões', 'Cansar antes do jogo', 'Perder peso na hora', 'Aumentar a altura'] },
            { q: 'Qual nutriente é a principal fonte de energia rápida?', a: 'Carboidrato',
              opts: ['Carboidrato', 'Proteína', 'Vitamina', 'Água'] },
            { q: 'O que o alongamento melhora?', a: 'A flexibilidade',
              opts: ['A flexibilidade', 'A força máxima', 'A memória', 'A visão'] },
            { q: 'Quantos minutos de atividade física por dia a OMS recomenda para adolescentes?', a: '60 minutos',
              opts: ['60 minutos', '10 minutos', '150 minutos', '240 minutos'] },
          ],
        },
        {
          id: 'jogos-cultura', label: 'Jogos e cultura corporal',
          questoes: [
            { q: 'Qual manifestação brasileira mistura luta, dança e música?', a: 'Capoeira',
              opts: ['Capoeira', 'Judô', 'Balé', 'Ginástica'] },
            { q: 'Qual a diferença entre jogo e esporte?', a: 'O esporte tem regras oficiais e competição formal',
              opts: ['O esporte tem regras oficiais e competição formal', 'O jogo é mais difícil', 'O esporte não tem regras', 'Não existe diferença'] },
            { q: 'Amarelinha, pega-pega e queimada são exemplos de quê?', a: 'Jogos populares',
              opts: ['Jogos populares', 'Esportes olímpicos', 'Danças folclóricas', 'Lutas marciais'] },
            { q: 'O que significa fair play?', a: 'Jogo limpo e respeito às regras',
              opts: ['Jogo limpo e respeito às regras', 'Vencer de qualquer jeito', 'Jogar sem árbitro', 'Torcer contra'] },
            { q: 'Qual dança folclórica do Nordeste é dançada em junho?', a: 'Quadrilha',
              opts: ['Quadrilha', 'Frevo', 'Carimbó', 'Bumba meu boi'] },
          ],
        },
      ],
    },
    {
      id: 'fisica', label: 'Física', icon: 'target', grad: 'g4',
      topicos: [
        {
          id: 'movimento', label: 'Movimento',
          questoes: [
            { q: 'Qual é a unidade de velocidade no sistema internacional?', a: 'Metro por segundo',
              opts: ['Metro por segundo', 'Quilômetro por hora', 'Newton', 'Joule'] },
            { q: 'Um carro percorre 100 km em 2 horas. Qual a velocidade média?', a: '50 km/h',
              opts: ['50 km/h', '200 km/h', '25 km/h', '100 km/h'] },
            { q: 'O que é aceleração?', a: 'A variação da velocidade no tempo',
              opts: ['A variação da velocidade no tempo', 'A distância percorrida', 'A força aplicada', 'O peso do corpo'] },
            { q: 'Um corpo em repouso permanece em repouso até que uma força atue. Qual lei é essa?', a: 'Primeira lei de Newton',
              opts: ['Primeira lei de Newton', 'Segunda lei de Newton', 'Terceira lei de Newton', 'Lei de Ohm'] },
            { q: 'Qual é o valor aproximado da aceleração da gravidade na Terra?', a: '9,8 m/s²',
              opts: ['9,8 m/s²', '3,5 m/s²', '20 m/s²', '1 m/s²'] },
          ],
        },
        {
          id: 'forcas', label: 'Forças e energia',
          questoes: [
            { q: 'Qual é a unidade de força?', a: 'Newton',
              opts: ['Newton', 'Joule', 'Watt', 'Pascal'] },
            { q: 'Pela segunda lei de Newton, força é igual a quê?', a: 'Massa vezes aceleração',
              opts: ['Massa vezes aceleração', 'Massa dividida por tempo', 'Velocidade vezes tempo', 'Peso vezes altura'] },
            { q: 'Qual é a unidade de energia e trabalho?', a: 'Joule',
              opts: ['Joule', 'Newton', 'Ampère', 'Volt'] },
            { q: 'Um objeto parado no alto de uma prateleira tem qual tipo de energia?', a: 'Energia potencial gravitacional',
              opts: ['Energia potencial gravitacional', 'Energia cinética', 'Energia térmica', 'Energia sonora'] },
            { q: 'Toda ação tem uma reação de mesma intensidade e sentido oposto. Qual lei é essa?', a: 'Terceira lei de Newton',
              opts: ['Terceira lei de Newton', 'Primeira lei de Newton', 'Lei de Hooke', 'Lei da gravitação'] },
          ],
        },
        {
          id: 'ondas', label: 'Luz, som e eletricidade',
          questoes: [
            { q: 'O som precisa de que para se propagar?', a: 'De um meio material',
              opts: ['De um meio material', 'Do vácuo', 'De luz', 'De calor'] },
            { q: 'Qual é a velocidade aproximada da luz no vácuo?', a: '300.000 km/s',
              opts: ['300.000 km/s', '340 m/s', '1.000 km/s', '30.000 km/s'] },
            { q: 'Qual fenômeno separa a luz branca nas cores do arco-íris?', a: 'Refração',
              opts: ['Refração', 'Reflexão', 'Difração', 'Absorção'] },
            { q: 'Qual é a unidade de corrente elétrica?', a: 'Ampère',
              opts: ['Ampère', 'Volt', 'Ohm', 'Watt'] },
            { q: 'Em um circuito, o que a resistência faz com a corrente?', a: 'Dificulta a passagem',
              opts: ['Dificulta a passagem', 'Aumenta a passagem', 'Cria energia', 'Não interfere'] },
          ],
        },
      ],
    },
    {
      id: 'quimica', label: 'Química', icon: 'drop', grad: 'g5',
      topicos: [
        {
          id: 'materia', label: 'Matéria e substâncias',
          questoes: [
            { q: 'Quais são os três estados físicos mais comuns da matéria?', a: 'Sólido, líquido e gasoso',
              opts: ['Sólido, líquido e gasoso', 'Quente, frio e morno', 'Puro, misto e composto', 'Ácido, básico e neutro'] },
            { q: 'Como se chama a passagem do líquido para o gasoso?', a: 'Vaporização',
              opts: ['Vaporização', 'Fusão', 'Solidificação', 'Condensação'] },
            { q: 'Como se chama a passagem do sólido direto para o gasoso?', a: 'Sublimação',
              opts: ['Sublimação', 'Fusão', 'Ebulição', 'Liquefação'] },
            { q: 'A água pura é uma substância simples ou composta?', a: 'Composta',
              opts: ['Composta', 'Simples', 'Mistura', 'Elemento'] },
            { q: 'Qual é a fórmula química da água?', a: 'H2O',
              opts: ['H2O', 'CO2', 'O2', 'NaCl'] },
          ],
        },
        {
          id: 'atomos', label: 'Átomos e tabela periódica',
          questoes: [
            { q: 'Quais partículas ficam no núcleo do átomo?', a: 'Prótons e nêutrons',
              opts: ['Prótons e nêutrons', 'Elétrons e prótons', 'Só elétrons', 'Só nêutrons'] },
            { q: 'Qual partícula do átomo tem carga negativa?', a: 'Elétron',
              opts: ['Elétron', 'Próton', 'Nêutron', 'Núcleo'] },
            { q: 'O que o número atômico indica?', a: 'A quantidade de prótons',
              opts: ['A quantidade de prótons', 'A quantidade de nêutrons', 'A massa total', 'O tamanho do átomo'] },
            { q: 'Qual é o símbolo químico do oxigênio?', a: 'O',
              opts: ['O', 'Ox', 'Og', 'On'] },
            { q: 'Como se chamam as linhas horizontais da tabela periódica?', a: 'Períodos',
              opts: ['Períodos', 'Famílias', 'Grupos', 'Camadas'] },
          ],
        },
        {
          id: 'misturas', label: 'Misturas e reações',
          questoes: [
            { q: 'Água e sal formam que tipo de mistura?', a: 'Homogênea',
              opts: ['Homogênea', 'Heterogênea', 'Substância pura', 'Composto'] },
            { q: 'Água e óleo formam que tipo de mistura?', a: 'Heterogênea',
              opts: ['Heterogênea', 'Homogênea', 'Solução', 'Substância pura'] },
            { q: 'Qual processo separa a areia da água?', a: 'Filtração',
              opts: ['Filtração', 'Destilação', 'Catação', 'Fusão'] },
            { q: 'Uma solução com pH menor que 7 é o quê?', a: 'Ácida',
              opts: ['Ácida', 'Básica', 'Neutra', 'Salina'] },
            { q: 'A ferrugem no ferro é um exemplo de que transformação?', a: 'Química',
              opts: ['Química', 'Física', 'Nuclear', 'Nenhuma'] },
          ],
        },
      ],
    },
    {
      id: 'biologia', label: 'Biologia', icon: 'leaf', grad: 'g7',
      topicos: [
        {
          id: 'celula-genetica', label: 'Célula e genética',
          questoes: [
            { q: 'Onde fica o material genético da célula com núcleo?', a: 'No núcleo',
              opts: ['No núcleo', 'No citoplasma', 'Na membrana', 'No ribossomo'] },
            { q: 'Qual molécula guarda a informação genética?', a: 'DNA',
              opts: ['DNA', 'ATP', 'Glicose', 'Proteína'] },
            { q: 'Quantos cromossomos tem uma célula humana normal?', a: '46',
              opts: ['46', '23', '48', '32'] },
            { q: 'Quem foi o pai da genética, com as ervilhas?', a: 'Mendel',
              opts: ['Mendel', 'Darwin', 'Pasteur', 'Lamarck'] },
            { q: 'Como se chama a divisão celular que forma os gametas?', a: 'Meiose',
              opts: ['Meiose', 'Mitose', 'Fotossíntese', 'Respiração'] },
          ],
        },
        {
          id: 'sistemas', label: 'Corpo humano e sistemas',
          questoes: [
            { q: 'Qual órgão bombeia o sangue pelo corpo?', a: 'Coração',
              opts: ['Coração', 'Pulmão', 'Fígado', 'Rim'] },
            { q: 'Onde acontece a troca de gases na respiração?', a: 'Nos alvéolos',
              opts: ['Nos alvéolos', 'No estômago', 'Na traqueia', 'No diafragma'] },
            { q: 'Qual órgão filtra o sangue e forma a urina?', a: 'Rim',
              opts: ['Rim', 'Fígado', 'Baço', 'Pâncreas'] },
            { q: 'Onde começa a digestão dos alimentos?', a: 'Na boca',
              opts: ['Na boca', 'No estômago', 'No intestino', 'No esôfago'] },
            { q: 'Qual sistema controla as respostas do corpo por impulsos elétricos?', a: 'Sistema nervoso',
              opts: ['Sistema nervoso', 'Sistema digestório', 'Sistema urinário', 'Sistema ósseo'] },
          ],
        },
        {
          id: 'evolucao', label: 'Ecologia e evolução',
          questoes: [
            { q: 'Quem propôs a teoria da seleção natural?', a: 'Darwin',
              opts: ['Darwin', 'Mendel', 'Lamarck', 'Linneu'] },
            { q: 'Como se chama o conjunto de seres vivos de uma mesma espécie em um lugar?', a: 'População',
              opts: ['População', 'Comunidade', 'Ecossistema', 'Bioma'] },
            { q: 'Quem produz o próprio alimento na cadeia alimentar?', a: 'Os produtores',
              opts: ['Os produtores', 'Os consumidores', 'Os decompositores', 'Os predadores'] },
            { q: 'Qual gás as plantas absorvem na fotossíntese?', a: 'Gás carbônico',
              opts: ['Gás carbônico', 'Oxigênio', 'Nitrogênio', 'Hidrogênio'] },
            { q: 'O que são espécies em extinção?', a: 'Espécies com risco de desaparecer',
              opts: ['Espécies com risco de desaparecer', 'Espécies novas', 'Espécies domésticas', 'Espécies invasoras'] },
          ],
        },
      ],
    },
    {
      id: 'espanhol', label: 'Espanhol', icon: 'chat', grad: 'g6',
      topicos: [
        {
          id: 'saludos', label: 'Saludos e apresentação',
          questoes: [
            { q: 'Como se diz "bom dia" em espanhol?', a: 'Buenos días',
              opts: ['Buenos días', 'Buenas noches', 'Buenas tardes', 'Hasta luego'] },
            { q: 'O que significa "¿Cómo te llamas?"', a: 'Qual é o seu nome?',
              opts: ['Qual é o seu nome?', 'Quantos anos você tem?', 'Onde você mora?', 'Como você está?'] },
            { q: 'Como se diz "obrigada" em espanhol?', a: 'Gracias',
              opts: ['Gracias', 'Por favor', 'De nada', 'Perdón'] },
            { q: 'O que significa "Mucho gusto"?', a: 'Muito prazer',
              opts: ['Muito prazer', 'Muito obrigado', 'Tenho muita fome', 'Gosto muito disso'] },
            { q: 'Como se diz "até logo" em espanhol?', a: 'Hasta luego',
              opts: ['Hasta luego', 'Buenos días', 'Lo siento', 'Vale'] },
          ],
        },
        {
          id: 'verbos', label: 'Verbos e pronomes',
          questoes: [
            { q: 'Qual é o pronome de "eu" em espanhol?', a: 'Yo',
              opts: ['Yo', 'Tú', 'Él', 'Nosotros'] },
            { q: 'Como se diz "nós" em espanhol?', a: 'Nosotros',
              opts: ['Nosotros', 'Vosotros', 'Ellos', 'Usted'] },
            { q: 'Qual é a forma correta: "Yo ___ estudiante"?', a: 'soy',
              opts: ['soy', 'eres', 'es', 'somos'] },
            { q: 'O verbo "tener" significa o quê?', a: 'Ter',
              opts: ['Ter', 'Ser', 'Ir', 'Fazer'] },
            { q: 'Como se diz "eu tenho 13 anos"?', a: 'Tengo trece años',
              opts: ['Tengo trece años', 'Soy trece años', 'Hago trece años', 'Estoy trece años'] },
          ],
        },
        {
          id: 'vocabulario-es', label: 'Vocabulário do dia a dia',
          questoes: [
            { q: 'O que significa "el desayuno"?', a: 'O café da manhã',
              opts: ['O café da manhã', 'O almoço', 'O jantar', 'A sobremesa'] },
            { q: 'Cuidado com o falso amigo: o que significa "embarazada"?', a: 'Grávida',
              opts: ['Grávida', 'Envergonhada', 'Embaraçada', 'Cansada'] },
            { q: 'O que significa "la clase"?', a: 'A aula',
              opts: ['A aula', 'A classe social', 'O caderno', 'A prova'] },
            { q: 'Como se diz "amanhã" em espanhol?', a: 'Mañana',
              opts: ['Mañana', 'Hoy', 'Ayer', 'Ahora'] },
            { q: 'O que significa "el pelo"?', a: 'O cabelo',
              opts: ['O cabelo', 'A pele', 'O pelo do animal apenas', 'O pé'] },
          ],
        },
      ],
    },
  ];

  const materia = (id) => MATERIAS.find((m) => m.id === id) || MATERIAS[0];
  const topico = (materiaId, topicoId) =>
    materia(materiaId).topicos.find((t) => t.id === topicoId) || materia(materiaId).topicos[0];

  const totalQuestoes = (materiaId) =>
    materia(materiaId).topicos.reduce((soma, t) => soma + t.questoes.length, 0);

  const semAcento = (t) => String(t || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  /** palavras que valem como pista do que caiu na aula */
  const palavras = (texto) => Array.from(new Set(
    semAcento(texto).split(/[^a-z0-9]+/).filter((p) => p.length >= 4)));

  /**
   * Todas as questões das matérias escolhidas. O filtro de submatéria vale
   * por matéria: se ela marcou assuntos de Filosofia mas nenhum de História,
   * História entra inteira em vez de ficar de fora.
   */
  function candidatas({ materias = [], topicos = null }) {
    const lista = [];
    const marcados = topicos || [];
    MATERIAS.filter((m) => materias.includes(m.id)).forEach((m) => {
      const daMateria = marcados.filter((chave) => chave.startsWith(`${m.id}:`));
      m.topicos
        .filter((t) => !daMateria.length || daMateria.includes(`${m.id}:${t.id}`))
        .forEach((t) => {
          t.questoes.forEach((q) => {
            lista.push(Object.assign({}, q, {
              materia: m.label, materiaId: m.id, topico: t.label,
              topicoId: t.id, grad: m.grad, icon: m.icon,
            }));
          });
        });
    });
    return lista;
  }

  /**
   * Sorteia a prova. Quando ela escreve o que caiu na aula, as questões que
   * combinam com essas palavras vêm primeiro; o resto entra para completar.
   */
  function sortear({ materias = [], topicos = null, quantidade = 10, termos = '' }) {
    const chaves = palavras(termos);
    const nota = (q) => {
      if (!chaves.length) return 0;
      const alvo = semAcento(`${q.q} ${q.a} ${q.topico} ${q.materia}`);
      return chaves.reduce((soma, chave) => soma + (alvo.includes(chave) ? 1 : 0), 0);
    };
    return candidatas({ materias, topicos })
      .map((q) => ({ q, nota: nota(q), sorte: Math.random() }))
      .sort((a, b) => b.nota - a.nota || a.sorte - b.sorte)
      .slice(0, quantidade)
      .map((x) => Object.assign(x.q, { combina: x.nota > 0 }));
  }

  const disponiveis = ({ materias = [], topicos = null }) =>
    candidatas({ materias, topicos }).length;

  /** quantas questões batem com o que ela escreveu sobre as aulas */
  function combinam({ materias = [], topicos = null, termos = '' }) {
    const chaves = palavras(termos);
    if (!chaves.length) return 0;
    return candidatas({ materias, topicos }).filter((q) => {
      const alvo = semAcento(`${q.q} ${q.a} ${q.topico} ${q.materia}`);
      return chaves.some((chave) => alvo.includes(chave));
    }).length;
  }

  return { MATERIAS, AREAS, materia, topico, totalQuestoes, sortear, disponiveis, combinam, candidatas };
})();

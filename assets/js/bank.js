/* =========================================================
   bank.js: banco de conteúdo escolar do ensino fundamental II.
   Cada matéria tem tópicos e cada tópico tem questões com a
   resposta curta e quatro alternativas, para servir tanto às
   provas de múltipla escolha quanto às discursivas.
   ========================================================= */
const Banco = (() => {
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
  ];

  const materia = (id) => MATERIAS.find((m) => m.id === id) || MATERIAS[0];
  const topico = (materiaId, topicoId) =>
    materia(materiaId).topicos.find((t) => t.id === topicoId) || materia(materiaId).topicos[0];

  const totalQuestoes = (materiaId) =>
    materia(materiaId).topicos.reduce((soma, t) => soma + t.questoes.length, 0);

  /** todas as questões escolhidas, já embaralhadas e com a origem marcada */
  function sortear({ materias = [], topicos = null, quantidade = 10 }) {
    const escolhidas = [];
    MATERIAS.filter((m) => materias.includes(m.id)).forEach((m) => {
      m.topicos
        .filter((t) => !topicos || !topicos.length || topicos.includes(`${m.id}:${t.id}`))
        .forEach((t) => {
          t.questoes.forEach((q) => {
            escolhidas.push(Object.assign({}, q, {
              materia: m.label, materiaId: m.id, topico: t.label, grad: m.grad, icon: m.icon,
            }));
          });
        });
    });
    return escolhidas.sort(() => Math.random() - 0.5).slice(0, quantidade);
  }

  const disponiveis = ({ materias = [], topicos = null }) =>
    sortear({ materias, topicos, quantidade: 9999 }).length;

  return { MATERIAS, materia, topico, totalQuestoes, sortear, disponiveis };
})();

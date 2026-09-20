import {
  Congregation,
  Module,
  Activity,
  CatechismSection,
  Devotion,
  ChurchEvent,
  Announcement,
  StudyText,
  VideoLesson,
  StudentProfile,
  WorshipRecord,
  CatechismAssessment,
  Grade,
  PublicVideo,
  PublicAudio,
  PublicBibleStudy,
  PublicCalendarEvent
} from '../types';

export const INITIAL_CONGREGATIONS: Congregation[] = [
  {
    id: 'cel-sao-paulo',
    name: 'CEL São Paulo – Planalto',
    city: 'Planalto',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
  {
    id: 'cel-bom-pastor',
    name: 'CEL Bom Pastor – São Marcos',
    city: 'São Marcos',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
  {
    id: 'cel-santissima-trindade',
    name: 'CEL Santíssima Trindade – Sagrada Família',
    city: 'Sagrada Família',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
  {
    id: 'cel-concordia',
    name: 'CEL Concórdia – Santa Rita',
    city: 'Santa Rita',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
  {
    id: 'cel-sao-joao',
    name: 'CEL São João – Santa Cecília',
    city: 'Santa Cecília',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
  {
    id: 'cel-cristo-para-todos',
    name: 'CEL Cristo Para Todos – Coxilha Alta',
    city: 'Coxilha Alta',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
  {
    id: 'cel-emanuel',
    name: 'CEL Emanuel – São José do Barra Grande',
    city: 'São José do Barra Grande',
    state: 'PR',
    pastorName: 'Pastor Everton Figur',
    active: true,
  },
];

export const CATECHISM_SECTIONS: CatechismSection[] = [
  {
    id: 'cat-1',
    number: 1,
    title: 'Os Dez Mandamentos',
    description: 'Como o chefe de família deve ensiná-los com toda a singeleza à sua gente.',
    content: `PRIMEIRO MANDAMENTO: Não terás outros deuses. Que significa isso? Devemos temer e amar a Deus e confiar nele acima de todas as coisas.
SEGUNDO MANDAMENTO: Não tomarás em vão o nome do Senhor teu Deus. Que significa isso? Devemos temer e amar a Deus, para que pelo seu nome não amaldiçoemos, nem juremos falso, nem usemos de feitiçaria, mentira ou engano; mas invoquemos o seu nome em toda a necessidade, o adoremos com orações, louvores e ações de graças.
TERCEIRO MANDAMENTO: Lembra-te do dia de repouso, para o santificar. Que significa isso? Devemos temer e amar a Deus, para que não desprezemos a pregação e a sua Palavra; mas a tenhamos por santa e de boa vontade a ouçamos e aprendamos.
QUARTO MANDAMENTO: Honra teu pai e tua mãe.
QUINTO MANDAMENTO: Não matarás.
SEXTO MANDAMENTO: Não cometerás adultério.
SÉTIMO MANDAMENTO: Não furtarás.
OITAVO MANDAMENTO: Não dirás falso testemunho contra o teu próximo.
NONO MANDAMENTO: Não cobiçarás a casa do teu próximo.
DÉCIMO MANDAMENTO: Não cobiçarás a mulher do teu próximo, nem os seus servos, nem as suas servas, nem o seu gado, nem coisa alguma que lhe pertença.`,
    explanation: 'Deus ameaça castigar a todos que transgridem estes mandamentos. Por isso, devemos temer a sua ira e nada fazer contra eles. Mas a todos que guardam estes mandamentos promete graça e toda a sorte de bênçãos.',
    biblicalReferences: 'Êxodo 20.1-17; Deuteronômio 5.6-21',
  },
  {
    id: 'cat-2',
    number: 2,
    title: 'O Credo Apostólico',
    description: 'Como o chefe de família deve ensiná-lo com toda a singeleza à sua gente.',
    content: `PRIMEIRO ARTIGO - DA CRIAÇÃO:
Creio em Deus Pai todo-poderoso, Criador do céu e da terra.
Que significa isso?
Creio que Deus me criou a mim e a todas as criaturas; me deu corpo e alma, olhos, ouvidos e todos os membros, razão e todos os sentidos, e ainda os conserva. Tudo isto sem nenhum merecimento ou dignidade minha, mas unicamente por sua paternal e divina bondade e misericórdia. Por tudo isto devo dar-lhe graças e louvor, servi-lo e obedecer-lhe. Isto é certamente verdade.

SEGUNDO ARTIGO - DA REDENÇÃO:
E em Jesus Cristo, seu único Filho, nosso Senhor, o qual foi concebido pelo Espírito Santo, nasceu da virgem Maria, padeceu sob o poder de Pôncio Pilatos, foi crucificado, morto e sepultado, desceu ao inferno, no terceiro dia ressuscitou dos mortos, subiu ao céu e está sentado à direita de Deus Pai todo-poderoso, de onde há de vir a julgar os vivos e os mortos.
Que significa isso?
Creio que Jesus Cristo, verdadeiro Deus, gerado do Pai desde a eternidade, e também verdadeiro homem, nascido da virgem Maria, é o meu Senhor. Ele me remiu a mim, homem perdido e condenado, comprou-me e livrou-me de todos os pecados, da morte e do poder do diabo; não com ouro ou prata, mas com o seu santo e precioso sangue e com a sua inocente paixão e morte.

TERCEIRO ARTIGO - DA SANTIFICAÇÃO:
Creio no Espírito Santo, na santa igreja cristã, a comunhão dos santos, na remissão dos pecados, na ressurreição da carne e na vida eterna. Amém.
Que significa isso?
Creio que por minha própria razão ou força não posso crer em Jesus Cristo, meu Senhor, nem chegar a ele; mas o Espírito Santo me chamou pelo Evangelho, me iluminou com os seus dons, me santificou e conservou na verdadeira fé.`,
    explanation: 'A confissão de fé resume a ação salvífica do Deus Trino: Criação pelo Pai, Redenção pelo Filho e Santificação pelo Espírito Santo.',
    biblicalReferences: '1 Timóteo 2.4-6; Romanos 8.32; Gálatas 4.4-7',
  },
  {
    id: 'cat-3',
    number: 3,
    title: 'O Pai-Nosso',
    description: 'A oração que o Senhor Jesus ensinou aos seus discípulos.',
    content: `INTRODUÇÃO: Pai nosso, que estás nos céus.
Que significa isso? Deus quer com isso convidar-nos a crer que ele é nosso verdadeiro Pai e nós somos seus verdadeiros filhos, para que lhe peçamos sem medo e com toda a confiança, como bons filhos ao seu querido pai.

1ª PETIÇÃO: Santificado seja o teu nome.
2ª PETIÇÃO: Venha o teu reino.
3ª PETIÇÃO: Seja feita a tua vontade, assim na terra como no céu.
4ª PETIÇÃO: O pão nosso de cada dia nos dá hoje.
5ª PETIÇÃO: E perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores.
6ª PETIÇÃO: E não nos deixes cair em tentação.
7ª PETIÇÃO: Mas livra-nos do mal.
CONCLUSÃO: Pois teu é o reino, o poder e a glória para sempre. Amém.
Que significa Amém? Amém quer dizer: sim, sim, assim deve acontecer. Pois estou certo de que estas petições agradam ao Pai que está nos céus e por ele são atendidas.`,
    explanation: 'Cristo nos ensina a orar confiando na fidelidade de Deus e na dependência diária de sua providência e perdão.',
    biblicalReferences: 'Mateus 6.9-13; Lucas 11.2-4',
  },
  {
    id: 'cat-4',
    number: 4,
    title: 'O Sacramento do Santo Batismo',
    description: 'O banho do novo nascimento na Palavra de Deus.',
    content: `1. O QUE É O BATISMO?
O Batismo não é simplesmente água, mas é água compreendida no mandamento de Deus e ligada com a Palavra de Deus.
Qual é essa Palavra de Deus? É a que nosso Senhor Jesus Cristo diz no último capítulo de Mateus: 'Ide e fazei discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo'.

2. QUE DÁ OU PARA QUE SERVE O BATISMO?
Opera a remissão dos pecados, livra da morte e do diabo e dá a salvação eterna a todos os que creem naquilo que as palavras e promessas de Deus dizem.

3. COMO PODE A ÁGUA FAZER COISAS TÃO GRANDES?
A água, na verdade, não faz isso, mas a Palavra de Deus que está unida com a água e na água, e a fé que confia nessa Palavra divina.

4. QUE SIGNIFICA ESSE BATISMO COM ÁGUA?
Significa que o velho Adão em nós, por arrependimento e tristeza diários, deve ser afogado e morrer com todos os pecados e maus desejos, e que, em seu lugar, deve surgir e ressurgir diariamente o novo homem, que viva na presença de Deus em justiça e pureza eternamente.`,
    explanation: 'Pelo Batismo somos recebidos na aliança da graça de Deus e adotados como filhos perdoados de Cristo.',
    biblicalReferences: 'Mateus 28.19; Marcos 16.16; Tito 3.5-7; Romanos 6.4',
  },
  {
    id: 'cat-5',
    number: 5,
    title: 'A Confissão e o Ofício das Chaves',
    description: 'Como instruir os simples na confissão dos pecados e no consolo do Evangelho.',
    content: `O QUE É A CONFISSÃO?
A confissão compõe-se de duas partes:
A primeira é confessar os pecados;
A segunda é receber a absolvição ou perdão do confessor ou pastor, como se fora do próprio Deus, não duvidando nada, mas crendo firmemente que os pecados estão perdoados diante de Deus no céu.

QUAIS PECADOS DEVEMOS CONFESSAR?
Diante de Deus devemos declarar-nos culpados de todos os pecados, mesmo daqueles que não conhecemos, como fazemos no Pai-Nosso; perante o pastor, porém, devemos confessar somente aqueles pecados que conhecemos e sentimos no coração.

O QUE É O OFÍCIO DAS CHAVES?
É aquele poder especial que Cristo deu à sua igreja na terra de perdoar os pecados aos pecadores penitentes, e de reter os pecados aos impenitentes enquanto não se arrependerem (João 20.22-23).`,
    explanation: 'A absolvição pastoral é a viva voz do Evangelho assegurando o perdão conquistado por Cristo na cruz.',
    biblicalReferences: 'Salmo 51; João 20.21-23; 1 João 1.8-9',
  },
  {
    id: 'cat-6',
    number: 6,
    title: 'O Sacramento do Altar',
    description: 'A Santa Ceia do nosso Senhor Jesus Cristo.',
    content: `O QUE É O SACRAMENTO DO ALTAR?
É o verdadeiro corpo e o verdadeiro sangue de nosso Senhor Jesus Cristo, sob o pão e o vinho, dado a nós cristãos para comer e beber, instituído pelo próprio Cristo.

ONDE ESTÁ ESCRITO ISSO?
Escrevem assim os santos evangelistas Mateus, Marcos, Lucas e o apóstolo Paulo:
'Nosso Senhor Jesus Cristo, na noite em que foi traído, tomou o pão; e, tendo dado graças, o partiu e deu aos seus discípulos, dizendo: Tomai, comei; isto é o meu corpo, que é dado por vós; fazei isto em memória de mim.
Semelhantemente, depois da ceia, tomou também o cálice; e, tendo dado graças, deu-lho, dizendo: Bebei dele todos; este cálice é o Novo Testamento no meu sangue, que é derramado por vós para remissão dos pecados; fazei isto, todas as vezes que o beberdes, em memória de mim.'

QUE BENEFÍCIO TRAZ ESTE COMER E BEBER?
Isto mostram-nos estas palavras: 'Dado e derramado por vós para remissão dos pecados'. Na ceia nos é dada remissão dos pecados, vida e salvação mediante estas palavras.

QUEM RECEBE ESTE SACRAMENTO DIGNAMENTE?
Aquele que tem fé nestas palavras: 'Dado e derramado por vós para remissão dos pecados'.`,
    explanation: 'Na Santa Ceia recebemos a certeza sacramental do perdão e fortalecimento da nossa fé em comunhão fraterna.',
    biblicalReferences: 'Mateus 26.26-28; 1 Coríntios 11.23-29',
  },
  {
    id: 'cat-7',
    number: 7,
    title: 'Orações Diárias',
    description: 'Como o chefe de família deve ensinar os seus a orar de manhã e à noite.',
    content: `BÊNÇÃO DA MANHÃ:
De manhã, ao levantar da cama, benze-te e dize:
'Em nome do Pai e do Filho e do Espírito Santo. Amém.'
A seguir, de joelhos ou de pé, dize o Credo e o Pai-Nosso. Se quiseres, podes ajuntar também esta oraçãozinha:
'Dou-te graças, meu Pai celeste, por meio de Jesus Cristo, teu querido Filho, porque nesta noite me guardaste de todo o dano e perigo; e peço-te que neste dia me guardes também do pecado e de todo o mal, para que te agradem todos os meus feitos e a minha vida. Pois em tuas mãos me entrego, meu corpo e alma e todas as coisas. O teu santo anjo esteja comigo, para que o inimigo maligno não tenha poder algum sobre mim. Amém.'
Depois disto, vai alegre ao teu trabalho, cantando um hino ou o que a tua devoção sugerir.

BÊNÇÃO DA NOITE:
À noite, ao recolher à cama, benze-te e dize:
'Em nome do Pai e do Filho e do Espírito Santo. Amém.'
Dize o Credo e o Pai-Nosso e a oração:
'Dou-te graças, meu Pai celeste, por meio de Jesus Cristo, teu querido Filho, porque hoje me guardaste graciosamente; e peço-te que me perdoes todos os pecados onde errei, e me guardes graciosamente nesta noite. Pois em tuas mãos me entrego, meu corpo e alma e todas as coisas. O teu santo anjo esteja comigo, para que o inimigo maligno não tenha poder sobre mim. Amém.'
E dorme em paz e com alegria.

BÊNÇÃO À MESA:
Os olhos de todos esperam em ti, Senhor, e tu lhes dás o seu mantimento a seu tempo; abres a tua mão e satisfazes o desejo de todos os viventes (Sl 145.15-16).
Pai-Nosso e a oração: 'Senhor Deus, Pai celeste, abençoa a nós e a estes teus dons, que de tua bondade generosa recebemos, por Jesus Cristo, nosso Senhor. Amém.'`,
    explanation: 'A oração cristã santifica cada momento do dia, confiando a vida presente e eterna aos cuidados do Senhor.',
    biblicalReferences: 'Salmo 145.15-16; 1 Tessalonicenses 5.17',
  },
  {
    id: 'cat-8',
    number: 8,
    title: 'A Tábua dos Deveres',
    description: 'Certos versículos bíblicos para várias ordens e estados santos.',
    content: `PARA OS BISPOS, PASTORES E PREGADORES:
O bispo deve ser irrepreensível, esposo de uma só mulher, temperante, sóbrio, modesto, hospitaleiro, apto para ensinar (1 Tm 3.2-3).

O QUE OS CRISTÃOS DEVEM AOS SEUS PASTORES:
O Senhor ordenou aos que pregam o evangelho que vivam do evangelho (1 Co 9.14). Obedecei aos vossos guias e sede submissos para com eles; pois velam por vossas almas (Hb 13.17).

PARA AS AUTORIDADES:
Toda alma esteja sujeita às autoridades superiores; porque não há autoridade que não venha de Deus (Rm 13.1-4).

PARA OS PAIS E MÃES:
Pais, não provoqueis vossos filhos à ira, mas criai-os na disciplina e admoestação do Senhor (Ef 6.4).

PARA OS FILHOS:
Filhos, obedecei a vossos pais no Senhor, pois isto é justo. Honra a teu pai e a tua mãe (Ef 6.1-3).

PARA A JUVENTUDE:
Jovens, sede submissos aos que são mais velhos; e cingi-vos todos de humildade, porque Deus resiste aos soberbos, mas dá graça aos humildes (1 Pe 5.5).

PARA TODOS JUNTOS:
Amarás o teu próximo como a ti mesmo. Nisto se resume toda a lei (Rm 13.9). E orai sempre uns pelos outros (1 Tm 2.1).`,
    explanation: 'Na vocação em que fomos chamados, servimos a Deus servindo com amor ao nosso próximo.',
    biblicalReferences: 'Efésios 5-6; 1 Pedro 2-3; Romanos 13',
  },
];

export const INITIAL_MODULES_CONFIRMATORIO: Module[] = [
  {
    id: 'mod-conf-1',
    courseId: 'confirmatorio',
    title: 'Módulo 1: Introdução à Sagrada Escritura e à Fé Luterana',
    description: 'A Bíblia como Palavra inspirada de Deus, Lei e Evangelho, e a herança da Reforma.',
    order: 1,
    published: true,
    lessons: [
      {
        id: 'les-conf-1-1',
        title: 'A Bíblia: Palavra de Deus inspirada',
        type: 'text',
        content: 'A Bíblia Sagrada é o testemunho infalível do amor de Deus pela humanidade. Composta por 66 livros (39 do Antigo Testamento e 27 do Novo Testamento), ela tem como centro Jesus Cristo. Aprendemos a distinguir entre a Lei (que nos mostra o pecado e a necessidade de salvação) e o Evangelho (que nos anuncia o perdão gracioso em Cristo).',
        order: 1,
      },
      {
        id: 'les-conf-1-2',
        title: 'Vídeo: Quem foi Martinho Lutero e a Reforma',
        type: 'video',
        content: 'Nesta videoaula, o Pastor Everton Figur apresenta os pilares da Reforma: Somente a Graça, Somente a Fé, Somente a Escritura e Somente Cristo.',
        duration: '14 min',
        order: 2,
      },
      {
        id: 'les-conf-1-3',
        title: 'Guia de Estudos em PDF: Linha do Tempo da Bíblia',
        type: 'pdf',
        fileName: 'Guia_Estudo_Biblia_PEL.pdf',
        content: 'Material com mapas, tabela cronológica e divisões dos livros bíblicos.',
        order: 3,
      },
    ],
  },
  {
    id: 'mod-conf-2',
    courseId: 'confirmatorio',
    title: 'Módulo 2: Os Dez Mandamentos — A Vontade Santa de Deus',
    description: 'Compreendendo a primeira tábua (deveres para com Deus) e a segunda tábua (deveres para com o próximo).',
    order: 2,
    published: true,
    lessons: [
      {
        id: 'les-conf-2-1',
        title: 'A Primeira Tábua da Lei: Amar a Deus acima de tudo',
        type: 'text',
        content: 'Os primeiros três mandamentos tratam do nosso relacionamento com Deus: Seu Nome, Sua Palavra e o Seu Dia Santo.',
        order: 1,
      },
      {
        id: 'les-conf-2-2',
        title: 'A Segunda Tábua: O amor ao próximo no cotidiano',
        type: 'text',
        content: 'Do 4º ao 10º mandamento, Deus estabelece a família, a proteção à vida, a honra, o matrimônio e a integridade material como dons a serem cuidados com zelo.',
        order: 2,
      },
    ],
  },
  {
    id: 'mod-conf-3',
    courseId: 'confirmatorio',
    title: 'Módulo 3: O Credo Apostólico — O Deus Trino e a Salvação',
    description: 'Deus Pai (Criador), Deus Filho (Redentor) e Deus Espírito Santo (Santificador).',
    order: 3,
    published: true,
    lessons: [
      {
        id: 'les-conf-3-1',
        title: 'O Primeiro Artigo: Deus Criador e Provedor',
        type: 'text',
        content: 'Deus cuida de nós diariamente, sustentando nossa vida, corpo, sentidos e dons, unicamente por Sua bondade paternal.',
        order: 1,
      },
      {
        id: 'les-conf-3-2',
        title: 'O Segundo Artigo: Jesus Cristo, Verdadeiro Deus e Verdadeiro Homem',
        type: 'text',
        content: 'A obra redentora de Jesus: Sua vida perfeita, morte expiatória na cruz e ressurreição corporal gloriosa ao terceiro dia.',
        order: 2,
      },
      {
        id: 'les-conf-3-3',
        title: 'O Terceiro Artigo: O Espírito Santo e a Igreja',
        type: 'text',
        content: 'O Espírito Santo que nos chama pelo Evangelho, opera a fé em nossos corações e nos reúne no corpo de Cristo.',
        order: 3,
      },
    ],
  },
  {
    id: 'mod-conf-4',
    courseId: 'confirmatorio',
    title: 'Módulo 4: Os Sacramentos da Graça — Batismo e Santa Ceia',
    description: 'Os meios visíveis pelos quais o Espírito Santo aplica o perdão e a salvação.',
    order: 4,
    published: true,
    lessons: [
      {
        id: 'les-conf-4-1',
        title: 'O Santo Batismo: Banho de Regeneração',
        type: 'text',
        content: 'O Batismo como aliança eterna com Deus, válido para crianças e adultos.',
        order: 1,
      },
      {
        id: 'les-conf-4-2',
        title: 'A Santa Ceia: O Verdadeiro Corpo e Sangue de Cristo',
        type: 'text',
        content: 'Na Santa Ceia recebemos sob o pão e o vinho o próprio corpo e sangue de Cristo para o perdão dos pecados e fortalecimento da fé.',
        order: 2,
      },
    ],
  },
];

export const INITIAL_MODULES_PROFISSAO_FE: Module[] = [
  {
    id: 'mod-prof-1',
    courseId: 'profissao_fe',
    title: 'Módulo 1: Fundamentos da Teologia Bíblica e Luterana',
    description: 'Os princípios fundamentais da fé cristã reformada e a confissão pública da fé.',
    order: 1,
    published: true,
    lessons: [
      {
        id: 'les-prof-1-1',
        title: 'Os Quatro Pilares da Reforma Luterana',
        type: 'text',
        content: 'Graça somente, Fé somente, Escritura somente e Cristo somente. Estudo bíblico aprofundado para candidatos adultos que desejam professar sua fé na Igreja Evangélica Luterana.',
        order: 1,
      },
      {
        id: 'les-prof-1-2',
        title: 'Justificação por Graça mediante a Fé',
        type: 'text',
        content: 'Como somos declarados justos diante de Deus não por nossos próprios méritos, mas pela imputação da justiça perfeita de Cristo recebida pela fé.',
        order: 2,
      },
    ],
  },
  {
    id: 'mod-prof-2',
    courseId: 'profissao_fe',
    title: 'Módulo 2: O Credo Apostólico e a Confessionalidade da Paróquia',
    description: 'Aprofundamento nas Confissões Luteranas (Catecismo Menor e Confissão de Augsburgo).',
    order: 2,
    published: true,
    lessons: [
      {
        id: 'les-prof-2-1',
        title: 'O Credo Apostólico e a Fé Trinitária',
        type: 'text',
        content: 'O Deus Trino na vida do cristão adulto: confissão, vocação diária e comunhão paroquial.',
        order: 1,
      },
    ],
  },
  {
    id: 'mod-prof-3',
    courseId: 'profissao_fe',
    title: 'Módulo 3: Vida Comunitária, Sacramentos e Serviço',
    description: 'A vivência paroquial, os dons espirituais e o compromisso cristão nas congregações locais.',
    order: 3,
    published: true,
    lessons: [
      {
        id: 'les-prof-3-1',
        title: 'A Prática dos Sacramentos e a Vida de Culto',
        type: 'text',
        content: 'A importância da participação assídua na Santa Ceia e na vida congregacional.',
        order: 1,
      },
    ],
  },
];

export const INITIAL_VIDEOS: VideoLesson[] = [
  {
    id: 'vid-1',
    courseId: 'confirmatorio',
    moduleId: 'mod-conf-1',
    title: 'Aula 1: A Bíblia e a Herança Luterana',
    description: 'Introdução aos fundamentos da instrução cristã com o Pastor Everton Figur.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    durationMinutes: 14,
    order: 1,
    published: true,
  },
  {
    id: 'vid-2',
    courseId: 'confirmatorio',
    moduleId: 'mod-conf-2',
    title: 'Aula 2: Os Dez Mandamentos no Mundo Atual',
    description: 'Explicando o significado de cada mandamento para a vida do confirmando.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    durationMinutes: 18,
    order: 2,
    published: true,
  },
  {
    id: 'vid-3',
    courseId: 'profissao_fe',
    moduleId: 'mod-prof-1',
    title: 'Aula 1 (Profissão de Fé): A Doutrina da Justificação',
    description: 'O cerne do Evangelho: Somos justificados pela graça de Deus mediante a fé em Jesus Cristo.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationMinutes: 22,
    order: 1,
    published: true,
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-conf-1',
    courseId: 'confirmatorio',
    moduleId: 'mod-conf-1',
    title: 'Atividade 1: Fundamentos da Fé e Bíblia Sagrada',
    description: 'Questionário sobre os livros bíblicos, a divisão da Escritura e a justificação.',
    maxScore: 10,
    deadline: '2026-10-30',
    published: true,
    questions: [
      {
        id: 'q-1',
        question: 'Como somos justificados diante de Deus?',
        options: [
          'Pelas nossas boas obras e esforços pessoais',
          'Pela capacidade humana e virtudes morais',
          'Por causa de Cristo, pela fé, sem o merecimento da lei',
          'Pela quantidade de orações e ofertas que fazemos',
        ],
        correctAnswer: 2,
        points: 2.5,
        explanation: 'Romanos 3.28: Concluímos, pois, que o homem é justificado pela fé, independentemente das obras da lei.',
      },
      {
        id: 'q-2',
        question: 'Quantos livros possui a Bíblia Sagrada na tradição protestante?',
        options: [
          '66 livros (39 no Antigo Testamento e 27 no Novo Testamento)',
          '73 livros (46 no Antigo Testamento e 27 no Novo Testamento)',
          '50 livros no total',
          '80 livros com os apócrifos',
        ],
        correctAnswer: 0,
        points: 2.5,
        explanation: 'A Bíblia canônica possui 39 livros no Antigo Testamento e 27 no Novo Testamento, totalizando 66.',
      },
      {
        id: 'q-3',
        question: 'Qual é o centro e principal propósito de toda a Sagrada Escritura?',
        options: [
          'Apresentar regras de filosofia humana',
          'Revelar Jesus Cristo como Salvador e conceder a vida eterna',
          'Contar apenas crônicas históricas do povo antigo',
          'Ensinar fórmulas de prosperidade terrena',
        ],
        correctAnswer: 1,
        points: 2.5,
        explanation: 'João 20.31: Estes, porém, foram registrados para que creiais que Jesus é o Cristo, o Filho de Deus, e para que, crendo, tenhais vida em seu nome.',
      },
      {
        id: 'q-4',
        question: 'Segundo o Catecismo Menor, o que significa temer e amar a Deus no Primeiro Mandamento?',
        options: [
          'Ter pavor de Deus e fugir de sua presença',
          'Confiar nele acima de todas as coisas com reverência e gratidão filial',
          'Obedecer a Deus apenas quando for conveniente',
          'Prestar culto a santos e imagens criadas',
        ],
        correctAnswer: 1,
        points: 2.5,
        explanation: 'Lutero ensina: Devemos temer e amar a Deus e confiar nele acima de todas as coisas.',
      },
    ],
  },
  {
    id: 'act-conf-2',
    courseId: 'confirmatorio',
    moduleId: 'mod-conf-2',
    title: 'Atividade 2: Os Dez Mandamentos no Catecismo',
    description: 'Fixação sobre os mandamentos e a sua aplicação na vida cotidiana cristã.',
    maxScore: 10,
    deadline: '2026-11-20',
    published: true,
    questions: [
      {
        id: 'q-5',
        question: 'O que aprendemos no Terceiro Mandamento ("Lembra-te do dia de repouso para o santificar")?',
        options: [
          'Apenas dormir o domingo inteiro',
          'Não desprezar a pregação e a Palavra de Deus, ouvindo-a e aprendendo-a de boa vontade',
          'Trabalhar sem descanso todos os dias da semana',
          'Realizar rituais judaicos do Antigo Testamento',
        ],
        correctAnswer: 1,
        points: 5.0,
        explanation: 'No Catecismo Menor, o repouso cristão está fundamentado na recepção alegre da Palavra de Deus.',
      },
      {
        id: 'q-6',
        question: 'De acordo com o Oitavo Mandamento ("Não dirás falso testemunho contra o teu próximo"), como devemos agir?',
        options: [
          'Espalhar fofocas se forem verdadeiras',
          'Defender o próximo, falar bem dele e interpretar tudo da melhor maneira',
          'Ficar calado quando alguém for injustiçado',
          'Falar mal pelas costas',
        ],
        correctAnswer: 1,
        points: 5.0,
        explanation: 'Devemos temer e amar a Deus para que não mintamos contra o nosso próximo, mas o desculpemos e falemos bem dele.',
      },
    ],
  },
  {
    id: 'act-prof-1',
    courseId: 'profissao_fe',
    moduleId: 'mod-prof-1',
    title: 'Atividade de Profissão de Fé: Os Quatro Solas',
    description: 'Avaliação de doutrina sobre a teologia da cruz e os solas da Reforma.',
    maxScore: 10,
    deadline: '2026-11-15',
    published: true,
    questions: [
      {
        id: 'q-7',
        question: 'O que afirma o princípio "Sola Gratia" (Somente a Graça)?',
        options: [
          'A salvação depende 50% de Deus e 50% das obras do homem',
          'A salvação é dádiva totalmente imerecida de Deus, dada pelo amor gracioso em Cristo',
          'A graça só é concedida a pessoas perfeitas',
          'Não há necessidade de crer para ser salvo',
        ],
        correctAnswer: 1,
        points: 5.0,
        explanation: 'Efésios 2.8-9: Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus; não de obras, para que ninguém se glorie.',
      },
      {
        id: 'q-8',
        question: 'O que ensina a doutrina luterana a respeito do Sacramento do Altar?',
        options: [
          'É apenas uma representação simbólica sem a presença real',
          'O pão e o vinho desaparecem magicamente',
          'Cristo está verdadeiramente presente: o verdadeiro corpo e sangue sob o pão e o vinho',
          'Qualquer pessoa pode ministrar sem ordem ou vocação',
        ],
        correctAnswer: 2,
        points: 5.0,
        explanation: 'Cremos na união sacramental: o corpo e sangue de Cristo são recebidos em, com e sob o pão e o vinho consagrados.',
      },
    ],
  },
];

export const INITIAL_DEVOTIONS: Devotion[] = [
  {
    id: 'dev-1',
    title: 'A Graça que Sustenta Nossos Passos',
    bibleVerse: 'Romanos 5.1 — Justificados, pois, mediante a fé, temos paz com Deus por meio de nosso Senhor Jesus Cristo.',
    reflection: 'Em dias de incerteza e correria, nosso coração muitas vezes busca segurança nas coisas passageiras deste mundo. Porém, o apóstolo Paulo nos lembra que a verdadeira paz não é uma sensação momentânea, mas o estado de harmonia com o Criador conquistado pelo sacrifício de Jesus na cruz. Não precisamos provar nosso valor para Deus; Ele já declarou Seu amor incondicional ao entregar Seu Filho por nós.',
    prayer: 'Senhor Deus, Pai misericordioso, agradecemos pela paz que excede todo o entendimento. Guia os confirmandos e suas famílias no Teu amor e fortalece a nossa fé diante de cada desafio diário. Por Jesus Cristo, nosso Senhor. Amém.',
    author: 'Pastor Everton Figur',
    date: '2026-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80',
    targetAudience: 'all',
  },
  {
    id: 'dev-2',
    title: 'A Palavra como Lâmpada e Guia',
    bibleVerse: 'Salmo 119.105 — Lâmpada para os meus pés é tua palavra e, luz para o meu caminho.',
    reflection: 'Queridos confirmandos e irmãos na fé: quando caminhamos na escuridão, uma pequena lanterna não ilumina todo o horizonte de uma só vez, mas mostra exatamente onde dar o próximo passo seguro. Assim é a Palavra de Deus em nossa jornada de estudo do Catecismo e vida de oração.',
    prayer: 'Querido Jesus, abre os nossos olhos e corações para que amemos a Tua Palavra. Que cada aula e meditação frutifique em atos de amor ao nosso próximo. Amém.',
    author: 'Pastor Everton Figur',
    date: '2026-09-12',
    targetAudience: 'confirmatorio',
  },
];

export const INITIAL_EVENTS: ChurchEvent[] = [
  {
    id: 'evt-1',
    title: 'Culto de Abertura do Semestre e Bênção dos Confirmandos',
    date: '2026-09-27',
    time: '09:00',
    location: 'CEL São Paulo – Planalto',
    description: 'Culto com celebração da Santa Ceia e acolhida especial aos alunos do Ensino Confirmatório e candidatos à Profissão de Fé.',
    congregationId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-2',
    title: 'Encontro Paroquial de Jovens e Confirmandos',
    date: '2026-10-18',
    time: '14:30',
    location: 'CEL Bom Pastor – São Marcos',
    description: 'Tarde de louvor, estudo bíblico dinâmico, gincana e confraternização entre as congregações da paróquia.',
    congregationId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-3',
    title: 'Retiro Espiritual e de Oração',
    date: '2026-11-07',
    time: '08:30',
    location: 'CEL Concórdia – Santa Rita',
    description: 'Momento de reflexão sobre os Dez Mandamentos e o Sacramento do Altar para alunos e padrinhos.',
    congregationId: 'cel-concordia',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Início da Entrega dos Resumos de Culto Mensais',
    content: 'Lembramos aos confirmandos que o registro de presença nos cultos do mês deve ser enviado pela plataforma com a leitura bíblica, resumo da mensagem e foto.',
    priority: 'alta',
    targetAudience: 'confirmatorio',
    date: '2026-09-14',
    author: 'Pastor Everton Figur',
  },
  {
    id: 'ann-2',
    title: 'Novo Módulo de Catecismo Menor Disponibilizado',
    content: 'Os textos com as explicações de Martinho Lutero já estão liberados para estudo e acompanhamento da memorização.',
    priority: 'normal',
    targetAudience: 'all',
    date: '2026-09-10',
    author: 'Pastor Everton Figur',
  },
  {
    id: 'ann-3',
    title: 'Aviso aos Candidatos à Profissão de Fé',
    content: 'O Módulo 1 sobre os Quatro Pilares da Reforma já está aberto com atividade interativa avaliativa.',
    priority: 'normal',
    targetAudience: 'profissao_fe',
    date: '2026-09-08',
    author: 'Pastor Everton Figur',
  },
];

export const INITIAL_STUDY_TEXTS: StudyText[] = [
  {
    id: 'txt-1',
    title: 'O Pequeno Catecismo de Martinho Lutero: História e Atualidade',
    category: 'História da Reforma',
    author: 'Pastor Everton Figur',
    summary: 'Como surgiu o Catecismo em 1529 e por que ele continua sendo o manual essencial para a instrução cristã da família.',
    content: `Em 1528, Martinho Lutero realizou visitas paroquiais na Saxônia e constatou o desolador estado de instrução religiosa entre o povo simples e até entre líderes. Movido por zelo pastoral, escreveu o Catecismo Menor como um manual prático para que chefes de família instruíssem seus filhos e servos.
Lutero organizou a instrução em torno dos fundamentos: os Dez Mandamentos (como diagnóstico do pecado e espelho da vontade divina), o Credo (como anúncio da salvação trina em Cristo), o Pai-Nosso (como escola de oração) e os Sacramentos (como meios eficazes de graça).
Hoje, na paróquia luterana, mantemos essa nobre tradição: uma fé fundamentada na Sagrada Escritura, explicada com clareza e vivida em comunidade.`,
    date: '2026-09-01',
  },
  {
    id: 'txt-2',
    title: 'A Importância do Culto Comunitário para o Confirmando',
    category: 'Liturgia',
    author: 'Pastor Everton Figur',
    summary: 'Por que acompanhamos 24 presenças mensais durante os 24 meses do Ensino Confirmatório.',
    content: `O Ensino Confirmatório não é apenas um curso teórico de sala de aula, mas uma imersão na vida da Igreja de Cristo. Durante os 24 meses de formação, a participação regular nos cultos dominicais com a comunidade ensina o jovem a ouvir com atenção a pregação da Palavra, confessar seus pecados com os irmãos e louvar ao Deus da graça.
Ao anotar a leitura bíblica e elaborar o resumo da mensagem, o aluno desenvolve discernimento espiritual e aprende a guardar no coração as verdades eternas.`,
    date: '2026-08-25',
  },
];

// Seed sample students for realistic demo experience (clearly identified)
export const INITIAL_DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'demo-student-1',
    name: 'Mateus Silva Silveira (Demonstração)',
    email: 'mateus.confirmando@exemplo.com',
    role: 'student',
    phone: '(55) 99876-5432',
    birthDate: '2011-04-15',
    cep: '85750-000',
    state: 'PR',
    city: 'Planalto',
    neighborhood: 'Centro',
    street: 'Rua das Flores',
    number: '340',
    complement: 'Apto 201',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    courseType: 'confirmatorio',
    congregationId: 'cel-sao-paulo',
    congregationName: 'CEL São Paulo – Planalto',
    status: 'approved',
    createdAt: '2025-03-01T10:00:00.000Z',
    enrollmentDate: '2025-03-05T14:00:00.000Z',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // Removed default password
    salt: 'secure_random_salt_' + Math.random().toString(36).substring(7),
    baptism: {
      isBaptized: true,
      date: '2011-06-12',
      church: 'CEL São Paulo – Planalto',
      city: 'Planalto',
      state: 'PR',
      notes: 'Batizado pelo pastor da época com os padrinhos familiares.',
    },
    internalNotes: [
      {
        id: 'note-1',
        date: '2026-08-10',
        authorName: 'Pastor Everton Figur',
        category: 'Formação',
        content: 'Aluno participativo nas aulas e muito dedicado à memorização dos mandamentos.',
      },
    ],
  },
  {
    id: 'demo-student-2',
    name: 'Ana Paula Hoffmann (Demonstração)',
    email: 'ana.profissao@exemplo.com',
    role: 'student',
    phone: '(55) 99123-4567',
    birthDate: '1995-11-20',
    cep: '85750-000',
    state: 'PR',
    city: 'São Marcos',
    neighborhood: 'Bela Vista',
    street: 'Av. Brasil',
    number: '1205',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    courseType: 'profissao_fe',
    congregationId: 'cel-bom-pastor',
    congregationName: 'CEL Bom Pastor – São Marcos',
    status: 'pending', // Waiting for Pastor Everton Figur's approval!
    createdAt: '2026-09-14T11:30:00.000Z',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    salt: 'secure_random_salt_' + Math.random().toString(36).substring(7),
    baptism: {
      isBaptized: true,
      date: '1996-01-14',
      church: 'Paróquia Evangélica de Confissão Luterana',
      city: 'Santa Maria',
      state: 'RS',
      notes: 'Possui certidão de batismo emitida na época.',
    },
    churchHistory: [
      {
        id: 'hist-1',
        churchName: 'Comunidade Evangélica São Pedro',
        city: 'Santa Maria',
        state: 'RS',
        period: '2010 a 2018',
        notes: 'Participava de cultos e grupos de estudo bíblico.',
      },
    ],
  },
];

export const INITIAL_DEMO_WORSHIPS: WorshipRecord[] = [
  {
    id: 'worship-demo-1',
    studentId: 'demo-student-1',
    studentName: 'Mateus Silva Silveira (Demonstração)',
    congregationId: 'cel-sao-paulo',
    congregationName: 'CEL São Paulo – Planalto',
    worshipDate: '2026-08-09',
    monthIndex: 1,
    scriptureReading: 'Mateus 14.22-33 — Jesus anda sobre as águas',
    sermonText: 'Mateus 14.31 — Homem de pequena fé, por que duvidaste?',
    sermonSummary: 'O pastor pregou sobre como Pedro olhou para as ondas e começou a afundar, mas Jesus estendeu a mão imediatamente. Nossa fé deve olhar para Cristo e não para as tempestades da vida.',
    photoUrl: 'https://images.unsplash.com/photo-1548625361-1960251bb4c9?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    submittedAt: '2026-08-09T18:00:00.000Z',
    reviewedAt: '2026-08-10T09:30:00.000Z',
    pastorNotes: 'Excelente resumo, Mateus! Continue firme na participação dominical.',
  },
  {
    id: 'worship-demo-2',
    studentId: 'demo-student-1',
    studentName: 'Mateus Silva Silveira (Demonstração)',
    congregationId: 'cel-sao-paulo',
    congregationName: 'CEL São Paulo – Planalto',
    worshipDate: '2026-09-06',
    monthIndex: 2,
    scriptureReading: 'Romanos 12.1-8 — O culto racional e os dons espirituais',
    sermonText: 'Romanos 12.2 — Transformai-vos pela renovação da vossa mente',
    sermonSummary: 'A mensagem explicou que o verdadeiro culto continua no nosso dia a dia, servindo a Deus com amor na família e na escola, não nos conformando com os erros do mundo.',
    photoUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    status: 'pending', // In the queue for Pastor Everton Figur to approve!
    submittedAt: '2026-09-06T20:15:00.000Z',
  },
];

export const INITIAL_DEMO_GRADES: Grade[] = [
  {
    id: 'grade-demo-1',
    studentId: 'demo-student-1',
    studentName: 'Mateus Silva Silveira (Demonstração)',
    activityId: 'act-conf-1',
    activityTitle: 'Atividade 1: Fundamentos da Fé e Bíblia Sagrada',
    score: 10,
    maxScore: 10,
    percentage: 100,
    submittedAt: '2026-08-15T16:20:00.000Z',
    answers: { 'q-1': 2, 'q-2': 0, 'q-3': 1, 'q-4': 1 },
    feedback: 'Parabéns pela dedicação e precisão teológica nas respostas!',
  },
];

export const INITIAL_DEMO_CATECHISM_ASSESSMENTS: CatechismAssessment[] = [
  {
    id: 'ass-demo-1',
    studentId: 'demo-student-1',
    sectionId: 'cat-1',
    sectionTitle: 'Primeiro Mandamento',
    status: 'Memorizado',
    date: '2026-08-20',
    grade: 9.5,
    observation: 'Excelente memorização do mandamento e do significado dado por Lutero.',
    updatedBy: 'Pastor Everton Figur',
  },
  {
    id: 'ass-demo-2',
    studentId: 'demo-student-1',
    sectionId: 'cat-2',
    sectionTitle: 'Segundo Mandamento',
    status: 'Memorizado',
    date: '2026-08-27',
    grade: 9.0,
    observation: 'Boa explicação sobre invocar o nome de Deus em orações e louvores.',
    updatedBy: 'Pastor Everton Figur',
  },
  {
    id: 'ass-demo-3',
    studentId: 'demo-student-1',
    sectionId: 'cat-3',
    sectionTitle: 'Terceiro Mandamento',
    status: 'Em andamento',
    date: '2026-09-03',
    grade: 8.0,
    observation: 'Em fase de fixação do significado.',
    updatedBy: 'Pastor Everton Figur',
  },
];

// Initial Data for Public Portal (Acesso Geral dos Membros)
export const INITIAL_PUBLIC_VIDEOS: PublicVideo[] = [
  {
    id: 'pvid-1',
    title: 'Culto Dominical: A Paz que Excede Todo o Entendimento',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Pregação gravada na Paróquia sobre Romanos 5. A certeza da justificação pela graça mediante a fé em Cristo Jesus.',
    speaker: 'Pastor Everton Figur',
    date: '2026-09-13',
    category: 'Mensagem de Culto',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    congregationName: 'CEL São Paulo – Planalto',
  },
  {
    id: 'pvid-2',
    title: 'Estudo em Vídeo: Os Quatro Pilares da Reforma Luterana',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: 'Graça Somente, Fé Somente, Escritura Somente e Cristo Somente: o que isso significa para nossa vida diária e familiar.',
    speaker: 'Pastor Everton Figur',
    date: '2026-09-06',
    category: 'Estudo Doutrinário',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80',
    congregationName: 'Paróquia Paroquial',
  },
  {
    id: 'pvid-3',
    title: 'Mensagem aos Lares: Oração e Fé no Seio Familiar',
    videoUrl: 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
    description: 'Como reunir a família em oração diária com o Catecismo Menor e a Bíblia Sagrada.',
    speaker: 'Pastor Everton Figur',
    date: '2026-08-30',
    category: 'Família Cristã',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&auto=format&fit=crop&q=80',
    congregationName: 'CEL Bom Pastor – São Marcos',
  },
];

export const INITIAL_PUBLIC_AUDIOS: PublicAudio[] = [
  {
    id: 'paud-1',
    title: 'Sermão em Áudio: Salmo 23 – O Senhor é o Meu Pastor',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'Mensagem edificante sobre o cuidado maternal e paternal de Deus para com as Suas ovelhas nas horas mais difíceis.',
    speaker: 'Pastor Everton Figur',
    date: '2026-09-17',
    category: 'Pregação Gravada',
    durationMinutes: 19,
    fileSize: '18.2 MB',
  },
  {
    id: 'paud-2',
    title: 'Meditação Pastoral: A Firme Promessa do Santo Batismo',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Reflexão curta sobre como nos lembrar diariamente de que fomos batizados em nome do Pai, do Filho e do Espírito Santo.',
    speaker: 'Pastor Everton Figur',
    date: '2026-09-10',
    category: 'Devocional em Áudio',
    durationMinutes: 11,
    fileSize: '10.5 MB',
  },
  {
    id: 'paud-3',
    title: 'Hino Luterano: Castelo Forte é Nosso Deus',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Hino solene da Reforma composto por Martinho Lutero, entoado para edificação do coração dos fiéis.',
    speaker: 'Música e Louvor Paroquial',
    date: '2026-09-02',
    category: 'Hinos & Cânticos',
    durationMinutes: 5,
    fileSize: '4.8 MB',
  },
];

export const INITIAL_PUBLIC_BIBLE_STUDIES: PublicBibleStudy[] = [
  {
    id: 'pstd-1',
    title: 'A Doutrina dos Dois Reinos segundo a Teologia Luterana',
    biblicalPassage: 'Romanos 13.1-7 & São João 18.36',
    category: 'Teologia Luterana',
    author: 'Pastor Everton Figur',
    date: '2026-09-15',
    tags: ['Reforma', 'Cidadania', 'Fé e Política', 'Lutero'],
    content: `A doutrina dos dois reinos formulada por Martinho Lutero distingue a forma como Deus governa o mundo:

1. O REINO DA MÃO ESQUERDA (O Governo Temporal):
Deus estabelece autoridades civis, leis e a ordem social para conter a maldade, preservar a paz externa e garantir a justiça comum. O instrumento deste reino é a lei, a razão e, quando necessário, a autoridade civil. Os cristãos servem com fidelidade nesse reino por meio da sua vocação profissional, honrando pais e magistrados.

2. O REINO DA MÃO DIREITA (O Governo Espiritual):
Deus governa a Igreja por meio do Evangelho, da pregação da Palavra e dos Santos Sacramentos (Batismo e Santa Ceia). Neste reino não há coerção pela força da espada terrena, mas perdão, regeneração do coração pelo Espírito Santo e graça eterna.

CONCLUSÃO PRÁTICA:
O cristão vive simultaneamente nos dois reinos: é cidadão fiel na sociedade terrena e herdeiro pela fé do Reino celestial eterno. Jamais devemos confundir as duas esferas, mas glorificar a Deus em ambas.`,
  },
  {
    id: 'pstd-2',
    title: 'O Batismo como Aliança Eterna e Lavagem da Regeneração',
    biblicalPassage: 'São Mateus 28.19-20 & Tito 3.5-7',
    category: 'Sacramentos',
    author: 'Pastor Everton Figur',
    date: '2026-09-08',
    tags: ['Batismo', 'Sacramento', 'Catecismo'],
    content: `No Santo Batismo não é mera água pura, mas água compreendida no mandamento de Deus e ligada com a palavra de Deus:

1. O QUE DEUS REALIZA NO BATISMO?
O Batismo opera o perdão dos pecados, livra da morte e do diabo e dá a eterna salvação a todos que creem no que dizem as palavras e promessas divinas.

2. COMO A ÁGUA PODE FAZER COISAS TÃO GRANDES?
Não é a água certamente que as faz, mas a palavra de Deus que está com e junto à água, e a fé que confia nessa palavra de Deus posta na água.

3. O USO DIÁRIO DO BATISMO:
Lutero ensina que o Batismo significa que o velho Adão em nós deve ser afogado pelo arrependimento diário e morrer com todos os pecados e maus desejos; e, pelo contrário, deve ressurgir dia a dia o novo homem que viva eternamente diante de Deus em justiça e pureza.`,
  },
  {
    id: 'pstd-3',
    title: 'Como Realizar o Culto Doméstico com Filhos e Jovens',
    biblicalPassage: 'Deuteronômio 6.4-9 & Salmo 78.1-7',
    category: 'Família Cristã',
    author: 'Pastor Everton Figur',
    date: '2026-08-28',
    tags: ['Família', 'Oração', 'Culto Doméstico'],
    content: `O lar cristão é a primeira igreja que a criança e o jovem conhecem. Deus confiou aos pais a sublime vocação de ensinar Seus mandamentos ao levantar, ao deitar e pelo caminho.

Passos sugeridos para um culto doméstico de 10 a 15 minutos:
1. Invocação: 'Em nome do Pai, e do Filho e do Espírito Santo.'
2. Cântico de um hino do Hinário Luterano ou louvor conhecido.
3. Leitura Bíblica curta (1 capítulo ou trecho do Evangelho).
4. Uma parte do Catecismo Menor (Mandamento, Artigo do Credo ou Petição do Pai-Nosso).
5. Oração compartilhada: pedidos pelas necessidades da família, da congregação, da pátria e do mundo.
6. Oração do Pai-Nosso e a Bênção: 'O Senhor te abençoe e te guarde.'`,
  },
];

export const INITIAL_PUBLIC_EVENTS: PublicCalendarEvent[] = [
  {
    id: 'pevt-1',
    title: 'Culto Dominical com Santa Ceia',
    date: '2026-09-27',
    time: '09:00',
    location: 'CEL São Paulo – Planalto',
    category: 'culto',
    description: 'Culto festivo com celebração do Sacramento do Altar e acolhida de todas as famílias e visitantes da paróquia.',
    congregationId: 'cel-sao-paulo',
    congregationName: 'CEL São Paulo – Planalto',
  },
  {
    id: 'pevt-2',
    title: 'Culto Vespertino da Comunidade',
    date: '2026-09-27',
    time: '19:00',
    location: 'CEL Bom Pastor – São Marcos',
    category: 'culto',
    description: 'Culto dominical noturno com hinos de louvor e reflexão na Palavra.',
    congregationId: 'cel-bom-pastor',
    congregationName: 'CEL Bom Pastor – São Marcos',
  },
  {
    id: 'pevt-3',
    title: 'Culto Dominical da Família Cristã',
    date: '2026-10-04',
    time: '10:00',
    location: 'CEL Santíssima Trindade – Sagrada Família',
    category: 'culto',
    description: 'Celebração com a comunidade, liturgia luterana e comunhão com Santa Ceia.',
    congregationId: 'cel-santissima-trindade',
    congregationName: 'CEL Santíssima Trindade – Sagrada Família',
  },
  {
    id: 'pevt-4',
    title: 'Estudo Bíblico Paroquial Semanal',
    date: '2026-10-01',
    time: '19:30',
    location: 'Salão Paroquial – Planalto',
    category: 'estudo',
    description: 'Estudo temático sobre as Cartas Paulinas e vida cristã. Aberto a todos os membros e interessados.',
    congregationId: 'all',
    congregationName: 'Toda a Paróquia (Geral)',
  },
  {
    id: 'pevt-5',
    title: 'Culto Jovem e Encontro da Juventude (JELB)',
    date: '2026-10-10',
    time: '19:00',
    location: 'CEL Concórdia – Santa Rita',
    category: 'juventude',
    description: 'Culto jovem participativo com cânticos contemporâneos, reflexão e comunhão.',
    congregationId: 'cel-concordia',
    congregationName: 'CEL Concórdia – Santa Rita',
  },
  {
    id: 'pevt-6',
    title: 'Almoço Festivo Comunitário da Reforma',
    date: '2026-10-25',
    time: '11:30',
    location: 'Pavilhão Comunitário São Paulo – Planalto',
    category: 'festa',
    description: 'Almoço de confraternização anual das congregações da Paróquia Luterana em comemoração ao Mês da Reforma.',
    congregationId: 'all',
    congregationName: 'Toda a Paróquia (Geral)',
  },
];

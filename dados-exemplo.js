/* =====================================================================
   dados-exemplo.js — Evangelho no Lar (app de condução)
   Valores iniciais (semente), usados só na primeira abertura de cada
   aparelho, enquanto o Drive não está ligado (passo 4 da especificação).
   Depois da primeira abertura, o que vale é o que está guardado.

   Regras deste arquivo (repositório público, ESPECIFICACAO 15):
   - sem link da sala (é cadastrado no Modo edição);
   - sem nomes de participantes;
   - sem texto dos livros (D-03, D-14).
   A Prece de Cáritas não é texto dos livros. Transcrição da imagem usada
   pela Tatiana, ainda a conferir (P-6).
   ===================================================================== */
window.ENL_SEMENTE = {
  conteudo: {
    formato: 1,
    meet: '',
    etapas: [
      { id: 'antes', titulo: 'Antes do encontro', texto: 'Enviar mensagem e link. Entrar na sala às 20h55.' },
      { id: 'le', titulo: 'O Livro dos Espíritos', texto: 'Ler uma pergunta, sem se alongar.' },
      { id: 'prece-inicial', titulo: 'Prece inicial', texto: 'Fazer a prece inicial.', topicos: [] },
      { id: 'ese', titulo: 'O Evangelho Segundo o Espiritismo', texto: '' },
      { id: 'debate', titulo: 'Comentários', texto: 'Sem comentários: continuar lendo se o próximo item for curto.' },
      { id: 'oracao', titulo: 'Oração conduzida', topicos: ['Crianças em orfanatos', 'Asilos', 'Pessoas em situação de rua', 'A casa de cada presente'] },
      { id: 'caritas', titulo: 'Prece de Cáritas' },
      { id: 'aguas', titulo: 'Fluidificação das águas', texto: 'Pedir a fluidificação das águas de todos.', topicos: [] },
      { id: 'agradecimento', titulo: 'Agradecimento e convite aos espíritos', texto: 'Agradecer aos espíritos e convidar para o próximo encontro.', topicos: [] },
      { id: 'encaminhamento', titulo: 'Encaminhamento dos espíritos', texto: 'Pedir que os espíritos que vieram aprender saibam voltar, e que os que já estavam sejam amparados e levados ao hospital espiritual.', topicos: [] },
      { id: 'ave-maria', titulo: 'Ave Maria', texto: 'Rezar a Ave Maria. Depois, cada um bebe sua água.', topicos: [] },
      { id: 'descontracao', titulo: 'Descontração', texto: 'Conversa livre da família, de 2 a 10 minutos.' },
      { id: 'finalizar', titulo: 'Finalizar' }
    ],
    caritas: [
      'Deus nosso Pai, que sois todo poder e bondade.',
      'Dai força àquele que passa pela provação, dai a luz àquele que procura a verdade, ponde no coração do homem a compaixão e a caridade.',
      'DEUS! Dai ao viajor a estrela-guia, ao aflito a consolação, ao doente o repouso.',
      'PAI! Dai ao culpado o arrependimento, ao espírito a verdade, à criança o guia, ao órfão o pai.',
      'SENHOR! Que a Vossa bondade se estenda sobre tudo que criaste.',
      'Piedade, Senhor, para aquele que não Vos conhece, esperança para aquele que sofre.',
      'Que a Vossa bondade permita aos espíritos consoladores derramarem por toda a parte a Paz, a Esperança e a Fé.',
      'DEUS! Um reflexo, uma centelha do Vosso amor, pode abrasar a Terra! Deixai-nos beber na fonte da Vossa bondade fecunda e infinita, e todas as lágrimas secarão, todas as dores se acalmarão.',
      'Um só coração um só pensamento subirão até Vós, como um grito de reconhecimento e de amor.',
      'Como Moisés sobre a montanha, nós Vos esperamos de braços abertos, oh, Poder! Oh, Bondade! Oh, Perfeição! E queremos de alguma forma merecer a Vossa misericórdia.',
      'DEUS! Dai-nos a força de ajudar o progresso, a fim de subirmos até Vós! Dai-nos a caridade pura! Dai-nos a Fé e a Razão! Dai-nos a simplicidade que fará de nossas almas o espelho onde deve refletir a Vossa Imagem.'
    ],
    mensagem: {
      modelo: [
        'Boa noite família e amigos. ✨💞',
        '',
        'Iniciaremos o nosso Evangelho no Lar às *21h em ponto* 🕘',
        '',
        'Peguem por gentileza suas águas e estejam prontos às 20h55 🥛',
        '',
        '📖 *Livro: Evangelho Segundo o Espiritismo*',
        '',
        '*=> Capítulo {romano} ({numero}) — {nomeCapitulo}*',
        '',
        '*{secao}*',
        '',
        '*{titulo}*',
        '',
        '{item} - {trecho}... ... ...',
        '',
        'Deus abençoe a todos nós 🙏'
      ].join('\n')
    },
    preferencias: { fonte: 'Atkinson Hyperlegible', tamanho: 28, corFundoPrece: '#2F3D9E' },
    presentesConhecidos: []
  },

  // Valores de 01/10/2026 (ESPECIFICACAO 5.2 e 20). Conferir em
  // Modo edição › Leituras na primeira abertura.
  estado: {
    formato: 1,
    le: { ultimaPergunta: 26, proxima: 27 },
    ese: { capitulo: 13, nomeCapitulo: '', secao: 'Instruções dos espíritos', titulo: '', ultimoItem: 18, proximoItem: 19 },
    encontroEmAndamento: null
  }
};

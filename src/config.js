export const STORAGE_KEYS = {
  ranking: 'fama-donors-v2',
  panelCode: 'fama-panel-code',
  liveSession: 'fama-liveplus-session'
};

export const POINT_RULES = {
  likesPerPoint: 20,
  commentsPerPoint: 10,
  followPoints: 50,
  diamondPoints: 1
};

export const GAME_MANIFEST = {
  protocol: 'liveplus-game-manifest-v1',
  gameId: 'fama',
  name: 'Rank da Fama',
  icon: 'FA',
  version: '1.2.0',
  actions: [
    {
      id: 'fama_like',
      label: 'Likes → pontos',
      description: 'Converte curtidas em pontos. 20 likes = 1 ponto.'
    },
    {
      id: 'fama_comment',
      label: 'Comentários → pontos',
      description: 'Converte comentários em pontos. 10 comentários = 1 ponto.'
    },
    {
      id: 'fama_follow',
      label: 'Follow → pontos',
      description: 'Adiciona 50 pontos quando o usuário segue.'
    },
    {
      id: 'fama_gift',
      label: 'Presentes → pontos',
      description: 'Converte diamantes/moedas do presente em pontos. 1 diamante = 1 ponto.'
    },
    {
      id: 'fama_points',
      label: 'Adicionar pontos manualmente',
      description: 'Adiciona uma quantidade manual de pontos ao usuário.',
      params: [
        { id: 'amount', label: 'Pontos', type: 'number', min: 1, default: 1 }
      ]
    }
  ],
  adminTools: [
    {
      id: 'fama_reset_points',
      label: 'Resetar ranking',
      description: 'Zera todos os pontos e limpa o Top 10.'
    }
  ]
};

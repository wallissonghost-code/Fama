export const STORAGE_KEYS = {
  ranking: 'fama-donors-v2',
  panelCode: 'fama-panel-code',
  liveSession: 'fama-liveplus-session'
};

export const GAME_MANIFEST = {
  protocol: 'liveplus-game-manifest-v1',
  gameId: 'fama',
  name: 'Rank da Fama',
  icon: 'FA',
  version: '1.1.0',
  actions: [
    {
      id: 'fama_points',
      label: 'Adicionar pontos',
      description: 'Adiciona pontos ao usuário que interagiu na live',
      params: [
        { id: 'amount', label: 'Pontos', type: 'number', min: 1, default: 1 }
      ]
    }
  ]
};

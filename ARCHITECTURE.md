# Arquitetura do Fama

O projeto foi dividido para que alterações visuais, ranking e conexão Live+ não fiquem acopladas no mesmo arquivo.

## Estrutura

```text
Fama/
├─ index.html
├─ README.md
├─ ARCHITECTURE.md
├─ styles/
│  ├─ base.css
│  ├─ ranking.css
│  └─ connection.css
└─ src/
   ├─ config.js
   ├─ ranking-store.js
   ├─ ranking-view.js
   ├─ connection-panel.js
   ├─ live-command.js
   ├─ liveplus-session.js
   ├─ live-bridge.js
   └─ main.js
```

## Responsabilidades

- `index.html`: somente estrutura da tela e carregamento dos recursos.
- `styles/base.css`: página, viewport e cartão principal.
- `styles/ranking.css`: Top 3 e posições 4–10.
- `styles/connection.css`: modal oculto aberto pela letra A de FAMA.
- `src/config.js`: chaves de armazenamento e manifesto Live+.
- `src/ranking-store.js`: dados, persistência e regras do ranking.
- `src/ranking-view.js`: renderização do ranking no DOM.
- `src/connection-panel.js`: campo de código e estado visual da conexão.
- `src/live-command.js`: leitura e normalização dos comandos vindos do painel.
- `src/liveplus-session.js`: transporte PeerJS/Live+ e reconexão.
- `src/live-bridge.js`: liga os comandos da live ao ranking.
- `src/main.js`: inicializa os módulos e expõe `window.Fama`.

## Regra para futuras alterações

Mudança visual do ranking deve ficar em `ranking.css`/`ranking-view.js`. Mudança no painel oculto deve ficar em `connection.css`/`connection-panel.js`. Mudança no protocolo ou transporte Live+ deve ficar somente nos arquivos `live-*`. Persistência futura em banco deve substituir a implementação de `ranking-store.js` sem exigir reescrever a tela.

## Ponto ainda provisório

O ranking ainda usa `localStorage`, portanto os dados não são compartilhados entre dispositivos. Para produção, a troca por banco persistente deve ser feita atrás da interface do `RankingStore`, preservando o restante do sistema.

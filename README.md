# Fama

Ranking vertical de fama/doadores para lives, integrado ao ecossistema Live+ do Projeto Daniel.

## Estado atual

- Interface vertical 9:16.
- Top 10 com destaque visual para Top 3.
- Top 3 com espaço para avatar, @ e pontos.
- Posições 4–10 com @ e pontos.
- Painel de conexão oculto atrás da última letra `A` de `FAMA`.
- Conexão por código de 8 caracteres com o painel do Projeto Daniel via PeerJS/Live+.
- Reconexão automática limitada na sessão.
- Persistência local do ranking para o MVP.
- API simples disponível em `window.Fama`.

```js
Fama.registerGift({
  id: 'tiktok-user-id',
  handle: '@usuario',
  name: 'Usuario',
  avatar: 'https://...',
  amount: 100
});

Fama.markViewer({ id: 'tiktok-user-id', handle: '@usuario' });
```

## Organização

O projeto foi modularizado para evitar concentrar interface, dados e conexão no mesmo arquivo. A descrição completa está em `ARCHITECTURE.md`.

Resumo:

```text
styles/  -> estilos separados por responsabilidade
src/     -> ranking, conexão Live+, painel e inicialização
index.html -> estrutura da página
```

## Persistência

O MVP ainda usa `localStorage`. Isso mantém os dados somente no navegador atual. Para o ranking persistir entre dias, dispositivos e diferentes máquinas da live, a próxima evolução deve substituir a camada de `ranking-store.js` por um backend/banco persistente.

# Fama

Ranking vertical de fama/doadores para lives.

## MVP atual

- Interface 9:16 para celular/overlay vertical.
- Top 10 de doadores.
- Destaque visual para Top 3.
- Foto, @, pontuação de fama e última aparição.
- Abas: Fama acumulada, Hoje e 10 dias.
- Persistência local para demonstração.
- API simples no navegador para receber eventos da live:

```js
Fama.registerGift({
  id: 'tiktok-user-id',
  handle: '@usuario',
  name: 'Usuario',
  avatar: 'https://...',
  amount: 100
})

Fama.markViewer({ id: 'tiktok-user-id', handle: '@usuario' })
```

## Próxima etapa para produção

A persistência local deve ser substituída por banco de dados real (por exemplo Supabase/Firebase), porque localStorage só guarda os dados no dispositivo/navegador atual. Também é necessário um conector de eventos da plataforma de live para registrar entrada de usuário e presentes em tempo real.

Modelo recomendado de dados:

- `users`: id da plataforma, @, nome, avatar, primeira/última aparição.
- `gift_events`: usuário, valor/moedas, presente, timestamp, live_id.
- Ranking calculado por soma de eventos nos intervalos desejados.

Assim, alguém que foi top doador ontem, há 10 dias ou anteriormente continua reconhecido quando entrar novamente na live.

const formatPoints = value => new Intl.NumberFormat('pt-BR').format(Number(value) || 0);

function emptySlot(rank) {
  return {
    id: `slot-${rank}`,
    handle: '@user',
    name: '',
    avatar: '',
    total: 0,
    placeholder: true
  };
}

function podiumCard(donor, rank) {
  const cssClass = rank === 1 ? 'first' : rank === 3 ? 'third' : 'second';
  const avatar = donor.avatar
    ? `<img class="avatar" src="${donor.avatar}" alt="${donor.handle}">`
    : '<div class="avatar avatar-empty" aria-label="Espaço para foto"></div>';

  return `
    <article class="podium-user ${cssClass}">
      <div class="avatar-wrap">
        ${avatar}
        <span class="rank-badge">${rank}</span>
      </div>
      <h2>${donor.handle}</h2>
      <p class="podium-points">${formatPoints(donor.total)} pts</p>
    </article>`;
}

export function renderRanking(donors) {
  const podium = document.getElementById('podium');
  const rankingList = document.getElementById('rankingList');
  if (!podium || !rankingList) return;

  const slots = Array.from({ length: 10 }, (_, index) => donors[index] || emptySlot(index + 1));

  podium.innerHTML = [
    podiumCard(slots[1], 2),
    podiumCard(slots[0], 1),
    podiumCard(slots[2], 3)
  ].join('');

  rankingList.innerHTML = slots.slice(3).map((donor, index) => `
    <li class="rank-row ${donor.placeholder ? 'placeholder' : ''}">
      <span class="rank-number">${index + 4}</span>
      <strong>${donor.handle}</strong>
      <span class="row-points">${formatPoints(donor.total)} pts</span>
    </li>`).join('');
}

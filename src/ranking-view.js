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

function safeAvatarUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function createPodiumCard(donor, rank) {
  const article = document.createElement('article');
  article.className = `podium-user ${rank === 1 ? 'first' : rank === 3 ? 'third' : 'second'}`;

  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'avatar-wrap';

  const aura = document.createElement('span');
  aura.className = 'podium-aura';
  aura.setAttribute('aria-hidden', 'true');
  avatarWrap.appendChild(aura);

  const avatarUrl = safeAvatarUrl(donor.avatar);
  if (avatarUrl) {
    const image = document.createElement('img');
    image.className = 'avatar';
    image.src = avatarUrl;
    image.alt = donor.handle || 'Foto do usuário';
    image.addEventListener('error', () => {
      const empty = document.createElement('div');
      empty.className = 'avatar avatar-empty';
      empty.setAttribute('aria-label', 'Espaço para foto');
      image.replaceWith(empty);
    }, { once: true });
    avatarWrap.appendChild(image);
  } else {
    const empty = document.createElement('div');
    empty.className = 'avatar avatar-empty';
    empty.setAttribute('aria-label', 'Espaço para foto');
    avatarWrap.appendChild(empty);
  }

  const badge = document.createElement('span');
  badge.className = 'rank-badge';
  badge.textContent = String(rank);
  avatarWrap.appendChild(badge);

  const handle = document.createElement('h2');
  handle.textContent = donor.handle || '@user';

  const points = document.createElement('p');
  points.className = 'podium-points';
  points.textContent = `${formatPoints(donor.total)} pts`;

  article.append(avatarWrap, handle, points);
  return article;
}

function createRankingRow(donor, rank) {
  const row = document.createElement('li');
  row.className = `rank-row ${donor.placeholder ? 'placeholder' : ''}`.trim();

  const number = document.createElement('span');
  number.className = 'rank-number';
  number.textContent = String(rank);

  const handle = document.createElement('strong');
  handle.textContent = donor.handle || '@user';

  const points = document.createElement('span');
  points.className = 'row-points';
  points.textContent = `${formatPoints(donor.total)} pts`;

  row.append(number, handle, points);
  return row;
}

export function renderRanking(donors) {
  const podium = document.getElementById('podium');
  const rankingList = document.getElementById('rankingList');
  if (!podium || !rankingList) return;

  const slots = Array.from({ length: 10 }, (_, index) => donors[index] || emptySlot(index + 1));

  podium.replaceChildren(
    createPodiumCard(slots[1], 2),
    createPodiumCard(slots[0], 1),
    createPodiumCard(slots[2], 3)
  );

  rankingList.replaceChildren(
    ...slots.slice(3).map((donor, index) => createRankingRow(donor, index + 4))
  );
}

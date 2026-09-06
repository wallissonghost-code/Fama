const formatPoints = value => new Intl.NumberFormat('pt-BR').format(Number(value) || 0);

const PODIUM_FRAMES = {
  1: '180B73AE-604F-4094-8A0A-63DC54693CA0.png',
  2: 'CB5B2A1A-CCB0-46A9-932B-7EEF9803E089.png',
  3: 'AE862B77-A154-43D0-ADAD-AAFB306335E4.png'
};

function emptySlot(rank) {
  return { id:`slot-${rank}`, handle:'@user', name:'', avatar:'', total:0, placeholder:true };
}

function safeAvatarUrl(value='') {
  const raw=String(value||'').trim();
  if(!raw) return '';
  try { const url=new URL(raw,window.location.href); return ['http:','https:'].includes(url.protocol)?url.href:''; }
  catch { return ''; }
}

function createPodiumCard(donor,rank) {
  const article=document.createElement('article');
  article.className=`podium-user ${rank===1?'first':rank===3?'third':'second'}`;

  const stage=document.createElement('div');
  stage.className='podium-stage';

  const avatarWrap=document.createElement('div');
  avatarWrap.className='avatar-wrap';
  const avatarUrl=safeAvatarUrl(donor.avatar);
  if(avatarUrl){
    const image=document.createElement('img');
    image.className='avatar'; image.src=avatarUrl; image.alt=donor.handle||'Foto do usuário';
    image.addEventListener('error',()=>{const empty=document.createElement('div');empty.className='avatar avatar-empty';image.replaceWith(empty)},{once:true});
    avatarWrap.appendChild(image);
  } else {
    const empty=document.createElement('div'); empty.className='avatar avatar-empty'; avatarWrap.appendChild(empty);
  }

  const frame=document.createElement('img');
  frame.className='podium-frame';
  frame.src=PODIUM_FRAMES[rank];
  frame.alt=''; frame.setAttribute('aria-hidden','true');

  stage.append(avatarWrap,frame);

  const handle=document.createElement('h2'); handle.textContent=donor.handle||'@user';
  const points=document.createElement('p'); points.className='podium-points'; points.textContent=`${formatPoints(donor.total)} pts`;
  article.append(stage,handle,points);
  return article;
}

function createRankingRow(donor,rank){
  const row=document.createElement('li'); row.className=`rank-row ${donor.placeholder?'placeholder':''}`.trim();
  const number=document.createElement('span'); number.className='rank-number'; number.textContent=String(rank);
  const handle=document.createElement('strong'); handle.textContent=donor.handle||'@user';
  const points=document.createElement('span'); points.className='row-points'; points.textContent=`${formatPoints(donor.total)} pts`;
  row.append(number,handle,points); return row;
}

export function renderRanking(donors){
  const podium=document.getElementById('podium'),rankingList=document.getElementById('rankingList');
  if(!podium||!rankingList)return;
  const slots=Array.from({length:10},(_,i)=>donors[i]||emptySlot(i+1));
  podium.replaceChildren(createPodiumCard(slots[1],2),createPodiumCard(slots[0],1),createPodiumCard(slots[2],3));
  rankingList.replaceChildren(...slots.slice(3).map((donor,i)=>createRankingRow(donor,i+4)));
}
const STORAGE_KEY='fama-donors-v2';

const seed=[];
let donors=load();
let period='all';

function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||seed}catch{return seed}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(donors))}
function scoreOf(d){return period==='today'?d.today:period==='10d'?d.last10d:d.total}
function fmt(n){return new Intl.NumberFormat('pt-BR').format(n)}
function top(){return [...donors].filter(d=>scoreOf(d)>0).sort((a,b)=>scoreOf(b)-scoreOf(a)).slice(0,10)}
function slot(rank,d){return d||{id:`slot-${rank}`,handle:'@user',name:'',avatar:'',total:0,today:0,last10d:0,placeholder:true}}

function render(){
  const actual=top();
  const list=Array.from({length:10},(_,i)=>slot(i+1,actual[i]));
  const podium=document.querySelector('#podium');
  const order=[list[1],list[0],list[2]];

  podium.innerHTML=order.map((d,i)=>{
    const rank=i===1?1:i===0?2:3;
    const cls=rank===1?'first':rank===3?'third':'';
    const avatar=d.avatar
      ? `<img class="avatar" src="${d.avatar}" alt="${d.handle}">`
      : `<div class="avatar avatar-empty" aria-label="Espaço para foto"></div>`;
    return `<article class="podium-user ${cls}">
      <div class="avatar-wrap">${avatar}<span class="rank-badge">${rank}</span></div>
      <h2>${d.handle}</h2><p>${fmt(scoreOf(d))} pts</p>
    </article>`;
  }).join('');

  document.querySelector('#rankingList').innerHTML=list.slice(3).map((d,i)=>`
    <li class="rank-row ${d.placeholder?'placeholder':''}">
      <span class="rank-number">${i+4}</span>
      <div class="identity"><strong>${d.handle}</strong></div>
      <div class="score"><strong>${fmt(scoreOf(d))} pts</strong></div>
    </li>`).join('');
}

document.querySelectorAll('.period-tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  period=btn.dataset.period;
  render();
}));

// Bloqueia gestos de zoom comuns no iOS/Safari.
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});
let lastTouchEnd=0;
document.addEventListener('touchend',e=>{
  const now=Date.now();
  if(now-lastTouchEnd<=300)e.preventDefault();
  lastTouchEnd=now;
},{passive:false});

window.Fama={
  registerGift({id,handle,name,avatar,amount}){
    const now=Date.now();
    let d=donors.find(x=>x.id===id||x.handle===handle);
    if(!d){d={id:id||handle,handle,name:name||handle,avatar:avatar||'',total:0,today:0,last10d:0,lastSeen:now};donors.push(d)}
    d.handle=handle||d.handle;
    d.name=name||d.name;
    d.avatar=avatar||d.avatar;
    d.lastSeen=now;
    d.total+=(Number(amount)||0);
    d.today+=(Number(amount)||0);
    d.last10d+=(Number(amount)||0);
    save();render();return d;
  },
  markViewer({id,handle}){
    const d=donors.find(x=>x.id===id||x.handle===handle);
    if(d){d.lastSeen=Date.now();save();render();return d}
    return null;
  },
  getTop:()=>top(),
  resetDemo(){donors=[];save();render()}
};

save();render();

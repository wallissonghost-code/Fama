const STORAGE_KEY='fama-donors-v1';

const seed=[
  {id:'u1',handle:'@ghostzinha',name:'Ghostzinha',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=ghostzinha',total:18240,today:3200,last10d:15400,lastSeen:Date.now()-1000*60*4},
  {id:'u2',handle:'@mari.live',name:'Mari',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=mari',total:13920,today:5100,last10d:10600,lastSeen:Date.now()-1000*60*48},
  {id:'u3',handle:'@ray.oficial',name:'Ray',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=ray',total:11880,today:1200,last10d:9800,lastSeen:Date.now()-1000*60*60*19},
  {id:'u4',handle:'@nayra.m',name:'Nayra',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=nayra',total:8420,today:890,last10d:6400,lastSeen:Date.now()-1000*60*60*24*2},
  {id:'u5',handle:'@ana.luiza',name:'Ana Luiza',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=ana',total:7140,today:0,last10d:5100,lastSeen:Date.now()-1000*60*60*24*5},
  {id:'u6',handle:'@biax',name:'Bia',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=bia',total:6320,today:640,last10d:4320,lastSeen:Date.now()-1000*60*60*2},
  {id:'u7',handle:'@lele',name:'Lele',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=lele',total:4880,today:0,last10d:3800,lastSeen:Date.now()-1000*60*60*24*8},
  {id:'u8',handle:'@juju',name:'Juju',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=juju',total:3650,today:350,last10d:2600,lastSeen:Date.now()-1000*60*35},
  {id:'u9',handle:'@gabi',name:'Gabi',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=gabi',total:3020,today:120,last10d:1990,lastSeen:Date.now()-1000*60*60*24*1},
  {id:'u10',handle:'@luh',name:'Luh',avatar:'https://api.dicebear.com/9.x/thumbs/svg?seed=luh',total:2290,today:0,last10d:1800,lastSeen:Date.now()-1000*60*60*24*10}
];

let donors=load();
let period='all';

function load(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||seed}catch{return seed}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(donors))}
function scoreOf(d){return period==='today'?d.today:period==='10d'?d.last10d:d.total}
function fmt(n){return new Intl.NumberFormat('pt-BR').format(n)}
function ago(ts){
  const diff=Math.max(0,Date.now()-ts),m=Math.floor(diff/60000),h=Math.floor(m/60),d=Math.floor(h/24);
  if(m<1)return'agora'; if(m<60)return`há ${m} min`; if(h<24)return`há ${h} h`; return`há ${d} dia${d===1?'':'s'}`;
}
function top(){return [...donors].filter(d=>scoreOf(d)>0).sort((a,b)=>scoreOf(b)-scoreOf(a)).slice(0,10)}

function render(){
  const list=top();
  const podium=document.querySelector('#podium');
  const order=[list[1],list[0],list[2]];
  podium.innerHTML=order.map((d,i)=>{
    if(!d)return'<div></div>';
    const rank=i===1?1:i===0?2:3;
    return `<article class="podium-user ${rank===1?'first':''}">
      <div class="avatar-wrap"><img class="avatar" src="${d.avatar}" alt="${d.handle}"><span class="rank-badge">${rank}</span></div>
      <h2>${d.handle}</h2><p>${fmt(scoreOf(d))} fama</p>
    </article>`
  }).join('');

  const rows=list.slice(3);
  document.querySelector('#rankingList').innerHTML=rows.length?rows.map((d,i)=>`
    <li class="rank-row">
      <span class="rank-number">${i+4}</span>
      <img src="${d.avatar}" alt="${d.handle}">
      <div class="identity"><strong>${d.handle}</strong><span>Visto ${ago(d.lastSeen)}</span></div>
      <div class="score"><strong>${fmt(scoreOf(d))}</strong><span>FAMA</span></div>
    </li>`).join(''):'<li class="empty">Ainda não há doadores neste período.</li>';
}

document.querySelectorAll('.period-tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');period=btn.dataset.period;render();
}));

// Integração futura: chame esta função quando o conector da live receber um presente.
window.Fama={
  registerGift({id,handle,name,avatar,amount}){
    const now=Date.now();
    let d=donors.find(x=>x.id===id||x.handle===handle);
    if(!d){d={id:id||handle,handle,name:name||handle,avatar:avatar||`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(handle)}`,total:0,today:0,last10d:0,lastSeen:now};donors.push(d)}
    d.handle=handle||d.handle; d.name=name||d.name; d.avatar=avatar||d.avatar; d.lastSeen=now;
    d.total+=(Number(amount)||0); d.today+=(Number(amount)||0); d.last10d+=(Number(amount)||0);
    save();render();return d;
  },
  markViewer({id,handle}){
    const d=donors.find(x=>x.id===id||x.handle===handle); if(d){d.lastSeen=Date.now();save();render();return d} return null;
  },
  getTop:()=>top(),resetDemo(){donors=structuredClone(seed);save();render()}
};

save();render();

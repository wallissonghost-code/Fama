const HUD_VISIBLE_KEY='fama-score-hud-visible';

const DEFAULT_ITEMS=[
  {label:'Flor',points:'X',kind:'gift',symbol:'✦'},
  {label:'Presente',points:'X',kind:'gift',symbol:'◆'},
  {label:'Like',points:'X',kind:'like',symbol:'♥'}
];

const text=value=>String(value??'').trim();

function safeImageUrl(value=''){
  const raw=text(value);
  if(!raw)return'';
  try{const url=new URL(raw,window.location.href);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return''}
}

function actionId(rule={}){
  const action=rule.action;
  if(typeof action==='string')return action;
  return text(action?.id||rule.actionId||rule.command);
}

function ruleGameId(rule={}){
  return text(rule.gameId||rule.game?.id||rule.target?.gameId);
}

function triggerOf(rule={}){
  return text(rule.trigger?.type||rule.trigger||rule.type).toLowerCase();
}

function pointsOf(rule={}){
  const action=rule.action&&typeof rule.action==='object'?rule.action:{};
  const params=action.params||rule.params||{};
  const candidates=[params.amount,params.points,params.value,rule.points,rule.score];
  for(const value of candidates){const n=Number(value);if(Number.isFinite(n)&&n>0)return n}
  return 'X';
}

function giftMeta(rule={}){
  const gift=rule.gift&&typeof rule.gift==='object'?rule.gift:{};
  return{
    name:text(gift.name||rule.giftName||rule.gift||rule.label),
    icon:safeImageUrl(gift.icon||gift.image||rule.giftIcon||rule.icon)
  };
}

function labelFor(rule={}){
  const trigger=triggerOf(rule),gift=giftMeta(rule);
  if(gift.name)return gift.name;
  if(trigger.includes('like'))return 'Like';
  if(trigger.includes('follow'))return 'Seguir';
  if(trigger.includes('share'))return 'Compartilhar';
  if(trigger.includes('chat'))return 'Chat';
  if(trigger.includes('gift'))return 'Presente';
  return text(rule.name||rule.label)||'Interação';
}

function symbolFor(label,trigger){
  const value=`${label} ${trigger}`.toLowerCase();
  if(value.includes('rosa')||value.includes('rose')||value.includes('flor'))return '✿';
  if(value.includes('like'))return '♥';
  if(value.includes('follow')||value.includes('seguir'))return '+';
  if(value.includes('share')||value.includes('compart'))return '↗';
  if(value.includes('chat'))return '•••';
  return '◆';
}

function normalizeRule(rule={}){
  if(rule.enabled===false||rule.active===false)return null;
  const gameId=ruleGameId(rule);
  if(gameId&&gameId!=='fama')return null;
  const id=actionId(rule);
  if(id&&id!=='fama_points')return null;
  const trigger=triggerOf(rule),gift=giftMeta(rule),label=labelFor(rule);
  return{label,points:pointsOf(rule),kind:trigger||'gift',symbol:symbolFor(label,trigger),icon:gift.icon};
}

function savedVisible(){
  try{const saved=localStorage.getItem(HUD_VISIBLE_KEY);return saved===null?true:saved==='1'}catch{return true}
}

function renderItem(item){
  const card=document.createElement('article');
  card.className='score-hud-card';
  const icon=document.createElement('div');
  icon.className='score-hud-icon';
  if(item.icon){
    const img=document.createElement('img');img.src=item.icon;img.alt='';
    img.addEventListener('error',()=>{icon.replaceChildren(document.createTextNode(item.symbol||'◆'))},{once:true});
    icon.appendChild(img);
  }else icon.textContent=item.symbol||'◆';
  const copy=document.createElement('div');copy.className='score-hud-copy';
  const name=document.createElement('strong');name.textContent=item.label;
  const value=document.createElement('span');value.textContent=`+${item.points} pts`;
  copy.append(name,value);card.append(icon,copy);return card;
}

export function setupScoreHud(){
  const hud=document.getElementById('scoreHud');
  const toggle=document.getElementById('scoreHudToggle');
  let rules=[];

  const setVisible=(visible,{persist=true}={})=>{
    const active=Boolean(visible);
    if(hud)hud.hidden=!active;
    if(toggle)toggle.checked=active;
    if(persist){try{localStorage.setItem(HUD_VISIBLE_KEY,active?'1':'0')}catch{}}
    return active;
  };

  const render=(items=DEFAULT_ITEMS)=>{
    if(!hud)return;
    const list=items.length?items:DEFAULT_ITEMS;
    hud.replaceChildren(...list.slice(0,6).map(renderItem));
    hud.dataset.count=String(Math.min(list.length,6));
  };

  const syncRules=nextRules=>{
    rules=Array.isArray(nextRules)?nextRules:[];
    const items=rules.map(normalizeRule).filter(Boolean);
    render(items);
  };

  if(toggle)toggle.addEventListener('change',event=>setVisible(event.target.checked));
  setVisible(savedVisible(),{persist:false});
  render();

  return{syncRules,setVisible,getRules:()=>rules.slice()};
}
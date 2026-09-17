const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY={defaults:"weekend_ai_defaults_v1",saved:"weekend_ai_saved_v1",history:"weekend_ai_history_v1",profile:"weekend_ai_profile_v1",saving:"weekend_ai_saving_v1"};
let selectedPlan=null;

const templates=[
 {tag:"今日のイチオシ",title:"水族館＋海辺ランチ",emoji:"🐟",cost:4850,saving:1450,travel:45,highway:0,return:"16:50",stops:["自宅を出発","水族館でゆっくり","子連れOKの海辺ランチ","公園でひと休み","帰宅"]},
 {tag:"お得重視",title:"科学館＋道の駅",emoji:"🔬",cost:3600,saving:1900,travel:38,highway:0,return:"16:40",stops:["自宅を出発","科学館で体験","道の駅でランチ","季節のスイーツ","帰宅"]},
 {tag:"子ども優先",title:"室内あそび＋カフェ",emoji:"🧸",cost:4200,saving:900,travel:28,highway:0,return:"16:25",stops:["自宅を出発","室内あそび場","キッズ対応カフェ","短めのお買い物","帰宅"]},
 {tag:"季節体験",title:"牧場＋ジェラート",emoji:"🐄",cost:4700,saving:1100,travel:52,highway:780,return:"16:55",stops:["自宅を出発","牧場で動物体験","牧場ランチ","ジェラート","帰宅"]},
 {tag:"近場でゆったり",title:"公園＋ベーカリー",emoji:"🌳",cost:2800,saving:650,travel:20,highway:0,return:"15:50",stops:["自宅を出発","大型公園","人気ベーカリー","買い物","帰宅"]}
];

function data(){return {
 startPlace:$("#startPlace").value,endPlace:$("#endPlace").value,startTime:$("#startTime").value,endTime:$("#endTime").value,
 budget:+$("#budget").value,maxTravel:+$("#maxTravel").value,childAge:$("#childAge").value,highway:$("#highway").checked,
 indoor:$("#indoor").checked,lunch:$("#lunch").checked,supermarket:$("#supermarket").checked
}}
function apply(d){if(!d)return; Object.entries(d).forEach(([k,v])=>{let e=$("#"+k); if(e) e.type==="checkbox"?e.checked=v:e.value=v})}
function go(id){$$(".screen").forEach(x=>x.classList.toggle("active",x.id===id)); $$(".bottomnav button").forEach(x=>x.classList.toggle("active",x.dataset.go===id)); scrollTo(0,0); if(id==="saved")renderSaved(); if(id==="packing")renderPacking()}
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));

function pickPlans(cond){
 let history=JSON.parse(localStorage.getItem(KEY.history)||"[]").slice(-6);
 let recent=new Set(history.map(x=>x.title));
 let pool=templates.filter(x=>!recent.has(x.title) && x.cost<=Math.max(cond.budget,3000) && x.travel<=cond.maxTravel+10);
 if(pool.length<3) pool=templates.filter(x=>x.cost<=Math.max(cond.budget,3000));
 return pool.slice(0,3);
}
function renderPlans(plans=pickPlans(data())){
 $("#planCards").innerHTML=plans.map((p,i)=>`<article class="plan-card">
 <div class="plan-photo">${p.emoji}</div><div class="plan-body"><div class="plan-title"><b>${p.title}</b><span class="badge">${p.tag}</span></div>
 <div class="meta"><span>🚗 ${p.travel}分</span><span>💰 ¥${p.cost.toLocaleString()}</span><span>🎉 -¥${p.saving.toLocaleString()}</span><span>🏠 ${p.return}</span></div>
 <button class="primary openPlan" data-i="${i}">詳しく見る</button></div></article>`).join("");
 $$(".openPlan").forEach(b=>b.onclick=()=>openPlan(plans[+b.dataset.i]));
}
function openPlan(p){selectedPlan=p; $("#detailContent").innerHTML=`<div class="plan-card"><div class="plan-photo">${p.emoji}</div><div class="plan-body">
 <div class="plan-title"><h2>${p.title}</h2><span class="badge">${p.tag}</span></div>
 <div class="meta"><span>🚗 最大${p.travel}分</span><span>🏠 ${p.return}帰宅</span><span>高速 ¥${p.highway}</span></div></div></div>
 <div class="timeline">${p.stops.map((s,i)=>`<div class="stop"><b>${["10:00","10:45","12:45","14:15","16:50"][i]||""} ${s}</b><br><small>${i&&i<p.stops.length-1?"家族のペースに合わせてAIが調整":""}</small></div>`).join("")}</div>
 <div class="costbox"><b>今日の予想総額 ¥${p.cost.toLocaleString()}</b><br>🎉 通常より約 ¥${p.saving.toLocaleString()} お得</div>
 <div class="detail-actions"><button class="secondary" id="savePlan">♡ 保存</button><button class="secondary" data-go2="packing">🎒 持ち物</button><button class="primary" id="navStart">🚗 このプランで出発</button><button class="primary" id="replan">✨ AIで組み直す</button></div>`;
 $("#savePlan").onclick=savePlan; $("[data-go2]").onclick=()=>go("packing"); $("#navStart").onclick=()=>alert("MVP版：ここから地図アプリ連携・ドライブモードを接続します。"); $("#replan").onclick=()=>{alert("状況変更を反映して残りの予定を再提案する機能の土台です。");};
 go("detail");
}
function savePlan(){if(!selectedPlan)return; let a=JSON.parse(localStorage.getItem(KEY.saved)||"[]"); if(!a.some(x=>x.title===selectedPlan.title))a.push(selectedPlan); localStorage.setItem(KEY.saved,JSON.stringify(a)); let h=JSON.parse(localStorage.getItem(KEY.history)||"[]"); h.push({...selectedPlan,date:new Date().toISOString()}); localStorage.setItem(KEY.history,JSON.stringify(h)); localStorage.setItem(KEY.saving,(+localStorage.getItem(KEY.saving)||0)+selectedPlan.saving); updateSaving(); alert("保存しました。次回提案では最近のプランと被りにくくします。")}
function renderSaved(){let a=JSON.parse(localStorage.getItem(KEY.saved)||"[]"); $("#savedPlans").innerHTML=a.length?a.map(p=>`<div class="plan-card"><div class="plan-body"><b>${p.emoji} ${p.title}</b><div class="meta"><span>¥${p.cost}</span><span>お得 ¥${p.saving}</span></div></div></div>`).join(""):"<p>まだ保存したプランはありません。</p>"}
function packingItems(){
 let c=data(), hours=Math.max(1,(+c.endTime.slice(0,2)+c.endTime.slice(3)/60)-(+c.startTime.slice(0,2)+c.startTime.slice(3)/60));
 let interval=+(JSON.parse(localStorage.getItem(KEY.profile)||"{}").milkInterval||4), milk=Math.ceil(hours/interval);
 let items=[`おむつ（外出${Math.round(hours)}時間分＋予備）`,"おしりふき",`ミルク ${milk}回分`,"哺乳瓶・お湯","着替え一式","飲み物","抱っこ紐 / ベビーカー"];
 if(!c.indoor)items.push("帽子・日焼け/防寒対策"); if(c.supermarket)items.push("買い物バッグ"); return items;
}
function renderPacking(){let items=packingItems(); $("#packingList").innerHTML=items.map((x,i)=>`<label class="packing-item"><input type="checkbox" class="pack"> ${x}</label>`).join(""); let upd=()=>{$("#packingProgress").textContent=`準備 ${$$(".pack:checked").length} / ${items.length}`}; $$(".pack").forEach(x=>x.onchange=upd);upd()}
$("#conditionForm").onsubmit=e=>{e.preventDefault();renderPlans();go("home")};
$("#saveDefault").onclick=()=>{localStorage.setItem(KEY.defaults,JSON.stringify(data()));alert("いつもの条件として保存しました。")};
$("#loadDefault").onclick=()=>apply(JSON.parse(localStorage.getItem(KEY.defaults)||"null"));
$("#quickPlan").onclick=()=>{let d=JSON.parse(localStorage.getItem(KEY.defaults)||"null");if(d)apply(d);renderPlans();};
$("#nowPlan").onclick=()=>{let d=data();d.startPlace="現在地";apply(d);renderPlans();alert("MVP版では現在地を仮設定しました。次の段階でスマホの位置情報を接続します。")};
$("#saveProfile").onclick=()=>{let p={family:$("#family").value,milkInterval:$("#milkInterval").value,milkAmount:$("#milkAmount").value,napTime:$("#napTime").value};localStorage.setItem(KEY.profile,JSON.stringify(p));alert("プロフィールを保存しました。")};
$("#profileBtn").onclick=()=>go("mypage");
function updateSaving(){$("#monthlySaving").textContent="¥"+(+localStorage.getItem(KEY.saving)||0).toLocaleString()}
apply(JSON.parse(localStorage.getItem(KEY.defaults)||"null")); let prof=JSON.parse(localStorage.getItem(KEY.profile)||"null"); if(prof)Object.entries(prof).forEach(([k,v])=>{let e=$("#"+k);if(e)e.value=v});
renderPlans();updateSaving();go("home");

// ===== v0.3 現在地 + 実天気 =====
function weatherInfo(code){
  if(code===0)return ["☀️","快晴"];
  if([1,2].includes(code))return ["🌤️","晴れ"];
  if(code===3)return ["☁️","くもり"];
  if([45,48].includes(code))return ["🌫️","霧"];
  if([51,53,55,56,57].includes(code))return ["🌦️","霧雨"];
  if([61,63,65,66,67,80,81,82].includes(code))return ["🌧️","雨"];
  if([71,73,75,77,85,86].includes(code))return ["🌨️","雪"];
  if([95,96,99].includes(code))return ["⛈️","雷雨"];
  return ["🌤️","天気"];
}
async function loadWeather(lat,lon){
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code&timezone=auto`;
  const r=await fetch(url); if(!r.ok)throw new Error("weather");
  const j=await r.json(), c=j.current||{}, wi=weatherInfo(c.weather_code);
  $("#weatherIcon").textContent=wi[0]; $("#weatherTemp").textContent=Math.round(c.temperature_2m)+"°"; $("#weatherText").textContent=wi[1];
}
function setPlaceLabel(text){$("#currentPlaceLabel").textContent="📍 "+text; $("#startPlace").value=text}
async function geocodePlace(name){
  const u=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=ja&countryCode=JP&format=json`;
  const r=await fetch(u); if(!r.ok)throw new Error("geocode"); const j=await r.json();
  if(!j.results?.length)throw new Error("notfound");
  const x=j.results[0]; setPlaceLabel([x.name,x.admin1].filter(Boolean).join("・")); await loadWeather(x.latitude,x.longitude);
}
async function useCurrentLocation(){
  if(!navigator.geolocation){alert("このブラウザは位置情報に対応していません。場所入力を使ってください。");return}
  $("#weatherText").textContent="取得中…";
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const {latitude,longitude}=pos.coords;
      setPlaceLabel("現在地");
      localStorage.setItem("weekend_ai_coords_v1",JSON.stringify({latitude,longitude}));
      await loadWeather(latitude,longitude);
    }catch(e){$("#weatherText").textContent="取得失敗";alert("天気を取得できませんでした。")}
  },err=>{
    $("#weatherText").textContent="未取得";
    alert("位置情報を取得できませんでした。ブラウザの位置情報許可を確認するか、「場所を入力」を使ってください。");
  },{enableHighAccuracy:true,timeout:10000,maximumAge:300000});
}
$("#getLocationBtn").onclick=useCurrentLocation;
$("#manualLocationBtn").onclick=async()=>{
  const name=prompt("市区町村や地名を入力してください（例：南魚沼市、新潟市）");
  if(!name)return;
  $("#weatherText").textContent="検索中…";
  try{await geocodePlace(name)}catch(e){$("#weatherText").textContent="未取得";alert("場所が見つかりませんでした。別の地名で試してください。")}
};
const savedCoords=JSON.parse(localStorage.getItem("weekend_ai_coords_v1")||"null");
if(savedCoords) loadWeather(savedCoords.latitude,savedCoords.longitude).catch(()=>{});


// ===== v0.5 OpenStreetMap / Overpass 実在スポット候補 =====
function kmBetween(a,b,c,d){
  const R=6371, rad=x=>x*Math.PI/180;
  const dLat=rad(c-a), dLon=rad(d-b);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function spotKind(tags={}){
  const v=tags.tourism||tags.leisure||tags.amenity||"";
  const map={
    aquarium:["🐠","水族館"],zoo:["🦁","動物園"],museum:["🏛️","博物館・資料館"],
    theme_park:["🎡","テーマパーク"],attraction:["✨","観光スポット"],
    park:["🌳","公園"],playground:["🛝","遊び場"],nature_reserve:["🌿","自然"],
    arts_centre:["🎨","文化・体験施設"]
  };
  return map[v]||["📍","お出かけスポット"];
}
function renderRealSpots(spots,lat,lon){
  const box=$("#realSpotCards");
  if(!spots.length){box.innerHTML='<div class="spot-loading">周辺で条件に合う登録スポットが見つかりませんでした。</div>';return}
  box.innerHTML=spots.slice(0,12).map(x=>{
    const t=x.tags||{}, k=spotKind(t), la=x.lat??x.center?.lat, lo=x.lon??x.center?.lon;
    const dist=(la!=null&&lo!=null)?kmBetween(lat,lon,la,lo):null;
    return `<div class="real-spot"><div class="real-spot-icon">${k[0]}</div><div class="real-spot-main"><b>${escapeHtml(t.name||"名称未登録")}</b><small>${k[1]}${t["addr:city"]?" ・ "+escapeHtml(t["addr:city"]):""}</small></div><div class="real-spot-distance">${dist!=null?dist.toFixed(1)+" km":""}</div></div>`;
  }).join("");
}
async function fetchRealSpots(lat,lon){
  const status=$("#spotStatus"), box=$("#realSpotCards");
  status.textContent="検索準備中…";
  box.innerHTML='<div class="spot-loading">🔎 現在地周辺の実在スポットを探しています…<br><small id="spotDiag">検索サーバーへ接続します</small></div>';
  const radius=20000;
  const filters=[
    '["tourism"~"aquarium|zoo|museum|theme_park|attraction"]',
    '["leisure"~"park|playground|nature_reserve"]',
    '["amenity"="arts_centre"]'
  ];
  const body=filters.map(f=>`nwr(around:${radius},${lat},${lon})${f}["name"];`).join("");
  const query=`[out:json][timeout:18];(${body});out center tags;`;

  // 日本向けを優先し、障害時は別の公開インスタンスへ自動切替
  const endpoints=[
    ["Overpass Japan","https://overpass.openstreetmap.jp/api/interpreter"],
    ["Private.coffee","https://overpass.private.coffee/api/interpreter"],
    ["Overpass Main","https://overpass-api.de/api/interpreter"]
  ];
  let lastError="";
  for(let i=0;i<endpoints.length;i++){
    const [label,url]=endpoints[i];
    status.textContent=`検索中 ${i+1}/${endpoints.length}`;
    const diag=document.querySelector("#spotDiag");
    if(diag) diag.textContent=`${label} に接続中…`;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),22000);
    const started=Date.now();
    try{
      const r=await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body:"data="+encodeURIComponent(query),
        signal:controller.signal
      });
      clearTimeout(timer);
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const data=await r.json();
      const seen=new Set();
      const spots=(data.elements||[]).filter(x=>{
        const n=x.tags?.name;
        if(!n||seen.has(n)) return false;
        seen.add(n); return true;
      }).sort((a,b)=>{
        const ac=a.lat??a.center?.lat, ao=a.lon??a.center?.lon;
        const bc=b.lat??b.center?.lat, bo=b.lon??b.center?.lon;
        return kmBetween(lat,lon,ac,ao)-kmBetween(lat,lon,bc,bo);
      });
      const sec=((Date.now()-started)/1000).toFixed(1);
      status.textContent=`成功 ${spots.length}件・${sec}秒`;
      renderRealSpots(spots,lat,lon);
      return;
    }catch(e){
      clearTimeout(timer);
      lastError = e.name==="AbortError" ? `${label}: タイムアウト` : `${label}: ${e.message}`;
      const diag2=document.querySelector("#spotDiag");
      if(diag2) diag2.textContent=`${lastError} → 次のサーバーを試します`;
    }
  }
  status.textContent="API接続失敗";
  box.innerHTML=`<div class="spot-loading">⚠️ 実在スポットを取得できませんでした。<br><small>${escapeHtml(lastError)}</small><br><button class="retry-spots" onclick="searchRealSpotsFromSavedLocation()">もう一度検索</button></div>`;
}
async function searchRealSpotsFromSavedLocation(){
  const c=JSON.parse(localStorage.getItem("weekend_ai_coords_v1")||"null");
  if(!c){$("#spotStatus").textContent="先に現在地を取得してください";return}
  await fetchRealSpots(c.latitude,c.longitude);
}
// 現在地取得成功後、施設候補も更新
const originalUseCurrentLocation=useCurrentLocation;
useCurrentLocation=function(){
  if(!navigator.geolocation){alert("このブラウザは位置情報に対応していません。場所入力を使ってください。");return}
  $("#weatherText").textContent="取得中…";
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const {latitude,longitude}=pos.coords;
      setPlaceLabel("現在地");
      localStorage.setItem("weekend_ai_coords_v1",JSON.stringify({latitude,longitude}));
      await loadWeather(latitude,longitude);
      await fetchRealSpots(latitude,longitude);
    }catch(e){$("#weatherText").textContent="取得失敗";alert("現在地データの取得中にエラーが発生しました。")}
  },()=>{ $("#weatherText").textContent="未取得"; alert("位置情報を取得できませんでした。"); },
  {enableHighAccuracy:true,timeout:10000,maximumAge:300000});
};
$("#getLocationBtn").onclick=useCurrentLocation;

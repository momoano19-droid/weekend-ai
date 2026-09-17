const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY={defaults:"weekend_ai_defaults_v1",saved:"weekend_ai_saved_v1",history:"weekend_ai_history_v1",profile:"weekend_ai_profile_v1",saving:"weekend_ai_saving_v1"};
let selectedPlan=null;
let latestWeekendCandidates=[];
let latestAIPlans=[];

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
$("#conditionForm").onsubmit=async e=>{e.preventDefault();go("home");await generateAIPlansV12();};
$("#saveDefault").onclick=()=>{localStorage.setItem(KEY.defaults,JSON.stringify(data()));alert("いつもの条件として保存しました。")};
$("#loadDefault").onclick=()=>apply(JSON.parse(localStorage.getItem(KEY.defaults)||"null"));
$("#quickPlan").onclick=async()=>{let d=JSON.parse(localStorage.getItem(KEY.defaults)||"null");if(d)apply(d);await generateAIPlansV12();};
$("#nowPlan").onclick=async()=>{let d=data();d.startPlace="現在地";apply(d);await generateAIPlansV12();};
$("#saveProfile").onclick=()=>{let p={family:$("#family").value,milkInterval:$("#milkInterval").value,milkAmount:$("#milkAmount").value,napTime:$("#napTime").value};localStorage.setItem(KEY.profile,JSON.stringify(p));alert("プロフィールを保存しました。")};
$("#profileBtn").onclick=()=>go("mypage");
function updateSaving(){$("#monthlySaving").textContent="¥"+(+localStorage.getItem(KEY.saving)||0).toLocaleString()}
apply(JSON.parse(localStorage.getItem(KEY.defaults)||"null")); let prof=JSON.parse(localStorage.getItem(KEY.profile)||"null"); if(prof)Object.entries(prof).forEach(([k,v])=>{let e=$("#"+k);if(e)e.value=v});
renderPlans();updateSaving();go("home");

// ===== v0.3 現在地 + 実天気 =====
let currentPosition = null;
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
      const { latitude, longitude, accuracy } = pos.coords;
     currentPosition = {
  lat: latitude,
  lon: longitude
};

console.log("===== 週末AI 現在地確認 =====");
console.log("緯度:", latitude);
console.log("経度:", longitude);
console.log("位置情報の精度:", accuracy, "m");

alert(
  "週末AIが取得した位置情報\n\n" +
  "緯度：" + latitude.toFixed(6) + "\n" +
  "経度：" + longitude.toFixed(6) + "\n" +
  "精度：±" + Math.round(accuracy) + "m"
);
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

// ===== v0.6 Yahoo! JAPAN / Cloudflare Worker 実在スポット候補 =====
const WEEKEND_AI_API="https://weekend-ai-api.momo-ano19.workers.dev";

function kmBetween(a,b,c,d){
  const R=6371,rad=x=>x*Math.PI/180,dLat=rad(c-a),dLon=rad(d-b);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function yahooSpotKind(x={}){
  const t=((x.genres||[]).join(" ")+" "+(x.name||""));
  if(/水族館/.test(t))return ["🐠","水族館"];
  if(/動物園/.test(t))return ["🦁","動物園"];
  if(/博物館|資料館|美術館|ミュージアム/.test(t))return ["🏛️","博物館・美術館"];
  if(/遊園地|テーマパーク/.test(t))return ["🎡","テーマパーク"];
  if(/公園|パーク/.test(t))return ["🌳","公園"];
  if(/道の駅/.test(t))return ["🚗","道の駅"];
  return ["📍",(x.genres||[])[0]||"お出かけスポット"];
}
function renderRealSpots(spots,lat,lon){
  const box=$("#realSpotCards");
  if(!spots.length){
    box.innerHTML='<div class="spot-loading">周辺の登録スポットが見つかりませんでした。</div>';
    return;
  }
  box.innerHTML=spots.slice(0,12).map(x=>{
    const k=yahooSpotKind(x);
    const dist=Number.isFinite(+x.lat)&&Number.isFinite(+x.lon)?kmBetween(lat,lon,+x.lat,+x.lon):null;
    const sub=[k[1],x.address].filter(Boolean).map(escapeHtml).join(" ・ ");
    return `<div class="real-spot"><div class="real-spot-icon">${k[0]}</div><div class="real-spot-main"><b>${escapeHtml(x.name||"名称不明")}</b><small>${sub}</small></div><div class="real-spot-distance">${dist!=null?dist.toFixed(1)+" km":""}</div></div>`;
  }).join("");
}
async function fetchRealSpots(lat,lon){
  const status=$("#spotStatus"),box=$("#realSpotCards");
  status.textContent="Yahoo!で検索中…";
  box.innerHTML='<div class="spot-loading">🔎 現在地周辺の実在スポットを探しています…<br><small>週末AI API → Yahoo! JAPAN</small></div>';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
    const r=await fetch(`${WEEKEND_AI_API}/spots?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,{signal:controller.signal});
    const j=await r.json().catch(()=>null);
    clearTimeout(timer);
    if(!r.ok||!j?.ok)throw new Error(j?.error||`HTTP ${r.status}`);
    const spots=Array.isArray(j.spots)?j.spots:[];
    status.textContent=`Yahoo! ${spots.length}件取得`;
    renderRealSpots(spots,lat,lon);
  }catch(e){
    clearTimeout(timer);
    const msg=e.name==="AbortError"?"検索がタイムアウトしました":e.message;
    status.textContent="施設検索エラー";
    box.innerHTML=`<div class="spot-loading">⚠️ 実在スポットを取得できませんでした。<br><small>${escapeHtml(msg)}</small><br><button class="retry-spots" onclick="searchRealSpotsFromSavedLocation()">もう一度検索</button></div>`;
  }
}
async function searchRealSpotsFromSavedLocation(){
  const c=JSON.parse(localStorage.getItem("weekend_ai_coords_v1")||"null");
  if(!c){$("#spotStatus").textContent="先に現在地を取得してください";return}
  await fetchRealSpots(+c.latitude,+c.longitude);
}
useCurrentLocation=function(){
  if(!navigator.geolocation){alert("このブラウザは位置情報に対応していません。");return}
  $("#weatherText").textContent="取得中…";$("#spotStatus").textContent="現在地取得中…";
  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude,longitude}=pos.coords;
    setPlaceLabel("現在地");
    localStorage.setItem("weekend_ai_coords_v1",JSON.stringify({latitude,longitude}));
    try{await loadWeather(latitude,longitude)}catch(e){$("#weatherText").textContent="取得失敗"}
    await testGoogleV10();
  },()=>{$("#weatherText").textContent="未取得";$("#spotStatus").textContent="現在地未取得";alert("位置情報を取得できませんでした。");},
  {enableHighAccuracy:true,timeout:10000,maximumAge:300000});
};
$("#getLocationBtn").onclick=useCurrentLocation;
if (savedCoords) {
  testGoogleV10();
}
/* =========================================
   Google Places 接続テスト
========================================= */

function addGooglePlacesTestButton() {
  const section = document.querySelector(".nearby-section");
  if (!section) return;

  if (document.getElementById("googlePlacesTestBtn")) return;

  const button = document.createElement("button");
  button.id = "googlePlacesTestBtn";
  button.type = "button";
  button.textContent = "🧪 Google Placesで近所をテスト";
  button.style.cssText = `
    width: 100%;
    margin: 12px 0;
    padding: 14px;
    border: 0;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  `;

  section.insertBefore(button, section.firstChild);

  button.addEventListener("click", testGooglePlaces);
}

async function testGooglePlaces() {
  const status = document.getElementById("spotStatus");
  const cards = document.getElementById("realSpotCards");

  let coords = null;

  try {
    coords = JSON.parse(
      localStorage.getItem("weekend_ai_coords_v1")
    );
  } catch (e) {}

  if (!coords?.latitude || !coords?.longitude) {
    if (status) {
      status.textContent =
        "先に「現在地と天気を取得」を押してください";
    }
    return;
  }

  if (status) {
    status.textContent = "Google Placesで検索中…";
  }

  try {
    const url =
      `${WEEKEND_AI_API}/google-test` +
      `?lat=${encodeURIComponent(coords.latitude)}` +
      `&lon=${encodeURIComponent(coords.longitude)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data?.detail ||
        data?.error ||
        "Google Places APIエラー"
      );
    }

    const places = Array.isArray(data.places)
      ? data.places
      : [];

    if (status) {
      status.textContent =
        `Google Places：${places.length}件取得`;
    }

    if (!cards) return;

    if (!places.length) {
      cards.innerHTML =
        `<div class="empty-card">
          Google Placesでは近所の施設が見つかりませんでした
        </div>`;
      return;
    }

    cards.innerHTML = places
      .map((place) => {
        const type =
          place.primaryType ||
          place.types?.[0] ||
          "施設";

        return `
          <div class="real-spot-card">
            <div class="real-spot-icon">📍</div>

            <div class="real-spot-info">
              <strong>${escapeHtmlGoogle(place.name)}</strong>

              <small>
                ${escapeHtmlGoogle(type)}
                ${
                  place.address
                    ? `・${escapeHtmlGoogle(place.address)}`
                    : ""
                }
              </small>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);

    if (status) {
      status.textContent =
        "Google Places接続エラー：" +
        (error?.message || "不明なエラー");
    }
  }
}

function escapeHtmlGoogle(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    addGooglePlacesTestButton
  );
} else {
  addGooglePlacesTestButton();
}
// ================================================
// Google Places 施設名直接検索テスト
// ================================================
async function testGooglePlaceName() {
  const status = document.getElementById("spotStatus");
  const cards = document.getElementById("realSpotCards");

  if (status) {
    status.textContent = "八色の森公園をGoogle Placesで検索中...";
  }

  try {
    const response = await fetch(
      `${WEEKEND_AI_API}/google-name-test`
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error || "Google Placesの検索に失敗しました"
      );
    }

    const places = Array.isArray(data.places)
      ? data.places
      : [];

    if (status) {
      status.textContent =
        `「八色の森公園」直接検索：${places.length}件取得`;
    }

    if (!cards) return;

    if (places.length === 0) {
      cards.innerHTML = `
        <div class="real-spot-card">
          <strong>八色の森公園は見つかりませんでした</strong>
          <div class="real-spot-meta">
            Google Placesの施設名検索でも候補がありませんでした。
          </div>
        </div>
      `;
      return;
    }

    cards.innerHTML = places
      .map((place) => {
        return `
          <div class="real-spot-card">
            <strong>${escapeHtmlGoogle(place.name || "名称不明")}</strong>

            <div class="real-spot-meta">
              ${escapeHtmlGoogle(place.address || "")}
            </div>

            <div class="real-spot-meta">
              種類：${escapeHtmlGoogle(place.primaryType || "不明")}
            </div>
          </div>
        `;
      })
      .join("");

  } catch (error) {
    console.error(error);

    if (status) {
      status.textContent =
        `直接検索エラー：${error.message}`;
    }
   // ================================================
// Googleテストボタン クリック動作を確実に登録
// ================================================
document.addEventListener("DOMContentLoaded", () => {
  const googlePlacesBtn =
    document.getElementById("googlePlacesTestBtn");

  const googleNameBtn =
    document.getElementById("googleNameTestBtn");

  if (googlePlacesBtn) {
    googlePlacesBtn.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      testGooglePlaces();
    };
  }

  if (googleNameBtn) {
    googleNameBtn.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      testGooglePlaceName();
    };
  }
});
  }
}
// ================================================
// v0.8 Google Places 50km検索テスト
// ================================================
async function testGoogleV08() {
  const status = document.getElementById("spotStatus");
  const cards = document.getElementById("realSpotCards");

  let coords = null;

  try {
    coords = JSON.parse(
      localStorage.getItem("weekend_ai_coords_v1")
    );
  } catch (e) {}

  if (!coords?.latitude || !coords?.longitude) {
    if (status) {
      status.textContent =
        "先に「現在地と天気を取得」を押してください";
    }
    return;
  }
alert(
  "v0.8検索で使用する保存座標\n\n" +
  "緯度：" + Number(coords.latitude).toFixed(6) + "\n" +
  "経度：" + Number(coords.longitude).toFixed(6)
);
  if (status) {
    status.textContent = "v0.8：50km圏をカテゴリ別に検索中…";
  }

  if (cards) {
    cards.innerHTML = `
      <div class="spot-loading">
        🔎 Google Placesから50km圏を検索しています…<br>
        <small>公園・美術館/博物館・動物園/水族館・遊園地・観光/体験</small>
      </div>
    `;
  }

  try {
    const url =
      `${WEEKEND_AI_API}/spots-v08` +
      `?lat=${encodeURIComponent(coords.latitude)}` +
      `&lon=${encodeURIComponent(coords.longitude)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data?.detail ||
        data?.error ||
        "v0.8の検索に失敗しました"
      );
    }

    const spots = Array.isArray(data.spots)
      ? data.spots
      : [];

    if (status) {
      status.textContent =
        `v0.8：50km圏 ${spots.length}件取得`;
    }

    if (!cards) return;

    if (!spots.length) {
      cards.innerHTML = `
        <div class="spot-loading">
          50km圏のスポットが見つかりませんでした。
        </div>
      `;
      return;
    }

    cards.innerHTML = spots
      .map((spot) => {
        const distance =
          Number.isFinite(Number(spot.distanceKm))
            ? `${Number(spot.distanceKm).toFixed(1)} km`
            : "";

        return `
          <div class="real-spot">
            <div class="real-spot-icon">
              ${escapeHtmlGoogle(spot.emoji || "📍")}
            </div>

            <div class="real-spot-main">
              <b>${escapeHtmlGoogle(spot.name || "名称不明")}</b>

              <small>
                ${escapeHtmlGoogle(
                  spot.categoryLabel ||
                  spot.primaryType ||
                  "お出かけスポット"
                )}
                ${
                  spot.address
                    ? ` ・ ${escapeHtmlGoogle(spot.address)}`
                    : ""
                }
              </small>
            </div>

            <div class="real-spot-distance">
              ${escapeHtmlGoogle(distance)}
            </div>
          </div>
        `;
      })
      .join("");

  } catch (error) {
    console.error(error);

    if (status) {
      status.textContent =
        "v0.8検索エラー：" +
        (error?.message || "不明なエラー");
    }

    if (cards) {
      cards.innerHTML = `
        <div class="spot-loading">
          ⚠️ v0.8の検索に失敗しました。<br>
          <small>${escapeHtmlGoogle(error?.message || "")}</small>
        </div>
      `;
    }
  }
}

// v0.8ボタンにクリック処理を登録
document.addEventListener("DOMContentLoaded", () => {
  const button =
    document.getElementById("googleV08TestBtn");

  if (button) {
    button.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      testGoogleV08();
    };
  }
});
// ================================================
// v0.9 Google Places 100km検索テスト
// ================================================
async function testGoogleV09() {
  const status = document.getElementById("spotStatus");
  const cards = document.getElementById("realSpotCards");

  let coords = null;

  try {
    coords = JSON.parse(
      localStorage.getItem("weekend_ai_coords_v1")
    );
  } catch (e) {
    console.error("保存座標の読み込みエラー", e);
  }

  // 現在地がまだ保存されていない場合
  if (
    !coords ||
    !Number.isFinite(Number(coords.latitude)) ||
    !Number.isFinite(Number(coords.longitude))
  ) {
    if (status) {
      status.textContent =
        "先に「現在地と天気を取得」を押してください";
    }

    if (cards) {
      cards.innerHTML = `
        <div class="spot-loading">
          📍 現在地を取得してから検索してください。
        </div>
      `;
    }

    return;
  }

  const latitude = Number(coords.latitude);
  const longitude = Number(coords.longitude);

  if (status) {
    status.textContent =
      "v0.9：100km圏を検索中…";
  }

  if (cards) {
    cards.innerHTML = `
      <div class="spot-loading">
        🔎 Google Placesから100km圏を検索しています…<br>
        <small>
          公園・美術館/博物館・動物園/水族館・遊園地・観光/体験
        </small>
      </div>
    `;
  }

  try {
    const apiUrl =
      `${WEEKEND_AI_API}/spots-v09` +
      `?lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}`;

    const response = await fetch(apiUrl);

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data?.detail ||
        data?.error ||
        `HTTP ${response.status}`
      );
    }

    const spots =
      Array.isArray(data.spots)
        ? data.spots
        : [];

    // --------------------------------------------
    // ステータス表示
    // --------------------------------------------

    if (status) {
      status.textContent =
        `v0.9：100km圏 ${spots.length}件取得`;
    }

    if (!cards) {
      return;
    }

    if (!spots.length) {
      cards.innerHTML = `
        <div class="spot-loading">
          100km圏の候補が見つかりませんでした。
        </div>
      `;

      return;
    }

    // --------------------------------------------
    // スポット表示
    // --------------------------------------------

    cards.innerHTML = spots
      .map((spot) => {

        const distanceNumber =
          Number(spot.distanceKm);

        const distance =
          Number.isFinite(distanceNumber)
            ? `${distanceNumber.toFixed(1)} km`
            : "";

        const category =
          spot.categoryLabel ||
          spot.primaryType ||
          "お出かけスポット";

        const emoji =
          spot.emoji ||
          "📍";

        return `
          <div class="real-spot">

            <div class="real-spot-icon">
              ${escapeHtmlGoogle(emoji)}
            </div>

            <div class="real-spot-main">

              <b>
                ${escapeHtmlGoogle(
                  spot.name || "名称不明"
                )}
              </b>

              <small>
                ${escapeHtmlGoogle(category)}
                ${
                  spot.address
                    ? ` ・ ${escapeHtmlGoogle(spot.address)}`
                    : ""
                }
              </small>

            </div>

            <div class="real-spot-distance">
              ${escapeHtmlGoogle(distance)}
            </div>

          </div>
        `;
      })
      .join("");

  } catch (error) {

    console.error(
      "v0.9 100km検索エラー",
      error
    );

    if (status) {
      status.textContent =
        "v0.9検索エラー：" +
        (error?.message || "不明なエラー");
    }

    if (cards) {
      cards.innerHTML = `
        <div class="spot-loading">
          ⚠️ 100km検索に失敗しました。<br>
          <small>
            ${escapeHtmlGoogle(
              error?.message || ""
            )}
          </small>
        </div>
      `;
    }
  }
}


// ================================================
// v0.9ボタンのクリック処理
// ================================================
document.addEventListener(
  "DOMContentLoaded",
  () => {

    const button =
      document.getElementById(
        "googleV09TestBtn"
      );

    if (button) {
      button.onclick = function (event) {

        event.preventDefault();
        event.stopPropagation();

        testGoogleV09();
      };
    }
  }
);
// ================================================
// v1.0 週末AI おすすめ候補テスト
// ================================================

// ================================================
// v1.2 実在スポット30件 → OpenAI 3プラン生成
// ================================================
function buildAIConditions(){
  const c=data();
  let durationHours=null;
  try{
    const [sh,sm]=String(c.startTime||"").split(":").map(Number);
    const [eh,em]=String(c.endTime||"").split(":").map(Number);
    const start=sh+sm/60,end=eh+em/60;
    if(Number.isFinite(start)&&Number.isFinite(end)){
      durationHours=Math.max(1,end-start);
    }
  }catch(e){}

  return {
    outingMode:"standard",
    durationHours,
    budgetYen:Number.isFinite(Number(c.budget))?Number(c.budget):null,
    childAgeText:String(c.childAge||""),
    indoorOutdoor:c.indoor?"屋内優先":"どちらでも",
    note:[
      c.highway?"高速道路OK":"高速道路は使わない",
      c.lunch?"ランチあり":"ランチなし",
      c.supermarket?"帰りにスーパー希望":""
    ].filter(Boolean).join("・")
  };
}

function aiPlanEmoji(type,spot={}){
  if(type==="best") return "✨";
  if(type==="value") return "💰";
  if(type==="child") return "👶";
  return spot.emoji||"📍";
}

function renderAIPlans(plans){
  latestAIPlans=Array.isArray(plans)?plans:[];
  const box=$("#planCards");
  if(!box)return;

  box.innerHTML=latestAIPlans.map((p,i)=>{
    const s=p.spot||{};
    const d=Number(s.distanceKm);
    const distance=Number.isFinite(d)?`${d.toFixed(1)} km`:"距離情報なし";
    const r=Number(s.rating);
    const rating=Number.isFinite(r)&&r>0?`⭐ ${r.toFixed(1)}`:"";
    const reviews=Number(s.userRatingCount);
    const reviewText=Number.isFinite(reviews)&&reviews>0?`口コミ ${reviews.toLocaleString("ja-JP")}件`:"";
    const meta=[distance,rating,reviewText].filter(Boolean);

    return `<article class="plan-card">
      <div class="plan-photo">${aiPlanEmoji(p.type,s)}</div>
      <div class="plan-body">
        <div class="plan-title">
          <b>${escapeHtmlGoogle(p.spotName||s.name||"名称不明")}</b>
          <span class="badge">${escapeHtmlGoogle(p.title||"AIプラン")}</span>
        </div>
        <div class="meta">${meta.map(x=>`<span>${escapeHtmlGoogle(x)}</span>`).join("")}</div>
        <p style="margin:10px 0;line-height:1.6;">${escapeHtmlGoogle(p.reason||"")}</p>
        <button class="primary openAIPlan" data-i="${i}">詳しく見る</button>
      </div>
    </article>`;
  }).join("");

  $$(".openAIPlan").forEach(b=>{
    b.onclick=()=>openAIPlan(latestAIPlans[+b.dataset.i]);
  });
}

async function openAIPlan(p){
  selectedPlan=p;
  const s=p.spot||{};
  const d=Number(s.distanceKm);
  const distance=Number.isFinite(d)?`${d.toFixed(1)} km`:"距離情報なし";
  const r=Number(s.rating);
  const rating=Number.isFinite(r)&&r>0?`⭐ ${r.toFixed(1)}`:"評価情報なし";

  // まず基本情報を表示
  $("#detailContent").innerHTML=`
    <div class="plan-card">
      <div class="plan-photo">${aiPlanEmoji(p.type,s)}</div>
      <div class="plan-body">
        <div class="plan-title">
          <h2>${escapeHtmlGoogle(p.spotName||s.name||"名称不明")}</h2>
          <span class="badge">${escapeHtmlGoogle(p.title||"AIプラン")}</span>
        </div>
        <div class="meta">
          <span>📍 ${escapeHtmlGoogle(distance)}</span>
          <span>${escapeHtmlGoogle(rating)}</span>
          <span>${escapeHtmlGoogle(s.categoryLabel||s.category||"お出かけスポット")}</span>
        </div>
      </div>
    </div>

    <div class="form-card">
      <h3>✨ AIの選定理由</h3>
      <p style="line-height:1.7;">${escapeHtmlGoogle(p.reason||"")}</p>
      ${s.address?`<p><small>📍 ${escapeHtmlGoogle(s.address)}</small></p>`:""}
    </div>

    <div class="form-card" id="placeDetailsBox">
      <h3>🏢 施設情報</h3>
      <div class="spot-loading">🔎 Google Placesから最新の施設情報を確認中…</div>
    </div>

    <div class="form-card" id="routeV15Box">
      <h3>🚗 現在地からの車ルート</h3>
      <div class="spot-loading">施設の位置情報を確認中…</div>
    </div>

    <div class="form-card">
      <h3>🗓️ 今日1日のプラン</h3>
      <p style="line-height:1.7;">この場所を中心に、昼食・午後のお出かけ・帰宅までAIが組み立てます。</p>
      <button class="primary" id="makeDayPlanV14" style="width:100%;">✨ この場所を中心に1日プランを作る</button>
      <div id="dayPlanV14Box" style="margin-top:12px;"></div>
    </div>

    <div class="detail-actions">
      <button class="secondary" data-go2="home">← 戻る</button>
      <button class="primary" id="navStart">🚗 この場所へ行く</button>
    </div>`;

  const back=$("[data-go2]");
  if(back)back.onclick=()=>go("home");

  const nav=$("#navStart");
  if(nav)nav.onclick=()=>{
    if(Number.isFinite(Number(s.lat))&&Number.isFinite(Number(s.lon))){
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.lat+","+s.lon)}`,"_blank");
    }else{
      alert("この施設の位置情報がありません。");
    }
  };

  const dayPlanButton=$("#makeDayPlanV14");
  if(dayPlanButton) dayPlanButton.onclick=()=>generateDayPlanV14(s);

  go("detail");

  const box=$("#placeDetailsBox");
  if(!box)return;

  if(!s.id){
    box.innerHTML=`
      <h3>🏢 施設情報</h3>
      <p>詳細情報を取得するためのPlace IDがありません。</p>
      <p><small>⚠️ 営業時間・料金・設備は出発前に公式情報を確認してください。</small></p>`;
    return;
  }

  try{
    const response=await fetch(
      `${WEEKEND_AI_API}/place-details-v13?placeId=${encodeURIComponent(s.id)}`
    );
    const result=await response.json().catch(()=>null);

    if(!response.ok||!result?.ok){
      throw new Error(result?.detail||result?.error||`HTTP ${response.status}`);
    }

    const place=result.place||{};
    const hours=Array.isArray(place.openingHours)?place.openingHours:[];

    let openLabel="営業状況：情報なし";
    if(place.openNow===true)openLabel="🟢 現在営業中";
    if(place.openNow===false)openLabel="🔴 現在営業時間外";

    const hoursHtml=hours.length
      ? `<div style="margin-top:10px;"><b>🕒 営業時間</b><div style="margin-top:6px;line-height:1.7;">${
          hours.map(x=>`<div>${escapeHtmlGoogle(x)}</div>`).join("")
        }</div></div>`
      : `<p><b>🕒 営業時間：</b>情報なし</p>`;

    const phoneHtml=place.phone
      ? `<p><b>☎️ 電話：</b><a href="tel:${escapeHtmlGoogle(place.phone)}">${escapeHtmlGoogle(place.phone)}</a></p>`
      : `<p><b>☎️ 電話：</b>情報なし</p>`;

    const websiteHtml=place.website
      ? `<p><a class="primary" style="display:inline-block;text-decoration:none;" href="${escapeHtmlGoogle(place.website)}" target="_blank" rel="noopener">🌐 公式サイトを見る</a></p>`
      : `<p><b>🌐 公式サイト：</b>情報なし</p>`;

    const mapsHtml=place.googleMapsUrl
      ? `<p><a class="secondary" style="display:inline-block;text-decoration:none;" href="${escapeHtmlGoogle(place.googleMapsUrl)}" target="_blank" rel="noopener">🗺️ Googleマップで確認</a></p>`
      : "";

    box.innerHTML=`
      <h3>🏢 施設情報</h3>
      <p><b>${escapeHtmlGoogle(openLabel)}</b></p>
      ${place.address?`<p><b>📍 住所：</b>${escapeHtmlGoogle(place.address)}</p>`:""}
      ${hoursHtml}
      ${phoneHtml}
      ${websiteHtml}
      ${mapsHtml}
      <p><small>⚠️ 営業時間・料金・設備は変更される場合があります。出発前に公式情報をご確認ください。</small></p>`;

    // v1.5: Place Detailsで得た目的地座標を使って実際の車ルートを取得
    await loadRouteV15(place);

  }catch(error){
    console.error("v1.3 施設詳細取得エラー",error);
    box.innerHTML=`
      <h3>🏢 施設情報</h3>
      <p>⚠️ 施設詳細を取得できませんでした。</p>
      <p><small>${escapeHtmlGoogle(error?.message||"")}</small></p>
      <p><small>営業時間・料金・設備は出発前に公式情報を確認してください。</small></p>`;
  }
}



async function loadRouteV15(place){
  const routeBox=$("#routeV15Box");
  if(!routeBox)return;

  const saved=JSON.parse(localStorage.getItem("weekend_ai_coords_v1")||"null");
  const originLat=Number(saved?.latitude);
  const originLon=Number(saved?.longitude);
  const destinationLat=Number(place?.lat);
  const destinationLon=Number(place?.lon);

  if(
    !Number.isFinite(originLat)||
    !Number.isFinite(originLon)
  ){
    routeBox.innerHTML=`
      <h3>🚗 現在地からの車ルート</h3>
      <p>📍 現在地が未取得です。</p>
      <p><small>ホームで「現在地を取得」を押すと、実際の車ルートを計算できます。</small></p>`;
    return;
  }

  if(
    !Number.isFinite(destinationLat)||
    !Number.isFinite(destinationLon)
  ){
    routeBox.innerHTML=`
      <h3>🚗 現在地からの車ルート</h3>
      <p>⚠️ この施設の位置情報を取得できませんでした。</p>`;
    return;
  }

  routeBox.innerHTML=`
    <h3>🚗 現在地からの車ルート</h3>
    <div class="spot-loading">🛣️ Google Routesで実際の道路ルートを計算中…</div>`;

  try{
    const response=await fetch(`${WEEKEND_AI_API}/route-v15`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        origin:{lat:originLat,lon:originLon},
        destination:{lat:destinationLat,lon:destinationLon}
      })
    });

    const result=await response.json().catch(()=>null);

    if(!response.ok||!result?.ok){
      throw new Error(result?.detail||result?.error||`HTTP ${response.status}`);
    }

    const route=result.route||{};
    routeBox.innerHTML=`
      <h3>🚗 現在地からの車ルート</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
        <div style="padding:12px;border-radius:14px;background:rgba(255,255,255,.65);text-align:center;">
          <small>走行距離</small>
          <div style="font-size:1.25rem;font-weight:700;margin-top:4px;">${escapeHtmlGoogle(route.displayDistance||"情報なし")}</div>
        </div>
        <div style="padding:12px;border-radius:14px;background:rgba(255,255,255,.65);text-align:center;">
          <small>車の所要時間</small>
          <div style="font-size:1.25rem;font-weight:700;margin-top:4px;">約 ${escapeHtmlGoogle(route.displayDuration||"情報なし")}</div>
        </div>
      </div>
      <p style="margin-top:10px;"><small>🛣️ Google Routes APIによる道路ルートを使用しています。交通状況などにより実際の時間は変わる場合があります。</small></p>`;
  }catch(error){
    console.error("v1.5 ルート取得エラー",error);
    routeBox.innerHTML=`
      <h3>🚗 現在地からの車ルート</h3>
      <p>⚠️ 車ルートを取得できませんでした。</p>
      <p><small>${escapeHtmlGoogle(error?.message||"")}</small></p>`;
  }
}

async function generateDayPlanV14(mainSpot){
  const box=$("#dayPlanV14Box");
  const button=$("#makeDayPlanV14");
  if(!box)return;

  if(!Array.isArray(latestWeekendCandidates)||!latestWeekendCandidates.length){
    box.innerHTML="<p>⚠️ 1日プラン用の候補施設がありません。ホームで実在スポットを取得してからお試しください。</p>";
    return;
  }

  if(button){
    button.disabled=true;
    button.textContent="✨ AIが1日プランを作成中…";
   // v1.6 現在地が未取得なら、ここで取得する
if (!currentPosition) {
  if (!navigator.geolocation) {
    box.innerHTML =
      "<p>⚠️ この端末では位置情報を利用できません。</p>";

    if (button) {
      button.disabled = false;
      button.textContent =
        "✨ この場所を中心に1日プランを作る";
    }

    return;
  }

  box.innerHTML =
    '<p>📍 現在地を確認しています...</p>';

  try {
    const position = await new Promise(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }
    );

    currentPosition = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };
  } catch (error) {
    box.innerHTML =
      "<p>⚠️ 現在地を取得できませんでした。位置情報の許可を確認してください。</p>";

    if (button) {
      button.disabled = false;
      button.textContent =
        "✨ この場所を中心に1日プランを作る";
    }

    return;
  }
}
  }
  box.innerHTML='<div class="spot-loading">🤖 無理のない1日を組み立てています…</div>';

  try{
    const candidates=[
      mainSpot,
      ...latestWeekendCandidates.filter(x=>x?.id&&x.id!==mainSpot?.id)
    ].filter((x,i,a)=>x?.id&&a.findIndex(y=>y?.id===x.id)===i).slice(0,30);

    const response = await fetch(`${WEEKEND_AI_API}/day-plan-v16`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        candidates,
       origin: {
  lat: Number(currentPosition?.lat),
  lon: Number(currentPosition?.lon),
},

       mainPlaceId: String(mainSpot?.id || ""),
       
        conditions:{
          mainPlaceId:mainSpot?.id||"",
          mainPlaceName:mainSpot?.name||"",
          requestType:"selected_main_place_day_plan",
          note:"mainPlaceIdの施設をメイン候補として優先し、無理のない1日プランを作る"
        }
      })
    });

    const result=await response.json().catch(()=>null);
    if(!response.ok||!result?.ok){
      throw new Error(result?.detail||result?.error||`HTTP ${response.status}`);
    }

    const plan=result.dayPlan||{};
    const timeline=Array.isArray(plan.timeline)?plan.timeline:[];
   const routes = plan.routes || {};

const homeToMain = routes.homeToMain || null;
const mainToAfternoon = routes.mainToAfternoon || null;
const lastToHome = routes.lastToHome || null;

const estimatedHomeArrival =
  plan.estimatedHomeArrival || "";

const requestedReturnTime =
  plan.requestedReturnTime || "";

const shortenedForReturnTime =
  plan.shortenedForReturnTime === true;
    const icon=t=>t==="departure"?"🏠":t==="spot"?"📍":t==="lunch"?"🍴":t==="return"?"🏠":"🕒";

    const rows=timeline.length?timeline.map(item=>`
      <div style="display:grid;grid-template-columns:58px 30px 1fr;gap:6px;align-items:start;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.08);">
        <b>${escapeHtmlGoogle(item?.time||"")}</b>
        <span>${icon(item?.type)}</span>
        <div><b>${escapeHtmlGoogle(item?.title||"")}</b>
        ${item?.note?`<div style="margin-top:4px;line-height:1.6;"><small>${escapeHtmlGoogle(item.note)}</small></div>`:""}</div>
      </div>`).join(""):"<p>タイムライン情報がありません。</p>";

    box.innerHTML=`
      <div style="margin-top:12px;">
        <h3>${escapeHtmlGoogle(plan.title||"今日の1日お出かけプラン")}</h3>
        <div style="margin:10px 0;padding:12px;background:#f7faf7;border-radius:12px;">
  <div style="font-weight:700;margin-bottom:8px;">
    🚗 Google Routes 実走ルート
  </div>

  ${
    homeToMain
      ? `
        <div style="margin-bottom:5px;">
          🏠 出発 → メイン施設：
          約${escapeHtml(String(homeToMain.durationMinutes))}分 /
          ${escapeHtml(String(homeToMain.distanceKm))}km
        </div>
      `
      : ""
  }

  ${
    mainToAfternoon
      ? `
        <div style="margin-bottom:5px;">
          📍 メイン施設 → 午後スポット：
          約${escapeHtml(String(mainToAfternoon.durationMinutes))}分 /
          ${escapeHtml(String(mainToAfternoon.distanceKm))}km
        </div>
      `
      : ""
  }

  ${
    lastToHome
      ? `
        <div style="margin-bottom:5px;">
          🏠 最後の施設 → 帰宅：
          約${escapeHtml(String(lastToHome.durationMinutes))}分 /
          ${escapeHtml(String(lastToHome.distanceKm))}km
        </div>
      `
      : ""
  }

  ${
    estimatedHomeArrival
      ? `
        <div style="margin-top:8px;font-weight:700;">
          🏠 帰宅予定 ${escapeHtml(estimatedHomeArrival)}
          ${
            requestedReturnTime
              ? `（希望 ${escapeHtml(requestedReturnTime)}まで）`
              : ""
          }
        </div>
      `
      : ""
  }

  ${
    shortenedForReturnTime
      ? `
        <div style="margin-top:6px;font-size:12px;">
          ⚡ 帰宅希望時刻を考慮して、午後の予定を短縮しました。
        </div>
      `
      : ""
  }
</div>
        ${plan.summary?`<p style="line-height:1.7;">${escapeHtmlGoogle(plan.summary)}</p>`:""}
        <div>${rows}</div>
        ${plan.reason?`<div style="margin-top:12px;"><b>✨ このプランにした理由</b><p style="line-height:1.7;">${escapeHtmlGoogle(plan.reason)}</p></div>`:""}
        <p><small>⚠️ ${escapeHtmlGoogle(plan.caution||"営業時間・料金・設備などは出発前に公式情報をご確認ください。")}</small></p>
      </div>`;
  }catch(error){
    console.error("v1.4 1日プラン作成エラー",error);
    box.innerHTML=`<p>⚠️ 1日プランを作成できませんでした。</p><p><small>${escapeHtmlGoogle(error?.message||"")}</small></p>`;
  }finally{
    if(button){
      button.disabled=false;
      button.textContent="✨ この場所を中心に1日プランを作り直す";
    }
  }
}

async function generateAIPlansV12(){
  const status=$("#aiPlanStatus");
  if(!latestWeekendCandidates.length){
    if(status)status.textContent="先に現在地から実在スポットを取得してください";
    return;
  }

  if(status)status.textContent="✨ AIが3プランを考えています…";
  $("#planCards").innerHTML=`
    <div class="spot-loading">
      ✨ 実在スポット${latestWeekendCandidates.length}件からAIが選定中…<br>
      <small>今日のイチオシ・お得重視・子ども優先</small>
    </div>`;

  try{
    const response=await fetch(`${WEEKEND_AI_API}/plans-v12`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        candidates:latestWeekendCandidates,
        conditions:buildAIConditions()
      })
    });

    const result=await response.json().catch(()=>null);

    if(!response.ok||!result?.ok){
      throw new Error(result?.detail||result?.error||`HTTP ${response.status}`);
    }

    const plans=Array.isArray(result.plans)?result.plans:[];
    if(plans.length!==3)throw new Error("3プランを取得できませんでした");

    renderAIPlans(plans);
    if(status)status.textContent=`v1.2 AI：実在候補${result.candidateCount||latestWeekendCandidates.length}件から3プラン作成`;
  }catch(error){
    console.error("v1.2 AIプラン生成エラー",error);
    if(status)status.textContent=`AIプラン生成エラー：${error?.message||"不明なエラー"}`;
    $("#planCards").innerHTML=`
      <div class="spot-loading">
        ⚠️ AIプランを作成できませんでした。<br>
        <small>${escapeHtmlGoogle(error?.message||"")}</small><br>
        <button class="retry-spots" id="retryAIPlans">もう一度AIで作る</button>
      </div>`;
    const retry=$("#retryAIPlans");
    if(retry)retry.onclick=generateAIPlansV12;
  }
}

async function testGoogleV10() {
  const status = document.getElementById("spotStatus");
  const cards = document.getElementById("realSpotCards");

  let coords = null;

  try {
    coords = JSON.parse(
      localStorage.getItem("weekend_ai_coords_v1")
    );
  } catch (e) {
    console.error("保存座標の読み込みエラー", e);
  }

  // --------------------------------------------
  // 現在地チェック
  // --------------------------------------------
  if (
    !coords ||
    !Number.isFinite(Number(coords.latitude)) ||
    !Number.isFinite(Number(coords.longitude))
  ) {
    if (status) {
      status.textContent =
        "先に「現在地と天気を取得」を押してください";
    }

    if (cards) {
      cards.innerHTML = `
        <div class="spot-loading">
          📍 現在地を取得してから検索してください。
        </div>
      `;
    }

    return;
  }

  const latitude = Number(coords.latitude);
  const longitude = Number(coords.longitude);

  // --------------------------------------------
  // 検索中表示
  // --------------------------------------------
  if (status) {
    status.textContent =
      "v1.1：おすすめ候補を選定中…";
  }

  if (cards) {
    cards.innerHTML = `
      <div class="spot-loading">
        ✨ 週末AIがお出かけ候補を選んでいます…<br>
        <small>
          100km圏のスポットからカテゴリ・距離を考慮して選定
        </small>
      </div>
    `;
  }

  try {
    // --------------------------------------------
    // Worker v1.0
    // --------------------------------------------
    const apiUrl =
      `${WEEKEND_AI_API}/spots-v10` +
      `?lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}`;

    const response = await fetch(apiUrl);

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data?.detail ||
        data?.error ||
        `HTTP ${response.status}`
      );
    }

    const spots =
      Array.isArray(data.spots)
        ? data.spots
        : [];

    const originalCount =
      Number(data.originalCount) || 0;

    latestWeekendCandidates = spots;
    const aiStatus=$("#aiPlanStatus");
    if(aiStatus)aiStatus.textContent="実在スポット取得完了。上の「いつもの条件でAI提案」で3プランを作れます";

    // --------------------------------------------
    // ステータス
    // --------------------------------------------
    if (status) {
      status.textContent =
        `v1.1：${originalCount}件 → ${spots.length}件に厳選`;
    }

    if (!cards) {
      return;
    }

    if (!spots.length) {
      cards.innerHTML = `
        <div class="spot-loading">
          おすすめ候補が見つかりませんでした。
        </div>
      `;
      return;
    }

    // --------------------------------------------
    // スポット表示
    // --------------------------------------------
    cards.innerHTML = spots
      .map((spot) => {
        const distanceNumber =
          Number(spot.distanceKm);

        const distance =
          Number.isFinite(distanceNumber)
            ? `${distanceNumber.toFixed(1)} km`
            : "";

        const category =
          spot.categoryLabel ||
          spot.primaryType ||
          "お出かけスポット";

        const emoji =
          spot.emoji || "📍";
       // Google評価・口コミ数
const ratingNumber =
  Number(spot.rating);

const rating =
  Number.isFinite(ratingNumber) && ratingNumber > 0
    ? ratingNumber.toFixed(1)
    : "";

const reviewCount =
  Number(spot.userRatingCount);

const reviews =
  Number.isFinite(reviewCount) && reviewCount > 0
    ? reviewCount.toLocaleString("ja-JP")
    : "";

        // 距離帯
        let distanceLabel = "";

        switch (spot.distanceBand) {
          case "near":
            distanceLabel = "近場";
            break;

          case "middle":
            distanceLabel = "ちょっとお出かけ";
            break;

          case "far":
            distanceLabel = "週末ドライブ";
            break;

          case "long":
            distanceLabel = "遠出";
            break;

          default:
            distanceLabel = "";
        }

        return `
          <div class="real-spot">

            <div class="real-spot-icon">
              ${escapeHtmlGoogle(emoji)}
            </div>

            <div class="real-spot-main">

              <b>
                ${escapeHtmlGoogle(
                  spot.name || "名称不明"
                )}
              </b>
              
${
  rating
    ? `
      <div class="real-spot-rating">
        ⭐ ${escapeHtmlGoogle(rating)}
        ${
          reviews
            ? ` ・ 口コミ ${escapeHtmlGoogle(reviews)}件`
            : ""
        }
      </div>
    `
    : ""
}

              <small>
                ${escapeHtmlGoogle(category)}
                ${
                  distanceLabel
                    ? ` ・ ${escapeHtmlGoogle(distanceLabel)}`
                    : ""
                }
                ${
                  spot.address
                    ? ` ・ ${escapeHtmlGoogle(spot.address)}`
                    : ""
                }
              </small>

            </div>

            <div class="real-spot-distance">
              ${escapeHtmlGoogle(distance)}
            </div>

          </div>
        `;
      })
      .join("");

  } catch (error) {
    console.error(
      "v1.0 おすすめ候補エラー",
      error
    );

    if (status) {
      status.textContent =
        "v1.0エラー：" +
        (error?.message || "不明なエラー");
    }

    if (cards) {
      cards.innerHTML = `
        <div class="spot-loading">
          ⚠️ おすすめ候補の取得に失敗しました。<br>
          <small>
            ${escapeHtmlGoogle(
              error?.message || ""
            )}
          </small>
        </div>
      `;
    }
  }
}


// ================================================
// v1.0テストボタン
// ================================================
document.addEventListener(
  "DOMContentLoaded",
  () => {
    const button =
      document.getElementById(
        "googleV10TestBtn"
      );

    if (button) {
      button.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        testGoogleV10();
      };
    }
  }
);

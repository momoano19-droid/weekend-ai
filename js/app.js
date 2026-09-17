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
  if(!navigator.geolocation){
    alert("このブラウザは位置情報に対応していません。場所入力を使ってください。");
    return;
  }
  $("#weatherText").textContent="取得中…";
  $("#spotStatus").textContent="現在地取得中…";
  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude,longitude}=pos.coords;
    setPlaceLabel("現在地");
    localStorage.setItem("weekend_ai_coords_v1",JSON.stringify({latitude,longitude}));
    try{await loadWeather(latitude,longitude)}catch(e){$("#weatherText").textContent="取得失敗"}
    await testGoogleV10();
  },()=>{
    $("#weatherText").textContent="未取得";
    $("#spotStatus").textContent="現在地未取得";
    alert("位置情報を取得できませんでした。ブラウザの位置情報許可を確認するか、「場所を入力」を使ってください。");
  },{enableHighAccuracy:true,timeout:10000,maximumAge:300000});
}

$("#getLocationBtn").onclick=useCurrentLocation;
$("#manualLocationBtn").onclick=async()=>{
  const name=prompt("市区町村や地名を入力してください（例：南魚沼市、新潟市）");
  if(!name)return;
  $("#weatherText").textContent="検索中…";
  try{
    const u=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=ja&countryCode=JP&format=json`;
    const r=await fetch(u);
    if(!r.ok)throw new Error("geocode");
    const j=await r.json();
    if(!j.results?.length)throw new Error("notfound");
    const x=j.results[0];
    setPlaceLabel([x.name,x.admin1].filter(Boolean).join("・"));
    localStorage.setItem("weekend_ai_coords_v1",JSON.stringify({latitude:x.latitude,longitude:x.longitude}));
    await loadWeather(x.latitude,x.longitude);
    await testGoogleV10();
  }catch(e){
    $("#weatherText").textContent="未取得";
    alert("場所が見つかりませんでした。別の地名で試してください。");
  }
};

const WEEKEND_AI_API="https://weekend-ai-api.momo-ano19.workers.dev";

function escapeHtmlGoogle(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const savedCoords=JSON.parse(localStorage.getItem("weekend_ai_coords_v1")||"null");
if(savedCoords){
  loadWeather(savedCoords.latitude,savedCoords.longitude).catch(()=>{});
  setTimeout(()=>testGoogleV10(),0);
}

// ================================================
// v1.1 週末AI おすすめ候補
// ================================================
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
    // Worker v1.1
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
      "v1.1 おすすめ候補エラー",
      error
    );

    if (status) {
      status.textContent =
        "v1.1エラー：" +
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
// v1.1 更新ボタン
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
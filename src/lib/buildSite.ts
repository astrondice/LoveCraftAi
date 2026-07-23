import { THEMES, type Theme } from "./themes";

export type BuildInput = {
  name1: string;
  name2: string;
  message: string;
  date: string;
  duration: string;
  memory: string;
  photos: { name: string; dataUrl: string }[];
  music: { name: string; dataUrl: string } | null;
  video: { name: string; dataUrl: string } | null;
  themeId: string;
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type Data = {
  n1: string;
  n2: string;
  msg: string;
  date: string;
  duration: string;
  memory: string;
  photos: { dataUrl: string }[];
  music: { dataUrl: string; name: string } | null;
  video: { dataUrl: string; name: string } | null;
  theme: Theme;
  first10: string;
  words: string[];
};

const SHARED_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{overflow-x:hidden;color:#faf9f6}
canvas#bgfx{position:fixed;inset:0;z-index:0;pointer-events:none}
main{position:relative;z-index:10;opacity:0;transition:opacity 1.2s ease}
main.show{opacity:1}
#prog{position:fixed;top:0;left:0;height:2px;z-index:200;width:0;transition:width .1s}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
.reveal.in{opacity:1;transform:translateY(0)}
.d1{transition-delay:.1s}.d2{transition-delay:.22s}.d3{transition-delay:.38s}
.scene{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:5rem 1.5rem;position:relative;overflow:hidden}
.inner{max-width:960px;width:100%}
.op{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.5rem;cursor:pointer;transition:opacity 1.4s ease;padding:2rem;text-align:center}
.op.out{opacity:0;pointer-events:none}
.op .skip-btn{position:absolute;bottom:2rem;font-size:11px;letter-spacing:.3em;text-transform:uppercase;opacity:.5;background:none;border:1px solid rgba(255,255,255,.2);color:inherit;padding:.6rem 1.2rem;cursor:pointer;font-family:inherit}
@media (max-width:560px){.scene{padding:4rem 1rem}}
`;

const SHARED_JS = `
var aud=document.getElementById('bg-audio');
function fadeVol(from,to,ms){if(!aud)return;var s=Date.now(),d=to-from;(function f(){var p=Math.min(1,(Date.now()-s)/ms);aud.volume=from+d*p;if(p<1)requestAnimationFrame(f)})()}
function initProg(){var b=document.getElementById('prog');window.addEventListener('scroll',function(){b.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%'},{passive:true})}
function initReveal(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('.reveal').forEach(function(el,i){setTimeout(function(){el.classList.add('in')},i*120)});io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.scene,.reveal,.tl-item,.stat,.fq').forEach(function(el){io.observe(el)})}
var revealed=false;
function dismiss(){if(revealed)return;revealed=true;var op=document.getElementById('op');op.classList.add('out');setTimeout(function(){op.style.display='none';document.querySelector('main').classList.add('show');initReveal();initProg();if(typeof initFinale==='function')initFinale();if(aud){aud.volume=0;aud.play().catch(function(){});fadeVol(0,.6,2500)}},1800)}
document.getElementById('op').addEventListener('click',dismiss);
var sk=document.querySelector('.skip-btn');if(sk)sk.addEventListener('click',function(e){e.stopPropagation();dismiss()});
setTimeout(dismiss,7000);
`;

function prep(input: BuildInput): Data {
  const t: Theme = THEMES[input.themeId] ?? THEMES.cosmic;
  const msg = esc(input.message || "");
  const words = msg.split(/\s+/).filter(Boolean);
  return {
    n1: esc(input.name1 || "You"),
    n2: esc(input.name2 || "Them"),
    msg,
    date: esc(input.date || ""),
    duration: esc(input.duration || ""),
    memory: esc(input.memory || ""),
    photos: input.photos.map((p) => ({ dataUrl: p.dataUrl })),
    music: input.music,
    video: input.video,
    theme: t,
    first10: words.slice(0, 10).join(" "),
    words,
  };
}

const audioTag = (d: Data) =>
  d.music ? `<audio id="bg-audio" src="${d.music.dataUrl}" loop preload="auto"></audio>` : "";

const videoScene = (d: Data, title: string, cls = "") =>
  d.video
    ? `<section class="scene ${cls}"><div class="inner"><h2 class="scene-title reveal">${title}</h2><video controls playsinline src="${d.video.dataUrl}" class="reveal" style="width:100%;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.7)"></video></div></section>`
    : "";

const timelineItems = (d: Data) => [
  { t: "The Beginning", h: "When we met", p: "The moment two worlds became one." },
  {
    t: d.date || "A day to remember",
    h: d.duration || "Growing together",
    p: "Every day since has been another page.",
  },
  { t: "Today", h: "Right now", p: d.first10 || d.memory || "Still writing this chapter." },
  { t: "Forever", h: "Always", p: "The next scenes belong to us." },
];

/* ═══════════════ THEME 1 — COSMIC LOVE ═══════════════ */
function buildCosmicLove(d: Data): string {
  const t = d.theme;
  const photos = d.photos.slice(0, 5);
  const photoRing = photos
    .map((p, i) => {
      const angle = (360 / Math.max(photos.length, 1)) * i;
      return `<figure class="cph" style="transform:rotate(${angle}deg) translateX(180px) rotate(-${angle}deg)"><img src="${p.dataUrl}" alt=""/></figure>`;
    })
    .join("");
  const wordsHtml = d.words
    .slice(0, 12)
    .map((w, i) => `<span style="animation-delay:${i * 0.15}s">${w} </span>`)
    .join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${d.n1} &amp; ${d.n2} — Cosmic Love</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Space+Mono:wght@400;700&display=swap"/>
<style>${SHARED_CSS}
body{background:${t.bg};font-family:'Space Mono',monospace}
#prog{background:linear-gradient(90deg,${t.c1},${t.c3})}
.op{background:#000;color:#fff}
.op .line{font-family:'Space Mono',monospace;font-size:14px;color:${t.c3};overflow:hidden;white-space:nowrap;border-right:2px solid ${t.c3};width:0;animation:typ 1.2s steps(40) forwards}
.op .line.l2{animation-delay:1.3s}.op .line.l3{animation-delay:2.6s}.op .line.l4{animation-delay:3.9s}
@keyframes typ{to{width:100%}}
.hero h1{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:clamp(48px,10vw,140px);text-align:center;color:#fff;text-shadow:0 0 30px ${t.c1};line-height:1.1}
.hero .amp{color:${t.c3};display:inline-block;padding:0 .4em;animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
.hero .sub{margin-top:2rem;text-align:center;font-size:12px;letter-spacing:.4em;color:${t.c3};text-transform:uppercase}
.transmission{max-width:800px;margin:0 auto;padding:3rem;border:1px solid rgba(201,169,110,.4);background:rgba(0,0,0,.4)}
.transmission .label{font-size:11px;letter-spacing:.3em;color:${t.c3};margin-bottom:1.5rem}
.transmission .words{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(20px,3vw,32px);line-height:1.5}
.transmission .words span{opacity:0;animation:wIn .6s forwards}
@keyframes wIn{to{opacity:1}}
.constellation{position:relative;width:100%;height:520px;display:flex;align-items:center;justify-content:center}
.constellation .ring{position:relative;width:0;height:0}
.cph{position:absolute;width:110px;height:140px;margin:-70px 0 0 -55px;border-radius:8px;overflow:hidden;box-shadow:0 0 30px ${t.c1};transition:transform .5s}
.cph img{width:100%;height:100%;object-fit:cover}
.letter{max-width:820px;margin:0 auto;padding:3rem;border:1px solid rgba(201,169,110,.35);background:rgba(0,0,0,.35)}
.letter .lbl{font-size:11px;letter-spacing:.3em;color:${t.c3};text-align:center;margin-bottom:2rem}
.letter .msg{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;line-height:2.2}
.tl{max-width:720px;margin:0 auto;position:relative;padding-left:32px;border-left:1px solid ${t.c3}}
.tl-item{margin-bottom:2.5rem;position:relative}
.tl-item::before{content:'';position:absolute;left:-40px;top:6px;width:12px;height:12px;border-radius:50%;background:${t.c3};box-shadow:0 0 20px ${t.c3}}
.tl-item time{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.2em;color:${t.c3}}
.tl-item h4{font-family:'Cormorant Garamond',serif;font-size:22px;margin:.4rem 0}
.tl-item p{opacity:.75}
.finale{text-align:center;position:relative}
.finale h2{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:clamp(64px,12vw,160px);background:linear-gradient(90deg,${t.c3},${t.c1},${t.c2},${t.c3});background-size:300% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sh 4s ease infinite;line-height:1.1}
@keyframes sh{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.finale p{margin-top:2rem;letter-spacing:.3em;font-size:12px;color:${t.c3};text-transform:uppercase}
.burst{position:absolute;top:50%;left:50%;width:6px;height:6px;border-radius:50%;pointer-events:none}
</style></head>
<body>
<div class="op" id="op"><p class="line">&gt; initializing transmission...</p><p class="line l2">&gt; signal detected from ${d.n1}</p><p class="line l3">&gt; recipient: ${d.n2}</p><p class="line l4">&gt; opening stargate...</p><button class="skip-btn">Skip</button></div>
<div id="prog"></div><canvas id="bgfx"></canvas>${audioTag(d)}
<main>
<section class="scene hero"><div class="inner"><h1>${d.n1}<span class="amp">∞</span>${d.n2}</h1><p class="sub">${d.date}${d.duration ? " · " + d.duration : ""}</p></div></section>
${d.first10 ? `<section class="scene"><div class="inner transmission reveal"><div class="label">— INCOMING TRANSMISSION —</div><p class="words">${wordsHtml}</p></div></section>` : ""}
${photos.length ? `<section class="scene"><div class="inner"><h2 style="font-family:'Cormorant Garamond',serif;font-style:italic;text-align:center;font-size:2rem;margin-bottom:2rem" class="reveal">Constellation of Us</h2><div class="constellation reveal"><div class="ring">${photoRing}</div></div></div></section>` : ""}
${d.msg ? `<section class="scene"><div class="inner letter reveal"><div class="lbl">— DECODED MESSAGE —</div><p class="msg">${d.msg}</p></div></section>` : ""}
${d.memory ? `<section class="scene"><div class="inner"><blockquote class="reveal" style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(22px,3vw,36px);border-left:3px solid ${t.c3};padding-left:2rem;max-width:800px;margin:0 auto">${d.memory}</blockquote></div></section>` : ""}
<section class="scene"><div class="inner"><h2 style="font-family:'Cormorant Garamond',serif;font-style:italic;text-align:center;font-size:2rem;margin-bottom:2.5rem" class="reveal">Our Timeline</h2><div class="tl">${timelineItems(
    d,
  )
    .map((i) => `<div class="tl-item reveal"><time>${i.t}</time><h4>${i.h}</h4><p>${i.p}</p></div>`)
    .join("")}</div></div></section>
${videoScene(d, "Moving Pictures")}
<section class="scene finale"><div class="inner"><h2 class="reveal">${d.n1} &amp; ${d.n2}</h2><p class="reveal">You are my universe</p></div></section>
</main>
<script>
${SHARED_JS}
var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H,parts=[],blobs=[],shoot=null,lastShoot=0;
function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
for(var i=0;i<220;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.4,vy:-(Math.random()*.1+.05),o:Math.random()*Math.PI*2});
blobs=[{x:.7,y:.15,r:.6,c:'192,96,160',a:.09,sx:.3,dx:.08,dy:0},{x:.1,y:.7,r:.55,c:'112,48,208',a:.08,sx:.25,dx:0,dy:.06},{x:.5,y:.45,r:.4,c:'201,169,110',a:.05,sx:.2,dx:.05,dy:.05}];
function frame(t){x.clearRect(0,0,W,H);blobs.forEach(function(b,i){var cx=(b.x+Math.sin(t*.0003*b.sx+i)*b.dx)*W,cy=(b.y+Math.cos(t*.00025*b.sx+i)*b.dy)*H,rr=b.r*W;var g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba('+b.c+','+b.a+')');g.addColorStop(1,'rgba('+b.c+',0)');x.fillStyle=g;x.fillRect(0,0,W,H)});
parts.forEach(function(p){p.y+=p.vy;if(p.y<0)p.y=H;var a=.4+Math.sin(t*.002+p.o)*.4;x.fillStyle='rgba(255,255,255,'+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()});
if(t-lastShoot>5000&&!shoot){shoot={x:Math.random()*W,y:0,life:0};lastShoot=t}
if(shoot){shoot.life+=16;var pr=shoot.life/800;x.strokeStyle='rgba(255,255,255,'+(.8*(1-pr))+')';x.lineWidth=2;x.beginPath();x.moveTo(shoot.x,shoot.y);x.lineTo(shoot.x+200*pr,shoot.y+100*pr);x.stroke();if(pr>=1)shoot=null}
requestAnimationFrame(frame)}requestAnimationFrame(frame);
function initFinale(){var f=document.querySelector('.finale');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){for(var k=0;k<50;k++){var s=document.createElement('span');s.className='burst';var col=['${t.c1}','${t.c3}','${t.c2}'][k%3];s.style.background=col;s.style.boxShadow='0 0 12px '+col;var ang=Math.random()*Math.PI*2,dist=100+Math.random()*400;s.style.setProperty('--tx',Math.cos(ang)*dist+'px');s.style.setProperty('--ty',Math.sin(ang)*dist+'px');s.style.animation='sp 2.5s ease-out forwards';s.style.animationDelay=(k*.03)+'s';f.appendChild(s)}}})},{threshold:.4});io.observe(f)}
var st=document.createElement('style');st.textContent='@keyframes sp{to{transform:translate(var(--tx),var(--ty));opacity:0}}';document.head.appendChild(st);
</script></body></html>`;
}

/* ═══════════════ THEME 2 — FOREVER MEMORIES ═══════════════ */
function buildForeverMemories(d: Data): string {
  const t = d.theme;
  const captions = ["a moment", "us", "forever", "us again", "always", "still"];
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${d.n1} &amp; ${d.n2} — Forever Memories</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Lora:ital,wght@0,400;1,400&family=Dancing+Script:wght@500&display=swap"/>
<style>${SHARED_CSS}
body{background:${t.bg};font-family:'Lora',serif}
#prog{background:${t.c1}}
.op{background:rgba(45,31,14,.97);color:#f5e8c8;animation:flick 3s infinite}
@keyframes flick{0%,100%{opacity:1}5%{opacity:.85}8%{opacity:1}20%{opacity:.9}22%{opacity:1}}
.op h1{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(28px,4vw,44px);text-align:center;max-width:800px}
.op .nm{margin-top:1.5rem;font-family:'Playfair Display',serif;font-size:2rem;clip-path:inset(0 100% 0 0);animation:ink 1.5s ease .8s forwards}
@keyframes ink{to{clip-path:inset(0 0 0 0)}}
.title-card{text-align:center;filter:sepia(.3) brightness(.95);box-shadow:inset 0 0 150px rgba(0,0,0,.7)}
.title-card::before,.title-card::after{content:'';position:absolute;left:0;right:0;height:10vh;background:#000;z-index:5}
.title-card::before{top:0}.title-card::after{bottom:0}
.title-card h1{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(48px,9vw,120px);color:${t.c3}}
.title-card .sub{font-family:'Lora',serif;font-style:italic;margin-top:1rem;opacity:.8}
.title-card .kind{font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:${t.c1};margin-bottom:1rem}
.polaroids{display:flex;flex-wrap:wrap;justify-content:center;gap:2rem;padding:2rem}
.pol{background:#f5f0e8;padding:12px 12px 40px;box-shadow:3px 3px 20px rgba(0,0,0,.5);transition:transform .5s,box-shadow .5s;position:relative}
.pol img{width:220px;height:260px;object-fit:cover;display:block}
.pol .cap{margin-top:12px;font-family:'Dancing Script',cursive;color:#2d1f0e;font-size:20px;text-align:center}
.parchment{max-width:780px;margin:0 auto;padding:4rem 3.5rem;background:linear-gradient(135deg,#f4e4c1,#e8d4a8);color:#2d1f0e;border-radius:4px;box-shadow:inset 0 0 60px rgba(0,0,0,.1),0 20px 60px rgba(0,0,0,.5);position:relative;background-image:repeating-linear-gradient(180deg,transparent,transparent 32px,rgba(139,26,26,.06) 33px),linear-gradient(135deg,#f4e4c1,#e8d4a8)}
.parchment .msg{font-family:'Lora',serif;font-style:italic;font-size:1.15rem;line-height:2.1}
.parchment .msg::first-letter{font-family:'Playfair Display',serif;font-weight:700;font-size:4rem;float:left;line-height:1;padding:.1em .1em 0 0;color:#8b1a1a}
.seal{width:60px;height:60px;border-radius:50%;background:radial-gradient(#a02020,#5a0808);display:flex;align-items:center;justify-content:center;color:#f0d090;box-shadow:0 4px 15px rgba(0,0,0,.6);margin:2rem auto 0}
.q-golden{text-align:center}
.q-golden p{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(28px,5vw,64px);background:linear-gradient(90deg,${t.c3},#f0d090,${t.c3});background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sh 3s linear infinite;max-width:1000px;margin:0 auto;line-height:1.3}
@keyframes sh{to{background-position:200% center}}
.orn{display:flex;align-items:center;justify-content:center;gap:1rem;margin:2rem 0;color:${t.c3}}
.orn::before,.orn::after{content:'';height:1px;background:${t.c3};width:80px;opacity:.6}
.tl{max-width:720px;margin:0 auto;position:relative;padding-left:32px;border-left:1px solid ${t.c3}}
.tl-item{margin-bottom:2.5rem;position:relative}
.tl-item::before{content:'';position:absolute;left:-40px;top:6px;width:12px;height:12px;border-radius:50%;background:${t.c1}}
.tl-item time{font-family:'Playfair Display',serif;font-style:italic;color:${t.c1};font-size:14px}
.tl-item h4{font-family:'Playfair Display',serif;font-size:22px;margin:.3rem 0}
.tl-item p{opacity:.75}
.finale{text-align:center}
.finale h2{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(56px,10vw,140px);color:${t.c1}}
.finale p{margin-top:2rem;font-family:'Lora',serif;font-style:italic;font-size:20px;opacity:.85}
.petal{position:fixed;top:-10vh;width:14px;height:14px;border-radius:50% 0 50% 0;pointer-events:none;z-index:20}
</style></head>
<body>
<div class="op" id="op"><h1>Some stories are worth remembering forever…</h1><div class="nm">${d.n1} &amp; ${d.n2}</div><button class="skip-btn">Skip</button></div>
<div id="prog"></div><canvas id="bgfx"></canvas>${audioTag(d)}
<main>
<section class="scene title-card"><div class="inner"><p class="kind">A Story Worth Keeping</p><h1>${d.n1} &amp; ${d.n2}</h1><p class="sub">${d.date}${d.duration ? " · " + d.duration : ""}</p></div></section>
${
  d.photos.length
    ? `<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'Playfair Display',serif;text-align:center;font-size:2.5rem;margin-bottom:2rem;color:${t.c3}">Polaroids</h2><div class="polaroids">${d.photos
        .slice(0, 12)
        .map(
          (p, i) =>
            `<figure class="pol reveal" style="transform:rotate(${(i % 5) - 2}deg)"><img src="${p.dataUrl}" alt=""/><figcaption class="cap">${captions[i % captions.length]}</figcaption></figure>`,
        )
        .join("")}</div></div></section>`
    : ""
}
${d.msg ? `<section class="scene"><div class="inner"><div class="parchment reveal"><p class="msg">${d.msg}</p><div class="seal">❤</div></div></div></section>` : ""}
${d.memory ? `<section class="scene q-golden"><div class="inner"><div class="orn"><span>❦</span></div><p class="reveal">"${d.memory}"</p><div class="orn"><span>❦</span></div></div></section>` : ""}
<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'Playfair Display',serif;text-align:center;font-size:2.5rem;margin-bottom:2.5rem;color:${t.c3}">Our Chapters</h2><div class="tl">${timelineItems(
    d,
  )
    .map((i) => `<div class="tl-item reveal"><time>${i.t}</time><h4>${i.h}</h4><p>${i.p}</p></div>`)
    .join("")}</div></div></section>
${videoScene(d, "The Reel")}
<section class="scene finale"><div class="inner"><h2 class="reveal">${d.n1} &amp; ${d.n2}</h2><p class="reveal">Some memories last forever.</p></div></section>
</main>
<script>
${SHARED_JS}
var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H,parts=[],blobs=[];
function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
for(var i=0;i<100;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()+.5,vx:(Math.random()-.5)*.05,vy:(Math.random()-.5)*.05,o:Math.random()*Math.PI*2});
blobs=[{x:.75,y:.2,r:.55,c:'208,128,64',a:.07},{x:.2,y:.75,r:.5,c:'160,32,32',a:.06}];
function frame(t){x.clearRect(0,0,W,H);blobs.forEach(function(b,i){var cx=(b.x+Math.sin(t*.00015+i)*.04)*W,cy=(b.y+Math.cos(t*.00015+i)*.04)*H,rr=b.r*W;var g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba('+b.c+','+b.a+')');g.addColorStop(1,'rgba('+b.c+',0)');x.fillStyle=g;x.fillRect(0,0,W,H)});
var cf=.15+Math.sin(t*.002)*.03;var cg=x.createRadialGradient(W*.5,H*.95,0,W*.5,H*.95,H*cf+H*.05);cg.addColorStop(0,'rgba(220,160,60,.06)');cg.addColorStop(1,'rgba(220,160,60,0)');x.fillStyle=cg;x.fillRect(0,0,W,H);
parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;var a=.3+Math.sin(t*.001+p.o)*.25;x.fillStyle='rgba(208,128,64,'+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()});
requestAnimationFrame(frame)}requestAnimationFrame(frame);
function initFinale(){var f=document.querySelector('.finale');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){for(var k=0;k<30;k++){(function(k){setTimeout(function(){var s=document.createElement('span');s.className='petal';s.style.left=Math.random()*100+'vw';var col=k%2?'rgba(232,80,122,.7)':'rgba(208,64,64,.6)';s.style.background=col;var dur=8+Math.random()*6;s.style.animation='fall '+dur+'s linear forwards';document.body.appendChild(s);setTimeout(function(){s.remove()},dur*1000)},k*250)})(k)}}})},{threshold:.4});io.observe(f)}
var st=document.createElement('style');st.textContent='@keyframes fall{to{transform:translateY(120vh) translateX('+(Math.random()>.5?'':'-')+'80px) rotate(720deg);opacity:0}}';document.head.appendChild(st);
</script></body></html>`;
}

/* ═══════════════ THEME 3 — ROSE GARDEN ═══════════════ */
function buildRoseGarden(d: Data): string {
  const t = d.theme;
  const midSentence = d.msg
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pullQuote = midSentence[Math.floor(midSentence.length / 2)] || d.first10;
  const gridPhotos = d.photos.slice(0, 5);
  const gridAreas = ["a", "b", "c", "d", "e"];
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${d.n1} &amp; ${d.n2} — Rose Garden</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Inter:wght@200;300;400;600&display=swap"/>
<style>${SHARED_CSS}
body{background:${t.bg};font-family:'Inter',sans-serif;font-weight:300}
#prog{background:${t.c1}}
.op{background:#160010;color:#fff}
.op .rose{font-size:2rem;opacity:0;animation:bloom 1.5s ease-out forwards}
@keyframes bloom{to{font-size:6rem;opacity:1}}
.op .n{font-family:'Bodoni Moda',serif;font-size:2.5rem;opacity:0;animation:fi 2s ease 1.6s forwards}
.op .n2{animation-delay:2.8s}
@keyframes fi{to{opacity:1}}
.cover{position:relative}
.cover .brand{position:absolute;top:2rem;left:2rem;font-weight:600;letter-spacing:.25em;text-transform:uppercase;font-size:12px;color:${t.c3}}
.cover .rule{width:60%;height:1px;background:${t.c1};margin:2rem auto}
.cover h1{font-family:'Bodoni Moda',serif;font-weight:700;font-size:clamp(64px,14vw,220px);text-align:center;letter-spacing:-.02em;line-height:.9}
.cover .amp{font-style:italic;font-weight:400;display:block;color:${t.c1};font-size:.5em;margin:.2em 0}
.cover .foot{position:absolute;bottom:2rem;left:2rem;right:2rem;display:flex;justify-content:space-between;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.bleed{padding:0;position:relative;overflow:hidden}
.bleed img{width:100%;height:100vh;object-fit:cover;animation:kb 8s ease-in-out infinite alternate}
@keyframes kb{to{transform:scale(1.06)}}
.bleed .ov{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,${t.bg} 100%)}
.bleed .nms{position:absolute;bottom:8vh;left:0;right:0;text-align:center;font-family:'Bodoni Moda',serif;font-size:clamp(40px,8vw,110px);color:#fff}
.edit{background:#fff;color:#0d0009;max-width:820px;margin:0 auto;padding:4rem 3.5rem;font-family:'Bodoni Moda',serif}
.edit .msg{font-size:1.1rem;line-height:1.9;column-count:1}
.edit .msg::first-letter{font-size:5rem;float:left;line-height:1;padding:.1em .1em 0 0;font-weight:700;color:${t.c1}}
.edit .pull{display:block;font-size:1.6rem;font-style:italic;color:${t.c1};border-left:3px solid ${t.c1};padding-left:1.5rem;margin:2rem 0}
.lookbook{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,240px);grid-template-areas:"a a b" "a a c" "d e c";gap:6px;max-width:1000px;margin:0 auto}
.lookbook figure{overflow:hidden;border:1px solid rgba(232,80,122,.2)}
.lookbook img{width:100%;height:100%;object-fit:cover;filter:grayscale(1);transition:filter .8s}
.lookbook figure:hover img{filter:grayscale(0)}
${gridAreas.map((a) => `.lookbook .g${a}{grid-area:${a}}`).join("")}
.runway{background:#000;overflow:hidden;white-space:nowrap}
.runway .row{display:inline-block;font-family:'Bodoni Moda',serif;font-style:italic;font-size:10vw;color:rgba(240,176,200,.9);animation:mq 18s linear infinite;padding-right:4vw}
.runway .row2{animation-duration:22s;animation-direction:reverse;color:rgba(232,80,122,.7)}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.finale{text-align:center;background:linear-gradient(135deg,${t.bg},#3d0020,${t.bg});background-size:200% 200%;animation:gs 6s ease infinite}
@keyframes gs{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.finale h2{font-family:'Bodoni Moda',serif;font-weight:700;font-size:clamp(56px,12vw,180px);letter-spacing:-.02em}
.finale .end{margin-top:2rem;font-weight:200;letter-spacing:.3em;font-size:12px;text-transform:uppercase;opacity:.8}
.conf{position:fixed;top:-20px;pointer-events:none;z-index:20}
</style></head>
<body>
<div class="op" id="op"><div class="rose">🌹</div><div class="n">${d.n1}</div><div class="n n2">${d.n2}</div><button class="skip-btn">Skip</button></div>
<div id="prog"></div><canvas id="bgfx"></canvas>${audioTag(d)}
<main>
<section class="scene cover"><span class="brand">LoveCraft · Issue No. 01</span><div class="inner"><h1>${d.n1}<span class="amp">&amp;</span>${d.n2}</h1><div class="rule"></div><p style="text-align:center;font-weight:200;letter-spacing:.3em;text-transform:uppercase;font-size:11px;color:${t.c3}">A Love Story Curated</p></div><div class="foot"><span>${d.date || "Timeless"}</span><span>${d.duration || "Forever"}</span></div></section>
${d.photos[0] ? `<section class="scene bleed"><img src="${d.photos[0].dataUrl}" alt=""/><div class="ov"></div><div class="nms">${d.n1} &amp; ${d.n2}</div></section>` : ""}
${
  d.msg
    ? `<section class="scene"><div class="edit reveal"><p class="msg">${d.msg
        .split(/(?<=[.!?])\s+/)
        .map((s, i) =>
          i === Math.floor(midSentence.length / 2) && pullQuote
            ? `<span class="pull">"${pullQuote}"</span> ${s}`
            : s,
        )
        .join(" ")}</p></div></section>`
    : ""
}
${gridPhotos.length > 1 ? `<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'Bodoni Moda',serif;text-align:center;font-size:2.5rem;margin-bottom:2rem">The Lookbook</h2><div class="lookbook reveal">${gridPhotos.map((p, i) => `<figure class="g${gridAreas[i]}"><img src="${p.dataUrl}" alt=""/></figure>`).join("")}</div></div></section>` : ""}
${d.first10 ? `<section class="scene runway"><div style="display:inline-block"><span class="row">${d.first10} · ${d.first10} · </span></div><br/><div style="display:inline-block;margin-top:2rem"><span class="row row2">${d.n1} &amp; ${d.n2} forever · ${d.n1} &amp; ${d.n2} forever · </span></div></section>` : ""}
${d.memory ? `<section class="scene"><div class="inner"><blockquote class="reveal" style="font-family:'Bodoni Moda',serif;font-style:italic;font-size:clamp(24px,4vw,44px);text-align:center;max-width:900px;margin:0 auto;color:${t.c3}">"${d.memory}"</blockquote></div></section>` : ""}
${videoScene(d, "The Film")}
<section class="scene finale"><div class="inner"><h2 class="reveal">${d.n1} &amp; ${d.n2}</h2><p class="end reveal">Forever in style. Forever in love.</p></div></section>
</main>
<script>
${SHARED_JS}
var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H,parts=[],blobs=[];
function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
var cols=['232,80,122','240,176,200','255,255,255'];
for(var i=0;i<130;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.4,vy:-(Math.random()*.1+.03),c:cols[i%3],o:Math.random()*Math.PI*2});
blobs=[{x:.8,y:.1,r:.65,c:'232,80,122',a:.1},{x:.05,y:.8,r:.55,c:'160,24,80',a:.08},{x:.5,y:.5,r:.35,c:'240,176,200',a:.05}];
function frame(t){x.clearRect(0,0,W,H);blobs.forEach(function(b,i){var cx=(b.x+Math.sin(t*.0002+i)*.03)*W,cy=(b.y+Math.cos(t*.0002+i)*.03)*H,rr=b.r*W;var g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba('+b.c+','+b.a+')');g.addColorStop(1,'rgba('+b.c+',0)');x.fillStyle=g;x.fillRect(0,0,W,H)});
parts.forEach(function(p){p.y+=p.vy;if(p.y<0)p.y=H;var a=.4+Math.sin(t*.0015+p.o)*.4;x.fillStyle='rgba('+p.c+','+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()});
requestAnimationFrame(frame)}requestAnimationFrame(frame);
function initFinale(){var f=document.querySelector('.finale');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){for(var k=0;k<50;k++){(function(k){setTimeout(function(){var s=document.createElement('span');s.className='conf';var kind=k%3;if(kind===0){s.style.width='4px';s.style.height='12px';s.style.background='#c9a96e';s.style.borderRadius='2px'}else if(kind===1){s.style.width='6px';s.style.height='6px';s.style.borderRadius='50%';s.style.background='#e8c060'}else{s.style.width='8px';s.style.height='8px';s.style.background='#f0b0c8';s.style.transform='rotate(45deg)'}s.style.left=Math.random()*100+'vw';var dur=4+Math.random()*3;s.style.animation='ct '+dur+'s linear forwards';document.body.appendChild(s);setTimeout(function(){s.remove()},dur*1000)},k*80)})(k)}}})},{threshold:.4});io.observe(f)}
var st=document.createElement('style');st.textContent='@keyframes ct{to{transform:translateY(115vh) rotate(720deg);opacity:0}}';document.head.appendChild(st);
</script></body></html>`;
}

/* ═══════════════ THEME 4 — DREAM UNIVERSE ═══════════════ */
function buildDreamUniverse(d: Data): string {
  const t = d.theme;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${d.n1} &amp; ${d.n2} — Dream Universe</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@200;300;400&display=swap"/>
<style>${SHARED_CSS}
body{background:${t.bg};font-family:'Inter',sans-serif;font-weight:300;text-transform:lowercase}
#prog{background:${t.c3}}
.op{background:rgba(2,2,16,.9);color:#fff}
.op p{font-family:'DM Serif Display',serif;font-size:clamp(22px,3.5vw,36px);text-align:center;max-width:800px;filter:blur(20px);opacity:0;animation:defog 2s ease .3s forwards}
@keyframes defog{to{filter:blur(0);opacity:1}}
.cloud{position:absolute;background:rgba(255,255,255,.06);border-radius:50%;filter:blur(30px);animation:drift 20s linear infinite}
.hero h1{font-family:'DM Serif Display',serif;font-size:clamp(56px,12vw,180px);text-align:center;color:#fff;text-shadow:0 0 40px rgba(80,144,232,.8),0 0 80px rgba(80,144,232,.4),0 0 120px rgba(128,208,255,.2);animation:float 4s ease-in-out infinite;line-height:1.05}
@keyframes float{0%,100%{transform:translateY(-8px)}50%{transform:translateY(8px)}}
.hero .sub{margin-top:2rem;text-align:center;font-size:12px;letter-spacing:.3em;color:${t.c3}}
.cloud-gallery{position:relative;min-height:600px;max-width:900px;margin:0 auto}
.blob{position:absolute;width:220px;height:220px;overflow:hidden;border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;animation:morph 8s ease-in-out infinite,fl 6s ease-in-out infinite}
.blob img{width:100%;height:100%;object-fit:cover;mix-blend-mode:normal}
.blob::after{content:'';position:absolute;inset:0;background:rgba(80,144,232,.15);mix-blend-mode:multiply}
@keyframes morph{0%,100%{border-radius:60% 40% 30% 70% / 60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40% / 50% 60% 30% 60%}}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
.fog-letter{max-width:820px;margin:0 auto;padding:4rem 3rem;background:rgba(255,255,255,.04);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border:1px solid rgba(128,208,255,.15);border-radius:20px}
.fog-letter .msg{font-family:'DM Serif Display',serif;font-size:1.2rem;line-height:2;font-style:italic}
.bubbles{display:flex;flex-wrap:wrap;justify-content:center;gap:2rem;max-width:900px;margin:0 auto}
.bub{width:220px;height:220px;border-radius:50%;background:rgba(80,144,232,.08);border:1px solid rgba(128,208,255,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;animation:fl 8s ease-in-out infinite}
.bub:nth-child(2){animation-duration:10s}.bub:nth-child(3){animation-duration:12s}.bub:nth-child(4){animation-duration:9s}
.bub time{font-size:10px;letter-spacing:.3em;color:${t.c3};opacity:.8}
.bub h4{font-family:'DM Serif Display',serif;font-size:18px;margin:.5rem 0;color:#fff}
.bub p{font-size:12px;opacity:.7}
.glitch{text-align:center}
.glitch .lbl{font-size:11px;letter-spacing:.3em;color:${t.c3};margin-bottom:1.5rem;opacity:.7}
.glitch p{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(28px,5vw,72px);max-width:1000px;margin:0 auto;animation:glch 5s ease infinite}
@keyframes glch{0%,100%{color:#80d0ff;transform:translateX(0)}20%{color:#e8507a;transform:translateX(-2px)}40%{color:#5090e8;transform:translateX(2px)}60%{color:#80d0ff;transform:translateX(0)}}
.finale{text-align:center}
.finale h2{font-family:'DM Serif Display',serif;font-size:clamp(56px,12vw,180px);color:#fff;text-shadow:0 0 40px rgba(80,144,232,.8),0 0 80px rgba(128,208,255,.4);line-height:1.05}
.finale .end{margin-top:2rem;font-weight:200;font-size:16px;color:#e8f0ff;opacity:.85}
.stardust{position:fixed;top:-20px;pointer-events:none;z-index:20;border-radius:50%}
</style></head>
<body>
<div class="op" id="op"><div class="cloud" style="width:400px;height:200px;left:-100px;top:20%;animation-duration:30s"></div><div class="cloud" style="width:300px;height:150px;right:-50px;top:60%;animation-duration:40s"></div><p>you were in a dream i never wanted to end…</p><button class="skip-btn">skip</button></div>
<div id="prog"></div><canvas id="bgfx"></canvas>${audioTag(d)}
<main>
<section class="scene hero"><div class="inner"><h1>${d.n1}<br/>&amp; ${d.n2}</h1><p class="sub">${d.date}${d.duration ? " · " + d.duration : ""}</p></div></section>
${
  d.photos.length
    ? `<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'DM Serif Display',serif;text-align:center;font-size:2.5rem;margin-bottom:3rem">clouds of us</h2><div class="cloud-gallery reveal">${d.photos
        .slice(0, 6)
        .map(
          (p, i) =>
            `<figure class="blob" style="top:${(i % 3) * 200}px;left:${(i % 2) * 60 + 5}%;animation-delay:${i * 0.5}s"><img src="${p.dataUrl}" alt=""/></figure>`,
        )
        .join("")}</div></div></section>`
    : ""
}
${d.msg ? `<section class="scene"><div class="inner"><div class="fog-letter reveal"><p class="msg">${d.msg}</p></div></div></section>` : ""}
<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'DM Serif Display',serif;text-align:center;font-size:2.5rem;margin-bottom:3rem">bubble memories</h2><div class="bubbles">${timelineItems(
    d,
  )
    .map((i) => `<div class="bub reveal"><time>${i.t}</time><h4>${i.h}</h4><p>${i.p}</p></div>`)
    .join("")}</div></div></section>
${d.memory ? `<section class="scene glitch"><div class="inner"><div class="lbl">— rewind to our beginning —</div><p class="reveal">"${d.memory}"</p></div></section>` : ""}
${videoScene(d, "moving dreams")}
<section class="scene finale"><div class="inner"><h2 class="reveal">${d.n1}<br/>&amp; ${d.n2}</h2><p class="end reveal">even in dreams, i choose you.</p></div></section>
</main>
<script>
${SHARED_JS}
var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H,parts=[],blobs=[],bubbles=[],lastBub=0;
function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
var cols=['80,144,232','80,32,192','128,208,255','255,255,255'];
for(var i=0;i<150;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+.5,vx:(Math.random()-.5)*.06,vy:(Math.random()-.5)*.06,c:cols[i%4],o:Math.random()*Math.PI*2});
blobs=[{x:.6,y:.2,r:.7,c:'80,144,232',a:.08},{x:.2,y:.65,r:.6,c:'80,32,192',a:.07},{x:.8,y:.7,r:.5,c:'128,208,255',a:.05},{x:.4,y:.4,r:.4,c:'255,255,255',a:.03}];
function frame(t){x.clearRect(0,0,W,H);blobs.forEach(function(b,i){var cx=(b.x+Math.sin(t*.00012+i)*.03)*W,cy=(b.y+Math.cos(t*.00012+i)*.03)*H,rr=b.r*W;var g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba('+b.c+','+b.a+')');g.addColorStop(1,'rgba('+b.c+',0)');x.fillStyle=g;x.fillRect(0,0,W,H)});
parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;var a=.4+Math.sin(t*.001+p.o)*.4;x.fillStyle='rgba('+p.c+','+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()});
if(t-lastBub>3000){bubbles.push({x:Math.random()*W,y:H+40,r:20+Math.random()*40,life:0});lastBub=t}
bubbles=bubbles.filter(function(b){b.y-=.4;b.life+=16;x.strokeStyle='rgba(128,208,255,'+(.15-b.life/40000)+')';x.lineWidth=1;x.beginPath();x.arc(b.x,b.y,b.r,0,Math.PI*2);x.stroke();return b.life<8000&&b.y>-100});
requestAnimationFrame(frame)}requestAnimationFrame(frame);
function initFinale(){var f=document.querySelector('.finale');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var cs=['#80d0ff','#5090e8','#c8b0ff','#fff'];for(var k=0;k<40;k++){(function(k){setTimeout(function(){var s=document.createElement('span');s.className='stardust';s.style.width=(6+Math.random()*4)+'px';s.style.height=s.style.width;s.style.background=cs[k%4];s.style.boxShadow='0 0 12px '+cs[k%4];s.style.left=Math.random()*100+'vw';var dur=6+Math.random()*5;s.style.animation='fall '+dur+'s ease-in forwards';document.body.appendChild(s);setTimeout(function(){s.remove()},dur*1000)},k*150)})(k)}}})},{threshold:.4});io.observe(f)}
var st=document.createElement('style');st.textContent='@keyframes fall{to{transform:translateY(115vh);opacity:0}}@keyframes drift{to{transform:translateX(100vw)}}';document.head.appendChild(st);
</script></body></html>`;
}

/* ═══════════════ THEME 5 — CINEMATIC STORY ═══════════════ */
function buildCinematicStory(d: Data): string {
  const t = d.theme;
  const half = Math.ceil(d.words.length / 2);
  const msgA = d.words.slice(0, half).join(" ");
  const msgB = d.words.slice(half).join(" ");
  const climax =
    d.msg
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || d.first10;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${d.n1} &amp; ${d.n2} — A Film</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@1,400&family=Inter:wght@300;400&display=swap"/>
<style>${SHARED_CSS}
body{background:${t.bg};font-family:'Inter',sans-serif;font-weight:300;filter:contrast(1.02)}
#prog{background:${t.c1}}
.op{background:#000;color:#fff}
.op .count{font-family:'Bebas Neue',sans-serif;font-size:12rem;color:${t.c1};animation:cnt 1.5s ease infinite}
@keyframes cnt{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.9)}}
.op .slate{position:absolute;inset:0;background:#fff;color:#000;display:none;align-items:center;justify-content:center;flex-direction:column;font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.2em}
.poster{text-align:center;background:#000;position:relative}
.poster::before{content:'';position:absolute;top:0;left:30%;width:200px;height:100vh;background:linear-gradient(30deg,rgba(212,160,80,.08),transparent 70%);pointer-events:none}
.poster .kind{font-family:'Bebas Neue',sans-serif;color:${t.c1};letter-spacing:.5em;font-size:14px;margin-bottom:1rem}
.poster h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(64px,15vw,240px);color:#fff;letter-spacing:-.01em;line-height:.9}
.poster .rule{width:80%;height:1px;background:${t.c1};margin:2rem auto}
.poster .btl{font-family:'Bebas Neue',sans-serif;letter-spacing:.4em;color:#ccc;font-size:14px}
.poster .yr{font-family:'Bebas Neue',sans-serif;color:${t.c3};margin-top:1rem;letter-spacing:.3em;font-size:13px}
.poster .cred{margin-top:3rem;font-family:'Bebas Neue',sans-serif;color:#888;letter-spacing:.4em;font-size:11px}
.cinema{background:#000;padding:0;position:relative}
.cinema::before,.cinema::after{content:'';position:absolute;left:0;right:0;height:8vh;background:#000;z-index:5}
.cinema::before{top:0}.cinema::after{bottom:0}
.cinema img{width:100%;height:84vh;object-fit:cover;filter:sepia(.2) contrast(1.1) brightness(.9) saturate(1.2)}
.cinema .cap{position:absolute;bottom:9vh;left:0;right:0;text-align:center;font-family:'Bebas Neue',sans-serif;color:${t.c1};letter-spacing:.3em;z-index:6}
.screenplay{background:#0a0a0a;padding:4rem 2rem}
.sp{max-width:640px;margin:0 auto;font-family:'Courier New',monospace;color:#e8e0d0;font-size:15px;line-height:1.8}
.sp .h{text-transform:uppercase;letter-spacing:.2em;color:${t.c1};margin:1.5rem 0 .5rem;font-size:13px}
.sp .ch{margin:1.5rem 0 .3rem;text-align:center;font-weight:700;letter-spacing:.15em}
.sp .msg{font-family:'Playfair Display',serif;font-style:italic;font-size:1.1rem;color:#f8ecd0;line-height:1.7;margin:0 3rem 1rem}
.awards{max-width:700px;margin:0 auto}
.awd{padding:1.5rem 0;border-bottom:1px solid rgba(212,160,80,.15);display:flex;align-items:center;gap:1rem;font-family:'Bebas Neue',sans-serif;letter-spacing:.15em;color:#e8e0d0;position:relative}
.awd::after{content:'';position:absolute;bottom:0;left:0;height:1px;background:${t.c1};width:0;transition:width 1s cubic-bezier(.16,1,.3,1) .3s}
.awd.in::after{width:100%}
.awd .em{font-size:1.5rem}.awd .cat{color:${t.c1};font-size:13px;min-width:200px}.awd .val{color:#fff;font-size:16px}
.climax{background:#000;text-align:center}
.climax p{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(32px,6vw,88px);color:${t.c3};text-shadow:0 0 40px rgba(212,160,80,.4);line-height:1.3;max-width:1100px;margin:0 auto;transform:scale(1);animation:zm 8s ease infinite alternate}
@keyframes zm{to{transform:scale(1.06)}}
.climax .rule{width:200px;height:1px;background:${t.c1};margin:2rem auto 0}
.credits{background:#000;overflow:hidden;height:100vh;position:relative}
.credits .roll{position:absolute;left:0;right:0;text-align:center;font-family:'Bebas Neue',sans-serif;letter-spacing:.15em;color:#fff;animation:roll 25s linear infinite;padding:0 2rem}
.credits .roll h3{font-size:2rem;margin:2rem 0}
.credits .roll .row{display:flex;justify-content:space-between;max-width:600px;margin:1rem auto;font-size:14px}
.credits .roll .row .dots{flex:1;border-bottom:1px dotted rgba(255,255,255,.3);margin:0 .5rem;transform:translateY(-4px)}
.credits .roll .end{font-family:'Bebas Neue',sans-serif;font-size:3rem;margin-top:3rem;color:${t.c3}}
@keyframes roll{from{transform:translateY(100vh)}to{transform:translateY(-200%)}}
.final-title{text-align:center;background:#000}
.final-title h2{font-family:'Bebas Neue',sans-serif;color:${t.c3};font-size:clamp(56px,12vw,180px);letter-spacing:.05em}
</style></head>
<body>
<div class="op" id="op"><div class="count" id="cnt">3</div><div class="slate" id="slate">DIRECTOR: LOVE<br/>STARRING: ${d.n1} + ${d.n2}</div><button class="skip-btn">Skip</button></div>
<div id="prog"></div><canvas id="bgfx"></canvas>${audioTag(d)}
<main>
<section class="scene poster"><div class="inner"><p class="kind">A STORY OF</p><h1>${d.n1}<br/>&amp; ${d.n2}</h1><div class="rule"></div><p class="btl">BASED ON A TRUE STORY</p><p class="yr">${d.date || "SOMEWHERE IN TIME"} · ${d.duration || "FOREVER"}</p><p class="cred">WRITTEN BY THE HEART · PRODUCED BY LOVE</p></div></section>
${
  d.photos.length
    ? d.photos
        .slice(0, 4)
        .map(
          (p, i) =>
            `<section class="scene cinema reveal"><img src="${p.dataUrl}" alt=""/><div class="cap">SCENE ${String(i + 1).padStart(2, "0")} OF ${String(d.photos.length).padStart(2, "0")}</div></section>`,
        )
        .join("")
    : ""
}
${d.msg ? `<section class="scene screenplay"><div class="sp reveal"><div class="h">INT. OUR STORY — ALWAYS</div><div class="ch">${d.n1.toUpperCase()} (V.O.)</div><p class="msg">${msgA}</p><div class="h">${d.n2.toUpperCase()} LOOKS UP. EVERYTHING CHANGES.</div>${msgB ? `<div class="ch">${d.n1.toUpperCase()} (V.O.) (CONT'D)</div><p class="msg">${msgB}</p>` : ""}<div class="h" style="text-align:center;margin-top:2rem">FADE TO BLACK.</div></div></section>` : ""}
<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'Bebas Neue',sans-serif;color:${t.c3};text-align:center;font-size:3rem;letter-spacing:.3em;margin-bottom:2.5rem">AWARDS</h2><div class="awards">
<div class="awd reveal"><span class="em">🏆</span><span class="cat">BEST MOMENT</span><span class="val">${d.memory || "The one that started it all"}</span></div>
<div class="awd reveal"><span class="em">🎬</span><span class="cat">BEST SCENE</span><span class="val">${d.date || "Every single day"}</span></div>
<div class="awd reveal"><span class="em">⭐</span><span class="cat">STANDING OVATION</span><span class="val">${d.duration || "Timeless"}</span></div>
<div class="awd reveal"><span class="em">💛</span><span class="cat">AUDIENCE AWARD</span><span class="val">${d.n2}</span></div>
</div></div></section>
${climax ? `<section class="scene climax"><div class="inner reveal"><p>"${climax}"</p><div class="rule"></div></div></section>` : ""}
${videoScene(d, "THE FEATURE PRESENTATION")}
<section class="credits"><div class="roll"><h3>LOVECRAFT AI PRESENTS</h3><h3>A FILM BY ${d.n1.toUpperCase()} AND ${d.n2.toUpperCase()}</h3><br/>
<div class="row"><span>DIRECTOR OF LOVE</span><span class="dots"></span><span>${d.n1}</span></div>
<div class="row"><span>LEADING ROLE</span><span class="dots"></span><span>${d.n2}</span></div>
<div class="row"><span>BEST SUPPORTING</span><span class="dots"></span><span>Every memory</span></div>
<div class="row"><span>SCREENPLAY</span><span class="dots"></span><span>Written from the heart</span></div>
<div class="row"><span>CINEMATOGRAPHY</span><span class="dots"></span><span>${d.photos.length} photographs</span></div>
<div class="row"><span>ORIGINAL SCORE</span><span class="dots"></span><span>${d.music ? "Our song" : "Silence between heartbeats"}</span></div>
<div class="row"><span>PRODUCED BY</span><span class="dots"></span><span>Two hearts, one story</span></div>
<br/><p style="font-size:11px;opacity:.5;letter-spacing:.3em">— No love stories were harmed in the making of this film —</p>
<div class="end">THE END</div><p style="font-size:14px;opacity:.7;margin-top:1rem">or rather...</p><div class="end">THE BEGINNING</div>
</div></section>
<section class="scene final-title"><div class="inner"><h2 class="reveal">${d.n1}<br/>&amp; ${d.n2}</h2></div></section>
</main>
<script>
${SHARED_JS}
var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H,parts=[];
function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
for(var i=0;i<60;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*.5+.3,vx:(Math.random()-.5)*.02,vy:(Math.random()-.5)*.02});
function frame(t){x.clearRect(0,0,W,H);var cx=(.45+Math.sin(t*.0001)*.05)*W,cy=0,rr=H*.4;var g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba(212,160,80,.06)');g.addColorStop(1,'rgba(212,160,80,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
parts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()});
requestAnimationFrame(frame)}requestAnimationFrame(frame);
var cnt=document.getElementById('cnt'),slate=document.getElementById('slate'),n=3;var iv=setInterval(function(){n--;if(n>0){cnt.textContent=n}else{clearInterval(iv);cnt.style.display='none';slate.style.display='flex';setTimeout(function(){slate.style.display='none'},400)}},700);
function initFinale(){}
</script></body></html>`;
}

/* ═══════════════ THEME 6 — PROPOSAL SPECIAL ═══════════════ */
function buildProposalSpecial(d: Data): string {
  const t = d.theme;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${d.n1} &amp; ${d.n2} — Forever</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap"/>
<style>${SHARED_CSS}
body{background:${t.bg};font-family:'Cormorant Garamond',serif;font-weight:400}
#prog{background:linear-gradient(90deg,${t.c1},${t.c3})}
.op{background:rgba(9,6,0,.98);color:#fff;font-family:'Great Vibes',cursive}
.op .ring{font-size:5rem;animation:hb 1.4s ease-in-out infinite;filter:drop-shadow(0 0 20px ${t.c1})}
@keyframes hb{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
.op p{font-family:'Great Vibes',cursive;font-size:clamp(28px,4vw,48px);color:${t.c3};text-align:center;opacity:0;animation:pfade 2s ease forwards}
.op .p1{animation-delay:.5s}.op .p2{animation-delay:2.5s}.op .p3{animation-delay:4.5s}
@keyframes pfade{to{opacity:1}}
.question h1{font-family:'Great Vibes',cursive;font-size:clamp(48px,9vw,140px);text-align:center;background:linear-gradient(90deg,${t.c1},#fff0c0,${t.c1});background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sh 2.5s linear infinite;line-height:1.15}
@keyframes sh{to{background-position:200% center}}
.question .diamond{font-size:4rem;text-align:center;margin:2rem 0;filter:drop-shadow(0 0 30px ${t.c1})}
.question .nms{text-align:center;font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:2rem;color:${t.c3}}
.jewels{display:flex;flex-wrap:wrap;justify-content:center;gap:2.5rem;max-width:1000px;margin:0 auto}
.jewel{text-align:center}
.jewel .fr{width:180px;height:180px;border-radius:50%;border:3px solid ${t.c1};box-shadow:0 0 0 6px rgba(201,169,110,.2),0 0 30px rgba(201,169,110,.3);overflow:hidden;transition:transform .5s,box-shadow .5s}
.jewel .fr img{width:100%;height:100%;object-fit:cover}
.jewel:hover .fr{transform:scale(1.05);box-shadow:0 0 0 8px rgba(201,169,110,.35),0 0 50px rgba(201,169,110,.6)}
.jewel figcaption{margin-top:1rem;font-family:'Great Vibes',cursive;color:${t.c3};font-size:1.5rem}
.p-letter{max-width:800px;margin:0 auto;padding:4rem 3.5rem;background:linear-gradient(135deg,rgba(201,169,110,.08),rgba(255,240,192,.04));border:1px solid rgba(212,175,55,.4);border-radius:12px;position:relative}
.p-letter::before{content:'';position:absolute;inset:-2px;background:linear-gradient(135deg,${t.c1},${t.c3},${t.c1});background-size:200% 200%;animation:bshift 6s linear infinite;border-radius:14px;z-index:-1;opacity:.4}
@keyframes bshift{to{background-position:200% 0}}
.p-letter .msg{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;line-height:2.4;color:#f8ecd0}
.p-letter .rib{display:flex;align-items:center;justify-content:center;gap:1rem;margin:2rem 0 1rem;color:${t.c1}}
.p-letter .rib::before,.p-letter .rib::after{content:'';height:1px;background:${t.c1};width:100px;opacity:.5}
.wax{width:60px;height:60px;border-radius:50%;background:radial-gradient(#a02020,#4a0000);box-shadow:0 4px 15px rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;color:${t.c3};font-size:24px;margin:1rem auto 0}
.programme{max-width:640px;margin:0 auto}
.programme h2{font-family:'Great Vibes',cursive;font-size:3rem;text-align:center;color:${t.c3};margin-bottom:2rem}
.pr-item{display:flex;align-items:center;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid rgba(201,169,110,.15)}
.pr-item .di{width:10px;height:10px;background:${t.c1};transform:rotate(45deg);flex-shrink:0}
.pr-item .t{font-family:'Cormorant Garamond',serif;font-style:italic;color:${t.c1};min-width:180px}
.pr-item .v{font-family:'Cormorant Garamond',serif;color:#f8ecd0;flex:1}
.ring-moment{text-align:center;background:#000;position:relative}
.ring-moment .r{font-size:6rem;display:inline-block;animation:drop 1.5s cubic-bezier(.36,.07,.19,.97) both;filter:drop-shadow(0 0 30px ${t.c1})}
@keyframes drop{0%{transform:translateY(-200px);opacity:0}60%{transform:translateY(10px);opacity:1}80%{transform:translateY(-5px)}100%{transform:translateY(0)}}
.ring-moment p{margin-top:2rem;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:clamp(24px,4vw,44px);color:${t.c3}}
.ring-moment .rays{position:absolute;top:50%;left:50%;width:0;height:0}
.ring-moment .rays span{position:absolute;top:-30px;left:-1px;width:2px;height:60px;background:${t.c1};opacity:0;animation:ray 1s ease .8s forwards}
.finale-p{text-align:center}
.finale-p h2{font-family:'Great Vibes',cursive;font-size:clamp(64px,12vw,180px);background:linear-gradient(90deg,${t.c1},#fff0c0,${t.c3},${t.c1});background-size:300% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sh 4s linear infinite;line-height:1.1}
.finale-p .end{margin-top:2rem;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:1.4rem;color:${t.c3}}
.finale-p .heart{margin-top:1.5rem;font-size:3rem;animation:hb 1.6s ease-in-out infinite;display:inline-block}
.conf{position:fixed;top:-20px;pointer-events:none;z-index:20}
@keyframes ray{50%{opacity:.7}100%{opacity:0;transform:scaleY(1.3)}}
</style></head>
<body>
<div class="op" id="op"><div class="ring">💍</div><p class="p1">${d.n1}…</p><p class="p2">there is something i have been meaning to ask you.</p><p class="p3">open your heart.</p><button class="skip-btn">Skip</button></div>
<div id="prog"></div><canvas id="bgfx"></canvas>${audioTag(d)}
<main>
<section class="scene question"><div class="inner"><h1>Will you spend<br/>forever with me?</h1><div class="diamond">💎</div><p class="nms">${d.n1} &amp; ${d.n2}</p></div></section>
${
  d.photos.length
    ? `<section class="scene"><div class="inner"><h2 class="reveal" style="font-family:'Great Vibes',cursive;text-align:center;font-size:3.5rem;color:${t.c3};margin-bottom:2.5rem">Every Moment</h2><div class="jewels">${d.photos
        .slice(0, 6)
        .map(
          (p, i) =>
            `<figure class="jewel reveal"><div class="fr"><img src="${p.dataUrl}" alt=""/></div><figcaption>chapter ${i + 1}</figcaption></figure>`,
        )
        .join("")}</div></div></section>`
    : ""
}
${d.msg ? `<section class="scene"><div class="inner"><div class="p-letter reveal"><div class="rib"><span>❦</span></div><p class="msg">${d.msg}</p><div class="rib"><span>❦</span></div><div class="wax">❤</div></div></div></section>` : ""}
<section class="scene"><div class="inner programme reveal"><h2>Our Story So Far</h2>
<div class="pr-item"><div class="di"></div><span class="t">First Encounter</span><span class="v">${d.date || "Once upon a time"}</span></div>
<div class="pr-item"><div class="di"></div><span class="t">A Favourite Moment</span><span class="v">${d.memory || "That one look"}</span></div>
<div class="pr-item"><div class="di"></div><span class="t">Every Moment Since</span><span class="v">${d.duration || "A lifetime shared"}</span></div>
<div class="pr-item"><div class="di"></div><span class="t">This Moment</span><span class="v">Right here, right now</span></div>
<div class="pr-item"><div class="di"></div><span class="t">Every Moment To Come</span><span class="v">Forever</span></div>
</div></section>
<section class="scene ring-moment"><div class="inner"><div class="r">💍</div><div class="rays"><span style="transform:rotate(0deg)"></span><span style="transform:rotate(45deg)"></span><span style="transform:rotate(90deg)"></span><span style="transform:rotate(135deg)"></span><span style="transform:rotate(180deg)"></span><span style="transform:rotate(225deg)"></span><span style="transform:rotate(270deg)"></span><span style="transform:rotate(315deg)"></span></div><p>From this moment, always.</p></div></section>
${videoScene(d, "Our Moment")}
<section class="scene finale-p"><div class="inner"><h2 class="reveal">${d.n1}<br/>&amp; ${d.n2}</h2><p class="end reveal">Forever starts now.</p><div class="heart reveal">❤️</div></div></section>
</main>
<script>
${SHARED_JS}
var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H,parts=[],blobs=[];
function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
var cols=['212,175,55','232,192,96','255,240,192','255,255,255'];
for(var i=0;i<180;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4,vy:-(Math.random()*.08+.03),c:cols[i%4],o:Math.random()*Math.PI*2});
blobs=[{x:.7,y:.15,r:.6,c:'212,175,55',a:.1},{x:.15,y:.75,r:.55,c:'201,169,110',a:.08},{x:.5,y:.45,r:.45,c:'255,240,192',a:.05}];
function frame(t){x.clearRect(0,0,W,H);blobs.forEach(function(b,i){var cx=(b.x+Math.sin(t*.0001+i)*.03)*W,cy=(b.y+Math.cos(t*.0001+i)*.03)*H,rr=b.r*W;var g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,'rgba('+b.c+','+b.a+')');g.addColorStop(1,'rgba('+b.c+',0)');x.fillStyle=g;x.fillRect(0,0,W,H)});
[.2,.5,.8].forEach(function(px,i){var fl=.15+Math.sin(t*.005+i)*.04;var cg=x.createRadialGradient(W*px,H*.95,0,W*px,H*.95,H*fl);cg.addColorStop(0,'rgba(220,160,60,.08)');cg.addColorStop(1,'rgba(220,160,60,0)');x.fillStyle=cg;x.fillRect(0,0,W,H)});
parts.forEach(function(p){p.y+=p.vy;if(p.y<0)p.y=H;var a=.4+Math.sin(t*.0015+p.o)*.4;x.fillStyle='rgba('+p.c+','+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()});
requestAnimationFrame(frame)}requestAnimationFrame(frame);
function initFinale(){var f=document.querySelector('.finale-p');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var cs=['#D4AF37','#c9a96e','#e8c060','#fff0c0','#f0b0c8'];for(var k=0;k<60;k++){(function(k){setTimeout(function(){var s=document.createElement('span');s.className='conf';var kind=k%3,col=cs[k%5];if(kind===0){s.style.width='3px';s.style.height='10px';s.style.background=col}else if(kind===1){s.style.width='6px';s.style.height='6px';s.style.borderRadius='50%';s.style.background=col}else{s.style.width='8px';s.style.height='8px';s.style.background=col;s.style.transform='rotate(45deg)'}s.style.left=Math.random()*100+'vw';var dur=3+Math.random()*3;s.style.animation='ct '+dur+'s linear forwards';document.body.appendChild(s);setTimeout(function(){s.remove()},dur*1000)},k*50)})(k)}}})},{threshold:.4});io.observe(f)}
var st=document.createElement('style');st.textContent='@keyframes ct{to{transform:translateY(115vh) rotate(720deg);opacity:0}}';document.head.appendChild(st);
</script></body></html>`;
}

export function buildSite(input: BuildInput): string {
  const d = prep(input);
  switch (input.themeId) {
    case "cosmic":
      return buildCosmicLove(d);
    case "memories":
      return buildForeverMemories(d);
    case "rose":
      return buildRoseGarden(d);
    case "dream":
      return buildDreamUniverse(d);
    case "cinematic":
      return buildCinematicStory(d);
    case "proposal":
      return buildProposalSpecial(d);
    default:
      return buildCosmicLove(d);
  }
}

export function buildReadme(input: BuildInput) {
  return `# ${input.name1} & ${input.name2} — A Love Story

Theme: ${THEMES[input.themeId]?.name ?? "Cosmic Love"}

Open \`index.html\` in any modern browser. Works completely offline.

Made with ✦ LoveCraft AI
`;
}

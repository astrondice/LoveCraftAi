export const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{overflow-x:hidden;background:var(--bg-color);color:var(--text-color);font-family:var(--font-body)}
h1,h2,h3,h4,h5,h6{font-family:var(--font-heading)}
canvas#bgfx{position:fixed;inset:0;z-index:0;pointer-events:none}
main{position:relative;z-index:10;opacity:0;transition:opacity 1.2s ease}
main.show{opacity:1}
#prog{position:fixed;top:0;left:0;height:2px;z-index:200;width:0;transition:width .1s;background:var(--primary-color)}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
.reveal.in{opacity:1;transform:translateY(0)}
.scene{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:5rem 1.5rem;position:relative;overflow:hidden}
.inner{max-width:960px;width:100%}
.op{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.5rem;cursor:pointer;transition:opacity 1.4s ease;padding:2rem;text-align:center;background:#000;color:var(--text-color)}
.op.out{opacity:0;pointer-events:none}
.op .skip-btn{position:absolute;bottom:2rem;font-size:11px;letter-spacing:.3em;text-transform:uppercase;opacity:.5;background:none;border:1px solid rgba(255,255,255,.2);color:inherit;padding:.6rem 1.2rem;cursor:pointer;font-family:inherit}
@media (max-width:560px){.scene{padding:4rem 1rem}}
`;

export const BASE_JS = `
var aud=document.getElementById('bg-audio');
function fadeVol(from,to,ms){if(!aud)return;var s=Date.now(),d=to-from;(function f(){var p=Math.min(1,(Date.now()-s)/ms);aud.volume=from+d*p;if(p<1)requestAnimationFrame(f)})()}
function initProg(){var b=document.getElementById('prog');window.addEventListener('scroll',function(){b.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%'},{passive:true})}
function initReveal(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('.reveal').forEach(function(el,i){setTimeout(function(){el.classList.add('in')},i*120)});io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.scene,.reveal,.tl-item,.stat,.fq,.pol').forEach(function(el){io.observe(el)})}
var revealed=false;
function dismiss(){if(revealed)return;revealed=true;var op=document.getElementById('op');op.classList.add('out');setTimeout(function(){op.style.display='none';document.querySelector('main').classList.add('show');initReveal();initProg();if(typeof initFinale==='function')initFinale();if(aud){aud.volume=0;aud.play().catch(function(){});fadeVol(0,.6,2500)}},1800)}
document.getElementById('op')?.addEventListener('click',dismiss);
var sk=document.querySelector('.skip-btn');if(sk)sk.addEventListener('click',function(e){e.stopPropagation();dismiss()});
setTimeout(dismiss,7000);
`;

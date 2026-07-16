import type { GeneratorState } from '@/types'
import { THEMES, hexToRgb } from '@/lib/themeColors'

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function splitWords(text: string, start: number, end: number): string {
  const words = text.split(/\s+/).filter(Boolean)
  return words.slice(start, end).join(' ')
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildLoveHTML(state: GeneratorState): string {
  const n1 = state.name1.trim() || 'You'
  const n2 = state.name2.trim() || 'Someone Special'
  const msg = state.loveMessage.trim() || 'Some things are simply too beautiful for words.'
  const dt = state.specialDate.trim()
  const dur = state.duration.trim()
  const mem = state.favMemory.trim()

  const T = THEMES[state.theme]
  const c1 = hexToRgb(T.c1)
  const c2 = hexToRgb(T.c2)
  const c3 = hexToRgb(T.c3)

  const words = msg.split(/\s+/).filter(Boolean)
  const total = words.length

  // Derive floating quotes from the message
  const q1 = words.slice(0, Math.min(12, Math.floor(total / 3))).join(' ') ||
    'Before you, the world was ordinary.'
  const q2 = words.slice(Math.floor(total / 2), Math.floor(total / 2) + 12).join(' ') ||
    'Some love stories keep becoming more beautiful.'
  const q3 = words.slice(Math.max(0, total - 12)).join(' ') ||
    'And still, every morning, I choose you.'

  // Word lines for "Words in the Dark" scene
  const wLines: string[] = []
  const chunkSize = Math.max(3, Math.floor(total / 5))
  for (let i = 0; i < 5; i++) {
    const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ')
    if (chunk) wLines.push(chunk)
  }
  if (wLines.length === 0) {
    wLines.push('You changed everything.', 'Without even trying.', 'Just by being you.')
  }

  const pCount = state.photos.length || '∞'

  // ── Photo cards ──────────────────────────────────────────────────────────────
  const photoCards =
    state.photos.length > 0
      ? state.photos
          .map(
            (p, i) =>
              `<div class="card" style="animation-delay:${(i * 0.1).toFixed(2)}s">` +
              `<img src="${p.dataUrl}" loading="lazy" alt="${esc(p.name)}">` +
              `<div class="card-shine"></div></div>`
          )
          .join('')
      : `<div class="card no-photo"><div style="font-size:3rem">💝</div>` +
        `<p>Memories beyond the frame</p></div>` +
        `<div class="card no-photo"><div style="font-size:3rem">🌟</div>` +
        `<p>Every moment captured</p></div>` +
        `<div class="card no-photo"><div style="font-size:3rem">✨</div>` +
        `<p>In starlight</p></div>`

  // ── Spotlight (first photo only) ──────────────────────────────────────────
  const spotlightSection =
    state.photos.length > 0
      ? `<!-- Scene 6: Parallax Photo Spotlight -->
<section class="scene" id="s-spotlight">
  <div class="inner" style="text-align:center">
    <p class="label reveal">the one that says everything</p>
    <h2 class="heading reveal d1">A Single Frame<br><em>That Holds It All</em></h2>
    <div class="spotlight-wrap reveal-scale d2">
      <div class="spotlight-glow"></div>
      <img class="spotlight-img" src="${state.photos[0].dataUrl}" alt="Our moment" id="sp-img">
    </div>
    <p class="spotlight-caption reveal d3">— ${esc(n1)} &amp; ${esc(n2)}</p>
  </div>
</section>`
      : ''

  // ── Music element ──────────────────────────────────────────────────────────
  const musicEl = state.music
    ? `<audio id="aud" src="${state.music.dataUrl}" loop preload="auto"></audio>`
    : ''

  const musicBtn = state.music
    ? `<button id="mbtn" onclick="tgl()" aria-label="Toggle music" title="Toggle music">🎵</button>`
    : ''

  // ── Video section ──────────────────────────────────────────────────────────
  const videoSection = state.video
    ? `<!-- Scene 13: Video -->
<section class="scene" id="s-vid">
  <div class="inner">
    <p class="label reveal">your story, alive</p>
    <h2 class="heading reveal d1">Moving Pictures<br><em>Moving Hearts</em></h2>
    <p class="sub reveal d2">Every frame a world. Every second a lifetime.</p>
    <video src="${state.video.dataUrl}" controls playsinline class="vid-player reveal d3"></video>
  </div>
</section>`
    : ''

  // ── Date chip ──────────────────────────────────────────────────────────────
  const dateChip =
    dt || dur
      ? `<div class="chip">${dt ? esc(dt) : ''}${dt && dur ? ' · ' : ''}${dur ? esc(dur) : ''}</div>`
      : ''

  // ── Memory quote ──────────────────────────────────────────────────────────
  const memorySection = mem
    ? `<!-- Scene 9: Memory -->
<section class="scene" id="s-memory">
  <div class="inner" style="text-align:center">
    <p class="label reveal">a moment i never want to forget</p>
    <h2 class="heading reveal d1">The Memory<br><em>That Changed Everything</em></h2>
    <div class="memory-card reveal d2">
      <div class="memory-icon">🌟</div>
      <p class="memory-text">"${esc(mem)}"</p>
      <p class="memory-label">— ${esc(n1)}</p>
    </div>
  </div>
</section>`
    : ''

  // ── Countdown section ─────────────────────────────────────────────────────
  const countdownSection = dt
    ? `<!-- Scene 10: Countdown -->
<section class="scene" id="s-countdown" data-date="${esc(dt)}">
  <div class="inner" style="text-align:center">
    <p class="label reveal">every day a gift</p>
    <h2 class="heading reveal d1">Time We've<br><em>Shared Together</em></h2>
    <div class="countdown-grid reveal d2">
      <div class="cd-unit">
        <div class="cd-num" id="cd-years">0</div>
        <div class="cd-lbl">Years</div>
      </div>
      <div class="cd-sep">·</div>
      <div class="cd-unit">
        <div class="cd-num" id="cd-months">0</div>
        <div class="cd-lbl">Months</div>
      </div>
      <div class="cd-sep">·</div>
      <div class="cd-unit">
        <div class="cd-num" id="cd-days">0</div>
        <div class="cd-lbl">Days</div>
      </div>
    </div>
    <p class="cd-phrase reveal d3">and every single one was worth it</p>
  </div>
</section>`
    : ''

  // ── Timeline items ────────────────────────────────────────────────────────
  const tlDate = dt
    ? `<div class="tl-item reveal">
      <div class="dot"></div>
      <div class="tl-when">${esc(dt)}</div>
      <div class="tl-head">${dur ? `Together for ${esc(dur)}` : 'A milestone'}</div>
      <div class="tl-body">Every year, this date grows more precious.</div>
    </div>`
    : ''

  const tlMem = mem
    ? `<div class="tl-item reveal d1">
      <div class="dot"></div>
      <div class="tl-when">A favourite memory</div>
      <div class="tl-head">"${esc(mem.slice(0, 48))}${mem.length > 48 ? '…' : ''}"</div>
      <div class="tl-body">The kind of memory that changes a person — quietly, permanently, beautifully.</div>
    </div>`
    : ''

  // ── Word lines for Scene 8 ────────────────────────────────────────────────
  const wordLinesHtml = wLines
    .map(
      (line, i) =>
        `<div class="word-line reveal" style="transition-delay:${(i * 0.2).toFixed(2)}s">${esc(line)}</div>`
    )
    .join('\n      ')

  // ══════════════════════════════════════════════════════════════════════════
  //  CSS
  // ══════════════════════════════════════════════════════════════════════════

  const CSS = `<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@200;300;400&display=swap');

:root {
  --bg:${T.bg};--c1:${T.c1};--c2:${T.c2};--c3:${T.c3};
  --c1r:${c1};--c2r:${c2};--c3r:${c3};
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-weight:300;overflow-x:hidden}

/* Canvases */
#cv{position:fixed;inset:0;z-index:0;pointer-events:none}
#pcv{position:fixed;inset:0;z-index:1;pointer-events:none}

/* Progress bar */
#bar{position:fixed;top:0;left:0;height:2px;z-index:200;width:0;background:linear-gradient(90deg,var(--c1),var(--c3));box-shadow:0 0 12px var(--c1);transition:width .1s linear}

/* Music button */
#mbtn{position:fixed;bottom:1.6rem;right:1.6rem;z-index:90;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:1.1rem;cursor:pointer;backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;transition:all .3s}
#mbtn:hover{background:rgba(${c1},.3);transform:scale(1.1)}

/* Opening curtain */
#op{position:fixed;inset:0;z-index:999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4rem;cursor:pointer;transition:opacity 2s ease}
#op.out{opacity:0;pointer-events:none}
.op-heart{font-size:4.5rem;animation:hb 2s ease-in-out infinite}
.op-text{font-family:'Cormorant Garamond',serif;font-size:clamp(1.2rem,4vw,1.9rem);font-weight:300;color:rgba(255,255,255,.7);text-align:center;padding:0 2rem;max-width:500px;line-height:1.5}
.op-hint{font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.25)}
.op-skip{position:absolute;bottom:2rem;right:2rem;font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.2);cursor:pointer;padding:.5rem 1rem;border:1px solid rgba(255,255,255,.1);border-radius:20px}
.op-skip:hover{color:rgba(255,255,255,.5);border-color:rgba(255,255,255,.3)}

/* Main */
main{opacity:0;transition:opacity 1.2s ease;pointer-events:none}
main.show{opacity:1;pointer-events:auto}

/* Scene container */
.scene{position:relative;z-index:5;min-height:100vh;display:flex;align-items:center;padding:6rem 1.5rem}
.inner{width:100%;max-width:860px;margin:0 auto}

/* Typography */
.label{font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;color:var(--c3);margin-bottom:.8rem;display:block}
.names{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,12vw,8rem);font-weight:300;line-height:.92;background:linear-gradient(135deg,#fff 0%,var(--c1) 40%,var(--c3) 70%,#fff 100%);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gshift 7s ease infinite;margin:1rem 0;display:block}
.amp{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.35em;display:block;-webkit-text-fill-color:rgba(255,255,255,.3);font-weight:300;margin:.3em 0}
.chip{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1.2rem;border:1px solid rgba(255,255,255,.15);border-radius:40px;font-size:.7rem;letter-spacing:.15em;color:rgba(255,255,255,.45);margin-top:1.2rem}
.heading{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,7vw,5rem);font-weight:300;line-height:1.05;margin-bottom:1rem;background:linear-gradient(135deg,#fff 40%,rgba(255,255,255,.5));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.heading em{font-style:italic;background:linear-gradient(135deg,var(--c1),var(--c3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:.95rem;color:rgba(255,255,255,.4);line-height:1.85;max-width:540px;margin-bottom:1.5rem}

/* Floating Quote */
.fq{position:relative;z-index:5;min-height:70vh;display:flex;align-items:center;justify-content:center;padding:4rem 2rem}
.fq-inner{text-align:center;max-width:700px}
.fq-text{font-family:'Cormorant Garamond',serif;font-size:clamp(1.6rem,5vw,3.4rem);font-weight:300;font-style:italic;line-height:1.35;color:rgba(255,255,255,.75)}
.fq-line{width:60px;height:1px;background:linear-gradient(90deg,transparent,var(--c1),transparent);margin:1.8rem auto 0}
.fq-attr{font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-top:1rem}

/* Scene 4: Aurora Interlude */
#s-aurora{text-align:center;background:radial-gradient(ellipse at center,rgba(${c1},.05) 0%,transparent 70%)}
.aurora-text{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,6vw,4.5rem);font-weight:300;font-style:italic;color:rgba(255,255,255,.6);line-height:1.4;max-width:640px;margin:0 auto}
.aurora-sub{font-size:.72rem;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-top:1.5rem}
.aurora-decor{display:flex;align-items:center;justify-content:center;gap:1.5rem;margin:2rem 0}
.aurora-line{flex:1;max-width:100px;height:1px;background:linear-gradient(90deg,transparent,rgba(${c1},.4))}
.aurora-line.rev{background:linear-gradient(90deg,rgba(${c1},.4),transparent)}
.aurora-dot{width:6px;height:6px;border-radius:50%;background:var(--c1);opacity:.5}

/* Photo Grid */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.9rem;margin-top:2rem}
.card{position:relative;border-radius:16px;overflow:hidden;aspect-ratio:3/4;opacity:0;transform:translateY(30px) scale(.96);animation:cardIn .7s cubic-bezier(.34,1.56,.64,1) forwards}
.card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.card:hover img{transform:scale(1.05)}
.card-shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1) 0%,transparent 55%);pointer-events:none}
.no-photo{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.1);aspect-ratio:3/4;color:rgba(255,255,255,.3);font-size:.78rem;text-align:center;border-radius:16px;padding:1.5rem}

/* Scene 6: Spotlight */
#s-spotlight{text-align:center}
.spotlight-wrap{position:relative;display:inline-block;margin-top:2.5rem}
.spotlight-img{width:min(420px,85vw);aspect-ratio:3/4;object-fit:cover;border-radius:24px;display:block;box-shadow:0 40px 100px rgba(0,0,0,.8);border:1px solid rgba(255,255,255,.1);transition:transform .1s linear}
.spotlight-glow{position:absolute;inset:-30px;border-radius:50px;background:radial-gradient(ellipse,rgba(${c1},.25) 0%,transparent 70%);z-index:-1;animation:auroraGlow 4s ease-in-out infinite}
.spotlight-caption{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:rgba(255,255,255,.3);margin-top:1.5rem}

/* Love Letter */
.letter{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:clamp(1.5rem,4vw,2.8rem);margin-top:1.5rem;position:relative;overflow:hidden}
.letter::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)}
.letter-text{font-family:'Cormorant Garamond',serif;font-size:clamp(1rem,2.5vw,1.22rem);font-weight:300;line-height:2;color:rgba(255,255,255,.78)}
.letter-sig{margin-top:2rem;font-size:.78rem;color:rgba(255,255,255,.28);letter-spacing:.12em;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06)}
.bq{margin-top:1.6rem;padding:1.1rem 1.5rem;border-left:2px solid var(--c1);font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;color:rgba(255,255,255,.55);line-height:1.7;border-radius:0 8px 8px 0;background:rgba(${c1},.04)}

/* Scene 8: Words in the Dark */
#s-words{text-align:center}
.word-block{max-width:700px;margin:0 auto;padding:2rem 0}
.word-intro{font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:3rem;display:block}
.word-line{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,4.5vw,3.4rem);font-weight:300;line-height:1.25;margin:1.2rem 0;opacity:0;transform:translateY(22px);transition:opacity 1.2s ease,transform 1.2s cubic-bezier(.16,1,.3,1)}
.word-line.in{opacity:1;transform:none}
.word-line:nth-child(odd){color:rgba(255,255,255,.75)}
.word-line:nth-child(even){color:var(--c1)}

/* Scene 9: Memory */
#s-memory{text-align:center}
.memory-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:clamp(2rem,5vw,3.5rem);max-width:640px;margin:2.5rem auto 0;position:relative;overflow:hidden}
.memory-card::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(${c1},.3),transparent)}
.memory-icon{font-size:2.5rem;margin-bottom:1.5rem;display:block;opacity:.8}
.memory-text{font-family:'Cormorant Garamond',serif;font-size:clamp(1.05rem,2.5vw,1.45rem);font-weight:300;font-style:italic;line-height:1.75;color:rgba(255,255,255,.75)}
.memory-label{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--c3);margin-top:1.8rem;display:block}

/* Scene 10: Countdown */
#s-countdown{text-align:center}
.countdown-grid{display:flex;justify-content:center;align-items:flex-start;gap:1.5rem;margin:3rem 0;flex-wrap:wrap}
.cd-unit{text-align:center;min-width:80px}
.cd-num{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,10vw,6rem);font-weight:300;background:linear-gradient(135deg,var(--c1),var(--c3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;animation:cdPulse 3s ease-in-out infinite}
.cd-lbl{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-top:.5rem}
.cd-sep{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,6vw,4rem);color:rgba(255,255,255,.1);line-height:1;padding-top:.8rem}
.cd-phrase{font-family:'Cormorant Garamond',serif;font-size:clamp(1rem,2.5vw,1.3rem);font-style:italic;color:rgba(255,255,255,.35);margin-top:1rem}

/* Timeline */
.tl{margin-top:2rem;position:relative;padding-left:1.8rem}
.tl::before{content:'';position:absolute;left:0;top:.5rem;bottom:.5rem;width:1px;background:linear-gradient(to bottom,transparent,var(--c1),var(--c3),transparent)}
.tl-item{position:relative;margin-bottom:2.2rem;padding-left:1.2rem}
.dot{position:absolute;left:-2.3rem;top:.28rem;width:10px;height:10px;border-radius:50%;background:var(--c1);box-shadow:0 0 14px var(--c1)}
.tl-when{font-size:.63rem;letter-spacing:.18em;text-transform:uppercase;color:var(--c3);margin-bottom:.25rem}
.tl-head{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:400;margin-bottom:.3rem}
.tl-body{font-size:.83rem;color:rgba(255,255,255,.4);line-height:1.7}

/* Stats */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:2.2rem}
.stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.4rem 1rem;text-align:center}
.stat-n{font-family:'Cormorant Garamond',serif;font-size:2.3rem;font-weight:300;background:linear-gradient(135deg,var(--c1),var(--c3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
.stat-l{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.33);margin-top:.4rem}

/* Video */
.vid-player{width:100%;border-radius:18px;max-height:58vh;object-fit:cover;box-shadow:0 20px 70px rgba(0,0,0,.7);margin-top:1.8rem;display:block}

/* Scene 14: Note to Future */
#s-future{text-align:center}
.future-poem{max-width:580px;margin:2.5rem auto 0;padding:0 1rem}
.future-line{font-family:'Cormorant Garamond',serif;font-size:clamp(1.05rem,2.8vw,1.5rem);font-weight:300;font-style:italic;line-height:1.9;color:rgba(255,255,255,.5)}
.future-line strong{font-style:normal;color:rgba(255,255,255,.82);font-weight:400}
.future-seal{font-size:2.8rem;margin-top:2.5rem;opacity:.25;display:block}
.future-date{font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-top:.8rem;display:block}

/* Finale */
#s-fin{text-align:center;overflow:hidden;position:relative}
.hearts{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.h{position:absolute;bottom:-60px;animation:hrise linear forwards;pointer-events:none;user-select:none}
.finale-names{font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,9vw,7rem);font-weight:300;line-height:.95;background:linear-gradient(135deg,#fff 0%,var(--c1) 40%,var(--c3) 70%,#fff 100%);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gshift 7s ease infinite;display:block;margin:0 auto}
.finale-amp{font-style:italic;-webkit-text-fill-color:rgba(255,255,255,.25);font-size:.28em;display:block;margin:.4em 0}
.finale-msg{font-size:clamp(.88rem,2vw,1.02rem);color:rgba(255,255,255,.38);max-width:440px;margin:1.6rem auto;line-height:1.95}
.finale-heart{font-size:3rem;margin-top:1.5rem;animation:hb 2s ease-in-out infinite;display:block}

/* Scroll reveals */
.reveal,.reveal-scale,.reveal-left{opacity:0;transition:opacity .9s ease,transform .9s cubic-bezier(.16,1,.3,1)}
.reveal{transform:translateY(28px)}
.reveal-scale{transform:scale(.93)}
.reveal-left{transform:translateX(-30px)}
.reveal.in,.reveal-scale.in,.reveal-left.in{opacity:1;transform:none}
.d1{transition-delay:.15s}.d2{transition-delay:.3s}.d3{transition-delay:.5s}

/* Keyframes */
@keyframes hb{0%,100%{transform:scale(1)}14%{transform:scale(1.2)}28%{transform:scale(1)}42%{transform:scale(1.1)}56%{transform:scale(1)}}
@keyframes cardIn{to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes hrise{0%{opacity:0;transform:translateY(0) rotate(-8deg) scale(.5)}8%{opacity:1}90%{opacity:.5}100%{opacity:0;transform:translateY(-110vh) rotate(8deg) scale(1.3)}}
@keyframes gshift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes auroraGlow{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes cdPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}

/* Mobile */
@media(max-width:640px){
  .grid{grid-template-columns:1fr 1fr}
  .names{font-size:clamp(2.5rem,14vw,4rem)}
  .stats{grid-template-columns:1fr}
  .countdown-grid{gap:1rem}
  .cd-num{font-size:clamp(2.5rem,10vw,4rem)}
}
</style>`

  // ══════════════════════════════════════════════════════════════════════════
  //  JAVASCRIPT (pure vanilla, no CDN deps, self-contained)
  // ══════════════════════════════════════════════════════════════════════════

  const JS = `<script>
// ── Canvas 1: Aurora + Star Background ────────────────────────────────────────
(function(){
  var cv=document.getElementById('cv'),ctx=cv.getContext('2d'),W,H,ps=[],t=0;
  function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;}rsz();
  window.addEventListener('resize',rsz,{passive:true});
  var orbs=[
    {xf:.7,yf:.15,xd:.08,yd:.06,r:.65,col:'${c1}',a:.09,sp:.4},
    {xf:.1,yf:.7,xd:.07,yd:.05,r:.55,col:'${c2}',a:.06,sp:.3},
    {xf:.5,yf:.45,xd:.06,yd:.07,r:.45,col:'${c3}',a:.05,sp:.25}
  ];
  var COLS=['255,255,255','${c1}','${c3}','${c2}'];
  for(var i=0;i<160;i++) ps.push({
    x:Math.random(),y:Math.random(),
    vx:(Math.random()-.5)*.00025,vy:-(Math.random()*.00035+.00008),
    r:Math.random()*1.6+.25,a:Math.random()*.6+.1,
    col:COLS[Math.floor(Math.random()*COLS.length)],tw:Math.random()*Math.PI*2
  });
  (function loop(){
    t+=.006;requestAnimationFrame(loop);
    ctx.clearRect(0,0,W,H);
    orbs.forEach(function(o){
      var ox=(o.xf+Math.sin(t*o.sp)*o.xd)*W;
      var oy=(o.yf+Math.cos(t*o.sp*.8)*o.yd)*H;
      var rr=o.r*Math.min(W,H);
      var g=ctx.createRadialGradient(ox,oy,0,ox,oy,rr);
      g.addColorStop(0,'rgba('+o.col+','+o.a+')');g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    });
    for(var i=0;i<ps.length;i++){
      var p=ps[i];p.tw+=.035;p.x+=p.vx;p.y+=p.vy;
      if(p.y*H<-8){p.y=1.01;p.x=Math.random();}
      if(p.x<-.04)p.x=1.04;if(p.x>1.04)p.x=-.04;
      var al=p.a*(0.45+0.55*Math.abs(Math.sin(p.tw)));
      ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba('+p.col+','+al+')';ctx.fill();
    }
  })();
})();

// ── Canvas 2: Floating Colour Particles ────────────────────────────────────────
(function(){
  var cv=document.getElementById('pcv'),ctx=cv.getContext('2d'),W,H;
  function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;}rsz();
  window.addEventListener('resize',rsz,{passive:true});
  var cols=['${T.c1}','${T.c3}','${T.c2}'];
  var ps=[];
  for(var i=0;i<60;i++) ps.push({
    x:Math.random(),y:Math.random(),
    vy:-(Math.random()*.003+.001),vx:(Math.random()-.5)*.001,
    s:Math.random()*2.5+.4,a:Math.random()*.4+.06,c:cols[i%3]
  });
  (function loop(){
    ctx.clearRect(0,0,W,H);
    ps.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;
      if(p.y<-.01){p.y=1.01;p.x=Math.random();}
      if(p.x<0)p.x=1;if(p.x>1)p.x=0;
      ctx.globalAlpha=p.a;ctx.beginPath();
      ctx.arc(p.x*W,p.y*H,p.s,0,6.283);ctx.fillStyle=p.c;ctx.fill();
    });
    ctx.globalAlpha=1;requestAnimationFrame(loop);
  })();
})();

// ── Opening curtain ────────────────────────────────────────────────────────────
var aud=document.getElementById('aud'),playing=false,gone=false;
function dismiss(){
  if(gone)return;gone=true;
  var op=document.getElementById('op');
  op.classList.add('out');
  setTimeout(function(){
    op.style.display='none';
    document.querySelector('main').classList.add('show');
    if(aud){aud.volume=0;aud.play().catch(function(){});fadeVol(0,.65,2800);playing=true;}
    initReveal();initHearts();initProg();initCountdown();initParallax();
  },2000);
}
document.getElementById('op').addEventListener('click',dismiss);
document.querySelector('.op-skip').addEventListener('click',function(e){e.stopPropagation();dismiss();});
setTimeout(dismiss,6500);

function fadeVol(from,to,ms){
  if(!aud)return;
  var s=Date.now(),d=to-from;
  (function f(){var p=Math.min(1,(Date.now()-s)/ms);aud.volume=from+d*p;if(p<1)requestAnimationFrame(f);})();
}

// ── IntersectionObserver scroll reveals ────────────────────────────────────────
function initReveal(){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        e.target.querySelectorAll('.reveal,.reveal-scale,.reveal-left,.word-line').forEach(function(k,i){
          setTimeout(function(){k.classList.add('in');},i*120);
        });
      }
    });
  },{threshold:0.1});
  document.querySelectorAll('.scene,.fq,.tl-item,.stat,.word-block').forEach(function(el){io.observe(el);});
}

// ── Hearts finale ──────────────────────────────────────────────────────────────
function initHearts(){
  var f=document.getElementById('hearts-field');
  if(!f)return;
  var em=['\u2764\uFE0F','\uD83D\uDC95','\u2728','\uD83D\uDCAB','\uD83C\uDF1F',
          '\uD83D\uDC96','\u2B50','\uD83C\uDF39','\uD83E\uDD0D','\uD83D\uDC9E'];
  setInterval(function(){
    var h=document.createElement('div');h.className='h';
    h.textContent=em[Math.floor(Math.random()*em.length)];
    h.style.left=Math.random()*100+'%';
    h.style.fontSize=(0.7+Math.random()*2)+'rem';
    var d=5+Math.random()*5;
    h.style.animationDuration=d+'s';
    h.style.animationDelay=(Math.random()*.8)+'s';
    f.appendChild(h);
    setTimeout(function(){if(h.parentNode)h.remove();},(d+2)*1000);
  },450);
}

// ── Scroll progress bar ────────────────────────────────────────────────────────
function initProg(){
  var b=document.getElementById('bar');
  window.addEventListener('scroll',function(){
    var pct=scrollY/(document.body.scrollHeight-innerHeight)*100;
    b.style.width=Math.min(100,pct)+'%';
  },{passive:true});
}

// ── Countdown timer ────────────────────────────────────────────────────────────
function initCountdown(){
  var el=document.getElementById('s-countdown');
  if(!el)return;
  var dateStr=el.getAttribute('data-date');
  if(!dateStr)return;
  var start=new Date(dateStr).getTime();
  if(isNaN(start))return;
  function update(){
    var now=Date.now(),diff=Math.max(0,now-start);
    var totalDays=Math.floor(diff/(1000*60*60*24));
    var yrs=Math.floor(totalDays/365.25);
    var rem=totalDays-Math.floor(yrs*365.25);
    var mos=Math.floor(rem/30.44);
    var days=Math.floor(rem-mos*30.44);
    var ye=document.getElementById('cd-years');
    var me=document.getElementById('cd-months');
    var de=document.getElementById('cd-days');
    if(ye)ye.textContent=yrs;
    if(me)me.textContent=mos;
    if(de)de.textContent=days;
  }
  update();setInterval(update,60000);
}

// ── Parallax spotlight ────────────────────────────────────────────────────────
function initParallax(){
  var sp=document.getElementById('s-spotlight');
  if(!sp)return;
  var img=document.getElementById('sp-img');
  if(!img)return;
  window.addEventListener('scroll',function(){
    var rect=sp.getBoundingClientRect();
    var progress=(innerHeight/2-rect.top-rect.height/2)/(innerHeight/2);
    img.style.transform='translateY('+(progress*20)+'px)';
  },{passive:true});
}

// ── Music toggle ────────────────────────────────────────────────────────────────
function tgl(){
  var btn=document.getElementById('mbtn');if(!aud)return;
  if(playing){
    fadeVol(aud.volume,0,600);
    setTimeout(function(){aud.pause();},650);
    if(btn)btn.textContent='\uD83D\uDD07';playing=false;
  }else{
    aud.play().catch(function(){});fadeVol(0,.65,800);
    if(btn)btn.textContent='\uD83C\uDFB5';playing=true;
  }
}
</script>`

  // ══════════════════════════════════════════════════════════════════════════
  //  ASSEMBLE HTML
  // ══════════════════════════════════════════════════════════════════════════

  const lines: string[] = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1.0">',
    `<meta name="description" content="A cinematic love experience crafted for ${esc(n1)} &amp; ${esc(n2)}.">`,
    `<title>${esc(n1)} ❤️ ${esc(n2)}</title>`,
    CSS,
    '</head>',
    '<body>',

    musicEl,
    musicBtn,
    '<div id="bar"></div>',
    '<canvas id="cv"></canvas>',
    '<canvas id="pcv"></canvas>',

    // ── Scene 1: Opening Curtain ──────────────────────────────────────────
    `<!-- Scene 1: Opening Curtain -->
<div id="op">
  <div class="op-heart">💗</div>
  <p class="op-text">Someone wants to tell you something beautiful…</p>
  <p class="op-hint">Tap anywhere to begin</p>
  <div class="op-skip">skip →</div>
</div>`,

    '<main>',

    // ── Scene 2: Hero Names ────────────────────────────────────────────────
    `<!-- Scene 2: Hero Names -->
<section class="scene" id="s-hero">
  <div class="inner" style="text-align:center">
    <p class="label reveal">${esc(T.name)}</p>
    <span class="names reveal-scale d1">${esc(n1)}<span class="amp">forever &amp;</span>${esc(n2)}</span>
    ${dateChip}
  </div>
</section>`,

    // ── Scene 3: Floating Quote 1 ──────────────────────────────────────────
    `<!-- Scene 3: Floating Quote 1 -->
<div class="fq" id="fq1">
  <div class="fq-inner">
    <div class="fq-text reveal">&ldquo;${esc(q1)}&rdquo;</div>
    <div class="fq-line reveal d2"></div>
    <div class="fq-attr reveal d3">— ${esc(n1)}</div>
  </div>
</div>`,

    // ── Scene 4: Aurora Interlude [NEW] ────────────────────────────────────
    `<!-- Scene 4: Aurora Interlude -->
<section class="scene" id="s-aurora">
  <div class="inner" style="text-align:center">
    <p class="aurora-text reveal">In the space between breaths,<br>in the silence between heartbeats,<br>something changed.<br><em>Everything</em> changed.</p>
    <div class="aurora-decor reveal d2">
      <div class="aurora-line"></div>
      <div class="aurora-dot"></div>
      <div class="aurora-line rev"></div>
    </div>
    <p class="aurora-sub reveal d3">a love written in light</p>
  </div>
</section>`,

    // ── Scene 5: Photo Gallery ─────────────────────────────────────────────
    `<!-- Scene 5: Photo Gallery -->
<section class="scene" id="s-photos">
  <div class="inner">
    <p class="label reveal">our memories</p>
    <h2 class="heading reveal d1">Every Moment,<br><em>Captured in Starlight</em></h2>
    <p class="sub reveal d2">These are the frames that live beyond time — the small hours and grand gestures that make up a love story.</p>
    <div class="grid">${photoCards}</div>
  </div>
</section>`,

    // ── Scene 6: Parallax Spotlight [NEW, conditional] ─────────────────────
    spotlightSection,

    // ── Scene 7: Love Letter ────────────────────────────────────────────────
    `<!-- Scene 7: Love Letter -->
<section class="scene" id="s-letter">
  <div class="inner">
    <p class="label reveal">from the heart</p>
    <h2 class="heading reveal d1">Words That Couldn&rsquo;t<br><em>Wait Any Longer</em></h2>
    <div class="letter reveal d2">
      <p class="letter-text">${esc(msg).replace(/\n/g, '<br>')}</p>
      <p class="letter-sig">— ${esc(n1)}, always</p>
    </div>
  </div>
</section>`,

    // ── Scene 8: Words in the Dark [NEW] ──────────────────────────────────
    `<!-- Scene 8: Words in the Dark -->
<section class="scene" id="s-words">
  <div class="inner">
    <div class="word-block">
      <span class="word-intro">and this is what I never said out loud</span>
      ${wordLinesHtml}
    </div>
  </div>
</section>`,

    // ── Scene 9: Memory [NEW scene, conditional] ───────────────────────────
    memorySection,

    // ── Scene 10: Countdown [NEW, conditional] ─────────────────────────────
    countdownSection,

    // ── Scene 11: Timeline ─────────────────────────────────────────────────
    `<!-- Scene 11: Timeline -->
<section class="scene" id="s-tl">
  <div class="inner">
    <p class="label reveal">the journey</p>
    <h2 class="heading reveal d1">How It All<br><em>Began &amp; Became</em></h2>
    <p class="sub reveal d2">Every great love story is a series of moments that could have gone differently — but didn&rsquo;t.</p>
    <div class="tl">
      <div class="tl-item reveal">
        <div class="dot"></div>
        <div class="tl-when">The Beginning</div>
        <div class="tl-head">The moment it changed</div>
        <div class="tl-body">Before this, the world was ordinary. Then came ${esc(n2)}.</div>
      </div>
      ${tlDate}
      ${tlMem}
      <div class="tl-item reveal d2">
        <div class="dot"></div>
        <div class="tl-when">Right now</div>
        <div class="tl-head">And still becoming</div>
        <div class="tl-body">This story has no ending. Only more chapters, more mornings, more of each other.</div>
      </div>
    </div>
    <div class="stats">
      <div class="stat reveal"><div class="stat-n">${String(pCount)}</div><div class="stat-l">Memories Shared</div></div>
      <div class="stat reveal d1"><div class="stat-n">&infin;</div><div class="stat-l">Days Together</div></div>
      <div class="stat reveal d2"><div class="stat-n">1</div><div class="stat-l">Love Story</div></div>
    </div>
  </div>
</section>`,

    // ── Scene 12: Floating Quote 2 ─────────────────────────────────────────
    `<!-- Scene 12: Floating Quote 2 -->
<div class="fq" id="fq2">
  <div class="fq-inner">
    <div class="fq-text reveal">&ldquo;${esc(q2)}&rdquo;</div>
    <div class="fq-line reveal d2"></div>
    <div class="fq-attr reveal d3">— ${esc(n2)}, probably</div>
  </div>
</div>`,

    // ── Scene 13: Video [conditional] ─────────────────────────────────────
    videoSection,

    // ── Scene 14: Note to the Future [NEW] ─────────────────────────────────
    `<!-- Scene 14: Note to the Future -->
<section class="scene" id="s-future">
  <div class="inner">
    <p class="label reveal">a note to the future</p>
    <h2 class="heading reveal d1">To Whoever<br><em>We Become</em></h2>
    <div class="future-poem reveal d2">
      <p class="future-line">Years from now, when the world has changed us in ways we can't yet imagine,</p>
      <p class="future-line"><strong>I hope you still reach for my hand.</strong></p>
      <p class="future-line">I hope we still laugh at things nobody else finds funny,</p>
      <p class="future-line"><strong>still choose each other, every single morning.</strong></p>
      <p class="future-line">This moment — right now, with ${esc(n1)} &amp; ${esc(n2)} —</p>
      <p class="future-line"><strong>is one I want to remember forever.</strong></p>
      <p class="future-line">&ldquo;${esc(q3)}&rdquo;</p>
    </div>
    <span class="future-seal">💌</span>
    ${dt ? `<span class="future-date">written on ${esc(dt)}</span>` : ''}
  </div>
</section>`,

    // ── Scene 15: Finale ────────────────────────────────────────────────────
    `<!-- Scene 15: Finale with Hearts Rain -->
<section class="scene" id="s-fin">
  <div class="hearts" id="hearts-field"></div>
  <div class="inner" style="position:relative;z-index:5">
    <p class="label reveal">always &amp; forever</p>
    <span class="finale-names reveal-scale d1">${esc(n1)}<span class="finale-amp">and</span>${esc(n2)}</span>
    <p class="finale-msg reveal d2">Some love stories don&rsquo;t have endings. They just keep becoming more beautiful — one day, one look, one heartbeat at a time.</p>
    <span class="finale-heart reveal d3">❤️</span>
  </div>
</section>`,

    '</main>',
    JS,
    '</body>',
    '</html>',
  ]

  return lines.filter(Boolean).join('\n')
}

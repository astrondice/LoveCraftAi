import { WebsiteBlueprint } from "../../types/blueprint";
import { BASE_CSS, BASE_JS } from "./core/base";
import { renderHero, renderStory, renderGallery, renderTimeline, renderVideo } from "./modules";

function injectStyles(blueprint: WebsiteBlueprint): string {
  const p = blueprint.colorPalette;
  const t = blueprint.typography;

  return `
    <style>
      :root {
        --bg-color: ${p.background};
        --text-color: ${p.text};
        --primary-color: ${p.primary};
        --secondary-color: ${p.secondary};
        --accent-color: ${p.accent};
        --font-heading: ${t.heading};
        --font-body: ${t.body};
        --font-accent: ${t.accent || t.heading};
      }
      ${BASE_CSS}
      /* Additional dynamic animation styles based on blueprint.animations */
    </style>
  `;
}

function injectFonts(blueprint: WebsiteBlueprint): string {
  // Extract font names to build Google Fonts URL
  const extractName = (fontStr: string) => {
    const match = fontStr.match(/'([^']+)'/);
    return match ? match[1].replace(/ /g, "+") : "";
  };

  const h = extractName(blueprint.typography.heading);
  const b = extractName(blueprint.typography.body);
  const a = blueprint.typography.accent ? extractName(blueprint.typography.accent) : "";

  const fonts = [h, b, a].filter(Boolean);
  const uniqueFonts = Array.from(new Set(fonts));

  if (uniqueFonts.length === 0) return "";

  const query = uniqueFonts
    .map((f) => `family=${f}:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700`)
    .join("&");
  return `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${query}&display=swap" />
  `;
}

export function renderBlueprint(blueprint: WebsiteBlueprint): string {
  const seo = blueprint.seo;
  const audioTag = blueprint.music
    ? `<audio id="bg-audio" src="${blueprint.music.url}" loop preload="auto"></audio>`
    : "";

  const sections = [];
  sections.push(renderHero(blueprint.hero));
  if (blueprint.story) sections.push(renderStory(blueprint.story));
  if (blueprint.gallery) sections.push(renderGallery(blueprint.gallery));
  if (blueprint.timeline) sections.push(renderTimeline(blueprint.timeline));
  if (blueprint.videoSection) sections.push(renderVideo(blueprint.videoSection));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}" />
  <meta name="keywords" content="${seo.keywords.join(", ")}" />
  
  <meta property="og:title" content="${seo.title}" />
  <meta property="og:description" content="${seo.description}" />
  ${seo.openGraph.siteName ? `<meta property="og:site_name" content="${seo.openGraph.siteName}" />` : ""}
  ${seo.openGraph.image ? `<meta property="og:image" content="${seo.openGraph.image}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />

  ${injectFonts(blueprint)}
  ${injectStyles(blueprint)}
</head>
<body>
  <!-- Cinematic Loader -->
  <div class="op" id="op">
    <h1 style="font-family:var(--font-heading);font-size:clamp(32px, 6vw, 64px);margin-bottom:1rem;color:var(--primary-color)">
      ${blueprint.hero.title}
    </h1>
    <p style="font-size:14px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.8">${blueprint.hero.subtitle || "Timeless"}</p>
    <button class="skip-btn">Skip</button>
  </div>

  <div id="prog"></div>
  <canvas id="bgfx"></canvas>
  ${audioTag}

  <main>
    ${sections.join("\\n")}
    <section class="scene" style="min-height:40vh;text-align:center;">
      <div class="inner reveal">
        <h2 style="font-family:var(--font-heading);font-size:clamp(48px, 8vw, 100px);color:var(--primary-color)">${blueprint.hero.title}</h2>
        <p style="font-family:var(--font-accent);font-style:italic;margin-top:1rem;opacity:0.7">${blueprint.footer.text}</p>
      </div>
    </section>
  </main>

  <script>
    ${BASE_JS}
    
    // Default abstract background effect (can be abstracted into animation engine later)
    var c=document.getElementById('bgfx'),x=c.getContext('2d'),W,H;
    function R(){W=c.width=innerWidth;H=c.height=innerHeight}R();addEventListener('resize',R);
    var parts=[];
    for(var i=0;i<100;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.5,vy:-(Math.random()*0.1+0.05)});
    function frame(t){
      x.clearRect(0,0,W,H);
      parts.forEach(function(p){
        p.y+=p.vy;if(p.y<0)p.y=H;
        x.fillStyle='rgba(255,255,255,'+(0.1 + Math.random()*0.1)+')';
        x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  </script>
</body>
</html>`;
}

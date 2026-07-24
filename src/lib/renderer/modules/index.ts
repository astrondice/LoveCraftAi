import { WebsiteBlueprint } from "../../../types/blueprint";

export function renderHero(hero: WebsiteBlueprint["hero"]): string {
  if (!hero) return "";

  return `
    <section class="scene hero" style="${hero.backgroundMedia ? `background: url(${hero.backgroundMedia.url}) center/cover no-repeat;` : ""}">
      ${hero.backgroundMedia ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);z-index:1"></div>' : ""}
      <div class="inner" style="position:relative;z-index:2;text-align:center;">
        <h1 style="font-size:clamp(48px,10vw,140px);margin-bottom:1rem;color:var(--text-color);line-height:1.1;">
          ${hero.title}
        </h1>
        ${hero.subtitle ? `<p style="font-size:14px;letter-spacing:0.4em;text-transform:uppercase;color:var(--primary-color);margin-bottom:1rem">${hero.subtitle}</p>` : ""}
        ${hero.tagline ? `<p style="font-family:var(--font-accent);font-style:italic;font-size:1.2rem;opacity:0.8">${hero.tagline}</p>` : ""}
      </div>
    </section>
  `;
}

export function renderStory(story: WebsiteBlueprint["story"]): string {
  if (!story) return "";

  const paragraphs = story.paragraphs
    .map(
      (p) =>
        `<p class="reveal" style="font-size:1.2rem;line-height:2;margin-bottom:1.5rem;font-family:var(--font-body);">${p}</p>`,
    )
    .join("");

  return `
    <section class="scene">
      <div class="inner" style="max-width:800px;margin:0 auto;text-align:center;">
        ${story.heading ? `<h2 class="reveal" style="font-size:2.5rem;margin-bottom:3rem;color:var(--primary-color)">${story.heading}</h2>` : ""}
        <div class="story-content">
          ${paragraphs}
        </div>
        ${
          story.pullQuote
            ? `
          <blockquote class="reveal" style="margin-top:4rem;font-size:2rem;font-style:italic;font-family:var(--font-accent);color:var(--primary-color);border-left:3px solid var(--primary-color);padding-left:2rem;text-align:left;">
            "${story.pullQuote}"
          </blockquote>
        `
            : ""
        }
      </div>
    </section>
  `;
}

export function renderGallery(gallery: WebsiteBlueprint["gallery"]): string {
  if (!gallery || gallery.media.length === 0) return "";

  let galleryHtml = "";

  if (gallery.layout === "polaroid") {
    const items = gallery.media
      .map(
        (m, i) => `
      <figure class="pol reveal" style="transform:rotate(${(i % 5) - 2}deg);background:#fff;padding:12px 12px 40px;box-shadow:3px 3px 20px rgba(0,0,0,0.3);display:inline-block;margin:1rem;">
        <img src="${m.url}" alt="${m.alt || ""}" style="width:260px;height:300px;object-fit:cover;display:block;" />
      </figure>
    `,
      )
      .join("");
    galleryHtml = `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2rem;">${items}</div>`;
  } else if (gallery.layout === "grid") {
    const items = gallery.media
      .map(
        (m, i) => `
      <figure class="reveal" style="overflow:hidden;border-radius:8px;aspect-ratio:1;">
        <img src="${m.url}" alt="${m.alt || ""}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"/>
      </figure>
    `,
      )
      .join("");
    galleryHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:1rem;">${items}</div>`;
  } else {
    // masonry fallback for 10+
    const items = gallery.media
      .map(
        (m, i) => `
      <figure class="reveal" style="margin-bottom:1rem;break-inside:avoid;overflow:hidden;border-radius:8px;">
        <img src="${m.url}" alt="${m.alt || ""}" style="width:100%;height:auto;object-fit:cover;display:block;"/>
      </figure>
    `,
      )
      .join("");
    galleryHtml = `<div style="column-count:3;column-gap:1rem;width:100%;">${items}</div>
      <style>@media (max-width:768px) { div[style*="column-count:3"] { column-count: 2 !important; } } @media (max-width:480px) { div[style*="column-count:3"] { column-count: 1 !important; } }</style>
    `;
  }

  return `
    <section class="scene">
      <div class="inner">
        ${gallery.heading ? `<h2 class="reveal" style="text-align:center;font-size:2.5rem;margin-bottom:3rem;color:var(--primary-color)">${gallery.heading}</h2>` : ""}
        ${galleryHtml}
      </div>
    </section>
  `;
}

export function renderTimeline(timeline: WebsiteBlueprint["timeline"]): string {
  if (!timeline || timeline.events.length === 0) return "";

  const eventsHtml = timeline.events
    .map(
      (e, i) => `
    <div class="tl-item reveal" style="margin-bottom:2.5rem;position:relative;">
      <time style="font-family:var(--font-body);font-size:12px;letter-spacing:0.2em;color:var(--primary-color);display:block;margin-bottom:0.5rem;">${e.date}</time>
      <h4 style="font-family:var(--font-heading);font-size:24px;margin-bottom:0.5rem;color:var(--text-color);">${e.title}</h4>
      <p style="opacity:0.8;font-size:1rem;line-height:1.6;">${e.description}</p>
    </div>
  `,
    )
    .join("");

  return `
    <section class="scene">
      <div class="inner">
        ${timeline.heading ? `<h2 class="reveal" style="text-align:center;font-size:2.5rem;margin-bottom:3rem;color:var(--primary-color)">${timeline.heading}</h2>` : ""}
        <div class="tl" style="max-width:720px;margin:0 auto;position:relative;padding-left:32px;border-left:1px solid var(--primary-color);">
          <style>
            .tl-item::before { content:''; position:absolute; left:-38px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--primary-color); box-shadow:0 0 10px var(--primary-color); }
          </style>
          ${eventsHtml}
        </div>
      </div>
    </section>
  `;
}

export function renderVideo(videoSection: WebsiteBlueprint["videoSection"]): string {
  if (!videoSection) return "";

  return `
    <section class="scene">
      <div class="inner">
        ${videoSection.heading ? `<h2 class="scene-title reveal" style="text-align:center;font-size:2.5rem;margin-bottom:2rem;color:var(--primary-color)">${videoSection.heading}</h2>` : ""}
        <video controls playsinline src="${videoSection.media.url}" class="reveal" style="width:100%;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,0.7)"></video>
      </div>
    </section>
  `;
}

import { GenerationInput, IWebsiteGenerator } from "./generator.interface";
import {
  WebsiteBlueprint,
  WebsiteType,
  ColorPalette,
  TypographyPairing,
  AnimationStyle,
  MediaAsset,
} from "../../types/blueprint";
import { THEMES } from "../../lib/themes";

const defaultPalette: ColorPalette = {
  background: "#0a0a0a",
  text: "#faf9f6",
  primary: "#c9a96e",
  secondary: "#1a1a1a",
  accent: "#e8c060",
};

const defaultTypography: TypographyPairing = {
  heading: "'Cormorant Garamond', serif",
  body: "'Space Mono', monospace",
  accent: "'Playfair Display', serif",
};

export class RuleBasedGenerator implements IWebsiteGenerator {
  async generate(input: GenerationInput): Promise<WebsiteBlueprint> {
    // Artificial delay to simulate processing and allow for cinematic loading
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const photoCount = input.photos.length;
    const storyLength = input.message ? input.message.split(/\s+/).length : 0;

    // Determine layout based on photos
    let layout: WebsiteBlueprint["layout"] = "standard";
    let galleryLayout: "grid" | "masonry" | "carousel" | "polaroid" = "polaroid";

    if (photoCount === 0) {
      layout = "minimal";
    } else if (photoCount >= 1 && photoCount <= 3) {
      layout = "minimal";
      galleryLayout = "polaroid";
    } else if (photoCount >= 4 && photoCount <= 9) {
      layout = "standard";
      galleryLayout = "grid";
    } else if (photoCount >= 10) {
      layout = "magazine";
      galleryLayout = "masonry";
    }

    if (storyLength > 50 && photoCount > 5) {
      layout = "cinematic";
    }

    // Parse assets
    const media: MediaAsset[] = input.photos.map((p, i) => ({
      url: p.dataUrl,
      alt: `Memory ${i + 1}`,
      type: "image",
    }));

    const backgroundMedia = media.length > 0 ? media[0] : undefined;

    // Timeline events
    const timelineEvents = [];
    if (input.date) {
      timelineEvents.push({
        date: input.date,
        title: "The Beginning",
        description: "Where it all started.",
      });
    }
    if (input.duration) {
      timelineEvents.push({
        date: "Through the years",
        title: input.duration,
        description: "Growing together every day.",
      });
    }
    if (input.memory) {
      timelineEvents.push({
        date: "A special moment",
        title: "Unforgettable",
        description: input.memory,
      });
    }
    timelineEvents.push({
      date: "Forever",
      title: "The Future",
      description: "Still writing our story.",
    });

    // Theme inference (fallback to love-story)
    const websiteType: WebsiteType = "love-story";

    const title = `${input.name1 || "You"} & ${input.name2 || "Them"}`;

    const selectedTheme = THEMES[input.themeId] ?? THEMES.cosmic;
    const themePalette: ColorPalette = {
      background: selectedTheme.bg,
      text: "#faf9f6",
      primary: selectedTheme.c1,
      secondary: selectedTheme.c2,
      accent: selectedTheme.c3,
    };

    return {
      version: "1.0.0",
      websiteType,
      theme: input.themeId,
      mood: "romantic",
      colorPalette: themePalette,
      typography: defaultTypography,
      animations: "cinematic",
      layout,
      seo: {
        title: `${title} — Our Story`,
        description: input.message
          ? input.message.substring(0, 150) + "..."
          : "A beautiful journey together.",
        keywords: ["love", "story", input.name1, input.name2],
        openGraph: {
          siteName: "LoveCraft AI",
          image: backgroundMedia?.url,
        },
      },
      hero: {
        title,
        subtitle: input.date || "Timeless",
        tagline: input.duration,
        backgroundMedia,
      },
      story: input.message
        ? {
            heading: "Our Chapter",
            paragraphs: input.message.split("\\n").filter((p) => p.trim() !== ""),
            pullQuote: input.memory || undefined,
          }
        : undefined,
      timeline:
        timelineEvents.length > 0
          ? {
              heading: "Our Journey",
              events: timelineEvents,
            }
          : undefined,
      gallery:
        media.length > 0
          ? {
              heading: "Moments",
              layout: galleryLayout,
              media: media.slice(0, 12), // Limit for layout
            }
          : undefined,
      videoSection: input.video
        ? {
            heading: "Moving Memories",
            media: { url: input.video.dataUrl, type: "video" },
          }
        : undefined,
      music: input.music
        ? {
            url: input.music.dataUrl,
            autoplay: true,
          }
        : undefined,
      footer: {
        text: `Made with Love`,
      },
    };
  }
}

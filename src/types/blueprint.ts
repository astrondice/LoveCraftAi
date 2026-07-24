export type WebsiteType =
  | "wedding"
  | "travel"
  | "birthday"
  | "anniversary"
  | "farewell"
  | "portfolio"
  | "family"
  | "memorial"
  | "graduation"
  | "friendship"
  | "love-story";

export type AnimationStyle = "apple" | "framer" | "linear" | "arc" | "cinematic";

export type TypographyPairing = {
  heading: string;
  body: string;
  accent?: string;
};

export type ColorPalette = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
};

export type MediaAsset = {
  url: string;
  alt?: string;
  type?: "image" | "video";
};

export interface WebsiteBlueprint {
  version: "1.0.0";
  websiteType: WebsiteType;
  theme: string;
  mood: string;
  colorPalette: ColorPalette;
  typography: TypographyPairing;
  animations: AnimationStyle;
  layout: "minimal" | "magazine" | "cinematic" | "standard";

  seo: {
    title: string;
    description: string;
    keywords: string[];
    openGraph: {
      image?: string;
      siteName?: string;
    };
  };

  hero: {
    title: string;
    subtitle?: string;
    tagline?: string;
    backgroundMedia?: MediaAsset;
  };

  story?: {
    heading: string;
    paragraphs: string[];
    pullQuote?: string;
  };

  timeline?: {
    heading: string;
    events: {
      date: string;
      title: string;
      description: string;
    }[];
  };

  gallery?: {
    heading: string;
    layout: "grid" | "masonry" | "carousel" | "polaroid";
    media: MediaAsset[];
  };

  videoSection?: {
    heading: string;
    media: MediaAsset;
  };

  music?: {
    url: string;
    title?: string;
    autoplay: boolean;
  };

  footer: {
    text: string;
    callToAction?: string;
  };
}

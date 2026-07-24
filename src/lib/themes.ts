export type Theme = {
  id: string;
  name: string;
  vibe: string;
  atmosphere: string;
  bg: string;
  c1: string;
  c2: string;
  c3: string;
  gradient: string;
};

export const THEMES: Record<string, Theme> = {
  cosmic: {
    id: "cosmic",
    name: "Cosmic Love",
    vibe: "Deep Obsidian & Starlight",
    atmosphere:
      "A surreal blend of starlight and intimate warmth. Deep burgundy shadows punctuated by champagne gold highlights.",
    bg: "#03020f",
    c1: "#c060a0",
    c2: "#7030d0",
    c3: "#c9a96e",
    gradient: "linear-gradient(135deg, #03020f, #1a0535)",
  },
  memories: {
    id: "memories",
    name: "Forever Memories",
    vibe: "Classic Editorial Elegance",
    atmosphere: "Warm amber tones, like candlelight through old photographs.",
    bg: "#0e0505",
    c1: "#d08040",
    c2: "#a02020",
    c3: "#c9a96e",
    gradient: "linear-gradient(135deg, #0e0505, #2a1005)",
  },
  rose: {
    id: "rose",
    name: "Rose Garden",
    vibe: "Muted Burgundy & Vintage",
    atmosphere: "Velvet petals and vintage romance. The colour of love letters.",
    bg: "#0d0009",
    c1: "#e8507a",
    c2: "#a01850",
    c3: "#f0b0c8",
    gradient: "linear-gradient(135deg, #160010, #3d0020)",
  },
  dream: {
    id: "dream",
    name: "Dream Universe",
    vibe: "Ethereal Pastels & Haze",
    atmosphere: "Surreal and electric. Like a dream you never want to leave.",
    bg: "#020210",
    c1: "#5090e8",
    c2: "#5020c0",
    c3: "#80d0ff",
    gradient: "linear-gradient(135deg, #020210, #0a1030)",
  },
  cinematic: {
    id: "cinematic",
    name: "Cinematic Story",
    vibe: "Film Noir & High Contrast",
    atmosphere: "Shot like a classic film. Every frame worthy of a cinema screen.",
    bg: "#050505",
    c1: "#d0a050",
    c2: "#805020",
    c3: "#f0d090",
    gradient: "linear-gradient(135deg, #050505, #1a1208)",
  },
  proposal: {
    id: "proposal",
    name: "Proposal Special",
    vibe: "Intimate & Luxurious",
    atmosphere: "Champagne, candlelight, and forever. The most important moment.",
    bg: "#090600",
    c1: "#c9a96e",
    c2: "#e8c060",
    c3: "#fff0c0",
    gradient: "linear-gradient(135deg, #090600, #2d1500)",
  },
  moonlight: {
    id: "moonlight",
    name: "Moonlight Promise",
    vibe: "Midnight Sapphire & Silver Glow",
    atmosphere: "A quiet midnight under glowing constellations and silver moonlight.",
    bg: "#020914",
    c1: "#38bdf8",
    c2: "#1e3a8a",
    c3: "#e0f2fe",
    gradient: "linear-gradient(135deg, #020914, #0f172a)",
  },
  golden: {
    id: "golden",
    name: "Golden Vows",
    vibe: "Gilded Ivory & Regal Serif",
    atmosphere: "Opulent gold foil accents and timeless royal wedding elegance.",
    bg: "#0c0a06",
    c1: "#f59e0b",
    c2: "#78350f",
    c3: "#fef3c7",
    gradient: "linear-gradient(135deg, #0c0a06, #271a0c)",
  },
  sakura: {
    id: "sakura",
    name: "Sakura Bloom",
    vibe: "Soft Cherry Blossom & Pearl",
    atmosphere: "Gentle pink petals floating through spring breezes and warm sunlight.",
    bg: "#120509",
    c1: "#f472b6",
    c2: "#9d174d",
    c3: "#fce7f3",
    gradient: "linear-gradient(135deg, #120509, #2c0b16)",
  },
  eternal: {
    id: "eternal",
    name: "Eternal Hearts",
    vibe: "Deep Crimson & Radiant Ruby",
    atmosphere: "Passionate crimson waves and glowing heartbeats that last forever.",
    bg: "#100204",
    c1: "#ef4444",
    c2: "#7f1d1d",
    c3: "#fee2e2",
    gradient: "linear-gradient(135deg, #100204, #2b060d)",
  },
};

export const THEME_LIST = Object.values(THEMES);

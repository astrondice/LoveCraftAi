// ─────────────────────────────────────────────────────────────────
// Categories Data Layer — Reusable Category Registry
// ─────────────────────────────────────────────────────────────────
import type { CategorySpec } from "@/types/category.types";

export const CATEGORIES_DATA: Record<string, CategorySpec> = {
  all: {
    id: "all",
    slug: "all",
    name: "All Templates",
    emoji: "✨",
    description: "Browse every handcrafted website experience across all categories.",
    sortOrder: 0,
    heroTitle: "Explore Endless Possibilities",
    heroDescription:
      "Choose from our complete marketplace of handcrafted digital experiences designed for every emotional milestone and professional display.",
    accentGradient: "from-amber-400 via-rose-500 to-purple-600",
    popularTags: ["Popular", "New", "Featured", "AI Ready"],
  },
  love: {
    id: "love",
    slug: "love",
    name: "Love",
    emoji: "❤️",
    description: "Cinematic digital love stories, proposals, anniversaries & romance memory boxes.",
    badge: "Core",
    featured: true,
    sortOrder: 1,
    heroTitle: "Cinematic Love & Romance Stories",
    heroDescription:
      "Weave photos, music, and emotional letters into a private, timeless digital love website.",
    accentGradient: "from-rose-500 via-pink-500 to-amber-400",
    popularTags: ["Starlight FX", "Obsidian Dark", "Rose Petals", "Love Letters", "Proposal"],
  },
  "raksha-bandhan": {
    id: "raksha-bandhan",
    slug: "raksha-bandhan",
    name: "Raksha Bandhan",
    emoji: "🎀",
    description: "Celebrate the purest brother-sister bond through unforgettable digital experiences.",
    badge: "New Collection",
    featured: true,
    sortOrder: 2,
    heroTitle: "Raksha Bandhan Collection",
    heroDescription:
      "Celebrate the purest brother–sister bond through unforgettable digital memory websites, childhood throwback galleries, and heartfelt promises.",
    accentGradient: "from-amber-400 via-orange-500 to-red-600",
    popularTags: ["Brother Sister", "Rakhi Memories", "Childhood Memories", "Miles Apart", "Promises"],
  },
  birthday: {
    id: "birthday",
    slug: "birthday",
    name: "Birthday",
    emoji: "🎂",
    description: "Joyful birthday celebration portals, video surprise hubs & milestone timeline sites.",
    badge: "Popular",
    featured: true,
    sortOrder: 3,
    heroTitle: "Birthday Celebration Experiences",
    heroDescription:
      "Create unforgettable digital birthday surprises packed with photo galleries, video messages, and custom countdowns.",
    accentGradient: "from-purple-500 via-indigo-500 to-sky-400",
    popularTags: ["Confetti FX", "Golden Jubilees", "Video Surprise", "Milestones"],
  },
  wedding: {
    id: "wedding",
    slug: "wedding",
    name: "Wedding",
    emoji: "💍",
    description: "Regal wedding websites, RSVP management, itinerary timelines & gilded vow displays.",
    featured: true,
    sortOrder: 4,
    heroTitle: "Regal & Classic Wedding Sites",
    heroDescription:
      "Share your special day with guests through luxurious invitation cards, venue maps, RSVP forms, and romantic love timelines.",
    accentGradient: "from-yellow-400 via-amber-500 to-yellow-600",
    popularTags: ["Regal Gold", "RSVP Form", "Itinerary Timeline", "Gilded Foil"],
  },
  business: {
    id: "business",
    slug: "business",
    name: "Business",
    emoji: "🏢",
    description: "Modern enterprise landing pages, agency showcases & high-converting service portals.",
    sortOrder: 5,
    heroTitle: "High-Converting Business Sites",
    heroDescription:
      "Elevate your brand with sleek corporate websites, team showcases, customer testimonials, and instant contact forms.",
    accentGradient: "from-blue-500 via-indigo-600 to-slate-700",
    popularTags: ["Corporate Elegance", "Agency Showcase", "Lead Gen", "Modern Glass"],
  },
  portfolio: {
    id: "portfolio",
    slug: "portfolio",
    name: "Portfolio",
    emoji: "💼",
    description: "Stunning personal portfolios for designers, creators, photographers & developers.",
    featured: true,
    sortOrder: 6,
    heroTitle: "Creative & Professional Portfolios",
    heroDescription:
      "Display your finest work with dynamic masonry galleries, dark mode aesthetic, interactive case studies, and seamless contact integration.",
    accentGradient: "from-emerald-400 via-teal-500 to-cyan-600",
    popularTags: ["Masonry Grid", "Case Studies", "Creative Dark", "Minimalist"],
  },
  startup: {
    id: "startup",
    slug: "startup",
    name: "Startup",
    emoji: "🚀",
    description: "High-impact tech startup landing pages, waitlist builders & product launch sites.",
    badge: "Hot",
    sortOrder: 7,
    heroTitle: "Tech & Product Launch Landing Pages",
    heroDescription:
      "Launch your app or software product with animated hero graphics, feature breakdowns, pricing cards, and waitlist collection.",
    accentGradient: "from-indigo-500 via-purple-500 to-pink-500",
    popularTags: ["Product Launch", "Waitlist", "Pricing Cards", "Feature Mesh"],
  },
  resume: {
    id: "resume",
    slug: "resume",
    name: "Resume",
    emoji: "📄",
    description: "Interactive digital CVs, bio link portals & executive career summary pages.",
    sortOrder: 8,
    heroTitle: "Interactive Digital Resumes",
    heroDescription:
      "Stand out to recruiters and clients with interactive career timelines, skill radars, project links, and downloadable CVs.",
    accentGradient: "from-sky-400 via-blue-500 to-indigo-600",
    popularTags: ["Interactive CV", "Skill Radar", "Career Timeline", "Bio Link"],
  },
  saas: {
    id: "saas",
    slug: "saas",
    name: "SaaS",
    emoji: "⚡",
    description: "Ultra-fast software platforms, feature matrix grids & subscription tier pages.",
    sortOrder: 9,
    heroTitle: "SaaS Product & Platform Showcases",
    heroDescription:
      "Convert visitors into trial subscribers with high-converting SaaS landing templates, interactive feature tables, and user reviews.",
    accentGradient: "from-cyan-400 via-teal-500 to-emerald-600",
    popularTags: ["Feature Matrix", "Subscription Tiers", "App Demo", "Dark Mode UI"],
  },
  restaurant: {
    id: "restaurant",
    slug: "restaurant",
    name: "Restaurant",
    emoji: "🍽️",
    description: "Mouth-watering digital menus, table reservation forms & culinary experience sites.",
    sortOrder: 10,
    heroTitle: "Culinary & Dining Website Experiences",
    heroDescription:
      "Present dish menus with vivid imagery, online reservation forms, chef highlights, and location details.",
    accentGradient: "from-orange-400 via-red-500 to-rose-600",
    popularTags: ["Digital Menu", "Table Booking", "Culinary Gallery", "Location Map"],
  },
  education: {
    id: "education",
    slug: "education",
    name: "Education",
    emoji: "🎓",
    description: "Course landing pages, online academy portals & workshop registration sites.",
    sortOrder: 11,
    heroTitle: "Learning & Academy Websites",
    heroDescription:
      "Promote courses, workshops, and educational programs with structured curriculum cards, instructor bios, and enrollment forms.",
    accentGradient: "from-violet-400 via-purple-600 to-indigo-700",
    popularTags: ["Course Catalog", "Curriculum Grid", "Student Reviews", "Enrollment"],
  },
  festival: {
    id: "festival",
    slug: "festival",
    name: "Festival",
    emoji: "🪔",
    description: "Vibrant festive greeting pages, holiday countdowns & celebration hubs.",
    sortOrder: 12,
    heroTitle: "Festive & Cultural Celebration Portals",
    heroDescription:
      "Celebrate Diwali, New Year, Christmas, and global festivals with glowing greeting cards, music, and personalized wishes.",
    accentGradient: "from-yellow-400 via-orange-500 to-pink-600",
    popularTags: ["Diwali Glow", "Holiday Greeting", "Custom Wish", "Music Player"],
  },
};

export const CATEGORY_LIST: CategorySpec[] = Object.values(CATEGORIES_DATA).sort(
  (a, b) => a.sortOrder - b.sortOrder
);

export function getCategoryBySlug(slug: string): CategorySpec {
  return CATEGORIES_DATA[slug] || CATEGORIES_DATA["all"];
}

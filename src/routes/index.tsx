import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BackgroundFX } from "@/components/animations/BackgroundFX";
import { LoadingScreen } from "@/components/animations/LoadingScreen";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Logo } from "@/components/ui/Logo";
import { Play, Sparkles, Heart, Feather, Wand2, Plus, Minus, Globe } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "LoveCraft AI — Create The Most Beautiful Gift They'll Ever Receive",
      },
      {
        name: "description",
        content:
          "Transform your photos, music and memories into a cinematic love website. Download instantly. Free forever.",
      },
      { property: "og:title", content: "LoveCraft AI — Cinematic Love Websites" },
      {
        property: "og:description",
        content:
          "Weave photos, music, and words into a private cinematic love website. Download & share instantly.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ScrollReveal via IntersectionObserver
    const els = document.querySelectorAll(".reveal-el");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen">
      <LoadingScreen />
      <BackgroundFX />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 backdrop-blur-xl bg-charcoal/30 border-b border-ivory/10">
        <Link to="/" className="flex items-center">
          <Logo className="h-8 md:h-10" />
        </Link>
        <div className="hidden md:flex items-center gap-10 text-ivory/60">
          <a href="#story" className="label-caps hover:text-ivory transition-colors">
            Story
          </a>
          <a href="#story" className="label-caps hover:text-ivory transition-colors">
            Memories
          </a>
          <a href="#story" className="label-caps hover:text-ivory transition-colors">
            Universe
          </a>
          <span className="label-caps text-gold">Moment</span>
          <Link
            to="/dashboard"
            className="label-caps hover:text-ivory transition-colors flex items-center gap-1.5"
          >
            <Globe size={12} className="text-gold" /> My Sites
          </Link>
        </div>
        <Link to="/generate">
          <MagneticButton variant="primary" className="hidden md:inline-flex">
            Start Creating
          </MagneticButton>
        </Link>
      </nav>

      {/* Hero */}
      <section
        id="hero"
        className="relative z-10 min-h-screen flex items-center px-6 md:px-16 pt-32 pb-20"
      >
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full border border-ivory/30 bg-charcoal/40 backdrop-blur-md label-caps text-ivory/80 mb-8"
            >
              ✦ Cinematic Digital Experiences
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="font-display text-[52px] md:text-[84px] leading-[1.05] text-ivory tracking-tight"
            >
              Turn Your Photos Into
              <br />
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="italic font-light gold-shimmer"
              >
                Cinematic Stories
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-8 max-w-lg text-ivory/80 text-lg md:text-xl leading-relaxed font-light"
            >
              LoveCraft AI instantly transforms your memories into stunning, beautiful websites. The
              perfect way to celebrate a wedding, anniversary, or unforgettable journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-6"
            >
              <Link to="/generate">
                <MagneticButton variant="primary" className="px-8 py-4 text-lg">
                  Create Website Free
                </MagneticButton>
              </Link>
              <a
                href="#how"
                className="group flex items-center gap-3 text-ivory/80 hover:text-ivory transition-colors"
              >
                <span className="w-12 h-12 rounded-full border border-ivory/30 group-hover:border-ivory grid place-items-center transition-colors">
                  <Play size={16} className="translate-x-[1px]" />
                </span>
                <span className="label-caps text-sm">Watch Demo</span>
              </a>
            </motion.div>

            {/* Premium Trust Section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-12 pt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ivory/10"
            >
              <div className="flex items-center gap-2 text-ivory/60 text-xs tracking-wider uppercase">
                <Sparkles size={14} className="text-gold" />
                <span>AI Generated</span>
              </div>
              <div className="flex items-center gap-2 text-ivory/60 text-xs tracking-wider uppercase">
                <Globe size={14} className="text-gold" />
                <span>Instant Publish</span>
              </div>
              <div className="flex items-center gap-2 text-ivory/60 text-xs tracking-wider uppercase">
                <Heart size={14} className="text-gold" />
                <span>Lifetime Link</span>
              </div>
            </motion.div>
          </div>

          {/* Realistic Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="relative w-full aspect-[9/16] md:aspect-[4/5] max-h-[700px] glass-panel rounded-[2rem] overflow-hidden shadow-2xl mx-auto md:ml-auto md:mr-0 border border-ivory/10"
          >
            {/* Fake Browser/Device Header */}
            <div className="absolute top-0 inset-x-0 h-12 bg-charcoal/80 backdrop-blur-xl border-b border-ivory/10 flex items-center justify-between px-6 z-20">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-ivory/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-ivory/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-ivory/20" />
              </div>
              <div className="text-[10px] label-caps text-ivory/40">lovecraft.ai/u/aarav-meera</div>
              <div className="w-8" />
            </div>

            {/* Generated Website Content Mockup */}
            <div className="absolute inset-0 pt-12 overflow-hidden bg-[#1a1a1a]">
              {/* Hero Image */}
              <div className="relative h-[50%] w-full">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop"
                  alt="Wedding memory"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                {/* Title overlay */}
                <div className="absolute bottom-6 inset-x-0 text-center">
                  <h2 className="font-display text-4xl text-ivory tracking-wider mb-2">
                    Aarav & Meera
                  </h2>
                  <p className="text-gold text-xs tracking-[0.2em] uppercase">
                    Two Souls, One Journey
                  </p>
                </div>
              </div>

              {/* Fake Content Timeline */}
              <div className="px-6 py-8 space-y-8">
                <div className="space-y-3">
                  <div className="w-16 h-px bg-gold/50 mx-auto" />
                  <p className="text-center text-ivory/70 text-sm font-light italic leading-relaxed">
                    "From our first coffee in Mumbai to saying 'I do' under the stars in Tuscany."
                  </p>
                </div>

                {/* Fake Gallery */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square rounded-lg overflow-hidden border border-ivory/10">
                    <img
                      src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden border border-ivory/10">
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Mini Music Player UI */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel border border-ivory/10 flex items-center gap-4 backdrop-blur-md bg-charcoal/60 z-30 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 border-y-[6px] border-y-transparent border-l-[8px] border-l-gold translate-x-0.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-medium text-ivory truncate">
                    Perfect - Ed Sheeran
                  </div>
                  <div className="text-[10px] text-ivory/60 truncate mt-0.5">
                    Playing from memory
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-gold/60 rounded-full animate-pulse" />
                  <div
                    className="w-1 h-4 bg-gold/80 rounded-full animate-pulse"
                    style={{ animationDelay: "75ms" }}
                  />
                  <div
                    className="w-1 h-2 bg-gold/40 rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory/40">
          <span className="label-caps text-[10px]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-ivory/40 to-transparent" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 md:px-16 py-32 max-w-7xl mx-auto">
        <div className="reveal-el text-center mb-20">
          <span className="label-caps text-gold">The Process</span>
          <h2 className="font-display text-4xl md:text-6xl text-ivory mt-4">
            Three acts. One <span className="italic gold-shimmer">forever</span>.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: "01",
              icon: <Feather className="text-gold" />,
              t: "Weave Your Narrative",
              d: "Upload photos, music, and write the message that only they will understand.",
            },
            {
              n: "02",
              icon: <Sparkles className="text-gold" />,
              t: "Select Your Universe",
              d: "Choose from six cinematic themes — from cosmic obsidian to intimate proposal.",
            },
            {
              n: "03",
              icon: <Heart className="text-gold" />,
              t: "Unveil the Experience",
              d: "Download your complete website or publish it live instantly. Share a permanent link — watch them fall.",
            },
          ].map((s, i) => (
            <div
              key={s.n}
              className="reveal-el glass-panel rounded-2xl p-8"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-6xl text-ivory/10">{s.n}</span>
                <span className="w-12 h-12 rounded-full grid place-items-center bg-ivory/5 border border-ivory/10">
                  {s.icon}
                </span>
              </div>
              <h3 className="font-display text-2xl text-ivory mb-3">{s.t}</h3>
              <p className="text-ivory leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section id="cta" className="relative z-10 px-6 md:px-16 py-32 text-center">
        <div className="reveal-el max-w-3xl mx-auto">
          <Wand2 className="text-gold mx-auto mb-6" size={40} />
          <h2 className="font-display text-4xl md:text-6xl text-ivory">
            Your love story is <span className="italic gold-shimmer">waiting</span>.
          </h2>
          <p className="mt-6 text-ivory text-lg">
            Ten minutes of your time. A memory that outlives everything else.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/generate">
              <MagneticButton variant="gold">Begin the Journey ✦</MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Example testimonials / social proof */}
      <section id="stories" className="relative z-10 px-6 md:px-16 py-32 max-w-7xl mx-auto">
        <div className="reveal-el text-center mb-16">
          <span className="label-caps text-gold">Made With Love</span>
          <h2 className="font-display text-4xl md:text-6xl text-ivory mt-4">
            Stories from <span className="italic gold-shimmer">creators</span> worldwide
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              names: "Aarav & Meera",
              theme: "Cosmic Love",
              quote:
                "She cried the moment the curtain lifted. It felt like a scene from a film we made together.",
              color: "#d4af37",
            },
            {
              names: "Léa & Julien",
              theme: "Rose Garden",
              quote: "Ten years of memories, one page. He couldn't stop scrolling.",
              color: "#f8b6b2",
            },
            {
              names: "Kai & Noa",
              theme: "Proposal Special",
              quote: "I proposed with this. She said yes before she reached the finale.",
              color: "#a67b7b",
            },
          ].map((t, i) => (
            <div
              key={t.names}
              className="reveal-el rounded-2xl p-[1px] relative"
              style={{
                transitionDelay: `${i * 120}ms`,
                background: `linear-gradient(135deg, ${t.color}55 0%, rgba(255,255,255,0.06) 50%, ${t.color}22 100%)`,
              }}
            >
              <div
                className="rounded-2xl p-8 h-full flex flex-col justify-between"
                style={{ background: "rgba(20,18,16,0.85)", backdropFilter: "blur(20px)" }}
              >
                {/* Large decorative quote mark */}
                <div
                  className="font-display text-[5rem] leading-none mb-2 select-none"
                  style={{ color: t.color, opacity: 0.35 }}
                >
                  "
                </div>
                <p className="font-display italic text-ivory text-xl leading-relaxed -mt-6 flex-1">
                  {t.quote}
                </p>
                <div
                  className="mt-8 pt-6 border-t flex items-center justify-between"
                  style={{ borderColor: `${t.color}30` }}
                >
                  <div>
                    <span className="text-ivory font-semibold text-base block">{t.names}</span>
                    <span className="label-caps text-ivory/85 text-[9px] mt-0.5 block">
                      Verified Story
                    </span>
                  </div>
                  <span
                    className="label-caps text-[10px] px-3 py-1.5 rounded-full font-bold"
                    style={{
                      color: t.color,
                      background: `${t.color}18`,
                      border: `1px solid ${t.color}35`,
                    }}
                  >
                    {t.theme}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-6 md:px-16 py-32 max-w-4xl mx-auto">
        <div className="reveal-el text-center mb-14">
          <span className="label-caps text-gold">Questions</span>
          <h2 className="font-display text-4xl md:text-6xl text-ivory mt-4">
            The <span className="italic gold-shimmer">details</span>.
          </h2>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Is my data safe?",
              a: "Everything stays on your device. Photos, music, and messages are never uploaded to any server — the entire website is built in your browser.",
            },
            {
              q: "Can I edit the website after download?",
              a: "Yes. It's a standard HTML file you can open in any browser and edit in any code editor.",
            },
            {
              q: "Does it work on mobile?",
              a: "Yes — the generated website is fully responsive and works beautifully on every device.",
            },
            {
              q: "How do I share it with them?",
              a: "Send the downloaded file over WhatsApp, iMessage, email, or AirDrop. They tap the file and the experience begins.",
            },
          ].map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 px-6 md:px-16 py-32 text-center">
        <div className="reveal-el max-w-3xl mx-auto">
          <Wand2 className="text-gold mx-auto mb-6" size={40} />
          <h2 className="font-display text-4xl md:text-6xl text-ivory">
            Your love story is <span className="italic gold-shimmer">waiting</span>.
          </h2>
          <p className="mt-6 text-ivory text-lg">
            Ten minutes of your time. A memory that outlives everything else.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/generate">
              <MagneticButton variant="gold">Begin the Journey ✦</MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-ivory/10 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-display text-2xl text-ivory">
            LoveCraft<span className="text-gold">AI</span>
          </div>
          <nav className="flex items-center gap-8 label-caps text-ivory/60 text-[11px]">
            <a href="#how" className="hover:text-ivory transition-colors">
              How
            </a>
            <Link to="/generate" className="hover:text-ivory transition-colors">
              Create
            </Link>
            <a href="#faq" className="hover:text-ivory transition-colors">
              FAQ
            </a>
          </nav>
          <p className="text-ivory/40 text-xs">Made with ♡ for every love story · © 2025</p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="reveal-el glass-panel rounded-2xl overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
      >
        <span className="font-display text-ivory text-lg md:text-xl">{q}</span>
        <span className="w-8 h-8 rounded-full grid place-items-center border border-ivory/20 text-gold shrink-0">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-ivory leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

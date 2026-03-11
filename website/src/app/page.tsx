"use client";

import { useEffect, useState } from "react";

const features = [
  {
    title: "One-Shortcut Capture",
    description:
      "Press Cmd+Shift+S to capture anything on screen. No fiddling with apps, just capture and keep moving.",
    tint: "bg-[#8e51ff]/15 text-[#c2a1ff]",
    symbol: "C",
  },
  {
    title: "AI Fact Extraction",
    description:
      "Our AI reads your screenshot and extracts dates, times, locations, names, and key context instantly.",
    tint: "bg-[#fe9a00]/15 text-[#ffd089]",
    symbol: "A",
  },
  {
    title: "Telegram Q&A Recall",
    description:
      'Ask natural questions like "When is my flight?" and get quick, sourced answers in Telegram.',
    tint: "bg-[#2aabee]/15 text-[#8ad8ff]",
    symbol: "T",
  },
  {
    title: "Private & Local-First",
    description:
      "Facts are extracted on-device first. Your data stays yours and is never sold or shared.",
    tint: "bg-[#00bc7d]/15 text-[#82f2cb]",
    symbol: "P",
  },
];

const steps = [
  {
    id: "01",
    title: "Capture",
    description:
      "See something important? Hit your shortcut and SnapRecall captures your screen instantly.",
  },
  {
    id: "02",
    title: "Extract",
    description:
      "AI scans the image and structures key facts: dates, times, places, names, and codes.",
  },
  {
    id: "03",
    title: "Recall",
    description:
      "Ask in natural language and retrieve the exact detail you need in seconds.",
  },
];

const useCases = [
  {
    name: "Students",
    badge: "When is CS201 final exam?",
    detail: "CS201 Final - March 15, 2:00 PM | Room 304",
    tint: "bg-[#4f8fff]/15 text-[#9ec0ff]",
    symbol: "S",
  },
  {
    name: "Travelers",
    badge: "What gate is my flight?",
    detail: "SQ302 to Tokyo | Gate B7 | Boarding 8:40 PM",
    tint: "bg-[#f6b93b]/15 text-[#ffe39e]",
    symbol: "T",
  },
  {
    name: "Professionals",
    badge: "When is next investor call?",
    detail: "Q2 Investor Call | Mar 20 | 4:30 PM",
    tint: "bg-[#a684ff]/15 text-[#d4c3ff]",
    symbol: "P",
  },
];

const stats = [
  { value: "< 2s", label: "Avg extraction time" },
  { value: "98%", label: "Field recognition accuracy" },
  { value: "50+", label: "Languages supported" },
  { value: "0", label: "Manual tagging required" },
];

const faqs = [
  {
    question: "Is SnapRecall free?",
    answer:
      "Yes. A free tier is available, and early waitlist users receive launch perks including extended Pro access.",
  },
  {
    question: "Do I need Telegram to use SnapRecall?",
    answer:
      "Telegram is optional. You can still capture and organize facts locally, then enable Telegram recall anytime.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Processing is local-first, and your extracted facts remain tied to your account. We do not sell your data.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "The waitlist launch targets macOS and Windows first. Linux support is planned after initial release.",
  },
  {
    question: "What if I need to cancel?",
    answer:
      "You can unsubscribe from waitlist and product updates at any time with one click.",
  },
];

const audiences = ["Students", "Travelers", "Professionals", "Remote Teams"];
const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];
const delays = ["delay-1", "delay-2", "delay-3", "delay-4"];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#7f22fe_0%,#615fff_100%)] text-xs font-semibold text-white shadow-[0_8px_24px_-10px_rgba(127,34,254,0.95)]">
        S
      </div>
      <span className="text-sm tracking-[0.01em] text-white/95">SnapRecall</span>
    </div>
  );
}

function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="w-full">
      <form
        className={`flex w-full flex-col gap-3 sm:flex-row ${compact ? "" : "max-w-[448px]"}`}
        action="#"
        method="post"
        onSubmit={handleSubmit}
      >
        <label className="group flex h-11 flex-1 items-center rounded-[14px] border border-white/10 bg-white/5 px-4 text-sm text-white/65 transition duration-300 focus-within:border-[#a684ff]/60 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(127,34,254,0.18)]">
          <span className="mr-2 text-white/45 transition group-focus-within:text-[#a684ff]">@</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            aria-label="Email"
          />
        </label>
        <button
          type="submit"
          className="h-11 w-full shrink-0 rounded-[12px] bg-[linear-gradient(135deg,#7f22fe_0%,#6f58ff_100%)] px-5 text-sm font-medium text-white shadow-[0_14px_30px_-16px_rgba(127,34,254,0.85)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(127,34,254,0.95)] active:translate-y-0 sm:w-auto"
        >
          Join Waitlist
        </button>
      </form>
      <p
        className={`mt-3 text-xs text-[#a684ff] transition duration-300 ${
          submitted ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        Thanks, you&apos;re on the waitlist.
      </p>
    </div>
  );
}

function useRevealAnimations() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);

  useRevealAnimations();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a12] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-orb absolute left-1/2 top-[-290px] h-[840px] w-[1080px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#3b1f79_0%,#141225_44%,#0a0a12_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(10,10,18,0.45)_35%,#0a0a12_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(127,34,254,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(127,34,254,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[rgba(10,10,18,0.72)] backdrop-blur-xl">
        <nav className="mx-auto flex h-14 w-full max-w-[1152px] items-center justify-between px-4 sm:h-16 sm:px-6">
          <Logo />
          <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative py-1 transition duration-300 [transition-timing-function:var(--ease-standard)] hover:text-white/95 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#a684ff] after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <button type="button" className="px-2 text-sm text-white/45 transition duration-300 hover:text-white/85">
              Open App
            </button>
            <a
              href="#waitlist"
              className="rounded-[10px] bg-[#7f22fe] px-4 py-2 text-sm text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#9249ff]"
            >
              Join Waitlist
            </a>
          </div>
        </nav>
      </header>

      <main className="relative">
        <section className="section-block-tight mx-auto grid w-full max-w-[1152px] gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:items-start">
          <div data-reveal className="reveal delay-1">
            <p className="kicker mb-4 inline-flex rounded-full border border-[#7f22fe]/30 bg-[#7f22fe]/10 px-3 py-1 text-[#a684ff] sm:mb-6">
              Capture. Extract. Recall.
            </p>
            <h1 className="hero-heading max-w-[560px] text-white">
              Capture your screen.
              <br />
              <span className="text-[#a684ff]">Recall anything.</span>
            </h1>
            <p className="lead-text mt-5 max-w-[560px] sm:mt-6">
              One shortcut captures your screen. AI extracts key facts instantly and you can ask for anything later.
              No folders, no tags, no manual entry.
            </p>
            <div className="mt-6 sm:mt-8">
              <WaitlistForm />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs tracking-[0.01em] text-white/23 sm:mt-5 sm:gap-x-6">
              <span>Free tier available</span>
              <span>macOS &amp; Windows</span>
              <span>No credit card</span>
            </div>
          </div>

          <div data-reveal className="reveal delay-2 relative mt-1">
            <div className="pointer-events-none absolute -inset-6 rounded-[26px] bg-[#7f22fe]/20 blur-3xl" />
            <div className="surface-card motion-card relative rounded-2xl bg-[#0f0f14] shadow-[0_22px_55px_-16px_rgba(0,0,0,0.8)] hover:-translate-y-1 hover:shadow-[0_30px_70px_-20px_rgba(127,34,254,0.7)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[11px] tracking-wide text-white/25">SnapRecall</span>
              </div>
              <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                <div className="rounded-[10px] border border-[#8e51ff]/35 bg-[#1a1a24] p-4">
                  <p className="text-[10px] text-white/40">University Portal</p>
                  <p className="mt-2 text-sm text-white">CS201 - Data Structures Final Exam</p>
                  <p className="mt-2 text-xs text-white/50">Date: March 15, 2026 | Time: 2:00 PM</p>
                  <p className="mt-1 text-xs text-white/50">Location: Room 304, Engineering Building</p>
                </div>
                <p className="text-center text-xs text-[#a684ff]">Extracting facts...</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#0d0d16]/80">
          <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-4 px-4 py-7 sm:gap-6 sm:px-6 sm:py-10">
            <p className="kicker text-white/18">Built for the way you work</p>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/30 sm:gap-7">
              {audiences.map((audience, index) => (
                <span key={audience} data-reveal className={`reveal inline-flex items-center gap-2 ${delays[index % 4]}`}>
                  <span className="size-1.5 rounded-full bg-white/20" />
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section-block mx-auto w-full max-w-[1152px] px-4 sm:px-6">
          <p data-reveal className="kicker reveal delay-1 text-center text-[#a684ff]">
            Features
          </p>
          <h2 data-reveal className="section-heading reveal delay-2 mt-3 text-center text-white sm:mt-4">
            Everything happens automatically
          </h2>
          <p data-reveal className="lead-text reveal delay-3 mx-auto mt-4 max-w-[580px] text-center sm:mt-5">
            No tagging, no organizing, no manual input. Capture once and let AI take care of the rest.
          </p>
          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                data-reveal
                className={`surface-card motion-card reveal ${delays[index % 4]} rounded-2xl p-5 hover:-translate-y-1.5 hover:bg-white/[0.04] sm:p-7`}
              >
                <span className={`mb-5 inline-flex size-10 items-center justify-center rounded-[14px] text-sm ${feature.tint}`}>
                  {feature.symbol}
                </span>
                <h3 className="text-base font-medium text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/32">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section-block bg-white/[0.01]">
          <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-6">
            <p data-reveal className="kicker reveal delay-1 text-center text-[#a684ff]">
              How It Works
            </p>
            <h2 data-reveal className="section-heading reveal delay-2 mt-3 text-center text-white sm:mt-4">
              Three steps. Zero effort.
            </h2>
            <p data-reveal className="lead-text reveal delay-3 mt-4 text-center sm:mt-5">
              From screenshot to searchable knowledge in seconds.
            </p>
            <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.id}
                  data-reveal
                  className={`surface-card motion-card reveal ${delays[index % 4]} rounded-2xl p-5 hover:border-white/15 sm:p-7`}
                >
                  <p className="text-3xl text-[#7f22fe]/45">{step.id}</p>
                  <h3 className="mt-3 text-lg font-medium text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/32">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="section-block mx-auto w-full max-w-[1152px] px-4 sm:px-6">
          <p data-reveal className="kicker reveal delay-1 text-center text-[#a684ff]">
            Use Cases
          </p>
          <h2 data-reveal className="section-heading reveal delay-2 mt-3 text-center text-white sm:mt-4">
            Built for your life, not just your work
          </h2>
          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
            {useCases.map((item, index) => (
              <article
                key={item.name}
                data-reveal
                className={`surface-card motion-card reveal ${delays[index % 4]} rounded-2xl p-5 hover:-translate-y-1 sm:p-6`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex size-7 items-center justify-center rounded-full text-[10px] ${item.tint}`}>
                    {item.symbol}
                  </span>
                  <span className="rounded-full bg-[#7f22fe] px-3 py-1 text-[11px] text-white">{item.badge}</span>
                </div>
                <h3 className="mt-6 text-sm font-medium text-white/95">{item.name}</h3>
                <p className="mt-2 text-xs leading-6 text-white/35">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-9 grid gap-3 border-y border-white/6 py-6 text-center sm:mt-12 sm:gap-4 sm:py-7 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} data-reveal className={`reveal ${delays[index % 4]}`}>
                <p className="text-xl text-white">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.08em] text-white/28">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="section-block">
          <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6">
            <p data-reveal className="kicker reveal delay-1 text-center text-[#a684ff]">
              FAQ
            </p>
            <h2 data-reveal className="section-heading reveal delay-2 mt-3 text-center text-white sm:mt-4">
              Frequently asked questions
            </h2>
            <div className="mt-7 space-y-2 rounded-2xl border border-white/6 bg-white/[0.01] p-1 sm:mt-9 sm:p-2" data-reveal>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <article
                    key={faq.question}
                    className={`motion-card rounded-xl border ${
                      isOpen ? "border-[#a684ff]/35 bg-white/[0.03]" : "border-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left sm:py-4"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      <span className="text-sm tracking-[0.01em] text-white/85">{faq.question}</span>
                      <span
                        className={`motion-card flex size-6 items-center justify-center rounded-full border border-white/10 text-xs text-white/60 ${
                          isOpen ? "rotate-45 border-[#a684ff]/45 text-[#a684ff]" : "rotate-0"
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div className={`motion-card grid ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden px-4">
                        <p
                        className={`motion-card pb-3 text-sm leading-7 text-white/35 sm:pb-4 ${
                          isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                        }`}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="waitlist" className="section-block-tight">
          <div className="relative mx-auto w-full max-w-[576px] px-4 text-center sm:px-6" data-reveal>
            <div className="pointer-events-none absolute left-1/2 top-[34%] h-[300px] w-[560px] -translate-x-1/2 rounded-full bg-[#7f22fe]/10 blur-[100px]" />
            <div className="reveal delay-2 relative">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7f22fe_0%,#615fff_100%)] text-sm font-semibold text-white">
                S
              </div>
              <h2 className="section-heading mt-5 text-white sm:mt-7">Ready to never forget again?</h2>
              <p className="lead-text mx-auto mt-4 max-w-[520px] sm:mt-5">
                Join the waitlist to be first in line for launch access. Early members get lifetime Pro pricing.
              </p>
              <div className="mt-6 sm:mt-8">
                <WaitlistForm compact />
              </div>
              <p className="mt-4 text-xs text-white/20">No spam, ever. Unsubscribe anytime.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/6">
        <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-4 px-4 py-7 text-xs text-white/22 sm:gap-6 sm:px-6 sm:py-9 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>© 2026 SnapRecall. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="transition hover:text-white/65" href="#">
              Terms
            </a>
            <a className="transition hover:text-white/65" href="#">
              Privacy
            </a>
            <a className="transition hover:text-white/65" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
      "Ask natural questions like \"When is my flight?\" and get quick, sourced answers in Telegram.",
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
    detail: "CS201 Final — March 15, 2:00 PM · Room 304",
    tint: "bg-[#4f8fff]/15 text-[#9ec0ff]",
    symbol: "S",
  },
  {
    name: "Travelers",
    badge: "What gate is my flight?",
    detail: "SQ302 to Tokyo · Gate B7 · Boarding 8:40 PM",
    tint: "bg-[#f6b93b]/15 text-[#ffe39e]",
    symbol: "T",
  },
  {
    name: "Professionals",
    badge: "When is next investor call?",
    detail: "Q2 Investor Call · Mar 20 · 4:30 PM",
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

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#7f22fe_0%,#615fff_100%)] text-xs font-semibold text-white">
        S
      </div>
      <span className="text-sm text-white/95">SnapRecall</span>
    </div>
  );
}

function WaitlistForm({ compact = false }: { compact?: boolean }) {
  return (
    <form
      className={`flex w-full flex-col gap-3 sm:flex-row ${compact ? "" : "max-w-[448px]"}`}
      action="#"
      method="post"
    >
      <label className="flex h-11 flex-1 items-center rounded-[14px] border border-white/10 bg-white/5 px-4 text-sm text-white/65">
        <span className="mr-2 text-white/45">@</span>
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          aria-label="Email"
        />
      </label>
      <button
        type="submit"
        className="h-11 w-full shrink-0 rounded-[12px] bg-[#7f22fe] px-5 text-sm font-medium text-white transition hover:bg-[#9249ff] sm:w-auto"
      >
        Join Waitlist
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a12] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-280px] h-[780px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#3b1f79_0%,#141225_44%,#0a0a12_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(10,10,18,0.45)_35%,#0a0a12_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(127,34,254,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(127,34,254,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />
      </div>

      <header className="relative border-b border-white/5 bg-[rgba(10,10,18,0.8)]">
        <nav className="mx-auto flex h-16 w-full max-w-[1152px] items-center justify-between px-6">
          <Logo />
          <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <a href="#features" className="transition hover:text-white/90">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-white/90">
              How It Works
            </a>
            <a href="#use-cases" className="transition hover:text-white/90">
              Use Cases
            </a>
            <a href="#faq" className="transition hover:text-white/90">
              FAQ
            </a>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <button type="button" className="px-2 text-sm text-white/45 transition hover:text-white/85">
              Open App
            </button>
            <a
              href="#waitlist"
              className="rounded-[10px] bg-[#7f22fe] px-4 py-2 text-sm text-white transition hover:bg-[#9249ff]"
            >
              Join Waitlist
            </a>
          </div>
        </nav>
      </header>

      <main className="relative">
        <section className="mx-auto grid w-full max-w-[1152px] gap-10 px-6 pb-20 pt-20 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[#7f22fe]/30 bg-[#7f22fe]/10 px-3 py-1 text-xs tracking-[0.12em] text-[#a684ff]">
              Capture. Extract. Recall.
            </p>
            <h1 className="max-w-[500px] text-4xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-5xl">
              Capture your screen.
              <br />
              <span className="text-[#a684ff]">Recall anything.</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-7 text-white/35">
              One shortcut captures your screen. AI extracts key facts instantly and you can ask for anything later.
              No folders, no tags, no manual entry.
            </p>
            <div className="mt-7">
              <WaitlistForm />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/25">
              <span>Free tier available</span>
              <span>macOS &amp; Windows</span>
              <span>No credit card</span>
            </div>
          </div>

          <div className="relative mt-1">
            <div className="pointer-events-none absolute -inset-6 rounded-[26px] bg-[#7f22fe]/20 blur-3xl" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0f0f14] shadow-[0_22px_55px_-16px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[11px] tracking-wide text-white/25">SnapRecall</span>
              </div>
              <div className="space-y-4 p-5">
                <div className="rounded-[10px] border border-[#8e51ff]/35 bg-[#1a1a24] p-4">
                  <p className="text-[10px] text-white/40">University Portal</p>
                  <p className="mt-2 text-sm text-white">CS201 — Data Structures Final Exam</p>
                  <p className="mt-2 text-xs text-white/50">Date: March 15, 2026 · Time: 2:00 PM</p>
                  <p className="mt-1 text-xs text-white/50">Location: Room 304, Engineering Building</p>
                </div>
                <p className="text-center text-xs text-[#a684ff]">Extracting facts...</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#0d0d16]/80">
          <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-5 px-6 py-8">
            <p className="text-xs uppercase tracking-[0.14em] text-white/18">Built for the way you work</p>
            <div className="flex flex-wrap items-center justify-center gap-7 text-sm text-white/30">
              {audiences.map((audience) => (
                <span key={audience} className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-white/20" />
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-[1152px] px-6 py-24">
          <p className="text-center text-xs uppercase tracking-[0.14em] text-[#a684ff]">Features</p>
          <h2 className="mt-3 text-center text-3xl font-medium tracking-[-0.02em] text-white">
            Everything happens automatically
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-center text-base leading-7 text-white/35">
            No tagging, no organizing, no manual input. Capture once and let AI take care of the rest.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition hover:border-white/12 hover:bg-white/[0.03]"
              >
                <span className={`mb-5 inline-flex size-10 items-center justify-center rounded-[14px] text-sm ${feature.tint}`}>
                  {feature.symbol}
                </span>
                <h3 className="text-base font-medium text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/32">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-white/[0.01] py-24">
          <div className="mx-auto w-full max-w-[1024px] px-6">
            <p className="text-center text-xs uppercase tracking-[0.14em] text-[#a684ff]">How It Works</p>
            <h2 className="mt-3 text-center text-3xl font-medium tracking-[-0.02em] text-white">Three steps. Zero effort.</h2>
            <p className="mt-4 text-center text-base text-white/35">From screenshot to searchable knowledge in seconds.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                  <p className="text-3xl text-[#7f22fe]/45">{step.id}</p>
                  <h3 className="mt-3 text-lg font-medium text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/32">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="mx-auto w-full max-w-[1152px] px-6 py-24">
          <p className="text-center text-xs uppercase tracking-[0.14em] text-[#a684ff]">Use Cases</p>
          <h2 className="mt-3 text-center text-3xl font-medium tracking-[-0.02em] text-white">Built for your life, not just your work</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.name} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex size-7 items-center justify-center rounded-full text-[10px] ${item.tint}`}>
                    {item.symbol}
                  </span>
                  <span className="rounded-full bg-[#7f22fe] px-3 py-1 text-[11px] text-white">{item.badge}</span>
                </div>
                <h3 className="mt-6 text-sm font-medium text-white/95">{item.name}</h3>
                <p className="mt-2 text-xs leading-5 text-white/35">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-14 grid gap-4 border-y border-white/6 py-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl text-white">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.08em] text-white/28">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="py-24">
          <div className="mx-auto w-full max-w-[672px] px-6">
            <p className="text-center text-xs uppercase tracking-[0.14em] text-[#a684ff]">FAQ</p>
            <h2 className="mt-3 text-center text-3xl font-medium tracking-[-0.02em] text-white">Frequently asked questions</h2>
            <div className="mt-10 space-y-2 rounded-2xl border border-white/6 bg-white/[0.01] p-2">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-xl border border-transparent bg-transparent p-4 open:border-white/8 open:bg-white/[0.02]">
                  <summary className="cursor-pointer list-none text-sm text-white/80">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-white/35">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="waitlist" className="pb-20 pt-10">
          <div className="relative mx-auto w-full max-w-[576px] px-6 text-center">
            <div className="pointer-events-none absolute left-1/2 top-[34%] h-[300px] w-[560px] -translate-x-1/2 rounded-full bg-[#7f22fe]/10 blur-[100px]" />
            <div className="relative">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7f22fe_0%,#615fff_100%)] text-sm font-semibold text-white">
                S
              </div>
              <h2 className="mt-6 text-3xl font-medium tracking-[-0.02em] text-white">Ready to never forget again?</h2>
              <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-white/35">
                Join the waitlist to be first in line for launch access. Early members get lifetime Pro pricing.
              </p>
              <div className="mt-8">
                <WaitlistForm compact />
              </div>
              <p className="mt-4 text-xs text-white/20">No spam, ever. Unsubscribe anytime.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/6">
        <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-6 py-8 text-xs text-white/22 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>© 2026 SnapRecall. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

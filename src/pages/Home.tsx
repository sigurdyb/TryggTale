import { useEffect, useRef, useState } from "react";
import videoSrc from "@assets/Attached-Assets-Mar-31-18-13-23.mp4";
import PhoneDemo from "../components/PhoneDemo";

const BG = "#f2f4f7";
const BG_CARD = "#ffffff";
const BG_DEEP = "#e8ecf1";
const BORDER = "#ccd4de";
const TEXT_DIM = "#8a96a4";
const TEXT_MID = "#4a5868";
const TEXT_BRIGHT = "#111822";
const COBALT = "#1e6fd9";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onCanPlayThrough = () => {
      setLoaded(true);
      const timer = setTimeout(() => {
        video.play().catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    };

    video.addEventListener("canplaythrough", onCanPlayThrough);
    return () => {
      video.removeEventListener("canplaythrough", onCanPlayThrough);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { label: "Demo", id: "demo" },
    { label: "Konsept", id: "concept" },
    { label: "Github", id: "github" },
    { label: "Støttespillere", id: "contributors" },
    { label: "Kontakt", id: "contact" },
  ];

  return (
    <div
      className="min-h-screen text-[#d8e2ee] font-['Inter',sans-serif]"
      style={{ backgroundColor: BG }}
    >
      {/* ── Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: `rgba(242,244,247,0.97)`,
          borderBottom: `1px solid ${BORDER}`,
          backdropFilter: "blur(10px)",
        }}
        data-testid="header"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center" data-testid="logo">
            <span
              className="text-3xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: TEXT_BRIGHT }}
            >
              Trygg
            </span>
            <span
              className="text-3xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: COBALT }}
            >
              Tale
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" data-testid="nav-desktop">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium transition-colors duration-150 cursor-pointer bg-transparent border-0 outline-none"
                style={{ color: TEXT_MID, letterSpacing: "0.01em" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_BRIGHT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MID)}
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span
              className="hidden sm:block text-[10px] font-medium uppercase tracking-widest select-none"
              style={{ color: TEXT_DIM }}
              data-testid="opensource-badge"
            >
              open&#8209;source
            </span>
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-1 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-[1.5px] transition-all duration-200"
                  style={{
                    backgroundColor: TEXT_MID,
                    transform:
                      menuOpen && i === 0 ? "translateY(6.5px) rotate(45deg)" :
                      menuOpen && i === 2 ? "translateY(-6.5px) rotate(-45deg)" : undefined,
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden"
            style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}
            data-testid="mobile-menu"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-left transition-colors duration-150 bg-transparent border-0 outline-none cursor-pointer"
                  style={{ color: TEXT_MID }}
                  data-testid={`mobile-nav-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
              <span
                className="text-[10px] font-medium uppercase tracking-widest pt-2"
                style={{ color: TEXT_DIM, borderTop: `1px solid ${BORDER}` }}
              >
                open&#8209;source
              </span>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero: LinkedIn left, Video right ── */}
      <section
        className="pt-14 min-h-screen flex flex-col items-center justify-center relative"
        data-testid="hero-section"
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: `
              linear-gradient(rgba(100,140,200,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,140,200,1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-[1440px] px-6 py-16">
          {/* Label bar */}
          <div className="w-full flex items-center gap-3 mb-8">
            <div className="h-[1px] flex-1" style={{ backgroundColor: BORDER }} />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>
              Tenk en verden hvor dette hadde vært unødvendig
            </span>
            <div className="h-[1px] flex-1" style={{ backgroundColor: BORDER }} />
          </div>

          <p
            className="text-sm sm:text-base font-normal text-center max-w-xl leading-relaxed mb-10"
            style={{ color: TEXT_MID }}
            data-testid="hero-subline"
          >
            Et ekstra skjold mot svindel, noe som burde kunne vært unngått i 2026.
          </p>

          {/* Two-column: LinkedIn left, Video right — flush, no gap */}
          <div
            className="w-full flex flex-col lg:flex-row items-stretch justify-center"
            style={{
              border: `1px solid ${BORDER}`,
              boxShadow: `0 0 0 1px rgba(30,111,217,0.06), 0 16px 48px rgba(0,0,0,0.4)`,
              height: "600px",
            }}
            data-testid="hero-media-row"
          >

            {/* LinkedIn embed — left */}
            <div
              className="relative flex-shrink-0 h-full"
              style={{ width: "460px", borderRight: `1px solid ${BORDER}` }}
              data-testid="linkedin-embed"
            >
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7434566946576031745"
                height="600"
                width="460"
                frameBorder="0"
                allowFullScreen
                title="TryggTale LinkedIn post"
                className="block w-full h-full"
                style={{
                  border: "none",
                  backgroundColor: BG_DEEP,
                  display: "block",
                }}
              />
            </div>

            {/* Video — right, takes all remaining width */}
            <div
              className="relative flex-1 min-w-0 h-full"
              style={{ backgroundColor: BG_DEEP, minWidth: "600px" }}
              data-testid="video-container"
            >
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: `${COBALT} transparent transparent transparent` }}
                    />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_DIM }}>Laster</span>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full h-full object-contain block"
                muted
                loop
                playsInline
                preload="auto"
                data-testid="hero-video"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            </div>

          </div>

          {/* Status bar */}
          <div className="mt-2 w-full flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_DIM }}>v0.1 — alpha</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COBALT, opacity: 0.7 }} />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_DIM }}>Under utvikling</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <section
        id="demo"
        className="py-24"
        style={{ borderTop: `1px solid ${BORDER}`, background: `linear-gradient(180deg, ${BG}, ${BG_DEEP})` }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>Demo</span>
            <div className="h-[1px] w-12" style={{ backgroundColor: BORDER }} />
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.015em", color: TEXT_BRIGHT }}
            >
              Klarer du å lure meg?
            </h2>
          </div>
          <p className="text-sm leading-relaxed mb-10 max-w-xl" style={{ color: TEXT_MID }}>
            Olga er 93 år. Hun ringer en svindler opp igjen. Snakk inn i mikrofonen som en svindler og se om systemet klarer å oppdage deg. Jo mer mistenkelig samtalen blir, jo høyere stiger risikomåleren.
          </p>
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
            <PhoneDemo />
            <div className="flex-1 max-w-sm">
              <div className="p-6" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}>
                <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: TEXT_DIM }}>Slik fungerer det</div>
                <div className="flex flex-col gap-4">
                  {[
                    { step: "01", text: "Trykk svar når Olga ringer" },
                    { step: "02", text: "Snakk norsk — prøv å være en svindler" },
                    { step: "03", text: "Se risikomåleren stige i sanntid" },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="text-[10px] font-mono mt-0.5 w-4 flex-shrink-0" style={{ color: COBALT }}>{step}</span>
                      <span className="text-xs" style={{ color: TEXT_MID }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-4" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}>
                <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: TEXT_DIM }}>Tips for testing</div>
                <div className="flex flex-col gap-2 text-xs" style={{ color: TEXT_MID }}>
                  <div>&bull; &quot;Hei, jeg ringer fra Microsoft...&quot;</div>
                  <div>&bull; &quot;Du har en faktura som ikke er betalt...&quot;</div>
                  <div>&bull; &quot;Kan du lese opp tallene på kortet ditt?&quot;</div>
                  <div>&bull; &quot;Gi meg BankID-koden din&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Konsept ── */}
      <section
        id="concept"
        className="py-24"
        style={{ borderTop: `1px solid ${BORDER}` }}
        data-testid="concept-section"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>01</span>
            <div className="h-[1px] w-12" style={{ backgroundColor: BORDER }} />
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.015em", color: TEXT_BRIGHT }}
            >
              Konsept
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: TEXT_MID }}>
                TryggTale er en programvare som kontinuerlig analyserer innholdet i telefonsamtaler for å oppdage svindelmønstre mens samtalen fremdeles pågår.
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: TEXT_MID }}>
                Dagens antisvindelteknologi er god på å blokkere kjente svindelnumre. Men den stopper ikke svindleren som allerede er inne i samtalen og manipulerer noen til å oppgi BankID, passord eller engangskode. Det er dette gapet TryggTale er laget for å tette — og den er designet for å bygge videre på eksisterende systemer, ikke erstatte dem.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                Teknologien i det endelige produktet lener seg på allerede eksisterende metoder som voice-to-text og ML — dette gjør prosjektet fullt ut realiserbart i dag.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Sanntidsanalyse", desc: "Oppdager svindelmønstre mens samtalen pågår" },
                { label: "Bygger på eksisterende systemer", desc: "Komplementerer, erstatter ikke, dagens løsninger" },
                { label: "Ingen datalagring", desc: "Ingen opptak, ingen logg, ingen analyse" },
                { label: "Åpen kildekode", desc: "Verifiserbar, forkbar, fellesskapsdrevet" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 p-4"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}
                  data-testid={`concept-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: COBALT }} />
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: TEXT_BRIGHT }}>{item.label}</div>
                    <div className="text-xs" style={{ color: TEXT_DIM }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Github ── */}
      <section
        id="github"
        className="py-24"
        style={{ borderTop: `1px solid ${BORDER}` }}
        data-testid="github-section"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>02</span>
            <div className="h-[1px] w-12" style={{ backgroundColor: BORDER }} />
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.015em", color: TEXT_BRIGHT }}
            >
              Github
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 p-6" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}>
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: TEXT_DIM }}>Repository</div>
              <div className="text-sm font-medium mb-2" style={{ color: TEXT_BRIGHT }}>tryggtale / core</div>
              <div className="text-xs leading-relaxed mb-6" style={{ color: TEXT_DIM }}>
                Hoved­implementasjon. Deteksjonslag, nøkkelordmotor og varslings­bindings.
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium transition-colors duration-150"
                style={{ color: COBALT }}
                data-testid="github-link"
              >
                <span>Se på GitHub</span>
                <span>→</span>
              </a>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-48">
              {[
                { label: "Stars", value: "—" },
                { label: "Lisens", value: "MIT" },
                { label: "Språk", value: "Rust / TS" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 flex items-center justify-between"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}
                  data-testid={`github-stat-${stat.label.toLowerCase()}`}
                >
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_DIM }}>{stat.label}</span>
                  <span className="text-xs font-medium" style={{ color: TEXT_MID }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Støttespillere ── */}
      <section
        id="contributors"
        className="py-24"
        style={{ borderTop: `1px solid ${BORDER}` }}
        data-testid="contributors-section"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>03</span>
            <div className="h-[1px] w-12" style={{ backgroundColor: BORDER }} />
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.015em", color: TEXT_BRIGHT }}
            >
              Støttespillere
            </h2>
          </div>
          <p className="text-sm leading-relaxed mb-8 max-w-xl" style={{ color: TEXT_MID }}>
            TryggTale bygges åpent. Bidrag, revisjoner og protokollkritikk er velkomne. Vi prioriterer korrekthet over funksjoner.
          </p>
          <div className="p-6 max-w-xl" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}>
            <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: TEXT_DIM }}>Slik bidrar du</div>
            <div className="flex flex-col gap-3">
              {[
                "Fork repositoryet på GitHub",
                "Les CONTRIBUTING.md før du åpner en PR",
                "Sikkerhetsproblemer sendes til sigurd100@gmail.com",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[10px] font-mono mt-0.5 w-4 flex-shrink-0" style={{ color: COBALT }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs" style={{ color: TEXT_MID }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Kontakt ── */}
      <section
        id="contact"
        className="py-24"
        style={{ borderTop: `1px solid ${BORDER}` }}
        data-testid="contact-section"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: TEXT_DIM }}>04</span>
            <div className="h-[1px] w-12" style={{ backgroundColor: BORDER }} />
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.015em", color: TEXT_BRIGHT }}
            >
              Kontakt
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            {[
              { label: "NTNU", value: "sigurdyb@stud.ntnu.no", href: "mailto:sigurdyb@stud.ntnu.no" },
              { label: "E-post", value: "sigurd100@gmail.com", href: "mailto:sigurd100@gmail.com" },
              { label: "Telefon", value: "+47 947 92 960", href: "callto:+4794792960" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_CARD }}
                data-testid={`contact-item-${item.label.toLowerCase()}`}
              >
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: TEXT_DIM }}>{item.label}</div>
                <a
                  href={item.href}
                  className="text-xs font-medium transition-colors duration-150"
                  style={{ color: TEXT_MID }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1e6fd9")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MID)}
                >
                  {item.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8"
        style={{ borderTop: `1px solid ${BORDER}` }}
        data-testid="footer"
      >
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: TEXT_DIM }}>Trygg</span>
            <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e4a8a" }}>Tale</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_DIM }}>
            MIT-lisens — open&#8209;source
          </span>
        </div>
      </footer>
    </div>
  );
}

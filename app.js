/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

/* ---------- helpers ---------- */
const venueColorClass = (c) => `tag-${c || "ghost"}`;

function useJSON(path) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(path).then((r) => r.json()).then(setData).catch((e) => {
      console.error("Failed to load", path, e);
      setData([]);
    });
  }, [path]);
  return data;
}

const isNonEmpty = (arr) => Array.isArray(arr) && arr.length > 0;

/* Tiny markdown: **bold**, *italic*, `mono`, [text](url) */
function md(text) {
  if (text == null) return null;
  const s = String(text);
  // tokenize, preserving order
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const out = [];
  let last = 0; let m; let i = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(<span key={i++}>{s.slice(last, m.index)}</span>);
    const t = m[0];
    if (t.startsWith("**")) {
      out.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    } else if (t.startsWith("`")) {
      out.push(<code key={i++} className="mono-inline">{t.slice(1, -1)}</code>);
    } else if (t.startsWith("[")) {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t);
      if (mm) out.push(
        <a key={i++} href={mm[2]} target={mm[2].startsWith("http") ? "_blank" : undefined} rel="noreferrer">{mm[1]}</a>
      );
    } else if (t.startsWith("*")) {
      out.push(<em key={i++}>{t.slice(1, -1)}</em>);
    }
    last = m.index + t.length;
  }
  if (last < s.length) out.push(<span key={i++}>{s.slice(last)}</span>);
  return out;
}

/* Render text with markdown inline */
function Mono({ text }) {
  if (!text) return null;
  return md(text);
}

/* Reading progress bar */
function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return <div className="progress-bar" style={{ transform: `scaleX(${pct})` }} aria-hidden="true" />;
}

/* Section footer ornament — REMOVED */
const SectionFoot = () => null;

/* ---------- Top nav ---------- */
const SECTIONS = [
  { id: "publications", label: "publications" },
  { id: "contact",      label: "contact" },
];

function Nav({ profile, theme, onToggleTheme }) {
  const goTop = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 540px)").matches;
  return (
    <nav className="nav" aria-label="primary">
      <div className="nav-inner">
        <a href="#" className="nav-brand" onClick={goTop}>
          <span className="prompt">$</span>{profile?.handle || profile?.name || "MinSoo"}
        </a>
        <div className="nav-links">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="nav-link">{s.label}</a>
          ))}
          <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme (t)" aria-label="Toggle theme">
            <span className="t-full">:theme {theme}</span>
            <span className="t-short">{theme === "light" ? "◐" : "◑"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ---------- Typing intro (skip on revisit) ---------- */
function Typed({ text, speed = 24, startDelay = 200 }) {
  const seenKey = "typedSeen";
  const seen = (() => { try { return sessionStorage.getItem(seenKey) === "1"; } catch (_) { return false; } })();
  const [out, setOut] = useState(seen ? text : "");
  const [done, setDone] = useState(seen);
  useEffect(() => {
    if (seen) return;
    let i = 0, raf, cancel = false;
    const tick = () => {
      if (cancel) return;
      if (i >= text.length) {
        setDone(true);
        try { sessionStorage.setItem(seenKey, "1"); } catch (_) {}
        return;
      }
      i += 1;
      setOut(text.slice(0, i));
      raf = setTimeout(tick, speed);
    };
    const t = setTimeout(tick, startDelay);
    return () => { cancel = true; clearTimeout(t); clearTimeout(raf); };
  }, [text]);
  return (
    <span className="typed-line">
      <span className="glyph">❯</span>
      <span>{out}</span>
      {!done && <span className="cursor" />}
    </span>
  );
}

/* ---------- Hero (merged with about) ---------- */
function Hero({ profile, photoPos }) {
  if (!profile) return <div className="hero" />;
  const status = profile.currently?.[0] || profile.tagline;
  return (
    <header className="hero" id="about" data-photo={photoPos}>
      <div className="hero-photo">
        {/* Profile photo */}
        <img src={profile.image || "assets/profile.svg"} alt={profile.name} />
      </div>
      <div className="hero-main">
        <div className="hero-intro">
          <h1>{profile.name}<span className="h1-cursor" aria-hidden="true" /></h1>
          <p className="hero-meta">
            {profile.role}<span className="sep">·</span>
            {profile.affiliation}<span className="sep">·</span>
            {profile.location}
          </p>
        </div>
        <div className="hero-copy">
          <p className="hero-bio"><Mono text={profile.bio} /></p>
          <p className="hero-interests">
            <span className="muted">research</span>{" "}
            {profile.interests.map((t, i) => (
              <span key={t}>
                <span className="interest">{t}</span>
                {i < profile.interests.length - 1 && <span className="dot">·</span>}
              </span>
            ))}
          </p>
          <div className="hero-status" aria-hidden="true" style={{ display: "none" }}>
            <Typed text={`status: ${status}`} />
          </div>
        </div>
      </div>
      <Fortune />
    </header>
  );
}

/* ---------- Fortune (random quote, click to cycle) ---------- */
function Fortune() {
  const fortunes = useJSON("data/fortunes.json");
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * 1000));
  if (!Array.isArray(fortunes) || fortunes.length === 0) return null;
  const f = fortunes[idx % fortunes.length];
  const next = () => setIdx((i) => (i + 1) % fortunes.length);
  return (
    <div className="fortune" role="figure" aria-label="quote of the moment">
      <div className="fortune-top" aria-hidden="true">
        <span className="ft-corner">┌─</span>
        <span className="ft-title">  fortune  </span>
        <span className="ft-fill" />
        <button className="fortune-next" onClick={next} title="Next quote (cycle)" aria-label="Next quote">[ ↻ next ]</button>
        <span className="ft-corner">─┐</span>
      </div>
      <div className="fortune-body">
        <div className="fortune-quote">
          <span className="fq-mark">"</span>{f.quote}<span className="fq-mark">"</span>
        </div>
        <div className="fortune-by">— {f.by}</div>
      </div>
      <div className="fortune-bot" aria-hidden="true">
        <span className="ft-corner">└─</span>
        <span className="ft-fill" />
        <span className="ft-corner">─┘</span>
      </div>
    </div>
  );
}

/* ---------- Section header (uniform: $ cat <file>) ---------- */
function SectionHead({ name, count }) {
  return (
    <div className="section-head">
      <span className="prompt">$</span>
      <span className="cmd">cat </span>
      <span className="name">{name}</span>
      {typeof count === "number" && <span className="count">[{count}]</span>}
    </div>
  );
}

/* ---------- Authors line ---------- */
function Authors({ list, me }) {
  return (
    <p className="pub-authors">
      {list.map((a, i) => {
        const cleaned = a.replace(/[*†‡]/g, "");
        const isMe = cleaned === me;
        const star = a.match(/[*†‡]/)?.[0];
        return (
          <span key={i}>
            <span className={isMe ? "me" : ""}>{cleaned}</span>
            {star && <span className="star" title={star === "*" ? "Equal contribution" : "Corresponding author"}>{star}</span>}
            {i < list.length - 1 && ", "}
          </span>
        );
      })}
    </p>
  );
}

/* ---------- Publication item ---------- */
function PubItem({ p }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="pub">
      <div className={"pub-thumb" + (p.thumbnailFit === "contain" ? " contain" : "")}><img src={p.thumbnail} alt="" /></div>
      <div className="pub-body">
        <div className="pub-tags">
          <span className={"tag " + venueColorClass(p.venueColor)}>{p.venue} {p.year}</span>
          {p.tags?.map((t) => <span key={t} className="tag tag-accent">{t}</span>)}
          {p.equalContribution && <span className="tag tag-ghost">* equal contribution</span>}
        </div>
        <h3 className="pub-title">{md(p.title)}</h3>
        <Authors list={p.authors} me={p.me} />
        <div className="pub-actions">
          {p.links?.paper && <a href={p.links.paper}>[paper]</a>}
          {p.links?.code && <a href={p.links.code}>[code]</a>}
          {p.links?.project && <a href={p.links.project}>[project]</a>}
          {p.links?.bibtex && <a href={p.links.bibtex}>[bibtex]</a>}
          {p.abstract && (
            <button className={"toggle" + (open ? " open" : "")} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? "[− abstract]" : "[+ abstract]"}
            </button>
          )}
        </div>
        {open && p.abstract && <div className="pub-abstract">{md(p.abstract)}</div>}
      </div>
    </article>
  );
}

/* ---------- Lists w/ empty-section guards ---------- */
function PublicationList({ id, name, items }) {
  if (!isNonEmpty(items)) return null;
  return (
    <section className="section" id={id}>
      <SectionHead name={name} count={items.length} />
      <div>{items.map((p, i) => <PubItem key={i} p={p} />)}</div>
    </section>
  );
}

function EducationList({ items }) {
  if (!isNonEmpty(items)) return null;
  return (
    <section className="section" id="education">
      <SectionHead name="education.md" count={items.length} />
      <div className="entries">
      {items.map((e, i) => (
        <div className="entry" key={i}>
          <div className="entry-when">{e.start} — {e.end}</div>
          <div>
            <h3 className="entry-title">{md(e.degree)}</h3>
            <p className="entry-sub">
              {md(e.school)}
              {e.lab && <><span className="dot">·</span>{md(e.lab)}</>}
              {e.location && <><span className="dot">·</span>{md(e.location)}</>}
            </p>
            {(e.advisor || e.gpa || e.honors) && (
              <p className="entry-note">
                {e.advisor && <>Advisor: {md(e.advisor)}. </>}
                {e.gpa && <>GPA: {md(e.gpa)}. </>}
                {e.honors && <>{md(e.honors)}.</>}
              </p>
            )}
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}

function ExperienceList({ items }) {
  if (!isNonEmpty(items)) return null;
  return (
    <section className="section" id="experience">
      <SectionHead name="experience.md" count={items.length} />
      <div className="entries">
      {items.map((e, i) => (
        <div className="entry" key={i}>
          <div className="entry-when">{e.start} — {e.end}</div>
          <div>
            <h3 className="entry-title">{md(e.role)}</h3>
            <p className="entry-sub">
              {md(e.org)}
              {e.team && <><span className="dot">·</span>{md(e.team)}</>}
            </p>
            <p className="entry-note">{md(e.summary)}</p>
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}

function AwardsList({ items }) {
  if (!isNonEmpty(items)) return null;
  return (
    <section className="section" id="awards">
      <SectionHead name="awards.md" count={items.length} />
      <div className="entries">
      {items.map((a, i) => (
        <div className="entry" key={i}>
          <div className="entry-when">{a.year}</div>
          <div>
            <h3 className="entry-title">{md(a.title)}</h3>
            <p className="entry-sub">{md(a.issuer)}</p>
            {a.note && <p className="entry-note">{md(a.note)}</p>}
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}

function NewsList({ items }) {
  if (!isNonEmpty(items)) return null;
  const renderText = (t) => md(t);
  return (
    <section className="section" id="news">
      <SectionHead name="news.log" count={items.length} />
      <div className="news entries">
        {items.map((n, i) => (
          <div className="news-row" key={i}>
            <span className="news-date">{n.date}</span>
            <span className="news-text">{renderText(n.text)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiscList({ items }) {
  if (!isNonEmpty(items)) return null;
  return (
    <section className="section" id="misc">
      <SectionHead name="misc.txt" count={items.length} />
      <div className="misc entries">
        {items.map((m, i) => (
          <div className="misc-row" key={i}>
            <span className="misc-label">{md(m.label)}</span>
            <span className="misc-value">{md(m.value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact({ profile }) {
  if (!profile) return null;
  const ghHandle = profile.links.github?.split("/").filter(Boolean).pop() || "minsoo";
  const xHandle  = profile.links.x?.split("/").filter(Boolean).pop() || "minsoo";
  const rows = [
    { key: "email",   text: profile.email,    href: profile.links.email },
    { key: "github",  text: "@" + ghHandle,   href: profile.links.github },
    { key: "scholar", text: "Google Scholar", href: profile.links.scholar },
    { key: "x",       text: "@" + xHandle,    href: profile.links.x },
  ];
  return (
    <section className="section" id="contact">
      <SectionHead name="contact.txt" />
      <div className="contact">
        {rows.map((r) => (
          <div className="contact-row" key={r.key}>
            <span className="contact-key">{r.key}</span>
            <span className="contact-val">
              <a href={r.href} target={r.href?.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">{r.text}</a>
            </span>
          </div>
        ))}
      </div>
      <div className="contact-cta">
        <a href={profile.links.email}>✉ get in touch</a>
        <a className="secondary" href={profile.links.cv} target="_blank" rel="noreferrer">↓ CV (pdf)</a>
      </div>
    </section>
  );
}

/* ---------- Help modal (?) ---------- */
function HelpModal({ open, onClose, profile }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const rows = [
    ["t",       "toggle theme"],
    ["g h",     "go to top (about)"],
    ["g p",     "go to publications"],
    ["g e",     "go to experience"],
    ["g a",     "go to awards"],
    ["g n",     "go to news"],
    ["g c",     "go to contact"],
    ["?",       "this help"],
    ["esc",     "close"],
  ];
  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-head">
          <span className="prompt">$</span> man {profile?.handle || profile?.name || "MinSoo"}
          <button className="help-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="help-body">
          {rows.map(([k, v]) => (
            <div className="help-row" key={k}>
              <span className="help-keys">{k.split(" ").map((part, i) => (
                <span key={i}><span className="kbd">{part}</span>{i < k.split(" ").length - 1 ? " " : ""}</span>
              ))}</span>
              <span className="help-desc">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Footer ---------- */
function Footer({ profile, onHelp }) {
  return (
    <footer className="foot">
      <span>© {new Date().getFullYear()} {profile?.name || "Min Soo Kim"} — built with html, css, a little js</span>
      <span className="kbhint">
        <button className="kbd-btn" onClick={onHelp} title="Show shortcuts (?)">
          press <span className="kbd">?</span> for shortcuts
        </button>
      </span>
    </footer>
  );
}

/* ---------- Tweaks ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "photoPos": "right"
}/*EDITMODE-END*/;

function TweaksRoot({ theme, setTheme, photoPos, setPhotoPos }) {
  if (!window.TweaksPanel) return null;
  const { TweaksPanel, TweakSection, TweakRadio } = window;
  return (
    <TweaksPanel>
      <TweakSection title="theme">
        <TweakRadio label="Mode" value={theme} onChange={setTheme}
          options={[{ value: "light", label: "light" }, { value: "dark", label: "dark" }]} />
      </TweakSection>
      <TweakSection title="hero">
        <TweakRadio label="Photo" value={photoPos} onChange={setPhotoPos}
          options={[{ value: "left", label: "left" }, { value: "right", label: "right" }]} />
      </TweakSection>
    </TweaksPanel>
  );
}

/* ---------- App ---------- */
function App() {
  const profile     = useJSON("data/profile.json");
  const publications= useJSON("data/publications.json");
  const preprints   = useJSON("data/preprints.json");
  const education   = useJSON("data/education.json");
  const experience  = useJSON("data/experience.json");
  const awards      = useJSON("data/awards.json");
  const news        = useJSON("data/news.json");
  const misc        = useJSON("data/misc.json");

  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch (_) {}
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    return TWEAK_DEFAULTS.theme || "light";
  });
  const [photoPos, setPhotoPos] = useState(() => {
    try {
      const stored = localStorage.getItem("photoPos");
      if (stored === "left" || stored === "right") return stored;
    } catch (_) {}
    return TWEAK_DEFAULTS.photoPos || "right";
  });
  const [help, setHelp] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch (_) {}
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { theme } }, "*");
  }, [theme]);
  useEffect(() => {
    try { localStorage.setItem("photoPos", photoPos); } catch (_) {}
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { photoPos } }, "*");
  }, [photoPos]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    let waitG = false, gTimer = null;
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) { e.preventDefault(); setHelp((v) => !v); return; }
      if (e.key === "t") { toggleTheme(); return; }
      if (e.key === "g") { waitG = true; clearTimeout(gTimer); gTimer = setTimeout(() => waitG = false, 900); return; }
      if (waitG) {
        const map = { p: "publications", n: "news", c: "contact", e: "experience", a: "awards", h: "about" };
        if (map[e.key]) {
          waitG = false;
          document.getElementById(map[e.key])?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <ProgressBar />
      <Nav profile={profile} theme={theme} onToggleTheme={toggleTheme} />
      <main className="page">
        <Hero profile={profile} photoPos={photoPos} />
        <NewsList items={news} />
        <PublicationList id="publications" name="publications.md" items={publications} />
        <PublicationList id="preprints"    name="preprints.md"    items={preprints} />
        <ExperienceList items={experience} />
        <EducationList  items={education} />
        <AwardsList     items={awards} />
        <MiscList       items={misc} />
        <Contact        profile={profile} />
        <Footer profile={profile} onHelp={() => setHelp(true)} />
      </main>
      <HelpModal open={help} onClose={() => setHelp(false)} profile={profile} />
      <TweaksRoot theme={theme} setTheme={setTheme} photoPos={photoPos} setPhotoPos={setPhotoPos} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

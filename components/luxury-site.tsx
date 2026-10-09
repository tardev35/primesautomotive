"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvailabilitySearch, FleetResultNote, VehicleCard } from "@/components/fleet-experience";
import { fleet, matchesRental, type RentalQuery } from "@/lib/fleet";
import { CompanyPage } from "@/components/company-pages";
import { companyLabels, pendingLabel,  SocialLinks } from "@/components/site-branding";
import { callLink, lineLink, defaultSiteContent, type SiteContent } from "@/lib/site-content";
import { SiteContentProvider, useSiteContent } from "@/components/site-content-provider";
import { Vehicle360Demo } from "@/components/vehicle-360-demo";

type Language = "th" | "en" | "zh";

const languages: Array<{ code: Language; label: string; name: string; flag: string }> = [
  { code: "th", label: "ไทย", name: "ไทย", flag: "/flags/th.svg" },
  { code: "en", label: "EN", name: "English", flag: "/flags/gb.svg" },
  { code: "zh", label: "中文", name: "中文", flag: "/flags/cn.svg" },
];


const filterValues = ["All", "Sports", "Supercar", "Ultra-Luxury", "SUV"] as const;
const fleetCopy = {
  th: { filters: ["ทั้งหมด", "สปอร์ต", "ซูเปอร์คาร์", "อัลตร้าลักชัวรี", "SUV"], browse: "ชมรถทั้งหมด", count: "รุ่นในคอลเลกชัน", note: "คอลเลกชันตัวอย่างพร้อมภาพประกอบรุ่นรถ ราคาและคิวว่างยังไม่ได้เชื่อมกับระบบของร้าน", quote: "สอบถามราคาและคิวว่าง", detail: "ข้อมูลรุ่นรถ", close: "ปิด", credit: "เครดิตภาพ", dateError: "กรุณาเลือกวันคืนรถหลังวันรับรถ", dateSummary: "ช่วงวันที่เลือก", dateNote: "วันที่นี้ใช้สำหรับเตรียมสอบถามเท่านั้น ยังไม่ใช่ผลยืนยันรถว่าง" },
  en: { filters: ["All", "Sports", "Supercar", "Ultra-Luxury", "SUV"], browse: "Browse the collection", count: "models in the collection", note: "Illustrative model collection. Live pricing and availability are not connected to the rental operator yet.", quote: "Pricing & availability on request", detail: "Model information", close: "Close", credit: "Photo credit", dateError: "Please choose a return date after the pick-up date.", dateSummary: "Selected dates", dateNote: "These dates prepare your enquiry only; vehicle availability has not been confirmed." },
  zh: { filters: ["全部", "跑车", "超级跑车", "超豪华", "SUV"], browse: "浏览全部车型", count: "款精选车型", note: "此处为车型展示及示意照片，尚未接入租车公司的实时价格与车辆档期。", quote: "价格与档期请咨询", detail: "车型信息", close: "关闭", credit: "图片来源", dateError: "请选择晚于取车日期的还车日期。", dateSummary: "所选日期", dateNote: "所选日期仅用于准备咨询，不代表车辆档期已确认。" },
} as const;

export function LuxurySite({ page = "home", content = defaultSiteContent }: { page?: "home" | "about" | "contact"; content?: SiteContent }) {
  return <SiteContentProvider value={content}><LuxurySiteView page={page} /></SiteContentProvider>;
}

function LuxurySiteView({ page }: { page: "home" | "about" | "contact" }) {
  const { settings, home } = useSiteContent();
  const callHref = callLink(settings);
  const lineHref = lineLink(settings);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [language, setLanguage] = useState<Language>("th");
  const [languageReady, setLanguageReady] = useState(false);
  const [rentalQuery, setRentalQuery] = useState<RentalQuery | null>(null);
  const t = { ...home[language], ...settings.text[language] };
  const ft = fleetCopy[language];
  const matchingCars = useMemo(() => rentalQuery ? fleet.filter((car) => matchesRental(car, rentalQuery)) : fleet, [rentalQuery]);
  const filteredCars = useMemo(() => activeFilter === "All" ? matchingCars : matchingCars.filter((car) => car.category === activeFilter), [activeFilter, matchingCars]);
  const resetSearch = () => { setRentalQuery(null); setActiveFilter("All"); };
  const navItems = [{ href: "/#fleet", label: t.nav[0] }, { href: "/#experience", label: t.nav[1] }, { href: "/#process", label: t.nav[2] }, { href: "/about", label: companyLabels[language].about }, { href: "/contact", label: companyLabels[language].contact }];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prom-drive-language");
      if (saved === "th" || saved === "en" || saved === "zh") setLanguage(saved);
    } catch { /* Storage can be unavailable in privacy mode. */ }
    setLanguageReady(true);
  }, []);

  useEffect(() => {
    if (languageReady) {
      try { localStorage.setItem("prom-drive-language", language); } catch { /* Keep switching usable without storage. */ }
    }
    document.documentElement.lang = language === "zh" ? "zh-Hans" : language;
  }, [language, languageReady]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1101px)");
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) return;
    const elements = [...document.querySelectorAll<HTMLElement>(".statement > .eyebrow, .statement-grid > *, .section-heading > *, .process-grid article, .concierge-section > *, .footer-main > *")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.replace("reveal-pending", "reveal-visible");
        observer.unobserve(target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight - 24) return;
      element.classList.add("reveal-pending");
      observer.observe(element);
    });
    const revealAll = () => {
      if (motion.matches) { observer.disconnect(); elements.forEach((el) => el.classList.remove("reveal-pending")); }
    };
    motion.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", revealAll);
      elements.forEach((el) => el.classList.remove("reveal-pending", "reveal-visible"));
    };
  }, []);

  return (
    <div className="site-shell">
      <div className="film-grain" aria-hidden="true" />
      <header className="site-header" ref={headerRef}>
        <a className="brand" href="/" aria-label={`${settings.brand_name} home`}>
          <img className="brand-logo" src={settings.logo_url} alt={settings.brand_name} width={56} height={56} />
          <span className="brand-copy"><b>{settings.brand_name}</b><small>{settings.brand_tagline}</small></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => <a href={item.href} key={item.href} aria-current={item.href === `/${page}` ? "page" : undefined}>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <div className="language-switch" aria-label="เลือกภาษา / Select language / 选择语言">
            {languages.map((item) => <button type="button" key={item.code} className={language === item.code ? "active" : ""} aria-label={item.name} lang={item.code} aria-pressed={language === item.code} onClick={() => setLanguage(item.code)}><img className="language-flag" src={item.flag} width={22} height={16} alt="" />{item.label}</button>)}
          </div>
          <a className="header-call" href={callHref}><Phone size={15} aria-hidden="true" /><span>CALL</span></a>
        </div>
        <div className="mobile-header-language">
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)} onOpenChange={(open) => { if (open) setMenuOpen(false); }}>
            <SelectTrigger className="header-language-trigger" aria-label="เลือกภาษา / Select language / 选择语言"><SelectValue /></SelectTrigger>
            <SelectContent className="header-language-options" position="popper" align="end" sideOffset={8}>
              {languages.map((item) => <SelectItem value={item.code} key={item.code} aria-label={item.name} lang={item.code}><img className="language-flag" src={item.flag} width={22} height={16} alt="" /><span>{item.label}</span></SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <button ref={menuButtonRef} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={language === "th" ? (menuOpen ? "ปิดเมนู" : "เปิดเมนู") : language === "zh" ? (menuOpen ? "关闭菜单" : "打开菜单") : (menuOpen ? "Close menu" : "Open menu")} onClick={() => setMenuOpen((open) => !open)}>
          <span className="hamburger-lines" aria-hidden="true"><span /><span /><span /></span>
        </button>
          <nav id="mobile-menu" className={`mobile-menu${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen} inert={!menuOpen}>
            {navItems.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)} aria-current={item.href === `/${page}` ? "page" : undefined}>{item.label}</a>)}<a href={callHref}><Phone size={15} aria-hidden="true" /> CALL</a>
          </nav>
      </header>

      <main id="top">
        {page === "home" ? <>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" role="img" aria-label="Unbranded pearl-silver luxury grand tourer revealed in a dark studio" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <TypewriterHeading key={language} language={language} lines={t.heroTitle} />
            <p className="hero-thai">{t.heroBody}</p>
            <div className="hero-actions"><a className="button button-gold btn-77" href="#availability">{t.check}</a><a className="text-link" href="#fleet">{t.explore}</a></div>
          </div>
          <div className="hero-meta" aria-label="Service highlights">
            <span><ShieldCheck size={16} />{t.meta[0]}</span><span><Clock3 size={16} />{t.meta[1]}</span><span><MapPin size={16} />{t.meta[2]}</span>
          </div>
          <a className="scroll-cue" href="#availability" aria-label="Scroll to availability"><span>{t.scroll}</span><ChevronDown size={16} /></a>
        </section>

        <AvailabilitySearch language={language} query={rentalQuery} count={matchingCars.length} onSearch={(query) => { setRentalQuery(query); setActiveFilter("All"); }} onReset={resetSearch} />

        <section className="statement section-pad" id="experience">
          <p className="eyebrow">{t.statementEyebrow}</p>
          <div className="statement-grid">
            <p data-heading="h2" className={`statement-title statement-title-${language}`}>{t.statementTitle[0]}<span>{t.statementTitle[1]}</span></p>
            <div className="statement-copy"><p>{t.statementBody}</p><div className="stats"><div><strong>100%</strong><span>{t.stats[0]}</span></div><div><strong>24/7</strong><span>{t.stats[1]}</span></div><div><strong>3</strong><span>{t.stats[2]}</span></div></div></div>
          </div>
        </section>

        <section className="fleet-section section-pad" id="fleet">
          <div className="section-heading"><div><p className="eyebrow">{t.reserve}</p><p data-heading="h2">{t.choose}</p></div><p>{t.chooseBody}</p></div>
          <div className="filter-row" aria-label="Filter the collection">
            {filterValues.map((filter, index) => <button type="button" key={filter} className={activeFilter === filter ? "active" : ""} aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{ft.filters[index]}</button>)}
          </div>
          <p className="fleet-count" aria-live="polite">{filteredCars.length} {ft.count}</p>
          <p className="fleet-disclaimer">{t.demo}</p>
          {rentalQuery && <FleetResultNote query={rentalQuery} language={language} count={filteredCars.length} onReset={resetSearch} />}
          <div className="fleet-grid">
            {filteredCars.map((car) => <VehicleCard car={car} language={language} query={rentalQuery} key={car.slug} />)}
          </div>
        </section>

        <Vehicle360Demo language={language} />

        <section className="process-section section-pad" id="process">
          <div className="section-heading"><div><p className="eyebrow">{t.processEyebrow}</p><p data-heading="h2">{t.processTitle}</p></div><p>{t.processBody}</p></div>
          <div className="process-grid">
            <article><span>01</span><Sparkles size={24} /><p data-heading="h3">{t.processHeads[0]}</p><p>{t.processNotes[0]}</p></article>
            <article><span>02</span><ShieldCheck size={24} /><p data-heading="h3">{t.processHeads[1]}</p><p>{t.processNotes[1]}</p></article>
            <article><span>03</span><MapPin size={24} /><p data-heading="h3">{t.processHeads[2]}</p><p>{t.processNotes[2]}</p></article>
          </div>
        </section>

        <section className="concierge-section" id="contact">
          <div><p className="eyebrow">{t.contactEyebrow}</p><p data-heading="h2">{t.contactTitle[0]}<br />{t.contactTitle[1]}</p></div>
          <div className="concierge-actions"><a className="button button-gold btn-77" href={lineHref}><MessageCircle size={17} />{t.line}</a><a className="button button-outline" href={callHref}><Phone size={17} />CALL</a><p>{t.hours}</p></div>
        </section>
        </> : <CompanyPage page={page} language={language} />}
      </main>

      <footer className="site-footer" id="footer">
        <div className="footer-main">
          <div className="footer-about">
            <a className="brand footer-brand" href="/"><img className="brand-logo" src={settings.logo_url} alt={settings.brand_name} width={56} height={56} /><span className="brand-copy"><b>{settings.brand_name}</b><small>{settings.brand_tagline}</small></span></a>
            <p>{t.footerIntro}</p>
            <div className="footer-contact-list"><a href={callHref}>CALL <b>{settings.phone || pendingLabel[language]}</b></a><a href={lineHref}>LINE <b>{settings.social.line ? (settings.line_id || companyLabels[language].contact) : pendingLabel[language]}</b></a></div>
            <SocialLinks language={language} />
          </div>
          <FooterColumn title={t.footerHeads[0]} items={t.footerRent} />
          <FooterColumn title={t.footerHeads[1]} items={t.footerServices} />
          <FooterColumn title={t.footerHeads[2]} items={t.footerPlaces} />
        </div>
        <nav className="footer-company-links" aria-label="PROM DRIVE"><a href="/about">{companyLabels[language].about}</a><a href="/contact">{companyLabels[language].contact}</a></nav>
        <div className="footer-bottom"><p>{t.footerCopyright}</p><nav aria-label="Legal"><a href="/contact">{t.footerLegal[0]}</a><a href="/contact">{t.footerLegal[1]}</a><a href="/contact">{t.footerLegal[2]}</a></nav></div>
      </footer>
    </div>
  );
}

function TypewriterHeading({ language, lines }: { language: Language; lines: readonly string[] }) {
  // Graphemes keep Thai tone marks and combining vowels with their base letter.
  const segmenter = new Intl.Segmenter(language, { granularity: "grapheme" });
  const segments = lines.map((line) => [...segmenter.segment(line)].map(({ segment }) => segment));
  let offset = 0;
  return <p data-heading="h1" id="hero-title" className={`hero-title hero-title-${language} typewriter-title`} >
    <span className="sr-only">{lines.join(" ")}</span>
    {segments.map((line, lineIndex) => {
      const start = offset;
      offset += line.length;
      return <span className={`typewriter-line${lineIndex ? " typewriter-line-accent" : ""}`} aria-hidden="true" key={lineIndex}>{line.map((glyph, index) => <span className="typewriter-glyph" key={index} style={{ animationDelay: `${220 + (start + index) * 65 + lineIndex * 180}ms` }}>{glyph}</span>)}</span>;
    })}
  </p>;
}

function FooterColumn({ title, items }: { title: string; items: readonly string[] }) {
  return <div className="footer-column"><p data-heading="h3">{title}</p><nav>{items.map((item) => <a href="/contact" key={item}>{item}</a>)}</nav></div>;
}

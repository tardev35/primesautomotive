"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvailabilitySearch, FleetResultNote, VehicleCard } from "@/components/fleet-experience";
import { fleet, matchesRental, type RentalQuery } from "@/lib/fleet";

type Language = "th" | "en" | "zh";

const languages: Array<{ code: Language; label: string; name: string; flag: string }> = [
  { code: "th", label: "ไทย", name: "ไทย", flag: "/flags/th.svg" },
  { code: "en", label: "EN", name: "English", flag: "/flags/gb.svg" },
  { code: "zh", label: "中文", name: "中文", flag: "/flags/cn.svg" },
];

const copy = {
  th: {
    nav: ["รถทั้งหมด", "ประสบการณ์", "ขั้นตอน", "ติดต่อ"], concierge: "คอนเซียร์จ",
    heroEyebrow: "คอลเลกชันส่วนตัว · กรุงเทพฯ", heroTitle: ["ที่สุดแห่ง", "การเดินทาง"],
    heroBody: "ประสบการณ์รถระดับห้าดาว ตั้งแต่ข้อความแรกจนถึงวินาทีที่เรารับรถคืน",
    check: "ตรวจสอบรถว่าง", explore: "ชมคอลเลกชัน", meta: ["รถของเราเอง 100%", "ยืนยันภายใน 15 นาที", "ส่งรถถึงคุณ"], scroll: "เลื่อนเพื่อชม",
    live: "คอนเซียร์จพร้อมบริการ", find: "ค้นหารถสำหรับคุณ", pickup: "วันรับรถ", return: "วันคืนรถ", delivery: "สถานที่ส่งรถ", dates: ["12 ต.ค. 2026", "14 ต.ค. 2026"],
    places: ["กรุงเทพฯ", "สนามบินสุวรรณภูมิ", "สนามบินดอนเมือง", "จัดส่งถึงโรงแรม"], viewAvailable: "ดูรถว่าง 12 คัน",
    statementEyebrow: "เป็นเจ้าของเอง · คัดสรร · ดูแลอย่างพิถีพิถัน", statementTitle: ["ไม่ใช่แค่รถเช่า", "แต่คือการเดินทางที่ดูแลครบทุกด้าน"],
    statementBody: "รถทุกคันในคอลเลกชันอยู่ภายใต้การดูแลของเราโดยตรง ไม่มีนายหน้า และไม่มีการส่งต่อประสบการณ์ให้บุคคลอื่น", stats: ["รถของเราเอง", "คอนเซียร์จส่วนตัว", "พื้นที่จัดส่ง"],
    reserve: "คอลเลกชันของเรา", choose: "เลือกภาพลักษณ์ที่เป็นคุณ", chooseBody: "เลือกตามอารมณ์และรูปแบบการเดินทาง ไม่ใช่เพียงตามตราสัญลักษณ์", filters: ["ทั้งหมด", "สปอร์ต", "ซูเปอร์คาร์", "อัลตร้าลักชัวรี"],
    available: "พร้อมให้บริการ", perDay: "/วัน", viewCar: "ดูรายละเอียดรถ", carNotes: ["ความสบายระดับสูงสำหรับทุกค่ำคืนที่สำคัญ", "แกรนด์ทัวเรอร์สมรรถนะสูงที่ขับได้อย่างมั่นใจ", "สมดุลระหว่างความเร้าใจกับการใช้งานในเมือง"],
    processEyebrow: "เรียบง่ายในทุกขั้นตอน", processTitle: "สามขั้นตอนที่เราเตรียมไว้ให้", processBody: "ทุกขั้นตอนมีเจ้าหน้าที่ดูแล โดยไม่ต้องกรอกแบบฟอร์มยาว", processHeads: ["เลือก", "ยืนยัน", "รับรถ"], processNotes: ["เลือกคันที่เข้ากับโอกาสและรูปแบบการเดินทาง", "ยืนยันตัวตนกับคอนเซียร์จ โดยปกติภายใน 15 นาที", "รับรถที่บ้าน โรงแรม หรือสนามบินตามเวลานัดหมาย"],
    contactEyebrow: "การเดินทางของคุณเริ่มตรงนี้", contactTitle: ["คุยเพียงครั้งเดียว", "เราจัดการทุกอย่างให้"], line: "คุยผ่าน LINE", call: "โทรตอนนี้", hours: "ให้บริการทุกวัน · 08:00–24:00 น.", demo: "รถและราคาในหน้านี้เป็นข้อมูลตัวอย่าง",
    footerIntro: "บริการรถหรูและรถสมรรถนะสูงแบบส่วนตัว ดูแลโดยทีมคอนเซียร์จ ตั้งแต่เลือกคันจนถึงรับรถคืน", footerHeads: ["คอลเลกชัน", "บริการ", "พื้นที่ให้บริการ"], footerRent: ["ซูเปอร์คาร์", "อัลตร้าลักชัวรี", "รถสปอร์ต", "ซีดานพร้อมคนขับ"], footerServices: ["ขับเอง", "พร้อมคนขับ", "รับ–ส่งสนามบิน", "งานแต่งและอีเวนต์"], footerPlaces: ["กรุงเทพฯ", "สุวรรณภูมิ", "ภูเก็ต", "เกาะสมุย", "เชียงใหม่"], footerContact: ["คอนเซียร์จ", "WhatsApp", "LINE"], footerLegal: ["ข้อตกลง", "ความเป็นส่วนตัว", "นโยบายการเช่า"], footerCopyright: "© 2026 PROM DRIVE · ข้อมูลตัวอย่างสำหรับงานออกแบบ",
  },
  en: {
    nav: ["Fleet", "Experience", "How it works", "Contact"], concierge: "Concierge",
    heroEyebrow: "THE PRIVATE COLLECTION · BANGKOK", heroTitle: ["THE FINEST", "JOURNEY"], heroBody: "A five-star motoring experience, from your first message until the car is returned.",
    check: "Check availability", explore: "Explore the collection", meta: ["100% owned fleet", "15-minute confirmation", "Delivered to you"], scroll: "Scroll to discover",
    live: "Live concierge", find: "Find your car", pickup: "Pick-up date", return: "Return date", delivery: "Delivery location", dates: ["12 Oct 2026", "14 Oct 2026"], places: ["Bangkok", "Suvarnabhumi Airport", "Don Mueang Airport", "Hotel delivery"], viewAvailable: "View 12 available cars",
    statementEyebrow: "OWNED · CURATED · IMPECCABLY KEPT", statementTitle: ["More than a rental", "A journey cared for from end to end"], statementBody: "Every vehicle is owned and cared for directly by us. No brokers, and no hand-off of your experience to another provider.", stats: ["Owned fleet", "Private concierge", "Delivery zones"],
    reserve: "THE RESERVE", choose: "Choose your presence", chooseBody: "Choose for the occasion and the way you want to travel—not simply for the badge.", filters: ["All", "Sports", "Supercar", "Ultra-Luxury"], available: "Available", perDay: "/day", viewCar: "View this car", carNotes: [],
    processEyebrow: "EFFORTLESS BY DESIGN", processTitle: "Three quiet steps", processBody: "A dedicated concierge guides every step—no long forms required.", processHeads: ["Select", "Verify", "Receive"], processNotes: ["Choose the car that suits your occasion and journey.", "Verify your identity with your concierge, usually within 15 minutes.", "Receive the car at your home, hotel or airport at the agreed time."],
    contactEyebrow: "YOUR JOURNEY BEGINS HERE", contactTitle: ["One conversation", "Everything arranged"], line: "LINE Concierge", call: "Call now", hours: "Available daily · 08:00–24:00 ICT", demo: "Concept fleet and pricing shown for demonstration.",
    footerIntro: "Private access to luxury and performance cars, guided by one concierge from selection to return.", footerHeads: ["Collection", "Services", "Service areas"], footerRent: ["Supercars", "Ultra-luxury", "Sports cars", "Chauffeured sedans"], footerServices: ["Self-drive", "With chauffeur", "Airport delivery", "Weddings & events"], footerPlaces: ["Bangkok", "Suvarnabhumi", "Phuket", "Koh Samui", "Chiang Mai"], footerContact: ["Concierge", "WhatsApp", "LINE"], footerLegal: ["Terms", "Privacy", "Rental policy"], footerCopyright: "© 2026 PROM DRIVE · Design concept content",
  },
  zh: {
    nav: ["车队", "尊享体验", "服务流程", "联系我们"], concierge: "专属礼宾",
    heroEyebrow: "私享车库 · 曼谷", heroTitle: ["臻致座驾", "非凡旅程"], heroBody: "五星级用车体验，从首次咨询到车辆归还，全程由专属礼宾团队照料。",
    check: "查询可用车辆", explore: "浏览车队", meta: ["100% 自营车队", "15分钟确认", "专车送达"], scroll: "向下探索",
    live: "在线礼宾服务", find: "寻找您的座驾", pickup: "取车日期", return: "还车日期", delivery: "交付地点", dates: ["2026年10月12日", "2026年10月14日"], places: ["曼谷", "素万那普机场", "廊曼机场", "送车至酒店"], viewAvailable: "查看12辆可用车辆",
    statementEyebrow: "自营 · 精选 · 悉心养护", statementTitle: ["不止是租车", "更是全程无忧的旅程"], statementBody: "每一辆车均由我们直接拥有并悉心维护。没有中间商，也不会把您的服务体验转交给第三方。", stats: ["自营车队", "专属礼宾", "交付区域"],
    reserve: "私享车库", choose: "选择属于您的风格", chooseBody: "根据场合与出行方式选择座驾，而不只是追随品牌标志。", filters: ["全部", "跑车", "超级跑车", "超豪华"], available: "可预订", perDay: "/天", viewCar: "查看车辆", carNotes: ["为重要夜晚准备的顶级后排舒适体验。", "从容易驾、性能澎湃的豪华旅行座驾。", "兼顾城市驾驶与动感体验的均衡之选。"],
    processEyebrow: "从容简单的服务流程", processTitle: "三个步骤，轻松启程", processBody: "专属礼宾全程协助，无需填写冗长表格。", processHeads: ["选择", "核验", "交付"], processNotes: ["选择适合场合与行程的座驾。", "通过专属礼宾完成身份核验，通常仅需15分钟。", "按约定时间在家中、酒店或机场接收车辆。"],
    contactEyebrow: "您的旅程，从这里开始", contactTitle: ["只需一次沟通", "其余交给我们"], line: "LINE 礼宾服务", call: "立即致电", hours: "每日服务 · 08:00–24:00", demo: "页面中的车辆与价格均为概念演示信息。",
    footerIntro: "尊享豪华与高性能座驾，由专属礼宾从选车到还车全程为您安排。", footerHeads: ["车队系列", "服务项目", "服务地区"], footerRent: ["超级跑车", "超豪华座驾", "运动跑车", "礼宾专车"], footerServices: ["自驾服务", "专属司机", "机场交付", "婚礼与活动"], footerPlaces: ["曼谷", "素万那普", "普吉岛", "苏梅岛", "清迈"], footerContact: ["专属礼宾", "WhatsApp", "LINE"], footerLegal: ["服务条款", "隐私政策", "租赁政策"], footerCopyright: "© 2026 PROM DRIVE · 设计概念内容",
  },
} as const;

const filterValues = ["All", "Sports", "Supercar", "Ultra-Luxury", "SUV"] as const;
const fleetCopy = {
  th: { filters: ["ทั้งหมด", "สปอร์ต", "ซูเปอร์คาร์", "อัลตร้าลักชัวรี", "SUV"], browse: "ชมรถทั้งหมด", count: "รุ่นในคอลเลกชัน", note: "คอลเลกชันตัวอย่างพร้อมภาพประกอบรุ่นรถ ราคาและคิวว่างยังไม่ได้เชื่อมกับระบบของร้าน", quote: "สอบถามราคาและคิวว่าง", detail: "ข้อมูลรุ่นรถ", close: "ปิด", credit: "เครดิตภาพ", dateError: "กรุณาเลือกวันคืนรถหลังวันรับรถ", dateSummary: "ช่วงวันที่เลือก", dateNote: "วันที่นี้ใช้สำหรับเตรียมสอบถามเท่านั้น ยังไม่ใช่ผลยืนยันรถว่าง" },
  en: { filters: ["All", "Sports", "Supercar", "Ultra-Luxury", "SUV"], browse: "Browse the collection", count: "models in the collection", note: "Illustrative model collection. Live pricing and availability are not connected to the rental operator yet.", quote: "Pricing & availability on request", detail: "Model information", close: "Close", credit: "Photo credit", dateError: "Please choose a return date after the pick-up date.", dateSummary: "Selected dates", dateNote: "These dates prepare your enquiry only; vehicle availability has not been confirmed." },
  zh: { filters: ["全部", "跑车", "超级跑车", "超豪华", "SUV"], browse: "浏览全部车型", count: "款精选车型", note: "此处为车型展示及示意照片，尚未接入租车公司的实时价格与车辆档期。", quote: "价格与档期请咨询", detail: "车型信息", close: "关闭", credit: "图片来源", dateError: "请选择晚于取车日期的还车日期。", dateSummary: "所选日期", dateNote: "所选日期仅用于准备咨询，不代表车辆档期已确认。" },
} as const;

export function LuxurySite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [language, setLanguage] = useState<Language>("th");
  const [rentalQuery, setRentalQuery] = useState<RentalQuery | null>(null);
  const t = copy[language];
  const ft = fleetCopy[language];
  const matchingCars = useMemo(() => rentalQuery ? fleet.filter((car) => matchesRental(car, rentalQuery)) : fleet, [rentalQuery]);
  const filteredCars = useMemo(() => activeFilter === "All" ? matchingCars : matchingCars.filter((car) => car.category === activeFilter), [activeFilter, matchingCars]);
  const resetSearch = () => { setRentalQuery(null); setActiveFilter("All"); };

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hans" : language;
  }, [language]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 901px)");
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
        <a className="brand" href="#top" aria-label="PROM DRIVE home">
          <img className="brand-logo" src="/prom-drive-logo.png" alt="PROM DRIVE" width={56} height={56} />
          <span className="brand-copy"><b>PROM DRIVE</b><small>CAR RENTAL</small></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#fleet">{t.nav[0]}</a><a href="#experience">{t.nav[1]}</a><a href="#process">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a>
        </nav>
        <div className="header-actions">
          <div className="language-switch" aria-label="เลือกภาษา / Select language / 选择语言">
            {languages.map((item) => <button type="button" key={item.code} className={language === item.code ? "active" : ""} aria-label={item.name} lang={item.code} aria-pressed={language === item.code} onClick={() => setLanguage(item.code)}><img className="language-flag" src={item.flag} width={22} height={16} alt="" />{item.label}</button>)}
          </div>
          <a className="header-call" href="tel:+6620000000"><Phone size={15} aria-hidden="true" /><span>{t.concierge}</span></a>
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
            <a href="#fleet" onClick={() => setMenuOpen(false)}>{t.nav[0]}</a><a href="#experience" onClick={() => setMenuOpen(false)}>{t.nav[1]}</a><a href="#process" onClick={() => setMenuOpen(false)}>{t.nav[2]}</a><a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav[3]}</a>
          </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" role="img" aria-label="Unbranded pearl-silver luxury grand tourer revealed in a dark studio" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">{t.heroEyebrow}</p>
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
          <div className="concierge-actions"><a className="button button-gold btn-77" href="https://line.me" target="_blank" rel="noreferrer"><MessageCircle size={17} />{t.line}</a><a className="button button-outline" href="tel:+6620000000"><Phone size={17} />{t.call}</a><p>{t.hours}</p></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-about">
            <a className="brand footer-brand" href="#top"><img className="brand-logo" src="/prom-drive-logo.png" alt="PROM DRIVE" width={56} height={56} /><span className="brand-copy"><b>PROM DRIVE</b><small>CAR RENTAL</small></span></a>
            <p>{t.footerIntro}</p>
            <div className="footer-contact-list"><span>{t.footerContact[0]} <b>+66 2 000 0000</b></span><span>{t.footerContact[1]} <b>+66 8 0000 0000</b></span><span>{t.footerContact[2]} <b>{language === "th" ? "รอยืนยันบัญชี" : language === "zh" ? "账号待确认" : "Account pending"}</b></span></div>
            <div className="social-row" aria-label="Social channels"><a href="#contact">IG</a><a href="#contact">WA</a><a href="#contact">LI</a></div>
          </div>
          <FooterColumn title={t.footerHeads[0]} items={t.footerRent} />
          <FooterColumn title={t.footerHeads[1]} items={t.footerServices} />
          <FooterColumn title={t.footerHeads[2]} items={t.footerPlaces} />
        </div>
        <div className="footer-bottom"><p>{t.footerCopyright}</p><nav aria-label="Legal"><a href="#contact">{t.footerLegal[0]}</a><a href="#contact">{t.footerLegal[1]}</a><a href="#contact">{t.footerLegal[2]}</a></nav></div>
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
  return <div className="footer-column"><p data-heading="h3">{title}</p><nav>{items.map((item) => <a href="#contact" key={item}>{item}</a>)}</nav></div>;
}

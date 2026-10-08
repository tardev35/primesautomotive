"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Gauge, MapPin, Menu, MessageCircle, Phone, ShieldCheck, Sparkles, X } from "lucide-react";

const cars = [
  { name: "Velarion GT", category: "Ultra-Luxury", usage: "Chauffeur", price: "฿38,000", power: "612 hp", sprint: "3.8 sec", note: "Rear-cabin comfort, refined for long evenings." },
  { name: "Nocturne S", category: "Supercar", usage: "Self-Drive", price: "฿45,000", power: "710 hp", sprint: "2.9 sec", note: "A dramatic grand tourer with effortless pace." },
  { name: "Aether Sport", category: "Sports", usage: "Event", price: "฿28,000", power: "503 hp", sprint: "3.6 sec", note: "Balanced performance for city and coastal roads." },
];

type Language = "th" | "en" | "zh";

const languages: Array<{ code: Language; label: string }> = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
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
  },
  en: {
    nav: ["Fleet", "Experience", "How it works", "Contact"], concierge: "Concierge",
    heroEyebrow: "THE PRIVATE COLLECTION · BANGKOK", heroTitle: ["THE FINEST", "JOURNEY"], heroBody: "A five-star motoring experience, from your first message until the car is returned.",
    check: "Check availability", explore: "Explore the collection", meta: ["100% owned fleet", "15-minute confirmation", "Delivered to you"], scroll: "Scroll to discover",
    live: "Live concierge", find: "Find your car", pickup: "Pick-up date", return: "Return date", delivery: "Delivery location", dates: ["12 Oct 2026", "14 Oct 2026"], places: ["Bangkok", "Suvarnabhumi Airport", "Don Mueang Airport", "Hotel delivery"], viewAvailable: "View 12 available cars",
    statementEyebrow: "OWNED · CURATED · IMPECCABLY KEPT", statementTitle: ["More than a rental", "A journey cared for from end to end"], statementBody: "Every vehicle is owned and cared for directly by us. No brokers, and no hand-off of your experience to another provider.", stats: ["Owned fleet", "Private concierge", "Delivery zones"],
    reserve: "THE RESERVE", choose: "Choose your presence", chooseBody: "Choose for the occasion and the way you want to travel—not simply for the badge.", filters: ["All", "Sports", "Supercar", "Ultra-Luxury"], available: "Available", perDay: "/day", viewCar: "View this car", carNotes: cars.map((car) => car.note),
    processEyebrow: "EFFORTLESS BY DESIGN", processTitle: "Three quiet steps", processBody: "A dedicated concierge guides every step—no long forms required.", processHeads: ["Select", "Verify", "Receive"], processNotes: ["Choose the car that suits your occasion and journey.", "Verify your identity with your concierge, usually within 15 minutes.", "Receive the car at your home, hotel or airport at the agreed time."],
    contactEyebrow: "YOUR JOURNEY BEGINS HERE", contactTitle: ["One conversation", "Everything arranged"], line: "LINE Concierge", call: "Call now", hours: "Available daily · 08:00–24:00 ICT", demo: "Concept fleet and pricing shown for demonstration.",
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
  },
} as const;

const filterValues = ["All", "Sports", "Supercar", "Ultra-Luxury"];

export function LuxurySite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [language, setLanguage] = useState<Language>("th");
  const t = copy[language];
  const filteredCars = useMemo(() => activeFilter === "All" ? cars : cars.filter((car) => car.category === activeFilter), [activeFilter]);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hans" : language;
  }, [language]);

  return (
    <div className="site-shell">
      <div className="film-grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Aurelia Reserve home">
          <span className="brand-mark">AR</span>
          <span className="brand-copy"><b>AURELIA</b><small>PRIVATE MOTOR RESERVE</small></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#fleet">{t.nav[0]}</a><a href="#experience">{t.nav[1]}</a><a href="#process">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a>
        </nav>
        <div className="header-actions">
          <div className="language-switch" aria-label="เลือกภาษา / Select language / 选择语言">
            {languages.map((item) => <button type="button" key={item.code} className={language === item.code ? "active" : ""} aria-pressed={language === item.code} onClick={() => setLanguage(item.code)}>{item.label}</button>)}
          </div>
          <a className="header-call" href="tel:+6620000000"><Phone size={15} aria-hidden="true" /><span>{t.concierge}</span></a>
        </div>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">
            <div className="mobile-language-switch">{languages.map((item) => <button type="button" key={item.code} className={language === item.code ? "active" : ""} onClick={() => setLanguage(item.code)}>{item.label}</button>)}</div>
            <a href="#fleet" onClick={() => setMenuOpen(false)}>{t.nav[0]}</a><a href="#experience" onClick={() => setMenuOpen(false)}>{t.nav[1]}</a><a href="#process" onClick={() => setMenuOpen(false)}>{t.nav[2]}</a><a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav[3]}</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" role="img" aria-label="Unbranded pearl-silver luxury grand tourer revealed in a dark studio" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">{t.heroEyebrow}</p>
            <h1 id="hero-title" className={`hero-title hero-title-${language}`}>{t.heroTitle[0]}<span>{t.heroTitle[1]}</span></h1>
            <p className="hero-thai">{t.heroBody}</p>
            <div className="hero-actions"><a className="button button-gold" href="#availability">{t.check}</a><a className="text-link" href="#fleet">{t.explore}</a></div>
          </div>
          <div className="hero-meta" aria-label="Service highlights">
            <span><ShieldCheck size={16} />{t.meta[0]}</span><span><Clock3 size={16} />{t.meta[1]}</span><span><MapPin size={16} />{t.meta[2]}</span>
          </div>
          <a className="scroll-cue" href="#availability" aria-label="Scroll to availability"><span>{t.scroll}</span><ChevronDown size={16} /></a>
        </section>

        <section className="availability-wrap" id="availability" aria-label="Check vehicle availability">
          <div className="availability-bar">
            <div className="availability-intro"><span className="gold-dot" /><div><small>{t.live}</small><strong>{t.find}</strong></div></div>
            <button className="booking-field" type="button"><span><CalendarDays size={15} />{t.pickup}</span><strong>{t.dates[0]}</strong></button>
            <button className="booking-field" type="button"><span><CalendarDays size={15} />{t.return}</span><strong>{t.dates[1]}</strong></button>
            <label className="booking-field booking-field-location"><span><MapPin size={15} />{t.delivery}</span><select key={language} defaultValue={t.places[0]}>{t.places.map((place) => <option key={place}>{place}</option>)}</select></label>
            <button className="availability-submit" type="button">{t.viewAvailable}</button>
          </div>
        </section>

        <section className="statement section-pad" id="experience">
          <p className="eyebrow">{t.statementEyebrow}</p>
          <div className="statement-grid">
            <h2 className={`statement-title statement-title-${language}`}>{t.statementTitle[0]}<span>{t.statementTitle[1]}</span></h2>
            <div className="statement-copy"><p>{t.statementBody}</p><div className="stats"><div><strong>100%</strong><span>{t.stats[0]}</span></div><div><strong>24/7</strong><span>{t.stats[1]}</span></div><div><strong>3</strong><span>{t.stats[2]}</span></div></div></div>
          </div>
        </section>

        <section className="fleet-section section-pad" id="fleet">
          <div className="section-heading"><div><p className="eyebrow">{t.reserve}</p><h2>{t.choose}</h2></div><p>{t.chooseBody}</p></div>
          <div className="filter-row" aria-label="Filter the collection">
            {filterValues.map((filter, index) => <button type="button" key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>{t.filters[index]}</button>)}
          </div>
          <div className="fleet-grid">
            {filteredCars.map((car, index) => (
              <article className="car-card" key={car.name}>
                <div className={`car-visual car-visual-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span><div className="car-line" aria-hidden="true" /></div>
                <div className="car-card-content">
                  <div className="car-title-row"><div><small>{car.category} · {car.usage}</small><h3>{car.name}</h3></div><span className="status"><i />{t.available}</span></div>
                  <p>{t.carNotes[cars.indexOf(car)]}</p><div className="spec-row"><span><Gauge size={15} />{car.power}</span><span>0–100 · {car.sprint}</span><strong>{car.price}<small>{t.perDay}</small></strong></div>
                  <a href="#contact">{t.viewCar} <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="process-section section-pad" id="process">
          <div className="section-heading"><div><p className="eyebrow">{t.processEyebrow}</p><h2>{t.processTitle}</h2></div><p>{t.processBody}</p></div>
          <div className="process-grid">
            <article><span>01</span><Sparkles size={24} /><h3>{t.processHeads[0]}</h3><p>{t.processNotes[0]}</p></article>
            <article><span>02</span><ShieldCheck size={24} /><h3>{t.processHeads[1]}</h3><p>{t.processNotes[1]}</p></article>
            <article><span>03</span><MapPin size={24} /><h3>{t.processHeads[2]}</h3><p>{t.processNotes[2]}</p></article>
          </div>
        </section>

        <section className="concierge-section" id="contact">
          <div><p className="eyebrow">{t.contactEyebrow}</p><h2>{t.contactTitle[0]}<br />{t.contactTitle[1]}</h2></div>
          <div className="concierge-actions"><a className="button button-gold" href="https://line.me" target="_blank" rel="noreferrer"><MessageCircle size={17} />{t.line}</a><a className="button button-outline" href="tel:+6620000000"><Phone size={17} />{t.call}</a><p>{t.hours}</p></div>
        </section>
      </main>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">AR</span><span className="brand-copy"><b>AURELIA</b><small>PRIVATE MOTOR RESERVE</small></span></a><p>Bangkok · Thailand</p><p>{t.demo}</p></footer>
    </div>
  );
}

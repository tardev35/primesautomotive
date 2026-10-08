"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Gauge, MapPin, Menu, MessageCircle, Phone, ShieldCheck, Sparkles, X } from "lucide-react";

const cars = [
  { name: "Velarion GT", category: "Ultra-Luxury", usage: "Chauffeur", price: "฿38,000", power: "612 hp", sprint: "3.8 sec", note: "Rear-cabin comfort, refined for long evenings." },
  { name: "Nocturne S", category: "Supercar", usage: "Self-Drive", price: "฿45,000", power: "710 hp", sprint: "2.9 sec", note: "A dramatic grand tourer with effortless pace." },
  { name: "Aether Sport", category: "Sports", usage: "Event", price: "฿28,000", power: "503 hp", sprint: "3.6 sec", note: "Balanced performance for city and coastal roads." },
];

const filters = ["All", "Sports", "Supercar", "Ultra-Luxury"];

export function LuxurySite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredCars = useMemo(() => activeFilter === "All" ? cars : cars.filter((car) => car.category === activeFilter), [activeFilter]);

  return (
    <div className="site-shell">
      <div className="film-grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Aurelia Reserve home">
          <span className="brand-mark">AR</span>
          <span className="brand-copy"><b>AURELIA</b><small>PRIVATE MOTOR RESERVE</small></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#fleet">Fleet</a><a href="#experience">Experience</a><a href="#process">How it works</a><a href="#contact">Contact</a>
        </nav>
        <a className="header-call" href="tel:+6620000000"><Phone size={15} aria-hidden="true" /><span>Concierge</span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">
            <a href="#fleet" onClick={() => setMenuOpen(false)}>Fleet</a><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a><a href="#process" onClick={() => setMenuOpen(false)}>How it works</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" role="img" aria-label="Unbranded pearl-silver luxury grand tourer revealed in a dark studio" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">THE PRIVATE COLLECTION · BANGKOK</p>
            <h1 id="hero-title">THE FINEST<span>JOURNEY</span></h1>
            <p className="hero-thai">ประสบการณ์รถระดับห้าดาว ตั้งแต่ข้อความแรก<br className="desktop-break" />จนถึงวินาทีที่เรารับรถคืน</p>
            <div className="hero-actions"><a className="button button-gold" href="#availability">Check availability</a><a className="text-link" href="#fleet">Explore the collection</a></div>
          </div>
          <div className="hero-meta" aria-label="Service highlights">
            <span><ShieldCheck size={16} />100% owned fleet</span><span><Clock3 size={16} />15-min confirmation</span><span><MapPin size={16} />Delivered to you</span>
          </div>
          <a className="scroll-cue" href="#availability" aria-label="Scroll to availability"><span>SCROLL TO DISCOVER</span><ChevronDown size={16} /></a>
        </section>

        <section className="availability-wrap" id="availability" aria-label="Check vehicle availability">
          <div className="availability-bar">
            <div className="availability-intro"><span className="gold-dot" /><div><small>LIVE CONCIERGE</small><strong>Find your car</strong></div></div>
            <label><span><CalendarDays size={15} /> Pick-up</span><input type="date" defaultValue="2026-10-12" /></label>
            <label><span><CalendarDays size={15} /> Return</span><input type="date" defaultValue="2026-10-14" /></label>
            <label><span><MapPin size={15} /> Delivery</span><select defaultValue="Bangkok"><option>Bangkok</option><option>Suvarnabhumi Airport</option><option>Don Mueang Airport</option><option>Hotel delivery</option></select></label>
            <button className="availability-submit" type="button">View 12 available cars</button>
          </div>
        </section>

        <section className="statement section-pad" id="experience">
          <p className="eyebrow">OWNED. CURATED. IMPECCABLY KEPT.</p>
          <div className="statement-grid">
            <h2>ไม่ใช่แค่รถเช่า<br />แต่คือการเดินทาง<br />ที่ถูกดูแลทั้งหมด</h2>
            <div className="statement-copy"><p>รถทุกคันในคอลเลกชันอยู่ภายใต้การดูแลของเราโดยตรง ไม่มีนายหน้า ไม่มีการส่งต่อประสบการณ์ให้บุคคลอื่น</p><div className="stats"><div><strong>100%</strong><span>Owned fleet</span></div><div><strong>24/7</strong><span>Private concierge</span></div><div><strong>3</strong><span>Delivery zones</span></div></div></div>
          </div>
        </section>

        <section className="fleet-section section-pad" id="fleet">
          <div className="section-heading"><div><p className="eyebrow">THE RESERVE</p><h2>Choose your presence.</h2></div><p>เลือกตามอารมณ์การเดินทาง ไม่ใช่เพียงตามตราสัญลักษณ์</p></div>
          <div className="filter-row" aria-label="Filter the collection">
            {filters.map((filter) => <button type="button" key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
          </div>
          <div className="fleet-grid">
            {filteredCars.map((car, index) => (
              <article className="car-card" key={car.name}>
                <div className={`car-visual car-visual-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span><div className="car-line" aria-hidden="true" /></div>
                <div className="car-card-content">
                  <div className="car-title-row"><div><small>{car.category} · {car.usage}</small><h3>{car.name}</h3></div><span className="status"><i />Available</span></div>
                  <p>{car.note}</p><div className="spec-row"><span><Gauge size={15} />{car.power}</span><span>0–100 · {car.sprint}</span><strong>{car.price}<small>/day</small></strong></div>
                  <a href="#contact">View this car <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="process-section section-pad" id="process">
          <div className="section-heading"><div><p className="eyebrow">EFFORTLESS BY DESIGN</p><h2>Three quiet steps.</h2></div><p>ทุกขั้นตอนมีเจ้าหน้าที่ดูแล โดยไม่ต้องกรอกฟอร์มยาว</p></div>
          <div className="process-grid">
            <article><span>01</span><Sparkles size={24} /><h3>Select</h3><p>เลือกคันที่เข้ากับวาระและรูปแบบการเดินทาง</p></article>
            <article><span>02</span><ShieldCheck size={24} /><h3>Verify</h3><p>ยืนยันตัวตนกับ Concierge โดยปกติภายใน 15 นาที</p></article>
            <article><span>03</span><MapPin size={24} /><h3>Receive</h3><p>รับรถที่บ้าน โรงแรม หรือสนามบินตามเวลาที่นัดหมาย</p></article>
          </div>
        </section>

        <section className="concierge-section" id="contact">
          <div><p className="eyebrow">YOUR JOURNEY BEGINS HERE</p><h2>One conversation.<br />Everything arranged.</h2></div>
          <div className="concierge-actions"><a className="button button-gold" href="https://line.me" target="_blank" rel="noreferrer"><MessageCircle size={17} />LINE Concierge</a><a className="button button-outline" href="tel:+6620000000"><Phone size={17} />Call now</a><p>Available daily · 08:00–24:00 ICT</p></div>
        </section>
      </main>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">AR</span><span className="brand-copy"><b>AURELIA</b><small>PRIVATE MOTOR RESERVE</small></span></a><p>Bangkok · Thailand</p><p>Concept fleet and pricing shown for demonstration.</p></footer>
    </div>
  );
}

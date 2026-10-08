"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Clock3, MapPin, SlidersHorizontal, Users, Gauge, Info, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { categories, locations, locale, localized, money, queryError, rentalDays, rentalAmount, type Language, type RentalQuery, type Vehicle } from "@/lib/fleet";

const words = {
  th: {
    eyebrow: "วางแผนการเดินทาง", title: "รถที่ใช่ ในวันที่คุณเลือก", intro: "เลือกช่วงเวลาและรูปแบบการเดินทาง แล้วค้นหารถที่เหมาะกับคุณ", demo: "โหมดตัวอย่าง", pickup: "วันรับรถ", returnAt: "วันคืนรถ", pickupTime: "เวลารับรถ", returnTime: "เวลาคืนรถ", place: "สถานที่รับรถ", category: "ประเภทรถ", service: "รูปแบบบริการ", search: "เช็กรถตามวันที่เลือก", places: ["กรุงเทพฯ", "สนามบินสุวรรณภูมิ", "สนามบินดอนเมือง", "โรงแรมในกรุงเทพฯ"], categories: ["ทุกประเภท", "สปอร์ต", "ซูเปอร์คาร์", "อัลตร้าลักชัวรี", "SUV"], services: ["ขับเอง", "พร้อมคนขับ", "งานอีเวนต์"],
    note: "ทดลองค้นหาจากคิวจำลอง ไม่ใช่การยืนยันรถว่างหรือการจองจริง", timeNote: "เวลาประเทศไทย · คิดค่าเช่าทุก 24 ชั่วโมง เศษวันนับเป็น 1 วัน", dates: "กรุณาเลือกวันและเวลาคืนรถหลังรับรถ", past: "กรุณาเลือกวันและเวลารับรถที่ยังไม่ผ่านไป", result: "คันตรงตามเงื่อนไขตัวอย่าง", day: "วัน", reset: "ล้างการค้นหา", viewResults: "ดูรถที่ค้นพบ", resultTitle: "ผลการค้นหาตัวอย่าง", empty: "ไม่พบรถตามเงื่อนไขนี้", emptyBody: "ลองเปลี่ยนวัน สถานที่ หรือรูปแบบบริการ บางรุ่นมีจำนวนวันเช่าขั้นต่ำ", total: "ค่าเช่าประเมิน", from: "ค่าเช่าตัวอย่าง / วัน", excluded: "ไม่รวมมัดจำ ค่าส่ง และค่าใช้จ่ายเพิ่มเติม · ยังไม่ใช่ราคายืนยัน", quote: "สอบถามราคาบริการนี้", specs: "สเปกรถตัวอย่าง", terms: "รายละเอียดการเช่า", seats: "ที่นั่ง", automatic: "อัตโนมัติ", manual: "ธรรมดา", power: "กำลัง (PS)", accel: "0–100 กม./ชม.", speed: "ความเร็วสูงสุด", doors: "ประตู", fuel: "พลังงาน", year: "ปีรุ่น", pending: "รอยืนยัน", sample: "ข้อมูลจำลอง · รอยืนยันรถจริง", maintenance: "ซ่อมบำรุง (ตัวอย่าง)", detail: "รายละเอียดและค่าเช่า", close: "ปิดรายละเอียด", deposit: "มัดจำตัวอย่าง", minimum: "เช่าขั้นต่ำ", mileage: "ระยะทางรวมต่อวัน", extra: "ระยะทางส่วนเกิน", km: "กม.", sec: "วินาที", perKm: "/กม.", highlights: "จุดเด่น", credit: "เครดิตภาพประกอบรุ่นรถ", enquire: "ติดต่อคอนเซียร์จ", specNote: "สเปก ราคา และเงื่อนไขนี้ใช้วางโครงสร้าง CMS เท่านั้น รูปเป็นภาพประกอบรุ่นรถ ไม่ใช่รถเช่าจริง ต้องตรวจสอบรุ่นปีและอุปกรณ์ของรถแต่ละคันก่อนเผยแพร่ใช้งานจริง", petroleum: "เบนซิน", hybrid: "ปลั๊กอินไฮบริด", mild: "ไมลด์ไฮบริด", electric: "ไฟฟ้า", clearHint: "กลับไปดูคอลเลกชันทั้งหมด", searchAgain: "เปลี่ยนเงื่อนไข", noFilter: "ไม่มีรถในประเภทนี้ตามเงื่อนไขที่เลือก",
  },
  en: {
    eyebrow: "PLAN YOUR JOURNEY", title: "The right car. Your dates.", intro: "Choose your dates and travel style to find your next drive.", demo: "Demo mode", pickup: "Pick-up date", returnAt: "Return date", pickupTime: "Pick-up time", returnTime: "Return time", place: "Pick-up location", category: "Car category", service: "Service", search: "Check selected dates", places: ["Bangkok", "Suvarnabhumi Airport", "Don Mueang Airport", "Hotel in Bangkok"], categories: ["All categories", "Sports", "Supercar", "Ultra-Luxury", "SUV"], services: ["Self-drive", "With chauffeur", "Event use"],
    note: "Search a simulated schedule. This does not confirm availability or make a booking.", timeNote: "Thailand time · Each started 24-hour period counts as one rental day", dates: "Choose a return date and time after pick-up.", past: "Choose a pick-up date and time in the future.", result: "cars match the demo criteria", day: "days", reset: "Clear search", viewResults: "View matching cars", resultTitle: "Demo search results", empty: "No cars match these criteria", emptyBody: "Try other dates, a different location or service. Some cars have a minimum rental period.", total: "Estimated rental", from: "Sample daily rate", excluded: "Excludes deposit, delivery and extras · Not a confirmed quote", quote: "Service price on request", specs: "Sample specifications", terms: "Rental details", seats: "seats", automatic: "Automatic", manual: "Manual", power: "Power (PS)", accel: "0–100 km/h", speed: "Top speed", doors: "Doors", fuel: "Energy", year: "Model year", pending: "To be confirmed", sample: "Demo data · Vehicle confirmation required", maintenance: "Maintenance (demo)", detail: "Details & rental", close: "Close details", deposit: "Sample deposit", minimum: "Minimum rental", mileage: "Included distance / day", extra: "Excess distance", km: "km", sec: "seconds", perKm: "/km", highlights: "Highlights", credit: "Illustrative model photo credit", enquire: "Contact concierge", specNote: "Specifications, rates and terms are CMS sample data only. Photos illustrate the model, not an actual rental vehicle. Verify each vehicle's model year and equipment before going live.", petroleum: "Petrol", hybrid: "Plug-in hybrid", mild: "Mild hybrid", electric: "Electric", clearHint: "Return to the full collection", searchAgain: "Change criteria", noFilter: "No cars in this category match the selected criteria",
  },
  zh: {
    eyebrow: "规划您的旅程", title: "心仪座驾，按期出发", intro: "选择用车时间与服务方式，寻找适合您的座驾。", demo: "演示模式", pickup: "取车日期", returnAt: "还车日期", pickupTime: "取车时间", returnTime: "还车时间", place: "取车地点", category: "车辆类别", service: "服务方式", search: "查询所选日期", places: ["曼谷", "素万那普机场", "廊曼机场", "曼谷市内酒店"], categories: ["全部类别", "跑车", "超级跑车", "超豪华", "SUV"], services: ["自驾", "专属司机", "活动用车"],
    note: "查询使用模拟档期，不代表实际可用车辆，也不会创建预订。", timeNote: "泰国时间 · 每24小时为一天，不足24小时按一天计费", dates: "还车时间须晚于取车时间。", past: "请选择尚未到来的取车日期和时间。", result: "辆车符合演示条件", day: "天", reset: "清除查询", viewResults: "查看匹配车辆", resultTitle: "演示查询结果", empty: "暂无符合条件的车辆", emptyBody: "请尝试其他日期、地点或服务方式，部分车型设有最低租期。", total: "预计租金", from: "示例日租金", excluded: "不含押金、配送及附加费用 · 并非确认报价", quote: "此服务须单独报价", specs: "示例车辆参数", terms: "租赁详情", seats: "座", automatic: "自动挡", manual: "手动挡", power: "功率（PS）", accel: "0–100公里/小时", speed: "最高车速", doors: "车门", fuel: "能源类型", year: "车型年份", pending: "待确认", sample: "演示数据 · 须确认实际车辆", maintenance: "维护中（示例）", detail: "车辆与租赁详情", close: "关闭详情", deposit: "示例押金", minimum: "最低租期", mileage: "每日含里程", extra: "超里程费用", km: "公里", sec: "秒", perKm: "/公里", highlights: "车辆亮点", credit: "车型示意图片来源", enquire: "联系礼宾", specNote: "配置、价格及条款仅为CMS示例数据。图片用于展示车型，并非实际出租车辆。正式上线前须核实每辆车的年份及配置。", petroleum: "汽油", hybrid: "插电式混合动力", mild: "轻度混合动力", electric: "纯电动", clearHint: "返回全部车型", searchAgain: "修改条件", noFilter: "该类别暂无符合所选条件的车辆",
  },
} as const;
const serviceValues = ["self-drive", "chauffeur", "event"];

export function AvailabilitySearch({ language, query, count, onSearch, onReset }: { language: Language; query: RentalQuery | null; count: number; onSearch: (query: RentalQuery) => void; onReset: () => void }) {
  const w = words[language];
  const [location, setLocation] = useState("bangkok");
  const [category, setCategory] = useState("All");
  const [service, setService] = useState("self-drive");
  const [error, setError] = useState<"dates" | "past" | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (query) { resultsRef.current?.focus({ preventScroll: true }); return; }
    formRef.current?.reset(); setLocation("bangkok"); setCategory("All"); setService("self-drive"); setPickupDate(""); setError(null); setDirty(false);
  }, [query]);
  function markDirty() { setDirty(true); setError(null); }
  return <section id="availability" className="rental-search" aria-labelledby="rental-search-title">
    <div className="rental-search-heading"><div><p className="eyebrow">{w.eyebrow}</p><h2 id="rental-search-title">{w.title}</h2><p>{w.intro}</p></div><span className="demo-label"><Info size={14} aria-hidden="true" />{w.demo}</span></div>
    <form ref={formRef} className="rental-search-form" onInput={markDirty} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const next = { pickup: `${data.get("pickupDate")}T${data.get("pickupTime")}:00+07:00`, returnAt: `${data.get("returnDate")}T${data.get("returnTime")}:00+07:00`, location, category, service };
      const invalid = queryError(next);
      setError(invalid);
      if (invalid) return;
      setDirty(false); onSearch(next);
    }}>
      <fieldset className="rental-field"><legend><CalendarDays size={16} />{w.pickup}</legend><div className="date-time-pair"><input aria-label={w.pickup} name="pickupDate" type="date" required onInput={(e) => setPickupDate(e.currentTarget.value)} aria-describedby={error ? "rental-error" : undefined} /><input aria-label={w.pickupTime} name="pickupTime" type="time" required defaultValue="10:00" /></div></fieldset>
      <fieldset className="rental-field"><legend><CalendarDays size={16} />{w.returnAt}</legend><div className="date-time-pair"><input aria-label={w.returnAt} name="returnDate" type="date" required min={pickupDate || undefined} aria-invalid={!!error} aria-describedby={error ? "rental-error" : undefined} /><input aria-label={w.returnTime} name="returnTime" type="time" required defaultValue="10:00" /></div></fieldset>
      <SearchSelect label={w.place} icon={<MapPin size={16} />} value={location} values={locations} labels={w.places} onChange={(v) => { setLocation(v); markDirty(); }} />
      <SearchSelect label={w.category} icon={<SlidersHorizontal size={16} />} value={category} values={categories} labels={w.categories} onChange={(v) => { setCategory(v); markDirty(); }} />
      <SearchSelect label={w.service} icon={<Users size={16} />} value={service} values={serviceValues} labels={w.services} onChange={(v) => { setService(v); markDirty(); }} />
      <div className="rental-search-action"><button className="btn-77" type="submit"><Search size={17} aria-hidden="true" />{w.search}</button><span><Clock3 size={13} aria-hidden="true" />{w.timeNote}</span></div>
    </form>
    {error && <p className="rental-error" id="rental-error" role="alert">{w[error]}</p>}
    <p className="rental-demo-note"><Info size={16} aria-hidden="true" />{w.note}</p>
    <div ref={resultsRef} id="rental-results" tabIndex={-1} aria-live="polite" className={query ? "rental-results" : "rental-results-hidden"}>
      {query && <><div><span className="result-eyebrow">{w.resultTitle}</span><strong>{count} {w.result}</strong><p>{formatQuery(query, language)} · {rentalDays(query)} {w.day}</p>{dirty && <p className="rental-dirty">{language === "th" ? "เปลี่ยนเงื่อนไขแล้ว กรุณากดเช็กรถอีกครั้งเพื่ออัปเดตผล" : language === "zh" ? "条件已更改，请重新查询以更新结果。" : "Criteria changed. Run the search again to update results."}</p>}</div><div className="rental-result-actions"><a href="#fleet" className="button button-outline">{w.viewResults}</a><button type="button" onClick={() => { onReset(); setDirty(false); }} className="rental-reset">{w.reset}</button></div></>}
    </div>
  </section>;
}

function SearchSelect({ label, icon, value, values, labels, onChange }: { label: string; icon: React.ReactNode; value: string; values: readonly string[]; labels: readonly string[]; onChange: (value: string) => void }) {
  return <div className="rental-field"><span className="rental-field-label">{icon}{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger className="rental-select" aria-label={label}><SelectValue /></SelectTrigger><SelectContent className="booking-options" position="popper">{values.map((v, i) => <SelectItem value={v} key={v}>{labels[i]}</SelectItem>)}</SelectContent></Select></div>;
}

export function formatQuery(query: RentalQuery, language: Language) {
  const fmt = new Intl.DateTimeFormat(locale(language), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });
  return `${fmt.format(new Date(query.pickup))} – ${fmt.format(new Date(query.returnAt))} · ${words[language].places[locations.indexOf(query.location as typeof locations[number])]}`;
}

export function FleetResultNote({ query, language, count, onReset }: { query: RentalQuery; language: Language; count: number; onReset: () => void }) {
  const w = words[language];
  return <div className="fleet-result-note"><div><span className="demo-label">{w.resultTitle}</span><p>{formatQuery(query, language)} · {rentalDays(query)} {w.day} · {w.services[serviceValues.indexOf(query.service)]}</p>{count === 0 && <><h3>{w.empty}</h3><p>{w.emptyBody}</p></>}</div><div><a className="text-link" href="#availability">{w.searchAgain}</a><button type="button" className="rental-reset" onClick={onReset}>{w.reset}</button></div></div>;
}

export function VehicleCard({ car, language, query }: { car: Vehicle; language: Language; query: RentalQuery | null }) {
  const w = words[language];
  const amount = rentalAmount(car, query);
  const fuelLabel = ({ petrol: w.petroleum, "plug-in-hybrid": w.hybrid, "mild-hybrid": w.mild, electric: w.electric, unconfirmed: w.pending } as Record<string, string>)[car.fuel];
  const speedUnit = language === "th" ? "กม./ชม." : language === "zh" ? "公里/小时" : "km/h";
  const specs = [[w.seats, car.seats], [w.doors, car.doors], [w.year, car.model_year ?? w.pending], [w.fuel, fuelLabel], [w.power, car.power_ps ?? w.pending], [w.accel, car.acceleration_seconds ? `${car.acceleration_seconds} ${w.sec}` : w.pending], [w.speed, car.top_speed_kmh ? `${car.top_speed_kmh} ${speedUnit}` : w.pending]];
  return <article className="car-card">
    <div className="car-visual"><img src={car.image} alt={car.name} width={960} height={600} loading="lazy" decoding="async" /></div>
    <div className="car-card-content">
      <div className="car-title-row"><div><small>{w.categories[categories.indexOf(car.category as typeof categories[number])]}</small><h3>{car.name}</h3></div></div>
      <p className="vehicle-summary">{localized(car, "summary", language)}</p>
      <div className="vehicle-quick-specs"><span><Users size={15} />{car.seats} {w.seats}</span><span><Gauge size={15} />{car.power_ps ? `${car.power_ps} PS` : fuelLabel}</span><span>{car.transmission === "manual" ? w.manual : w.automatic}</span></div>
      <div className="vehicle-price"><span>{query ? `${w.total} · ${rentalDays(query)} ${w.day}` : w.from}</span><strong>{amount === null ? w.quote : money(amount, language)}</strong><small>{car.fleet_status === "maintenance" ? w.maintenance : w.sample}</small></div>
      <Dialog><DialogTrigger asChild><button type="button" className="car-detail-button btn-77">{w.detail}</button></DialogTrigger><DialogContent className="car-dialog vehicle-detail-dialog" showCloseButton={false}>
        <DialogClose className="dialog-close">{w.close}</DialogClose>
        <img src={car.image} alt={car.name} width={960} height={600} />
        <span className="demo-label">{w.demo}</span><DialogTitle>{car.name}</DialogTitle><DialogDescription>{localized(car, "summary", language)}</DialogDescription>
        <p className="vehicle-spec-note">{w.specNote}</p>
        <h3>{w.specs}</h3><dl className="vehicle-spec-grid">{specs.map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <h3>{w.highlights}</h3><ul className="vehicle-features">{localized(car, "features", language).split("\n").map((feature) => <li key={feature}>{feature}</li>)}</ul>
        <h3>{w.terms}</h3><dl className="vehicle-spec-grid"><div><dt>{query ? w.total : w.from}</dt><dd>{amount === null ? w.quote : money(amount, language)}</dd></div><div><dt>{w.deposit}</dt><dd>{money(car.deposit_thb, language)}</dd></div><div><dt>{w.minimum}</dt><dd>{car.minimum_days} {w.day}</dd></div><div><dt>{w.mileage}</dt><dd>{car.included_km_per_day} {w.km}</dd></div><div><dt>{w.extra}</dt><dd>{money(car.extra_km_thb, language)}{w.perKm}</dd></div></dl>
        {query && <p className="vehicle-spec-note">{formatQuery(query, language)}</p>}
        <p className="vehicle-spec-note">{w.excluded}</p><p className="vehicle-terms">{localized(car, "rental_terms", language)}</p>
        <DialogClose asChild><a className="btn-77 vehicle-contact" href="#contact">{w.enquire}</a></DialogClose>
        <p className="photo-credit">{w.credit}: <a href={car.source} target="_blank" rel="noreferrer">{car.author}</a> · <a href={car.licenseUrl} target="_blank" rel="noreferrer">{car.license}</a></p>
      </DialogContent></Dialog>
    </div>
  </article>;
}

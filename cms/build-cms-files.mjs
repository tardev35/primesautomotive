// Generate ACF Tools import and draft REST payloads from the same demo data as the UI.
// No WordPress requests are made. Run: node cms/build-cms-files.mjs
import { readFileSync, writeFileSync } from "node:fs";
const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const vehicles = read("../data/vehicle-details.json");
const photos = read("../data/cars.json");
const field = (name, label, type = "text", options = {}) => ({ key: `field_aurelia_${name}`, label, name, type, required: 0, ...options });
const number = (name, label, options = {}) => field(name, label, "number", { min: 0, step: 1, ...options });
const select = (name, label, choices) => field(name, label, "select", { choices, return_format: "value", allow_null: 0 });
const tab = (name, label) => field(name, label, "tab");
const languages = { th: "ไทย", en: "English", zh: "中文" };
const group = {
  key: "group_aurelia_vehicle", title: "Aurelia · ข้อมูลรถ / Vehicle data", active: true, show_in_rest: 1,
  location: [[{ param: "post_type", operator: "==", value: "cars" }]],
  position: "normal", style: "default", label_placement: "top", instruction_placement: "label",
  fields: [
    tab("identity_tab", "01 · ข้อมูลรุ่นรถ"),
    select("data_status", "สถานะการตรวจสอบข้อมูล", { demo: "ข้อมูลจำลอง — ห้ามใช้เป็นราคาหรือสเปกยืนยัน", verified: "ตรวจสอบข้อมูลรถจริงแล้ว" }),
    field("brand", "ยี่ห้อ", "text", { required: 1 }), field("model", "รุ่น", "text", { required: 1 }), field("variant", "รุ่นย่อย"), number("model_year", "ปีรุ่น (ค.ศ.)", { min: 1900, max: 2100, instructions: "เว้นว่างเมื่อยังไม่ทราบ ห้ามใช้ 0" }),
    select("category", "ประเภทรถ", { Sports: "สปอร์ต", Supercar: "ซูเปอร์คาร์", "Ultra-Luxury": "อัลตร้าลักชัวรี", SUV: "SUV" }),
    select("fleet_status", "สถานะการให้บริการ (ไม่ใช่คิวจอง)", { active: "เปิดให้สอบถาม", maintenance: "ปิดซ่อมบำรุง", retired: "เลิกให้บริการ" }),
    field("service_modes", "รูปแบบบริการ", "checkbox", { choices: { "self-drive": "ขับเอง", chauffeur: "พร้อมคนขับ", event: "งานอีเวนต์" }, return_format: "value", required: 1 }),
    field("delivery_locations", "พื้นที่รับ–ส่ง", "checkbox", { choices: { bangkok: "กรุงเทพฯ", bkk: "สุวรรณภูมิ", dmk: "ดอนเมือง", hotel: "โรงแรมในกรุงเทพฯ" }, return_format: "value", required: 1 }),
    tab("specs_tab", "02 · สเปก"),
    number("seats", "จำนวนที่นั่ง", { min: 1, max: 30 }), number("doors", "จำนวนประตู", { min: 1, max: 10 }),
    select("transmission", "ระบบเกียร์", { automatic: "อัตโนมัติ", manual: "ธรรมดา" }),
    select("fuel", "พลังงาน", { petrol: "เบนซิน", "plug-in-hybrid": "ปลั๊กอินไฮบริด", "mild-hybrid": "ไมลด์ไฮบริด", electric: "ไฟฟ้า", unconfirmed: "รอยืนยัน" }),
    number("power_ps", "กำลังสูงสุด (PS)", { instructions: "ใช้ PS ทุก record ไม่ใช่ hp; เว้นว่างเมื่อยังไม่ทราบ" }),
    number("acceleration_seconds", "0–100 กม./ชม. (วินาที)", { step: 0.1 }), number("top_speed_kmh", "ความเร็วสูงสุด (กม./ชม.)"),
    field("spec_source_url", "แหล่งยืนยันสเปก", "url"),
    tab("rental_tab", "03 · ค่าเช่าและเงื่อนไข"),
    number("daily_rate_thb", "ค่าเช่าขับเองต่อวัน (THB)", { instructions: "ไม่ใช้ค่านี้คำนวณบริการพร้อมคนขับหรืออีเวนต์; ไม่ใช่ใบเสนอราคา" }),
    number("deposit_thb", "มัดจำ (THB)"), number("minimum_days", "จำนวนวันเช่าขั้นต่ำ", { min: 1, default_value: 1 }),
    number("included_km_per_day", "ระยะทางรวมต่อวัน (กม.)"), number("extra_km_thb", "ระยะทางส่วนเกิน (THB/กม.)"),
    tab("content_tab", "04 · เนื้อหา 3 ภาษา"),
    ...Object.entries(languages).flatMap(([code, label]) => [
      field(`summary_${code}`, `คำอธิบายสั้น · ${label}`, "textarea", { rows: 3, new_lines: "" }),
      field(`features_${code}`, `จุดเด่น · ${label}`, "textarea", { rows: 4, new_lines: "", instructions: "หนึ่งจุดเด่นต่อบรรทัด" }),
      field(`rental_terms_${code}`, `เงื่อนไขการเช่า · ${label}`, "textarea", { rows: 5, new_lines: "" }),
    ]),
    tab("media_tab", "05 · รูปภาพและเครดิต"),
    field("cover_image", "รูปปกจาก Media Library", "image", { return_format: "id", preview_size: "medium", library: "all" }),
    field("gallery", "แกลเลอรี (ACF Pro)", "gallery", { return_format: "id", preview_size: "medium", library: "all" }),
    field("fallback_image_path", "ไฟล์ภาพตัวอย่างบน Frontend", "text", { instructions: "ใช้เฉพาะ demo เมื่อยังไม่มี cover_image เช่น /cars/ferrari-296-gtb.jpg; ไม่ใช่ WordPress attachment ID" }),
    field("photo_source_url", "หน้าต้นฉบับภาพ", "url"), field("photo_author", "ผู้สร้างภาพ"), field("photo_license", "สัญญาอนุญาตภาพ"), field("photo_license_url", "URL สัญญาอนุญาต", "url"),
    field("virtual_tour_url", "URL ภาพ/ทัวร์ 360°", "url", { instructions: "เว้นว่างหากยังไม่มีไฟล์; ไม่ได้เปิดใช้ตัว viewer ใน frontend รุ่นนี้" }),
    tab("seo_tab", "06 · SEO"),
    ...Object.entries(languages).flatMap(([code, label]) => [field(`seo_title_${code}`, `SEO title · ${label}`), field(`seo_description_${code}`, `SEO description · ${label}`, "textarea", { rows: 3, new_lines: "" })]),
  ],
};
const contentFields = group.fields.filter((f) => f.type !== "tab");
const records = vehicles.map(({ slug, name, ...vehicle }) => {
  const photo = photos.find((p) => p.name === name);
  if (!photo) throw new Error(`Missing photo: ${name}`);
  const acf = { ...vehicle, category: photo.category, cover_image: null, fallback_image_path: photo.image, photo_source_url: photo.source, photo_author: photo.author, photo_license: photo.license, photo_license_url: photo.licenseUrl };
  for (const code of Object.keys(languages)) { acf[`seo_title_${code}`] = name; acf[`seo_description_${code}`] = vehicle[`summary_${code}`]; }
  for (const key of Object.keys(acf)) if (!contentFields.some((f) => f.name === key)) throw new Error(`Field missing in ACF: ${key}`);
  return { title: name, slug, status: "draft", acf };
});
writeFileSync(new URL("acf-vehicle-fields.json", import.meta.url), JSON.stringify([group], null, 2) + "\n");
writeFileSync(new URL("car-seed.json", import.meta.url), JSON.stringify({ schema_version: 1, mode: "demo", endpoint: "/wp-json/wp/v2/cars", records }, null, 2) + "\n");
console.log(`Generated ${contentFields.length} ACF fields and ${records.length} draft vehicle payloads. No network changes made.`);

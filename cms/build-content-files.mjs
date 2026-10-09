// One contract for ACF, draft seed data, and the existing frontend's local fallback.
// This generator makes no WordPress/network writes. Run: node cms/build-content-files.mjs
import { readFileSync, writeFileSync } from "node:fs";
const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"));
const settings = read("site-settings"), home = read("home-content"), company = read("company-content");
const contract = read("cms-contract");
const locales = { th: "ไทย", en: "English", zh: "中文" };
const aboutKeys = ["home","aboutEyebrow","aboutTitle","aboutIntro","storyTitle","story","valuesTitle","values","valuesBody","servicesTitle","services","serviceNote","explore","talk","draft"];
const contactKeys = ["home","contactEyebrow","contactTitle","contactIntro","channelTitle","channelIntro","email","address","addressNote","social","socialNote","checklistTitle","checklist","checklistNote","check"];
const selectKeys = keys => Object.fromEntries(Object.keys(locales).map(lang => [lang,Object.fromEntries(keys.map(key => [key,company[lang][key]]))]));
const pages = { home, about: selectKeys(aboutKeys), contact: selectKeys(contactKeys) };
const labels = {
  brand_name: "ชื่อแบรนด์ / Brand name", brand_tagline: "คำใต้โลโก้ / Brand tagline", logo_url: "URL โลโก้ / Logo URL", phone: "เบอร์ CALL", whatsapp: "เบอร์ WhatsApp (เตรียมไว้ ยังไม่แสดงใน UI)", email: "อีเมล / Email", line_id: "ชื่อบัญชี LINE", maps_url: "ลิงก์แผนที่ / Map URL", social: "ลิงก์โซเชียล / Social URLs", social_visible: "แสดงไอคอน / Visible social icons", text: "ข้อมูลส่วนกลาง 3 ภาษา", address: "ที่อยู่หรือจุดนัดรับรถ / Address", hours: "เวลาบริการ / Opening hours", footerIntro: "แนะนำแบรนด์ใน Footer", footerCopyright: "ข้อความลิขสิทธิ์ท้ายเว็บ", footerHeads: "หัวคอลัมน์ Footer", footerRent: "รายการคอลเลกชัน Footer", footerServices: "รายการบริการ Footer", footerPlaces: "พื้นที่บริการ Footer", footerContact: "ป้ายช่องทางติดต่อ (สำรอง)", footerLegal: "ป้ายลิงก์นโยบาย Footer", heroTitle: "หัวเรื่อง Hero (2 บรรทัด)", heroBody: "คำอธิบาย Hero", heroEyebrow: "ข้อความเหนือ Hero", aboutTitle: "หัวเรื่อง About us", aboutIntro: "บทนำ About us", contactTitle: "หัวเรื่อง Contact us", contactIntro: "บทนำ Contact us", storyTitle: "หัวเรื่องแบรนด์", story: "เรื่องราวแบรนด์", values: "หัวข้อคุณค่าแบรนด์", valuesBody: "รายละเอียดคุณค่าแบรนด์", checklist: "รายการเตรียมก่อนติดต่อ", socialNote: "ข้อความเมื่อยังไม่มีบัญชีโซเชียล", channelIntro: "ข้อความเมื่อยังไม่มีช่องทางติดต่อ", draft: "หมายเหตุร่างเนื้อหา", facebook: "Facebook", line: "LINE", instagram: "Instagram", tiktok: "TikTok",
};
const label = name => labels[name] || locales[name] || name.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/_/g," ");
function field(name,value,path) {
  const key = `field_pd_${path}_${name}`;
  const common = { key, name, label: label(name), required: 0 };
  if (Array.isArray(value)) return { ...common, type: "textarea", rows: Math.max(2,Math.min(value.length,6)), new_lines: "", instructions: `หนึ่งรายการต่อบรรทัด / One item per line. ${contract.fixedLists.includes(name) ? `ต้องมี ${value.length} รายการเพื่อรักษาตำแหน่งในแบบเว็บ / Keep ${value.length} items.` : "เพิ่มหรือลบรายการได้ / Add or remove lines."}` };
  if (typeof value === "boolean") return { ...common, type: "true_false", ui: 1, default_value: 1 };
  if (value && typeof value === "object") return { ...common, type: "group", layout: "block", sub_fields: Object.entries(value).map(([n,v]) => field(n,v,`${path}_${name}`)) };
  const isLink = path.endsWith("_social") || name === "maps_url";
  if (isLink) return { ...common, type: "url", instructions: "ใช้ https:// เท่านั้น เว้นว่างเมื่อยังไม่มีลิงก์จริง / HTTPS only; leave blank if unconfirmed." };
  if (name === "email" && path === "settings") return { ...common, type: "email" };
  return { ...common, type: String(value).length > 90 || /intro|body|story|note|copyright|address|terms/i.test(name) ? "textarea" : "text", new_lines: "", rows: 3, instructions: name === "logo_url" ? "HTTPS URL ของไฟล์ใน Media Library หรือ /prom-drive-logo.png สำหรับภาพเดิมใน frontend" : "ข้อความธรรมดา ไม่ใส่ HTML / Plain text, no HTML." };
}
const group = (key,title,type,fields) => ({ key, title, active: true, show_in_rest: 1, location: [[{param:"post_type",operator:"==",value:type}]], position:"normal", style:"default", fields });
const groups = [
  group("group_pd_settings","PROM DRIVE · ข้อมูลส่วนกลาง","prom_drive_setting",Object.entries(settings).map(([n,v]) => field(n,v,"settings"))),
  group("group_pd_pages","PROM DRIVE · เนื้อหาหน้าเว็บ 3 ภาษา","prom_drive_page",[
    { key:"field_pd_page_key", name:"page_key", label:"หน้าเว็บ / Page", type:"select", choices:{home:"หน้าแรก / Home",about:"เกี่ยวกับเรา / About us",contact:"ติดต่อเรา / Contact us"}, return_format:"value", required:1, instructions:"Slug ของรายการต้องตรงกับค่านี้: home, about หรือ contact" },
    ...Object.entries(pages).map(([name,value]) => ({ ...field(name,value,"page"), conditional_logic:[[{field:"field_pd_page_key",operator:"==",value:name}]] })),
  ]),
];
const serialize = value => Array.isArray(value) ? value.join("\n") : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([k,v]) => [k,serialize(v)])) : value;
const records = [
  { post_type:"prom_drive_setting", endpoint:"/wp-json/wp/v2/prom-drive-settings", title:"PROM DRIVE · Global settings", slug:"global", status:"draft", acf:serialize(settings) },
  ...Object.entries(pages).map(([slug,content]) => ({ post_type:"prom_drive_page", endpoint:"/wp-json/wp/v2/prom-drive-pages", title:`PROM DRIVE · ${slug}`, slug, status:"draft", acf:{page_key:slug,[slug]:serialize(content)} })),
];
const keys=[];
function check(fields) { for(const f of fields) { if(keys.includes(f.key)) throw Error(`Duplicate field key: ${f.key}`); keys.push(f.key); if(f.sub_fields) check(f.sub_fields); } }
groups.forEach(g=>check(g.fields));
writeFileSync(new URL("acf-content-fields.json",import.meta.url),JSON.stringify(groups,null,2)+"\n");
writeFileSync(new URL("content-seed.json",import.meta.url),JSON.stringify({schema_version:1,mode:"draft",records},null,2)+"\n");
console.log(`Generated ${keys.length} ACF fields (including groups), 2 post types, and ${records.length} draft records. No network writes.`);

# PROM DRIVE Content API (prom-drive/v1)

สำหรับทีม mobile app และ frontend อื่น ที่อ่านเนื้อหาจาก WordPress แบบ headless
เวอร์ชันปลั๊กอิน 2.2.0 · อ่านอย่างเดียว · ไม่ต้องมี API key สำหรับข้อมูลที่ Publish แล้ว

Base URL: `https://cms.<โดเมน>/wp-json/prom-drive/v1`

## Endpoints

| Method | Path | ใช้ทำอะไร |
| --- | --- | --- |
| GET | `/content?lang=th` | เปิดแอป: ข้อมูลส่วนกลาง + หน้า home/about/contact ในคำขอเดียว |
| GET | `/settings?lang=th` | ข้อมูลส่วนกลาง (แบรนด์ ช่องทางติดต่อ โซเชียล footer) |
| GET | `/pages/{home\|about\|contact}?lang=th` | ข้อความของหน้านั้น |
| GET | `/vehicles?location=&category=&service=&page=&per_page=&lang=` | รายการรถ (เฉพาะ Publish + active + verified) |
| GET | `/vehicles/{slug}?lang=th` | รถหนึ่งคัน (เฉพาะ Publish + verified ทุก fleet_status) |

ทุก response มี header `Cache-Control: public, max-age=60, stale-while-revalidate=300`
และฟิลด์ `updated_at` (ISO 8601, UTC) ใช้เทียบว่ามีการแก้ไขหรือยัง

## พารามิเตอร์ `lang`

| ค่า | ผลลัพธ์ |
| --- | --- |
| ไม่ส่ง | ได้ทุกภาษา: `summary_th`, `summary_en`, `summary_zh` และ group `text.th / text.en / text.zh` |
| `th` `en` `zh` | ยุบเหลือภาษาเดียว: `summary`, `features`, `rental_terms`, `seo_title`, `seo_description` และ `text.{...}` โดยตรง |
| ค่าอื่น | HTTP 400 จาก REST schema |

แนะนำให้แอปส่ง `lang` เสมอ payload เล็กลงราว 3 เท่าและไม่ต้องรู้กติกาชื่อฟิลด์ต่อท้าย

## รายการ (list) คืนเป็น array เสมอ

ฟิลด์ที่แอดมินกรอกแบบ "หนึ่งรายการต่อบรรทัด" จะถูกแปลงเป็น array ให้แล้ว เช่น
`features`, `nav`, `heroTitle`, `meta`, `processHeads`, `footerHeads`, `values`, `checklist`
บรรทัดว่างถูกตัดทิ้ง บางรายการมีจำนวนตายตัวตามดีไซน์เว็บ (เช่น `heroTitle` 2 บรรทัด) แอปไม่จำเป็นต้องยึดจำนวนนั้น

## รูปภาพ (`media`)

```json
"media": {
  "cover": {
    "id": 90, "url": "https://cms.example/wp-content/uploads/2026/10/ferrari.jpg",
    "width": 1600, "height": 960, "alt": "", "caption": "", "mime": "image/jpeg",
    "sizes": {
      "thumbnail": { "url": "...-150x90.jpg", "width": 150, "height": 90 },
      "medium":    { "url": "...-300x180.jpg", "width": 300, "height": 180 },
      "large":     { "url": "...-1024x614.jpg", "width": 1024, "height": 614 },
      "full":      { "url": "...jpg", "width": 1600, "height": 960 }
    }
  },
  "gallery": [ { "...รูปแบบเดียวกับ cover..." } ],
  "fallback_image_path": "/cars/ferrari-296-gtb.jpg",
  "credit": { "source_url": "", "author": "", "license": "", "license_url": "" },
  "virtual_tour_url": ""
}
```

- `cover` เป็น `null` เมื่อยังไม่ได้เลือกรูป ให้ใช้ `fallback_image_path` (path บนเว็บหลัก) หรือรูป placeholder ของแอป
- `gallery` ข้ามรูปที่ถูกลบจาก Media Library โดยอัตโนมัติ
- ถ้า `credit.author` ไม่ว่าง ต้องแสดงเครดิตตาม `credit.license` (รูปตัวอย่างชุดแรกเป็น CC BY-SA)
- รูปขนาด `medium`/`large` อาจไม่มีถ้ารูปต้นฉบับเล็กกว่า ให้ fallback ไป `full`

## ตัวอย่าง `GET /vehicles/mclaren-720s?lang=th`

```json
{
  "id": 4,
  "slug": "mclaren-720s",
  "name": "McLaren 720S",
  "lang": "th",
  "data_status": "verified",
  "brand": "McLaren",
  "model": "720S",
  "variant": "Coupe",
  "model_year": null,
  "category": "Supercar",
  "fleet_status": "active",
  "service_modes": ["self-drive", "event"],
  "delivery_locations": ["bangkok", "hotel"],
  "seats": 2,
  "doors": 2,
  "transmission": "automatic",
  "fuel": "petrol",
  "power_ps": 720,
  "acceleration_seconds": 2.9,
  "top_speed_kmh": 341,
  "spec_source_url": "",
  "daily_rate_thb": 48000,
  "deposit_thb": 120000,
  "minimum_days": 2,
  "included_km_per_day": 150,
  "extra_km_thb": 100,
  "summary": "รูปลักษณ์ที่มีเอกลักษณ์ สำหรับผู้ที่อยากให้รถเป็นส่วนหนึ่งของความทรงจำ",
  "features": ["ดีไซน์ซูเปอร์คาร์", "สองที่นั่ง", "ตัวเลือกสำหรับงานอีเวนต์"],
  "rental_terms": "เงื่อนไขตัวอย่าง: เช่าขั้นต่ำ 2 วัน ...",
  "seo_title": "McLaren 720S",
  "seo_description": "...",
  "media": { "cover": { "...": "..." }, "gallery": [], "fallback_image_path": "/cars/mclaren-720s.jpg", "credit": { "...": "..." }, "virtual_tour_url": "" },
  "updated_at": "2026-10-09T10:00:00+00:00"
}
```

ความหมายของค่า:

| ฟิลด์ | ค่า | หมายเหตุ |
| --- | --- | --- |
| `category` | `Sports` `Supercar` `Ultra-Luxury` `SUV` | |
| `fleet_status` | `active` `maintenance` `retired` | สถานะให้บริการ ไม่ใช่คิวว่าง |
| `data_status` | `verified` | API สาธารณะคืนเฉพาะ verified; `demo` เห็นได้เฉพาะผู้ดูแลที่ล็อกอิน |
| `service_modes` | `self-drive` `chauffeur` `event` | |
| `delivery_locations` | `bangkok` `bkk` `dmk` `hotel` | bkk = สุวรรณภูมิ, dmk = ดอนเมือง |
| `transmission` | `automatic` `manual` | |
| `fuel` | `petrol` `plug-in-hybrid` `mild-hybrid` `electric` `unconfirmed` | |
| `daily_rate_thb` | จำนวนเต็ม บาท | ราคาขับเองต่อวันเท่านั้น พร้อมคนขับ/อีเวนต์ต้องสอบถาม |
| `model_year`, `power_ps`, ... | ตัวเลข หรือ `null` | `null` = ยังไม่ยืนยัน แสดง "รอยืนยัน" ไม่ใช่ 0 |

## ตัวอย่าง `GET /vehicles?location=bangkok&service=self-drive&per_page=12&lang=en`

```json
{
  "items": [ { "...รูปแบบเดียวกับ /vehicles/{slug}..." } ],
  "filters": { "location": "bangkok", "category": "All", "service": "self-drive", "lang": "en" },
  "pagination": { "page": 1, "per_page": 12, "total": 4, "pages": 1 },
  "availability_confirmed": false,
  "availability_source": "not_connected"
}
```

- ตัวกรองทำงานร่วมกันแบบ AND; `per_page` 1–100; เรียงตามชื่อรถ
- header `X-WP-Total` และ `X-WP-TotalPages` มีให้ด้วย
- **ไม่ใช่ระบบเช็กคิวว่าง** ถ้าส่ง `pickup`, `returnAt`, `return_at`, `pickup_date`, `return_date` จะได้ HTTP 400
  `availability_confirmed` เป็น `false` เสมอ จนกว่าจะมี booking service แยกต่างหาก

## ตัวอย่าง `GET /content?lang=th`

```json
{
  "lang": "th",
  "settings": {
    "brand_name": "PROM DRIVE",
    "brand_tagline": "CAR RENTAL",
    "logo_url": "/prom-drive-logo.png",
    "phone": "", "whatsapp": "", "email": "", "line_id": "", "maps_url": "",
    "social": { "facebook": "", "line": "", "instagram": "", "tiktok": "" },
    "social_visible": { "facebook": true, "line": true, "instagram": true, "tiktok": true },
    "text": {
      "address": "",
      "hours": "ให้บริการทุกวัน · 08:00–24:00 น.",
      "footerIntro": "...",
      "footerHeads": ["คอลเลกชัน", "บริการ", "พื้นที่ให้บริการ"],
      "footerRent": ["ซูเปอร์คาร์", "อัลตร้าลักชัวรี", "รถสปอร์ต", "ซีดานพร้อมคนขับ"],
      "footerServices": ["..."], "footerPlaces": ["..."], "footerContact": ["..."], "footerLegal": ["..."],
      "footerCopyright": "© 2026 PROM DRIVE"
    }
  },
  "pages": {
    "home":    { "nav": ["รถทั้งหมด", "ประสบการณ์", "ขั้นตอน", "ติดต่อ"], "heroTitle": ["ที่สุดแห่ง", "การเดินทาง"], "heroBody": "...", "...": "..." },
    "about":   { "aboutTitle": ["...", "..."], "values": ["...", "...", "..."], "...": "..." },
    "contact": { "contactTitle": ["...", "..."], "checklist": ["..."], "...": "..." }
  },
  "updated_at": { "settings": "2026-10-09T10:00:00+00:00", "home": "...", "about": "...", "contact": "..." },
  "generated_at": "2026-10-09T11:20:00+00:00"
}
```

- หน้าใดยังไม่ Publish จะเป็น `null` ใน `pages` และ `updated_at` ให้แอปใช้ค่าสำรองของตัวเอง
- `logo_url` อาจเป็น path สัมพัทธ์ (`/prom-drive-logo.png` บนเว็บหลัก) หรือ HTTPS URL จาก Media Library
- `phone`, `line_id`, `social.*` อาจว่าง ให้ซ่อนปุ่มแทนที่จะแสดงลิงก์เปล่า
- รายชื่อฟิลด์ทั้งหมดของแต่ละหน้าอยู่ใน `schema.json` (key `prom_drive_page`) และ `data/home-content.json`, `data/company-content.json` ของเว็บ

## ฟิลด์ที่ผู้ดูแลเพิ่มเอง (custom fields)

ผู้ดูแลเพิ่มฟิลด์ได้จากหลังบ้านโดยไม่ต้องแก้ปลั๊กอิน ฟิลด์เหล่านี้โผล่ใน JSON ทันทีที่ Publish

| ประเภท | ตำแหน่งใน JSON |
| --- | --- |
| รถ | key ระดับบนของแต่ละคัน เช่น `"wheel_inch": 20` |
| ข้อมูลเว็บไซต์ | key ใน `settings` |
| หน้า | key ใน `pages.home` / `pages.about` / `pages.contact` (ตามที่ตั้งขอบเขตไว้) |

- ชื่อ key เป็น `a-z 0-9 _` และไม่ชนกับฟิลด์ในเอกสารนี้ (ปลั๊กอินบังคับตอนสร้าง)
- ฟิลด์ "หลายภาษา" ทำงานเหมือนฟิลด์เดิม: ไม่ส่ง `lang` ได้ `name_th/name_en/name_zh` ส่ง `lang` ได้ `name`
- ฟิลด์ "รายการ" คืนเป็น array, ฟิลด์เปิด/ปิด เป็น boolean, ตัวเลข เป็น number หรือ `null`, รูปภาพ/แกลเลอรี เป็น attachment ID (ยังไม่ resolve เป็น URL ให้ ใช้ `/wp/v2/media/{id}` หรือแจ้งให้เพิ่ม)
- แอปควรอ่านแบบ tolerant: key ที่ไม่รู้จักให้ข้าม key ที่คาดหวังแต่ไม่มีให้ใช้ค่าสำรอง
- ขอรายชื่อฟิลด์ปัจจุบันได้จากผู้ดูแล (ปุ่ม "ส่งออก JSON" ในหน้า ฟิลด์เพิ่มเติม)

## ข้อผิดพลาด

| HTTP | `code` | เมื่อไร |
| --- | --- | --- |
| 400 | `rest_invalid_param` | `lang`, `category`, `location`, `service`, `per_page` ไม่อยู่ในรายการที่กำหนด |
| 400 | `prom_drive_availability_not_connected` | ส่งพารามิเตอร์วันรับ–คืนมาที่ `/vehicles` |
| 404 | `prom_drive_not_found` | slug ไม่มี, ยังไม่ Publish, มีรหัสผ่าน, หรือเป็นข้อมูล demo |

## สิ่งที่ API นี้ไม่ทำ

- ไม่เช็กคิวว่าง ไม่จอง ไม่รับชำระเงิน ไม่เก็บข้อมูลลูกค้า
- ไม่มี write API ทุกการแก้ไขทำผ่าน WordPress Admin
- ไม่มี rich text เนื้อหาเป็นข้อความธรรมดาและ array ของข้อความเท่านั้น
- ไม่มีข่าว/โปรโมชัน/FAQ ถ้าต้องการต้องเพิ่ม post type ใหม่

## WordPress core endpoints (สำหรับเว็บ Next.js ปัจจุบัน)

`/wp-json/wp/v2/cars`, `/wp-json/wp/v2/prom-drive-settings`, `/wp-json/wp/v2/prom-drive-pages`
คืนรูปแบบดิบ: ฟิลด์ทั้งหมดใน object `acf` ทุกภาษาใน record เดียว รายการเป็นข้อความคั่นด้วย `\n`
และ `cars` มี object `media` รูปแบบเดียวกับ v1 แอปใหม่ควรใช้ v1 เท่านั้น

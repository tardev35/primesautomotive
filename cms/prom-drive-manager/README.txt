PROM DRIVE Manager 2.0.0
WordPress 6.0+ / PHP 7.4+ / HTTPS recommended

ติดตั้งปลั๊กอินเดียว ไม่ต้องใช้ ACF / ACF Pro / CPT UI
==================================================
1. สำรองฐานข้อมูลและ Media Library ก่อนติดตั้งในเว็บเดิม
2. ถ้าเคยติดตั้ง PROM DRIVE Content หรือ PROM DRIVE Cars ให้ Deactivate รุ่นเดิม
   ไม่ต้องลบโพสต์หรือข้อมูล ปลั๊กอินใหม่จะหยุดทำงานพร้อมแจ้งเตือนหากยังเปิดรุ่นเดิม
3. WordPress > Plugins > Add New > Upload Plugin > prom-drive-manager.zip > Activate
4. PROM DRIVE · ข้อมูลเว็บไซต์ > ตั้งค่าเริ่มต้น > สร้างข้อมูลเริ่มต้นเป็น Draft
   สร้าง global / home / about / contact และรถตัวอย่าง 8 คัน
   ข้าม Slug เดิม ไม่เขียนทับ ไม่ดาวน์โหลดภาพภายนอก ไม่ Publish อัตโนมัติ
5. ตรวจข้อมูลจริงและ Publish แต่ละรายการเมื่อพร้อม

เมนูและข้อมูล
============
PROM DRIVE · รถยนต์ (post type: cars)
  ยี่ห้อ รุ่น ประเภท สเปก ราคา เงื่อนไข ไทย/อังกฤษ/จีน
  ภาพปก + Gallery หลายภาพจาก Media Library ได้โดยไม่ต้องใช้ ACF Pro
  รูปแบบบริการ: self-drive / chauffeur / event
  สถานที่: bangkok / bkk / dmk / hotel
  ข้อมูลตัวอย่างเริ่มเป็น demo; เปลี่ยนเป็น verified หลังตรวจข้อมูลจริงเท่านั้น
  fleet_status: active / maintenance / retired
  virtual_tour_url เป็นลิงก์เตรียมไว้ ยังไม่มีตัวเล่นภาพหมุน 360° ใน frontend

PROM DRIVE · ข้อมูลเว็บไซต์ (post type: prom_drive_setting)
  ใช้ Slug global เพียงรายการเดียว
  ชื่อแบรนด์ โลโก้ CALL อีเมล LINE ที่อยู่ เวลาเปิดบริการ
  ลิงก์ Facebook / LINE / Instagram / TikTok และสวิตช์ซ่อน/แสดง
  ข้อความ Footer ไทย/อังกฤษ/จีน
  logo_url ใช้ HTTPS URL รูปใน Media Library หรือ /prom-drive-logo.png ของ frontend

PROM DRIVE · เนื้อหา 3 ภาษา (post type: prom_drive_page)
  Slug และหน้าเว็บที่เลือกต้องตรงกัน: home / about / contact
  ไทย/อังกฤษ/จีนแยกฟิลด์ รายการหลายข้อกรอกหนึ่งรายการต่อบรรทัด
  รายการที่ระบุจำนวนตายตัวต้องรักษาจำนวนบรรทัดเพื่อให้ตรงดีไซน์
  ตั้ง Slug ได้ใน Screen Options > Slug ของตัวแก้ไข WordPress

API (อ่านอย่างเดียว ไม่ต้องมี API key สำหรับข้อมูลที่ Publish)
============================================================
GET /wp-json/wp/v2/prom-drive-settings?slug=global&status=publish
GET /wp-json/wp/v2/prom-drive-pages?slug=home,about,contact&status=publish
GET /wp-json/wp/v2/cars
GET /wp-json/prom-drive/v1/vehicles?location=bangkok&category=Supercar&service=self-drive&page=1&per_page=12

สามตัวกรองทำงานร่วมกันแบบ AND; per_page 1–100
category: All / Sports / Supercar / Ultra-Luxury / SUV
ผลค้นหาพิเศษคืนเฉพาะ Publish, ไม่มีรหัสผ่าน, active และ verified
core /wp/v2/cars เป็นรายการเนื้อหา ไม่ใช่ผลยืนยันรถว่าง และอาจมี demo ที่ผู้ดูแล Publish
ข้อมูล field ยังคงอยู่ใน object ชื่อ acf เพื่อเข้ากับ frontend เดิม แต่ไม่ต้องติดตั้ง ACF
การเขียนฟิลด์ทำผ่าน WordPress Admin เท่านั้น ไม่เปิด unauthenticated write API

สำคัญ: API นี้ยังไม่ใช่ระบบคิวจอง
availability_confirmed = false และ availability_source = not_connected
ส่ง pickup / returnAt / return_at / pickup_date / return_date จะได้ HTTP 400
ต้องเชื่อมระบบ booking, blackout และการล็อกคิวก่อนยืนยันว่ารถว่างจริง
ไม่มีการเก็บข้อมูลลูกค้าหรือรับชำระเงินในปลั๊กอินนี้

เชื่อม frontend
==============
ตั้ง WORDPRESS_API_BASE_URL=https://cms.YOUR-DOMAIN/wp-json/wp/v2 ฝั่งเซิร์ฟเวอร์ของเว็บ
ใช้โดเมนจริงที่มี HTTPS ไม่ใส่รหัสผ่านใน URL
frontend ปัจจุบันอ่าน settings และเนื้อหา home/about/contact แล้ว; รถบนหน้าเว็บยังใช้
ข้อมูลตัวอย่างจนกว่าจะเชื่อม catalogue adapter/booking source เพิ่ม ไม่ใช่แค่ Activate แล้วรถเปลี่ยนอัตโนมัติ
ถ้าไม่มี URL, CMS ล่ม, JSON ไม่ถูกต้อง หรือข้อมูลยังไม่ Publish จะใช้ข้อความสำรองเดิม

ย้ายจากชุด ACF เดิม
==================
เก็บ post type, slug และชื่อ metadata เดิม; อ่าน ACF group แบบ flattened keys ได้
สำรองก่อนย้าย และปิด field group เดิม group_aurelia_vehicle / group_pd_settings /
group_pd_pages ใน ACF หากเคย Import ไว้ เพื่อไม่ให้เห็นช่องกรอกซ้ำ
ACF ของส่วนอื่นยังใช้ต่อได้ ไม่ต้องปิดทั้งปลั๊กอิน
เมื่อบันทึกด้วย Manager กลุ่มข้อมูลจะเก็บเป็น native array; อย่าแก้ฟิลด์เดียวกันด้วย
ACF รุ่นเก่าไปพร้อมกัน เพราะรูปแบบจัดเก็บ group ต่างกัน

ความปลอดภัยและขอบเขต
====================
เฉพาะผู้มีสิทธิ์แก้ Pages/โพสต์นั้นจึงแก้ฟิลด์ได้ ตรวจ nonce, capability, autosave
กรอกผิดหรือฟอร์มขาด: ไม่เขียนทับ metadata เดิมและแสดง error; title/status ของ
WordPress อาจถูกบันทึกตามปกติ กรุณาตรวจข้อความแจ้งเตือนหลังทุกครั้ง
ฟิลด์ที่ Publish อ่านได้สาธารณะ ห้ามใส่ข้อมูลลูกค้า รหัสผ่าน หรือบันทึกส่วนตัว
REST ใช้ schema allowlist ไม่ส่ง metadata อื่น; group ซ้อนมี allowlist เช่นกัน
ไม่มี custom-field revision restore; ใช้ backup ฐานข้อมูลสำหรับย้อนข้อมูล
Deactivate/Delete ปลั๊กอินไม่ลบโพสต์และ metadata อัตโนมัติ

ผลตรวจชุดส่งมอบ
===============
PHP syntax ผ่าน; offline tests ผ่าน 60 ชุดตัวกรอง, draft/demo/password exclusion,
pagination, date rejection, seed 12 รายการ, legacy group, validation และสิทธิ์/nonce
ยังไม่ได้ทดสอบติดตั้งกับ WordPress จริงของคุณ: ทดสอบบน staging ก่อนขึ้นระบบจริง
ทดสอบ upload logo/gallery, บันทึก/โหลดซ้ำทุกภาษา, Draft/Publish, API และสิทธิ์ผู้ใช้

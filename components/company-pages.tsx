"use client";

import { ArrowUpRight, CarFront, HeartHandshake, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { companyLabels, contactDetails, pendingLabel, SocialLinks } from "@/components/site-branding";
import type { Language } from "@/lib/fleet";

const content = {
  th: {
    home: "หน้าแรก", aboutEyebrow: "PROM DRIVE · เรื่องราวของเรา", aboutTitle: ["มากกว่าจุดหมาย", "คือความรู้สึกระหว่างทาง"], aboutIntro: "PROM DRIVE เกิดจากแนวคิดที่ว่า รถที่ใช่ช่วยเปลี่ยนการเดินทางธรรมดาให้เป็นช่วงเวลาที่พิเศษ เราจึงให้ความสำคัญกับทั้งบุคลิกของรถ ความสบาย และรายละเอียดเล็ก ๆ ที่ทำให้คุณเดินทางได้อย่างมั่นใจ",
    storyTitle: "เลือกด้วยรสนิยม ดูแลด้วยความใส่ใจ", story: "ไม่ว่าจะเป็นวันพักผ่อน การเดินทางเพื่อธุรกิจ หรือโอกาสสำคัญ เราอยากให้การเลือกรถเป็นเรื่องเรียบง่าย เริ่มจากเข้าใจแผนการเดินทางของคุณ แล้วช่วยเลือกประเภทรถและรูปแบบบริการที่เหมาะสม พร้อมพูดคุยรายละเอียดก่อนตัดสินใจ",
    valuesTitle: "สิ่งที่เราให้ความสำคัญ", values: ["รถที่เข้ากับคุณ", "รายละเอียดที่ชัดเจน", "การดูแลตลอดเส้นทาง"], valuesBody: ["เลือกจากสไตล์การขับ จำนวนผู้ร่วมเดินทาง และโอกาสใช้งาน ไม่ใช่แค่ชื่อรุ่น", "พูดคุยค่าเช่า ระยะเวลา สถานที่รับ–คืน และเงื่อนไขให้เข้าใจตรงกันก่อนยืนยัน", "มีพื้นที่ให้คุณสอบถามความต้องการ ตั้งแต่การเลือกรถไปจนถึงการวางแผนคืนรถ"],
    servicesTitle: "ออกแบบให้เข้ากับการเดินทางของคุณ", services: ["ขับเองในสไตล์ที่ชอบ", "เดินทางพร้อมคนขับ", "รับ–ส่งสนามบิน", "วันสำคัญและงานอีเวนต์"], serviceNote: "รูปแบบบริการ รุ่นรถ และพื้นที่จัดส่งต้องยืนยันกับทีมงานก่อนจอง", explore: "เลือกชมคอลเลกชัน", talk: "พูดคุยเรื่องการเดินทาง",
    contactEyebrow: "CONTACT PROM DRIVE", contactTitle: ["เริ่มต้นการเดินทาง", "ด้วยการพูดคุยกับเรา"], contactIntro: "บอกช่วงเวลา สถานที่ และสไตล์รถที่คุณสนใจ เพื่อเตรียมรายละเอียดและเลือกรูปแบบบริการที่เหมาะกับคุณ", channelTitle: "ช่องทางติดต่อ", channelIntro: "กำลังเตรียมช่องทางติดต่ออย่างเป็นทางการ เบอร์โทร อีเมล และบัญชีโซเชียลจะอัปเดตเมื่อได้รับการยืนยัน", email: "อีเมล", address: "ที่อยู่ / จุดนัดรับรถ", addressNote: "กรุณายืนยันจุดรับ–คืนรถและการนัดหมายกับทีมงานก่อนเดินทาง", social: "ติดตาม PROM DRIVE", socialNote: "บัญชี Facebook, LINE, Instagram และ TikTok รอยืนยันจากเจ้าของแบรนด์",
    checklistTitle: "เตรียมเพียงเท่านี้ ก่อนสอบถาม", checklist: ["วันและเวลาที่ต้องการรับ–คืนรถ", "สถานที่รับรถและจุดคืนรถ", "รุ่นรถที่สนใจ และจำนวนผู้เดินทาง", "ขับเอง พร้อมคนขับ หรือใช้ในงานอีเวนต์"], checklistNote: "หน้าติดต่อยังไม่ส่งข้อความหรือรับการจองออนไลน์ การจองจะสมบูรณ์เมื่อทีมงานยืนยันรายละเอียดเท่านั้น", check: "ลองค้นหารถตามวันที่", draft: "เนื้อหาแนะนำแบรนด์เบื้องต้น — รายละเอียดบริษัทและบริการรอเจ้าของยืนยันก่อนเปิดใช้งานจริง",
  },
  en: {
    home: "Home", aboutEyebrow: "PROM DRIVE · OUR STORY", aboutTitle: ["Beyond the destination.", "Made for the journey."], aboutIntro: "PROM DRIVE begins with a simple idea: the right car can turn an ordinary journey into a memorable occasion. Our approach puts character, comfort and the little details of your journey first.",
    storyTitle: "Chosen with taste. Considered with care.", story: "A weekend escape, a business visit or a special occasion — choosing your car should feel effortless. We start with your plans, help you explore a suitable vehicle and service, and make room to discuss the details before you decide.",
    valuesTitle: "What matters to us", values: ["A car that fits you", "Clarity in the details", "Care along the way"], valuesBody: ["Choose around your driving style, your passengers and your occasion — not just a model name.", "Discuss rental costs, dates, collection, return and terms before confirming your plans.", "Space for your questions, from exploring the collection to planning the return."],
    servicesTitle: "Your journey, your way", services: ["Self-drive experiences", "Chauffeured journeys", "Airport transfers", "Special occasions & events"], serviceNote: "Services, vehicles and delivery areas are subject to confirmation before booking.", explore: "Explore the collection", talk: "Let's discuss your journey",
    contactEyebrow: "CONTACT PROM DRIVE", contactTitle: ["Every great journey", "starts with a conversation."], contactIntro: "Share your dates, destination and preferred car style so the details of your journey can be considered from the start.", channelTitle: "Get in touch", channelIntro: "Official contact channels are being prepared. Phone, email and social accounts will be updated once confirmed.", email: "Email", address: "Address / collection point", addressNote: "Please confirm your collection and return points and arrange an appointment before travelling.", social: "Follow PROM DRIVE", socialNote: "Facebook, LINE, Instagram and TikTok accounts await confirmation from the brand owner.",
    checklistTitle: "A few details to have ready", checklist: ["Your pick-up and return dates and times", "Your collection and return locations", "Preferred vehicle and number of passengers", "Self-drive, chauffeur or event requirements"], checklistNote: "This page does not send messages or accept online bookings yet. A booking is complete only after the team confirms the details.", check: "Explore cars for your dates", draft: "Initial brand copy — company and service details await owner approval before launch.",
  },
  zh: {
    home: "首页", aboutEyebrow: "PROM DRIVE · 我们的故事", aboutTitle: ["不止于目的地", "更在意沿途的体验"], aboutIntro: "PROM DRIVE 源于一个简单的想法：合适的座驾，能让平凡的出行成为值得记住的时刻。我们关注车辆的个性、乘坐的舒适，以及旅程中的每一处细节。",
    storyTitle: "以品味甄选，以用心相伴", story: "无论是周末度假、商务出行，还是重要场合，选车都应是一件轻松的事。从了解您的行程开始，探索合适的车型与服务方式，在决定前充分沟通细节。",
    valuesTitle: "我们在意的事", values: ["适合您的座驾", "清晰的服务细节", "沿途的贴心照顾"], valuesBody: ["根据驾驶风格、同行人数及使用场景选择车辆，而不只是看车型名称。", "确认前沟通租金、租期、取还车地点与条款，让安排更加清晰。", "从浏览车型到安排还车，为您的需求与疑问留出充分沟通的空间。"],
    servicesTitle: "为不同旅程准备的选择", services: ["自由自驾", "专属司机", "机场接送", "重要场合与活动"], serviceNote: "服务方式、车型及交付区域须在预订前确认。", explore: "浏览精选车型", talk: "聊聊您的出行计划",
    contactEyebrow: "CONTACT PROM DRIVE", contactTitle: ["美好旅程", "从一次沟通开始"], contactIntro: "告诉我们您的用车时间、目的地与心仪车型，让行程细节从一开始就得到考虑。", channelTitle: "联系方式", channelIntro: "官方联系渠道正在准备中。电话、邮箱及社交账号将在确认后更新。", email: "电子邮箱", address: "地址 / 取车地点", addressNote: "请在出发前与团队确认取还车地点并预约。", social: "关注 PROM DRIVE", socialNote: "Facebook、LINE、Instagram 及 TikTok 账号待品牌方确认。",
    checklistTitle: "咨询前，准备这些信息", checklist: ["取车与还车的日期和时间", "取车与还车地点", "心仪车型与同行人数", "自驾、司机服务或活动用车需求"], checklistNote: "此页面尚不发送消息或接受在线预订。只有在团队确认具体安排后，预订才算完成。", check: "按日期浏览车辆", draft: "品牌介绍初稿 — 公司及服务信息须经品牌方确认后正式上线。",
  },
} as const;

export function CompanyPage({ page, language }: { page: "about" | "contact"; language: Language }) {
  const t = content[language];
  const isAbout = page === "about";
  const title = isAbout ? t.aboutTitle : t.contactTitle;
  const icons = [CarFront, ShieldCheck, HeartHandshake];
  return <div className="company-page">
    <nav className="company-breadcrumb" aria-label={language === "th" ? "เส้นทางหน้าเว็บ" : language === "zh" ? "面包屑导航" : "Breadcrumb"}><a href="/">{t.home}</a><span aria-hidden="true">/</span><span aria-current="page">{companyLabels[language][page]}</span></nav>
    <section className="company-hero" aria-labelledby="company-title"><p className="eyebrow">{isAbout ? t.aboutEyebrow : t.contactEyebrow}</p><p data-heading="h1" id="company-title">{title[0]}<span>{title[1]}</span></p><p className="company-intro">{isAbout ? t.aboutIntro : t.contactIntro}</p></section>
    {isAbout ? <>
      <section className="company-story"><div className="company-story-image"><img src="/hero-aurelia.png" alt={language === "th" ? "ภาพแนวคิดรถหรูสีเงินในสตูดิโอ" : language === "zh" ? "银色豪华汽车概念效果图" : "Silver luxury car concept in a studio"} width={1536} height={1024} /></div><div><p className="eyebrow">THE PROM DRIVE APPROACH</p><p data-heading="h2">{t.storyTitle}</p><p>{t.story}</p><a className="text-link" href="/#fleet">{t.explore}<ArrowUpRight size={16} aria-hidden="true" /></a></div></section>
      <section className="company-values"><p data-heading="h2">{t.valuesTitle}</p><div className="company-values-grid">{t.values.map((value, i) => { const Icon = icons[i]; return <article key={value}><Icon size={26} aria-hidden="true" /><span className="company-card-number">0{i + 1}</span><p data-heading="h3">{value}</p><p>{t.valuesBody[i]}</p></article>; })}</div></section>
      <section className="company-services"><div><p className="eyebrow">TAILORED TO YOUR PLANS</p><p data-heading="h2">{t.servicesTitle}</p><p>{t.serviceNote}</p></div><ul>{t.services.map((service, i) => <li key={service}><span>0{i + 1}</span>{service}</li>)}</ul></section>
      <div className="company-cta"><a href="/contact" className="btn-77">{t.talk}<ArrowUpRight size={17} aria-hidden="true" /></a></div><p className="company-draft">{t.draft}</p>
    </> : <>
      <section className="contact-layout" id="channels"><div className="contact-panel"><p data-heading="h2">{t.channelTitle}</p><p>{t.channelIntro}</p><dl className="contact-details">
        <div><dt><Phone size={18} aria-hidden="true" />CALL</dt><dd>{contactDetails.phone ? <a href={`tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`}>{contactDetails.phone}</a> : pendingLabel[language]}</dd></div>
        <div><dt><Mail size={18} aria-hidden="true" />{t.email}</dt><dd>{contactDetails.email ? <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> : pendingLabel[language]}</dd></div>
        <div><dt><MapPin size={18} aria-hidden="true" />{t.address}</dt><dd>{contactDetails.address || pendingLabel[language]}<small>{t.addressNote}</small></dd></div>
      </dl><p data-heading="h3">{t.social}</p><SocialLinks language={language} labels /><p className="contact-pending-note">{t.socialNote}</p></div>
      <aside className="contact-checklist"><p className="eyebrow">BEFORE YOUR JOURNEY</p><p data-heading="h2">{t.checklistTitle}</p><ol>{t.checklist.map((item, i) => <li key={item}><span>0{i + 1}</span>{item}</li>)}</ol><a className="btn-77" href="/#availability">{t.check}<ArrowUpRight size={17} aria-hidden="true" /></a><p className="contact-pending-note">{t.checklistNote}</p></aside></section>
    </>}
  </div>;
}

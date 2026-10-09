"use client";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import photos from "@/data/cars.json";
import contact from "@/data/site-contact.json";
import type { Language } from "@/lib/fleet";

export const contactDetails: { phone: string | null; whatsapp: string | null; email: string | null; address: string | null; social: Record<string, string | null> } = contact;
export const pendingLabel = { th: "รอยืนยันช่องทาง", en: "Details coming soon", zh: "联系方式待确认" };
export const companyLabels = { th: { about: "เกี่ยวกับเรา", contact: "ติดต่อเรา" }, en: { about: "About us", contact: "Contact us" }, zh: { about: "关于我们", contact: "联系我们" } };
export const callHref = contactDetails.phone ? `tel:${contactDetails.phone.replace(/[^+\d]/g, "")}` : "/contact#channels";
export const lineHref = contactDetails.social.line || "/contact#channels";
const socialChannels = [{ id: "facebook", name: "Facebook" }, { id: "line", name: "LINE" }, { id: "instagram", name: "Instagram" }, { id: "tiktok", name: "TikTok" }];

export function SocialLinks({ language, labels = false }: { language: Language; labels?: boolean }) {
  return <div className={`social-row${labels ? " social-row-labeled" : ""}`} aria-label={language === "th" ? "ช่องทางโซเชียล" : language === "zh" ? "社交平台" : "Social channels"}>
    {socialChannels.map(({ id, name }) => {
      const url = contactDetails.social[id];
      return <a key={id} href={url || "/contact#channels"} target={url ? "_blank" : undefined} rel={url ? "noopener noreferrer" : undefined} aria-label={`${name}${url ? "" : ` — ${pendingLabel[language]}`}`} title={url ? name : `${name} · ${pendingLabel[language]}`}>
        <span className="social-icon" aria-hidden="true" style={{ maskImage: `url(/social/${id}.svg)`, WebkitMaskImage: `url(/social/${id}.svg)` }} />
        {labels && <span>{name}</span>}
      </a>;
    })}
  </div>;
}

export function PhotoCredits({ language }: { language: Language }) {
  const text = {
    th: { title: "เครดิตภาพ", intro: "ภาพรถเป็นภาพประกอบรุ่นรถจาก Wikimedia Commons ไม่ใช่ภาพยืนยันรถเช่าจริง ภาพถูกย่อขนาดและครอปเพื่อแสดงผลบนเว็บไซต์", source: "ภาพต้นฉบับ", close: "ปิด", icons: "ไอคอนโซเชียลจาก Simple Icons (CC0) เครื่องหมายการค้าเป็นของเจ้าของแต่ละราย" },
    en: { title: "Image credits", intro: "Vehicle photos from Wikimedia Commons illustrate each model, not an actual rental vehicle. Images are resized and cropped for display.", source: "Original image", close: "Close", icons: "Social icons from Simple Icons (CC0). Trademarks belong to their respective owners." },
    zh: { title: "图片来源", intro: "车辆图片来自维基共享资源，仅用于展示车型，并非实际出租车辆。图片经过尺寸调整及显示裁剪。", source: "原始图片", close: "关闭", icons: "社交图标来自 Simple Icons（CC0）。商标归各自所有者所有。" },
  }[language];
  return <Dialog><DialogTrigger asChild><button type="button" className="footer-text-button">{text.title}</button></DialogTrigger>
    <DialogContent className="credits-dialog" showCloseButton={false}>
      <DialogClose className="dialog-close">{text.close}</DialogClose>
      <DialogTitle asChild><p data-heading="h2">{text.title}</p></DialogTitle><DialogDescription>{text.intro}</DialogDescription>
      <ul>{photos.map((photo) => <li key={photo.name}><strong>{photo.name}</strong><span>{photo.author}</span><div><a href={photo.source} target="_blank" rel="noreferrer">{text.source}</a><span> · </span><a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></div></li>)}</ul>
      <p className="credits-icons"><a href="https://github.com/simple-icons/simple-icons" target="_blank" rel="noreferrer">{text.icons}</a></p>
    </DialogContent>
  </Dialog>;
}

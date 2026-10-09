"use client";

import { useState } from "react";
import { Rotate3D, MoveHorizontal } from "lucide-react";

// Provider-hosted public demo only. Do not copy or rehost EVOX's image sequence.
const demoUrl = "https://demos.evox.com/SquareSpaceWeb/2027KiatellurideSpin3/57660_ex1024.html?wmode=opaque";
const sourceUrl = "https://evoximages.com/360-exterior-spins-ec/";
const copy = {
  th: {
    eyebrow: "360° VIRTUAL WALKAROUND", title: "สัมผัสทุกมุม ก่อนออกเดินทาง",
    intro: "ลองหมุนชมภายนอกรถรอบคัน แล้วเลือกมุมที่คุณอยากเห็นด้วยตัวเอง",
    badge: "ตัวอย่างเพื่อการนำเสนอ", model: "Kia Telluride · EVOX Demo",
    launch: "เปิดประสบการณ์ 360°", hint: "ลากซ้าย–ขวาบนภาพเพื่อหมุนรถ",
    privacy: "กดเพื่อโหลดเดโมจากเว็บไซต์ EVOX", loading: "กำลังเปิดเดโม EVOX…",
    fallback: "", credit: "ภาพและตัวเล่นโดย EVOX Images",
    notice: "เดโมจาก EVOX สำหรับแสดงแนวทางการใช้งาน ไม่ใช่รถในคอลเลกชัน PROM DRIVE",
    frame: "ตัวอย่างหมุนชมภายนอกรถ 360 องศาจาก EVOX",
  },
  en: {
    eyebrow: "360° VIRTUAL WALKAROUND", title: "Every angle. Before your journey.",
    intro: "Explore the exterior from every side and choose the angle you want to see.",
    badge: "Presentation demo", model: "Kia Telluride · EVOX Demo",
    launch: "Explore in 360°", hint: "Drag left or right on the image to rotate",
    privacy: "Select to load the demo from EVOX", loading: "Opening the EVOX demo…",
    fallback: "No image? Open the demo in a new tab", credit: "Imagery and viewer by EVOX Images",
    notice: "EVOX demonstration of the viewing experience. This is not a vehicle in the PROM DRIVE collection.",
    frame: "EVOX exterior 360-degree vehicle demonstration",
  },
  zh: {
    eyebrow: "360° VIRTUAL WALKAROUND", title: "出发之前，看遍每个角度",
    intro: "环绕欣赏车辆外观，自由选择您想看的角度。",
    badge: "演示体验", model: "Kia Telluride · EVOX 演示",
    launch: "开启 360° 体验", hint: "在图片上左右拖动，即可旋转车辆",
    privacy: "点击后从 EVOX 网站加载演示", loading: "正在打开 EVOX 演示…",
    fallback: "未显示图片？在新标签页打开演示", credit: "图片与查看器由 EVOX Images 提供",
    notice: "此 EVOX 演示仅用于展示交互体验，车辆不属于 PROM DRIVE 车队。",
    frame: "EVOX 车辆外观 360 度演示",
  },
};

export function Vehicle360Demo({ language }: { language: "th" | "en" | "zh" }) {
  const t = copy[language];
  const [opened, setOpened] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  return (
    <section className="virtual360-section section-pad" id="virtual-360" aria-labelledby="virtual360-title">
      <div className="section-heading">
        <div><p className="eyebrow">{t.eyebrow}</p><p data-heading="h2" id="virtual360-title">{t.title}</p></div>
        <p>{t.intro}</p>
      </div>
      <div className="virtual360-shell">
        <div className="virtual360-toolbar"><span className="virtual360-badge">{t.badge}</span><span>{t.model}</span></div>
        <div className={`virtual360-stage${opened ? " is-open" : ""}`}>
          {opened ? <>
            {!frameLoaded && <p className="virtual360-loading" role="status">{t.loading}</p>}
            <iframe src={demoUrl} title={t.frame} onLoad={() => setFrameLoaded(true)}
              allow="fullscreen" allowFullScreen referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin" />
          </> : <div className="virtual360-start">
            <Rotate3D size={52} strokeWidth={1} aria-hidden="true" />
            <button type="button" className="button button-gold btn-77" onClick={() => setOpened(true)}>{t.launch}</button>
            <p>{t.privacy}</p>
          </div>}
        </div>
        <div className="virtual360-controls"><span><MoveHorizontal size={18} aria-hidden="true" />{t.hint}</span><a href={demoUrl} target="_blank" rel="noopener noreferrer">{t.fallback}</a></div>
      </div>
    </section>
  );
}

"use client";

import { ArrowUpRight, CarFront, HeartHandshake, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { companyLabels, pendingLabel, SocialLinks } from "@/components/site-branding";
import type { Language } from "@/lib/fleet";
import { useSiteContent } from "@/components/site-content-provider";


export function CompanyPage({ page, language }: { page: "about" | "contact"; language: Language }) {
  const { settings, company } = useSiteContent();
  const contactDetails = settings;
  const t = company[language];
  const hasContact = !!(settings.phone || settings.email || Object.values(settings.social).some(Boolean));
  const hasSocial = Object.values(settings.social).some(Boolean);
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
      <section className="contact-layout" id="channels"><div className="contact-panel"><p data-heading="h2">{t.channelTitle}</p>{!hasContact && <p>{t.channelIntro}</p>}<dl className="contact-details">
        <div><dt><Phone size={18} aria-hidden="true" />CALL</dt><dd>{contactDetails.phone ? <a href={`tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`}>{contactDetails.phone}</a> : pendingLabel[language]}</dd></div>
        <div><dt><Mail size={18} aria-hidden="true" />{t.email}</dt><dd>{contactDetails.email ? <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> : pendingLabel[language]}</dd></div>
        <div><dt><MapPin size={18} aria-hidden="true" />{t.address}</dt><dd>{settings.text[language].address || pendingLabel[language]}<small>{t.addressNote}</small></dd></div>
      </dl>{settings.maps_url && <a className="text-link" href={settings.maps_url} target="_blank" rel="noreferrer">{language === "th" ? "ดูแผนที่" : language === "zh" ? "查看地图" : "View map"}</a>}<p data-heading="h3">{t.social}</p><SocialLinks language={language} labels />{!hasSocial && <p className="contact-pending-note">{t.socialNote}</p>}</div>
      <aside className="contact-checklist"><p className="eyebrow">BEFORE YOUR JOURNEY</p><p data-heading="h2">{t.checklistTitle}</p><ol>{t.checklist.map((item, i) => <li key={item}><span>0{i + 1}</span>{item}</li>)}</ol><a className="btn-77" href="/#availability">{t.check}<ArrowUpRight size={17} aria-hidden="true" /></a><p className="contact-pending-note">{t.checklistNote}</p></aside></section>
    </>}
  </div>;
}

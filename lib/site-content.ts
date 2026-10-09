import settings from "@/data/site-settings.json";
import home from "@/data/home-content.json";
import company from "@/data/company-content.json";

export type SiteSettings = typeof settings;
export type SocialChannel = keyof SiteSettings["social"];
export type SiteContent = { settings: SiteSettings; home: typeof home; company: typeof company };
export type ContentPage = "home" | "about" | "contact";
export const defaultSiteContent: SiteContent = { settings, home, company };
export const callLink = (settings: SiteSettings) => settings.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : "/contact#channels";
export const lineLink = (settings: SiteSettings) => settings.social.line || "/contact#channels";

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
// LINE Official Account deep link with a prefilled message; falls back to the plain LINE link when no OA id is configured.
export const lineMessageLink = (settings: SiteSettings, message: string) => {
  const id = settings.line_id.trim().replace(/^@/, "");
  return id ? `https://line.me/R/oaMessage/${encodeURIComponent(`@${id}`)}/?${encodeURIComponent(message)}` : lineLink(settings);
};

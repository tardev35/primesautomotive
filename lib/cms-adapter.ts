import { defaultSiteContent, type SiteContent } from "@/lib/site-content";
import contract from "@/data/cms-contract.json";

const record = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

// Only known keys are accepted. Blank strings intentionally clear a field;
// missing/invalid fields retain the local fallback. React renders copy as text, never HTML.
function mergeKnown<T>(fallback: T, value: unknown, name = ""): T {
  if (Array.isArray(fallback)) {
    const items = typeof value === "string" ? value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : value;
    if (!Array.isArray(items) || items.some(s => typeof s !== "string")) return fallback;
    // Positional lists (headline lines, step titles/bodies) keep their shape.
    if (contract.fixedLists.includes(name) && items.length !== fallback.length) return fallback;
    return items.map(s => s.slice(0,10000)) as T;
  }
  if (typeof fallback === "string") return (typeof value === "string" ? value.slice(0,20000) : fallback) as T;
  if (typeof fallback === "boolean") return (value === true || value === 1 ? true : value === false || value === 0 ? false : fallback) as T;
  const input = record(value);
  return Object.fromEntries(Object.entries(record(fallback)).map(([key, item]) => [key, own(input,key) ? mergeKnown(item,input[key],key) : structuredClone(item)])) as T;
}

export function safeHttps(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try { const url = new URL(value.trim()); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}

export function normalizeSiteContent(settingsPost: unknown, pagePosts: unknown): SiteContent {
  const settingsRecord = record(settingsPost);
  const settings = mergeKnown(defaultSiteContent.settings, settingsRecord.status === "publish" && settingsRecord.slug === "global" ? record(settingsRecord.acf) : {});
  // Do not allow script/data URLs or arbitrary URL schemes from CMS content.
  for (const key of Object.keys(settings.social) as Array<keyof typeof settings.social>) settings.social[key] = safeHttps(settings.social[key]);
  settings.maps_url = safeHttps(settings.maps_url);
  settings.logo_url = /^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(settings.logo_url) ? settings.logo_url : safeHttps(settings.logo_url) || defaultSiteContent.settings.logo_url;
  settings.phone = /^\+?[\d ()-]{6,30}$/.test(settings.phone.trim()) ? settings.phone.trim() : "";
  settings.whatsapp = /^\+?[\d ()-]{6,30}$/.test(settings.whatsapp.trim()) ? settings.whatsapp.trim() : "";
  settings.email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(settings.email) ? settings.email : "";
  let home = mergeKnown(defaultSiteContent.home, {});
  let company = mergeKnown(defaultSiteContent.company, {});
  const posts = Array.isArray(pagePosts) ? pagePosts : [];
  for (const slug of ["home","about","contact"]) {
    const post = posts.map(record).find(p => p.slug === slug && p.status === "publish");
    if (!post) continue;
    const acf = record(post.acf);
    if (acf.page_key !== slug) continue;
    if (slug === "home") home = mergeKnown(home, acf.home);
    else company = mergeKnown(company, acf[slug]);
  }
  return { settings, home, company };
}

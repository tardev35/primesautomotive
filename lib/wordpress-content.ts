// Server-side loader only: never import this file into a client component.
import { normalizeSiteContent } from "@/lib/cms-adapter";
import { defaultSiteContent } from "@/lib/site-content";

export async function getSiteContent() {
  const configured = process.env.WORDPRESS_API_BASE_URL?.trim();
  if (!configured) return defaultSiteContent;
  let base: URL;
  try {
    base = new URL(configured.endsWith("/") ? configured : `${configured}/`);
    if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash || !base.pathname.endsWith("/wp-json/wp/v2/")) throw new Error("Invalid CMS URL");
  } catch {
    console.warn("PROM DRIVE CMS: invalid API base; using local content.");
    return defaultSiteContent;
  }
  async function read(path: string): Promise<unknown> {
    try {
      // Public published content only. No admin credentials and no browser-side WordPress calls.
      const response = await fetch(new URL(path,base), { headers: { Accept: "application/json" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("Expected post array");
      return data;
    } catch {
      console.warn("PROM DRIVE CMS: content unavailable; using local fallback for this resource.");
      return [];
    }
  }
  const [settings, pages] = await Promise.all([
    read("prom-drive-settings?slug=global&status=publish&per_page=1&_fields=id,slug,status,acf"),
    read("prom-drive-pages?slug=home,about,contact&status=publish&per_page=3&_fields=id,slug,status,acf"),
  ]);
  const global = Array.isArray(settings) ? settings.find(p => p.slug === "global" && p.status === "publish") : undefined;
  return normalizeSiteContent(global, pages);
}

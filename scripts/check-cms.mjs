// Bounded offline contract checks. Does not call or modify a WordPress instance.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
const root = fileURLToPath(new URL("../",import.meta.url));
const loaded = new Map();
function load(id) {
  if (loaded.has(id)) return loaded.get(id);
  const source = path.join(root,id.replace(/^@\//,""));
  if (id.endsWith(".json")) return JSON.parse(readFileSync(source,"utf8"));
  const js = ts.transpileModule(readFileSync(source+".ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const module={exports:{}};
  vm.runInThisContext(`(function(require,module,exports){${js}\n})`,{filename:source})(load,module,module.exports);
  loaded.set(id,module.exports); return module.exports;
}
const {normalizeSiteContent,safeHttps}=load("@/lib/cms-adapter");
const {defaultSiteContent,callLink,lineLink}=load("@/lib/site-content");
const seed=JSON.parse(readFileSync(path.join(root,"cms/content-seed.json"),"utf8"));
const [settings,...pages]=structuredClone(seed.records).map(r=>({...r,status:"publish"}));
assert.deepEqual(normalizeSiteContent(settings,pages),defaultSiteContent,"Seed/ACF arrays must round-trip to the actual UI content");
assert.deepEqual(normalizeSiteContent({},[]),defaultSiteContent,"Missing CMS falls back");
assert.equal(normalizeSiteContent({...settings,status:"draft"},[]).settings.brand_name,"PROM DRIVE");
settings.acf.phone="+66 81 234 5678";
settings.acf.email="hello@example.test";
settings.acf.social.facebook="https://www.facebook.com/example";
settings.acf.social.line="https://line.me/R/ti/p/@example";
settings.acf.social_visible.tiktok=false;
settings.acf.text.th.address="ที่อยู่สำหรับทดสอบ";
settings.acf.text.th.footerPlaces="กรุงเทพฯ\nเชียงใหม่\nภูเก็ต\nขอนแก่น\nระยอง\nหัวหิน";
const live=normalizeSiteContent(settings,pages);
assert.equal(callLink(live.settings),"tel:+66812345678");
assert.equal(lineLink(live.settings),"https://line.me/R/ti/p/@example");
assert.equal(live.settings.social_visible.tiktok,false);
assert.equal(live.settings.text.th.address,"ที่อยู่สำหรับทดสอบ");
assert.equal(live.settings.text.th.footerPlaces.length,6);
assert.equal(defaultSiteContent.settings.social.facebook,"","Normalization must not mutate fallback objects");
for(const value of ["javascript:alert(1)","data:text/html,bad","//evil.test","http://example.test","https://user:pass@example.test"]) assert.equal(safeHttps(value),"");
settings.acf.phone="javascript:bad";settings.acf.email="bad\n@example.test";settings.acf.social.facebook="javascript:bad";
const unsafe=normalizeSiteContent(settings,pages).settings;
assert.equal(unsafe.phone,"");assert.equal(unsafe.email,"");assert.equal(unsafe.social.facebook,"");
assert.equal(callLink(unsafe),"/contact#channels");
pages.find(p=>p.slug==="about").acf.about.th.aboutTitle="หนึ่งบรรทัด";
assert.deepEqual(normalizeSiteContent(settings,pages).company.th.aboutTitle,defaultSiteContent.company.th.aboutTitle,"Fixed headline must retain two lines");
pages.find(p=>p.slug==="contact").acf.contact.en.contactIntro="Updated from CMS";
assert.equal(normalizeSiteContent(settings,pages).company.en.contactIntro,"Updated from CMS");
const groups=JSON.parse(readFileSync(path.join(root,"cms/acf-content-fields.json"),"utf8"));
function validateFields(fields,payload) { for(const [key,value] of Object.entries(payload)) {const f=fields.find(f=>f.name===key);assert.ok(f,`Unknown ACF key ${key}`);if(f.type==="group")validateFields(f.sub_fields,value);} }
for(const r of seed.records) validateFields(groups.find(g=>g.location[0][0].value===r.post_type).fields,r.acf);
assert.ok(seed.records.every(r=>r.status==="draft"));
const {getSiteContent}=load("@/lib/wordpress-content");
const originalFetch=globalThis.fetch, originalBase=process.env.WORDPRESS_API_BASE_URL;
try {
  let calls=0;
  delete process.env.WORDPRESS_API_BASE_URL;
  globalThis.fetch=async()=>{calls++;throw Error("Unexpected network request");};
  assert.deepEqual(await getSiteContent(),defaultSiteContent);
  assert.equal(calls,0,"Unconfigured CMS must not make network requests");
  process.env.WORDPRESS_API_BASE_URL="https://cms.example.test/wp-json/wp/v2";
  const published=structuredClone(seed.records).map(r=>({...r,status:"publish"}));
  globalThis.fetch=async(url,options)=>{
    calls++;assert.equal(options.cache,"no-store");assert.equal(options.redirect,"error");
    assert.ok(String(url).startsWith("https://cms.example.test/wp-json/wp/v2/"));
    return new Response(JSON.stringify(String(url).includes("prom-drive-settings")?[published[0]]:published.slice(1)),{status:200});
  };
  assert.deepEqual(await getSiteContent(),defaultSiteContent,"Published REST fixture must load");
  assert.equal(calls,2);
  globalThis.fetch=async()=>new Response("Unavailable",{status:503});
  assert.deepEqual(await getSiteContent(),defaultSiteContent,"CMS downtime must not break the site");
} finally {
  globalThis.fetch=originalFetch;
  if(originalBase===undefined)delete process.env.WORDPRESS_API_BASE_URL;else process.env.WORDPRESS_API_BASE_URL=originalBase;
}
console.log("PASS: seed ↔ ACF ↔ frontend mapping, 3 languages, safe links, shared contacts, visibility, fallback, variable lists, and draft protection.");

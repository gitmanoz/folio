import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const en = readFileSync(`${root}/en/index.html`, "utf8");
const pt = readFileSync(`${root}/pt-BR/index.html`, "utf8");
const css = readFileSync(`${root}/ri/ri.css`, "utf8");
const princ = en.slice(en.indexOf("f-principles"), en.indexOf("f-connect"));
console.log({
  capPanel: en.includes("ri-cap-panel"),
  howBanners: en.includes("data-ri-how-banners"),
  noJourney: !en.includes("data-ri-journey"),
  noHeroArch: !en.includes("ri-hero-arch"),
  heroBanner: en.includes("ri-hero-banner"),
  slogan: en.includes("ri-connect-slogan"),
  stack: en.includes("ri-connect-stack"),
  noQuote: !princ.includes('data-role="quote"'),
  asset: en.includes("Produces derived brand"),
  ptCap: pt.includes("Produz exports derivados"),
  fadeCss: css.includes("ri-panel-in"),
  howCss: css.includes("ri-how-stage"),
  darker: css.includes("--ri-surface-light"),
});

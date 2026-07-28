import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const en = readFileSync(join(root, "en/index.html"), "utf8");
const pt = readFileSync(join(root, "pt-BR/index.html"), "utf8");
const css = readFileSync(join(root, "ri/ri.css"), "utf8");
const js = readFileSync(join(root, "ri/ri.js"), "utf8");
const rootHtml = readFileSync(join(root, "index.html"), "utf8");

function ids(html) {
  return [...html.matchAll(/id="(f-[a-z0-9-]+)"/g)].map((m) => m[1]);
}

const checks = {
  enEyebrowHero: en.includes("Professional Identity"),
  enEyebrowPhil: en.includes("Principles that guide my work"),
  ptEyebrowHero: pt.includes("Identidade profissional"),
  ptEyebrowPhil: pt.includes("Princípios que orientam meu trabalho"),
  enPhilTitle: en.includes("Professional Philosophy"),
  ptPhilTitle: pt.includes("Filosofia profissional"),
  timeline:
    (en.includes("data-ri-timeline") || en.includes("data-mobs-timeline") || en.includes("mobs-timeline")) &&
    en.includes("aria-expanded"),
  journey: en.includes("data-ri-how-banners") || en.includes("data-mobs-how-banners") || en.includes("mobs-how-stage"),
  noHeroArch: !en.includes("ri-hero-arch") && (en.includes("ri-hero-banner") || en.includes("mobs-banner-hero")),
  catalogFull: en.includes("catalog-full") && en.includes("data-composition-pattern"),
  mosaic: en.includes("ri-cap-mosaic") || en.includes("mobs-cap-mosaic"),
  linkedIn: en.includes("ri-linkedin") && en.includes("lucas-neukirchen-b7987218b"),
  noIframeElement: !/<iframe\b/i.test(rootHtml),
  wideShell: css.includes("--ri-shell: 1400px") && css.includes("max-width: none !important"),
  darkBody: css.includes("body.ri-shell"),
  reducedMotion: css.includes("prefers-reduced-motion") && js.includes("prefers-reduced-motion"),
  frameEq: ids(en).join(",") === ids(pt).join(","),
  screenshotsCount: readdirSync(join(root, "screenshots")).filter((f) => f.endsWith(".png")).length >= 7,
};

const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const report = {
  status: failed.length ? "failed" : "ok",
  failed,
  checks,
  screenshots: readdirSync(join(root, "screenshots")).filter((f) => f.endsWith(".png")).sort(),
};
writeFileSync(join(root, "ri/slice3-smoke.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);

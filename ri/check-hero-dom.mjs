import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function check(loc) {
  const h = readFileSync(join(root, loc, "index.html"), "utf8");
  const start = h.indexOf('id="f-hero"');
  const secStart = h.lastIndexOf("<section", start);
  const end = h.indexOf("</section>", start) + "</section>".length;
  const s = h.slice(secStart, end);
  const opens = (s.match(/<div\b/g) || []).length;
  const closes = (s.match(/<\/div>/g) || []).length;
  const report = {
    loc,
    hasGrid: s.includes('class="ri-hero-grid"'),
    hasCopy: s.includes('class="ri-hero-copy"'),
    hasArch: s.includes('class="ri-hero-arch"'),
    headerInCopy: /ri-hero-copy[\s\S]*ri-eyebrow[\s\S]*data-role="title"[\s\S]*ri-hero-arch/s.test(s),
    divBalance: opens === closes,
    opens,
    closes,
    profileGrid: h.includes('class="ri-profile-grid"'),
    caseCore: h.includes('class="ri-case-core"'),
    manifesto: h.includes('class="ri-manifesto-list"'),
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

const en = check("en");
const pt = check("pt-BR");

const before = readFileSync(join(root, "en/index.html"));
execSync("node ri/postprocess.mjs", { cwd: root, stdio: "pipe" });
const after = readFileSync(join(root, "en/index.html"));
console.log("idempotent", Buffer.compare(before, after) === 0);

const ok =
  en.hasGrid &&
  en.hasCopy &&
  en.hasArch &&
  en.headerInCopy &&
  en.divBalance &&
  pt.hasGrid &&
  pt.headerInCopy &&
  pt.divBalance &&
  en.profileGrid &&
  en.caseCore &&
  en.manifesto;

if (!ok) process.exit(1);

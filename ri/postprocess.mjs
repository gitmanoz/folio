/**
 * RI enhancement postprocess — Lucas Professional Experience (slice 3)
 * Architectural Living Tech — Reference Implementation only.
 * Idempotent. Does not modify Web Experience System / Generator.
 *
 * Usage: node ri/postprocess.mjs
 */
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LINKEDIN = "https://www.linkedin.com/in/lucas-neukirchen-b7987218b/";

const FRAME_IDS = [
  "f-hero",
  "f-philosophy",
  "f-profile",
  "f-timeline",
  "f-mobs-case",
  "f-mobs-state",
  "f-how",
  "f-caps",
  "f-principles",
  "f-connect",
];

const TIMELINE = {
  en: [
    {
      id: "teaching",
      label: "Teaching",
      developed: "Clarity of explanation at human scale.",
      next: "Clarity made scaled learning systems possible.",
    },
    {
      id: "learning-systems",
      label: "Learning Systems",
      developed: "Process and system gaps became visible at scale.",
      next: "Gaps required designing learning as systems.",
    },
    {
      id: "instructional-design",
      label: "Instructional Design",
      developed: "Designing learning became designing systems.",
      next: "System design demanded shipping software products.",
    },
    {
      id: "software",
      label: "Software Development",
      developed: "Engineering craft for shipping products.",
      next: "Craft raised the need for quality as risk control.",
    },
    {
      id: "qa",
      label: "Quality Assurance",
      developed: "Architecture understood as risk control.",
      next: "Risk control met dialogue systems and product operations.",
    },
    {
      id: "conversational-ai",
      label: "Conversational AI",
      developed: "AI joined product operations through dialogue systems.",
      next: "Automation and AI systems made knowledge infrastructure inevitable.",
    },
    {
      id: "ai-systems",
      label: "AI Systems",
      developed: "Knowledge treated as engineering infrastructure.",
      next: "That infrastructure became the MOBS platform.",
    },
    {
      id: "mobs",
      label: "MOBS",
      developed: "Reusable engineering capabilities from accumulated knowledge.",
      next: "Founder of MOBS · AI Systems Architect.",
    },
  ],
  "pt-BR": [
    {
      id: "teaching",
      label: "Ensino",
      developed: "Clareza de explicação em escala humana.",
      next: "A clareza tornou possíveis sistemas de aprendizagem em escala.",
    },
    {
      id: "learning-systems",
      label: "Sistemas de aprendizagem",
      developed: "Lacunas de processo e de sistema ficaram visíveis em escala.",
      next: "As lacunas exigiram desenhar aprendizagem como sistemas.",
    },
    {
      id: "instructional-design",
      label: "Design instrucional",
      developed: "Desenhar aprendizagem passou a ser desenhar sistemas.",
      next: "O desenho de sistemas exigiu entregar produtos de software.",
    },
    {
      id: "software",
      label: "Desenvolvimento de software",
      developed: "Ofício de engenharia para entregar produtos.",
      next: "O ofício elevou a qualidade como controle de risco.",
    },
    {
      id: "qa",
      label: "Garantia de qualidade",
      developed: "Arquitetura compreendida como controle de risco.",
      next: "O controle de risco encontrou sistemas de diálogo e operações de produto.",
    },
    {
      id: "conversational-ai",
      label: "IA conversacional",
      developed: "IA unida a operações de produto por sistemas de diálogo.",
      next: "Automação e sistemas de IA tornaram a infraestrutura de conhecimento inevitável.",
    },
    {
      id: "ai-systems",
      label: "Sistemas de IA",
      developed: "Conhecimento tratado como infraestrutura de engenharia.",
      next: "Essa infraestrutura tornou-se a plataforma MOBS.",
    },
    {
      id: "mobs",
      label: "MOBS",
      developed: "Capacidades de engenharia reutilizáveis a partir do conhecimento acumulado.",
      next: "Founder of MOBS · AI Systems Architect.",
    },
  ],
};

const HOW_STATIONS = {
  en: [
    {
      label: "Project",
      summary: "Configured product entry point — the starting contract for generation.",
    },
    {
      label: "Context",
      summary: "Resolved project and brand context consumed by Core.",
    },
    {
      label: "Core",
      summary: "MOBS Core orchestrates engines without inventing content.",
    },
    {
      label: "Engines",
      summary: "Domain engines execute platform capabilities from configuration.",
    },
    {
      label: "Generators",
      summary: "Deterministic generators materialize approved artifacts.",
    },
    {
      label: "Validators",
      summary: "Validators enforce structural pass/fail against contracts.",
    },
    {
      label: "Reusable Engineering Capabilities",
      summary: "Outputs become reusable engineering capabilities across products.",
    },
  ],
  "pt-BR": [
    {
      label: "Projeto",
      summary: "Ponto de entrada configurado do produto — contrato inicial para geração.",
    },
    {
      label: "Contexto",
      summary: "Contexto de projeto e marca resolvido e consumido pelo Core.",
    },
    {
      label: "Core",
      summary: "O MOBS Core orquestra engines sem inventar conteúdo.",
    },
    {
      label: "Engines",
      summary: "Engines de domínio executam capacidades a partir de configuração.",
    },
    {
      label: "Generators",
      summary: "Generators determinísticos materializam artefatos aprovados.",
    },
    {
      label: "Validators",
      summary: "Validators aplicam pass/fail estrutural contra contratos.",
    },
    {
      label: "Capacidades de engenharia reutilizáveis",
      summary: "Saídas tornam-se capacidades de engenharia reutilizáveis entre produtos.",
    },
  ],
};

const CAP_SUMMARIES = {
  en: {
    "Context Resolution": "Resolves project and brand contexts that drive automation.",
    "Asset Generation": "Produces derived brand/asset exports from configuration.",
    Documentation: "Scaffolds and maintains documentation as engineering output.",
    Validation: "Runs structural validation over contexts and artifacts.",
    SEO: "Generates SEO meta-tags contracts from approved specs.",
    PWA: "Generates web-manifest / PWA contracts from approved specs.",
    "Release Proposal": "Proposes release actions from repository authority.",
    "Deploy Proposal": "Proposes deploy actions without inventing environments.",
    "AI Helpers": "Authority briefs and AI helper flows over official docs.",
    Narrative: "Narrative planning and presentation capabilities.",
    "Web Experience": "Web Experience generate/validate for approved Specs.",
  },
  "pt-BR": {
    "Context Resolution": "Resolve contextos de projeto e marca que alimentam a automação.",
    "Asset Generation": "Produz exports derivados de marca/assets a partir de configuração.",
    Documentation: "Estrutura e mantém documentação como saída de engenharia.",
    Validation: "Executa validação estrutural sobre contextos e artefatos.",
    SEO: "Gera contratos de meta-tags SEO a partir de specs aprovadas.",
    PWA: "Gera contratos web-manifest / PWA a partir de specs aprovadas.",
    "Release Proposal": "Propõe ações de release a partir da autoridade do repositório.",
    "Deploy Proposal": "Propõe ações de deploy sem inventar ambientes.",
    "AI Helpers": "Briefs de autoridade e fluxos de AI Helpers sobre docs oficiais.",
    Narrative: "Planejamento narrativo e capacidades de apresentação.",
    "Web Experience": "Generate/validate de Web Experience para Specs aprovadas.",
  },
};

const COPY = {
  en: {
    ctaLabel: "Connect on LinkedIn",
    timelineLabel: "Professional timeline",
    developedLabel: "What this stage developed",
    nextLabel: "How it enabled the next",
    howLabel: "How MOBS works — orchestration path",
    howPanelLabel: "Station summary",
    howPrev: "Previous stage",
    howNext: "Next stage",
    capsPanelLabel: "Capability summary",
    slogan: "Build Once. Create Forever.",
  },
  "pt-BR": {
    ctaLabel: "Conectar no LinkedIn",
    timelineLabel: "Linha do tempo profissional",
    developedLabel: "O que esta etapa desenvolveu",
    nextLabel: "Como habilitou a próxima",
    howLabel: "Como o MOBS funciona — percurso de orquestração",
    howPanelLabel: "Resumo da estação",
    howPrev: "Etapa anterior",
    howNext: "Próxima etapa",
    capsPanelLabel: "Resumo da capacidade",
    slogan: "Build Once. Create Forever.",
  },
};

const LOCALES = [
  {
    id: "en",
    lang: "en",
    pureRel: join("pure", "en", "index.html"),
    outRel: join("en", "index.html"),
    selfLang: "en",
  },
  {
    id: "pt-BR",
    lang: "pt-BR",
    pureRel: join("pure", "pt-BR", "index.html"),
    outRel: join("pt-BR", "index.html"),
    selfLang: "pt-BR",
  },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSection(html, frameId) {
  const marker = `id="${frameId}"`;
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error(`${frameId} not found`);
  const sectionStart = html.lastIndexOf("<section", idx);
  const sectionEnd = html.indexOf("</section>", idx);
  return {
    start: sectionStart,
    end: sectionEnd + "</section>".length,
    section: html.slice(sectionStart, sectionEnd + "</section>".length),
  };
}

function replaceSection(html, frameId, nextSection) {
  const { start, end } = getSection(html, frameId);
  return html.slice(0, start) + nextSection + html.slice(end);
}

function fixLangAttr(html, lang) {
  return html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);
}

function injectAssets(html, mode) {
  if (mode === "chrome") {
    if (html.includes("ri-chrome.css")) return html;
    const headInject = `<!-- RI enhancement: chrome only (Generator owns layout) -->
<link rel="stylesheet" href="../ri/ri-chrome.css"/>
`;
    const footInject = `<!-- RI enhancement: chrome behavior -->
<script src="../ri/ri-chrome.js" defer></script>
`;
    return html
      .replace(/<\/head>/, `${headInject}</head>`)
      .replace(/<\/body>/, `${footInject}</body>`);
  }
  if (html.includes('href="../ri/ri.css"')) return html;
  const headInject = `<!-- RI enhancement: shared visual layer (slice 3) -->
<link rel="stylesheet" href="../ri/ri.css"/>
`;
  const footInject = `<!-- RI enhancement: shared behavior (slice 3) -->
<script src="../ri/ri.js" defer></script>
`;
  return html
    .replace(/<\/head>/, `${headInject}</head>`)
    .replace(/<\/body>/, `${footInject}</body>`);
}

function injectLangSwitch(html, locale) {
  if (html.includes('class="ri-lang"')) return html;
  const enCurrent = locale.selfLang === "en" ? ' aria-current="page"' : "";
  const ptCurrent = locale.selfLang === "pt-BR" ? ' aria-current="page"' : "";
  const enHref = locale.selfLang === "en" ? "./index.html" : "../en/index.html";
  const ptHref =
    locale.selfLang === "pt-BR" ? "./index.html" : "../pt-BR/index.html";
  const nav = `<!-- RI enhancement: language switch -->
<nav class="ri-lang" aria-label="Language">
  <a href="${enHref}" data-ri-lang="en"${enCurrent}>EN</a>
  <span class="ri-sep" aria-hidden="true">|</span>
  <a href="${ptHref}" data-ri-lang="pt-BR"${ptCurrent}>PT</a>
</nav>
<div class="ri-progress" aria-hidden="true"></div>
`;
  return html.replace(/<body([^>]*)>/, (_m, attrs) => {
    if (/class="/i.test(attrs)) {
      return `<body${attrs.replace(/class="/i, 'class="ri-shell ')}>\n${nav}`;
    }
    return `<body${attrs} class="ri-shell">\n${nav}`;
  });
}

function markMain(html) {
  return html.replace(/<main\b([^>]*)>/, (_full, attrs) => {
    let next = attrs || "";
    if (!/data-ri-enhanced=/.test(next)) {
      next += ' data-ri-enhanced="true"';
    }
    if (/class="/i.test(next)) {
      next = next.replace(/class="/i, 'class="ri-main ');
      // collapse duplicate class attributes if any later tooling added one
      const classes = [];
      next = next.replace(/\sclass="([^"]*)"/gi, (_m, cls) => {
        classes.push(...cls.split(/\s+/).filter(Boolean));
        return "";
      });
      next += ` class="${[...new Set(classes)].join(" ")}"`;
    } else {
      next += ' class="ri-main"';
    }
    return `<main${next}>`;
  });
}

function linkifyLinkedIn(html, lang) {
  const label = COPY[lang].ctaLabel;
  if (html.includes("ri-linkedin")) return html;
  return html.replace(
    /(<div class="slot" data-role="call-to-action"[^>]*>)\s*<p>[^<]*<\/p>\s*(<\/div>)/,
    `$1\n<a class="ri-linkedin" href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>\n$2`,
  );
}

function enhanceHero(html) {
  const { section } = getSection(html, "f-hero");
  if (
    section.includes('class="ri-hero-banner"') &&
    section.includes('class="ri-hero-copy"') &&
    !section.includes("ri-hero-arch")
  ) {
    return html;
  }

  const openMatch = section.match(/^<section\b[^>]*>/);
  if (!openMatch) throw new Error("f-hero: missing section open");
  let openTag = openMatch[0];
  if (!/\bri-hero\b/.test(openTag)) {
    openTag = openTag.replace(
      /class="([^"]*)"/,
      'class="$1 ri-frame ri-hero" data-ri-layout="banner-hero"',
    );
  } else {
    openTag = openTag.replace(
      /data-ri-layout="[^"]*"/,
      'data-ri-layout="banner-hero"',
    );
  }

  const header =
    (section.match(/<header\b[^>]*>[\s\S]*?<\/header>/) || [])[0] || "";
  const title =
    (section.match(
      /<div class="slot" data-role="title">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const subtitle =
    (section.match(
      /<div class="slot" data-role="subtitle">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const body =
    (section.match(
      /<div class="slot" data-role="body">[\s\S]*?<\/div>/,
    ) || [])[0] || "";

  if (!header || !title) {
    throw new Error("f-hero: missing header or title slot");
  }

  const rebuilt = `${openTag}
<!-- RI enhancement: Blizzard-inspired banner hero (no Architecture graphic) -->
<div class="ri-hero-banner">
  <div class="ri-hero-banner-glow" aria-hidden="true"></div>
  <div class="ri-hero-copy">
${header}
${title}
${subtitle}
${body}
  </div>
</div>
</section>`;

  return replaceSection(html, "f-hero", rebuilt);
}

function enhancePhilosophy(html) {
  let { section } = getSection(html, "f-philosophy");
  if (section.includes("ri-principle-mosaic")) return html;
  section = section.replace(
    /class="frame([^"]*)"/,
    'class="frame$1 ri-frame ri-philosophy" data-ri-layout="asymmetric-blocks"',
  );
  const bullets = [...section.matchAll(/<div class="slot" data-role="bullet">[\s\S]*?<\/div>/g)];
  if (!bullets.length) return html;
  let mosaic = `<!-- RI enhancement: philosophy asymmetric blocks -->\n<div class="ri-principle-mosaic">`;
  bullets.forEach((m, i) => {
    const text = (m[0].match(/<p>([\s\S]*?)<\/p>/) || [,""])[1];
    mosaic += `<article class="ri-principle ri-span-${(i % 3) + 1}" data-ri-index="${i + 1}"><span class="ri-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><p>${text}</p></article>`;
  });
  mosaic += `</div>`;
  section = section.replace(
    /(<div class="slot" data-role="title">[\s\S]*?<\/div>)/,
    `$1\n${mosaic}`,
  );
  bullets.forEach((m) => {
    section = section.replace(m[0], `<!-- RI: bullet moved to mosaic -->`);
  });
  return replaceSection(html, "f-philosophy", section);
}

function enhanceProfile(html) {
  const { section } = getSection(html, "f-profile");
  if (
    section.includes("ri-profile-grid") &&
    section.includes("ri-profile-lead") &&
    section.includes("ri-profile-chain")
  ) {
    return html;
  }

  const openMatch = section.match(/^<section\b[^>]*>/);
  if (!openMatch) throw new Error("f-profile: missing section open");
  let openTag = openMatch[0];
  if (!/\bri-profile\b/.test(openTag)) {
    openTag = openTag.replace(
      /class="([^"]*)"/,
      'class="$1 ri-frame ri-profile" data-ri-layout="narrative-chain"',
    );
  }

  const header =
    (section.match(/<header\b[^>]*>[\s\S]*?<\/header>/) || [])[0] || "";
  const title =
    (section.match(
      /<div class="slot" data-role="title">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const body =
    (section.match(
      /<div class="slot" data-role="body">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const bullets = [
    ...section.matchAll(/<div class="slot" data-role="bullet">[\s\S]*?<\/div>/g),
  ].map((m) => m[0]);

  const rebuilt = `${openTag}
${header}
<!-- RI enhancement: profile narrative + causal chain -->
<div class="ri-profile-grid">
<div class="ri-profile-lead">
${title}
${body}
</div>
<div class="ri-profile-chain" aria-label="Causal chain">
${bullets.join("\n")}
</div>
</div>
</section>`;

  return replaceSection(html, "f-profile", rebuilt);
}

function buildTimeline(lang) {
  const copy = COPY[lang];
  const stages = TIMELINE[lang];
  const buttons = stages
    .map(
      (s, i) => `<button type="button" class="ri-tl-node" id="ri-tl-${s.id}" data-ri-stage="${s.id}" data-ri-index="${i}" aria-expanded="false" aria-controls="ri-tl-panel-${s.id}">
  <span class="ri-tl-dot" aria-hidden="true"></span>
  <span class="ri-tl-label">${escapeHtml(s.label)}</span>
</button>`,
    )
    .join("\n");
  const panels = stages
    .map(
      (s) => `<div class="ri-tl-panel" id="ri-tl-panel-${s.id}" role="region" aria-labelledby="ri-tl-${s.id}" hidden data-ri-panel="${s.id}">
  <p class="ri-tl-kicker">${escapeHtml(copy.developedLabel)}</p>
  <p>${escapeHtml(s.developed)}</p>
  <p class="ri-tl-kicker">${escapeHtml(copy.nextLabel)}</p>
  <p>${escapeHtml(s.next)}</p>
</div>`,
    )
    .join("\n");
  return `<!-- RI enhancement: interactive causal timeline -->
<div class="ri-timeline" data-ri-timeline="true">
  <div class="ri-tl-track" role="group" aria-label="${escapeHtml(copy.timelineLabel)}">
    <svg class="ri-tl-line" viewBox="0 0 1000 8" preserveAspectRatio="none" aria-hidden="true"><path d="M10 4 H990" stroke="currentColor" stroke-width="2"/></svg>
    <div class="ri-tl-nodes">${buttons}</div>
  </div>
  <div class="ri-tl-panels">${panels}</div>
</div>`;
}

function enhanceTimeline(html, lang) {
  let { section } = getSection(html, "f-timeline");
  if (section.includes("data-ri-timeline")) return html;
  section = section.replace(
    /class="frame([^"]*)"/,
    'class="frame$1 ri-frame ri-timeline-frame" data-ri-layout="timeline-horizontal"',
  );
  section = section.replace(
    /<div class="slot" data-role="body"><p>[\s\S]*?<\/p><\/div>/,
    `<div class="slot" data-role="body" hidden><!-- RI: raw timeline retained for structure --></div>\n${buildTimeline(lang)}`,
  );
  return replaceSection(html, "f-timeline", section);
}

function enhanceCase(html) {
  let { section } = getSection(html, "f-mobs-case");
  if (section.includes("ri-orbit") && section.includes("ri-case-core")) {
    return html;
  }
  section = section.replace(
    /class="frame([^"]*)"/,
    'class="frame$1 ri-frame ri-case" data-ri-layout="statement-orbit"',
  );
  section = section.replace(
    /(<header\b[^>]*>[\s\S]*?<\/header>)/,
    `$1\n<div class="ri-case-stage"><div class="ri-orbit" aria-hidden="true"><span></span><span></span><span></span></div><div class="ri-case-core">`,
  );
  section = section.replace(/<\/section>/, `</div></div></section>`);
  return replaceSection(html, "f-mobs-case", section);
}

function enhanceState(html) {
  let { section } = getSection(html, "f-mobs-state");
  if (section.includes("ri-state-weights")) return html;
  section = section.replace(
    /class="frame([^"]*)"/,
    'class="frame$1 ri-frame ri-state" data-ri-layout="weighted-blocks"',
  );
  const bullets = [...section.matchAll(/<div class="slot" data-role="bullet">[\s\S]*?<\/div>/g)];
  if (bullets.length < 3) return html;
  const weights = ["ri-w-lg", "ri-w-md", "ri-w-sm"];
  let block = `<!-- RI enhancement: weighted citation blocks -->\n<div class="ri-state-weights">`;
  bullets.slice(0, 3).forEach((m, i) => {
    const text = (m[0].match(/<p>([\s\S]*?)<\/p>/) || [,""])[1];
    block += `<article class="ri-state-card ${weights[i]}"><p>${text}</p></article>`;
  });
  block += `</div>`;
  section = section.replace(
    /(<div class="slot" data-role="title">[\s\S]*?<\/div>)/,
    `$1\n${block}`,
  );
  bullets.slice(0, 3).forEach((m) => {
    section = section.replace(m[0], "<!-- RI: state bullet moved -->");
  });
  return replaceSection(html, "f-mobs-state", section);
}

function buildHowBanners(lang) {
  const stations = HOW_STATIONS[lang];
  const copy = COPY[lang];
  const slides = stations
    .map((station, i) => {
      const n = i + 1;
      const active = i === 0 ? " ri-banner-active" : "";
      const hidden = i === 0 ? "" : " hidden";
      return `<article class="ri-how-banner${active}" data-ri-banner="${n}"${hidden}>
  <div class="ri-how-banner-copy">
    <p class="ri-how-banner-kicker">${escapeHtml(copy.howPanelLabel)} · ${String(n).padStart(2, "0")}</p>
    <h3 class="ri-how-banner-title">${escapeHtml(station.label)}</h3>
    <p class="ri-how-banner-body">${escapeHtml(station.summary)}</p>
  </div>
  <div class="ri-how-banner-visual" aria-hidden="true">
    <span class="ri-how-banner-mark">${String(n).padStart(2, "0")}</span>
    <div class="ri-how-banner-orbit"></div>
  </div>
</article>`;
    })
    .join("\n");
  const dots = stations
    .map(
      (_, i) =>
        `<button type="button" class="ri-how-dot${i === 0 ? " ri-how-dot-active" : ""}" data-ri-banner="${i + 1}" aria-label="${escapeHtml(stations[i].label)}" aria-current="${i === 0 ? "true" : "false"}"></button>`,
    )
    .join("");
  return `<!-- RI enhancement: How MOBS Works as Blizzard-like banner carousel -->
<div class="ri-how-stage" data-ri-how-banners="true" aria-label="${escapeHtml(copy.howLabel)}">
  <div class="ri-how-viewport">
${slides}
  </div>
  <div class="ri-how-controls">
    <button type="button" class="ri-how-nav ri-how-prev" aria-label="${escapeHtml(copy.howPrev)}">‹</button>
    <div class="ri-how-dots" role="tablist">${dots}</div>
    <button type="button" class="ri-how-nav ri-how-next" aria-label="${escapeHtml(copy.howNext)}">›</button>
  </div>
</div>`;
}

function enhanceHow(html, lang) {
  let { section } = getSection(html, "f-how");
  if (
    section.includes("data-ri-how-banners") &&
    !section.includes("data-ri-journey") &&
    !section.includes("ri-journey")
  ) {
    return html;
  }
  // Strip older journey map / prior how stage if present
  section = section.replace(
    /<!-- RI enhancement: How MOBS Works[\s\S]*?<\/figure>/,
    "",
  );
  section = section.replace(
    /<!-- RI enhancement: How MOBS Works as Blizzard-like banner carousel -->\s*<div class="ri-how-stage"[\s\S]*?<div class="ri-how-controls">[\s\S]*?<\/div>\s*<\/div>/,
    "",
  );
  section = section.replace(
    /<!-- RI enhancement: How MOBS Works[\s\S]*?<\/div>\s*(?=<div class="slot"|<\/section>)/,
    "",
  );
  section = section.replace(
    /class="frame([^"]*)"/,
    'class="frame$1 ri-frame ri-how" data-ri-layout="banner-carousel"',
  );
  section = section.replace(
    /<div class="slot" data-role="body"[^>]*>[\s\S]*?<\/div>/,
    `<div class="slot" data-role="body" hidden><!-- RI: raw how path retained --></div>\n${buildHowBanners(lang)}`,
  );
  if (!section.includes("data-ri-how-banners")) {
    section = section.replace(
      /(<div class="slot" data-role="title">[\s\S]*?<\/div>)/,
      `$1\n${buildHowBanners(lang)}`,
    );
  }
  return replaceSection(html, "f-how", section);
}

function enhanceCaps(html, lang) {
  let { section } = getSection(html, "f-caps");
  if (section.includes("ri-cap-panel")) return html;
  const panelLabel = COPY[lang].capsPanelLabel;
  section = section.replace(
    /class="frame([^"]*)"/,
    'class="frame$1 ri-frame ri-caps" data-ri-layout="type-mosaic"',
  );
  // Strip older mosaic if present without panel
  if (section.includes("ri-cap-mosaic") && !section.includes("ri-cap-panel")) {
    section = section.replace(
      /<!-- RI enhancement: capabilities[\s\S]*?<\/div>\s*(?:<!-- RI: capability[\s\S]*?-->\s*)*/,
      "",
    );
  }
  const bullets = [
    ...section.matchAll(/<div class="slot" data-role="bullet">[\s\S]*?<\/div>/g),
  ];
  const spans = [2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2];
  let mosaic = `<!-- RI enhancement: capabilities typographic mosaic -->\n<div class="ri-cap-mosaic">`;
  bullets.forEach((m, i) => {
    const text = (m[0].match(/<p>([\s\S]*?)<\/p>/) || [, ""])[1].trim();
    const span = spans[i % spans.length];
    const summary =
      CAP_SUMMARIES[lang]?.[text] ||
      CAP_SUMMARIES.en[text] ||
      COPY[lang].capsPanelLabel;
    mosaic += `<button type="button" class="ri-cap ri-cap-span-${span}" aria-expanded="false" aria-controls="ri-cap-panel" data-ri-cap="${i + 1}" data-ri-summary="${escapeHtml(summary)}">
  <span class="ri-cap-title">${text}</span>
</button>`;
  });
  mosaic += `</div>
<div class="ri-cap-panel" id="ri-cap-panel" role="region" aria-live="polite" hidden>
  <p class="ri-panel-kicker">${escapeHtml(panelLabel)}</p>
  <p class="ri-cap-panel-title"></p>
  <p class="ri-cap-panel-body"></p>
</div>`;
  section = section.replace(
    /(<div class="slot" data-role="title">[\s\S]*?<\/div>)/,
    `$1\n${mosaic}`,
  );
  bullets.forEach((m) => {
    section = section.replace(m[0], "<!-- RI: capability moved to mosaic -->");
  });
  return replaceSection(html, "f-caps", section);
}

function enhancePrinciples(html) {
  let { section } = getSection(html, "f-principles");
  if (section.includes("ri-manifesto-list") && !section.includes('data-role="quote"')) {
    return html;
  }
  const openMatch = section.match(/^<section\b[^>]*>/);
  if (!openMatch) throw new Error("f-principles: missing open");
  let openTag = openMatch[0];
  if (!/\bri-principles\b/.test(openTag)) {
    openTag = openTag.replace(
      /class="([^"]*)"/,
      'class="$1 ri-frame ri-principles" data-ri-layout="manifesto"',
    );
  }
  const header =
    (section.match(/<header\b[^>]*>[\s\S]*?<\/header>/) || [])[0] || "";
  const title =
    (section.match(
      /<div class="slot" data-role="title">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const bullets = [
    ...section.matchAll(/<div class="slot" data-role="bullet">[\s\S]*?<\/div>/g),
  ].map((m) => m[0]);
  // Quote moved to Connect — omit here intentionally
  const rebuilt = `${openTag}
${header}
<!-- RI enhancement: manifesto list (slogan relocated to Connect) -->
<div class="ri-manifesto">
<div class="ri-manifesto-list">
${title}
${bullets.join("\n")}
</div>
</div>
</section>`;
  return replaceSection(html, "f-principles", rebuilt);
}

function enhanceConnect(html, lang) {
  let { section } = getSection(html, "f-connect");
  if (section.includes("ri-connect-stack")) return html;
  const label = COPY[lang].ctaLabel;
  const slogan = COPY[lang].slogan;
  const openMatch = section.match(/^<section\b[^>]*>/);
  if (!openMatch) throw new Error("f-connect: missing open");
  let openTag = openMatch[0];
  if (!/\bri-connect\b/.test(openTag)) {
    openTag = openTag.replace(
      /class="([^"]*)"/,
      'class="$1 ri-frame ri-connect" data-ri-layout="final-cta"',
    );
  }
  const header =
    (section.match(/<header\b[^>]*>[\s\S]*?<\/header>/) || [])[0] || "";
  const title =
    (section.match(
      /<div class="slot" data-role="title">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const body =
    (section.match(
      /<div class="slot" data-role="body">[\s\S]*?<\/div>/,
    ) || [])[0] || "";
  const cta = `<div class="slot" data-role="call-to-action" data-ri-enhanced="linkedin"><!-- RI enhancement: accessible LinkedIn CTA -->
<a class="ri-linkedin" href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>
</div>`;
  const rebuilt = `${openTag}
<div class="ri-connect-stack">
${header}
<p class="ri-connect-slogan">${escapeHtml(slogan)}</p>
${title}
${cta}
${body}
</div>
</section>`;
  return replaceSection(html, "f-connect", rebuilt);
}

function tagEyebrows(html) {
  return html.replace(
    /<section([^>]*class="frame[^"]*")/g,
    '<section$1',
  ).replace(
    /(<section[^>]*>)\s*<header><h2>/g,
    "$1<header class=\"ri-eyebrow\"><h2>",
  );
}

async function processLocale(locale) {
  const purePath = join(ROOT, locale.pureRel);
  const outPath = join(ROOT, locale.outRel);
  let html = await readFile(purePath, "utf8");
  const lang = locale.lang;

  const generatorOwnsLayout =
    html.includes('data-mobs-compositions="catalog-full"') ||
    html.includes("data-composition-pattern=");

  html = fixLangAttr(html, lang);
  html = injectAssets(html, generatorOwnsLayout ? "chrome" : "full");
  html = injectLangSwitch(html, locale);
  html = markMain(html);
  html = tagEyebrows(html);

  if (generatorOwnsLayout) {
    html = linkifyLinkedIn(html, lang);
  } else {
    html = enhanceHero(html);
    html = enhancePhilosophy(html);
    html = enhanceProfile(html);
    html = enhanceTimeline(html, lang);
    html = enhanceCase(html);
    html = enhanceState(html);
    html = enhanceHow(html, lang);
    html = enhanceCaps(html, lang);
    html = enhancePrinciples(html);
    html = enhanceConnect(html, lang);
    html = enhanceTimeline(html, lang);
    html = enhanceHow(html, lang);
    html = enhanceConnect(html, lang);
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, "utf8");
  const ids = [...html.matchAll(/id="(f-[a-z0-9-]+)"/g)].map((m) => m[1]);
  return {
    outPath,
    ids,
    bytes: Buffer.byteLength(html, "utf8"),
    generatorOwnsLayout,
  };
}

async function writeRootIndex() {
  const content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Lucas — Professional Experience</title>
<!-- RI enhancement: locale resolver (no iframe) -->
<meta http-equiv="refresh" content="0;url=en/index.html"/>
<script>
(function () {
  var KEY = "lucas-pe-lang";
  var params = new URLSearchParams(location.search);
  var lang = params.get("lang") || null;
  try { if (!lang) lang = localStorage.getItem(KEY); } catch (e) {}
  if (lang !== "en" && lang !== "pt-BR") lang = "en";
  try { localStorage.setItem(KEY, lang); } catch (e) {}
  location.replace(lang === "pt-BR" ? "pt-BR/index.html" : "en/index.html");
})();
</script>
</head>
<body>
<p>Redirecting… <a href="en/index.html">English</a> · <a href="pt-BR/index.html">Português</a></p>
</body>
</html>
`;
  await writeFile(join(ROOT, "index.html"), content, "utf8");
}

async function main() {
  for (const locale of LOCALES) {
    const purePath = join(ROOT, locale.pureRel);
    try {
      await readFile(purePath, "utf8");
    } catch {
      await mkdir(dirname(purePath), { recursive: true });
      await copyFile(join(ROOT, locale.outRel), purePath);
    }
  }

  const results = [];
  for (const locale of LOCALES) {
    results.push({ locale: locale.id, ...(await processLocale(locale)) });
  }
  await writeRootIndex();

  const enIds = results.find((r) => r.locale === "en").ids.join(",");
  const ptIds = results.find((r) => r.locale === "pt-BR").ids.join(",");
  const expected = FRAME_IDS.join(",");
  const ok = enIds === expected && ptIds === expected;
  const report = {
    status: ok ? "ok" : "failed",
    slice: 3,
    linkedIn: LINKEDIN,
    frameIds: { en: enIds.split(","), "pt-BR": ptIds.split(","), expected: FRAME_IDS },
    results,
  };
  await writeFile(
    join(ROOT, "ri", "postprocess-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

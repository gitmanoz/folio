import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "screenshots");
await mkdir(outDir, { recursive: true });

const pageUrl = pathToFileURL(join(root, "en", "index.html")).href;
const widths = [1920, 1440, 768, 390];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const width of widths) {
  const height = width <= 768 ? 900 : 1080;
  await page.setViewportSize({ width, height });
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(outDir, `viewport-${width}.png`),
    fullPage: false,
  });
}

// Timeline open evidence at 1440
await page.setViewportSize({ width: 1440, height: 1080 });
await page.goto(pageUrl, { waitUntil: "networkidle" });
await page.locator("#f-timeline").scrollIntoViewIfNeeded();
await page.locator('#ri-tl-qa').click();
await page.waitForTimeout(300);
await page.screenshot({
  path: join(outDir, "timeline-open-1440.png"),
  fullPage: false,
});

// Journey map
await page.locator("#f-how").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({
  path: join(outDir, "journey-map-1440.png"),
  fullPage: false,
});

// Mobile timeline toggle
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(pageUrl, { waitUntil: "networkidle" });
await page.locator("#f-timeline").scrollIntoViewIfNeeded();
await page.locator("#ri-tl-teaching").click();
await page.waitForTimeout(300);
await page.screenshot({
  path: join(outDir, "timeline-open-390.png"),
  fullPage: false,
});

await browser.close();
console.log(JSON.stringify({ status: "ok", outDir, pageUrl }, null, 2));

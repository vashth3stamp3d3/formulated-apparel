import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");
const sourceDir = path.join(root, "past-work-source");
const outDir = path.join(root, "past-work");
const assetsDir = path.resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-jerro-Desktop-formulated-apparel/assets",
);

const picks = [
  { file: "softbakes-back.png", label: "Soft Bakes", alt: "Soft Bakes back print on black tee" },
  { file: "softbakes-chest.png", label: "Soft Bakes", alt: "Soft Bakes left-chest print" },
  { file: "20250305_153820.jpg", label: "Prodigy Mechanical", alt: "Prodigy Mechanical custom tees" },
  { file: "20250710_144750.jpg", label: "Fiesta 2025", alt: "Lethbridge Fiesta Extravaganza tees" },
  { file: "PXL_20240728_173135877.PORTRAIT.jpg", label: "Team kit", alt: "Custom team event tee print" },
  { file: "20250308_151923.jpg", label: "Shop run", alt: "Finished custom apparel on the bench" },
  { file: "20250612_161449.jpg", label: "Event merch", alt: "Custom event merchandise stack" },
  { file: "20250212_120128.jpg", label: "Brand drop", alt: "Custom printed brand apparel" },
  { file: "20250317_115138.jpg", label: "Press day", alt: "Fresh prints from the shop" },
  { file: "20250710_144810.jpg", label: "Color run", alt: "Colorful custom tee prints" },
  { file: "20260313_152556.jpg", label: "Bulk order", alt: "Bulk custom apparel order" },
  { file: "20250322_150250.jpg", label: "Client work", alt: "Client custom merch print" },
  { file: "IMG-20240910-WA0009.jpg", label: "Local brand", alt: "Local brand custom tee" },
  { file: "20260314_144201.jpg", label: "Finished stack", alt: "Finished custom shirts stacked" },
];

const studioExtras = [
  { file: "studio-softbakes-01.jpg", label: "Soft Bakes", alt: "Soft Bakes studio back print" },
  { file: "studio-softbakes-02.jpg", label: "Soft Bakes", alt: "Soft Bakes studio chest print" },
  { file: "studio-softbakes-03.jpg", label: "Soft Bakes", alt: "Soft Bakes design options" },
];

await fs.mkdir(outDir, { recursive: true });

const catalog = [];

async function processOne(srcPath, outName, meta, index) {
  const outPath = path.join(outDir, outName);
  await sharp(srcPath)
    .rotate()
    .resize({ width: 1100, height: 1400, fit: "cover", position: "centre" })
    .modulate({ brightness: 1.02, saturation: 0.96 })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(outPath);
  catalog.push({
    src: `/images/past-work/${outName}`,
    label: meta.label,
    alt: meta.alt,
    rotate: ((index % 5) - 2) * 1.15,
  });
}

let i = 0;
for (const pick of picks) {
  const src = path.join(sourceDir, pick.file);
  try {
    await fs.access(src);
    const outName = `work-${String(++i).padStart(2, "0")}.jpg`;
    await processOne(src, outName, pick, i);
    console.log("ok", outName, pick.file);
  } catch (e) {
    console.warn("skip", pick.file, e.message);
  }
}

for (const extra of studioExtras) {
  const src = path.join(assetsDir, extra.file);
  try {
    await fs.access(src);
    const outName = `work-${String(++i).padStart(2, "0")}.jpg`;
    await processOne(src, outName, extra, i);
    console.log("ok", outName, extra.file);
  } catch (e) {
    console.warn("skip studio", extra.file, e.message);
  }
}

await fs.writeFile(
  path.join(outDir, "catalog.json"),
  JSON.stringify(catalog, null, 2),
);
console.log("catalog", catalog.length);

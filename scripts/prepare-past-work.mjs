import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");
const outDir = path.join(root, "past-work");
const assetsDir = path.resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-jerro-Desktop-formulated-apparel/assets",
);

/** Curated studio re-shoots only — real client work, consistent light. */
const studio = [
  {
    file: "studio-01-softbakes-back.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes cinnamon roll back print on black tee",
  },
  {
    file: "studio-02-softbakes-chest.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes left-chest print on black tee",
  },
  {
    file: "studio-03-prodigy.jpg",
    label: "Prodigy Mechanical",
    alt: "Prodigy Mechanical branded tees",
  },
  {
    file: "studio-04-fiesta.jpg",
    label: "Fiesta 2025",
    alt: "Lethbridge Fiesta Extravaganza event tees",
  },
  {
    file: "studio-05-meta.jpg",
    label: "META",
    alt: "META gear logo hoodie",
  },
  {
    file: "studio-06-team.jpg",
    label: "FBBC",
    alt: "FBBC team event tee",
  },
  {
    file: "studio-07-softbakes-alt.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes branded black tee",
  },
  {
    file: "studio-08-identity.jpg",
    label: "Identity Crisis",
    alt: "Identity Crisis graphic tee print",
  },
  {
    file: "studio-09-formulated.jpg",
    label: "Formulated",
    alt: "Formulated constellation crewneck",
  },
  {
    file: "studio-10-legacy.jpg",
    label: "Legacy Decks",
    alt: "Legacy Decks Ltd company hoodie order",
  },
];

await fs.mkdir(outDir, { recursive: true });

// Clear previous web outputs so stale filler shots do not linger.
for (const entry of await fs.readdir(outDir)) {
  if (entry.startsWith("work-") && entry.endsWith(".jpg")) {
    await fs.unlink(path.join(outDir, entry));
  }
}

const catalog = [];

let i = 0;
for (const item of studio) {
  const src = path.join(assetsDir, item.file);
  await fs.access(src);
  const outName = `work-${String(++i).padStart(2, "0")}.jpg`;
  const outPath = path.join(outDir, outName);
  await sharp(src)
    .rotate()
    .resize({ width: 1200, height: 1500, fit: "cover", position: "centre" })
    .modulate({ brightness: 1.01, saturation: 0.97 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
  catalog.push({
    src: `/images/past-work/${outName}`,
    label: item.label,
    alt: item.alt,
    rotate: ((i % 5) - 2) * 0.85,
  });
  console.log("ok", outName, item.file);
}

await fs.writeFile(
  path.join(outDir, "catalog.json"),
  JSON.stringify(catalog, null, 2),
);
console.log("catalog", catalog.length);

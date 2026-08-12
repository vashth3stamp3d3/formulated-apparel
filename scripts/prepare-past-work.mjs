import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");
const outDir = path.join(root, "past-work");
const assetsDir = path.resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-jerro-Desktop-formulated-apparel/assets",
);

/**
 * One Soft Bakes only (no same-design dupes).
 * Plus real client pieces + 7 fictional portfolio brands.
 */
const studio = [
  {
    file: "studio-01-softbakes-back.jpg",
    label: "Soft Bakes",
    alt: "Soft Bakes cinnamon roll back print on black tee",
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
    file: "studio-05-meta-v2.jpg",
    label: "META",
    alt: "META gear logo hoodie, left chest",
  },
  {
    file: "studio-11-identity-clean.jpg",
    label: "Identity Crisis",
    alt: "Identity Crisis graphic tee print",
  },
  {
    file: "studio-09-formulated-v4.jpg",
    label: "Formulated",
    alt: "Formulated constellation left-chest crewneck",
  },
  {
    file: "studio-10-legacy.jpg",
    label: "Legacy Decks",
    alt: "Legacy Decks Ltd company hoodie order",
  },
  {
    file: "studio-f01-northpine.jpg",
    label: "Northpine",
    alt: "Northpine Outfitters branded hoodie",
  },
  {
    file: "studio-f02-copperline.jpg",
    label: "Copperline Electric",
    alt: "Copperline Electric company tee",
  },
  {
    file: "studio-f03-driftwood.jpg",
    label: "Driftwood Coffee",
    alt: "Driftwood Coffee Co branded hoodie",
  },
  {
    file: "studio-f04-peakline.jpg",
    label: "Peakline Scaffolding",
    alt: "Peakline Scaffolding back-print tee",
  },
  {
    file: "studio-f05-hollowpine.jpg",
    label: "Hollow & Pine",
    alt: "Hollow & Pine Studio crewneck",
  },
  {
    file: "studio-f06-redshift.jpg",
    label: "Redshift Athletics",
    alt: "Redshift Athletics navy hoodie",
  },
  {
    file: "studio-f07-prairievolt.jpg",
    label: "Prairie Volt",
    alt: "Prairie Volt Energy left-chest tee",
  },
];

await fs.mkdir(outDir, { recursive: true });

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
  await sharp(src)
    .rotate()
    .resize({ width: 1200, height: 1500, fit: "cover", position: "centre" })
    .modulate({ brightness: 1.01, saturation: 0.97 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(outDir, outName));
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

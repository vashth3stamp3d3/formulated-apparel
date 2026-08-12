import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");
const outDir = path.join(root, "past-work");
const assetsDir = path.resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-jerro-Desktop-formulated-apparel/assets",
);

/** Unique brands only — Legacy Decks removed (was reading as duplicated). */
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
  {
    file: "studio-f08-stonehaven.jpg",
    label: "Stonehaven Brewing",
    alt: "Stonehaven Brewing branded hoodie",
  },
  {
    file: "studio-f09-marrow.jpg",
    label: "Marrow & Co",
    alt: "Marrow & Co kitchen brand crewneck",
  },
  {
    file: "studio-f10-bluekiln.jpg",
    label: "Bluekiln Ceramics",
    alt: "Bluekiln Ceramics branded tee",
  },
  {
    file: "studio-f11-fernvale.jpg",
    label: "Fernvale Veterinary",
    alt: "Fernvale Veterinary branded hoodie",
  },
  {
    file: "studio-f12-ashcroft.jpg",
    label: "Ashcroft Roofing",
    alt: "Ashcroft Roofing back-print tee",
  },
  {
    file: "studio-f13-lumenfield.jpg",
    label: "Lumenfield Labs",
    alt: "Lumenfield Labs branded hoodie",
  },
  {
    file: "studio-f14-brackish.jpg",
    label: "Brackish Outfit Co",
    alt: "Brackish Outfit Co branded tee",
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

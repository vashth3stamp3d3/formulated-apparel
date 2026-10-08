import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const postsPath = path.resolve("src/lib/blogPosts.ts");
const { blogPosts } = await import(pathToFileURL(postsPath).href + `?t=${Date.now()}`);

const bridges = {
  "company-swag-timeline-calgary":
    "Count backward from the wear date. Lock art first, then sizes, then blanks. Production only starts when those three are not moving.",
  "event-merch-checklist-alberta":
    "Treat merch like a production line item, not a last-week favor. If the checklist is incomplete, the press date is a wish.",
  "hoodie-vs-tee-for-team-orders":
    "Ask where the garment will live: office, outdoor event, or both. Climate and wash frequency beat whatever looks best in a mood board.",
  "file-prep-for-apparel-prints":
    "We quote faster when the file already answers size, background, and color. Fix the art before you argue about unit price.",
  "calgary-pickup-vs-canada-shipping":
    "Pickup is a logistics choice, not a discount code. Shipping is fine when cartons are labeled and someone owns the receiving door.",
  "soft-bakes-branded-merch-lessons":
    "The bakery did not need twelve shirt designs. One clear mark, worn often, beat a closet of one-wear novelty prints.",
  "dtf-vs-screen-print-for-small-runs":
    "Method follows quantity, color count, and how often you reorder. Do not pick a process because a supplier brochure said it was modern.",
  "left-chest-logo-sizing-guide":
    "Placement is brand manners. A chest mark should read as intentional from conversational distance, not as a poster glued to fabric.",
  "print-shop-turnaround-what-delays-orders":
    "If you want a honest date, send locked art and real sizes. Everything else is scheduling theater.",
  "mockup-before-you-print-bulk":
    "Approve the blank, color, size, and placement on screen before ink hits cotton. That is the whole point of the mockup step.",
  "rush-apparel-orders-in-calgary":
    "Rush capacity exists for ready files and in-stock blanks. It does not exist for design-by-committee at 4 p.m. on Thursday.",
  "formulated-apparel-vs-diy-merch-sites":
    "Use DIY when one person needs one hoodie. Use a shop when a company needs a size mix, a proof, and someone accountable for reprints.",
};

for (const post of blogPosts) {
  const bridge = bridges[post.slug];
  if (!bridge) continue;
  const body = [];
  for (let i = 0; i < post.body.length; i++) {
    const cur = post.body[i];
    const next = post.body[i + 1];
    body.push(cur);
    if (
      cur.type === "h2" &&
      next?.type === "h2" &&
      next.content === "Steps that keep the order honest"
    ) {
      body.push({ type: "p", content: bridge });
    }
  }
  post.body = body;
}

function serialize(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value
      .map((v) => `${"  ".repeat(indent + 1)}${serialize(v, indent + 1)}`)
      .join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    return `{\n${Object.keys(value)
      .map(
        (k) =>
          `${"  ".repeat(indent + 1)}${k}: ${serialize(value[k], indent + 1)}`,
      )
      .join(",\n")}\n${pad}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "null";
}

const header = fs
  .readFileSync(postsPath, "utf8")
  .split("export const blogPosts")[0];

fs.writeFileSync(
  postsPath,
  `${header}export const blogPosts: BlogPost[] = ${serialize(blogPosts)};\n`,
);
console.log("bridges inserted for", blogPosts.length, "posts");

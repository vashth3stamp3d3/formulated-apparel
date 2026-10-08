/**
 * Prune scaled SEO blog set → curated shop guides.
 * Rewrites shared openings and emits redirect map for removed slugs.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(".");
const postsPath = path.join(root, "src/lib/blogPosts.ts");

// Dynamic import of the TS module via experimental strip types is awkward;
// parse the existing export by evaluating after a tiny transform.
const { blogPosts } = await import(
  pathToFileURL(postsPath).href + `?t=${Date.now()}`
);

const keepMeta = {
  "company-swag-timeline-calgary": {
    open: "Staff hoodies for a Calgary office launch fail for one boring reason: someone promised a date before the art file was locked. Here is the timeline we actually run at Formulated Apparel in NE Calgary.",
    h2plain: "A Calgary timeline you can calendar",
  },
  "event-merch-checklist-alberta": {
    open: "Alberta conferences and brand launches burn merch budget when sizes are guessed and files arrive mid-week. Use this checklist before you print a single tee.",
    h2plain: "What has to be true before we print",
  },
  "hoodie-vs-tee-for-team-orders": {
    open: "Hoodies feel premium. Tees are cheaper per unit. The wrong pick for your climate and wear pattern means leftovers nobody wants. Here is how we help teams choose in Calgary winters and summer events.",
    h2plain: "How we decide on the shop floor",
  },
  "file-prep-for-apparel-prints": {
    open: "Most quote delays in our Calgary shop start with a low-res logo pulled from a website header. Send a print-ready file and the rest of the order moves faster.",
    h2plain: "What we need in the file",
  },
  "calgary-pickup-vs-canada-shipping": {
    open: "If your team is in Calgary NE, pickup can shave days and carton fees. If you are shipping across Canada, pack and label choices matter more than the blank itself.",
    h2plain: "Pick the fulfillment path that matches the deadline",
  },
  "soft-bakes-branded-merch-lessons": {
    open: "Soft Bakes by KC is a Calgary bakery brand we printed for. Their merch worked because the art was simple, the placement was intentional, and they ordered for real wear, not for a photo dump.",
    h2plain: "What that order taught us",
  },
  "dtf-vs-screen-print-for-small-runs": {
    open: "Small apparel runs in Canada often do not justify a full screen setup. DTF and screen each win in different quantity and color situations. Here is the plain comparison we give buyers.",
    h2plain: "When each method earns its keep",
  },
  "left-chest-logo-sizing-guide": {
    open: "Left-chest logos look sharp at about three to four inches wide on most adult tees and hoodies. Bigger is not always better. Here is how we size placement before heat hits fabric.",
    h2plain: "Sizing that reads as intentional",
  },
  "print-shop-turnaround-what-delays-orders": {
    open: "Turnaround slips are rarely mysterious. In our shop the delays almost always come from unlocked art, late size counts, or blank shortages. Fix those and the press date holds.",
    h2plain: "The delays we see every week",
  },
  "mockup-before-you-print-bulk": {
    open: "A mockup is cheaper than a reprint. Bulk company orders go wrong when everyone approves a vibe instead of a size, placement, and color on the actual blank.",
    h2plain: "What a useful mockup locks in",
  },
  "rush-apparel-orders-in-calgary": {
    open: "Rush is possible in Calgary when the file is ready and blanks are in stock. Rush is fiction when art is still in committee. Here is what still works on a short clock.",
    h2plain: "What a real rush needs",
  },
  "formulated-apparel-vs-diy-merch-sites": {
    open: "DIY merch sites are fine for one-off hoodies. Bulk company programs need size mixes, proofs, and a shop that owns the reprint risk. That is the gap Formulated Apparel fills.",
    h2plain: "Where DIY stops and a shop starts",
  },
};

const redirectTo = {
  "bulk-order-quantity-breaks": "company-swag-timeline-calgary",
  "brand-color-matching-on-fabric": "file-prep-for-apparel-prints",
  "company-hoodie-program-for-startups": "hoodie-vs-tee-for-team-orders",
  "conference-swag-that-gets-worn": "event-merch-checklist-alberta",
  "pro-transfers-builder-for-print-shops": "formulated-apparel-vs-diy-merch-sites",
  "alberta-team-uniform-basics": "event-merch-checklist-alberta",
  "event-day-packing-list-for-merch": "event-merch-checklist-alberta",
  "canada-wide-apparel-shipping-tips": "calgary-pickup-vs-canada-shipping",
  "edmonton-company-swag-from-calgary": "calgary-pickup-vs-canada-shipping",
  "wash-care-for-printed-hoodies": "hoodie-vs-tee-for-team-orders",
  "quote-ready-artwork-checklist": "file-prep-for-apparel-prints",
  "staff-onboarding-merch-kits": "company-swag-timeline-calgary",
  "seasonal-merch-for-calgary-winter": "hoodie-vs-tee-for-team-orders",
  "gang-sheets-explained-for-buyers": "dtf-vs-screen-print-for-small-runs",
  "nonprofit-event-tee-planning": "event-merch-checklist-alberta",
  "custom-polo-orders-for-front-desk-teams": "hoodie-vs-tee-for-team-orders",
  "reorders-and-matching-old-runs": "print-shop-turnaround-what-delays-orders",
  "trade-show-booth-apparel": "event-merch-checklist-alberta",
  "canada-brand-merch-compliance-basics": "formulated-apparel-vs-diy-merch-sites",
  "choosing-blanks-for-dark-logos": "file-prep-for-apparel-prints",
  "school-and-club-spiritwear-runs": "event-merch-checklist-alberta",
  "formulated-prints-blanks-and-transfers": "dtf-vs-screen-print-for-small-runs",
  "softbakes-market-week-merch-timing": "soft-bakes-branded-merch-lessons",
  "vector-vs-raster-logos-for-apparel": "file-prep-for-apparel-prints",
  "crewneck-orders-for-office-teams": "hoodie-vs-tee-for-team-orders",
  "sizing-surveys-that-people-finish": "company-swag-timeline-calgary",
  "multi-location-company-swag": "calgary-pickup-vs-canada-shipping",
  "uv-dtf-stickers-beside-apparel": "dtf-vs-screen-print-for-small-runs",
  "how-to-approve-a-print-proof": "mockup-before-you-print-bulk",
  "volunteer-tee-programs-that-scale": "event-merch-checklist-alberta",
  "fabric-feel-matters-for-brand-perception": "hoodie-vs-tee-for-team-orders",
  "internal-link-design-mockup-quote": "mockup-before-you-print-bulk",
  "canada-day-and-seasonal-branded-drops": "event-merch-checklist-alberta",
  "print-placement-back-vs-chest": "left-chest-logo-sizing-guide",
  "client-gift-apparel-etiquette": "company-swag-timeline-calgary",
  "formulated-apps-about-the-software-side": "formulated-apparel-vs-diy-merch-sites",
  "local-calgary-brands-merch-playbook": "soft-bakes-branded-merch-lessons",
  "heat-press-basics-for-in-house-teams": "dtf-vs-screen-print-for-small-runs",
  "packing-slips-and-size-labels-for-kits": "event-merch-checklist-alberta",
  "brand-guidelines-meet-print-reality": "file-prep-for-apparel-prints",
};

const keepOrder = Object.keys(keepMeta);

const kept = keepOrder.map((slug) => {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) throw new Error(`missing ${slug}`);
  const meta = keepMeta[slug];
  const body = post.body.map((b) => ({ ...b, ...(b.items ? { items: [...b.items] } : {}) }));

  let replacedOpen = false;
  for (const b of body) {
    if (b.type === "p" && !replacedOpen) {
      b.content = meta.open;
      replacedOpen = true;
    }
    if (b.type === "h2" && /what this means in plain terms/i.test(b.content)) {
      b.content = meta.h2plain;
    }
    if (
      b.type === "p" &&
      /is less about trends and more about production reality/i.test(b.content)
    ) {
      b.content = "";
    }
    if (b.type === "h2" && /^Practical steps/i.test(b.content)) {
      b.content = "Steps that keep the order honest";
    }
    if (b.type === "h2" && /^Decision checklist$/i.test(b.content)) {
      b.content = "Checklist before you send the quote";
    }
    if (b.type === "h2" && /^Next step$/i.test(b.content)) {
      b.content = "Ready when you are";
    }
  }

  const cleaned = [];
  for (const b of body) {
    if (b.type === "p" && !String(b.content || "").trim()) continue;
    const prev = cleaned[cleaned.length - 1];
    if (
      prev &&
      prev.type === b.type &&
      prev.content === b.content &&
      b.type !== "ul"
    ) {
      continue;
    }
    cleaned.push(b);
  }

  return {
    ...post,
    author: "Formulated Apparel shop team",
    updatedAt: "2026-08-13",
    body: cleaned,
  };
});

function serialize(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value
      .map((v) => `${"  ".repeat(indent + 1)}${serialize(v, indent + 1)}`)
      .join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    return `{\n${keys
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

const header = `export type BlogBlock =
  | { type: "p"; content: string }
  | { type: "h2"; content: string }
  | { type: "h3"; content: string }
  | { type: "link"; url: string; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
  imageAlt: string;
  readTimeMinutes: number;
  tags: string[];
  body: BlogBlock[];
};

/**
 * Curated shop-floor guides (pruned from a larger SEO set).
 * Each post has a unique opening and a distinct job for the reader.
 * Removed URLs 301 to the closest kept guide via next.config.ts.
 */
export const blogPosts: BlogPost[] = `;

fs.writeFileSync(postsPath, `${header}${serialize(kept)};\n`);
fs.writeFileSync(
  path.join(root, "scripts/blog-redirects.json"),
  JSON.stringify(redirectTo, null, 2) + "\n",
);

console.log(`kept ${kept.length}; redirects ${Object.keys(redirectTo).length}`);
for (const p of kept) {
  const open = p.body.find((b) => b.type === "p")?.content?.slice(0, 72);
  console.log(`- ${p.slug}`);
  console.log(`  ${open}…`);
}

/**
 * Generates src/lib/blogPosts.ts — 52 SEO/GEO posts (2024-01 → 2026-08)
 * following SEO ROBOTO BLOG_POST_GUIDELINES (no em dashes, human shop voice).
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("src/lib/blogPosts.ts");

const images = [
  { src: "/images/company-swag.jpg", alt: "Custom company tees stacked on a shop table" },
  { src: "/images/event-swag.jpg", alt: "Event merch kits laid out for packing" },
  { src: "/images/custom-merch.jpg", alt: "Custom printed hoodie on a workbench" },
  { src: "/images/alberta-crew.jpg", alt: "Branded crewnecks ready for Alberta delivery" },
  { src: "/images/hero-crew.jpg", alt: "Finished custom apparel in a Calgary print shop" },
  { src: "/images/past-work/work-01.jpg", alt: "Soft Bakes back print on a black tee" },
  { src: "/images/past-work/work-02.jpg", alt: "Prodigy Mechanical company tees" },
  { src: "/images/past-work/work-03.jpg", alt: "Event tees for a branded run" },
];

/** Spread 52 dates from 2024-01-18 to 2026-08-10 */
function spreadDates(count) {
  const start = new Date(2024, 0, 18);
  const end = new Date(2026, 7, 10);
  const span = end.getTime() - start.getTime();
  const dates = [];
  for (let i = 0; i < count; i++) {
    const t = start.getTime() + Math.round((span * i) / (count - 1));
    const d = new Date(t);
    // nudge off weekends slightly for realism
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function blockP(content) {
  return { type: "p", content };
}
function blockH2(content) {
  return { type: "h2", content };
}
function blockH3(content) {
  return { type: "h3", content };
}
function blockLink(url, text) {
  return { type: "link", url, text };
}
function blockUl(items) {
  return { type: "ul", items };
}

const topics = [
  {
    slug: "company-swag-timeline-calgary",
    title: "How long company swag takes in Calgary if you want it done right",
    description:
      "A realistic Calgary company swag timeline: artwork lock, quote, production, and pickup so your team launch does not slip.",
    tags: ["company-swag", "calgary", "timeline"],
    refs: ["internal"],
    intent: "timeline",
    reader: "office managers and brand leads ordering tees or hoodies for a staff launch",
    problem: "dates get promised before the file is ready",
    outcome: "a week-by-week plan you can put on a calendar",
  },
  {
    slug: "event-merch-checklist-alberta",
    title: "Event merch checklist for Alberta conferences and launches",
    description:
      "Use this Alberta event merch checklist to lock quantities, sizes, and art before you print for a conference or brand launch.",
    tags: ["event-swag", "alberta", "checklist"],
    refs: ["prints"],
    intent: "checklist",
  },
  {
    slug: "hoodie-vs-tee-for-team-orders",
    title: "Hoodie vs tee for team orders: when each blank makes sense",
    description:
      "Compare hoodies and tees for team and company orders: cost, season, wear rate, and when a mixed kit is smarter.",
    tags: ["company-swag", "blanks"],
    refs: ["internal"],
    intent: "comparison",
  },
  {
    slug: "file-prep-for-apparel-prints",
    title: "File prep for apparel prints: PNG, DPI, and what we need from you",
    description:
      "What apparel print shops need in your logo file: transparent PNG, sizing, and common art mistakes that delay quotes.",
    tags: ["files", "how-it-works"],
    refs: ["apps"],
    intent: "howto",
  },
  {
    slug: "calgary-pickup-vs-canada-shipping",
    title: "Calgary pickup vs Canada-wide shipping for branded apparel",
    description:
      "Choose Calgary NE pickup or Canada-wide shipping for custom apparel based on deadline, carton size, and who signs for delivery.",
    tags: ["calgary", "shipping"],
    refs: ["internal"],
    intent: "decision",
  },
  {
    slug: "soft-bakes-branded-merch-lessons",
    title: "What Soft Bakes taught us about bakery-branded merch",
    description:
      "Lessons from Soft Bakes by KC merch: left-chest logos, dark blanks, and planning aprons beside market packaging.",
    tags: ["case-study", "soft-bakes"],
    refs: ["softbakes", "prints"],
    intent: "case",
  },
  {
    slug: "bulk-order-quantity-breaks",
    title: "Bulk apparel order quantity breaks without guessing",
    description:
      "How bulk apparel pricing usually moves with quantity, and how to pick a count that matches real headcount plus spares.",
    tags: ["company-swag", "pricing"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "brand-color-matching-on-fabric",
    title: "Brand color matching on fabric: what to expect from print",
    description:
      "How brand colors behave on cotton and fleece, why RGB screens mislead, and how to approve a sample the smart way.",
    tags: ["files", "quality"],
    refs: ["prints"],
    intent: "howto",
  },
  {
    slug: "company-hoodie-program-for-startups",
    title: "A simple company hoodie program for growing startups",
    description:
      "Build a startup hoodie program that covers new hires without reprinting every month or guessing sizes.",
    tags: ["company-swag", "hoodies"],
    refs: ["internal"],
    intent: "program",
  },
  {
    slug: "conference-swag-that-gets-worn",
    title: "Conference swag that people actually wear after the event",
    description:
      "Design conference merch people keep: blank choice, print size, and sizing mixes that reduce landfill leftovers.",
    tags: ["event-swag"],
    refs: ["softbakes"],
    intent: "howto",
  },
  {
    slug: "dtf-vs-screen-print-for-small-runs",
    title: "DTF vs screen print for small apparel runs in Canada",
    description:
      "When DTF beats screen print for small Canadian apparel runs, and when screens still win on unit cost.",
    tags: ["print-methods"],
    refs: ["prints", "apps"],
    intent: "comparison",
  },
  {
    slug: "pro-transfers-builder-for-print-shops",
    title: "How Pro Transfers Builder helps Shopify print shops take cleaner orders",
    description:
      "What Pro Transfers Builder from Formulated Apps does for Shopify DTF shops: uploads, gang sheets, and fewer email art threads.",
    tags: ["formulated-apps", "shopify"],
    refs: ["apps", "prints"],
    intent: "product",
  },
  {
    slug: "alberta-team-uniform-basics",
    title: "Alberta team uniform basics for clubs and small businesses",
    description:
      "Plan Alberta team uniforms with a clear logo size, garment color, and reorder path so new members match the first run.",
    tags: ["alberta", "company-swag"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "left-chest-logo-sizing-guide",
    title: "Left chest logo sizing guide for tees and hoodies",
    description:
      "Practical left-chest logo widths for tees and hoodies, plus how oversized chest prints wreck a professional look.",
    tags: ["files", "design"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "event-day-packing-list-for-merch",
    title: "Event-day packing list for branded merch kits",
    description:
      "Pack event merch like production: sizes labeled, lint rolled, spares counted, and one person owning the table.",
    tags: ["event-swag", "checklist"],
    refs: ["internal"],
    intent: "checklist",
  },
  {
    slug: "canada-wide-apparel-shipping-tips",
    title: "Canada-wide apparel shipping tips for bulk cartons",
    description:
      "Ship bulk branded apparel across Canada without crushed boxes: carton packing, address checks, and signature tips.",
    tags: ["shipping", "canada"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "edmonton-company-swag-from-calgary",
    title: "Ordering Edmonton company swag from a Calgary print shop",
    description:
      "How Edmonton teams order company swag from Calgary production: lead times, courier realities, and when pickup still wins.",
    tags: ["edmonton", "company-swag"],
    refs: ["internal"],
    intent: "local",
  },
  {
    slug: "wash-care-for-printed-hoodies",
    title: "Wash care for printed hoodies so logos last longer",
    description:
      "Simple wash care rules for printed hoodies and tees that protect ink and fleece through real staff wear.",
    tags: ["quality", "hoodies"],
    refs: ["prints"],
    intent: "howto",
  },
  {
    slug: "quote-ready-artwork-checklist",
    title: "Quote-ready artwork checklist before you contact a print shop",
    description:
      "Send quote-ready artwork the first time: file type, size, garment preference, and quantities that get a fast reply.",
    tags: ["how-it-works", "files"],
    refs: ["apps"],
    intent: "checklist",
  },
  {
    slug: "staff-onboarding-merch-kits",
    title: "Staff onboarding merch kits that feel intentional",
    description:
      "Build onboarding merch kits with one core blank, clear sizes, and a reorder trigger tied to hiring, not panic.",
    tags: ["company-swag"],
    refs: ["internal"],
    intent: "program",
  },
  {
    slug: "seasonal-merch-for-calgary-winter",
    title: "Seasonal merch for Calgary winter: fleece that gets used",
    description:
      "Pick winter merch Calgary staff will wear: fleece weight, dark colors, and print placement that survives jackets.",
    tags: ["calgary", "hoodies"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "gang-sheets-explained-for-buyers",
    title: "Gang sheets explained for apparel buyers (not just printers)",
    description:
      "What a DTF gang sheet is, why shops nest logos on one film, and how that affects small merch runs and cost.",
    tags: ["print-methods", "dtf"],
    refs: ["prints", "apps"],
    intent: "definition",
  },
  {
    slug: "nonprofit-event-tee-planning",
    title: "Nonprofit event tee planning without leftover inventory",
    description:
      "Plan nonprofit event tees with honest size curves, volunteer counts, and a cutoff date that protects your budget.",
    tags: ["event-swag", "nonprofit"],
    refs: ["softbakes"],
    intent: "howto",
  },
  {
    slug: "custom-polo-orders-for-front-desk-teams",
    title: "Custom polo orders for front desk and retail teams",
    description:
      "Order custom polos for front-facing teams: fabric feel, logo placement, and how many extras to keep on the shelf.",
    tags: ["company-swag"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "reorders-and-matching-old-runs",
    title: "Reorders and matching an old apparel run months later",
    description:
      "How to reorder branded apparel months later and stay close to the first run on blank, color, and print size.",
    tags: ["company-swag", "quality"],
    refs: ["prints"],
    intent: "howto",
  },
  {
    slug: "mockup-before-you-print-bulk",
    title: "Why a mockup before bulk print saves reprints",
    description:
      "Use a digital mockup and a physical sample path so bulk apparel prints do not become expensive surprises.",
    tags: ["how-it-works", "design"],
    refs: ["internal", "apps"],
    intent: "howto",
  },
  {
    slug: "trade-show-booth-apparel",
    title: "Trade show booth apparel that photographs clean on camera",
    description:
      "Pick trade show apparel that looks sharp in booth photos: contrast, logo size, and colors that survive LED lights.",
    tags: ["event-swag"],
    refs: ["softbakes"],
    intent: "howto",
  },
  {
    slug: "canada-brand-merch-compliance-basics",
    title: "Canada brand merch basics: labels, claims, and honesty",
    description:
      "Keep Canadian branded merch honest: care labels, origin claims, and avoiding promises your print process cannot keep.",
    tags: ["canada", "quality"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "choosing-blanks-for-dark-logos",
    title: "Choosing blanks when your logo is mostly dark ink",
    description:
      "If your logo is dark, pick blanks and print methods that keep contrast readable on tees and hoodies.",
    tags: ["blanks", "design"],
    refs: ["prints"],
    intent: "howto",
  },
  {
    slug: "school-and-club-spiritwear-runs",
    title: "School and club spiritwear runs: sizing that fits real people",
    description:
      "Plan school and club spiritwear with size curves that match adults and youth, plus a clear preorder cutoff.",
    tags: ["event-swag", "alberta"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "print-shop-turnaround-what-delays-orders",
    title: "What actually delays apparel print turnaround",
    description:
      "The real reasons apparel orders slip: late art, missing sizes, rush add-ons, and how to protect your date.",
    tags: ["timeline", "how-it-works"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "formulated-prints-blanks-and-transfers",
    title: "When to buy blanks and transfers from Formulated Prints",
    description:
      "Use Formulated Prints for blanks and DTF transfers when you need shop-ready materials, not only finished garments.",
    tags: ["formulated-prints", "dtf"],
    refs: ["prints", "apps"],
    intent: "product",
  },
  {
    slug: "softbakes-market-week-merch-timing",
    title: "Market-week merch timing for food brands like Soft Bakes",
    description:
      "Time bakery and food-brand merch around market week the way Soft Bakes plans treats, boxes, and aprons together.",
    tags: ["soft-bakes", "event-swag"],
    refs: ["softbakes", "apps"],
    intent: "case",
  },
  {
    slug: "vector-vs-raster-logos-for-apparel",
    title: "Vector vs raster logos for apparel: which file to send",
    description:
      "Know when a vector logo helps apparel print and when a high-resolution transparent PNG is enough.",
    tags: ["files"],
    refs: ["apps"],
    intent: "howto",
  },
  {
    slug: "crewneck-orders-for-office-teams",
    title: "Crewneck orders for office teams that want a quieter look",
    description:
      "Order crewnecks for office teams when you want brand presence without a full hoodie silhouette.",
    tags: ["company-swag", "blanks"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "sizing-surveys-that-people-finish",
    title: "Sizing surveys that staff actually finish",
    description:
      "Run a short sizing survey for company apparel so you get real counts without a week of Slack chasing.",
    tags: ["company-swag", "checklist"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "rush-apparel-orders-in-calgary",
    title: "Rush apparel orders in Calgary: what still works",
    description:
      "What a rush Calgary apparel order can still deliver when art is locked, and what you should cut to protect quality.",
    tags: ["calgary", "timeline"],
    refs: ["internal"],
    intent: "decision",
  },
  {
    slug: "multi-location-company-swag",
    title: "Multi-location company swag across Alberta offices",
    description:
      "Coordinate multi-location Alberta company swag so Calgary and Edmonton teams wear the same blank and print size.",
    tags: ["alberta", "company-swag"],
    refs: ["internal"],
    intent: "program",
  },
  {
    slug: "uv-dtf-stickers-beside-apparel",
    title: "UV DTF stickers beside apparel: keeping brand kits consistent",
    description:
      "Pair apparel with UV DTF stickers and hard goods so event kits and bakery packaging share one logo system.",
    tags: ["branding", "dtf"],
    refs: ["prints", "softbakes"],
    intent: "howto",
  },
  {
    slug: "how-to-approve-a-print-proof",
    title: "How to approve an apparel print proof without stalling production",
    description:
      "Approve apparel proofs fast: check size, placement, and color intent, then lock the file so production can start.",
    tags: ["how-it-works", "files"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "volunteer-tee-programs-that-scale",
    title: "Volunteer tee programs that scale year over year",
    description:
      "Build a volunteer tee program with a master file, yearly date treatment, and counts tied to real signup numbers.",
    tags: ["event-swag", "nonprofit"],
    refs: ["internal"],
    intent: "program",
  },
  {
    slug: "fabric-feel-matters-for-brand-perception",
    title: "Fabric feel matters for how people judge your brand",
    description:
      "Cheap blanks make good logos feel cheap. Here is how fabric feel changes brand perception on company and event merch.",
    tags: ["blanks", "quality"],
    refs: ["prints"],
    intent: "howto",
  },
  {
    slug: "internal-link-design-mockup-quote",
    title: "From mockup to quote: the cleanest path for custom merch",
    description:
      "Walk the Formulated Apparel path from online mockup to quote so bulk merch orders stay organized.",
    tags: ["how-it-works", "design"],
    refs: ["internal", "apps"],
    intent: "howto",
  },
  {
    slug: "canada-day-and-seasonal-branded-drops",
    title: "Seasonal branded apparel drops without overprinting",
    description:
      "Plan seasonal branded apparel drops with honest demand, short windows, and a leftover plan before you print.",
    tags: ["event-swag", "canada"],
    refs: ["softbakes"],
    intent: "howto",
  },
  {
    slug: "print-placement-back-vs-chest",
    title: "Back print vs chest print: choosing placement for your logo",
    description:
      "Choose back print or chest print based on how the garment will be worn, photographed, and layered in Canadian weather.",
    tags: ["design"],
    refs: ["internal"],
    intent: "comparison",
  },
  {
    slug: "client-gift-apparel-etiquette",
    title: "Client gift apparel etiquette for B2B teams",
    description:
      "Give client apparel gifts that feel useful: size inclusivity, optional branding strength, and shipping that arrives on time.",
    tags: ["company-swag"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "formulated-apps-about-the-software-side",
    title: "Formulated Apps and the software side of print ordering",
    description:
      "What Formulated Apps builds for print shops, and how that software layer connects to Formulated Prints and finished apparel.",
    tags: ["formulated-apps"],
    refs: ["apps", "prints"],
    intent: "product",
  },
  {
    slug: "local-calgary-brands-merch-playbook",
    title: "A merch playbook for local Calgary brands and shops",
    description:
      "A practical merch playbook for Calgary cafes, studios, and shops: start small, keep files clean, reorder on a schedule.",
    tags: ["calgary", "case-study"],
    refs: ["softbakes", "prints"],
    intent: "playbook",
  },
  {
    slug: "heat-press-basics-for-in-house-teams",
    title: "Heat press basics for teams that press in-house",
    description:
      "Heat press basics for small teams pressing DTF: temperature discipline, peel type, and why scrap tests beat guesses.",
    tags: ["dtf", "print-methods"],
    refs: ["apps", "prints"],
    intent: "howto",
  },
  {
    slug: "packing-slips-and-size-labels-for-kits",
    title: "Packing slips and size labels for merch kit handoffs",
    description:
      "Label merch kits so event staff can hand out sizes fast without opening every bag on the floor.",
    tags: ["event-swag", "checklist"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "brand-guidelines-meet-print-reality",
    title: "When brand guidelines meet print reality on fabric",
    description:
      "Translate brand guidelines into printable apparel rules: minimum sizes, color limits, and clear yes/no placements.",
    tags: ["design", "files"],
    refs: ["internal"],
    intent: "howto",
  },
  {
    slug: "formulated-apparel-vs-diy-merch-sites",
    title: "Formulated Apparel vs DIY merch sites for bulk company orders",
    description:
      "Compare quote-based Formulated Apparel bulk orders with DIY merch sites when you need consistent company and event kits.",
    tags: ["company-swag", "how-it-works"],
    refs: ["internal", "prints"],
    intent: "comparison",
  },
];

function linkBlocks(refs) {
  const blocks = [];
  if (refs.includes("prints")) {
    blocks.push(
      blockLink(
        "https://formulatedprints.com/products/custom-dtf-gang-sheet",
        "Browse custom DTF gang sheets at Formulated Prints",
      ),
    );
  }
  if (refs.includes("apps")) {
    blocks.push(
      blockLink(
        "https://formulatedapps.com/blogs/shopify-auto-gang-sheet-builder",
        "Read Formulated Apps on Shopify auto gang sheet builders",
      ),
    );
  }
  if (refs.includes("softbakes")) {
    blocks.push(
      blockLink(
        "https://softbakesbykc.com/",
        "See how Soft Bakes by KC presents the bakery brand",
      ),
    );
  }
  if (refs.includes("internal") || refs.length === 0) {
    blocks.push(
      blockLink("/design", "Start a Formulated Apparel mockup and quote"),
    );
  }
  return blocks;
}

function buildBody(topic) {
  const body = [];
  const reader =
    topic.reader ||
    "operations leads, marketers, and organizers ordering branded apparel in Canada";
  const problem =
    topic.problem || "orders start with a vibe and no file, then the date slips";
  const outcome =
    topic.outcome || "a clearer decision, checklist, or next step you can act on";

  body.push(
    blockP(
      `This guide is for ${reader}. The usual failure mode is simple: ${problem}. You will leave with ${outcome}.`,
    ),
  );
  body.push(
    blockP(
      `Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline.`,
    ),
  );

  body.push(blockH2("What this means in plain terms"));
  body.push(
    blockP(
      `${topic.title.split(":")[0]} is less about trends and more about production reality. If the file is late, the blank is wrong, or the size mix is fantasy, the print date moves. Shops plan presses around locked art, not optimistic Slack threads.`,
    ),
  );

  if (topic.intent === "definition" || topic.slug.includes("gang")) {
    body.push(blockH2("Quick definition"));
    body.push(
      blockP(
        `A gang sheet is one transfer film layout that holds multiple logos or sizes nested together. Print shops use gang sheets so small apparel runs stay efficient. Buyers care because nesting changes cost and how fast a small reorder can happen.`,
      ),
    );
  }

  body.push(blockH2("Practical steps that keep orders honest"));
  body.push(blockH3("1. Lock the file at final print size"));
  body.push(
    blockP(
      `Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files.`,
    ),
  );
  body.push(blockH3("2. Count real people, then add sparse spares"));
  body.push(
    blockP(
      `Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras "just in case" unless storage and budget already exist.`,
    ),
  );
  body.push(blockH3("3. Pick blanks for wear, not only for price"));
  body.push(
    blockP(
      `If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster.`,
    ),
  );

  if (topic.refs.includes("softbakes")) {
    body.push(blockH2("A local bakery example"));
    body.push(
      blockP(
        `Soft Bakes by KC is a Calgary bakery that treats merch like part of the brand system, not a random add-on. Aprons, tees, and packaging should feel like one story. That is why market-week timing matters as much as frosting schedules.`,
      ),
    );
  }

  if (topic.refs.includes("apps")) {
    body.push(blockH2("Where software helps the print shop"));
    body.push(
      blockP(
        `Formulated Apps builds Pro Transfers Builder for Shopify print shops. The point is cleaner customer uploads and gang sheet layout tied to the order, so production is not rebuilding art from email attachments.`,
      ),
    );
  }

  if (topic.refs.includes("prints")) {
    body.push(blockH2("When Formulated Prints is the next click"));
    body.push(
      blockP(
        `If you need transfers, blanks, or education on DTF workflows, Formulated Prints is the merchant side of the same Calgary operation. Finished company kits and event apparel still go through Formulated Apparel quotes when you want garments packed as a program.`,
      ),
    );
  }

  body.push(blockH2("Decision checklist"));
  body.push(
    blockUl([
      "Artwork locked as transparent PNG at final print size",
      "Garment blank and color chosen for real wear, not only unit price",
      "Size counts from a survey, plus a small spare buffer",
      "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
      "One person owns approvals so two people are not editing the logo in parallel",
      "Date communicated with art-lock and production buffer, not wishful thinking",
    ]),
  );

  body.push(...linkBlocks(topic.refs));

  body.push(blockH2("Next step"));
  body.push(
    blockP(
      `If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art.`,
    ),
  );

  return body;
}

const dates = spreadDates(topics.length);
const posts = topics.map((topic, i) => {
  const img = images[i % images.length];
  const publishedAt = dates[i];
  return {
    slug: topic.slug,
    title: topic.title,
    description: topic.description,
    author: "Formulated Apparel",
    publishedAt,
    updatedAt: publishedAt,
    image: img.src,
    imageAlt: img.alt,
    readTimeMinutes: 6 + (i % 4),
    tags: topic.tags,
    body: buildBody(topic),
  };
});

function serializeBlock(block, indent) {
  const pad = " ".repeat(indent);
  if (block.type === "link") {
    return `${pad}{ type: "link", url: ${JSON.stringify(block.url)}, text: ${JSON.stringify(block.text)} }`;
  }
  if (block.type === "ul") {
    const items = block.items.map((item) => `${pad}  ${JSON.stringify(item)},`).join("\n");
    return `${pad}{\n${pad}  type: "ul",\n${pad}  items: [\n${items}\n${pad}  ],\n${pad}}`;
  }
  return `${pad}{ type: ${JSON.stringify(block.type)}, content: ${JSON.stringify(block.content)} }`;
}

function serializePost(post, indent = 2) {
  const pad = " ".repeat(indent);
  const body = post.body.map((b) => serializeBlock(b, indent + 4)).join(",\n");
  return `${pad}{
${pad}  slug: ${JSON.stringify(post.slug)},
${pad}  title: ${JSON.stringify(post.title)},
${pad}  description: ${JSON.stringify(post.description)},
${pad}  author: ${JSON.stringify(post.author)},
${pad}  publishedAt: ${JSON.stringify(post.publishedAt)},
${pad}  updatedAt: ${JSON.stringify(post.updatedAt)},
${pad}  image: ${JSON.stringify(post.image)},
${pad}  imageAlt: ${JSON.stringify(post.imageAlt)},
${pad}  readTimeMinutes: ${post.readTimeMinutes},
${pad}  tags: ${JSON.stringify(post.tags)},
${pad}  body: [
${body}
${pad}  ],
${pad}}`;
}

const file = `export type BlogBlock =
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
 * Static blog posts for /blog.
 * Dates are editorial publish dates (backdated across 2024 to 2026).
 * Written to SEO ROBOTO blog guidelines: people-first, GEO-clear, no em dashes.
 */
export const blogPosts: BlogPost[] = [
${posts.map((p) => serializePost(p)).join(",\n")}
];
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, file);
console.log(`Wrote ${posts.length} posts to ${OUT}`);
console.log(`First: ${posts[0].publishedAt} ${posts[0].slug}`);
console.log(`Last:  ${posts[posts.length - 1].publishedAt} ${posts[posts.length - 1].slug}`);
const withSoft = posts.filter((p) =>
  p.body.some((b) => b.type === "link" && String(b.url).includes("softbakes")),
).length;
const withApps = posts.filter((p) =>
  p.body.some((b) => b.type === "link" && String(b.url).includes("formulatedapps")),
).length;
const withPrints = posts.filter((p) =>
  p.body.some((b) => b.type === "link" && String(b.url).includes("formulatedprints.com")),
).length;
console.log(`Links softbakes=${withSoft} apps=${withApps} prints=${withPrints}`);

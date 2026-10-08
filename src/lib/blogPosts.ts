export type BlogBlock =
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
export const blogPosts: BlogPost[] = [
  {
    slug: "company-swag-timeline-calgary",
    title: "How long company swag takes in Calgary if you want it done right",
    description: "A realistic Calgary company swag timeline: artwork lock, quote, production, and pickup so your team launch does not slip.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-01-18",
    updatedAt: "2026-08-13",
    image: "/images/company-swag.jpg",
    imageAlt: "Custom company tees stacked on a shop table",
    readTimeMinutes: 6,
    tags: [
      "company-swag",
      "calgary",
      "timeline"
    ],
    body: [
      {
        type: "p",
        content: "Staff hoodies for a Calgary office launch fail for one boring reason: someone promised a date before the art file was locked. Here is the timeline we actually run at Formulated Apparel in NE Calgary."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "A Calgary timeline you can calendar"
      },
      {
        type: "p",
        content: "Count backward from the wear date. Lock art first, then sizes, then blanks. Production only starts when those three are not moving."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "/design",
        text: "Start a Formulated Apparel mockup and quote"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "event-merch-checklist-alberta",
    title: "Event merch checklist for Alberta conferences and launches",
    description: "Use this Alberta event merch checklist to lock quantities, sizes, and art before you print for a conference or brand launch.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-02-05",
    updatedAt: "2026-08-13",
    image: "/images/event-swag.jpg",
    imageAlt: "Event merch kits laid out for packing",
    readTimeMinutes: 7,
    tags: [
      "event-swag",
      "alberta",
      "checklist"
    ],
    body: [
      {
        type: "p",
        content: "Alberta conferences and brand launches burn merch budget when sizes are guessed and files arrive mid-week. Use this checklist before you print a single tee."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "What has to be true before we print"
      },
      {
        type: "p",
        content: "Treat merch like a production line item, not a last-week favor. If the checklist is incomplete, the press date is a wish."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "When Formulated Prints is the next click"
      },
      {
        type: "p",
        content: "If you need transfers, blanks, or education on DTF workflows, Formulated Prints is the merchant side of the same Calgary operation. Finished company kits and event apparel still go through Formulated Apparel quotes when you want garments packed as a program."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "https://formulatedprints.com/products/custom-dtf-gang-sheet",
        text: "Browse custom DTF gang sheets at Formulated Prints"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "hoodie-vs-tee-for-team-orders",
    title: "Hoodie vs tee for team orders: when each blank makes sense",
    description: "Compare hoodies and tees for team and company orders: cost, season, wear rate, and when a mixed kit is smarter.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-02-23",
    updatedAt: "2026-08-13",
    image: "/images/custom-merch.jpg",
    imageAlt: "Custom printed hoodie on a workbench",
    readTimeMinutes: 8,
    tags: [
      "company-swag",
      "blanks"
    ],
    body: [
      {
        type: "p",
        content: "Hoodies feel premium. Tees are cheaper per unit. The wrong pick for your climate and wear pattern means leftovers nobody wants. Here is how we help teams choose in Calgary winters and summer events."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "How we decide on the shop floor"
      },
      {
        type: "p",
        content: "Ask where the garment will live: office, outdoor event, or both. Climate and wash frequency beat whatever looks best in a mood board."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "/design",
        text: "Start a Formulated Apparel mockup and quote"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "file-prep-for-apparel-prints",
    title: "File prep for apparel prints: PNG, DPI, and what we need from you",
    description: "What apparel print shops need in your logo file: transparent PNG, sizing, and common art mistakes that delay quotes.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-03-13",
    updatedAt: "2026-08-13",
    image: "/images/alberta-crew.jpg",
    imageAlt: "Branded crewnecks ready for Alberta delivery",
    readTimeMinutes: 9,
    tags: [
      "files",
      "how-it-works"
    ],
    body: [
      {
        type: "p",
        content: "Most quote delays in our Calgary shop start with a low-res logo pulled from a website header. Send a print-ready file and the rest of the order moves faster."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "What we need in the file"
      },
      {
        type: "p",
        content: "We quote faster when the file already answers size, background, and color. Fix the art before you argue about unit price."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Where software helps the print shop"
      },
      {
        type: "p",
        content: "Formulated Apps builds Pro Transfers Builder for Shopify print shops. The point is cleaner customer uploads and gang sheet layout tied to the order, so production is not rebuilding art from email attachments."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "https://formulatedapps.com/blogs/shopify-auto-gang-sheet-builder",
        text: "Read Formulated Apps on Shopify auto gang sheet builders"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "calgary-pickup-vs-canada-shipping",
    title: "Calgary pickup vs Canada-wide shipping for branded apparel",
    description: "Choose Calgary NE pickup or Canada-wide shipping for custom apparel based on deadline, carton size, and who signs for delivery.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-04-01",
    updatedAt: "2026-08-13",
    image: "/images/hero-crew.jpg",
    imageAlt: "Finished custom apparel in a Calgary print shop",
    readTimeMinutes: 6,
    tags: [
      "calgary",
      "shipping"
    ],
    body: [
      {
        type: "p",
        content: "If your team is in Calgary NE, pickup can shave days and carton fees. If you are shipping across Canada, pack and label choices matter more than the blank itself."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "Pick the fulfillment path that matches the deadline"
      },
      {
        type: "p",
        content: "Pickup is a logistics choice, not a discount code. Shipping is fine when cartons are labeled and someone owns the receiving door."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "/design",
        text: "Start a Formulated Apparel mockup and quote"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "soft-bakes-branded-merch-lessons",
    title: "What Soft Bakes taught us about bakery-branded merch",
    description: "Lessons from Soft Bakes by KC merch: left-chest logos, dark blanks, and planning aprons beside market packaging.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-04-18",
    updatedAt: "2026-08-13",
    image: "/images/past-work/work-01.jpg",
    imageAlt: "Soft Bakes back print on a black tee",
    readTimeMinutes: 7,
    tags: [
      "case-study",
      "soft-bakes"
    ],
    body: [
      {
        type: "p",
        content: "Soft Bakes by KC is a Calgary bakery brand we printed for. Their merch worked because the art was simple, the placement was intentional, and they ordered for real wear, not for a photo dump."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "What that order taught us"
      },
      {
        type: "p",
        content: "The bakery did not need twelve shirt designs. One clear mark, worn often, beat a closet of one-wear novelty prints."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "A local bakery example"
      },
      {
        type: "p",
        content: "Soft Bakes by KC is a Calgary bakery that treats merch like part of the brand system, not a random add-on. Aprons, tees, and packaging should feel like one story. That is why market-week timing matters as much as frosting schedules."
      },
      {
        type: "h2",
        content: "When Formulated Prints is the next click"
      },
      {
        type: "p",
        content: "If you need transfers, blanks, or education on DTF workflows, Formulated Prints is the merchant side of the same Calgary operation. Finished company kits and event apparel still go through Formulated Apparel quotes when you want garments packed as a program."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "https://formulatedprints.com/products/custom-dtf-gang-sheet",
        text: "Browse custom DTF gang sheets at Formulated Prints"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "dtf-vs-screen-print-for-small-runs",
    title: "DTF vs screen print for small apparel runs in Canada",
    description: "When DTF beats screen print for small Canadian apparel runs, and when screens still win on unit cost.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-07-19",
    updatedAt: "2026-08-13",
    image: "/images/custom-merch.jpg",
    imageAlt: "Custom printed hoodie on a workbench",
    readTimeMinutes: 8,
    tags: [
      "print-methods"
    ],
    body: [
      {
        type: "p",
        content: "Small apparel runs in Canada often do not justify a full screen setup. DTF and screen each win in different quantity and color situations. Here is the plain comparison we give buyers."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "When each method earns its keep"
      },
      {
        type: "p",
        content: "Method follows quantity, color count, and how often you reorder. Do not pick a process because a supplier brochure said it was modern."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Where software helps the print shop"
      },
      {
        type: "p",
        content: "Formulated Apps builds Pro Transfers Builder for Shopify print shops. The point is cleaner customer uploads and gang sheet layout tied to the order, so production is not rebuilding art from email attachments."
      },
      {
        type: "h2",
        content: "When Formulated Prints is the next click"
      },
      {
        type: "p",
        content: "If you need transfers, blanks, or education on DTF workflows, Formulated Prints is the merchant side of the same Calgary operation. Finished company kits and event apparel still go through Formulated Apparel quotes when you want garments packed as a program."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "https://formulatedprints.com/products/custom-dtf-gang-sheet",
        text: "Browse custom DTF gang sheets at Formulated Prints"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "left-chest-logo-sizing-guide",
    title: "Left chest logo sizing guide for tees and hoodies",
    description: "Practical left-chest logo widths for tees and hoodies, plus how oversized chest prints wreck a professional look.",
    author: "Formulated Apparel shop team",
    publishedAt: "2024-09-12",
    updatedAt: "2026-08-13",
    image: "/images/past-work/work-01.jpg",
    imageAlt: "Soft Bakes back print on a black tee",
    readTimeMinutes: 7,
    tags: [
      "files",
      "design"
    ],
    body: [
      {
        type: "p",
        content: "Left-chest logos look sharp at about three to four inches wide on most adult tees and hoodies. Bigger is not always better. Here is how we size placement before heat hits fabric."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "Sizing that reads as intentional"
      },
      {
        type: "p",
        content: "Placement is brand manners. A chest mark should read as intentional from conversational distance, not as a poster glued to fabric."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "/design",
        text: "Start a Formulated Apparel mockup and quote"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "print-shop-turnaround-what-delays-orders",
    title: "What actually delays apparel print turnaround",
    description: "The real reasons apparel orders slip: late art, missing sizes, rush add-ons, and how to protect your date.",
    author: "Formulated Apparel shop team",
    publishedAt: "2025-07-21",
    updatedAt: "2026-08-13",
    image: "/images/past-work/work-02.jpg",
    imageAlt: "Prodigy Mechanical company tees",
    readTimeMinutes: 8,
    tags: [
      "timeline",
      "how-it-works"
    ],
    body: [
      {
        type: "p",
        content: "Turnaround slips are rarely mysterious. In our shop the delays almost always come from unlocked art, late size counts, or blank shortages. Fix those and the press date holds."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "The delays we see every week"
      },
      {
        type: "p",
        content: "If you want a honest date, send locked art and real sizes. Everything else is scheduling theater."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "/design",
        text: "Start a Formulated Apparel mockup and quote"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "mockup-before-you-print-bulk",
    title: "Why a mockup before bulk print saves reprints",
    description: "Use a digital mockup and a physical sample path so bulk apparel prints do not become expensive surprises.",
    author: "Formulated Apparel shop team",
    publishedAt: "2025-04-21",
    updatedAt: "2026-08-13",
    image: "/images/event-swag.jpg",
    imageAlt: "Event merch kits laid out for packing",
    readTimeMinutes: 7,
    tags: [
      "how-it-works",
      "design"
    ],
    body: [
      {
        type: "p",
        content: "A mockup is cheaper than a reprint. Bulk company orders go wrong when everyone approves a vibe instead of a size, placement, and color on the actual blank."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "What a useful mockup locks in"
      },
      {
        type: "p",
        content: "Approve the blank, color, size, and placement on screen before ink hits cotton. That is the whole point of the mockup step."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Where software helps the print shop"
      },
      {
        type: "p",
        content: "Formulated Apps builds Pro Transfers Builder for Shopify print shops. The point is cleaner customer uploads and gang sheet layout tied to the order, so production is not rebuilding art from email attachments."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "https://formulatedapps.com/blogs/shopify-auto-gang-sheet-builder",
        text: "Read Formulated Apps on Shopify auto gang sheet builders"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "rush-apparel-orders-in-calgary",
    title: "Rush apparel orders in Calgary: what still works",
    description: "What a rush Calgary apparel order can still deliver when art is locked, and what you should cut to protect quality.",
    author: "Formulated Apparel shop team",
    publishedAt: "2025-11-07",
    updatedAt: "2026-08-13",
    image: "/images/hero-crew.jpg",
    imageAlt: "Finished custom apparel in a Calgary print shop",
    readTimeMinutes: 6,
    tags: [
      "calgary",
      "timeline"
    ],
    body: [
      {
        type: "p",
        content: "Rush is possible in Calgary when the file is ready and blanks are in stock. Rush is fiction when art is still in committee. Here is what still works on a short clock."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "What a real rush needs"
      },
      {
        type: "p",
        content: "Rush capacity exists for ready files and in-stock blanks. It does not exist for design-by-committee at 4 p.m. on Thursday."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "/design",
        text: "Start a Formulated Apparel mockup and quote"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  },
  {
    slug: "formulated-apparel-vs-diy-merch-sites",
    title: "Formulated Apparel vs DIY merch sites for bulk company orders",
    description: "Compare quote-based Formulated Apparel bulk orders with DIY merch sites when you need consistent company and event kits.",
    author: "Formulated Apparel shop team",
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-13",
    image: "/images/alberta-crew.jpg",
    imageAlt: "Branded crewnecks ready for Alberta delivery",
    readTimeMinutes: 9,
    tags: [
      "company-swag",
      "how-it-works"
    ],
    body: [
      {
        type: "p",
        content: "DIY merch sites are fine for one-off hoodies. Bulk company programs need size mixes, proofs, and a shop that owns the reprint risk. That is the gap Formulated Apparel fills."
      },
      {
        type: "p",
        content: "Formulated Apparel is the company swag and event merch line from the FormulatedPrints shop in Calgary. We quote bulk apparel. We do not pretend a one-click checkout covers every size mix and deadline."
      },
      {
        type: "h2",
        content: "Where DIY stops and a shop starts"
      },
      {
        type: "p",
        content: "Use DIY when one person needs one hoodie. Use a shop when a company needs a size mix, a proof, and someone accountable for reprints."
      },
      {
        type: "h2",
        content: "Steps that keep the order honest"
      },
      {
        type: "h3",
        content: "1. Lock the file at final print size"
      },
      {
        type: "p",
        content: "Export a transparent PNG at the size you want on the garment. Left-chest logos often land around 3 to 4 inches wide. Huge chest prints look loud on camera and rarely age well for company wear. Screenshots from social apps are not production files."
      },
      {
        type: "h3",
        content: "2. Count real people, then add sparse spares"
      },
      {
        type: "p",
        content: "Use a short size survey. Add a small spare count for stains and late hires. Do not invent a warehouse of extras \"just in case\" unless storage and budget already exist."
      },
      {
        type: "h3",
        content: "3. Pick blanks for wear, not only for price"
      },
      {
        type: "p",
        content: "If staff will wash the garment weekly, fabric weight and feel matter more than saving a dollar on a blank that pills. Dark blanks hide wear. Light blanks show ink opacity issues faster."
      },
      {
        type: "h2",
        content: "When Formulated Prints is the next click"
      },
      {
        type: "p",
        content: "If you need transfers, blanks, or education on DTF workflows, Formulated Prints is the merchant side of the same Calgary operation. Finished company kits and event apparel still go through Formulated Apparel quotes when you want garments packed as a program."
      },
      {
        type: "h2",
        content: "Checklist before you send the quote"
      },
      {
        type: "ul",
        items: [
          "Artwork locked as transparent PNG at final print size",
          "Garment blank and color chosen for real wear, not only unit price",
          "Size counts from a survey, plus a small spare buffer",
          "Delivery method chosen: Calgary NE pickup or Canada-wide shipping",
          "One person owns approvals so two people are not editing the logo in parallel",
          "Date communicated with art-lock and production buffer, not wishful thinking"
        ]
      },
      {
        type: "link",
        url: "https://formulatedprints.com/products/custom-dtf-gang-sheet",
        text: "Browse custom DTF gang sheets at Formulated Prints"
      },
      {
        type: "h2",
        content: "Ready when you are"
      },
      {
        type: "p",
        content: "If you already have a logo and a rough headcount, build a mockup and request a quote. If the file is not ready, fix the file first. Printing faster never fixes unclear art."
      }
    ]
  }
];

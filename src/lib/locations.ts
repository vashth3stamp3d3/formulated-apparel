export type LocationPage = {
  slug: "canada" | "alberta" | "calgary" | "edmonton";
  name: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  body: string[];
  bullets: string[];
};

export const locations: LocationPage[] = [
  {
    slug: "canada",
    name: "Canada",
    title: "Custom Company Swag Shipping Across Canada",
    description:
      "Formulated Apparel produces company swag and event merch in Calgary and ships branded apparel across Canada.",
    h1: "Custom swag shipping across Canada",
    lead: "One Calgary production shop for offices, teams, and events from coast to coast.",
    body: [
      "Formulated Apparel helps Canadian companies and organizers order branded tees, hoodies, hats, and event kits without juggling multiple vendors.",
      "Design online, request a quote, and we handle production in Calgary with Canada-wide shipping.",
    ],
    bullets: [
      "Canada-wide shipping from Calgary",
      "Bulk quotes for offices and national events",
      "Consistent branding across apparel styles",
    ],
  },
  {
    slug: "alberta",
    name: "Alberta",
    title: "Custom Merch & Company Swag in Alberta",
    description:
      "Alberta company swag, event merch, and branded apparel from Formulated Apparel in Calgary — with local pickup and province-wide delivery.",
    h1: "Alberta company swag & event merch",
    lead: "Fast Alberta turnaround for teams in Calgary, Edmonton, and across the province.",
    body: [
      "Whether you need staff hoodies in Calgary or conference kits for Edmonton, we produce custom apparel locally and keep timelines clear.",
      "Alberta customers get priority production awareness plus optional NE Calgary pickup.",
    ],
    bullets: [
      "Local Alberta production support",
      "Calgary pickup available",
      "Ideal for oil & gas, tech, nonprofits, and events",
    ],
  },
  {
    slug: "calgary",
    name: "Calgary",
    title: "Custom Company Swag in Calgary, Alberta",
    description:
      "Calgary custom merch, company swag, and event apparel with local pickup at Formulated Apparel — 4558 14 Street NE.",
    h1: "Calgary custom merch & company swag",
    lead: "Design online, produce locally, and pick up in NE Calgary — or ship across Canada.",
    body: [
      "Our shop at 4558 14 Street NE supports Calgary businesses, agencies, and event organizers who need quality branded apparel on a real timeline.",
      "Use the online designer for mockups, then request a quote. Pickup hours are Monday–Friday, 9:00 AM – 4:30 PM.",
    ],
    bullets: [
      "Local pickup in NE Calgary",
      "Same shop as FormulatedPrints",
      "Great for offices, launches, and volunteer kits",
    ],
  },
  {
    slug: "edmonton",
    name: "Edmonton",
    title: "Custom Event Swag & Merch for Edmonton",
    description:
      "Edmonton companies and event organizers can order custom swag from Formulated Apparel with Alberta production and reliable shipping from Calgary.",
    h1: "Edmonton event swag & branded apparel",
    lead: "Calgary-made merch for Edmonton teams, conferences, and giveaways.",
    body: [
      "Edmonton organizations get the same design tool, quote workflow, and print quality — with Alberta-focused turnaround and clear shipping updates.",
      "Coordinate staff tees, volunteer hoodies, and giveaway packs with matching artwork.",
    ],
    bullets: [
      "Shipped from Calgary to Edmonton",
      "Bulk event kits and office programs",
      "Quote support for multi-item orders",
    ],
  },
];

export function getLocation(slug: string) {
  return locations.find((item) => item.slug === slug);
}

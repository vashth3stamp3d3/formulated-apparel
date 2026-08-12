export const site = {
  name: "Formulated Apparel",
  shortName: "formulated apparel",
  tagline: "Quality merch. Fast turnaround.",
  description:
    "Custom company swag, event merch, and branded apparel from Calgary, Alberta — shipping across Canada.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://formulatedprintsapparel.com",
  email: "CustomerService@FormulatedPrints.com",
  phone: "+1-368-887-4117",
  phoneDisplay: "+1 368-887-4117",
  address: {
    street: "4558 14 Street NE",
    city: "Calgary",
    region: "AB",
    postal: "T2E 6T7",
    country: "CA",
  },
  geo: { latitude: 51.0926, longitude: -114.0288 },
  hours: "Mon–Fri 9:00 AM – 4:30 PM",
  social: {
    instagram: "https://www.instagram.com/formulatedprints",
    facebook: "https://www.facebook.com/profile.php?id=61555725052943",
  },
  mockupAppUrl:
    process.env.NEXT_PUBLIC_MOCKUP_APP_URL ||
    "https://mockup-app-production.up.railway.app",
  shopifyCatalogUrl:
    process.env.NEXT_PUBLIC_SHOPIFY_CATALOG_URL ||
    "https://formulatedprints.com",
  parentBrand: {
    name: "FormulatedPrints",
    url: "https://formulatedprints.com",
  },
} as const;

export const navLinks = [
  { href: "/company-swag", label: "Company swag" },
  { href: "/event-swag", label: "Event swag" },
  { href: "/custom-merch", label: "Custom merch" },
  { href: "/blog", label: "Blog" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/locations/alberta", label: "Alberta" },
  { href: "/contact", label: "Contact" },
] as const;

export const announcements = [
  { title: "Canada-wide shipping", text: "From our Calgary shop" },
  { title: "Quality merch", text: "Built for brands & events" },
  { title: "Fast turnaround", text: "Alberta production" },
  { title: "Bulk & team orders", text: "Quotes in one business day" },
  { title: "Local pickup", text: "Calgary NE" },
] as const;

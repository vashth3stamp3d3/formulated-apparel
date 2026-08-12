import { site } from "@/lib/site";

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    alternateName: ["Formulated Apparel", "formulated apparel"],
    url: `${site.url}/`,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/logo.svg`,
    },
    description: site.description,
    email: site.email,
    telephone: site.phone,
    sameAs: [site.social.instagram, site.social.facebook],
    parentOrganization: {
      "@type": "Organization",
      name: site.parentBrand.name,
      url: site.parentBrand.url,
    },
  };
}

export function localBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${site.url}/#localbusiness`,
    name: site.name,
    image: `${site.url}/images/hero-crew.jpg`,
    url: `${site.url}/`,
    telephone: site.phone,
    email: site.email,
    priceRange: "$$",
    description:
      "Custom company swag, event merch, and branded apparel from Calgary, Alberta with Canada-wide shipping and local pickup.",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postal,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "16:30",
      },
    ],
    areaServed: [
      { "@type": "Country", name: "Canada" },
      { "@type": "AdministrativeArea", name: "Alberta" },
      { "@type": "City", name: "Calgary" },
      { "@type": "City", name: "Edmonton" },
    ],
    parentOrganization: { "@id": `${site.url}/#organization` },
    sameAs: [site.social.instagram, site.social.facebook],
  };
}

export function serviceSchema(name: string, description: string, url: string) {
  return {
    "@type": "Service",
    name,
    description,
    url,
    provider: { "@id": `${site.url}/#localbusiness` },
    areaServed: [
      { "@type": "Country", name: "Canada" },
      { "@type": "AdministrativeArea", name: "Alberta" },
    ],
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  crumbs: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

export function articleSchema(input: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  path: string;
}) {
  return {
    "@type": "Article",
    "@id": `${site.url}${input.path}#article`,
    headline: input.headline,
    description: input.description,
    image: [input.image],
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": "Organization",
      name: input.authorName,
      url: `${site.url}/about`,
    },
    publisher: { "@id": `${site.url}/#organization` },
    mainEntityOfPage: `${site.url}${input.path}`,
    isPartOf: {
      "@type": "Blog",
      "@id": `${site.url}/blog#blog`,
      name: `${site.name} Blog`,
    },
  };
}

export function graphSchema(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

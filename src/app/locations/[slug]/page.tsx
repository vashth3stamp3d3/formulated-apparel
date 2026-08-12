import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import styles from "@/components/ContentPage.module.css";
import { getLocation, locations } from "@/lib/locations";
import {
  breadcrumbSchema,
  graphSchema,
  serviceSchema,
} from "@/lib/schema";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return locations.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return {
    title: location.title,
    description: location.description,
    alternates: { canonical: `/locations/${location.slug}` },
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  return (
    <>
      <JsonLd
        data={graphSchema(
          serviceSchema(
            `Custom apparel in ${location.name}`,
            location.description,
            `${site.url}/locations/${location.slug}`,
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Locations", path: "/locations/canada" },
            { name: location.name, path: `/locations/${location.slug}` },
          ]),
        )}
      />
      <PageHero
        eyebrow={location.name}
        title={location.h1}
        lead={location.lead}
        imageSrc={
          location.slug === "calgary" || location.slug === "alberta"
            ? "/images/alberta-crew.jpg"
            : "/images/hero-crew.jpg"
        }
        imageAlt={`Custom merch for ${location.name}`}
      />
      <section className={styles.content}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            {location.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul>
              {location.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className={styles.links}>
              <Link href="/design" className="btn btn--accent">
                Design & quote
              </Link>
              <Link href="/contact" className="btn btn--ghost">
                Contact
              </Link>
            </div>
          </div>
          <aside className={styles.aside}>
            <h3>Serve {location.name}</h3>
            <p>
              Produced in Calgary. Pickup available locally. Shipping across
              Canada.
            </p>
            <div className={styles.asideActions}>
              <Link href="/company-swag" className="btn btn--primary">
                Company swag
              </Link>
              <Link href="/event-swag" className="btn btn--ghost">
                Event swag
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

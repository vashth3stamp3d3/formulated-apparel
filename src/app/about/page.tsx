import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import styles from "@/components/ContentPage.module.css";
import { breadcrumbSchema, graphSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Formulated Apparel",
  description:
    "Formulated Apparel is the company swag and event merch line from FormulatedPrints in Calgary, Alberta — shipping across Canada.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        )}
      />
      <PageHero
        title="Quality merch from a Calgary print shop"
        lead="Formulated Apparel is how companies and event organizers order branded apparel from the FormulatedPrints team."
        imageSrc="/images/alberta-crew.jpg"
        imageAlt="People wearing matching custom hoodies in Alberta"
      />
      <section className={styles.content}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <h2>Same shop. New focus.</h2>
            <p>
              FormulatedPrints built its reputation on color accuracy and fast
              turnaround. Formulated Apparel extends that into finished company
              swag, event merch, and custom apparel programs.
            </p>
            <h2>Where we work</h2>
            <p>
              {site.address.street}
              <br />
              {site.address.city}, {site.address.region} {site.address.postal}
              <br />
              {site.hours}
            </p>
            <div className={styles.links}>
              <Link href="/design" className="btn btn--accent">
                Design merch
              </Link>
              <a href={site.parentBrand.url} className="btn btn--ghost">
                Visit FormulatedPrints
              </a>
            </div>
          </div>
          <aside className={styles.aside}>
            <h3>Contact</h3>
            <p>
              <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <div className={styles.asideActions}>
              <Link href="/contact" className="btn btn--primary">
                Contact page
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

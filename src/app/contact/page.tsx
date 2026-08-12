import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import styles from "@/components/ContentPage.module.css";
import { breadcrumbSchema, graphSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Formulated Apparel in Calgary for company swag quotes, event merch, and custom apparel across Canada.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />
      <PageHero
        title="Tell us about your merch order"
        lead="Company programs, event kits, or a one-off custom run — we’ll help you get pricing and timing."
        imageSrc="/images/company-swag.jpg"
        imageAlt="Custom branded apparel"
        primaryHref="/design"
        primaryLabel="Prefer the designer?"
        secondaryHref={`mailto:${site.email}`}
        secondaryLabel="Email us"
      />
      <section className={styles.content}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <h2>Send a message</h2>
            <ContactForm />
          </div>
          <aside className={styles.aside}>
            <h3>Shop details</h3>
            <p>
              {site.address.street}
              <br />
              {site.address.city}, {site.address.region} {site.address.postal}
              <br />
              {site.hours}
            </p>
            <p>
              <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

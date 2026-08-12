import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import styles from "@/components/ContentPage.module.css";
import {
  breadcrumbSchema,
  graphSchema,
  serviceSchema,
} from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company Swag & Branded Apparel",
  description:
    "Custom company swag for Canadian teams — tees, hoodies, polos, and hats produced in Calgary with Canada-wide shipping.",
  alternates: { canonical: "/company-swag" },
};

export default function CompanySwagPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          serviceSchema(
            "Company swag",
            "Branded apparel programs for Canadian companies and teams.",
            `${site.url}/company-swag`,
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Company swag", path: "/company-swag" },
          ]),
        )}
      />
      <PageHero
        eyebrow="Company programs"
        title="Company swag that looks sharp on day one"
        lead="Outfit teams, onboarding kits, and client gifts with consistent branding and clear bulk quotes."
        imageSrc="/images/company-swag.jpg"
        imageAlt="Custom company polos and hats"
      />
      <section className={styles.content}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <h2>Built for offices and growing brands</h2>
            <p>
              Formulated Apparel helps Canadian companies roll out branded
              apparel without guesswork. Design online, preview mockups, and
              request a quote with sizes and quantities.
            </p>
            <ul>
              <li>Staff tees, hoodies, and polos</li>
              <li>Onboarding and welcome kits</li>
              <li>Sales team and partner gifts</li>
              <li>Consistent color and print placement</li>
            </ul>
            <h2>Alberta production, Canada delivery</h2>
            <p>
              Orders are produced in Calgary. Alberta teams can pick up locally;
              everyone else gets Canada-wide shipping.
            </p>
            <div className={styles.links}>
              <Link href="/design" className="btn btn--accent">
                Design company swag
              </Link>
              <Link href="/locations/alberta" className="btn btn--ghost">
                Alberta details
              </Link>
            </div>
          </div>
          <aside className={styles.aside}>
            <h3>Need a bulk quote?</h3>
            <p>
              Tell us styles, colors, sizes, and print locations — we typically
              reply within one business day.
            </p>
            <div className={styles.asideActions}>
              <Link href="/design" className="btn btn--primary">
                Open designer
              </Link>
              <Link href="/contact" className="btn btn--ghost">
                Contact the team
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

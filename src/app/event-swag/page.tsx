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
  title: "Event Swag & Conference Merch",
  description:
    "Custom event swag and conference merch for Canada — coordinated tees, hoodies, hats, and giveaway kits from Calgary.",
  alternates: { canonical: "/event-swag" },
};

export default function EventSwagPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          serviceSchema(
            "Event swag",
            "Coordinated event and conference merchandise for Canadian organizers.",
            `${site.url}/event-swag`,
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Event swag", path: "/event-swag" },
          ]),
        )}
      />
      <PageHero
        eyebrow="Events & conferences"
        title="Event swag that ties the whole room together"
        lead="Staff tees, volunteer hoodies, hats, and giveaway packs with matching artwork and dependable timelines."
        imageSrc="/images/event-swag.jpg"
        imageAlt="Event merch table with hoodies tees and caps"
      />
      <section className={styles.content}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <h2>Coordinated kits for real event logistics</h2>
            <p>
              Launch parties, trade shows, fundraisers, and conferences need
              apparel that arrives looking intentional. We help you lock art,
              sizes, and quantities before production.
            </p>
            <ul>
              <li>Staff and volunteer uniforms</li>
              <li>Attendee giveaways</li>
              <li>Speaker and VIP gifts</li>
              <li>Multi-item matching artwork</li>
            </ul>
            <h2>Quote first, print with confidence</h2>
            <p>
              Use the designer to preview mockups, then submit a quote request
              with your event date so we can confirm timing.
            </p>
            <div className={styles.links}>
              <Link href="/design" className="btn btn--accent">
                Design event merch
              </Link>
              <Link href="/how-it-works" className="btn btn--ghost">
                See the process
              </Link>
            </div>
          </div>
          <aside className={styles.aside}>
            <h3>Planning an Alberta event?</h3>
            <p>
              Calgary pickup and Alberta shipping make last-mile coordination
              easier for local organizers.
            </p>
            <div className={styles.asideActions}>
              <Link href="/locations/calgary" className="btn btn--primary">
                Calgary pickup
              </Link>
              <Link href="/contact" className="btn btn--ghost">
                Ask about timelines
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

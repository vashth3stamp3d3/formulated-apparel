import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Steps } from "@/components/Steps";
import { JsonLd } from "@/components/JsonLd";
import styles from "@/components/ContentPage.module.css";
import { breadcrumbSchema, graphSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Design custom company or event merch online, preview mockups, and request a quote from Formulated Apparel in Calgary.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        )}
      />
      <PageHero
        title="Design first. Quote next. Print with a plan."
        lead="A simple workflow for company and event apparel — built for bulk orders across Canada."
        imageSrc="/images/hero-crew.jpg"
        imageAlt="Team in custom branded apparel"
        primaryHref="/design"
        primaryLabel="Open the designer"
      />
      <section className="section">
        <div className="container">
          <Steps />
        </div>
      </section>
      <section className={styles.content}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <h2>What happens after you request a quote</h2>
            <p>
              Our Calgary team reviews your mockups, garment choices, sizes, and
              quantities. We confirm pricing, production timing, and shipping or
              pickup options.
            </p>
            <ul>
              <li>Art and placement review</li>
              <li>Blank availability check</li>
              <li>Bulk pricing for your mix of sizes</li>
              <li>Alberta pickup or Canada-wide shipping</li>
            </ul>
            <div className={styles.links}>
              <Link href="/design" className="btn btn--accent">
                Start a quote
              </Link>
              <Link href="/contact" className="btn btn--ghost">
                Ask a question
              </Link>
            </div>
          </div>
          <aside className={styles.aside}>
            <h3>Tip</h3>
            <p>
              Include your event or in-hand date in the quote form so we can
              prioritize production correctly.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

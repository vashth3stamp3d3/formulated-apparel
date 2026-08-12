import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Steps } from "@/components/Steps";
import styles from "@/components/ContentPage.module.css";
import {
  breadcrumbSchema,
  graphSchema,
  serviceSchema,
} from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Custom Merch Designer",
  description:
    "Design custom merch online with Formulated Apparel — upload art, preview lifestyle mockups, and request a bulk quote.",
  alternates: { canonical: "/custom-merch" },
};

export default function CustomMerchPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          serviceSchema(
            "Custom merch design",
            "Online merch designer with lifestyle mockups and quote requests.",
            `${site.url}/custom-merch`,
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Custom merch", path: "/custom-merch" },
          ]),
        )}
      />
      <PageHero
        eyebrow="Online designer"
        title="Custom merch with live mockups"
        lead="Upload your logo, place it on apparel, preview lifestyle shots, and send a quote — no checkout required."
        imageSrc="/images/custom-merch.jpg"
        imageAlt="Person designing custom merch on a phone"
        primaryHref="/design"
        primaryLabel="Open designer"
      />
      <section className="section">
        <div className="container">
          <h2 className="section__title">How the designer works</h2>
          <Steps />
          <div className={styles.links}>
            <Link href="/design" className="btn btn--accent">
              Start designing
            </Link>
            <Link href="/contact" className="btn btn--ghost">
              Prefer email?
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

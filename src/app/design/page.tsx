import type { Metadata } from "next";
import { MockupDesigner } from "@/components/MockupDesigner";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, graphSchema, serviceSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import styles from "./design.module.css";

export const metadata: Metadata = {
  title: "Design Merch & Request a Quote",
  description:
    "Design custom company or event merch online, preview lifestyle mockups, and request a quote from Formulated Apparel.",
  alternates: { canonical: "/design" },
};

export default function DesignPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          serviceSchema(
            "Custom merch quote designer",
            "Design apparel online and request a bulk quote.",
            `${site.url}/design`,
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Design", path: "/design" },
          ]),
        )}
      />
      <section className={styles.intro}>
        <div className="container">
          <p className="section__eyebrow">Merch builder</p>
          <h1 className="section__title">Design your merch, then request a quote</h1>
          <p className="section__lead">
            No checkout. Upload art, place it on apparel, preview mockups, and
            send sizes/quantities to our Calgary shop.
          </p>
        </div>
      </section>
      <MockupDesigner />
    </>
  );
}

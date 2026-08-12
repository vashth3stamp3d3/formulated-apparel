import type { Metadata } from "next";
import { MockupDesigner } from "@/components/MockupDesigner";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, graphSchema, serviceSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import styles from "./design.module.css";

export const metadata: Metadata = {
  title: "Design Merch & Checkout",
  description:
    "Design custom company or event merch online, preview lifestyle mockups, and checkout on Formulated Prints.",
  alternates: { canonical: "/design" },
};

export default function DesignPage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          serviceSchema(
            "Custom merch designer",
            "Design apparel online and checkout on Formulated Prints.",
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
          <h1 className="section__title">Design your merch, then checkout</h1>
          <p className="section__lead">
            Upload art, place it on apparel, preview mockups, and add to your
            Formulated Prints cart to finish checkout.
          </p>
        </div>
      </section>
      <MockupDesigner />
    </>
  );
}

import type { Metadata } from "next";
import { MockupDesigner } from "@/components/MockupDesigner";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, graphSchema, serviceSchema } from "@/lib/schema";
import { site } from "@/lib/site";

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
      <h1 className="visually-hidden">Design your merch</h1>
      <MockupDesigner />
    </>
  );
}

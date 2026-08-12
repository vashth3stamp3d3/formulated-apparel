import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { PastWorkHero } from "@/components/PastWorkHero";
import { Steps } from "@/components/Steps";
import { homeFaqs } from "@/lib/faqs";
import {
  faqSchema,
  graphSchema,
  localBusinessSchema,
  organizationSchema,
  serviceSchema,
} from "@/lib/schema";
import { site } from "@/lib/site";
import styles from "./page.module.css";

const categories = [
  {
    href: "/company-swag",
    title: "Company swag",
    text: "Branded tees, hoodies, and polos for teams.",
    image: "/images/company-swag.jpg",
  },
  {
    href: "/event-swag",
    title: "Event swag",
    text: "Coordinated kits for conferences and launches.",
    image: "/images/event-swag.jpg",
  },
  {
    href: "/custom-merch",
    title: "Custom merch",
    text: "Design online, preview mockups, get a quote.",
    image: "/images/custom-merch.jpg",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={graphSchema(
          organizationSchema(),
          localBusinessSchema(),
          serviceSchema(
            "Custom apparel & event swag",
            "Company swag, event merch, and branded apparel with Calgary production and Canada-wide shipping.",
            `${site.url}/`,
          ),
          faqSchema([...homeFaqs]),
        )}
      />

      <PastWorkHero />

      <section className="section">
        <div className="container">
          <p className="section__eyebrow">How it works</p>
          <h2 className="section__title">From artwork to quote in three steps</h2>
          <p className="section__lead">
            Same clean builder experience our print shop uses — built for bulk
            company and event orders.
          </p>
          <Steps />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <p className="section__eyebrow">What we make</p>
          <h2 className="section__title">Merch for brands, teams, and events</h2>
          <div className={styles.categories}>
            {categories.map((item) => (
              <Link key={item.href} href={item.href} className={styles.category}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
                <span className={styles.categoryShade} aria-hidden="true" />
                <span className={styles.categoryCopy}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section__eyebrow">Why Formulated</p>
          <h2 className="section__title">Built for Alberta. Ready for Canada.</h2>
          <div className={styles.bento}>
            <div className={`${styles.panel} ${styles.panelCream}`}>
              <h3>Calgary production</h3>
              <p>Local pickup in NE Calgary and fast Alberta turnaround.</p>
            </div>
            <div className={`${styles.panel} ${styles.panelCyan}`}>
              <h3>Canada-wide shipping</h3>
              <p>One shop for offices from Vancouver to Halifax.</p>
            </div>
            <div className={`${styles.panel} ${styles.panelPink}`}>
              <h3>Quote-first bulk</h3>
              <p>Design first, then get pricing for your sizes and quantities.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className={`container ${styles.proof}`}>
          <div>
            <p className="section__eyebrow">Local & national</p>
            <h2 className="section__title">Alberta roots. National reach.</h2>
            <p className="section__lead">
              Formulated Apparel is the company and event merch line from
              FormulatedPrints — the same Calgary shop trusted for quality print
              and quick production.
            </p>
            <div className={styles.actionsRow}>
              <Link href="/locations/calgary" className="btn btn--primary">
                Calgary pickup
              </Link>
              <Link href="/locations/canada" className="btn btn--ghost">
                Shipping Canada-wide
              </Link>
            </div>
          </div>
          <div className={styles.proofMedia}>
            <Image
              src="/images/alberta-crew.jpg"
              alt="Stacks of custom hoodies and apparel in a Calgary print shop"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section__eyebrow">FAQ</p>
          <h2 className="section__title">Questions before you design</h2>
          <Faq items={homeFaqs} />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <p className="section__eyebrow">Visit us</p>
          <h2 className="section__title">Calgary shop & pickup</h2>
          <p className="section__lead">
            {site.address.street}, {site.address.city}, {site.address.region}{" "}
            {site.address.postal} · {site.hours}
          </p>
          <div className={styles.mapWrap}>
            <iframe
              title="Formulated Apparel Calgary location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=4558+14+Street+NE+Calgary+AB+T2E+6T7&output=embed"
            />
          </div>
        </div>
      </section>
    </>
  );
}

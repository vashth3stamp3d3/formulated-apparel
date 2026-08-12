import Image from "next/image";
import Link from "next/link";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  lead: string;
  imageSrc: string;
  imageAlt: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  fullBleed?: boolean;
};

export function PageHero({
  eyebrow,
  title,
  lead,
  imageSrc,
  imageAlt,
  primaryHref = "/design",
  primaryLabel = "Design & quote",
  secondaryHref = "/contact",
  secondaryLabel = "Talk to us",
  fullBleed = false,
}: PageHeroProps) {
  return (
    <section className={`${styles.hero} ${fullBleed ? styles.fullBleed : ""}`}>
      <div className={styles.media}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.shade} aria-hidden="true" />
      </div>
      <div className={`container ${styles.copy}`}>
        <p className={styles.brand}>formulated apparel</p>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className={styles.lead}>{lead}</p>
        <div className={styles.actions}>
          {primaryHref.startsWith("http") || primaryHref.startsWith("mailto:") ? (
            <a href={primaryHref} className="btn btn--accent">
              {primaryLabel}
            </a>
          ) : (
            <Link href={primaryHref} className="btn btn--accent">
              {primaryLabel}
            </Link>
          )}
          {secondaryHref.startsWith("http") || secondaryHref.startsWith("mailto:") ? (
            <a href={secondaryHref} className="btn btn--ghost">
              {secondaryLabel}
            </a>
          ) : (
            <Link href={secondaryHref} className="btn btn--ghost">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { pastWorkRows, type PastWorkItem } from "@/lib/pastWork";
import styles from "./PastWorkHero.module.css";

function FilmRow({
  items,
  reverse = false,
  duration = 80,
}: {
  items: PastWorkItem[];
  reverse?: boolean;
  duration?: number;
}) {
  const loop = [...items, ...items, ...items];
  return (
    <div
      className={`${styles.strip} ${reverse ? styles.stripReverse : ""}`}
      style={{ ["--strip-duration" as string]: `${duration}s` }}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {loop.map((item, index) => (
          <figure key={`${item.src}-${index}`} className={styles.frame}>
            <Image
              src={item.src}
              alt=""
              width={900}
              height={1125}
              className={styles.frameImg}
              sizes="(max-width: 700px) 70vw, 34vw"
              priority={index < 4}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export function PastWorkHero() {
  const [row1, row2] = pastWorkRows();

  return (
    <section className={styles.hero} aria-label="Past work">
      <div className={styles.film} aria-hidden="true">
        <FilmRow items={row1} duration={140} />
        <FilmRow items={row2} reverse duration={160} />
      </div>

      <div className={styles.veilTop} aria-hidden="true" />
      <div className={styles.veilCopy} aria-hidden="true" />

      <p className={styles.showcase}>Our Past Work</p>

      <div className={styles.shell}>
        <div className={styles.copy}>
          <p className={styles.brand}>formulated apparel</p>
          <h1>Your company deserves branding people trust.</h1>
          <p className={styles.lead}>
            Make your team look professional with company merch that feels
            intentional. Clean prints, solid blanks, Calgary production.
          </p>
          <div className={styles.actions}>
            <Link href="/contact" className={`btn btn--primary ${styles.cta}`}>
              Request a quote
            </Link>
            <Link href="/design" className={styles.secondary}>
              Build a mockup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

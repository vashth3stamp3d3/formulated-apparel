import Image from "next/image";
import Link from "next/link";
import { pastWorkRows, type PastWorkItem } from "@/lib/pastWork";
import styles from "./PastWorkHero.module.css";

function FilmRow({
  items,
  reverse = false,
  duration = 55,
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
          <figure
            key={`${item.src}-${index}`}
            className={styles.frame}
            style={{ ["--tilt" as string]: `${item.rotate}deg` }}
          >
            <Image
              src={item.src}
              alt=""
              width={720}
              height={900}
              className={styles.frameImg}
              sizes="(max-width: 700px) 58vw, 28vw"
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
        <FilmRow items={row1} duration={64} />
        <FilmRow items={row2} reverse duration={72} />
      </div>

      <div className={styles.veil} aria-hidden="true" />

      <div className={styles.shell}>
        <div className={styles.copy}>
          <p className={styles.brand}>formulated apparel</p>
          <h1>Merch your team is proud to wear</h1>
          <p className={styles.lead}>
            Real Calgary client work — sharp prints, solid blanks, turnaround
            you can plan around. Bring your logo. We&apos;ll make it look like
            it belongs on a shirt.
          </p>
          <div className={styles.actions}>
            <Link href="/design" className="btn btn--accent">
              Start your design
            </Link>
            <Link href="/contact" className="btn btn--ghost">
              Talk to the shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { pastWorkRows, type PastWorkItem } from "@/lib/pastWork";
import styles from "./PastWorkHero.module.css";

function FilmRow({
  items,
  reverse = false,
  duration = 48,
}: {
  items: PastWorkItem[];
  reverse?: boolean;
  duration?: number;
}) {
  const loop = [...items, ...items];
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
              width={360}
              height={460}
              className={styles.frameImg}
              sizes="220px"
            />
            <figcaption>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function PastWorkHero() {
  const [row1, row2, row3] = pastWorkRows();

  return (
    <section className={styles.hero} aria-label="Past work">
      <div className={styles.shell}>
        <div className={styles.copy}>
          <p className={styles.brand}>formulated apparel</p>
          <p className={styles.eyebrow}>Past work</p>
          <h1>We help your brand with our designs</h1>
          <p className={styles.lead}>
            Real client prints from our Calgary shop — company swag, event merch,
            and custom drops with quality you can feel.
          </p>
          <div className={styles.actions}>
            <Link href="/design" className="btn btn--accent">
              Design your merch
            </Link>
            <Link href="/custom-merch" className="btn btn--ghost">
              See how it works
            </Link>
          </div>
        </div>

        <div className={styles.film}>
          <FilmRow items={row1} duration={52} />
          <FilmRow items={row2} reverse duration={58} />
          <FilmRow items={row3} duration={46} />
        </div>
      </div>
    </section>
  );
}

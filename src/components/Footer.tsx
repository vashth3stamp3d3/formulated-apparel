import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Logo showTagline />
          <p className={styles.blurb}>
            Custom company swag, event merch, and branded apparel produced in
            Calgary and shipped across Canada.
          </p>
          <div className={styles.social}>
            <a href={site.social.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={site.social.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>

        <div>
          <h3>Visit / pickup</h3>
          <p>
            {site.address.street}
            <br />
            {site.address.city}, {site.address.region} {site.address.postal}
          </p>
          <p>{site.hours}</p>
          <p>
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
            <br />
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <ul>
            <li>
              <Link href="/company-swag">Company swag</Link>
            </li>
            <li>
              <Link href="/event-swag">Event swag</Link>
            </li>
            <li>
              <Link href="/custom-merch">Custom merch</Link>
            </li>
            <li>
              <Link href="/design">Design &amp; quote</Link>
            </li>
            <li>
              <Link href="/locations/calgary">Calgary</Link>
            </li>
            <li>
              <Link href="/locations/edmonton">Edmonton</Link>
            </li>
            <li>
              <Link href="/locations/alberta">Alberta</Link>
            </li>
            <li>
              <Link href="/locations/canada">Canada</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} {site.name}. A brand line of{" "}
          <a href={site.parentBrand.url}>{site.parentBrand.name}</a>.
        </p>
      </div>
    </footer>
  );
}

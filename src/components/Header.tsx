"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { navLinks, site } from "@/lib/site";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.productionBar}>
        <div className={styles.productionInner}>
          <span>Canada-wide shipping</span>
          <span className={styles.dot} aria-hidden="true" />
          <a
            href="https://maps.google.com/?q=4558+14+Street+NE+Calgary+AB"
            target="_blank"
            rel="noreferrer"
          >
            Calgary pickup
          </a>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.ships}>Fast turnaround</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>{site.hours}</span>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.mainInner}>
          <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
            <Logo showTagline />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <Link href="/design" className="btn btn--accent">
              Design merch
            </Link>
            <button
              type="button"
              className={styles.menuBtn}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">Menu</span>
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" className={styles.mobileNav} aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/design" className="btn btn--accent" onClick={() => setOpen(false)}>
            Design merch
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { announcements } from "@/lib/site";
import styles from "./AnnouncementBar.module.css";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const item = announcements[index];

  return (
    <div className={styles.bar} role="region" aria-label="Announcements">
      <div className={styles.inner}>
        <p className={styles.title}>{item.title}</p>
        {item.text ? <p className={styles.text}>{item.text}</p> : null}
      </div>
    </div>
  );
}

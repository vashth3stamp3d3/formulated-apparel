"use client";

import { useState } from "react";
import styles from "./Faq.module.css";

type FaqItem = {
  question: string;
  answer: string;
};

export function Faq({ items }: { items: readonly FaqItem[] | FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={styles.list}>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className={styles.item}>
            <button
              type="button"
              className={styles.question}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span>{item.question}</span>
              <span className={styles.icon} aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? <p className={styles.answer}>{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

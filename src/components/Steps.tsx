import styles from "./Steps.module.css";

const steps = [
  {
    n: "01",
    title: "Pick your blanks",
    text: "Tees, hoodies, hats, polos — choose styles built for companies and events.",
  },
  {
    n: "02",
    title: "Upload & place art",
    text: "Drop your logo, pick print spots, and preview lifestyle mockups instantly.",
  },
  {
    n: "03",
    title: "Request a quote",
    text: "Send sizes and quantities. We reply with pricing and timing from Calgary.",
  },
] as const;

export function Steps() {
  return (
    <div className={styles.grid}>
      {steps.map((step) => (
        <article key={step.n} className={styles.card}>
          <span className={styles.n}>{step.n}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </article>
      ))}
    </div>
  );
}

import styles from "./Logo.module.css";

type LogoProps = {
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
};

export function Logo({
  variant = "light",
  showTagline = true,
  className = "",
}: LogoProps) {
  const fill = variant === "dark" ? "#ffffff" : "#111111";
  const taglineFill = variant === "dark" ? "#d0d0d0" : "#666666";

  return (
    <span className={`${styles.logo} ${className}`} aria-label="formulated apparel">
      <svg
        className={styles.mark}
        viewBox="0 0 48 64"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="0" y="0" width="48" height="12" rx="6" fill={fill} />
        <rect x="0" y="26" width="32" height="12" rx="6" fill={fill} />
        <circle cx="8" cy="56" r="8" fill={fill} />
      </svg>
      <span className={styles.text}>
        <span className={styles.wordmark} style={{ color: fill }}>
          formulated apparel
        </span>
        {showTagline ? (
          <span className={styles.tagline} style={{ color: taglineFill }}>
            Quality merch. Fast turnaround.
          </span>
        ) : null}
      </span>
    </span>
  );
}

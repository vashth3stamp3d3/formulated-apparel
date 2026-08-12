import Link from "next/link";
import type { BlogBlock } from "@/lib/blog";
import styles from "./Blog.module.css";

function isInternal(url: string) {
  return url.startsWith("/");
}

export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className={styles.prose}>
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return <h2 key={index}>{block.content}</h2>;
        }
        if (block.type === "h3") {
          return <h3 key={index}>{block.content}</h3>;
        }
        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "link") {
          if (isInternal(block.url)) {
            return (
              <p key={index} className={styles.resource}>
                <Link href={block.url}>{block.text}</Link>
              </p>
            );
          }
          return (
            <p key={index} className={styles.resource}>
              <a href={block.url} rel="noopener noreferrer">
                {block.text}
              </a>
            </p>
          );
        }
        return <p key={index}>{block.content}</p>;
      })}
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import styles from "@/components/Blog.module.css";
import { formatBlogDate, getAllPosts } from "@/lib/blog";
import { breadcrumbSchema, graphSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog | Company swag & event merch guides",
  description:
    "A short set of practical guides from our Calgary shop: timelines, file prep, blank choices, and event merch checklists.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        data={graphSchema(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          {
            "@type": "Blog",
            "@id": `${site.url}/blog#blog`,
            name: `${site.name} Blog`,
            url: `${site.url}/blog`,
            description:
              "Guides on company swag, event merch, and apparel production from Calgary.",
            publisher: { "@id": `${site.url}/#organization` },
          },
        )}
      />
      <PageHero
        title="Guides from the shop floor"
        lead="A curated set of notes we actually use with clients: timelines, file prep, blank choices, and event checklists. No filler posts."
        imageSrc="/images/company-swag.jpg"
        imageAlt="Custom company apparel ready in a Calgary shop"
      />
      <section className="section">
        <div className="container">
          <div className={styles.list}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={styles.card}
              >
                <div className={styles.cardMedia}>
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="220px"
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.meta}>
                    {formatBlogDate(post.publishedAt)} · {post.readTimeMinutes}{" "}
                    min read
                  </p>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  <p className={styles.cardDesc}>{post.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

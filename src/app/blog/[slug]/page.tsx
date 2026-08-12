import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/BlogBody";
import { JsonLd } from "@/components/JsonLd";
import styles from "@/components/Blog.module.css";
import {
  formatBlogDate,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import {
  articleSchema,
  breadcrumbSchema,
  graphSchema,
} from "@/lib/schema";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 3);
  const imageUrl = post.image.startsWith("http")
    ? post.image
    : `${site.url}${post.image}`;

  return (
    <>
      <JsonLd
        data={graphSchema(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          articleSchema({
            headline: post.title,
            description: post.description,
            image: imageUrl,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            authorName: post.author,
            path: `/blog/${post.slug}`,
          }),
        )}
      />

      <article className={styles.article}>
        <div className="container">
          <header className={styles.articleHeader}>
            <p className={styles.meta}>
              <Link href="/blog">Blog</Link>
              {" · "}
              {formatBlogDate(post.publishedAt)} · {post.readTimeMinutes} min
              read
            </p>
            <h1>{post.title}</h1>
            <p className={styles.lede}>{post.description}</p>
          </header>

          <div className={styles.heroImage}>
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 920px) 100vw, 920px"
              priority
            />
          </div>

          <BlogBody blocks={post.body} />

          <aside className={styles.related}>
            <h2>Related guides</h2>
            <ul className={styles.relatedList}>
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>
    </>
  );
}

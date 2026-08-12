import { blogPosts, type BlogPost } from "@/lib/blogPosts";

export type { BlogBlock, BlogPost } from "@/lib/blogPosts";

/** Format YYYY-MM-DD without UTC shifting the calendar day. */
export function formatBlogDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return getAllPosts().slice(0, limit);
  return getAllPosts()
    .filter((post) => post.slug !== slug)
    .filter(
      (post) =>
        post.tags.some((tag) => current.tags.includes(tag)) ||
        post.slug !== slug,
    )
    .slice(0, limit);
}

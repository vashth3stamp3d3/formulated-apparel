/**
 * Disabled: do not regenerate a large templated blog set.
 * Blog content is curated in src/lib/blogPosts.ts (12 shop-floor guides).
 * Removed URLs permanently redirect via scripts/blog-redirects.json + next.config.ts.
 *
 * To add a post: write it by hand in blogPosts.ts with a unique opening,
 * first-hand shop detail, and a clear job for the reader.
 */
console.error(
  "Refusing to mass-generate blog posts. Edit src/lib/blogPosts.ts directly.",
);
process.exit(1);

import Link from "next/link";
import type { Post } from "@/lib/posts";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PostCard({ post }: { post: Post }) {
  const { frontmatter, readingMinutes } = post;
  return (
    <Link
      href={`/blog/${frontmatter.slug}`}
      className="group block border-l-2 border-border pl-5 py-1 hover:border-accent transition-colors"
    >
      <p className="text-xs text-ink-faint mb-1">
        {formatDate(frontmatter.date)} &middot; {readingMinutes} min read
      </p>
      <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors">
        {frontmatter.title}
      </h3>
      <p className="text-sm text-ink-muted mt-1">{frontmatter.excerpt}</p>
    </Link>
  );
}

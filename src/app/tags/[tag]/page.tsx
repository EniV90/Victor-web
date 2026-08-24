import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="py-8">
      <p className="text-xs text-ink-faint mb-2">Tag</p>
      <h1 className="font-display text-3xl text-ink mb-8 font-mono">#{tag}</h1>
      <div className="flex flex-col gap-7">
        {posts.map((post) => (
          <PostCard key={post.frontmatter.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

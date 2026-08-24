import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="py-8">
      <h1 className="font-display text-3xl text-ink mb-8">Blog</h1>
      <div className="flex flex-col gap-7">
        {posts.map((post) => (
          <PostCard key={post.frontmatter.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

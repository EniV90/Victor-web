import Link from "next/link";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);
  return (
    <div>
      <section className="py-8">
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
          Software Engineer experienced in building software across multiple
          disciplines.
        </h1>
        <p className="mt-4 text-ink-muted max-w-xl">
          I write about systems programming, databases, and distributed systems
          as I build them — mostly in Rust, mostly the long way.
        </p>
      </section>
      <section className="mt-16">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl text-ink">Projects</h2>
          <Link href="/work" className="text-sm text-accent hover:underline">
            See all
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
      <section className="mt-16">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl text-ink">Recent posts</h2>
          <Link href="/blog" className="text-sm text-accent hover:underline">
            See all
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          {recentPosts.map((post) => (
            <PostCard key={post.frontmatter.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

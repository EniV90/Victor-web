import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { getPostsByProject } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export function generateStaticParams() {
  return projects.map((p) => ({ project: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const posts = getPostsByProject(project.slug);
  const bySeries = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const key = post.frontmatter.series;
    acc[key] = acc[key] ? [...acc[key], post] : [post];
    return acc;
  }, {});

  return (
    <div className="py-8">
      <h1 className="font-display text-3xl text-ink mb-3">{project.name}</h1>
      <p className="text-ink-muted max-w-xl mb-10">{project.description}</p>

      {Object.entries(bySeries).map(([series, seriesPosts]) => (
        <section key={series} className="mb-10">
          <h2 className="font-display text-lg text-ink mb-4 capitalize">
            {series.replace("-", " ")}
          </h2>
          <div className="flex flex-col gap-6">
            {seriesPosts
              .sort(
                (a, b) => a.frontmatter.seriesOrder - b.frontmatter.seriesOrder,
              )
              .map((post) => (
                <PostCard key={post.frontmatter.slug} post={post} />
              ))}
          </div>
        </section>
      ))}

      {posts.length === 0 && (
        <p className="text-ink-faint text-sm">No posts yet for this project.</p>
      )}
    </div>
  );
}

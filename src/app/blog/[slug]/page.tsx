import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug, getSeriesPosts } from "@/lib/posts";
import { getProject } from "@/lib/projects";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.frontmatter.slug }));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { frontmatter, content, readingMinutes } = post;
  const project = getProject(frontmatter.project);
  const seriesPosts = getSeriesPosts(frontmatter.project, frontmatter.series);
  const currentIndex = seriesPosts.findIndex(
    (p) => p.frontmatter.slug === frontmatter.slug,
  );
  const nextInSeries = seriesPosts[currentIndex + 1];

  return (
    <article className="py-8">
      <p className="text-xs text-ink-faint mb-3">
        {project && (
          <>
            <Link href={`/${project.slug}`} className="hover:text-accent">
              {project.name}
            </Link>
            {" / "}
            <span className="capitalize">
              {frontmatter.series.replace("-", " ")}
            </span>
            {" / "}
          </>
        )}
        {formatDate(frontmatter.date)} &middot; {readingMinutes} min read
      </p>
      <h1 className="font-display text-3xl text-ink leading-tight mb-8">
        {frontmatter.title}
      </h1>

      <div className="prose-post">
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
                [rehypePrettyCode, { theme: "github-dark" }],
              ],
            },
          }}
        />
      </div>

      {frontmatter.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
          {frontmatter.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="text-xs font-mono text-ink-faint bg-bg-card border border-border px-2 py-1 rounded hover:text-accent hover:border-accent transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {nextInSeries && (
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-ink-faint mb-1">Next in this series</p>
          <Link
            href={`/blog/${nextInSeries.frontmatter.slug}`}
            className="font-display text-lg text-accent hover:underline"
          >
            {nextInSeries.frontmatter.title} &rarr;
          </Link>
        </div>
      )}
    </article>
  );
}

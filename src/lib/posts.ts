import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export type PostFrontmatter = {
  title: string;
  slug: string;
  date: string;
  project: string;
  series: string;
  seriesOrder: number;
  tags: string[];
  excerpt: string;
  cover?: string;
  draft?: boolean;
};

export type Post = {
  frontmatter: PostFrontmatter;
  content: string;
  readingMinutes: number;
};

function isPublished(fm: PostFrontmatter) {
  return process.env.NODE_ENV === "development" || !fm.draft;
}

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const fm = data as PostFrontmatter;
    return {
      frontmatter: fm,
      content,
      readingMinutes: Math.ceil(readingTime(content).minutes),
    };
  });

  return posts
    .filter((p) => isPublished(p.frontmatter))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

export function getPostsByProject(project: string): Post[] {
  return getAllPosts().filter((p) => p.frontmatter.project === project);
}

export function getSeriesPosts(project: string, series: string): Post[] {
  return getPostsByProject(project)
    .filter((p) => p.frontmatter.series === series)
    .sort((a, b) => a.frontmatter.seriesOrder - b.frontmatter.seriesOrder);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.frontmatter.slug === slug);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.frontmatter.tags?.includes(tag));
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((p) => p.frontmatter.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

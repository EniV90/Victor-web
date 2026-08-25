import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";

const GITHUB_API = "https://api.github.com";


function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, project, series, seriesOrder, tags, excerpt, content } =
      body;

    if (!title || !project || !series || !excerpt || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const slug = slugify(title);
    const date = new Date().toISOString().split("T")[0];
    const tagList = tags
      ? tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: "${date}"
project: "${project}"
series: "${series}"
seriesOrder: ${seriesOrder}
tags: [${tagList.map((t: string) => `"${t}"`).join(", ")}]
excerpt: "${excerpt.replace(/"/g, '\\"')}"
draft: false
---

${content}
`;

    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const path = `content/posts/${slug}.mdx`;

    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Add post: ${title}`,
          content: Buffer.from(frontmatter).toString("base64"),
        }),
      },
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("GitHub API error:", err);
      return NextResponse.json(
        { error: err.message ?? "GitHub API error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  const listRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/content/posts`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    },
  );

  if (!listRes.ok) {
    return NextResponse.json(
      { error: "Failed to list posts" },
      { status: 500 },
    );
  }

  const files: { name: string; download_url: string }[] = await listRes.json();
  const mdxFiles = files.filter((f) => f.name.endsWith(".mdx"));

  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const raw = await fetch(file.download_url).then((r) => r.text());
      const { data } = matter(raw);
      return { slug: data.slug, title: data.title, date: data.date };
    }),
  );

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ posts });
}


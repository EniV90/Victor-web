import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";


const GITHUB_API = "https://api.github.com";

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };
}

async function getFile(slug: string) {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const path = `content/posts/${slug}.mdx`;
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json(); // includes .sha and base64 .content
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const file = await getFile(slug);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = Buffer.from(file.content, "base64").toString("utf-8");
  const { data, content } = matter(raw);
  return NextResponse.json({ frontmatter: data, content: content.trim(), sha: file.sha });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { title, project, series, seriesOrder, tags, excerpt, content, date } = await req.json();

  const file = await getFile(slug);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tagList = tags
    ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
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
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/content/posts/${slug}.mdx`,
    {
      method: "PUT",
      headers: ghHeaders(),
      body: JSON.stringify({
        message: `Update post: ${title}`,
        content: Buffer.from(frontmatter).toString("base64"),
        sha: file.sha,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const file = await getFile(slug);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/content/posts/${slug}.mdx`,
    {
      method: "DELETE",
      headers: ghHeaders(),
      body: JSON.stringify({
        message: `Delete post: ${slug}`,
        sha: file.sha,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PostSummary = { slug: string; title: string; date: string };

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"? This can't be undone from here.`)) return;
    const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } else {
      alert("Failed to delete — check the console.");
    }
  }

  return (
    <div className="py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Posts</h1>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          + New post
        </Link>
      </div>

      {loading && <p className="text-ink-muted text-sm">Loading...</p>}

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center justify-between border border-border bg-bg-card rounded px-4 py-3"
          >
            <div>
              <p className="text-ink">{post.title}</p>
              <p className="text-xs text-ink-faint">{post.date}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/posts/${post.slug}`}
                className="text-accent hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

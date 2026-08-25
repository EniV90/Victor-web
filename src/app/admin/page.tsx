"use client";

import { useState } from "react";
import { projects } from "@/lib/projects";
import Link from "next/link";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState(projects[0]?.slug ?? "");
  const [series, setSeries] = useState("");
  const [seriesOrder, setSeriesOrder] = useState(0);
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          project,
          series,
          seriesOrder,
          tags,
          excerpt,
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to publish");

      setStatus("done");
      setTitle("");
      setSeries("");
      setSeriesOrder(0);
      setTags("");
      setExcerpt("");
      setContent("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="py-8 max-w-2xl">
      <h1 className="font-display text-3xl text-ink mb-8">New post</h1>
      <Link href="/admin/posts" className="text-sm text-accent hover:underline">
        View all posts →
      </Link>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm text-ink-muted block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-muted block mb-1">Project</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
            >
              {projects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-ink-muted block mb-1">Series</label>
            <input
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="storage-engine"
              required
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-muted block mb-1">
              Series order
            </label>
            <input
              type="number"
              value={seriesOrder}
              onChange={(e) => setSeriesOrder(Number(e.target.value))}
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="text-sm text-ink-muted block mb-1">
              Tags (comma-separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="rust, databases"
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-ink-muted block mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            required
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
          />
        </div>

        <div>
          <label className="text-sm text-ink-muted block mb-1">
            Content (MDX)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            required
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink font-mono text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-accent text-bg rounded px-4 py-2 w-fit hover:bg-accent-strong transition-colors disabled:opacity-50"
        >
          {status === "saving" ? "Publishing..." : "Publish"}
        </button>

        {status === "done" && (
          <p className="text-sm text-accent">
            Published! Deploy will pick it up shortly.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">
            Something went wrong — check the console.
          </p>
        )}
      </form>
    </div>
  );
}

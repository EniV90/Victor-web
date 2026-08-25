"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projects } from "@/lib/projects";

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [series, setSeries] = useState("");
  const [seriesOrder, setSeriesOrder] = useState(0);
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const fm = data.frontmatter;
        setTitle(fm.title);
        setProject(fm.project);
        setSeries(fm.series);
        setSeriesOrder(fm.seriesOrder);
        setTags((fm.tags ?? []).join(", "));
        setExcerpt(fm.excerpt);
        setContent(data.content);
        setDate(fm.date);
        setLoaded(true);
      });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          project,
          series,
          seriesOrder,
          tags,
          excerpt,
          content,
          date,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setTimeout(() => router.push("/admin/posts"), 800);
    } catch {
      setStatus("error");
    }
  }

  if (!loaded) return <p className="py-8 text-ink-muted text-sm">Loading...</p>;

  return (
    <div className="py-8 max-w-2xl">
      <h1 className="font-display text-3xl text-ink mb-8">Edit post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-sm text-ink-muted block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            <label className="text-sm text-ink-muted block mb-1">Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
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
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink font-mono text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-accent text-bg rounded px-4 py-2 w-fit hover:bg-accent-strong transition-colors disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-600">Failed to save.</p>
        )}
      </form>
    </div>
  );
}

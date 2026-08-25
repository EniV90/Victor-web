"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState("");
  const [status, setStatus] = useState<"active" | "paused" | "done">("active");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );

  useEffect(() => {
    fetch(`/api/projects/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.project;
        setName(p.name);
        setTagline(p.tagline);
        setDescription(p.description);
        setStack((p.stack ?? []).join(", "));
        setStatus(p.status);
        setLoaded(true);
      });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name,
          tagline,
          description,
          stack: stack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status,
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/projects");
    } catch {
      setSaveStatus("error");
    }
  }

  if (!loaded) return <p className="py-8 text-ink-muted text-sm">Loading...</p>;

  return (
    <div className="py-8 max-w-2xl">
      <h1 className="font-display text-3xl text-ink mb-2">Edit project</h1>
      <Link
        href="/admin/projects"
        className="text-sm text-accent hover:underline"
      >
        ← Back to projects
      </Link>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
        <div>
          <label className="text-sm text-ink-muted block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
          />
        </div>
        <div>
          <label className="text-sm text-ink-muted block mb-1">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
          />
        </div>
        <div>
          <label className="text-sm text-ink-muted block mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-muted block mb-1">
              Stack (comma-separated)
            </label>
            <input
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="text-sm text-ink-muted block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full bg-bg-card border border-border rounded px-3 py-2 text-ink"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className="bg-accent text-bg rounded px-4 py-2 w-fit hover:bg-accent-strong transition-colors disabled:opacity-50"
        >
          {saveStatus === "saving" ? "Saving..." : "Save changes"}
        </button>
        {saveStatus === "error" && (
          <p className="text-sm text-red-600">Failed to save.</p>
        )}
      </form>
    </div>
  );
}

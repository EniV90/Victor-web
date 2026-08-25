"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  slug: string;
  name: string;
  tagline: string;
  status: string;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"? This can't be undone from here.`)) return;
    const res = await fetch(`/api/projects/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
    } else {
      alert("Failed to delete — check the console.");
    }
  }

  return (
    <div className="py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="text-sm text-accent hover:underline"
        >
          + New project
        </Link>
      </div>

      {loading && <p className="text-ink-muted text-sm">Loading...</p>}

      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="flex items-center justify-between border border-border bg-bg-card rounded px-4 py-3"
          >
            <div>
              <p className="text-ink">{project.name}</p>
              <p className="text-xs text-ink-faint">{project.tagline}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/projects/${project.slug}`}
                className="text-accent hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(project.slug)}
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

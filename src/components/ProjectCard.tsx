import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/${project.slug}`}
      className="group block rounded-lg bg-bg-card border border-border p-5 hover:border-accent transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-lg text-ink group-hover:text-accent transition-colors">
          {project.name}
        </h3>
        {project.status === "active" && (
          <span className="text-[11px] uppercase tracking-wide text-accent bg-accent-tint px-2 py-0.5 rounded">
            Active
          </span>
        )}
      </div>
      <p className="text-sm text-ink-muted mb-3">{project.tagline}</p>
      <div className="flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span key={s} className="text-xs text-ink-faint font-mono">
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
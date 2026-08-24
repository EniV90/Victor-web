import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function WorkPage() {
  return (
    <div className="py-8">
      <h1 className="font-display text-3xl text-ink mb-8">Work</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}

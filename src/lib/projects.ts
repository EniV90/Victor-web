export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  status: "active" | "paused" | "done";
};


export const projects: Project[] = [
  {
    "slug": "cleavedb",
    "name": "CleaveDB",
    "tagline": "A distributed, sharded database, built from scratch in Rust.",
    "description": "A Rust reimplementation of FokosDB, built as a deliberate way to go deep on Rust, database internals, and distributed systems — one milestone at a time, with an article for each.",
    "stack": ["Rust", "Distributed systems", "DSA"],
    "status": "active"
  },
  {
    "slug": "forgedb",
    "name": "ForgeDB",
    "tagline": "A database system in Rust, following CMU 15-445.",
    "description": "An earlier database project built from scratch in Rust, following the CMU 15-445 curriculum — buffer pool manager, disk scheduler, and page-level storage.",
    "stack": ["Rust", "Databases", "CMU 15-445"],
    "status": "paused"
  }
];


export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
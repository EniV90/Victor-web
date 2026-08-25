import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";
const FILE_PATH = "src/lib/projects.ts";

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };
}

async function getProjectsFile() {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${FILE_PATH}`,
    {
      headers: ghHeaders(),
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch projects.ts");
  const file = await res.json();
  const raw = Buffer.from(file.content, "base64").toString("utf-8");
  return { raw, sha: file.sha };
}

function extractProjects(raw: string) {
  const match = raw.match(
    /\/\/ PROJECTS_DATA_START([\s\S]*?)\/\/ PROJECTS_DATA_END/,
  );
  if (!match) throw new Error("Could not find PROJECTS_DATA markers");
  const arrayMatch = match[1].match(/\[[\s\S]*\]/);
  if (!arrayMatch) throw new Error("Could not find projects array");
  return JSON.parse(arrayMatch[0]);
}

function rebuildFile(raw: string, projects: unknown[]) {
  const json = JSON.stringify(projects, null, 2);
  return raw.replace(
    /\/\/ PROJECTS_DATA_START[\s\S]*?\/\/ PROJECTS_DATA_END/,
    `// PROJECTS_DATA_START\nexport const projects: Project[] = ${json};\n// PROJECTS_DATA_END`,
  );
}

async function commitFile(newRaw: string, sha: string, message: string) {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: ghHeaders(),
      body: JSON.stringify({
        message,
        content: Buffer.from(newRaw).toString("base64"),
        sha,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "GitHub API error");
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const { raw } = await getProjectsFile();
    const projects = extractProjects(raw);
    const project = projects.find((p: { slug: string }) => p.slug === slug);
    if (!project)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const updated = await req.json();
    const { raw, sha } = await getProjectsFile();
    const projects = extractProjects(raw);
    const index = projects.findIndex((p: { slug: string }) => p.slug === slug);
    if (index === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    projects[index] = updated;
    const newRaw = rebuildFile(raw, projects);
    await commitFile(newRaw, sha, `Update project: ${updated.name}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const { raw, sha } = await getProjectsFile();
    const projects = extractProjects(raw);
    const filtered = projects.filter((p: { slug: string }) => p.slug !== slug);
    if (filtered.length === projects.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const newRaw = rebuildFile(raw, filtered);
    await commitFile(newRaw, sha, `Delete project: ${slug}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

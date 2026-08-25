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
  const arrayMatch = match[1].match(/=\s*(\[[\s\S]*\]);/);
  if (!arrayMatch) throw new Error("Could not find projects array");
  return JSON.parse(arrayMatch[1]);
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

export async function GET() {
  try {
    const { raw } = await getProjectsFile();
    return NextResponse.json({ projects: extractProjects(raw) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newProject = await req.json();
    const { raw, sha } = await getProjectsFile();
    const projects = extractProjects(raw);

    if (projects.some((p: { slug: string }) => p.slug === newProject.slug)) {
      return NextResponse.json(
        { error: "A project with that slug already exists" },
        { status: 400 },
      );
    }

    projects.push(newProject);
    const newRaw = rebuildFile(raw, projects);
    await commitFile(newRaw, sha, `Add project: ${newProject.name}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

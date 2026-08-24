import { getAllPosts } from "@/lib/posts";

const SITE_URL = "https://your-domain-here.com"; // TODO: swap once you have a real domain

export async function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${post.frontmatter.title}</title>
      <link>${SITE_URL}/blog/${post.frontmatter.slug}</link>
      <guid>${SITE_URL}/blog/${post.frontmatter.slug}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.frontmatter.excerpt}]]></description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Victor — Blog</title>
    <link>${SITE_URL}</link>
    <description>Notes on systems programming, databases, and distributed systems.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Victor — Software Engineer",
  description:
    "Notes and projects on systems programming, databases, and distributed systems.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <div className="mx-auto max-w-3xl px-6">
          <header className="flex items-center justify-between py-10">
            <Link
              href="/"
              className="font-display text-lg text-ink hover:text-accent transition-colors"
            >
              Victor
            </Link>
            <nav className="flex gap-6 text-sm text-ink-muted">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-ink transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-24 mb-10 flex items-center justify-between border-t border-border pt-6 text-xs text-ink-faint">
            <span>&copy; {new Date().getFullYear()} Victor</span>
            <div className="flex gap-4">
              <a href="/rss.xml" className="hover:text-ink-muted">
                RSS
              </a>
              <a
                href="https://github.com"
                className="hover:text-ink-muted"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

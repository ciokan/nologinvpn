import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export interface PageMeta {
  title: string;
  excerpt: string;
  slug: string;
}

export interface PageContent extends PageMeta {
  html: string;
}

/** Read all page slugs (for static generation / sitemap) */
export function getAllPageSlugs(): string[] {
  if (!fs.existsSync(PAGES_DIR)) return [];
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(PAGES_DIR, f), "utf8");
      const { data } = matter(raw);
      return (data.slug as string) || f.replace(/\.md$/, "");
    });
}

/** Load a single page by slug */
export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  if (!fs.existsSync(PAGES_DIR)) return null;

  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fileSlug = (data.slug as string) || file.replace(/\.md$/, "");

    if (fileSlug === slug) {
      const html = await marked(content);
      return {
        title: (data.title as string) || slug,
        excerpt: (data.excerpt as string) || "",
        slug: fileSlug,
        html,
      };
    }
  }

  return null;
}

/** List all pages (for an index / footer links) */
export function getAllPages(): PageMeta[] {
  if (!fs.existsSync(PAGES_DIR)) return [];
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
      const { data } = matter(raw);
      const slug = (data.slug as string) || file.replace(/\.md$/, "");
      return {
        title: (data.title as string) || slug,
        excerpt: (data.excerpt as string) || "",
        slug,
      };
    });
}

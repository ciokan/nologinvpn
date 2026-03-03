import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ChevronLeft } from "lucide-react";
import { getPageBySlug, getAllPageSlugs } from "@/lib/content";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} — NoLoginVPN`,
    description: page.excerpt,
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">NoLoginVPN</span>
          </Link>
          <ModeToggle />
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-20 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">{page.title}</h1>
            {page.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {page.excerpt}
              </p>
            )}
          </div>

          {/* Markdown body */}
          <article
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-hr:border-border
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </div>
      </main>
    </div>
  );
}

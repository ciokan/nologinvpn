# Content Pages

Drop `.md` files here — they'll be served at `/p/<slug>`.

## Frontmatter fields

```markdown
---
title: Page Title          # Required — shown as H1 and in <title>
excerpt: Short description # Shown under the title and in meta description
slug: my-page              # Optional — defaults to the filename without .md
---

Your **Markdown** content here.
```

## Example

A file `content/pages/about.md` with `slug: about` → served at `/p/about`.

## Supported Markdown

Standard Markdown: headings, bold, italic, links, lists, code blocks, horizontal rules.

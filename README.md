# vertigis-markdown-viewer

Browser-native single-page markdown viewer with no local package dependencies.

## What it is

This viewer boots from a nearly empty `index.html`, loads its rendering libraries from a CDN, fetches all configured markdown pages up front, and presents them as a fast static-host-friendly SPA.

## Features

- bare HTML bootstrap: empty favicon, one inline module script, nothing else in the page
- no local package/runtime dependencies
- `markdown-it` and `highlight.js` loaded from CDN
- top-level `await Promise.all(...)` preload of every configured page
- pre-rendered page swaps with hash routing in `#page/section` form
- first `# H1` becomes the page title/source of page labeling
- pinned page navigation plus independently scrolling ToC
- safe markdown defaults: raw HTML disabled, external links opened safely, images lazy-loaded
- syntax highlighting, code block type headers, whole-block copy, CLI per-line copy, multiline CLI command copy
- themed tables, code blocks, and docs layout

## Bootstrap

`index.html` is the minimal local sample:

```html
<!doctype html>
<html>
<head>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
  <script type="module">
    import config from "./src/viewer.js";

    await config({
      overview: "./docs/overview.md",
      cli: "./docs/cli.md"
    });
  </script>
</head>
<body></body>
</html>
```

Each key becomes the route segment in `#page/section`, and each value is the markdown URL to fetch.

Cross-origin markdown URLs work too, as long as the browser can fetch them successfully.

`sample.html` is a second example that points at cross-origin markdown sources.

## Authoring notes

- each markdown page must start with `# H1`
- headings generate the per-page table of contents automatically
- duplicate heading slugs are uniquified automatically
- links to configured markdown pages are routed in-app when they match a configured source URL
- CLI fences should use `bash`, `sh`, `shell`, `zsh`, `powershell`, `ps1`, or `cmd`

## CLI copy behavior

- regular code blocks: one subtle copy action for the entire block
- CLI blocks: one subtle copy action per command line
- multiline CLI commands copy as a full command when a continuation marker is used:
  - `\` for shell/bash/zsh
  - `` ` `` for PowerShell
  - `^` for cmd

## Running it

Serve the repository from any static web server so the browser can fetch the markdown files.

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173/`.

## GitHub Pages

This repository includes a GitHub Actions workflow that publishes the repository root directly to GitHub Pages.

Once deployed:

- `index.html` serves the local sample docs viewer
- `sample.html` serves the cross-origin sample configuration

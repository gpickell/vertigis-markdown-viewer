# Overview

This viewer boots from a bare HTML file, loads its dependencies from a CDN, fetches every configured markdown page in parallel, and pre-renders the results before the interface settles.

## What you get

- bare HTML bootstrap with an empty favicon and one inline module script
- no local package/runtime dependencies; rendering libraries are pulled from a CDN
- top-level `await` preload of every configured page before first render
- hash-based routing with deep links like `#overview/what-you-get`
- pinned page navigation from the configured route map
- an independently scrolling table of contents generated from markdown headings
- instant page swaps because all configured pages are pre-rendered up front
- safe markdown defaults, syntax highlighting, and copy-friendly code blocks

## Feature summary

| Area | Behavior |
| --- | --- |
| Bootstrap | Minimal `index.html` with an empty favicon and one inline module script |
| Fetching | All configured markdown pages load in parallel before the first real render |
| Routing | Hash routes use `#page/section`, support deep links, and keep the active section in sync |
| Navigation | Page links stay pinned while the active page table of contents scrolls independently |
| Safety | Raw HTML is disabled, external links are opened safely, and images get safer defaults |
| Copy UX | Regular code blocks copy per block, CLI blocks copy per command, and multiline commands copy as a single unit |
| Rendering | Tables, blockquotes, lists, and code blocks get a docs-reader presentation instead of browser-default markdown styling |

## Bootstrap example

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

## Authoring notes

- the first `# H1` becomes the page title
- duplicate heading slugs are automatically uniquified
- configured markdown links can route in-app
- images are allowed and get safer defaults such as lazy loading

## Jump points

See the [CLI page](./cli.md#multiline-commands) for multiline command copy behavior and command examples.

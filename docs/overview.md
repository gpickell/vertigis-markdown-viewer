# Overview

This viewer boots from a bare HTML file, loads its dependencies from a CDN, and pre-renders every configured markdown page before the interface settles.

## What you get

- hash-based routing with deep links like `#overview/what-you-get`
- pinned page navigation from the configured route map
- an independently scrolling table of contents generated from markdown headings
- instant page swaps because all configured pages are pre-rendered up front

## Feature summary

| Area | Behavior |
| --- | --- |
| Bootstrap | Minimal `index.html` with an empty favicon and one inline module script |
| Fetching | All configured markdown pages load in parallel before the first real render |
| Routing | Hash routes use `#page/section` |
| Safety | Raw HTML is disabled and external links are opened safely |
| Copy UX | Regular code blocks copy per block, CLI blocks copy per command |

## Code sample

```js
const pages = {
  overview: "./docs/overview.md",
  cli: "./docs/cli.md"
};

await config(pages);
```

## Authoring notes

- the first `# H1` becomes the page title
- duplicate heading slugs are automatically uniquified
- configured markdown links can route in-app
- images are allowed and get safer defaults such as lazy loading

## Jump points

See the [CLI page](./cli.md#multiline-commands) for multiline command copy behavior and command examples.

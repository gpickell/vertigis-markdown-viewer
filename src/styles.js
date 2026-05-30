const STYLESHEET_ID = "vmv-styles";

const CSS = `
:root {
  color-scheme: dark;
  --vmv-bg: #07111f;
  --vmv-bg-elevated: rgba(14, 30, 51, 0.94);
  --vmv-panel: rgba(12, 26, 45, 0.92);
  --vmv-panel-strong: rgba(16, 38, 66, 0.96);
  --vmv-border: rgba(116, 174, 255, 0.16);
  --vmv-border-strong: rgba(116, 174, 255, 0.32);
  --vmv-text: #e8f1ff;
  --vmv-text-muted: #9eb8d8;
  --vmv-text-soft: #7f97b8;
  --vmv-accent: #7db7ff;
  --vmv-accent-strong: #9fd4ff;
  --vmv-accent-wash: rgba(64, 143, 255, 0.18);
  --vmv-link: #8ac4ff;
  --vmv-success: #7ef0c9;
  --vmv-danger: #ff9ba5;
  --vmv-shadow: 0 22px 70px rgba(0, 0, 0, 0.36);
  --vmv-radius: 10px;
  --vmv-radius-sm: 7px;
  --vmv-gutter: 1rem;
  --vmv-section-offset: 0.9rem;
  --vmv-sidebar-width: minmax(18rem, 22rem);
  font-family: Inter, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top, rgba(64, 143, 255, 0.18), transparent 34%),
    linear-gradient(180deg, #081322 0%, #050b15 100%);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  height: 100%;
  min-height: 100%;
  background: var(--vmv-bg);
  color: var(--vmv-text);
  overflow: hidden;
}

body {
  min-height: 100vh;
}

a {
  color: var(--vmv-link);
}

button,
a {
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease,
    opacity 140ms ease,
    transform 140ms ease;
}

button {
  font: inherit;
}

.vmv-shell {
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

.vmv-layout {
  display: grid;
  grid-template-columns: var(--vmv-sidebar-width) minmax(0, 1fr);
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.vmv-sidebar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.6rem;
  min-width: 0;
  min-height: 0;
  padding: var(--vmv-gutter);
  border-right: 1px solid var(--vmv-border);
  background: linear-gradient(180deg, rgba(8, 18, 34, 0.98), rgba(7, 15, 28, 0.95));
  overflow: hidden;
}

.vmv-sidebar-panel {
  padding: 0.7rem 0.7rem;
  border: 1px solid var(--vmv-border);
  border-radius: var(--vmv-radius);
  background: var(--vmv-panel);
  box-shadow: var(--vmv-shadow);
}

.vmv-sidebar-panel--pages {
  align-self: start;
}

.vmv-sidebar-panel--toc {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.vmv-sidebar-heading {
  margin: 0 0 0.45rem;
  color: var(--vmv-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.vmv-nav,
.vmv-toc {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vmv-nav-link,
.vmv-toc-link {
  display: block;
  width: 100%;
  padding: 0.32rem 0;
  border: 0;
  border-radius: 0;
  color: var(--vmv-text-muted);
  text-decoration: none;
  line-height: 1.35;
  text-shadow: 0 0 0 rgba(125, 183, 255, 0);
}

.vmv-nav-link:hover,
.vmv-nav-link:focus-visible,
.vmv-toc-link:hover,
.vmv-toc-link:focus-visible {
  color: #bdddff;
  text-shadow: 0 0 12px rgba(125, 183, 255, 0.22);
  outline: none;
}

.vmv-nav-link.is-active,
.vmv-toc-link.is-active {
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 0 16px rgba(125, 183, 255, 0.32);
}

.vmv-nav-status {
  display: inline-flex;
  margin-left: 0.45rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 155, 165, 0.12);
  color: var(--vmv-danger);
  font-size: 0.72rem;
  font-weight: 600;
}

.vmv-toc-link {
  padding-left: calc(var(--vmv-depth, 0) * 0.8rem);
  font-size: 0.89rem;
}

.vmv-toc-empty {
  margin: 0;
  color: var(--vmv-text-soft);
  font-size: 0.89rem;
}

.vmv-toc-region {
  min-height: 0;
  overflow: auto;
  padding-right: 0.2rem;
}

.vmv-main {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: var(--vmv-gutter);
  scroll-behavior: smooth;
}

.vmv-main::-webkit-scrollbar,
.vmv-toc-region::-webkit-scrollbar {
  width: 0.8rem;
}

.vmv-main::-webkit-scrollbar-thumb,
.vmv-toc-region::-webkit-scrollbar-thumb {
  border: 0.2rem solid transparent;
  border-radius: 999px;
  background: rgba(127, 175, 255, 0.24);
  background-clip: padding-box;
}

.vmv-main::-webkit-scrollbar-track,
.vmv-toc-region::-webkit-scrollbar-track {
  background: transparent;
}

.vmv-pages-host {
  min-height: 100%;
  padding-bottom: min(80vh, 32rem);
}

.vmv-page {
  display: none;
}

.vmv-page.is-active {
  display: block;
}

.vmv-page-article {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: 1.35rem 1.45rem 2rem;
  border: 1px solid var(--vmv-border);
  border-radius: calc(var(--vmv-radius) + 1px);
  background: var(--vmv-bg-elevated);
  box-shadow: var(--vmv-shadow);
}

.vmv-page-article > :first-child {
  margin-top: 0;
}

.vmv-page-article > :last-child {
  margin-bottom: 0;
}

.vmv-page-article h1,
.vmv-page-article h2,
.vmv-page-article h3,
.vmv-page-article h4,
.vmv-page-article h5,
.vmv-page-article h6 {
  scroll-margin-top: var(--vmv-section-offset);
  color: #f4f8ff;
  line-height: 1.18;
}

.vmv-page-article h1 {
  font-size: clamp(2rem, 1.75rem + 1.2vw, 2.9rem);
  margin-bottom: 1rem;
}

.vmv-page-article h2,
.vmv-page-article h3 {
  margin-top: 2rem;
}

.vmv-page-article p,
.vmv-page-article li,
.vmv-page-article blockquote {
  color: var(--vmv-text);
  line-height: 1.75;
}

.vmv-page-article blockquote {
  margin: 1.5rem 0;
  padding: 0.72rem 0.95rem;
  border-left: 4px solid rgba(129, 184, 255, 0.44);
  border-radius: 0 var(--vmv-radius-sm) var(--vmv-radius-sm) 0;
  background: rgba(31, 54, 84, 0.28);
}

.vmv-page-article p code,
.vmv-page-article li code,
.vmv-page-article blockquote code,
.vmv-page-article td code,
.vmv-page-article th code {
  padding: 0.14rem 0.45rem;
  border: 1px solid rgba(116, 174, 255, 0.16);
  border-radius: 999px;
  background: rgba(20, 42, 70, 0.75);
  color: #d7ecff;
  font-size: 0.93em;
}

.vmv-page-article img {
  max-width: 100%;
  height: auto;
  border-radius: var(--vmv-radius-sm);
  border: 1px solid var(--vmv-border);
  background: rgba(6, 14, 24, 0.7);
}

.vmv-table-wrap {
  margin: 1.5rem 0;
  border: 1px solid rgba(116, 174, 255, 0.18);
  border-radius: var(--vmv-radius);
  overflow-x: auto;
  background: rgba(9, 20, 35, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.vmv-page-article table {
  width: 100%;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.vmv-page-article thead {
  background: linear-gradient(180deg, rgba(34, 74, 124, 0.58), rgba(17, 38, 67, 0.9));
}

.vmv-page-article th,
.vmv-page-article td {
  min-width: 8rem;
  padding: 0.68rem 0.82rem;
  border-bottom: 1px solid rgba(116, 174, 255, 0.12);
  text-align: left;
  vertical-align: top;
}

.vmv-page-article th {
  color: #f4f8ff;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vmv-page-article td {
  color: var(--vmv-text);
}

.vmv-page-article tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.vmv-page-article tr:last-child td {
  border-bottom: 0;
}

.vmv-code-block {
  position: relative;
  margin: 1.1rem 0;
  border: 1px solid rgba(116, 174, 255, 0.16);
  border-radius: var(--vmv-radius);
  background: linear-gradient(180deg, rgba(5, 14, 24, 0.96), rgba(8, 18, 34, 0.98));
  overflow: hidden;
}

@keyframes vmv-copy-flash {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  60% {
    opacity: 0.45;
  }

  100% {
    opacity: 0;
  }
}

.vmv-copy-flash-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: rgba(125, 183, 255, 0.16);
  animation: vmv-copy-flash 180ms ease;
}

.vmv-code-block pre,
.vmv-cli-lines {
  margin: 0;
  font-family: "Cascadia Code", Consolas, "Courier New", monospace;
  font-size: 0.94rem;
  line-height: 1.5;
}

.vmv-code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  min-height: 2.1rem;
  padding: 0.45rem 0.65rem 0.42rem 0.85rem;
  border-bottom: 1px solid rgba(116, 174, 255, 0.12);
  background: linear-gradient(180deg, rgba(17, 34, 56, 0.88), rgba(11, 24, 41, 0.72));
}

.vmv-code-block-label {
  color: var(--vmv-text-soft);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vmv-code-block pre {
  position: relative;
  overflow: auto;
  padding: 0.95rem 1rem;
}

.vmv-code-block code.hljs {
  display: block;
  background: transparent;
  color: #dce9ff;
  font: inherit;
  line-height: inherit;
}

.vmv-copy-button {
  display: inline-grid;
  place-items: center;
  width: 1.2rem;
  height: 1.2rem;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(176, 204, 240, 0.34);
  cursor: pointer;
}

.vmv-copy-button {
  opacity: 0;
  transform: none;
}

.vmv-code-block:hover .vmv-copy-button,
.vmv-copy-button:focus-visible {
  opacity: 1;
  color: rgba(219, 235, 255, 0.5);
}

.vmv-copy-button:hover,
.vmv-copy-button:focus-visible {
  color: rgba(243, 248, 255, 0.88);
  outline: none;
}

.vmv-copy-button.is-copied {
  color: var(--vmv-success);
}

.vmv-copy-button.is-copy-failed,
.vmv-line-copy-button.is-copy-failed {
  color: var(--vmv-danger);
}

.vmv-copy-button svg {
  width: 0.82rem;
  height: 0.82rem;
  fill: currentColor;
}

.vmv-cli-lines {
  padding: 0.95rem 2.1rem 0.95rem 1rem;
  overflow-x: auto;
  overflow-y: hidden;
}

.vmv-cli-line {
  position: relative;
}

.vmv-line-copy-button,
.vmv-line-copy-spacer {
  position: absolute;
  top: 50%;
  right: -1.7rem;
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0;
  transform: translateY(-50%);
}

.vmv-line-copy-button {
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(176, 204, 240, 0.34);
  cursor: pointer;
  opacity: 0;
}

.vmv-line-copy-spacer {
  display: none;
}

.vmv-cli-line code {
  display: block;
  font: inherit;
  padding: 0;
  overflow: visible;
  background: transparent;
  border: 0;
  border-radius: 0;
  white-space: pre;
  color: inherit;
}

.vmv-line-copy-button svg {
  width: 0.82rem;
  height: 0.82rem;
  fill: currentColor;
}

.vmv-cli-line:hover .vmv-line-copy-button,
.vmv-line-copy-button:focus-visible {
  opacity: 1;
  color: rgba(219, 235, 255, 0.5);
}

.vmv-line-copy-button:hover,
.vmv-line-copy-button:focus-visible {
  color: rgba(243, 248, 255, 0.88);
  outline: none;
}

.vmv-line-copy-button.is-copied {
  color: var(--vmv-success);
}

.vmv-cli-line {
  position: relative;
}

.vmv-cli-line .vmv-copy-flash-layer {
  border-radius: 4px;
}

.vmv-page-error {
  border: 1px solid rgba(255, 155, 165, 0.18);
  background: rgba(65, 20, 28, 0.16);
  color: #ffd6db;
  padding: 1rem 1.1rem;
  border-radius: var(--vmv-radius-sm);
}

.vmv-loading,
.vmv-empty-state {
  display: grid;
  place-items: center;
  min-height: 18rem;
  color: var(--vmv-text-muted);
}

.hljs-comment,
.hljs-quote {
  color: #7d97ba;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #8ec5ff;
}

.hljs-string,
.hljs-title,
.hljs-name,
.hljs-type,
.hljs-attribute {
  color: #8ff2db;
}

.hljs-number,
.hljs-symbol,
.hljs-bullet,
.hljs-variable {
  color: #f6c177;
}

.hljs-built_in,
.hljs-builtin-name,
.hljs-meta {
  color: #c2a9ff;
}

.hljs-subst {
  color: #dce9ff;
}

@media (max-width: 960px) {
  .vmv-layout {
    grid-template-columns: 1fr;
  }

  .vmv-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--vmv-border);
  }

  .vmv-main {
    padding-top: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vmv-main {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
  }
}
`;

export function injectStyles() {
  if (document.getElementById(STYLESHEET_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLESHEET_ID;
  style.textContent = CSS;
  document.head.append(style);
}

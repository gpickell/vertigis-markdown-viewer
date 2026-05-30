import { injectStyles } from "./styles.js";
import MarkdownIt from "https://cdn.jsdelivr.net/npm/markdown-it/+esm";
import hljs from "https://cdn.jsdelivr.net/npm/highlight.js/+esm";

const [MarkdownRuntime, HighlightRuntime] = await Promise.all([
  Promise.resolve(MarkdownIt),
  Promise.resolve(hljs)
]);

const CLI_LANGUAGES = new Set(["bash", "sh", "shell", "zsh", "powershell", "ps1", "cmd"]);
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";
const SCROLL_SPY_OFFSET = 28;
const COPY_FEEDBACK_DURATION_MS = 180;
let cliCopyGroupCounter = 0;
const COPY_ICON = `
<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path d="M5 2.75A1.75 1.75 0 0 1 6.75 1h5.5A1.75 1.75 0 0 1 14 2.75v5.5A1.75 1.75 0 0 1 12.25 10h-5.5A1.75 1.75 0 0 1 5 8.25z"></path>
  <path d="M2 5.75A1.75 1.75 0 0 1 3.75 4h.75v1.5h-.75a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-.75h1.5v.75A1.75 1.75 0 0 1 10.25 14h-6.5A1.75 1.75 0 0 1 2 12.25z"></path>
</svg>`;

export default async function config(pageMap) {
  const entries = normalizePageEntries(pageMap);

  injectStyles();

  const ui = createShell();
  renderLoadingState(ui, "Loading markdown...");

  const markdown = createMarkdownRenderer();
  const sourceUrlToKey = new Map(entries.map((entry) => [stripUrlHash(entry.absoluteUrl), entry.key]));

  const pages = await Promise.all(
    entries.map((entry) => loadPage(entry, markdown))
  );

  for (const page of pages) {
    finalizeAnchors(page, sourceUrlToKey, pages);
  }

  const state = createState(ui, pages, sourceUrlToKey);
  renderPageNavigation(state);
  bindInteractions(state);
  applyHashRoute(state, { replaceInvalidHash: true });
}

function createMarkdownRenderer() {
  const markdown = new MarkdownRuntime({
    html: false,
    linkify: true,
    typographer: false
  });

  markdown.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
    const language = normalizeFenceLanguage(token.info);
    const rawCode = token.content.replace(/\r\n/g, "\n");

    if (isCliLanguage(language)) {
      return renderCliBlock(rawCode, language, markdown.utils.escapeHtml);
    }

    return renderStandardCodeBlock(rawCode, language, markdown.utils.escapeHtml);
  };

  return markdown;
}

function renderStandardCodeBlock(rawCode, language, escapeHtml) {
  const highlighted = highlightCode(rawCode, language, escapeHtml);
  const languageClass = language ? ` language-${language}` : "";
  const codeBlockLabel = formatCodeBlockLabel(language);

  return `
<div class="vmv-code-block" data-code-kind="block">
  <div class="vmv-code-block-header">
    <span class="vmv-code-block-label">${escapeHtml(codeBlockLabel)}</span>
    <button class="vmv-copy-button" type="button" data-copy="${encodeCopyValue(rawCode)}" data-copy-flash="block" data-icon-only="true" aria-label="Copy code block" title="Copy code block">${COPY_ICON}</button>
  </div>
  <pre><code class="hljs${languageClass}">${highlighted}</code></pre>
</div>`;
}

function renderCliBlock(rawCode, language, escapeHtml) {
  const lines = rawCode.split("\n");

  if (lines.length > 1 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const lineEntries = buildCliLineEntries(lines, language);
  const renderedLines = lineEntries.map((entry) => {
    const copyable = entry.copyable;
    const copyControl = copyable
      ? `<button class="vmv-line-copy-button" type="button" data-copy="${encodeCopyValue(entry.copyText)}" data-copy-flash-group="${entry.copyGroupId}" data-icon-only="true" aria-label="${entry.copyTitle}" title="${entry.copyTitle}">${COPY_ICON}</button>`
      : `<span class="vmv-line-copy-spacer" aria-hidden="true"></span>`;
    const highlightedLine = entry.line.length > 0 ? highlightCode(entry.line, language, escapeHtml) : "&nbsp;";
    const languageClass = language ? ` language-${language}` : "";

    return `
  <div class="vmv-cli-line" data-copy-group="${entry.copyGroupId}">
    <code class="hljs${languageClass}">${highlightedLine}</code>
    ${copyControl}
  </div>`;
  }).join("");
  const codeBlockLabel = formatCodeBlockLabel(language);

  return `
<div class="vmv-code-block" data-code-kind="cli">
  <div class="vmv-code-block-header">
    <span class="vmv-code-block-label">${escapeHtml(codeBlockLabel)}</span>
  </div>
  <div class="vmv-cli-lines">${renderedLines}
  </div>
</div>`;
}

function buildCliLineEntries(lines, language) {
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!isCopyableCliLine(line, language)) {
      entries.push({
        line,
        copyable: false,
        copyText: "",
        copyGroupId: "",
        copyTitle: ""
      });
      continue;
    }

    const commandLines = [line];
    let endIndex = index;

    while (endIndex + 1 < lines.length && continuesCliCommand(lines[endIndex], language)) {
      endIndex += 1;
      commandLines.push(lines[endIndex]);
    }

    const copyText = commandLines.join("\n");
    const copyGroupId = nextCliCopyGroupId();
    const copyTitle = commandLines.length > 1 ? "Copy command" : "Copy command line";

    for (let commandIndex = index; commandIndex <= endIndex; commandIndex += 1) {
      entries.push({
        line: lines[commandIndex],
        copyable: isCopyableCliLine(lines[commandIndex], language),
        copyText,
        copyGroupId,
        copyTitle
      });
    }

    index = endIndex;
  }

  return entries;
}

function highlightCode(code, language, escapeHtml) {
  const highlightLanguage = resolveHighlightLanguage(language);

  if (highlightLanguage && HighlightRuntime.getLanguage(highlightLanguage)) {
    return HighlightRuntime.highlight(code, {
      language: highlightLanguage,
      ignoreIllegals: true
    }).value;
  }

  return escapeHtml(code);
}

async function loadPage(entry, markdown) {
  try {
    const response = await fetch(entry.url, { credentials: "omit" });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const source = await response.text();
    const article = document.createElement("article");
    article.className = "vmv-page-article";
    article.innerHTML = markdown.render(source);

    wrapTables(article);
    applyImageSafety(article);

    const headings = collectHeadings(article);
    const firstHeading = headings[0];

    if (!firstHeading || firstHeading.level !== 1) {
      throw new Error("The first heading in each markdown file must be an H1.");
    }

    const section = document.createElement("section");
    section.className = "vmv-page";
    section.dataset.pageKey = entry.key;
    section.append(article);

    return {
      ...entry,
      element: section,
      article,
      title: firstHeading.text,
      headings,
      tocHeadings: headings.filter((heading) => heading.level > 1),
      headingSlugs: new Set(headings.map((heading) => heading.slug)),
      scrollTop: 0,
      unavailable: false
    };
  } catch (error) {
    const section = document.createElement("section");
    const article = document.createElement("article");
    const message = error instanceof Error ? error.message : "Unknown error";

    section.className = "vmv-page";
    section.dataset.pageKey = entry.key;
    article.className = "vmv-page-article";
    article.innerHTML = `
      <h1>${escapeHtml(entry.fallbackTitle)}</h1>
      <div class="vmv-page-error">
        This page could not be loaded.
        <br>
        <strong>${escapeHtml(message)}</strong>
      </div>
    `;
    section.append(article);

    return {
      ...entry,
      element: section,
      article,
      title: entry.fallbackTitle,
      headings: [],
      tocHeadings: [],
      headingSlugs: new Set(),
      scrollTop: 0,
      unavailable: true,
      errorMessage: message
    };
  }
}

function collectHeadings(article) {
  const headings = [];
  const slugCounts = new Map();

  article.querySelectorAll(HEADING_SELECTOR).forEach((element) => {
    const text = element.textContent.trim();

    if (!text) {
      return;
    }

    const baseSlug = slugify(text) || "section";
    const currentCount = slugCounts.get(baseSlug) ?? 0;
    const slug = currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`;

    slugCounts.set(baseSlug, currentCount + 1);
    element.id = slug;
    element.tabIndex = -1;

    headings.push({
      element,
      slug,
      text,
      level: Number.parseInt(element.tagName.slice(1), 10)
    });
  });

  return headings;
}

function finalizeAnchors(page, sourceUrlToKey, pages) {
  const pagesByKey = new Map(pages.map((entry) => [entry.key, entry]));

  page.article.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href");

    if (!href) {
      return;
    }

    const routeTarget = resolveRouteTarget(page, href, sourceUrlToKey, pagesByKey);

    if (routeTarget) {
      anchor.dataset.routeKey = routeTarget.pageKey;
      anchor.dataset.routeSection = routeTarget.sectionSlug;
      anchor.href = buildHash(routeTarget.pageKey, routeTarget.sectionSlug);
      return;
    }

    if (isHttpLikeHref(href)) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
  });
}

function resolveRouteTarget(page, href, sourceUrlToKey, pagesByKey) {
  if (href.startsWith("#")) {
    const sectionSlug = normalizeSectionSlug(href.slice(1));

    return {
      pageKey: page.key,
      sectionSlug
    };
  }

  try {
    const resolvedUrl = new URL(href, page.absoluteUrl);
    const pageKey = sourceUrlToKey.get(stripUrlHash(resolvedUrl.href));

    if (!pageKey) {
      return null;
    }

    const targetPage = pagesByKey.get(pageKey);
    const sectionSlug = normalizeSectionSlug(resolvedUrl.hash.slice(1));

    return {
      pageKey,
      sectionSlug: targetPage?.headingSlugs.has(sectionSlug) ? sectionSlug : ""
    };
  } catch {
    return null;
  }
}

function applyImageSafety(article) {
  article.querySelectorAll("img").forEach((image) => {
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
  });
}

function wrapTables(article) {
  article.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("vmv-table-wrap")) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "vmv-table-wrap";
    table.replaceWith(wrapper);
    wrapper.append(table);
  });
}

function createShell() {
  const shell = document.createElement("div");
  const layout = document.createElement("div");
  const sidebar = document.createElement("aside");
  const pagesPanel = document.createElement("section");
  const pagesHeading = document.createElement("h2");
  const pagesList = document.createElement("ul");
  const tocPanel = document.createElement("section");
  const tocHeading = document.createElement("h2");
  const tocContent = document.createElement("div");
  const main = document.createElement("main");
  const pagesHost = document.createElement("div");

  shell.className = "vmv-shell";
  layout.className = "vmv-layout";
  sidebar.className = "vmv-sidebar";
  pagesPanel.className = "vmv-sidebar-panel vmv-sidebar-panel--pages";
  pagesHeading.className = "vmv-sidebar-heading";
  pagesHeading.textContent = "Pages";
  pagesList.className = "vmv-nav";
  tocPanel.className = "vmv-sidebar-panel vmv-sidebar-panel--toc";
  tocHeading.className = "vmv-sidebar-heading";
  tocHeading.textContent = "On this page";
  tocContent.className = "vmv-toc-region";
  main.className = "vmv-main";
  pagesHost.className = "vmv-pages-host";

  pagesPanel.append(pagesHeading, pagesList);
  tocPanel.append(tocHeading, tocContent);
  sidebar.append(pagesPanel, tocPanel);
  main.append(pagesHost);
  layout.append(sidebar, main);
  shell.append(layout);

  document.body.replaceChildren(shell);

  return {
    shell,
    pagesList,
    tocContent,
    main,
    pagesHost
  };
}

function renderLoadingState(ui, titleText) {
  ui.pagesList.innerHTML = "";
  ui.tocContent.innerHTML = '<div class="vmv-loading">Loading the viewer...</div>';
  ui.pagesHost.innerHTML = '<div class="vmv-loading">Fetching markdown content...</div>';
}

function createState(ui, pages) {
  ui.pagesHost.replaceChildren(...pages.map((page) => page.element));

  return {
    ...ui,
    pages,
    pagesByKey: new Map(pages.map((page) => [page.key, page])),
    activePageKey: "",
    activeSectionSlug: "",
    pendingScrollFrame: 0,
    scrollSpyLocked: false,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };
}

function renderPageNavigation(state) {
  const items = state.pages.map((page) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const status = page.unavailable ? '<span class="vmv-nav-status">Unavailable</span>' : "";

    link.className = "vmv-nav-link";
    link.href = buildHash(page.key, "");
    link.dataset.routeKey = page.key;
    link.textContent = page.title;

    item.append(link);

    if (status) {
      link.insertAdjacentHTML("beforeend", status);
    }

    return item;
  });

  state.pagesList.replaceChildren(...items);
}

function bindInteractions(state) {
  state.shell.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const copyButton = target.closest("[data-copy]");

    if (copyButton instanceof HTMLButtonElement) {
      event.preventDefault();
      copyText(copyButton);
      return;
    }

    const routeLink = target.closest("a[data-route-key]");

    if (routeLink instanceof HTMLAnchorElement && isPrimaryNavigation(event)) {
      event.preventDefault();
      navigateToHash(state, routeLink.dataset.routeKey ?? "", routeLink.dataset.routeSection ?? "");
    }
  });

  state.main.addEventListener("scroll", () => {
    const activePage = state.pagesByKey.get(state.activePageKey);

    if (!activePage) {
      return;
    }

    activePage.scrollTop = state.main.scrollTop;

    if (state.scrollSpyLocked) {
      return;
    }

    if (state.pendingScrollFrame) {
      cancelAnimationFrame(state.pendingScrollFrame);
    }

    state.pendingScrollFrame = requestAnimationFrame(() => {
      state.pendingScrollFrame = 0;
      syncActiveSectionFromScroll(state);
    });
  });

  window.addEventListener("hashchange", () => {
    applyHashRoute(state, { replaceInvalidHash: true });
  });
}

function navigateToHash(state, pageKey, sectionSlug) {
  const nextHash = buildHash(pageKey, sectionSlug);

  if (window.location.hash === nextHash) {
    applyRoute(state, {
      pageKey,
      sectionSlug
    }, { replaceInvalidHash: false });
    return;
  }

  window.location.hash = nextHash;
}

function applyHashRoute(state, { replaceInvalidHash }) {
  const parsed = parseHash(window.location.hash);
  const resolved = resolveRoute(state, parsed);

  if (replaceInvalidHash) {
    const normalizedHash = buildHash(resolved.pageKey, resolved.sectionSlug);

    if (window.location.hash !== normalizedHash) {
      history.replaceState(null, "", normalizedHash);
    }
  }

  applyRoute(state, resolved, { replaceInvalidHash });
}

function applyRoute(state, route) {
  const nextPage = state.pagesByKey.get(route.pageKey);

  if (!nextPage) {
    return;
  }

  const previousPage = state.pagesByKey.get(state.activePageKey);

  if (previousPage && previousPage !== nextPage) {
    previousPage.scrollTop = state.main.scrollTop;
    previousPage.element.classList.remove("is-active");
  }

  nextPage.element.classList.add("is-active");
  state.activePageKey = nextPage.key;
  state.activeSectionSlug = route.sectionSlug;

  for (const page of state.pages) {
    if (page !== nextPage) {
      page.element.classList.remove("is-active");
    }
  }

  renderActiveNavigation(state, nextPage, route.sectionSlug);

  const scrollTarget = route.sectionSlug
    ? nextPage.article.querySelector(`#${escapeId(route.sectionSlug)}`)
    : null;

  state.scrollSpyLocked = true;
  if (scrollTarget) {
    scrollTarget.scrollIntoView({
      block: "start",
      behavior: "auto"
    });
  } else {
    state.main.scrollTo({
      top: 0,
      behavior: "auto"
    });
  }

  window.clearTimeout(applyRoute.unlockTimer);
  applyRoute.unlockTimer = window.setTimeout(() => {
    state.scrollSpyLocked = false;
    syncActiveSectionFromScroll(state);
  }, 0);
}

function renderActiveNavigation(state, page, sectionSlug) {
  state.pagesList.querySelectorAll(".vmv-nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.routeKey === page.key);
  });

  if (page.tocHeadings.length === 0) {
    state.tocContent.innerHTML = '<p class="vmv-toc-empty">No section headings available.</p>';
    return;
  }

  const list = document.createElement("ul");
  list.className = "vmv-toc";

  page.tocHeadings.forEach((heading) => {
    const item = document.createElement("li");
    const link = document.createElement("a");

    link.className = "vmv-toc-link";
    link.href = buildHash(page.key, heading.slug);
    link.dataset.routeKey = page.key;
    link.dataset.routeSection = heading.slug;
    link.style.setProperty("--vmv-depth", String(Math.max(heading.level - 2, 0)));
    link.textContent = heading.text;
    link.classList.toggle("is-active", heading.slug === sectionSlug);

    item.append(link);
    list.append(item);
  });

  state.tocContent.replaceChildren(list);
}

function syncActiveSectionFromScroll(state) {
  const page = state.pagesByKey.get(state.activePageKey);

  if (!page || page.headings.length === 0) {
    return;
  }

  let currentHeading = page.headings[0];
  const threshold = state.main.scrollTop + SCROLL_SPY_OFFSET;

  for (const heading of page.headings) {
    if (heading.element.offsetTop <= threshold) {
      currentHeading = heading;
    } else {
      break;
    }
  }

  const sectionSlug = currentHeading.level > 1 ? currentHeading.slug : "";

  if (sectionSlug === state.activeSectionSlug) {
    return;
  }

  state.activeSectionSlug = sectionSlug;
  history.replaceState(null, "", buildHash(page.key, sectionSlug));

  state.tocContent.querySelectorAll(".vmv-toc-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.routeSection === sectionSlug);
  });
}

function resolveRoute(state, parsedRoute) {
  const fallbackPage = state.pages[0];
  const page = state.pagesByKey.get(parsedRoute.pageKey) ?? fallbackPage;
  const sectionSlug = parsedRoute.sectionSlug && page.headingSlugs.has(parsedRoute.sectionSlug)
    ? parsedRoute.sectionSlug
    : "";

  return {
    pageKey: page.key,
    sectionSlug
  };
}

function parseHash(hash) {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;

  if (!value) {
    return {
      pageKey: "",
      sectionSlug: ""
    };
  }

  const slashIndex = value.indexOf("/");

  if (slashIndex === -1) {
    return {
      pageKey: decodeURIComponent(value),
      sectionSlug: ""
    };
  }

  return {
    pageKey: decodeURIComponent(value.slice(0, slashIndex)),
    sectionSlug: normalizeSectionSlug(decodeURIComponent(value.slice(slashIndex + 1)))
  };
}

function buildHash(pageKey, sectionSlug) {
  const encodedPageKey = encodeURIComponent(pageKey);

  if (!sectionSlug) {
    return `#${encodedPageKey}`;
  }

  return `#${encodedPageKey}/${encodeURIComponent(sectionSlug)}`;
}

function normalizePageEntries(pageMap) {
  if (!pageMap || typeof pageMap !== "object" || Array.isArray(pageMap)) {
    throw new Error("The viewer config must be a plain object that maps route keys to markdown URLs.");
  }

  const entries = Object.entries(pageMap).map(([key, url]) => {
    if (typeof key !== "string" || !key.trim()) {
      throw new Error("Route keys must be non-empty strings.");
    }

    if (typeof url !== "string" || !url.trim()) {
      throw new Error(`The route "${key}" must point to a non-empty markdown URL.`);
    }

    return {
      key,
      url,
      absoluteUrl: new URL(url, window.location.href).href,
      fallbackTitle: humanizeRouteKey(key)
    };
  });

  if (entries.length === 0) {
    throw new Error("At least one markdown page must be configured.");
  }

  return entries;
}

function normalizeFenceLanguage(info) {
  return info.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
}

function resolveHighlightLanguage(language) {
  switch (language) {
    case "cmd":
      return "dos";
    case "shell":
    case "sh":
    case "zsh":
      return "bash";
    case "ps1":
      return "powershell";
    default:
      return language;
  }
}

function isCliLanguage(language) {
  return CLI_LANGUAGES.has(language);
}

function isCopyableCliLine(line, language) {
  const trimmed = line.trim();

  if (!trimmed) {
    return false;
  }

  if (language === "cmd") {
    return !/^rem\b/i.test(trimmed) && !trimmed.startsWith("::");
  }

  return !trimmed.startsWith("#");
}

function continuesCliCommand(line, language) {
  const trimmedEnd = line.trimEnd();

  if (!trimmedEnd) {
    return false;
  }

  switch (language) {
    case "powershell":
    case "ps1":
      return trimmedEnd.endsWith("`");
    case "cmd":
      return trimmedEnd.endsWith("^");
    default:
      return trimmedEnd.endsWith("\\");
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSectionSlug(value) {
  return slugify(value);
}

function humanizeRouteKey(value) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCodeBlockLabel(language) {
  switch (language) {
    case "js":
      return "JavaScript";
    case "ts":
      return "TypeScript";
    case "jsx":
      return "JSX";
    case "tsx":
      return "TSX";
    case "sh":
    case "shell":
    case "zsh":
      return "Shell";
    case "bash":
      return "Bash";
    case "powershell":
    case "ps1":
      return "PowerShell";
    case "cmd":
      return "Command Prompt";
    case "":
      return "Code";
    default:
      return language.charAt(0).toUpperCase() + language.slice(1);
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function encodeCopyValue(value) {
  return encodeURIComponent(value);
}

function nextCliCopyGroupId() {
  cliCopyGroupCounter += 1;
  return `cli-copy-group-${cliCopyGroupCounter}`;
}

function stripUrlHash(value) {
  const url = new URL(value, window.location.href);
  url.hash = "";
  return url.href;
}

function escapeId(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function isPrimaryNavigation(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isHttpLikeHref(href) {
  return /^(https?:)?\/\//i.test(href);
}

async function copyText(button) {
  const iconOnly = button.dataset.iconOnly === "true";
  const originalLabel = button.textContent ?? "Copy";
  const originalTitle = button.getAttribute("title") ?? "";
  const originalAriaLabel = button.getAttribute("aria-label") ?? "";
  const textToCopy = decodeURIComponent(button.dataset.copy ?? "");

  try {
    await writeClipboardText(textToCopy);
  } catch (error) {
    button.classList.add("is-copy-failed");
    button.setAttribute("aria-label", "Copy failed");
    button.setAttribute("title", "Copy failed");
    button.blur();
    window.clearTimeout(button._copyResetTimer);
    button._copyResetTimer = window.setTimeout(() => {
      button.classList.remove("is-copy-failed");
      button.setAttribute("aria-label", originalAriaLabel);
      button.setAttribute("title", originalTitle);
    }, COPY_FEEDBACK_DURATION_MS);
    console.error("Copy failed.", error);
    return;
  }

  button.classList.add("is-copied");
  button.setAttribute("aria-label", "Copied");
  button.setAttribute("title", "Copied");
  button.blur();
  flashCopiedRegion(button);

  if (!iconOnly) {
    button.textContent = "Copied";
  }

  window.clearTimeout(button._copyResetTimer);
  button._copyResetTimer = window.setTimeout(() => {
    button.classList.remove("is-copied");

    if (!iconOnly) {
      button.textContent = originalLabel;
    }

    button.setAttribute("aria-label", originalAriaLabel);
    button.setAttribute("title", originalTitle);
  }, COPY_FEEDBACK_DURATION_MS);
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" })
      })
    ]);
    return;
  }

  throw new Error("Clipboard API is unavailable.");
}

function flashCopiedRegion(button) {
  const flashTargets = resolveCopyFlashTargets(button);

  for (const target of flashTargets) {
    target.querySelectorAll(":scope > .vmv-copy-flash-layer").forEach((layer) => layer.remove());

    const flashLayer = document.createElement("div");
    flashLayer.className = "vmv-copy-flash-layer";
    target.append(flashLayer);

    window.clearTimeout(target._copyFlashTimer);
    target._copyFlashTimer = window.setTimeout(() => {
      flashLayer.remove();
    }, COPY_FEEDBACK_DURATION_MS);
  }
}

function resolveCopyFlashTargets(button) {
  const copyGroupId = button.dataset.copyFlashGroup;

  if (copyGroupId) {
    return Array.from(document.querySelectorAll(`.vmv-cli-line[data-copy-group="${copyGroupId}"]`));
  }

  if (button.dataset.copyFlash === "block") {
    const blockPre = button.closest(".vmv-code-block")?.querySelector("pre");
    return blockPre ? [blockPre] : [];
  }

  return [];
}

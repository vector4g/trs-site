#!/usr/bin/env python3
"""
Extract article prose from JSX pages into markdown files under
/app/frontend/src/content/.

Why this exists
---------------
The React essay/memo/catch-22 pages render their body content inside
<BriefSection>/JSX blocks that are visible to users only AFTER JavaScript
executes. Non-JS crawlers (Ahrefs, LinkedIn, Twitter, etc.) fetching the raw
HTML from these routes see only the app shell + H1, missing the actual
article body and all in-body links. See SEO spec 2026-02-12 "server-render
existing article bodies".

Rather than duplicate content by hand, we extract the prose from the JSX
programmatically and emit a plain-text-oriented markdown file. The postbuild
`inject-writing-meta.js` script then renders the markdown to static HTML and
injects it inside <div id="root"> in each prerendered shell. React's
createRoot replaces #root on mount, so users still see the rich JSX version;
only crawlers (and screen readers before hydration) see the extracted body.

This script is idempotent: re-running it regenerates the markdown from the
current JSX. If you change essay copy in the JSX, re-run:

    python3 scripts/extract_essay_content.py

Design constraints
------------------
- Preserve prose verbatim (never re-punctuate, never rewrite).
- Convert <Link to="X">Y</Link> and <a href="X">Y</a> into markdown links
  [Y](X) so crawlers see real anchor targets in the injected HTML.
- Convert <em>/<strong> to *…* / **…**.
- Section markers <BriefSection number="I." title="X"> → "## I. X" heading.
- Ignore action buttons, share widgets, and diagnostic components (they are
  not article body).
"""

import re
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSX_SRC = {
    "writing/nothing-happened": "src/pages/exposure/NothingHappened.jsx",
    "writing/the-switch": "src/pages/exposure/TheSwitch.jsx",
    "writing/exposure-is-not-democratic": "src/pages/exposure/NotDemocratic.jsx",
    "memo": "src/pages/StrategicMemo.jsx",
    "catch-22": "src/pages/CatchTwentyTwo.jsx",
}
OUT_DIR = ROOT / "src" / "content"


def clean_whitespace(s: str) -> str:
    """Collapse JSX-source whitespace to single spaces, preserving intent."""
    s = re.sub(r"\{\"\s*\"\}", " ", s)  # {" "} → single space
    s = re.sub(r"\s+", " ", s).strip()
    return s


def jsx_inline_to_md(inner: str) -> str:
    """Convert inline JSX (inside <p> etc.) to markdown-compatible text."""
    s = inner

    # <Link to="/path">Text</Link> → [Text](/path)
    s = re.sub(
        r'<Link\s+to="([^"]+)"[^>]*>([\s\S]*?)</Link>',
        lambda m: f"[{clean_whitespace(m.group(2))}]({m.group(1)})",
        s,
    )
    # <a href="URL">Text</a> → [Text](URL)
    s = re.sub(
        r'<a\s+href="([^"]+)"[^>]*>([\s\S]*?)</a>',
        lambda m: f"[{clean_whitespace(m.group(2))}]({m.group(1)})",
        s,
    )
    # <em>X</em> → *X*
    s = re.sub(r"<em[^>]*>([\s\S]*?)</em>", lambda m: f"*{clean_whitespace(m.group(1))}*", s)
    # <strong>X</strong> → **X**
    s = re.sub(
        r"<strong[^>]*>([\s\S]*?)</strong>",
        lambda m: f"**{clean_whitespace(m.group(1))}**",
        s,
    )
    # <span ...>X</span> → X (styling stripped, prose preserved)
    s = re.sub(r"<span[^>]*>([\s\S]*?)</span>", lambda m: clean_whitespace(m.group(1)), s)
    # &nbsp; etc are rare in these files; leave them
    return clean_whitespace(s)


def extract_paragraphs(section_body: str) -> list[str]:
    """Yield each <p>...</p> contents inside a section body, as markdown."""
    paras = []
    for m in re.finditer(r"<p[^>]*>([\s\S]*?)</p>", section_body):
        text = jsx_inline_to_md(m.group(1))
        if text:
            paras.append(text)
    return paras


def extract_brief_sections(jsx: str) -> list[tuple[str, str, list[str]]]:
    """Return list of (number, title, [paragraphs]) for each section block.

    Supports <BriefSection> (used by /writing/* essays and /catch-22) and
    <MemoSection> (used by /memo). Both have the same attribute contract:
    number and title props, children are the section body.
    """
    out = []
    pattern = re.compile(
        r"<(?:BriefSection|MemoSection)\s+([^>]*)>([\s\S]*?)</(?:BriefSection|MemoSection)>",
        re.MULTILINE,
    )
    for m in pattern.finditer(jsx):
        attrs = m.group(1)
        body = m.group(2)
        num_m = re.search(r'number="([^"]*)"', attrs)
        title_m = re.search(r'title="([^"]*)"', attrs)
        number = num_m.group(1) if num_m else ""
        title = title_m.group(1) if title_m else ""
        paras = extract_paragraphs(body)
        out.append((number, title, paras))
    return out


def extract_flat_paragraphs(jsx: str) -> list[str]:
    """Fallback extraction for essays with no section markers (e.g.
    /writing/nothing-happened, which renders paragraphs directly inside a
    <div> without <BriefSection> wrappers).

    Strategy: find every <p>...</p> below the <EssayLayout ...> opening tag
    and above the closing </EssayLayout>. Ignores <p> tags inside <footer>-
    style CTA blocks by requiring them to appear before the final quarter of
    the file (heuristic; adjust if a page adds trailing prose).
    """
    # Grab content between <EssayLayout ...> and </EssayLayout>
    m = re.search(r"<EssayLayout[\s\S]*?>([\s\S]+?)</EssayLayout>", jsx)
    if not m:
        return []
    body = m.group(1)
    # Strip trailing CTA/footer paragraphs (those inside a <Link ...> or a
    # `mt-16 border-t` closing block used by essay endings).
    # Heuristic: cut at the first "border-t" wrapper that follows the main
    # article body div.
    cut_at = body.find('border-t')
    if cut_at > 0:
        body = body[:cut_at]
    return extract_paragraphs(body)


def extract_lede(jsx: str) -> str:
    """Try to pull the essay lede (passed as `lede=` prop to EssayLayout)."""
    # Match single-quoted or backtick-templated lede strings, or JSX string.
    m = re.search(r'lede=\{[^}]*\}', jsx, re.DOTALL)
    if not m:
        return ""
    # Look inside the {...} for a template literal or string.
    body = m.group(0)
    tpl_m = re.search(r"`([\s\S]*?)`", body)
    if tpl_m:
        return clean_whitespace(tpl_m.group(1))
    str_m = re.search(r'"([^"]+)"', body)
    if str_m:
        return str_m.group(1)
    return ""


def render_markdown(number: str, title: str, paragraphs: list[str]) -> str:
    """Render one section as markdown."""
    heading = f"## {number} {title}".strip() if number else f"## {title}"
    return heading + "\n\n" + "\n\n".join(paragraphs)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "writing").mkdir(parents=True, exist_ok=True)

    total_sections = 0
    for slug, rel_path in JSX_SRC.items():
        src = ROOT / rel_path
        jsx = src.read_text(encoding="utf-8")
        lede = extract_lede(jsx)
        sections = extract_brief_sections(jsx)

        parts: list[str] = []
        if lede:
            parts.append(f"*{lede}*")

        if sections:
            for number, title, paras in sections:
                parts.append(render_markdown(number, title, paras))
        else:
            # Flat essay (no BriefSection wrappers) — extract paragraphs
            # directly. This covers /writing/nothing-happened.
            flat = extract_flat_paragraphs(jsx)
            if not flat:
                print(f"[warn] {slug}: no sections or flat paragraphs found; skipping.")
                continue
            parts.extend(flat)
            sections = [("", "", flat)]  # for logging

        out_path = OUT_DIR / f"{slug}.md"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text("\n\n".join(parts) + "\n", encoding="utf-8")
        print(f"[extract] {slug}: {len(sections)} sections → {out_path.relative_to(ROOT)}")
        total_sections += len(sections)

    print(f"[extract] Done. Wrote {len(JSX_SRC)} files, {total_sections} sections total.")


if __name__ == "__main__":
    main()

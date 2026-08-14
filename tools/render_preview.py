"""Approximate the site's real Jekyll build (actions/jekyll-build-pages, run
automatically by .github/workflows/jekyll-gh-pages.yml on every push to
main) for fast local preview -- this script is NOT part of that build and
is never invoked by it. Uses python-liquid instead of real Jekyll/Ruby, so
Jekyll-specific filters/tags beyond front matter + {{ content }} +
{% include %} won't work here even though they'd work in production.
Re-run after editing a page, a layout, or an include, then serve _preview/
with `python -m http.server` and open it in a browser to check the result
before pushing.
"""
from pathlib import Path
import re
import shutil

import yaml
from liquid import Environment

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_preview"
SKIP_DIRS = {"_layouts", "_includes", "_preview", "tools", ".git", ".github"}
INCLUDE_RE = re.compile(r"{%-?\s*include\s+(\S+?)\s*-?%}")

env = Environment()


def resolve_includes(text: str) -> str:
    """Splice in _includes/<name> verbatim wherever {% include name %}
    appears -- our includes are static HTML with no Liquid of their own,
    so a textual substitution before Liquid parsing is enough here."""
    def repl(match: "re.Match[str]") -> str:
        include_path = ROOT / "_includes" / match.group(1)
        return include_path.read_text(encoding="utf-8")
    prev = None
    while prev != text:
        prev = text
        text = INCLUDE_RE.sub(repl, text)
    return text


def split_front_matter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    front_matter = yaml.safe_load(parts[1]) or {}
    return front_matter, parts[2].lstrip("\n")


def render_page(src: Path, dest: Path) -> None:
    page, body = split_front_matter(src.read_text(encoding="utf-8"))
    if not page:
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        return

    page.setdefault("url", "/" + src.relative_to(ROOT).as_posix())
    if page["url"] == "/index.html":
        page["url"] = "/"

    content = env.from_string(resolve_includes(body)).render(page=page)

    layout_name = page.get("layout", "base")
    layout_raw = (ROOT / "_layouts" / f"{layout_name}.html").read_text(encoding="utf-8")
    _, layout_src = split_front_matter(layout_raw)
    layout_src = resolve_includes(layout_src)
    rendered = env.from_string(layout_src).render(page=page, content=content)

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(rendered, encoding="utf-8")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    for path in ROOT.rglob("*"):
        if path.is_dir():
            continue
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        dest = OUT / rel
        if path.suffix == ".html":
            render_page(path, dest)
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, dest)

    print(f"Rendered preview into {OUT}")


if __name__ == "__main__":
    main()

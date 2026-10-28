#!/usr/bin/env python3
"""Bundle src/ into a single index.html that opens straight from disk (file://).

Browsers refuse to load local ES modules and fetch local files from a file:// page,
so this inlines the CSS, the JS modules (in dependency order) and the assets.
Three.js still comes from the CDN, which allows it.

    python3 build.py           # the full game → index.html
    python3 build.py --demo    # 5 minutes a day → Casino Camino Demo/index.html
    python3 build.py --archive # the C2 coin on its own, not linked from the game → Coin Archive/index.html
"""
import base64
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'

# dependencies first
MODULES = [
    'assets.js', 'paint.js', 'drawing.js', 'chip.js', 'figure.js', 'merchant.js', 'keeper.js', 'concierge.js', 'guests.js', 'zoetrope.js', 'wallet.js',
    'coins/world.js', 'coins/coin.js', 'coins/set.js', 'coins/viewer.js', 'coins/globe.js', 'coins/gallery.js',
    'art.js', 'resort.js', 'resort-views.js',
    'shell.js', 'fortuna/engine.js', 'fortuna/table.js', 'frontier/engine.js', 'frontier/table.js',
    'ricochet/engine.js', 'ricochet/medals.js', 'ricochet/table.js', 'venue.js', 'main.js',
]
TEXT_ASSETS = [f'American_Playing_Cards_Symbols/{s}.svg' for s in ('spades', 'hearts', 'clubs', 'diamonds', 'star')] + ['quotes.txt']
JOURNAL_COVERS = [f'assets/journals/{n}.jpg' for n in ('society-review', 'chronicle', 'american-chronicle', 'enterpriser')]
BINARY_ASSETS = ['Casino Camino Title/3D Title/CasinoCamino3dTitle.stl', 'assets/coin/C2 Casino Camino Chip Arc Star.stl'] + JOURNAL_COVERS + [
    f'assets/cards/{s}_{r}.jpg' for s in ('spades', 'clubs', 'hearts', 'diamonds', 'stars') for r in range(1, 11)]

IMPORT = re.compile(r"^import (.+) from '([^']+)';\s*$")
EXPORT = re.compile(r"^export (async function|function|class|const|let) (\w+)")


def declared_names(line):
    """Every name a `const`/`let` line declares at the top level: `export const A = 1, B = f(x, y = 2);` → A, B."""
    body = line.split(' ', 2)[2]
    names, depth, start, quote = [], 0, True, None
    for i, ch in enumerate(body):
        if quote:
            if ch == quote and body[i - 1] != '\\':
                quote = None
            continue
        if ch in '\'"`':
            quote = ch
        elif ch in '([{':
            depth += 1
        elif ch in ')]}':
            depth -= 1
        elif ch == ',' and depth == 0:
            start = True
            continue
        if start and not ch.isspace():
            m = re.match(r'\w+', body[i:])
            if m:
                names.append(m.group(0))
            start = False
    return names


def var_name(path):
    return '__m_' + re.sub(r'\W', '_', path[:-3])


def resolve(importer, spec):
    base = pathlib.PurePosixPath(importer).parent
    parts = []
    for p in (base / spec).parts:
        if p == '..':
            parts.pop()
        elif p != '.':
            parts.append(p)
    return '/'.join(parts)


def bundle(modules=MODULES, entry='main.js'):
    hoisted, body = [], []
    for mod in modules:
        exports, out = [], []
        for line in (SRC / 'js' / mod).read_text().split('\n'):
            m = IMPORT.match(line)
            if m:
                what, spec = m.groups()
                if spec.startswith('.'):
                    target = resolve(mod, spec)
                    assert target in modules, f'{mod} imports unknown {target}'
                    out.append(f'const {what} = {var_name(target)};')
                elif line.strip() not in hoisted:
                    hoisted.append(line.strip())
                continue
            m = EXPORT.match(line)
            if m:
                exports.extend(declared_names(line) if m.group(1) in ('const', 'let') else [m.group(2)])
                line = line[len('export '):]
            out.append(line)
        code = '\n'.join(out).replace('import.meta.url', 'location.href')
        if mod == entry:
            body.append(f'(async () => {{\n{code}\n}})();')
        else:
            body.append(f'const {var_name(mod)} = (() => {{\n{code}\nreturn {{ {", ".join(exports)} }};\n}})();')
    return '\n'.join(hoisted) + '\n\n' + '\n\n'.join(body)


def assets(text=TEXT_ASSETS, binary=BINARY_ASSETS):
    data = {p: (ROOT / p).read_text() for p in text}
    data.update({p: base64.b64encode((ROOT / p).read_bytes()).decode() for p in binary})
    return json.dumps(data)


# The C2 print: the first coin, frozen on a page of its own.
ARCHIVE_MODULES = ['assets.js', 'coins/world.js', 'coins/coin.js', 'coins/set.js', 'coins/viewer.js', 'coins/archive.js']


def archive():
    src = (SRC / 'index.html').read_text()
    head = src[src.index('<link rel="preconnect"'):src.index('<link rel="stylesheet" href="css/camino.css">')]
    importmap = src[src.index('<script type="importmap">'):src.index('</head>')]
    css = (SRC / 'css' / 'camino.css').read_text()
    js = bundle(ARCHIVE_MODULES, 'coins/archive.js').replace('</script', '<\\/script')
    data = assets([], ['assets/coin/C2 Casino Camino Chip Arc Star.stl'])
    html = f"""<!doctype html>
<!-- Built from src/ by build.py. Edit the sources, then run: python3 build.py --archive -->
<html lang="en" data-theme="day">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <title>Casino Camino · Coin Archive · C2</title>
  {head.strip()}
  <style>
{css}
.archive-root [data-act="leave"] {{ visibility: hidden; }}
  </style>
  {importmap.strip()}
</head>
<body>
  <div class="table-layer open archive-root"></div>
  <script>window.__CAMINO_ASSETS = {data};</script>
  <script type="module">
{js}
</script>
</body>
</html>
"""
    out = ROOT / 'Coin Archive' / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(html)
    print(f'{out.relative_to(ROOT)} written ({len(html) // 1024} KB)')


def main(demo=False):
    html = (SRC / 'index.html').read_text()
    css = (SRC / 'css' / 'camino.css').read_text()
    js = bundle().replace('</script', '<\\/script')
    link = '<link rel="stylesheet" href="css/camino.css">'
    script = '<script type="module" src="js/main.js"></script>'
    assert link in html and script in html
    html = html.replace(link, f'<style>\n{css}\n</style>')
    html = html.replace(script, f'<script>window.__CAMINO_ASSETS = {assets()};</script>\n  <script type="module">\n{js}\n</script>')
    if demo:
        html = html.replace('<title>Casino Camino</title>', '<title>Casino Camino Demo</title>')
        html = html.replace('</head>', f'<style>\n{(SRC / "demo" / "demo.css").read_text()}</style>\n</head>', 1)
        html = html.replace('</body>', f'<script>\n{(SRC / "demo" / "demo.js").read_text()}</script>\n</body>', 1)
    flag = ' --demo' if demo else ''
    html = html.replace('<!doctype html>', f'<!doctype html>\n<!-- Built from src/ by build.py. Edit the sources, then run: python3 build.py{flag} -->', 1)
    out = ROOT / 'Casino Camino Demo' / 'index.html' if demo else ROOT / 'index.html'
    out.write_text(html)
    print(f'{out.relative_to(ROOT)} written ({len(html) // 1024} KB)')


if __name__ == '__main__':
    if '--archive' in sys.argv[1:]:
        archive()
    else:
        main(demo='--demo' in sys.argv[1:])

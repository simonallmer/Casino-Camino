#!/usr/bin/env python3
"""Bundle src/ into a single index.html that opens straight from disk (file://).

Browsers refuse to load local ES modules and fetch local files from a file:// page,
so this inlines the CSS, the JS modules (in dependency order) and the assets.
Three.js still comes from the CDN, which allows it.

    python3 build.py           # the full game → index.html
    python3 build.py --demo    # 10 minutes a day → Casino Camino Demo/index.html
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
    'assets.js', 'paint.js', 'chip.js', 'merchant.js', 'zoetrope.js', 'wallet.js',
    'shell.js', 'fortuna/engine.js', 'fortuna/table.js', 'frontier/engine.js', 'frontier/table.js',
    'ricochet/engine.js', 'ricochet/medals.js', 'ricochet/table.js', 'venue.js', 'main.js',
]
TEXT_ASSETS = [f'American_Playing_Cards_Symbols/{s}.svg' for s in ('spades', 'hearts', 'clubs', 'diamonds', 'star')] + ['quotes.txt']
BINARY_ASSETS = ['Casino Camino Title/3D Title/CasinoCamino3dTitle.stl'] + [
    f'assets/cards/{s}_{r}.jpg' for s in ('spades', 'clubs', 'hearts', 'diamonds', 'stars') for r in range(1, 11)]

IMPORT = re.compile(r"^import (.+) from '([^']+)';\s*$")
EXPORT = re.compile(r"^export (async function|function|class|const|let) (\w+)")


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


def bundle():
    hoisted, body = [], []
    for mod in MODULES:
        exports, out = [], []
        for line in (SRC / 'js' / mod).read_text().split('\n'):
            m = IMPORT.match(line)
            if m:
                what, spec = m.groups()
                if spec.startswith('.'):
                    target = resolve(mod, spec)
                    assert target in MODULES, f'{mod} imports unknown {target}'
                    out.append(f'const {what} = {var_name(target)};')
                elif line.strip() not in hoisted:
                    hoisted.append(line.strip())
                continue
            m = EXPORT.match(line)
            if m:
                exports.append(m.group(2))
                line = line[len('export '):]
            out.append(line)
        code = '\n'.join(out).replace('import.meta.url', 'location.href')
        if mod == 'main.js':
            body.append(f'(async () => {{\n{code}\n}})();')
        else:
            body.append(f'const {var_name(mod)} = (() => {{\n{code}\nreturn {{ {", ".join(exports)} }};\n}})();')
    return '\n'.join(hoisted) + '\n\n' + '\n\n'.join(body)


def assets():
    data = {p: (ROOT / p).read_text() for p in TEXT_ASSETS}
    data.update({p: base64.b64encode((ROOT / p).read_bytes()).decode() for p in BINARY_ASSETS})
    return json.dumps(data)


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
    main(demo='--demo' in sys.argv[1:])

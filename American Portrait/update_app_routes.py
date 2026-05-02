with open('app.js', 'r') as f:
    content = f.read()

content = content.replace(
    "'#games': 'games',",
    "'#games': 'games',\n        '#frontier': 'frontier',"
)

content = content.replace(
    "'#games': '#start'",
    "'#games': '#start',\n                '#frontier': '#games'"
)

with open('app.js', 'w') as f:
    f.write(content)

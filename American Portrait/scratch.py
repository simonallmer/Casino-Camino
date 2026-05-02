import re
import json

with open('./Casino Camino/frontier.html', 'r') as f:
    html = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
css = css_match.group(1) if css_match else ""

# Remove body and general margin/padding resets from css to avoid conflicts
css = re.sub(r'body\s*\{[^}]*\}', '', css)
css = re.sub(r'@import[^;]+;', '', css)

# Make IDs unique if necessary, or just keep as is
# Assuming it's fine as is.
css = "/* ===== FRONTIER GAME CSS ===== */\n" + css

with open('styles.css', 'a') as f:
    f.write("\n" + css)

# Extract Game Container HTML
html_match = re.search(r'<div id="game-container">(.*?)<div\s*style="width: 100%; text-align: center; color: var\(--gold\);', html, re.DOTALL)
game_html_content = html_match.group(1) if html_match else ""

game_html = f"""
    <!-- Frontier Game View -->
    <section id="frontier" class="view">
        <a href="#games" class="back-abs">BACK TO GAMES</a>
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--black);">
            <div id="game-container">
{game_html_content}
            </div>
        </div>
    </section>
"""

with open('index.html', 'r') as f:
    idx_html = f.read()

# Replace games link
idx_html = idx_html.replace(
    '<a href="https://simonallmer.com/camino" target="_top" class="game-btn">More Information</a>\n                        <a href="https://simonallmer.com/casinocaminoarcade" target="_top" class="game-btn">Play on Arcade</a>',
    '<a href="https://simonallmer.com/camino" target="_top" class="game-btn">More Information</a>\n                        <a href="#frontier" class="game-btn" onclick="frontierGame.initGame()">Play Frontier</a>'
)

# Replace the closing body tag
idx_html = idx_html.replace('    <script src="app.js"></script>\n</body>', f'{game_html}    <script src="frontier.js"></script>\n    <script src="app.js"></script>\n</body>')

with open('index.html', 'w') as f:
    f.write(idx_html)

# Read frontier.js
with open('./Casino Camino/frontier.js', 'r') as f:
    js_content = f.read()

# Replace money '€' with '$'
js_content = js_content.replace('€', '$')

# Replace global player loading and saving
js_content = re.sub(r'loadGlobalPlayers\(\) \{[\s\S]*?\}', '''loadGlobalPlayers() {
        // Standalone initialization: 2 players, $10 each
        this.allGlobalPlayers = [
            { id: 1, name: 'Player 1', cash: 10, color: { hex: '#3b82f6' } },
            { id: 2, name: 'Player 2', cash: 10, color: { hex: '#ef4444' } }
        ];
    }''', js_content)

js_content = re.sub(r'saveGlobalPlayers\(\) \{[\s\S]*?\}', '''saveGlobalPlayers() {
        // Standalone: do nothing
    }''', js_content)

js_content = js_content.replace('const game = new FrontierGame();', 'const frontierGame = new FrontierGame();')
js_content = js_content.replace('onclick="game.', 'onclick="frontierGame.')
# Make sure overlay buttons are updated
idx_html = open('index.html', 'r').read()
idx_html = idx_html.replace('onclick="game.', 'onclick="frontierGame.')
with open('index.html', 'w') as f:
    f.write(idx_html)

with open('frontier.js', 'w') as f:
    f.write(js_content)


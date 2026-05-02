import json
import re

file_path = "/Users/simonthomasallmer/Gemini/Antigravity/Simon Allmer App/Simon Allmer/American Portrait Developer/presidents_data.js"
with open(file_path, 'r') as f:
    content = f.read()

# Extract the array content
# Match the start of the array and the end
match = re.search(r'const presidentsData = (\[.*\]);', content, re.DOTALL)
if not match:
    print("Could not find presidentsData array")
    exit(1)

array_str = match.group(1)
# Use json.loads to parse it. Note: JS objects might have trailing commas or single quotes,
# but our file seems to use standard JSON-like structure (double quotes).
# Wait, JS objects don't require quotes for keys.
# Let's check the file content again.
# 4:     "name": "George Washington",
# Yes, it uses double quotes for keys.

data = json.loads(array_str)

ids = [
    "washington", "adams-john", "jefferson", "madison", "monroe", "adams-quincy", "jackson", "van-buren",
    "harrison-william", "tyler", "polk", "taylor", "fillmore", "pierce", "buchanan", "lincoln", "johnson-andrew",
    "grant", "hayes", "garfield", "arthur", "cleveland-1", "harrison-benjamin", "cleveland-2", "mckinley",
    "roosevelt-theodore", "taft", "wilson", "harding", "coolidge", "hoover", "roosevelt-franklin", "truman",
    "eisenhower", "kennedy", "johnson-lyndon", "nixon", "ford", "carter", "reagan", "bush-herbert", "clinton",
    "bush-walker", "obama", "trump", "biden"
]

for i, president in enumerate(data):
    pres_id = ids[i]
    # Local path relative to index.html
    president["portraitUrl"] = f"President Portraits/{pres_id}.jpg"

# Convert back to JS string
new_array_str = json.dumps(data, indent=2)
# Replace the old array with the new one
new_content = content.replace(array_str, new_array_str)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Updated presidents_data.js")

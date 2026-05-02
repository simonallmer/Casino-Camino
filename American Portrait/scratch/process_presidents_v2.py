import json
import os

# Load the JSON data
json_path = "/Users/simonthomasallmer/.gemini/antigravity/brain/7c3dd3ae-91bf-4740-9723-8a3664af6777/.system_generated/steps/37/content.md"
with open(json_path, 'r') as f:
    content = f.read()
    json_str = content[content.find('['):]
    data = json.loads(json_str)

ids = [
    "washington", "adams-john", "jefferson", "madison", "monroe", "adams-quincy", "jackson", "van-buren",
    "harrison-william", "tyler", "polk", "taylor", "fillmore", "pierce", "buchanan", "lincoln", "johnson-andrew",
    "grant", "hayes", "garfield", "arthur", "cleveland-1", "harrison-benjamin", "cleveland-2", "mckinley",
    "roosevelt-theodore", "taft", "wilson", "harding", "coolidge", "hoover", "roosevelt-franklin", "truman",
    "eisenhower", "kennedy", "johnson-lyndon", "nixon", "ford", "carter", "reagan", "bush-herbert", "clinton",
    "bush-walker", "obama", "trump", "biden"
]

download_cmds = []

for i, entry in enumerate(data):
    original_url = entry['photo']
    full_url = original_url
    
    # Correctly handle Wikipedia thumb URLs
    # Example: https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Filename.jpg/220px-Filename.jpg
    # To: https://upload.wikimedia.org/wikipedia/commons/b/b6/Filename.jpg
    if "/thumb/" in original_url:
        parts = original_url.split('/')
        # Check if it follows the thumb pattern (usually ends with px-filename)
        if parts[-1].endswith(parts[-2]) or "px-" in parts[-1]:
            # Remove /thumb/ (index 5) and the last part
            new_parts = parts[:5] + parts[6:-1]
            full_url = '/'.join(new_parts)
    
    pres_id = ids[i]
    filename = f"{pres_id}.jpg"
    dest_path = f"President Portraits/{filename}"
    
    download_cmds.append(f'curl -L -o "{dest_path}" "{full_url}"')

with open("download_portraits_v2.sh", 'w') as f:
    f.write("#!/bin/bash\n")
    f.write('mkdir -p "President Portraits"\n')
    f.write("\n".join(download_cmds))

print("Created download_portraits_v2.sh")

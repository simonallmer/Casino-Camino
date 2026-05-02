import json
import os

# Load the JSON data
json_path = "/Users/simonthomasallmer/.gemini/antigravity/brain/7c3dd3ae-91bf-4740-9723-8a3664af6777/.system_generated/steps/37/content.md"
with open(json_path, 'r') as f:
    content = f.read()
    # Find the start of the JSON array
    json_str = content[content.find('['):]
    data = json.loads(json_str)

# IDs from presidents_data.js in order
ids = [
    "washington", "adams-john", "jefferson", "madison", "monroe", "adams-quincy", "jackson", "van-buren",
    "harrison-william", "tyler", "polk", "taylor", "fillmore", "pierce", "buchanan", "lincoln", "johnson-andrew",
    "grant", "hayes", "garfield", "arthur", "cleveland-1", "harrison-benjamin", "cleveland-2", "mckinley",
    "roosevelt-theodore", "taft", "wilson", "harding", "coolidge", "hoover", "roosevelt-franklin", "truman",
    "eisenhower", "kennedy", "johnson-lyndon", "nixon", "ford", "carter", "reagan", "bush-herbert", "clinton",
    "bush-walker", "obama", "trump", "biden"
]

# Ensure we have the same number of entries
if len(data) != len(ids):
    print(f"Warning: Data length {len(data)} != ID length {len(ids)}")

# Prepare download commands and updated data
download_cmds = []
updated_presidents = []

for i, entry in enumerate(data):
    original_url = entry['photo']
    # Convert thumb URL to full res
    if "/thumb/" in original_url:
        # Example: https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/220px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg
        # To: https://upload.wikimedia.org/wikipedia/commons/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg
        parts = original_url.split('/')
        # parts looks like: ['https:', '', 'upload.wikimedia.org', 'wikipedia', 'commons', 'thumb', 'b', 'b6', 'filename.jpg', '220px-filename.jpg']
        # We want to remove index 5 ('thumb') and the last index.
        new_parts = parts[:5] + parts[6:-1]
        full_url = '/'.join(new_parts)
    else:
        full_url = original_url
    
    pres_id = ids[i]
    filename = f"{pres_id}.jpg"
    dest_path = f"President Portraits/{filename}"
    
    download_cmds.append(f'curl -L -o "{dest_path}" "{full_url}"')
    
    # We will update presidents_data.js separately, but this helps verify
    updated_presidents.append({
        "id": pres_id,
        "portraitUrl": dest_path
    })

# Output download script
with open("download_portraits.sh", 'w') as f:
    f.write("#!/bin/bash\n")
    f.write('mkdir -p "President Portraits"\n')
    f.write("\n".join(download_cmds))

print("Created download_portraits.sh")

import json

# CONFIG
INPUT_FILE = "sanmar_catalog.json"
OUTPUT_FILE_1 = "sanmar_catalog_part1.json"
OUTPUT_FILE_2 = "sanmar_catalog_part2.json"

# How many items per split?
ITEMS_PER_SPLIT = 5000

with open(INPUT_FILE, 'r', encoding='utf-8') as infile:
    data = json.load(infile)
    total_items = len(data)
    split_point = total_items // 2
    split_point = min(split_point, ITEMS_PER_SPLIT)

    with open(OUTPUT_FILE_1, 'w', encoding='utf-8') as out1:
        json.dump(data[:split_point], out1, indent=2)

    with open(OUTPUT_FILE_2, 'w', encoding='utf-8') as out2:
        json.dump(data[split_point:], out2, indent=2)

print(f"✅ JSON split done: {OUTPUT_FILE_1} and {OUTPUT_FILE_2}")

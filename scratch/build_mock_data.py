import json
import os

parsed_json_path = "order_369264_parsed.json"
specs_json_path = "item_specs_v2.json"
output_ts_path = "apps/back-office/src/mockData.ts"

with open(parsed_json_path, "r", encoding="utf-8") as f:
    parsed_data = json.load(f)

with open(specs_json_path, "r", encoding="utf-8") as f:
    specs_data = json.load(f)

items = []
for item in parsed_data["items"]:
    item_num = str(item["itemNumber"])
    
    # Base fields
    mock_item = {
        "id": f"item-{item_num}",
        "itemNumber": item["itemNumber"],
        "type": item["type"],
        "category": item["category"],
        "description": item["description"],
        "quantity": item.get("quantity", 1),
    }
    
    # Enrichment fields
    if "width" in item:
        mock_item["width"] = item["width"]
    if "height" in item:
        mock_item["height"] = item["height"]
    if "system" in item:
        mock_item["system"] = item["system"]
    if "color" in item:
        mock_item["color"] = item["color"]
    if "weight" in item:
        mock_item["weightKg"] = item["weight"]
    if "schematicUrl" in item:
        # Use JPEG or PNG matching the file extensions we saved
        if item["itemNumber"] in [4, 5, 6, 7, 8, 10, 16, 17]:
            mock_item["schematicUrl"] = f"/order_images/item_{item_num}.jpeg"
        else:
            mock_item["schematicUrl"] = f"/order_images/item_{item_num}.png"
            
    # Include specs if available
    if item_num in specs_data:
        mock_item["specs"] = specs_data[item_num]
    else:
        mock_item["specs"] = []
        
    items.append(mock_item)

# Sort items numerically by itemNumber
items.sort(key=lambda x: x["itemNumber"])

mock_installation_list = {
    "id": "mock-list-369264",
    "orderId": "369264",
    "status": "READY",
    "items": items
}

ts_content = f"""export const PLACEHOLDER_UNVERIFIED_WEIGHT = "PLACEHOLDER_UNVERIFIED";

export const mockInstallationLists = [
  {json.dumps(mock_installation_list, indent=4, ensure_ascii=False)}
];
"""

with open(output_ts_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Rebuilt mockData.ts with {len(items)} items sorted and enriched with specs.")

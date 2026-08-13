import fitz # PyMuPDF
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)

# Detailed mapping of item number to list of pages it spans (1-based page numbers)
item_pages_map = {
    1: [2, 3],
    2: [4, 5],
    3: [6, 7],
    4: [8],
    5: [9],
    6: [10],
    7: [11],
    8: [12, 13],
    9: [14],
    10: [15, 16],
    11: [17],
    12: [17],
    13: [17],
    14: [18],
    15: [18],
    16: [19, 20],
    17: [21, 22],
}

specs = {}

for item_no, pages in item_pages_map.items():
    combined_text = []
    
    # Check if it's an accessory (Non-joinery) or Joinery
    is_accessory = item_no in [9, 11, 12, 13, 14, 15]
    
    if is_accessory:
        # Just extract text near "Item No. X" on its page
        page_idx = pages[0] - 1
        page = doc[page_idx]
        rect = page.rect
        # Search for "Item No. X"
        instances = page.search_for(f"Item No. {item_no}")
        if instances:
            inst = instances[0]
            # Capture from y=inst.y0 to the next 200px or so
            clip_rect = fitz.Rect(20, inst.y0 - 5, rect.width - 20, inst.y0 + 200)
            txt = page.get_text("text", clip=clip_rect)
            combined_text.extend([line.strip() for line in txt.split('\n') if line.strip()])
        else:
            combined_text.append(f"Accessory Item {item_no}")
    else:
        # Joinery items:
        # First page: right side only (x > 290)
        first_page_idx = pages[0] - 1
        page = doc[first_page_idx]
        rect = page.rect
        right_rect = fitz.Rect(290, 110, rect.width, rect.height - 40)
        txt = page.get_text("text", clip=right_rect)
        combined_text.extend([line.strip() for line in txt.split('\n') if line.strip()])
        
        # Second page (if exists): entire page (excluding headers/footers)
        if len(pages) > 1:
            second_page_idx = pages[1] - 1
            page = doc[second_page_idx]
            rect = page.rect
            content_rect = fitz.Rect(20, 110, rect.width - 20, rect.height - 40)
            txt = page.get_text("text", clip=content_rect)
            combined_text.extend([line.strip() for line in txt.split('\n') if line.strip()])
            
    # Clean pricing information
    cleaned_text = []
    i = 0
    while i < len(combined_text):
        line = combined_text[i]
        is_price = False
        # Check if line contains currency keywords or price symbols
        if any(curr in line for curr in ["EUR", "PLN", "USD", "zł", "€", "$"]) or "price" in line.lower():
            is_price = True
            
        if is_price:
            # If the previous line was "Total" or "Price", remove it to prevent orphaned labels
            if cleaned_text and cleaned_text[-1] in ["Total", "Price"]:
                cleaned_text.pop()
            i += 1
            continue
            
        cleaned_text.append(line)
        i += 1

    specs[item_no] = cleaned_text
    print(f"Item {item_no} (Pages {pages}): extracted {len(cleaned_text)} lines (filtered pricing).")

with open("item_specs_v2.json", "w", encoding="utf-8") as f:
    json.dump(specs, f, indent=2, ensure_ascii=False)
    
print("Saved v2 specs to item_specs_v2.json")

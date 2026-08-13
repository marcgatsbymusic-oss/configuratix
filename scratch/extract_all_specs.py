import fitz # PyMuPDF
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)

item_pages = {
    1: 1,    # Item 1 -> Page 2 (0-based index 1)
    2: 3,    # Item 2 -> Page 4 (0-based index 3)
    3: 5,    # Item 3 -> Page 6 (0-based index 5)
    4: 7,    # Item 4 -> Page 8 (0-based index 7)
    5: 8,    # Item 5 -> Page 9 (0-based index 8)
    6: 9,    # Item 6 -> Page 10 (0-based index 9)
    7: 10,   # Item 7 -> Page 11 (0-based index 10)
    8: 11,   # Item 8 -> Page 12 (0-based index 11)
    10: 14,  # Item 10 -> Page 15 (0-based index 14)
    16: 18,  # Item 16 -> Page 19 (0-based index 18)
    17: 20,  # Item 17 -> Page 21 (0-based index 20)
}

specs = {}

for item_no, page_idx in item_pages.items():
    page = doc[page_idx]
    rect = page.rect
    # Right side of page
    right_rect = fitz.Rect(290, 110, rect.width, rect.height - 40)
    text = page.get_text("text", clip=right_rect)
    
    # Let's clean up the text: split into lines, filter out empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    specs[item_no] = lines
    print(f"Item {item_no} has {len(lines)} lines of text.")

with open("item_specs_raw.json", "w", encoding="utf-8") as f:
    json.dump(specs, f, indent=2, ensure_ascii=False)
    
print("Saved raw specs to item_specs_raw.json")

import fitz # PyMuPDF
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)

for idx, page in enumerate(doc):
    text_instances_item = page.search_for("Item No.")
    text_instances_interior = page.search_for("Interior View")
    text_instances_exterior = page.search_for("Exterior View")
    
    if text_instances_item or text_instances_interior or text_instances_exterior:
        print(f"Page {idx+1}:")
        for inst in text_instances_item:
            # get the line text
            rect = inst
            print(f"  Item text: '{page.get_text('text', clip=rect).strip()}' at {rect}")
            # print surrounding text to identify item number
            surr_rect = fitz.Rect(rect.x0, rect.y0, rect.x1 + 100, rect.y1)
            print(f"    Full Item Header: '{page.get_text('text', clip=surr_rect).strip()}'")
            
        for inst in text_instances_interior:
            print(f"  Interior View label at {inst}")
        for inst in text_instances_exterior:
            print(f"  Exterior View label at {inst}")

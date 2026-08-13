import fitz # PyMuPDF
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)

for idx, page in enumerate(doc):
    instances = page.search_for("U-value")
    if instances:
        print(f"Page {idx+1} has {len(instances)} instances of 'U-value'")
        for inst in instances:
            print(f"  at Rect: {inst}")

import fitz # PyMuPDF
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)

page = doc[1] # Page 2
for term in ["U-value", "Infills", "Filling", "Spacer type"]:
    instances = page.search_for(term)
    for inst in instances:
        print(f"Term '{term}' at {inst}")

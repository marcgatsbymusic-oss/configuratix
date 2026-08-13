import fitz # PyMuPDF
import os

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
if not os.path.exists(pdf_path):
    # Try with %20 replaced by spaces
    pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"

print("PDF exists:", os.path.exists(pdf_path))

doc = fitz.open(pdf_path)
print("Page count:", len(doc))
for i in range(min(5, len(doc))):
    page = doc[i]
    print(f"Page {i+1} text sample:")
    print(page.get_text()[:400])
    print("-" * 50)

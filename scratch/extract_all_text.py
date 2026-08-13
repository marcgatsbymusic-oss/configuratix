import fitz # PyMuPDF
import sys

# Ensure UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"

doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

with open("pdf_text.txt", "w", encoding="utf-8") as f:
    for idx, page in enumerate(doc):
        text = page.get_text()
        f.write(f"--- PAGE {idx+1} ---\n")
        f.write(text)
        f.write("\n\n")

print("Wrote text of all pages to pdf_text.txt")

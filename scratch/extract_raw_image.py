import fitz # PyMuPDF
import os

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)
page = doc[1] # Page 2

# Extract image xref 3
pix = fitz.Pixmap(doc, 3)
if pix.alpha:
    pix = fitz.Pixmap(fitz.csRGB, pix)
pix.save("extracted_xref3.png")
print("Saved extracted_xref3.png")

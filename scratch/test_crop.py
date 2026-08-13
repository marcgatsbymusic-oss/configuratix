import fitz # PyMuPDF
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)
page = doc[1] # Page 2

crop_rect = fitz.Rect(13.05, 110, 288.60, 410.70)
print("Text inside crop_rect:")
print(page.get_text("text", clip=crop_rect))

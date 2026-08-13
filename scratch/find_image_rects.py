import fitz # PyMuPDF

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)
page = doc[1] # Page 2

for img_info in page.get_images():
    xref = img_info[0]
    rects = page.get_image_rects(xref)
    print(f"Image xref {xref} has rects:")
    for r in rects:
        print(f"  {r}")

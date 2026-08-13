import fitz # PyMuPDF

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)
page = doc[1] # Page 2

images = page.get_images()
print(f"Number of images on Page 2: {len(images)}")
for img in images:
    print(img)

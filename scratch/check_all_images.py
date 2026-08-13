import fitz # PyMuPDF

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)

item_pages = {
    1: 1,    # Page 2
    2: 3,    # Page 4
    3: 5,    # Page 6
    4: 7,    # Page 8
    5: 8,    # Page 9
    6: 9,    # Page 10
    7: 10,   # Page 11
    8: 11,   # Page 12
    10: 14,  # Page 15
    16: 18,  # Page 19
    17: 20,  # Page 21
}

for item_no, page_idx in item_pages.items():
    page = doc[page_idx]
    images = page.get_images()
    print(f"Item {item_no} (Page {page_idx+1}) images count: {len(images)}")
    for img_info in images:
        xref = img_info[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            if r.x1 <= 300 and r.y0 >= 110 and r.y1 <= 450:
                print(f"  Xref {xref} rect: {r}")

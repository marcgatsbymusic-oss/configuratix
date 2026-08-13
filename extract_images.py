import fitz
import os

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
out_dir = r"apps\backend\public\order_images"

os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)

item_pages = {
    1: 1,  # page 2 in 1-based (index 1)
    2: 3,  # page 4 in 1-based (index 3)
    3: 5,  # page 6
    4: 7,  # page 8
    5: 8,  # page 9
    6: 9,  # page 10
    7: 10, # page 11
    8: 11, # page 12
    10: 14, # page 15
    16: 18, # page 19
    17: 20, # page 21
}

for item_no, page_idx in item_pages.items():
    page = doc.load_page(page_idx)
    image_list = page.get_images(full=True)
    if image_list:
        # Get the largest image on the page
        largest_img = max(image_list, key=lambda img: img[2] * img[3])
        xref = largest_img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        out_path = os.path.join(out_dir, f"item_{item_no}.{image_ext}")
        with open(out_path, "wb") as f:
            f.write(image_bytes)
        print(f"Saved {out_path}")
    else:
        # if no images, maybe we can render the top part of the page?
        rect = fitz.Rect(0, 100, 400, 400) # clip to left side
        pix = page.get_pixmap(clip=rect)
        out_path = os.path.join(out_dir, f"item_{item_no}_rendered.png")
        pix.save(out_path)
        print(f"Rendered {out_path}")

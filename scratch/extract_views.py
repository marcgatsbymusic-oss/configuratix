import fitz  # PyMuPDF
import os

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
output_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\apps\back-office\public\order_images"

os.makedirs(output_dir, exist_ok=True)

# Mapping of page index (0-based) to item number
item_pages = {
    1: 1,    # Page 2 (0-based index 1)
    3: 2,    # Page 4 (0-based index 3)
    5: 3,    # Page 6 (0-based index 5)
    7: 4,    # Page 8 (0-based index 7)
    8: 5,    # Page 9 (0-based index 8)
    9: 6,    # Page 10 (0-based index 9)
    10: 7,   # Page 11 (0-based index 10)
    11: 8,   # Page 12 (0-based index 11)
    14: 10,  # Page 15 (0-based index 14)
    18: 16,  # Page 19 (0-based index 18)
    20: 17,  # Page 21 (0-based index 20)
}

doc = fitz.open(pdf_path)

for page_idx, item_no in item_pages.items():
    page = doc[page_idx]
    rect = page.rect
    print(f"Item {item_no} (Page {page_idx+1}) dimensions: width={rect.width}, height={rect.height}")
    
    # We want only the interior view.
    # Label "Interior View" is at y ≈ 116.
    # Label "Exterior View" is at y ≈ 411.
    # We want only the interior view.
    # The image is at x from 13.05 to 288.60 and y from 127.20 to 410.70.
    # We include the y range from 110 to capture the "Interior View" label at the top-left, 
    # while excluding the dimensions text on the right side.
    crop_rect = fitz.Rect(13.05, 110, 288.60, 410.70)
    
    # Render with 3x scale for crisp images
    zoom = 3
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, clip=crop_rect)
    
    out_filename = f"item_{item_no}.png"
    # Wait, some items are .png, some are .jpeg in mockData.
    # Let's save both or ensure we save it under the correct filename in the mockData.
    # In mockData we had:
    # item-1: /order_images/item_1.png
    # item-2: /order_images/item_2.png
    # item-3: /order_images/item_3.png
    # item-4: /order_images/item_4.jpeg
    # item-5: /order_images/item_5.jpeg
    # item-6: /order_images/item_6.jpeg
    # item-7: /order_images/item_7.jpeg
    # item-8: /order_images/item_8.jpeg
    # item-10: /order_images/item_10.jpeg
    # item-16: /order_images/item_16.jpeg
    # item-17: /order_images/item_17.jpeg
    
    ext = "png"
    if item_no in [4, 5, 6, 7, 8, 10, 16, 17]:
        out_filename = f"item_{item_no}.jpeg"
    else:
        out_filename = f"item_{item_no}.png"
        
    out_path = os.path.join(output_dir, out_filename)
    pix.save(out_path)
    print(f"Saved {out_path}")
    
print("All images extracted successfully.")

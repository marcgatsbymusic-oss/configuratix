import fitz # PyMuPDF

pdf_path = r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\Screenshots\SIGNED_BY_MARC_KELLER_369264- Sant Cugat, Barcelona Spain v10 (1).pdf"
doc = fitz.open(pdf_path)
page = doc[1] # Page 2

# Let's find the bounding box of all drawings/paths on the left side of the page (x < 290)
paths = page.get_drawings()
left_paths = []
for p in paths:
    rect = p["rect"]
    if rect.x1 <= 290 and rect.y0 >= 110 and rect.y1 <= 800:
        left_paths.append(rect)

if left_paths:
    # Union of all rects
    union_rect = left_paths[0]
    for r in left_paths[1:]:
        union_rect = union_rect | r
    print("Union rect of vector paths on left half of page 2:")
    print(union_rect)
else:
    print("No vector paths found on left half of page 2")

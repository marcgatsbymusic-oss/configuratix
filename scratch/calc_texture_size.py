import sys
from PIL import Image

src_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg"
img = Image.open(src_path)

w_px, h_px = img.size
dpi_info = img.info.get('dpi', None)
jfif_density = img.info.get('jfif_density', None)
jfif_unit = img.info.get('jfif_unit', None)  # 1=dpi, 2=dpcm

print(f"Image size: {w_px} x {h_px} px")
print(f"PIL dpi info: {dpi_info}")
print(f"JFIF density: {jfif_density}, unit: {jfif_unit}")
print(f"All info keys: {list(img.info.keys())}")
print(f"Full info: {img.info}")

if dpi_info:
    dpi_x, dpi_y = dpi_info
    w_mm = w_px / dpi_x * 25.4
    h_mm = h_px / dpi_y * 25.4
    print(f"\nPhysical size at {dpi_x} dpi: {w_mm:.1f}mm x {h_mm:.1f}mm")
elif jfif_density and jfif_unit == 1:
    dpi_x, dpi_y = jfif_density
    w_mm = w_px / dpi_x * 25.4
    h_mm = h_px / dpi_y * 25.4
    print(f"\nPhysical size at {dpi_x} dpi (JFIF): {w_mm:.1f}mm x {h_mm:.1f}mm")
elif jfif_density and jfif_unit == 2:
    dpcm_x, dpcm_y = jfif_density
    w_mm = w_px / dpcm_x * 10
    h_mm = h_px / dpcm_y * 10
    print(f"\nPhysical size at {dpcm_x} dpcm: {w_mm:.1f}mm x {h_mm:.1f}mm")

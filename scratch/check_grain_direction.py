import numpy as np
from PIL import Image

def check_grain(path, label):
    img = Image.open(path).convert('L')
    arr = np.array(img).astype(float)
    grad_x = np.abs(arr[:, 1:] - arr[:, :-1])
    grad_y = np.abs(arr[1:, :] - arr[:-1, :])
    mx, my = np.mean(grad_x), np.mean(grad_y)
    print(f"\n{label}")
    print(f"  Size: {img.size}")
    print(f"  Mean horizontal gradient (x): {mx:.4f}")
    print(f"  Mean vertical gradient (y):   {my:.4f}")
    if mx > my:
        print(f"  -> Grain is VERTICAL in image (more variation across rows = grain runs up-down in V direction)")
    else:
        print(f"  -> Grain is HORIZONTAL in image (more variation across columns = grain runs left-right in U direction)")

check_grain(
    r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg",
    "SOURCE (uploaded by user)"
)
check_grain(
    r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\test_wood\diffuse.jpg",
    "SAVED diffuse.jpg (what Three.js loads)"
)

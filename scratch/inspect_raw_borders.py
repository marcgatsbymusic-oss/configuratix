import os
from PIL import Image
import numpy as np

filepath = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\textures_raw\antracyt.jpg"
if os.path.exists(filepath):
    img = Image.open(filepath)
    arr = np.array(img)
    print("Raw antracyt.jpg stats:")
    print("  Size:", img.size)
    if len(arr.shape) == 3:
        print("  Top border avg:", arr[0, :, :].mean(axis=0))
        print("  Bottom border avg:", arr[-1, :, :].mean(axis=0))
        print("  Left border avg:", arr[:, 0, :].mean(axis=0))
        print("  Right border avg:", arr[:, -1, :].mean(axis=0))
        print("  Overall mean:", arr.mean(axis=(0, 1)))
    else:
        print("  Top border avg:", arr[0, :].mean())
        print("  Bottom border avg:", arr[-1, :].mean())
        print("  Left border avg:", arr[:, 0].mean())
        print("  Right border avg:", arr[:, -1].mean())
        print("  Overall mean:", arr.mean())
else:
    print("Not found")

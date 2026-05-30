import os
from PIL import Image
import numpy as np

# Path to public/assets/texturesbaked/antracyt
tex_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\antracyt"

for filename in ["diffuse.jpg", "normal.jpg", "orm.png"]:
    filepath = os.path.join(tex_dir, filename)
    if os.path.exists(filepath):
        img = Image.open(filepath)
        w, h = img.size
        print(f"File: {filename}, size: {w}x{h}")
        # Check if the image edges have a border (e.g. constant value, or distinct gradient)
        arr = np.array(img)
        # print average values of top, bottom, left, right borders
        if len(arr.shape) == 3:
            top = arr[0, :, :].mean(axis=0)
            bottom = arr[-1, :, :].mean(axis=0)
            left = arr[:, 0, :].mean(axis=0)
            right = arr[:, -1, :].mean(axis=0)
        else:
            top = arr[0, :].mean()
            bottom = arr[-1, :].mean()
            left = arr[:, 0].mean()
            right = arr[:, -1].mean()
        print(f"  Top border avg: {top}")
        print(f"  Bottom border avg: {bottom}")
        print(f"  Left border avg: {left}")
        print(f"  Right border avg: {right}")
    else:
        print(f"File not found: {filepath}")

import os
from PIL import Image
import numpy as np

filepath = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\antracyt\normal.jpg"
if os.path.exists(filepath):
    img = Image.open(filepath)
    arr = np.array(img)
    print("Normal.jpg stats:")
    print("  Min:", arr.min(axis=(0, 1)))
    print("  Max:", arr.max(axis=(0, 1)))
    print("  Mean:", arr.mean(axis=(0, 1)))
else:
    print("Not found")

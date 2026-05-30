import os
from PIL import Image
import numpy as np

filepath = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\antracyt\normal.jpg"
if os.path.exists(filepath):
    img = Image.open(filepath)
    arr = np.array(img)
    print("Normal.jpg top-left 10x10 pixels:")
    print("Red (Sobel X):")
    print(arr[:10, :10, 0])
    print("Green (Sobel Y):")
    print(arr[:10, :10, 1])
    print("Blue:")
    print(arr[:10, :10, 2])
else:
    print("Not found")

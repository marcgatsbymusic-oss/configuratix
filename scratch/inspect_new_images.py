import os
from PIL import Image

img1_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg"
img2_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802294611.jpg"

for name, path in [("img1 (media__1779802284148.jpg)", img1_path), ("img2 (media__1779802294611.jpg)", img2_path)]:
    if os.path.exists(path):
        img = Image.open(path)
        print(f"{name}: {img.format}, {img.size}, {img.mode}")
    else:
        print(f"{name} does not exist at {path}")

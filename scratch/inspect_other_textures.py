import os
import numpy as np
from PIL import Image

def analyze_grain(img_path):
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
    img = Image.open(img_path).convert('L')
    arr = np.array(img).astype(float)
    
    # Compute gradients along x (horizontal) and y (vertical)
    grad_x = np.abs(arr[:, 1:] - arr[:, :-1])
    grad_y = np.abs(arr[1:, :] - arr[:-1, :])
    
    mean_grad_x = np.mean(grad_x)
    mean_grad_y = np.mean(grad_y)
    
    print(f"\nAnalyzing: {img_path}")
    print(f"Dimensions: {img.size}")
    print(f"Mean horizontal gradient (across columns): {mean_grad_x:.4f}")
    print(f"Mean vertical gradient (across rows): {mean_grad_y:.4f}")
    
    if mean_grad_x > mean_grad_y:
        print("-> Grain is likely VERTICAL (variation is higher horizontally)")
    else:
        print("-> Grain is likely HORIZONTAL (variation is higher vertically)")

def main():
    src_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg"
    analyze_grain(src_path)

if __name__ == "__main__":
    main()

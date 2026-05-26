import os
import numpy as np
from PIL import Image

def seamless_blend(img_arr, blend_width=64):
    h, w, c = img_arr.shape
    base = img_arr.copy().astype(float)
    
    # Roll the image by 50% in both directions to put seams in the center
    rolled = np.roll(np.roll(base, h // 2, axis=0), w // 2, axis=1)
    
    result = rolled.copy()
    
    # Blend vertical seam at x = w // 2
    cx = w // 2
    for x in range(cx - blend_width, cx + blend_width):
        d = abs(x - cx) / blend_width
        # Cosine blend factor (1 at center, 0 at boundaries of blend zone)
        f = 0.5 + 0.5 * np.cos(np.pi * d)
        result[:, x, :] = base[:, x, :] * f + rolled[:, x, :] * (1 - f)
        
    # Blend horizontal seam at y = h // 2
    cy = h // 2
    for y in range(cy - blend_width, cy + blend_width):
        d = abs(y - cy) / blend_width
        f = 0.5 + 0.5 * np.cos(np.pi * d)
        result[y, :, :] = base[y, :, :] * f + result[y, :, :] * (1 - f)
        
    return np.clip(result, 0, 255).astype(np.uint8)

def main():
    src_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg"
    out_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\test_wood"
    swatch_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\windowcolors\textures"
    
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(swatch_dir, exist_ok=True)
    
    print(f"Loading image from: {src_path}")
    img = Image.open(src_path)
    
    # Crop to square (724x724) centered vertically
    w, h = img.size
    crop_size = min(w, h)
    left = (w - crop_size) // 2
    top = (h - crop_size) // 2
    right = left + crop_size
    bottom = top + crop_size
    img_cropped = img.crop((left, top, right, bottom))
    
    # Rotate by 0 degrees (keep original vertical grain direction, turned 90 degrees from previous version)
    img_cropped = img_cropped.rotate(0)
    
    # Resize to 1024x1024 for standard texture sizing
    img_resized = img_cropped.resize((1024, 1024), Image.Resampling.LANCZOS)
    arr = np.array(img_resized)
    
    # 1. Generate Seamless Diffuse (Albedo)
    print("Generating seamless diffuse map...")
    diffuse_arr = seamless_blend(arr, blend_width=64)
    diffuse_img = Image.fromarray(diffuse_arr)
    diffuse_img.save(os.path.join(out_dir, "diffuse.jpg"), "JPEG", quality=95)
    
    # Also save as the swatch image
    diffuse_img.save(os.path.join(swatch_dir, "test_wood.jpg"), "JPEG", quality=90)
    print("Diffuse map saved.")
    
    # 2. Generate Seamless Normal Map
    print("Generating seamless normal map...")
    # Convert diffuse to grayscale for height map
    gray = (0.299 * diffuse_arr[:,:,0] + 0.587 * diffuse_arr[:,:,1] + 0.114 * diffuse_arr[:,:,2])
    
    # Pad wrapped borders to ensure normal map is seamless
    padded = np.pad(gray, 1, mode='wrap')
    
    # Compute Sobel gradients
    # Gx = [ -1 0 1 ]      Gy = [ -1 -2 -1 ]
    #      [ -2 0 2 ]           [  0  0  0 ]
    #      [ -1 0 1 ]           [  1  2  1 ]
    h_pad, w_pad = padded.shape
    gx = np.zeros_like(gray)
    gy = np.zeros_like(gray)
    
    for y in range(1, h_pad - 1):
        for x in range(1, w_pad - 1):
            gx[y-1, x-1] = (
                -padded[y-1, x-1] + padded[y-1, x+1]
                - 2 * padded[y, x-1] + 2 * padded[y, x+1]
                - padded[y+1, x-1] + padded[y+1, x+1]
            )
            gy[y-1, x-1] = (
                -padded[y-1, x-1] - 2 * padded[y-1, x] - padded[y-1, x+1]
                + padded[y+1, x-1] + 2 * padded[y+1, x] + padded[y+1, x+1]
            )
            
    # Normalize gradients and generate normal map
    # Scale bump strength
    bump_strength = 3.0
    dx = -gx * bump_strength / 255.0
    dy = -gy * bump_strength / 255.0 # standard WebGL / ThreeJS Y-up normal mapping
    dz = np.ones_like(gray)
    
    norm = np.sqrt(dx**2 + dy**2 + dz**2)
    nx = dx / norm
    ny = dy / norm
    nz = dz / norm
    
    # Map from [-1, 1] to [0, 255]
    normal_arr = np.zeros((1024, 1024, 3), dtype=np.uint8)
    normal_arr[:,:,0] = ((nx * 0.5 + 0.5) * 255).astype(np.uint8)
    normal_arr[:,:,1] = ((ny * 0.5 + 0.5) * 255).astype(np.uint8)
    normal_arr[:,:,2] = ((nz * 0.5 + 0.5) * 255).astype(np.uint8)
    
    normal_img = Image.fromarray(normal_arr)
    normal_img.save(os.path.join(out_dir, "normal.jpg"), "JPEG", quality=95)
    print("Normal map saved.")
    
    # 3. Generate Seamless ORM Map (Occlusion, Roughness, Metallic)
    print("Generating seamless ORM map...")
    orm_arr = np.zeros((1024, 1024, 3), dtype=np.uint8)
    
    # Red: Ambient Occlusion
    # Dark grain gets slightly more occlusion (0.75), flat wood gets 1.0
    orm_arr[:,:,0] = (192 + 63 * (gray / 255.0)).astype(np.uint8)
    
    # Green: Roughness
    # Polished flat areas should be smoother (roughness ~0.45)
    # Darker grain lines/pores should be rougher (roughness ~0.7)
    orm_arr[:,:,1] = (178 - 63 * (gray / 255.0)).astype(np.uint8)
    
    # Blue: Metallic
    # Wood is non-metallic (value = 0)
    orm_arr[:,:,2] = 0
    
    orm_img = Image.fromarray(orm_arr)
    orm_img.save(os.path.join(out_dir, "orm.png"), "PNG")
    print("ORM map saved.")
    print("Texture preparation complete!")

if __name__ == "__main__":
    main()

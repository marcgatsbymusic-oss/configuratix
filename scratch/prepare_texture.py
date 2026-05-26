import os
import numpy as np
from PIL import Image, ImageFilter

def make_seamless_offset_blend(img_arr, blend_width=80):
    """
    Uses the 'offset & blend' technique:
    - Rolls the image 50% in both axes to expose seams at center
    - Blends seamlessly using a smooth cosine weight in both axes
    - Blends BACK with the original so the center of the original is preserved
    - This technique keeps the original pixel detail intact in most of the image
    """
    h, w = img_arr.shape[:2]
    is_rgb = len(img_arr.shape) == 3
    
    base = img_arr.astype(float)
    rolled = np.roll(np.roll(base, h // 2, axis=0), w // 2, axis=1)
    
    # Build a 2D blend mask: 1 = use original, 0 = use rolled (at center lines)
    cx, cy = w // 2, h // 2
    
    # Horizontal weight for the vertical seam
    weight_x = np.ones(w)
    for x in range(cx - blend_width, cx + blend_width):
        if 0 <= x < w:
            d = abs(x - cx) / blend_width
            weight_x[x] = (1.0 + np.cos(np.pi * d)) / 2.0  # 1 at boundary, 0 at center
    
    # Vertical weight for the horizontal seam
    weight_y = np.ones(h)
    for y in range(cy - blend_width, cy + blend_width):
        if 0 <= y < h:
            d = abs(y - cy) / blend_width
            weight_y[y] = (1.0 + np.cos(np.pi * d)) / 2.0  # 1 at boundary, 0 at center
    
    # Combine: weight = min(wx, wy) keeps original when BOTH axes are far from center
    wx = weight_x[np.newaxis, :] if not is_rgb else weight_x[np.newaxis, :, np.newaxis]
    wy = weight_y[:, np.newaxis] if not is_rgb else weight_y[:, np.newaxis, np.newaxis]
    
    # Where weight = 1 -> keep original, where weight = 0 -> use rolled
    w_final = np.minimum(wx, wy)  # 0 at center cross, 1 everywhere else
    
    result = base * w_final + rolled * (1.0 - w_final)
    return np.clip(result, 0, 255).astype(np.uint8)


def compute_normal_map(gray_arr, bump_strength=1.2):
    """
    Computes a seamless normal map from a grayscale height map.
    Uses numpy vectorized Sobel (fast) with wrapped border padding.
    bump_strength: lower = more subtle bumps (0.5-2.0 range, 1.2 is natural wood).
    """
    h, w = gray_arr.shape
    
    # Pad with wrap mode for seamless normals at edges
    pad = 2
    padded = np.pad(gray_arr.astype(float), pad, mode='wrap')
    
    # Vectorized Sobel
    gx = (
        -padded[pad-1:h+pad-1, pad-1:w+pad-1]  # top-left
        + padded[pad-1:h+pad-1, pad+1:w+pad+1]  # top-right
        - 2 * padded[pad:h+pad, pad-1:w+pad-1]   # mid-left
        + 2 * padded[pad:h+pad, pad+1:w+pad+1]   # mid-right
        - padded[pad+1:h+pad+1, pad-1:w+pad-1]  # bot-left
        + padded[pad+1:h+pad+1, pad+1:w+pad+1]  # bot-right
    )
    gy = (
        -padded[pad-1:h+pad-1, pad-1:w+pad-1]  # top-left
        - 2 * padded[pad-1:h+pad-1, pad:w+pad]   # top-mid
        - padded[pad-1:h+pad-1, pad+1:w+pad+1]  # top-right
        + padded[pad+1:h+pad+1, pad-1:w+pad-1]  # bot-left
        + 2 * padded[pad+1:h+pad+1, pad:w+pad]   # bot-mid
        + padded[pad+1:h+pad+1, pad+1:w+pad+1]  # bot-right
    )
    
    dx = -gx * bump_strength / 255.0
    dy = -gy * bump_strength / 255.0
    dz = np.ones_like(gray_arr, dtype=float)
    
    # Normalize to unit vector
    norm = np.sqrt(dx**2 + dy**2 + dz**2)
    nx = (dx / norm * 0.5 + 0.5) * 255
    ny = (dy / norm * 0.5 + 0.5) * 255
    nz = (dz / norm * 0.5 + 0.5) * 255
    
    result = np.stack([nx, ny, nz], axis=-1)
    return np.clip(result, 0, 255).astype(np.uint8)


def main():
    src_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg"
    out_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\test_wood"
    swatch_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\windowcolors\textures"
    
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(swatch_dir, exist_ok=True)
    
    print(f"Loading image from: {src_path}")
    img = Image.open(src_path).convert('RGB')
    
    # Source image is 724x1024 (portrait, vertical grain)
    # We want 1024x1024 — crop center square
    w, h = img.size
    crop_size = min(w, h)
    left = (w - crop_size) // 2
    top = (h - crop_size) // 2
    img_cropped = img.crop((left, top, left + crop_size, top + crop_size))
    
    # Scale up to 2048 for maximum quality, then apply seamless blending
    # Use 2048 internally, then save at 1024
    img_2048 = img_cropped.resize((2048, 2048), Image.Resampling.LANCZOS)
    arr_2048 = np.array(img_2048)
    
    # 1. Generate Seamless Diffuse (Albedo) — preserve original quality
    print("Generating seamless diffuse map...")
    # Use wider blend zone on 2048 for more gradual, invisible transitions
    diffuse_arr_2048 = make_seamless_offset_blend(arr_2048, blend_width=120)
    
    # Downscale to 1024 — this further hides any remaining seam artifacts
    diffuse_img = Image.fromarray(diffuse_arr_2048).resize((1024, 1024), Image.Resampling.LANCZOS)
    diffuse_arr = np.array(diffuse_img)
    
    # Save at high quality to preserve original color fidelity
    diffuse_img.save(os.path.join(out_dir, "diffuse.jpg"), "JPEG", quality=97)
    
    # Swatch: center crop of original, unblended — pure original quality
    swatch = img_cropped.resize((400, 400), Image.Resampling.LANCZOS)
    swatch.save(os.path.join(swatch_dir, "test_wood.jpg"), "JPEG", quality=95)
    print("Diffuse and swatch saved.")
    
    # 2. Generate Normal Map from the seamless diffuse
    print("Generating normal map...")
    
    # Convert to grayscale for height map
    gray = np.array(diffuse_img.convert('L')).astype(float)
    
    # Slight blur to reduce high-frequency noise before normal computation
    gray_pil = Image.fromarray(gray.astype(np.uint8))
    gray_smooth = np.array(gray_pil.filter(ImageFilter.GaussianBlur(radius=1.0))).astype(float)
    
    # Natural wood bump strength (subtle but visible)
    normal_arr = compute_normal_map(gray_smooth, bump_strength=2.0)
    normal_img = Image.fromarray(normal_arr)
    normal_img.save(os.path.join(out_dir, "normal.jpg"), "JPEG", quality=97)
    print("Normal map saved.")
    
    # 3. Generate Roughness map (single channel, green channel = roughness for Three.js)
    # Wood has naturally high roughness (lacquered: 0.4-0.5, unfinished: 0.7-0.9)
    # The wood in the image looks lightly finished — use 0.5-0.65 range
    # Dark grain lines (pores) = more rough; light wood = slightly smoother
    print("Generating ORM map...")
    
    # Roughness: light areas are slightly smoother, dark grain is rougher
    # Map luminance 0->255 to roughness 0.65->0.45 (inverted: dark=rough, light=smooth)
    roughness = 165 - 51 * (gray / 255.0)  # range: 114-165 = 0.45-0.65 roughness
    
    # ORM: Red=AO(1.0), Green=Roughness, Blue=Metalness(0)
    orm_arr = np.zeros((1024, 1024, 3), dtype=np.uint8)
    orm_arr[:,:,0] = 255  # AO = fully lit (no pre-baked occlusion)
    orm_arr[:,:,1] = np.clip(roughness, 0, 255).astype(np.uint8)  # Roughness
    orm_arr[:,:,2] = 0    # Metalness = 0 (wood is non-metallic)
    
    orm_img = Image.fromarray(orm_arr)
    orm_img.save(os.path.join(out_dir, "orm.png"), "PNG")
    print("ORM map saved.")
    print("Texture preparation complete!")

if __name__ == "__main__":
    main()

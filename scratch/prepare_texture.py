import os
import numpy as np
from PIL import Image, ImageFilter

def make_seamless_offset_blend(img_arr, blend_width=60):
    """
    Offset-blend seamless technique. Blends only at the seam edges, 
    preserving maximum quality in the interior.
    """
    h, w = img_arr.shape[:2]
    is_rgb = len(img_arr.shape) == 3

    base = img_arr.astype(float)
    rolled = np.roll(np.roll(base, h // 2, axis=0), w // 2, axis=1)

    cx, cy = w // 2, h // 2

    weight_x = np.ones(w)
    for x in range(cx - blend_width, cx + blend_width):
        if 0 <= x < w:
            d = abs(x - cx) / blend_width
            weight_x[x] = (1.0 + np.cos(np.pi * d)) / 2.0

    weight_y = np.ones(h)
    for y in range(cy - blend_width, cy + blend_width):
        if 0 <= y < h:
            d = abs(y - cy) / blend_width
            weight_y[y] = (1.0 + np.cos(np.pi * d)) / 2.0

    wx = weight_x[np.newaxis, :] if not is_rgb else weight_x[np.newaxis, :, np.newaxis]
    wy = weight_y[:, np.newaxis] if not is_rgb else weight_y[:, np.newaxis, np.newaxis]

    w_final = np.minimum(wx, wy)
    result = base * w_final + rolled * (1.0 - w_final)
    return np.clip(result, 0, 255).astype(np.uint8)


def compute_normal_map(gray_arr, bump_strength=1.2):
    h, w = gray_arr.shape
    pad = 2
    padded = np.pad(gray_arr.astype(float), pad, mode='wrap')

    gx = (
        -padded[pad-1:h+pad-1, pad-1:w+pad-1]
        + padded[pad-1:h+pad-1, pad+1:w+pad+1]
        - 2 * padded[pad:h+pad, pad-1:w+pad-1]
        + 2 * padded[pad:h+pad, pad+1:w+pad+1]
        - padded[pad+1:h+pad+1, pad-1:w+pad-1]
        + padded[pad+1:h+pad+1, pad+1:w+pad+1]
    )
    gy = (
        -padded[pad-1:h+pad-1, pad-1:w+pad-1]
        - 2 * padded[pad-1:h+pad-1, pad:w+pad]
        - padded[pad-1:h+pad-1, pad+1:w+pad+1]
        + padded[pad+1:h+pad+1, pad-1:w+pad-1]
        + 2 * padded[pad+1:h+pad+1, pad:w+pad]
        + padded[pad+1:h+pad+1, pad+1:w+pad+1]
    )

    dx = -gx * bump_strength / 255.0
    dy = -gy * bump_strength / 255.0
    dz = np.ones_like(gray_arr, dtype=float)

    norm = np.sqrt(dx**2 + dy**2 + dz**2)
    nx = (dx / norm * 0.5 + 0.5) * 255
    ny = (dy / norm * 0.5 + 0.5) * 255
    nz = (dz / norm * 0.5 + 0.5) * 255

    return np.clip(np.stack([nx, ny, nz], axis=-1), 0, 255).astype(np.uint8)


def main():
    src_path = r"C:\Users\Shadow\.gemini\antigravity\brain\6174c2d0-d1f4-4f37-baa6-3eb8c8630d08\media__1779802284148.jpg"
    out_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\texturesbaked\test_wood"
    swatch_dir = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\public\assets\windowcolors\textures"

    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(swatch_dir, exist_ok=True)

    print(f"Loading: {src_path}")
    img = Image.open(src_path).convert('RGB')
    w_src, h_src = img.size
    print(f"Source: {w_src}x{h_src}px, grain is VERTICAL in source (portrait)")

    # -----------------------------------------------------------------------
    # STRATEGY: The UV mapping in Three.js has:
    #   U (texture horizontal) = cross-section face (V of the world geometry)
    #   V (texture vertical)   = profile length direction (U of the world geometry)
    # Wait — actually Three.js texture U maps to geometry UV u, and texture V maps to geometry UV v.
    # Our geometry UVs: u = pz (along profile length), v = cross-section diagonal.
    # So: texture horizontal (image X) → profile length; texture vertical (image Y) → cross-section.
    #
    # Source image grain is VERTICAL (image Y direction).
    # We need grain along profile LENGTH = image X direction (texture U).
    # So we must rotate -90° (clockwise): vertical grain → horizontal grain.
    #
    # BUT: all the previous rotations confused things because of the square crop.
    # NEW APPROACH:
    #   - Do NOT square-crop first.
    #   - Rotate the full portrait -90° CW: 724x1024 → 1024x724 landscape.
    #     After rotation, the original vertical grain now runs HORIZONTALLY (image X = texture U).
    #   - Resize to 1024x1024.
    #   - Process for seamless tiling and PBR maps.
    # -----------------------------------------------------------------------

    # Rotate full portrait -90° (clockwise) WITHOUT pre-cropping
    img_rotated = img.rotate(-90, expand=True)  # 1024w x 724h landscape
    print(f"After rotation: {img_rotated.size}")

    # Resize to 1024x1024 at HIGH quality
    img_1024 = img_rotated.resize((1024, 1024), Image.Resampling.LANCZOS)
    arr_1024 = np.array(img_1024)

    # Seamless blend at native 1024 with moderate blend zone
    print("Generating seamless diffuse...")
    diffuse_arr = make_seamless_offset_blend(arr_1024, blend_width=60)
    diffuse_img = Image.fromarray(diffuse_arr)
    diffuse_img.save(os.path.join(out_dir, "diffuse.jpg"), "JPEG", quality=97)

    # Swatch: center square crop of the rotated (unblended) image
    rw, rh = img_rotated.size
    cs = min(rw, rh)
    sx = (rw - cs) // 2
    sy = (rh - cs) // 2
    swatch = img_rotated.crop((sx, sy, sx + cs, sy + cs)).resize((400, 400), Image.Resampling.LANCZOS)
    swatch.save(os.path.join(swatch_dir, "test_wood.jpg"), "JPEG", quality=95)
    print("Diffuse and swatch saved.")

    # Normal map
    print("Generating normal map...")
    gray = np.array(diffuse_img.convert('L')).astype(float)
    gray_smooth = np.array(
        Image.fromarray(gray.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=0.8))
    ).astype(float)
    normal_arr = compute_normal_map(gray_smooth, bump_strength=1.5)
    Image.fromarray(normal_arr).save(os.path.join(out_dir, "normal.jpg"), "JPEG", quality=97)
    print("Normal map saved.")

    # ORM map
    print("Generating ORM map...")
    orm_arr = np.zeros((1024, 1024, 3), dtype=np.uint8)
    orm_arr[:, :, 0] = 255  # AO = fully lit
    roughness = 165 - 51 * (gray / 255.0)  # 0.45-0.65 range
    orm_arr[:, :, 1] = np.clip(roughness, 0, 255).astype(np.uint8)
    orm_arr[:, :, 2] = 0    # Non-metallic
    Image.fromarray(orm_arr).save(os.path.join(out_dir, "orm.png"), "PNG")
    print("ORM map saved.")

    # Verify final grain direction
    final = np.array(Image.open(os.path.join(out_dir, "diffuse.jpg")).convert('L')).astype(float)
    gx_final = np.mean(np.abs(final[:, 1:] - final[:, :-1]))
    gy_final = np.mean(np.abs(final[1:, :] - final[:-1, :]))
    print(f"\nFinal diffuse grain check: grad_x={gx_final:.3f}, grad_y={gy_final:.3f}")
    if gx_final < gy_final:
        print("✓ Grain is HORIZONTAL in texture (along U = along profile length) — CORRECT")
    else:
        print("✗ Grain is VERTICAL in texture — needs further rotation")

    print("\nDone!")


if __name__ == "__main__":
    main()

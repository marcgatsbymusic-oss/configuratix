#!/usr/bin/env python3
import os
import sys
import shutil
import re

try:
    from PIL import Image, ImageFilter
except ImportError:
    print("Error: The 'Pillow' library is required for texture packing.")
    print("Please install it using: pip install Pillow")
    sys.exit(1)

try:
    import numpy as np
except ImportError:
    print("Error: The 'numpy' library is required for procedural PBR map generation.")
    print("Please install it using: pip install numpy")
    sys.exit(1)

# Default paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DEFAULT_SRC_DIR = os.path.join(WORKSPACE_ROOT, "textures_raw")
DEFAULT_DEST_DIR = os.path.join(WORKSPACE_ROOT, "public", "assets", "texturesbaked")

# Keyword maps for auto-detecting texture files (case-insensitive)
PATTERNS = {
    "diffuse": re.compile(r"(diffuse|albedo|basecolor|color|col|base_color)$", re.IGNORECASE),
    "normal": re.compile(r"(normal|nor|nrm|bump|height)$", re.IGNORECASE),
    "ao": re.compile(r"(ao|occlusion|ambientocclusion|ambient_occlusion)$", re.IGNORECASE),
    "roughness": re.compile(r"(roughness|rough|rgh)$", re.IGNORECASE),
    "metalness": re.compile(r"(metalness|metallic|metal|met)$", re.IGNORECASE)
}

WOOD_KEYWORDS = ['dab', 'daglezja', 'orzech', 'polisander', 'macore', 'machoa', 'winchester', 'turner', 'wood', 'oak']

def clean_name(filename):
    name_without_ext = os.path.splitext(filename)[0]
    return name_without_ext

def identify_texture_type(filename):
    name = clean_name(filename)
    for tex_type, pattern in PATTERNS.items():
        if pattern.search(name) or any(part.lower() == tex_type for part in re.split(r'[-_\s]', name)):
            return tex_type
    return None

def is_wood_material(name):
    name_lower = name.lower()
    return any(kw in name_lower for kw in WOOD_KEYWORDS)

def convolve2d_wrap(img_arr, kernel, scale=1.0, offset=0.0):
    padded = np.pad(img_arr, 1, mode='wrap')
    output = (
        padded[:-2, :-2] * kernel[0, 0] + padded[:-2, 1:-1] * kernel[0, 1] + padded[:-2, 2:] * kernel[0, 2] +
        padded[1:-1, :-2] * kernel[1, 0] + padded[1:-1, 1:-1] * kernel[1, 1] + padded[1:-1, 2:] * kernel[1, 2] +
        padded[2:, :-2] * kernel[2, 0] + padded[2:, 1:-1] * kernel[2, 1] + padded[2:, 2:] * kernel[2, 2]
    )
    output = output / scale + offset
    return np.clip(output, 0, 255).astype(np.uint8)

def process_flat_image(filename, src_dir, dest_dir):
    name = clean_name(filename)
    print(f"\nProcessing flat image material: {name}...")
    
    src_path = os.path.join(src_dir, filename)
    mat_dest_path = os.path.join(dest_dir, name)
    os.makedirs(mat_dest_path, exist_ok=True)
    
    with Image.open(src_path) as img:
        width, height = img.size
        # Cap size to 1024x1024 to optimize load times and memory footprint
        max_size = 1024
        if width > max_size or height > max_size:
            ratio = min(max_size / width, max_size / height)
            width = int(width * ratio)
            height = int(height * ratio)
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            
        # 1. Save Diffuse (sRGB color space)
        img.convert("RGB").save(os.path.join(mat_dest_path, "diffuse.jpg"), "JPEG", quality=90)
        
        # Convert to grayscale for height map / gradient calculation
        gray = img.convert("L")
        
        # 2. Generate Procedural Normal Map (Sobel filter with wrap padding)
        is_wood = is_wood_material(name)
        # Low scale = stronger normal map effect
        scale_val = 2 if is_wood else 5
        
        gray_arr = np.array(gray, dtype=np.float32)
        sobel_x_kernel = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
        sobel_y_kernel = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
        
        sx = convolve2d_wrap(gray_arr, sobel_x_kernel, scale=scale_val, offset=128.0)
        sy = convolve2d_wrap(gray_arr, sobel_y_kernel, scale=scale_val, offset=128.0)
        
        sobel_x = Image.fromarray(sx)
        sobel_y = Image.fromarray(sy)
        
        # Normal Blue channel is solid 255 (facing vector Z = 1)
        blue_chan = Image.new("L", (width, height), 255)
        normal_img = Image.merge("RGB", (sobel_x, sobel_y, blue_chan))
        normal_img.save(os.path.join(mat_dest_path, "normal.jpg"), "JPEG", quality=95)
        
        # 3. Generate ORM Map using numpy for accurate channel ranges
        gray_arr = np.array(gray, dtype=np.float32)
        
        # R: AO (Ambient Occlusion)
        # Recesses (darker pixels in albedo) get subtle occlusion shadow
        ao_arr = 255.0 - (255.0 - gray_arr) * 0.15
        ao_arr = np.clip(ao_arr, 0, 255).astype(np.uint8)
        
        # G: Roughness
        # Wood grain (darker lines) is rougher, solid foils have uniform satin roughness
        if is_wood:
            # Wood grain: range [130, 210]
            rough_arr = 130.0 + (255.0 - gray_arr) * 0.3
        else:
            # Solid satin: uniform 150 roughness + very minor grain noise
            noise = np.random.normal(0, 3, gray_arr.shape)
            rough_arr = np.full(gray_arr.shape, 150.0) + noise
            
        rough_arr = np.clip(rough_arr, 0, 255).astype(np.uint8)
        
        # B: Metalness
        name_lower = name.lower()
        if any(kw in name_lower for kw in ['piryt', 'platynium', 'bronze', 'metal', 'gold', 'srebrny', 'silver']):
            # Metallic effects get some reflection (value of 140)
            metal_arr = np.full(gray_arr.shape, 140, dtype=np.uint8)
        else:
            # Non-metallic PVC / Wood
            metal_arr = np.zeros(gray_arr.shape, dtype=np.uint8)
            
        ao_img = Image.fromarray(ao_arr)
        rough_img = Image.fromarray(rough_arr)
        metal_img = Image.fromarray(metal_arr)
        
        orm_img = Image.merge("RGB", (ao_img, rough_img, metal_img))
        orm_img.save(os.path.join(mat_dest_path, "orm.png"), "PNG")
        
    print(f"  Successfully procedurally generated and saved to: {mat_dest_path}")

def process_material_folder(mat_name, mat_src_path, dest_dir):
    print(f"\nProcessing material folder: {mat_name}...")
    
    files = os.listdir(mat_src_path)
    matched_files = {}
    
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.tga', '.tiff', '.webp')):
            tex_type = identify_texture_type(f)
            if tex_type:
                matched_files[tex_type] = os.path.join(mat_src_path, f)

    if not matched_files:
        print(f"  No matching textures found in {mat_src_path}")
        return

    print("  Detected files:")
    for k, v in matched_files.items():
        print(f"    - {k}: {os.path.basename(v)}")

    mat_dest_path = os.path.join(dest_dir, mat_name)
    os.makedirs(mat_dest_path, exist_ok=True)

    # Base Color
    if "diffuse" in matched_files:
        print("  Processing Diffuse (sRGB)...")
        with Image.open(matched_files["diffuse"]) as img:
            img.convert("RGB").save(os.path.join(mat_dest_path, "diffuse.jpg"), "JPEG", quality=90)
    else:
        print("  [Warning] No Diffuse/Color map detected!")

    # Normal Map
    if "normal" in matched_files:
        print("  Processing Normal Map (Linear)...")
        with Image.open(matched_files["normal"]) as img:
            img.convert("RGB").save(os.path.join(mat_dest_path, "normal.jpg"), "JPEG", quality=95)
    else:
        print("  [Warning] No Normal map detected!")

    # Pack ORM
    print("  Packing ORM Map (R = AO, G = Roughness, B = Metalness)...")
    ao_path = matched_files.get("ao")
    rough_path = matched_files.get("roughness")
    metal_path = matched_files.get("metalness")

    images_to_close = []
    width, height = 1024, 1024
    for path in [ao_path, rough_path, metal_path]:
        if path:
            with Image.open(path) as img:
                width, height = img.size
                break

    if ao_path:
        ao_img = Image.open(ao_path).convert("L")
        images_to_close.append(ao_img)
    else:
        ao_img = Image.new("L", (width, height), 255)

    if rough_path:
        rough_img = Image.open(rough_path).convert("L")
        images_to_close.append(rough_img)
    else:
        rough_img = Image.new("L", (width, height), 204)

    if metal_path:
        metal_img = Image.open(metal_path).convert("L")
        images_to_close.append(metal_img)
    else:
        metal_img = Image.new("L", (width, height), 0)

    if ao_img.size != (width, height):
        ao_img = ao_img.resize((width, height), Image.Resampling.LANCZOS)
    if rough_img.size != (width, height):
        rough_img = rough_img.resize((width, height), Image.Resampling.LANCZOS)
    if metal_img.size != (width, height):
        metal_img = metal_img.resize((width, height), Image.Resampling.LANCZOS)

    orm_img = Image.merge("RGB", (ao_img, rough_img, metal_img))
    orm_img.save(os.path.join(mat_dest_path, "orm.png"), "PNG")
    
    for img in images_to_close:
        img.close()

    print(f"  Successfully saved to: {mat_dest_path}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Pack textures into Three.js ORM + PBR format.")
    parser.add_argument("--src", default=DEFAULT_SRC_DIR, help="Source directory containing raw textures.")
    parser.add_argument("--dest", default=DEFAULT_DEST_DIR, help="Destination directory for baked outputs.")
    args = parser.parse_args()

    if not os.path.exists(args.src):
        os.makedirs(args.src, exist_ok=True)
        print(f"Created empty source directory: {args.src}")
        return

    os.makedirs(args.dest, exist_ok=True)
    
    # 1. Look for subfolders (PBR sets)
    subdirs = [d for d in os.listdir(args.src) if os.path.isdir(os.path.join(args.src, d))]
    
    # 2. Look for flat files in root directory
    image_files = [f for f in os.listdir(args.src) if os.path.isfile(os.path.join(args.src, f)) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    if not subdirs and not image_files:
        print(f"No directories or image files found in: {args.src}")
        print("Please place your texture files or folders in the textures_raw/ directory and run again.")
        return

    # Process subfolders
    for subdir in subdirs:
        process_material_folder(subdir, os.path.join(args.src, subdir), args.dest)

    # Process flat images
    for img_file in image_files:
        process_flat_image(img_file, args.src, args.dest)

    print("\nTexture packing completed successfully!")

if __name__ == "__main__":
    main()

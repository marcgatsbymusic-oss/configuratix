import struct
import json
import os

glb_path = r"c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\.tmp\live-test.glb"

if not os.path.exists(glb_path):
    print("GLB file not found")
    exit(1)

with open(glb_path, 'rb') as f:
    header = f.read(12)
    magic, version, length = struct.unpack('<III', header)
    print(f"GLB Header: magic=0x{magic:X}, version={version}, length={length}")
    
    chunk_header = f.read(8)
    chunk_length, chunk_type = struct.unpack('<II', chunk_header)
    print(f"JSON Chunk: length={chunk_length}, type=0x{chunk_type:X}")
    
    json_bytes = f.read(chunk_length)
    json_str = json_bytes.decode('utf-8')
    gltf_json = json.loads(json_str)
    
    # Inspect images
    images = gltf_json.get('images', [])
    print(f"\nFound {len(images)} images:")
    for i, img in enumerate(images):
        name = img.get('name', 'unnamed')
        uri = img.get('uri', 'no uri')
        buffer_view = img.get('bufferView', 'no bufferView')
        mime_type = img.get('mimeType', 'no mimeType')
        print(f"  Image {i}: name={name}, uri={uri}, bufferView={buffer_view}, mimeType={mime_type}")
        
    # Inspect materials
    materials = gltf_json.get('materials', [])
    print(f"\nFound {len(materials)} materials:")
    for i, mat in enumerate(materials):
        name = mat.get('name', 'unnamed')
        pbr = mat.get('pbrMetallicRoughness', {})
        base_color = pbr.get('baseColorTexture', 'no baseColorTexture')
        print(f"  Material {i}: name={name}, baseColorTexture={base_color}")

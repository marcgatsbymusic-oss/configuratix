import ezdxf
from ezdxf.math import Matrix44

doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
z = doc.blocks.get('złożenie 07')

for e in z:
    if e.dxftype() == 'INSERT' and 'szyba' in e.dxf.name.lower():
        print(f"Szyba found: {e.dxf.name}")
        print(f"Insert pos: {e.dxf.insert.x}, {e.dxf.insert.y}")
        
        # Check contents of the szyba block
        child = doc.blocks.get(e.dxf.name)
        min_x = 99999
        max_x = -99999
        min_y = 99999
        max_y = -99999
        
        for ent in child:
            if ent.dxftype() in ['LINE', 'LWPOLYLINE']:
                if ent.dxftype() == 'LINE':
                    pts = [(ent.dxf.start.x, ent.dxf.start.y), (ent.dxf.end.x, ent.dxf.end.y)]
                else:
                    pts = [(p[0], p[1]) for p in ent.get_points()]
                    
                for p in pts:
                    if p[0] < min_x: min_x = p[0]
                    if p[0] > max_x: max_x = p[0]
                    if p[1] < min_y: min_y = p[1]
                    if p[1] > max_y: max_y = p[1]
                    
        print(f"Local Bounds: X: {min_x} to {max_x}, Y: {min_y} to {max_y}")

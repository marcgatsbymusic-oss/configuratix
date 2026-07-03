import ezdxf
from ezdxf.math import Matrix44
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
b = doc.blocks.get('złożenie 07')

out_doc = ezdxf.new('R2010')
msp = out_doc.modelspace()

def walk(b, m44):
    for e in b:
        if e.dxftype() == 'INSERT':
            new_m44 = e.matrix44() @ m44
            child = doc.blocks.get(e.dxf.name)
            walk(child, new_m44)
        elif e.dxftype() == 'LWPOLYLINE':
            new_e = e.copy()
            new_e.transform(m44)
            if hasattr(new_e.dxf, 'extrusion') and new_e.dxf.extrusion.z < 0:
                pts = new_e.get_points('xyb')
                new_e.set_points([(-p[0], p[1], -p[2]) for p in pts], 'xyb')
                new_e.dxf.extrusion = (0, 0, 1)
            
            msp.add_entity(new_e)

walk(b, Matrix44())

# Check bounds of everything in msp
for e in msp:
    pts = list(e.get_points())
    if pts:
        min_x = min(p[0] for p in pts)
        max_x = max(p[0] for p in pts)
        if min_x < -15 and max_x > -30:
            print(f"Entity X: {min_x} to {max_x} (Z extrusion: {e.dxf.extrusion.z})")

import ezdxf
from ezdxf.math import Matrix44
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
b = doc.blocks.get('złożenie 07')
def walk(b, m44):
    for e in b:
        if e.dxftype() == 'INSERT':
            new_m44 = e.matrix44() @ m44
            if "U- listwy" in e.dxf.name:
                print(f"FULL MATRIX for Gasket:\n{new_m44}")
            child = doc.blocks.get(e.dxf.name)
            walk(child, new_m44)
walk(b, Matrix44())

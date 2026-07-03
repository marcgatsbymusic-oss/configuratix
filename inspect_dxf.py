import ezdxf
import math
from ezdxf.math import Matrix44

doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
b = doc.blocks.get('rama 01')
if b:
    print('Entities in rama 01:')
    for e in b:
        if e.dxftype() == 'INSERT':
            name = getattr(e.dxf, 'name', '')
            rot = getattr(e.dxf, 'rotation', 0)
            x = getattr(e.dxf.insert, 'x', 0)
            y = getattr(e.dxf.insert, 'y', 0)
            print(f" - INSERT: {name} at ({x}, {y}) rot {rot}")

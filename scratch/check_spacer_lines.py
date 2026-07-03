import ezdxf
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
def check(name):
    b = doc.blocks.get(name)
    has_geom = False
    for e in b:
        if e.dxftype() in ['LWPOLYLINE', 'LINE', 'ARC']:
            has_geom = True
            break
    print(f"Block '{name}' has geometry: {has_geom}")
check('mostek podszybowy')
check('640301SEITE')

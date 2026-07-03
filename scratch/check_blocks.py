import ezdxf
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
b = doc.blocks.get('złożenie 07')
def walk(b, depth=0):
    for e in b:
        if e.dxftype() == 'INSERT':
            print("  " * depth + f"Insert: {e.dxf.name}")
            child = doc.blocks.get(e.dxf.name)
            walk(child, depth + 1)
walk(b)

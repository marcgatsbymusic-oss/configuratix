import ezdxf
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
b = doc.blocks.get('50924 - listwa 22mm')
for e in b:
    if e.dxftype() == 'INSERT':
        print(f"Insert {e.dxf.name}: xscale={e.dxf.xscale}, rot={e.dxf.rotation}, insert={e.dxf.insert.x},{e.dxf.insert.y}")

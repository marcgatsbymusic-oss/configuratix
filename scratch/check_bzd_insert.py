import ezdxf
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
b = doc.blocks.get('złożenie 07')
for e in b:
    if e.dxftype() == 'INSERT' and '50924' in e.dxf.name:
        print(f"BZD Insert: xscale={e.dxf.xscale}, rot={e.dxf.rotation}, insert={e.dxf.insert}")

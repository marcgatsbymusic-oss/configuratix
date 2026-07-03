import ezdxf
doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/IGLO5 entire profile sections.dxf')
child = doc.blocks.get('szyba 24mm')
for e in child:
    if e.dxftype() in ['LWPOLYLINE', 'LINE']:
        pts = list(e.get_points()) if hasattr(e, 'get_points') else [(e.dxf.start.x, e.dxf.start.y), (e.dxf.end.x, e.dxf.end.y)]
        min_y = min(p[1] for p in pts)
        max_y = max(p[1] for p in pts)
        min_x = min(p[0] for p in pts)
        max_x = max(p[0] for p in pts)
        print(f"{e.dxftype()} X: {min_x} to {max_x}, Y: {min_y} to {max_y}")

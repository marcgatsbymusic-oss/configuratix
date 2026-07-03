import ezdxf
doc = ezdxf.readfile('scratch/temp_zlozenie_07.dxf')
msp = doc.modelspace()
for e in msp:
    if e.dxf.layer == 'GSK_BZD' and e.dxftype() == 'LWPOLYLINE':
        pts = list(e.get_points())
        print(f"OCS Points: minY={min(p[1] for p in pts)} maxY={max(p[1] for p in pts)}")
        
        wcs_pts = list(e.vertices_in_wcs())
        print(f"WCS Points: minY={min(p[1] for p in wcs_pts)} maxY={max(p[1] for p in wcs_pts)}")

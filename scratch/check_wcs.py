import ezdxf
doc = ezdxf.readfile('scratch/temp_zlozenie_07.dxf')
msp = doc.modelspace()
for e in msp:
    if e.dxf.layer == 'GSK_BZD' and e.dxftype() == 'LWPOLYLINE':
        print(f"Gasket Extrusion: {e.dxf.extrusion}")
        pts = list(e.get_points())
        print(f"OCS Points: minX={min(p[0] for p in pts)} maxX={max(p[0] for p in pts)}")
        
        # Calculate WCS points
        wcs_pts = list(e.vertices_in_wcs())
        print(f"WCS Points: minX={min(p[0] for p in wcs_pts)} maxX={max(p[0] for p in wcs_pts)}")

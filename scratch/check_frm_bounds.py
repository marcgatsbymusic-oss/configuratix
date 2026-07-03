import ezdxf
doc = ezdxf.readfile('scratch/temp_zlozenie_07.dxf')
msp = doc.modelspace()
for e in msp:
    if e.dxf.layer in ['FRM_EXT', 'FRM_INT']:
        pts = list(e.get_points()) if hasattr(e, 'get_points') else []
        if pts:
            min_x = min(p[0] for p in pts)
            max_x = max(p[0] for p in pts)
            print(f"{e.dxf.layer} X: {min_x} to {max_x}")
            break

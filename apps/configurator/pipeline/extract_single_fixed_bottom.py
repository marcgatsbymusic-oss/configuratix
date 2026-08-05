import ezdxf
from ezdxf.math import Matrix44
import sys

def main():
    doc = ezdxf.readfile('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/IGLO5/IGLO 5 entire profile lineup/Single window, fixed bottom/single_window_fixed_bottom.dxf')
    out_doc = ezdxf.new('R2010')
    msp = out_doc.modelspace()

    def process_block(block, m44, parent_class=""):
        for e in block:
            if e.dxftype() == 'INSERT':
                name = e.dxf.name
                if name.startswith('250023') or name.startswith('250'):
                    continue
                
                # Use ezdxf's native matrix44 for the block reference!
                new_m44 = e.matrix44() @ m44
                
                child = doc.blocks.get(name)
                if child:
                    cls = parent_class
                    if "50001" in name or "rama" in name.lower(): 
                        cls = "FRM"
                    elif "słupek" in name.lower() or "50021" in name:
                        cls = "POST"
                    elif "skrzydło" in name.lower():
                        cls = "SSH"
                    elif "U-001" in name: cls = "GSK_FRM_EXT"
                    elif "50924" in name: cls = "BZD"
                    elif "U- listwy" in name: cls = "GSK_BZD"
                    elif "mostek" in name.lower() or "640301" in name: cls = "SPACER"
                    elif "U-002" in name: cls = "GSK_SSH_INT"
                    
                    if "szyba" in name.lower():
                        # SZYBA custom logic: calculate bounding box, then emit two 4mm glass rectangles
                        min_x = 99999
                        max_x = -99999
                        min_y = 99999
                        max_y = -99999
                        for ent in child:
                            if ent.dxftype() in ['LINE', 'LWPOLYLINE']:
                                pts = [(ent.dxf.start.x, ent.dxf.start.y), (ent.dxf.end.x, ent.dxf.end.y)] if ent.dxftype() == 'LINE' else [(p[0], p[1]) for p in ent.get_points()]
                                for p in pts:
                                    if p[0] < min_x: min_x = p[0]
                                    if p[0] > max_x: max_x = p[0]
                                    if p[1] < min_y: min_y = p[1]
                                    if p[1] > max_y: max_y = p[1]
                        
                        def emit_rect(layer, x1, x2, y1, y2):
                            pts = [(x1,y1), (x2,y1), (x2,y2), (x1,y2)]
                            rect = msp.add_lwpolyline(pts, close=True)
                            rect.dxf.layer = layer
                            rect.transform(new_m44)

                        emit_rect("GLS_EXT", min_x, min_x + 4, min_y, max_y)
                        emit_rect("GLS_INT", max_x - 4, max_x, min_y, max_y)
                        
                        # The spacer geometry is actually an LWPOLYLINE inside the glass block!
                        for ent in child:
                            if ent.dxftype() == 'LWPOLYLINE':
                                new_e = ent.copy()
                                new_e.transform(new_m44)
                                if hasattr(new_e.dxf, 'extrusion') and new_e.dxf.extrusion.z < 0:
                                    pts = new_e.get_points('xyb')
                                    new_e.set_points([(-p[0], p[1], -p[2]) for p in pts], 'xyb')
                                    new_e.dxf.extrusion = (0, 0, 1)
                                new_e.dxf.layer = "SPACER"
                                msp.add_entity(new_e)
                    else:
                        process_block(child, new_m44, cls)
                    
            elif e.dxftype() in ['LWPOLYLINE', 'POLYLINE', 'LINE', 'ARC']:
                if e.dxftype() == 'POLYLINE':
                    pts = []
                    for v in e.vertices:
                        b = v.dxf.bulge if v.dxf.hasattr('bulge') else 0.0
                        pts.append((v.dxf.location.x, v.dxf.location.y, b))
                    new_e = msp.add_lwpolyline(pts, format='xyb', dxfattribs={'layer': '0'})
                    if e.is_closed:
                        new_e.closed = True
                else:
                    new_e = e.copy()
                
                new_e.transform(m44)
                
                # Fix inverted extrusion for dxf-parser
                if hasattr(new_e.dxf, 'extrusion') and new_e.dxf.extrusion.z < 0:
                    if new_e.dxftype() == 'LWPOLYLINE':
                        pts = new_e.get_points('xyb')
                        new_e.set_points([(-p[0], p[1], -p[2]) for p in pts], 'xyb')
                        new_e.dxf.extrusion = (0, 0, 1)
                
                if parent_class == "FRM":
                    e_ext = new_e.copy()
                    e_ext.dxf.layer = "FRM_EXT"
                    msp.add_entity(e_ext)
                    e_int = new_e.copy()
                    e_int.dxf.layer = "FRM_INT"
                    msp.add_entity(e_int)
                elif parent_class == "SSH":
                    e_ext = new_e.copy()
                    e_ext.dxf.layer = "SSH_EXT"
                    msp.add_entity(e_ext)
                    e_int = new_e.copy()
                    e_int.dxf.layer = "SSH_INT"
                    msp.add_entity(e_int)
                elif parent_class == "POST":
                    e_ext = new_e.copy()
                    e_ext.dxf.layer = "POST_EXT"
                    msp.add_entity(e_ext)
                    e_int = new_e.copy()
                    e_int.dxf.layer = "POST_INT"
                    msp.add_entity(e_int)
                else:
                    new_e.dxf.layer = parent_class if parent_class else "0"
                    msp.add_entity(new_e)

    # Process all INSERTs in the modelspace
    process_block(doc.modelspace(), Matrix44(), "")
    
    out_doc.saveas('scratch/temp_single_fixed_bottom.dxf')
    print("Exported scratch/temp_single_fixed_bottom.dxf")

if __name__ == '__main__':
    main()

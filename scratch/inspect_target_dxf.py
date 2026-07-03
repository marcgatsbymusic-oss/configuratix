import ezdxf
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    doc = ezdxf.readfile(r"C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\CAD Files Drutex\DWG_TO_DXF_PIPELINE\IGLO5\IGLO 5 entire profile lineup\Single window, fixed bottom\single_window_fixed_bottom.dxf")
    msp = doc.modelspace()
    
    print("Blocks in DXF:")
    for blk in doc.blocks:
        if not blk.name.startswith('*'):
            print(f" - {blk.name}")

    print("\nEntities in Modelspace:")
    for e in msp:
        if e.dxftype() == 'INSERT':
            print(f" - INSERT: {e.dxf.name} at {e.dxf.insert}")
        else:
            print(f" - {e.dxftype()} on layer {e.dxf.layer}")

if __name__ == '__main__':
    main()

import ezdxf
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

doc = ezdxf.readfile(r'C:\Users\Shadow\Cloud-Drive\Web dev Drutex Product Content\CAD Files Drutex\DWG_TO_DXF_PIPELINE\IGLO5\IGLO 5 entire profile lineup\Single window, fixed bottom\single_window_fixed_bottom.dxf')
for b in doc.blocks:
    if b.name in ['złożenie 07', 'złożenie 30', 'złożenie 02']:
        print(f"--- {b.name} ---")
        for e in b:
            if e.dxftype() == 'INSERT':
                print(f"  INSERT: {e.dxf.name}")

import ezdxf
doc = ezdxf.readfile('scratch/temp_zlozenie_07.dxf')
msp = doc.modelspace()
bzd_ents = [e for e in msp if e.dxf.layer == 'BZD']
print(f"BZD entities: {len(bzd_ents)}")
for e in bzd_ents:
    print(f"- {e.dxftype()}")

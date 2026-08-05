import ezdxf
from ezdxf import path
from ezdxf.math import Matrix44
from collections import Counter
import re, json, math, os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

in_file = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/uploads/IGLO5_entire_profile_sections.dxf"
doc = ezdxf.readfile(in_file)
OUT = "scratch/out"
os.makedirs(OUT+"/profiles", exist_ok=True)

def classify(name):
    n = name.lower()
    if "rama" in n: return "frame"
    if "skrzyd" in n: return "sash"
    if "ruchom" in n: return "mullion_movable"
    if "słupek" in n or "slupek" in n: return "mullion_fixed"
    if "listwa podokienna" in n: return "subsill"
    if "listwa" in n: return "glazing_bead"
    if "szyba" in n: return "glass"
    if "uszczel" in n: return "gasket"
    if re.match(r"^250\d{3}", name): return "gasket"
    if "okapni" in n: return "drip_cap"
    if "próg" in n or "prog" in n: return "threshold"
    if "mostek" in n: return "spacer_bridge"
    return None

GEOM = {"LWPOLYLINE","POLYLINE","LINE","ARC","CIRCLE","ELLIPSE","SPLINE"}

def outlines(block, sag=0.03):
    loops=[]
    for e in block:
        if e.dxftype() in GEOM:
            try:
                p = path.make_path(e)
                pts = [(round(v.x,3), round(v.y,3)) for v in p.flattening(sag)]
                if len(pts) >= 2:
                    loops.append({"closed": bool(p.is_closed), "pts": pts})
            except Exception:
                pass
    return loops

def bbox(loops):
    xs=[p[0] for L in loops for p in L["pts"]]; ys=[p[1] for L in loops for p in L["pts"]]
    if not xs: return None
    return [round(min(xs),2),round(min(ys),2),round(max(xs),2),round(max(ys),2)]

# ---- atomic profiles (the 50xxx + named base blocks) ----
ATOMIC_TYPES={"frame","sash","mullion_fixed","mullion_movable","glazing_bead","glass","gasket","subsill","drip_cap","threshold","spacer_bridge"}
region_flagged=[]; exported=[]
for blk in doc.blocks:
    nm=blk.name
    if nm.startswith("*") or nm.startswith("złożenie"): continue
    c=classify(nm)
    if c not in ATOMIC_TYPES: continue
    has_region = any(e.dxftype()=="REGION" for e in blk)
    loops=outlines(blk)
    bb=bbox(loops)
    rec={"name":nm,"component":c,"has_region":has_region,
         "polyline_loops":len(loops),"bbox":bb,"loops":loops}
    safe=re.sub(r"[^A-Za-z0-9]+","_",nm).strip("_")
    json.dump(rec, open(f"{OUT}/profiles/{c}__{safe}.json","w", encoding="utf-8"), ensure_ascii=False)
    exported.append((c,nm,has_region,len(loops),bb))
    if has_region: region_flagged.append(nm)

print("=== ATOMIC PROFILES EXPORTED ===")
for c,nm,reg,nl,bb in sorted(exported):
    w = f"{bb[2]-bb[0]:.1f}x{bb[3]-bb[1]:.1f}" if bb else "n/a"
    flag = "  <-- REGION (needs explode in CAD)" if reg else ""
    print(f"  {c:16s} {nm:34s} loops={nl:2d} size={w:12s}{flag}")

# ---- złożenie recipes (offsets between components) ----
def recipe(block, m=None, depth=0, acc=None):
    if m is None: m=Matrix44()
    if acc is None: acc=[]
    for e in block:
        if e.dxftype()=="INSERT":
            cm=(Matrix44.scale(e.dxf.xscale,e.dxf.yscale,e.dxf.zscale)
                @ Matrix44.z_rotate(math.radians(e.dxf.rotation))
                @ Matrix44.translate(e.dxf.insert.x,e.dxf.insert.y,e.dxf.insert.z))
            comp=classify(e.dxf.name)
            w=(cm@m).transform((0,0,0))
            acc.append({"ref":e.dxf.name,"component":comp,
                        "offset":[round(w.x,2),round(w.y,2)],"rot":e.dxf.rotation})
            child=doc.blocks.get(e.dxf.name)
            if child is not None and depth<8 and not comp:
                recipe(child, cm@m, depth+1, acc)
    return acc

recipes={}
for blk in doc.blocks:
    if blk.name.startswith("złożenie"):
        recipes[blk.name]=recipe(blk)
json.dump(recipes, open(f"{OUT}/zlozenie_recipes.json","w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"\n=== REGION-BASED BLOCKS (need AutoCAD explode-to-polyline) ===")
print(" ", region_flagged if region_flagged else "none")
print(f"\nclean atomic profiles: {len(exported)-len(region_flagged)} / {len(exported)}")
print(f"złożenie recipes captured: {len(recipes)}")

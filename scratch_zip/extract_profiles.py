#!/usr/bin/env python3
"""
extract_profiles.py  —  regenerate f252_profiles.js and f252_handle.js
from the source assets, so the F252 build data is reproducible.

Inputs (place next to this script, or edit the paths below):
  zlozenie_02.json   IGLO5 top section     (frame + sash + top glazing)
  zlozenie_30.json   IGLO5 transom section (post + sash above + fixed below)
  zlozenie_07.json   IGLO5 bottom section  (frame + fixed glazing)
  testhandle.glb     window handle model

Outputs:
  f252_profiles.js   const PROFILES = {...}
  f252_handle.js     const HANDLE   = {...}

Requires: pip install trimesh numpy
The profile JSON layers each carry contours[i].threeShape = [{cmd,x,y},...] in the
local (x=depth, y=reveal) plane. We emit each as a simple polygon [[x,y],...].
GSK_SSH_INT ships as raw arc points (bulge=0 here) with no threeShape -> use points.
"""
import json, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
def P(name): return os.path.join(HERE, name)

# ---------------------------------------------------------------- profiles
def poly_from_threeshape(c):
    pts = [[round(q['x'], 3), round(q['y'], 3)] for q in c['threeShape']]
    out = [pts[0]]
    for a in pts[1:]:
        if abs(a[0]-out[-1][0]) > 1e-4 or abs(a[1]-out[-1][1]) > 1e-4:
            out.append(a)
    return out

def poly_from_points(c):  # raw contour points (used for GSK_SSH_INT)
    pts = [[round(q['x'], 3), round(q['y'], 3)] for q in c['points']]
    out = [pts[0]]
    for a in pts[1:]:
        if abs(a[0]-out[-1][0]) > 1e-4 or abs(a[1]-out[-1][1]) > 1e-4:
            out.append(a)
    return out

def build_profiles():
    d02 = json.load(open(P('zlozenie_02.json')))['layers']
    d30 = json.load(open(P('zlozenie_30.json')))['layers']
    d07 = json.load(open(P('zlozenie_07.json')))['layers']
    C  = lambda L, n, i=0: L[n]['contours'][i]
    ts = lambda L, n, i=0: poly_from_threeshape(C(L, n, i))

    data = {
        # FRAME (rama 01) — identical in _02 and _07
        "FRM_EXT": ts(d02, 'FRM_EXT'),      # 88 pts, seam-split half-profile
        "FRM_INT": ts(d02, 'FRM_INT'),      # 113 pts
        "GSK_FRM": ts(d02, 'GSK_FRM_EXT'),  # 49 pts (gasket U-001)
        # SASH (skrzydło 02)
        "SSH_EXT": ts(d02, 'SSH_EXT'),
        "SSH_INT": ts(d02, 'SSH_INT'),
        "GSK_SSH_EXT": ts(d02, 'GSK_SSH_EXT'),
        "GSK_SSH_INT": poly_from_points(C(d02, 'GSK_SSH_INT')),  # raw pts, reveal ~39-50
        "BZD_SSH":     ts(d02, 'BZD_SSH'),
        "GSK_BZD_SSH": ts(d02, 'GSK_BZD_SSH'),
        # TRANSOM (słupek 01) — two U-001 gaskets + fixed-side bead/gasket
        "POST_EXT":     ts(d30, 'POST_EXT'),
        "POST_INT":     ts(d30, 'POST_INT'),
        "GSK_POST_A":   ts(d30, 'GSK_POST_EXT', 0),
        "GSK_POST_B":   ts(d30, 'GSK_POST_EXT', 1),
        "BZD_POST":     ts(d30, 'BZD_POST'),
        "GSK_BZD_POST": ts(d30, 'GSK_BZD_POST'),
        # FIXED BOTTOM bead + gasket (złożenie 07)
        "BZD_FRM":     ts(d07, 'BZD_FRM'),
        "GSK_BZD_FRM": ts(d07, 'GSK_BZD_FRM'),
    }
    open(P('f252_profiles.js'), 'w').write("const PROFILES=" + json.dumps(data, separators=(',', ':')) + ";")
    print("f252_profiles.js  ->", len(data), "layers")

# ---------------------------------------------------------------- handle
def build_handle():
    import trimesh
    # force='mesh' bakes all scene-graph transforms -> the correct assembly
    mesh = trimesh.load(P('testhandle.glb'), force='mesh')
    V = np.asarray(mesh.vertices); F = np.asarray(mesh.faces)
    # reorient: world X = local X (width), world Y = local Z (up), world Z = -local Y (lever -> +Z room)
    Vr = np.c_[V[:, 0], V[:, 2], -V[:, 1]]
    # scale so overall vertical extent = 141mm (per handle spec drawing)
    sc = 141.0 / (Vr[:, 1].max() - Vr[:, 1].min())
    Vr *= sc
    # mounting references from the 'Base' part (with its scene transform)
    s = trimesh.load(P('testhandle.glb'), force='scene')
    def world_verts(name):
        for node in s.graph.nodes_geometry:
            T, g = s.graph[node]
            if g == name:
                Vv = np.asarray(s.geometry[name].vertices)
                return (np.c_[Vv, np.ones(len(Vv))] @ T.T)[:, :3]
        return np.asarray(s.geometry[name].vertices)
    Bw = world_verts('Base'); Bw = np.c_[Bw[:, 0], Bw[:, 2], -Bw[:, 1]] * sc
    baseCen = [float((Bw[:, i].min() + Bw[:, i].max()) / 2) for i in range(3)]
    data = {
        "v": [round(float(x), 2) for x in Vr.flatten()],
        "f": [int(i) for i in F.flatten()],
        "baseCenX": round(baseCen[0], 2),
        "baseCenY": round(baseCen[1], 2),
        "baseBackZ": round(float(Bw[:, 2].min()), 2),  # mounting face -> seat on sash INT face (89)
    }
    open(P('f252_handle.js'), 'w').write("const HANDLE=" + json.dumps(data, separators=(',', ':')) + ";")
    print("f252_handle.js    -> size", np.round(Vr.max(0) - Vr.min(0), 1), "mm (target ~29 x 141 x 55)")

if __name__ == "__main__":
    build_profiles()
    try:
        build_handle()
    except Exception as e:
        print("handle skipped:", e)

import json

with open('src/data/profiles/IgloEdge/IGLS_OPENING_DOOR_SECTION_AND_FRAME.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for layer_name, layer_data in d['layers'].items():
    if not layer_data['contours']:
        continue
    xs = []
    ys = []
    for contour in layer_data['contours']:
        for pt in contour['points']:
            xs.append(pt['x'])
            ys.append(pt['y'])
    print(f"{layer_name:30} | x: [{min(xs):7.2f}, {max(xs):7.2f}] | y: [{min(ys):7.2f}, {max(ys):7.2f}]")

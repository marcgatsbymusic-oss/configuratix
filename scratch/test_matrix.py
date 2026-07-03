import ezdxf
from ezdxf.math import Matrix44

m1 = Matrix44.translate(10, 0, 0)
m2 = Matrix44.scale(2, 2, 2)

# M1 @ M2: Apply M1, then M2
m3 = m1 @ m2
p = m3.transform((0,0,0))
print(f"m1 @ m2: {p}")

# M2 @ M1: Apply M2, then M1
m4 = m2 @ m1
p2 = m4.transform((0,0,0))
print(f"m2 @ m1: {p2}")

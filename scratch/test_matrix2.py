from ezdxf.math import Matrix44
import math

m_child = Matrix44.scale(-1, 1, 1) @ Matrix44.z_rotate(math.radians(180)) @ Matrix44.translate(16.1, 20.6, 0)
m_parent = Matrix44.z_rotate(math.radians(90)) @ Matrix44.translate(-1, 46, 0)

m_total_1 = m_child @ m_parent
print("child @ parent (0,0) ->", m_total_1.transform((0,0,0)))

m_total_2 = m_parent @ m_child
print("parent @ child (0,0) ->", m_total_2.transform((0,0,0)))


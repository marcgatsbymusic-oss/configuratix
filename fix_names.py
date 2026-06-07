import re

with open('src/components/configurator/SLE201Viewer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the duplicate renderSashVertical names
code = code.replace(
    '  /** Child1 left vertical stile (Standard) — provides the mitre corner */\n  const renderSashVerticalLeftStandard = () => layerConfigs.flatMap(cfg => {',
    '  /** Child1 left vertical stile (Standard) — provides the mitre corner */\n  const renderSashVerticalLeftStandard = () => layerConfigs.flatMap(cfg => {'
) # Actually, I used this exact replace string in `add_standard.py` but `renderSashVerticalLeftStandard` was inserted.

# But wait! I replaced:
# '  /** Child1 closing stile (standard sash) — rides with sash on the right */'
# with `standard_left` which had `const renderSashVerticalLeftStandard = ...`
# But `renderSashVertical` STILL existed because my FIRST replace in `swap.py` replaced `renderSashVertical` with `renderSashVerticalRight`, 
# and replaced `renderSashVerticalRight` with `renderSashVertical`!

# So currently we have:
# 1. `renderSashVerticalLeftStandard` (inserted by add_standard.py)
# 2. `renderSashVerticalRight` (from swap.py)
# 3. `renderSashVertical` (doorpost, from swap.py)
# 4. Wait, the error said `Identifier renderSashVertical has already been declared`.

# Let's just do a clean replace using python logic to find and rename:
code = code.replace(
    '  /** Child1 left vertical stile (Doorpost) — rides with sash */\n  const renderSashVertical = () => doorPostLayerConfigs.flatMap(cfg => {',
    '  /** Child1 left vertical stile (Doorpost) — rides with sash */\n  const renderSashVerticalLeftDoorpost = () => doorPostLayerConfigs.flatMap(cfg => {'
)

# And in JSX:
code = code.replace(
    '{renderSashVerticalLeftStandard()}\n        {renderSashVertical()}\n',
    '{renderSashVerticalLeftStandard()}\n        {renderSashVerticalLeftDoorpost()}\n'
)

# Wait, the error showed line 338 and 363. Let me replace `const renderSashVertical =` at line 363.
with open('src/components/configurator/SLE201Viewer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

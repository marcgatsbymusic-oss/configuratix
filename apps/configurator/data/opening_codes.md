# Opening-code decode (IGLO 5 catalogue)

Your export encodes each field's opening as a compact code. This maps them onto
the primitive `open` keys in data/primitives.md.

## Type (head token)
| code | meaning            | primitive `open` |
|------|--------------------|------------------|
| FIX    | fixed in frame             | `fixed` |
| FIX-S  | fixed in a dummy sash      | `fixed_sash` |
| R      | turn / casement (rozwierne)| `turn` |
| U      | tilt only (uchylne)        | `tilt` |
| UR     | tilt & turn (uchylno-rozw.)| `tiltturn` |
| DW     | door leaf (drzwiowe)       | `door` |
| DW-FIX | fixed in door system       | `fixed` |
| DW-FF  | fixed in door sash         | `fixed_sash` |
| PSK    | parallel tilt-slide        | `psk` |
| PSK-FIX / PSK-FIX-S | PSK fixed / in sash | `fixed` / `fixed_sash` |
| FS     | bi-fold (harmonijkowe)     | `bifold` *(review)* |
| X      | pergola / other            | `other` *(review)* |

## Hand
`-P` = right (prawe) → `hand:"R"`  ·  `-L` = left (lewe) → `hand:"L"`.

## Active / passive leaf (on a movable post / stulp)
| token | meaning |
|-------|---------|
| SC          | active leaf (skrzydło czynne) → `active:true` |
| SB / SBP    | passive leaf (skrzydło bierne) → `active:false` |
| PSK `…Pc/Lc`| PSK active leaf, right/left |
| PSK `…Pb/Lb`| PSK passive leaf, right/left |

The movable post sits at the boundary between the active and passive leaves.

## Modifiers
| token | meaning |
|-------|---------|
| trailing `z` (R-Pz, FIX-Sz) | flush sash (zlicowane) → `sashStyle:"flush"` |
| `-S` suffix                 | glazing carried in a dummy sash |
| `PP-` prefix                | mounted on an intermediate/coupler profile → `onCoupler:true` |
| `PR-` prefix                | **uncertain** — flagged for confirmation |

## Post Type → division
| Post Type string | tree |
|------------------|------|
| None (Single Field)             | single leaf |
| Vertical Mullion                | vertical split, fixed posts |
| Vertical Mullion + Movable Post | vertical split, movable post at active/passive boundary |
| Transom                         | horizontal split (stacked rows) |
| Transom + Vertical Mullion (and combos) | nested — **best-guess, flagged for review** |

## Notes for the importer
- `Fields: 99` means a variable/large field count → flagged for review.
- Multi-divider codes (transom + mullion, the big Dxxx and FSxxx) decode the
  opening of each field cleanly but the spatial arrangement is a best guess and
  is flagged so you can confirm against the thumbnail.

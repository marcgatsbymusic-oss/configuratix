# IGLO 5 window-type primitives

Every code in the production catalogue (F100 … PP206, ~90 types) is a combination
of four small primitive sets. The engine builds any code from these — adding a
type is a data row, not new geometry code.

## 1. Family (frame system + leaf type)
| key                | catalogue          | notes |
|--------------------|--------------------|-------|
| `service_door`     | DS100, DS200       | single / double leaf |
| `window`           | F100–F453          | window frame + window sashes |
| `balcony_door`     | F150–F384          | full-height, low threshold |
| `psk`              | P100–P206          | parallel tilt-slide |
| `door`             | D100–D300          | entrance door leaf (+ fanlights) |
| `coupler`          | B100–B300          | "intermediate profile" joining units |
| `psk_coupler`      | PP100–PP206        | PSK mounted on a coupler |

## 2. Division ("post")  — what splits the frame into fields
| key               | catalogue term     | meaning |
|-------------------|--------------------|---------|
| `none`            | 1-chamber          | single field |
| `mullion:fixed`   | stable post        | fixed vertical post |
| `mullion:movable` | movable post / PST | two leaves meet, no fixed post |
| `transom`         | top fanlight       | horizontal split (fixed/opening top) |
| multiple          | 3- / 4-chamber     | 2 posts = 3 fields, 3 posts = 4 fields |

Movable-post position is explicit where it matters: `center` (F401),
`left` (F402), `right` (F403).

## 3. Opening per field (leaf) — **handing is mandatory**
| key              | catalogue          | hand |
|------------------|--------------------|------|
| `fixed`          | fixed glazing in frame | — |
| `fixed_sash`     | fixed glazing in a dummy sash | — |
| `turn`           | casement (rozwierne)   | L / R |
| `tilt`           | tilt only (uchylne)    | — (bottom-hung) |
| `tiltturn`       | tilt & turn (RU)       | L / R |
| `psk`            | parallel tilt-slide    | L / R (+ which is active) |
| `door`           | door leaf              | L / R |

## 4. Add-ons
- `top_fanlight` — transom with a fixed or opening light above (naświetle górne).
- `side_fanlight` / `sidelight` — vertical fixed light beside the leaf (boczne).
- `threshold` — low/flat sill for doors and balcony doors.

## Layout tree (how a code is expressed)
A type is a recursive split tree. Leaves carry `open` + `hand`.
```
node := { split: "vertical"|"horizontal", at: [0..1, …],
          posts: [{type:"mullion"|"transom", post:"fixed"|"movable"} …],
          children: [node | leaf …] }
leaf := { open: <opening key>, hand?: "L"|"R", active?: true }
```
This single shape expresses mullions, transoms, fanlights, sidelights, couplers,
and PSK active-leaf selection — so the whole catalogue is data.

## Exclusions (locked decisions)
- No internal steel reinforcement (`wzmocnienie`) — never extracted, never built.
- No internal PVC chambers — profiles extrude as the outer silhouette only
  (hollow bodies) for mobile performance.
- Seals are generated parametric EPDM lips, not the catalogue HATCH blocks.

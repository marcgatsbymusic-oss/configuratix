# Evidence Module

This module manages the offline-first collection of photographic and measurable evidence during the installation workflow (as per FR-6.1 - FR-6.5).

## Core Principles

- **Immutable:** Once attached, a photo cannot be modified or deleted. Errors are handled via additive uploads (e.g. uploading a new photo).
- **Tolerance-checked Measurements:** Levelling and plumb readings are automatically checked against a configuration of accepted tolerances.
- **Ordered by Sequence and Time:** Evidence can be retrieved sequentially by workflow step for compliance validation.

## Capacity Estimation and Implications

Based on the evidence requirements in Section 5 of the spec, we anticipate the following evidence items per opening (window/door):

1. **Pre-installation:**
   - Cleared opening / existing window (1 photo)
2. **Placement:**
   - Frame secured (1 photo)
3. **Levelling:**
   - Level reading per axis (3 photos)
   - Inclinometer reading (1 photo)
4. **Fixing:**
   - Fixing points/screws (2-3 photos)
5. **Sealing:**
   - Sealed joint (1-2 photos)
6. **Completion:**
   - Completed closing window (1 photo)
7. **Potential Overrides & Exceptions:**
   - (1-3 photos)

**Estimated Photo Volume:**
- ~10 to 15 photos per standard window opening.

**Storage and Sync Implications:**
Given our default compression and resolution policy (`config.ts`: 1920x1080 JPEG at 80% quality), each image will average ~1.5 MB in size.

* Per window: 15 photos * 1.5 MB = 22.5 MB
* Per standard residential job (10 windows): ~225 MB
* Sync Bandwidth (Outbox Pattern): A typical 4G connection (10 Mbps upload) will take roughly 3 minutes to sync a completed job to the backend. Syncing can happen continuously in the background or deferred until Wi-Fi is available.

## Known Placeholders
- **Levelling Tolerances:** Currently set to `PLACEHOLDER_UNVERIFIED`. A warning is logged on each use. Drutex technical documentation must supply these values before going to production.

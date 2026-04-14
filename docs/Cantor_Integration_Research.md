# Cantor ERP Database Integration Strategy

Based on reverse-engineering the Cantor SQL Server extended events trace on `DRUTEX_DEALER`, here is the exact database logic for generating an order programmatically.

## Order Number Generation
Cantor does not use standard auto-incrementing identity columns for document numbers. Instead, it maintains counters in the `NUMSRV` table.
To get a new order number (`AUFNR`):
- Locate the record in `NUMSRV` where `CODE = 24` and `SUBCODE = 0` (or `BEZEICHNUNG = 'Zlecenia'`).
- Increment `WERT`. The new `WERT` is your new `AUFNR`.

## History Logging
Every time an order is manipulated, Cantor writes to `AUF_HIST`.
- Determine the new `LFDNR` (running number) by querying `NUMSRV` where `CODE = 300` and `SUBCODE = 0` (`BEZEICHNUNG = 'Letzte Lfd. Nr Auftragshistorie'`).
- Increment `WERT` to get the new `LFDNR`.
- Insert entries into `AUF_HIST`. Sample text: `'Enter order entry'` / `'Exit order entry'`.

## Order Storage
Order data is inserted hierarchically:
1. **Header**: Inserts a single record into `AUFKOPF` keyed by `AUFNR`. This contains order flags, metadata, and the calculated standard net and gross prices (`GESPREISBRUTTO`, `GESPREISNETTO`).
2. **Items**: Inserts multiple records into `AUFPOS`. Example `ARTNR` elements logged during the trace include `F104`, `GLOBAL`, `MONT`, and `TS`. Each maps to physical or logical subcomponents within the window configurator.

## Related Artifacts
A complete extraction of the SQL mapping executed by Cantor via `sp_prepexec` can be found in `Cantor_Order_Trace.sql` in the same directory. All future Node adapter development should closely mirror these exact fields and insertion configurations.

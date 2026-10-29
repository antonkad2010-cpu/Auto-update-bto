# FAutoLoot: ILM 1.0 behavior

ILM calls `_0x4e0e1c` after updating each active loot entity in the native game
cycle. It tests squared distance strictly below `0xa028` (41000), checks the
FAutoLoot flag and connected state, then sends `[12, loot.id]`. With the loot
filter enabled, it sends only entries whose matching resource has `acquire` set.
It retries each native cycle while the item remains present. It does not wait
for an acknowledgement timer, sort by distance, or limit retries to four items.

The port now calls `fastLoot` immediately after `ㅤࡇ᠋` in the active loot cycle.
It uses the existing native binary/encrypted sender rather than the legacy JSON
socket protocol. The independent frame scanner, 250 ms pending queue and retry
batch cap were removed. Removed entities and invalid IDs/coordinates are ignored;
disconnected clients and dead players do not send pickup requests.

`tests/fixtures/ilm-fast-loot-oracle.cjs` preserves the extracted original callback.
Tests compare 500 cases against it, check the exact radius and filter, and execute
the new loop replacement to verify update-before-pickup ordering, full batches,
next-cycle retries, reused IDs and immediate disable. These tests run in the
update watcher as well.

The full bundle passed syntax and integration checks and entered/reentered a
Frankfurt server without JavaScript errors. A live inventory-confirmed drop and
pickup was not measured. “Immediate” means the first native update cycle after
loot becomes known to the client; it does not remove network latency, server
range checks, inventory constraints or server rejection.

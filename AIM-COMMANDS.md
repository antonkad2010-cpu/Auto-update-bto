# Duplicate aim commands

The 50 ms aim timer previously bypassed the sender's unchanged-angle check.
Twenty ticks with an unchanged prediction emitted twenty identical opcode-6
requests. It now emits one; changed quantized angles still send immediately on
the next aim tick. Prediction and line calculation keep their existing cadence.

The original ILM `wannaFire` predicate remains unchanged. However, one incoming
direction-change update could stay true across several ticks and repeatedly
emit the same start/stop-fire pair. Target histories now carry an update revision;
autofire consumes that event once per target revision. This deliberately changes
repeated emission, not the original prediction or direction-change calculation.

The angle cache is invalidated when aim is disabled, a selected/self entity is
removed, the target is lost, or the game is inactive. In particular, removing
and re-adding a target between timer ticks must not leave a cached angle after
native mouse input changed the server angle.

Validation: 46 JavaScript tests, 9 Python tests, and generated-bundle syntax.
Regressions cover twenty identical ticks, changing prediction, native mouse
handoff/reacquisition, repeated autofire events, and subsequent new updates.
The existing 500 ILM prediction/selection/autofire-condition comparisons pass.

The user's reported symptom is a death screen after following players with aim
enabled, with full HP previously visible. That does not identify a disconnect,
server kick reason, or anti-cheat decision. No server-side cause was obtained,
and this build has not been verified to prevent that death/kick. It does not
hide the mod, change identity, or bypass server validation.

# Aim compatibility with ILM 1.0

The extracted ILM oracle is retained unchanged in `tests/fixtures/ilm-aim-oracle.js`.
The original itself did not read `bulletSpeedCoefficient`; this was not an omitted
binding in the port. The current runtime deliberately makes that control active.

Prediction uses packet displacement, with:

```
factor = (distance / distanceCoefficient) * (4 / bulletSpeedCoefficient)
         + offsetCoefficient
predicted = target + factor * (target - previousTarget)
```

Bullet speed is a relative coefficient, not measured pixels/ms and not a server
weapon-speed control. Its reference is 4: at 4 the ILM prediction formula is
unchanged. Higher values reduce flight-dependent lead, lower values increase it.
The offset term is independent. Distance, speed and offset are checked against
their menu bounds on save and when loading stored values. Existing valid values
are preserved; an old non-default speed value now affects prediction.

Both the line endpoint and sent angle derive from the same predicted point.
The native network angle is rounded to an integer degree. Cursor selection,
manual player lock, packet-coordinate history, direction-change autofire and
50 ms aim cadence retain the original behavior. The unchanged oracle is tested
against 500 packet-driven scenarios at the reference speed.

Deliberate edge-case corrections compared with ILM:

- Losing a target clears the prediction line and stops stale aim/autofire sends.
- Native mouse aiming is available while aim is enabled but has no active target.
- Ghoul UIDs are not compared with player IDs or player clan membership.
- Invalid saved coefficients cannot create division by zero or inverted lead.

Regression tests check speed values 1, 2, 4, 8 and 15 against the formula and
outgoing native angle packet, lost targets, native fallback and ghoul UID overlap.
These are code/protocol checks, not measured AK-47 or Laser Submachine hit rates.
The earlier offline presets were produced for reference speed 4 and do not prove
an optimum for other speed values. This formula does not add self-motion,
acceleration, obstruction, spread or latency compensation.

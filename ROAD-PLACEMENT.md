# Client placement on road tiles

The supplied ILM has no separate road placement toggle. Its road renderer
`_0x424166` only paints the road image. Its building preview `_0x27efe3` contains
a broader change: one occupied-tile branch assigns `canBuild = 1`, while the
current game rejects that branch. That is not proof of server-side acceptance.

This port intentionally limits the new permission to roads: `Build on roads`
in Automation (internal key `BuildOnRoadEnabled`, default true). In the native
building renderer `ⲣ︄ܔ`, road entities identified by `ﾠ᠌ᴘ.ﾠރ͡` skip only tile
occupancy/owner/category writes. Road drawing and all other native code remain.
No construction packets are injected by the feature; native placement/AutoBuild
continue to use their normal checks and sender.

Other entities still mark their tiles occupied. A road does not clear existing
wall, player or loot collision information, regardless of ordering. The toggle
restores the original native bookkeeping when disabled. Existing range,
materials, floor and server validation remain applicable. The setting applies
to the road item and all its subtypes; it is not a global build-anywhere mode.

Tests execute the original or patched native collision prefix, covering an empty
road tile, an overlapping wall in either order and switching the feature off.
The complete patched bundle passed syntax checks, 39 JavaScript tests and
9 Python tests, and entered/reentered Frankfurt without JavaScript errors.
Actual placement on a radioactive-city road acknowledged by the server has not
been verified. Client permission must not be described as server acceptance.

## Additional placement-path verification

The test now also executes the full native preview function `ιᴀ‍` and native
mouse handler `αᚊܛ`, extracted from the pinned client. Nine combinations cover
blueprint layers 0, 1 and 2 with road permission enabled, disabled and a wall in
the same cell. They verify the actual `[14, rotation, row, column]` packet and
preserve the native layer-2 furniture/wall overlap rule. This is a local client
protocol check, not a real server acknowledgement.

A live Frankfurt session was also used to move, gather wood and look for roads.
No road entities were found in the inspected areas; the test character died and
respawned before a construction attempt. There is still no live road-placement
confirmation. Exact city coordinates/server are needed for a targeted trial.

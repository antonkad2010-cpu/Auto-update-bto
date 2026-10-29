# Right-click door interaction

The native game decodes construction items from `extra >> 7` only in entity
layers 3–6. Resources and projectiles use those bits for other subtype data.
Previously the mod interpreted that data as construction item IDs, so a rock
could be treated as a door and receive an unrelated interaction request. The
same check also affected the hovered owner label.

The selector now accepts only native construction layers. It uses the original
ILM rounded world pixel → 100-pixel tile conversion and sends the native
`[15, entity ID, owner ID]` request for the selected door. It scans live entities
at click time, gives doors priority over containers on the same tile, and
intercepts native right-click handling so it cannot also act on the player's
nearest door. An outgoing request is not a server acknowledgement.

Tests compare outgoing requests with the callback extracted from ILM, including
rounded tile boundaries. They also cover camera/zoom/CSS transforms, a player
standing inside one door while selecting its neighbour, removed entities,
resources with aliased subtype bits, typing, and disabled interaction.

Live Frankfurt Survival 1 attempts reached a public building door and issued
right-click requests through the updated bundle. Its state remained unchanged;
the close attempt had a client-reported distance of about 154 pixels, with a
placed block obstructing the approach. The character subsequently died and
respawned before the requested adjacent-door scenario could be completed. Server-confirmed opening
of the second door while standing inside the first remains unverified. The
patch does not change server distance or ownership checks.

The aim algorithm and saved/default aim coefficients are unchanged by this fix.
The existing 500 packet-driven comparisons with the extracted ILM aim still
pass. The three-setting offline candidate (530 / 1.5 / 1.6) is a model result,
not a measured AK-47 or Laser Submachine preset; it was not applied to production.

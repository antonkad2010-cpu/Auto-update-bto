The public script URL is dist/game.modded.js on main. The GitHub workflow checks
upstream every five minutes (GitHub may delay scheduled runs).

On a new hash tools/remap.cjs compares the entire old and new token streams using
pinned Acorn. It accepts formatting/comments and consistent bijective renaming of
Unicode identifiers. It maps exact anchor spans and translates runtime bindings,
including quoted property names, then applies all patches and runs the regression
suite and node syntax check. The downloaded game is never executed by the mapper.

The compressed audited baseline is hash-checked against patches/responsive.json.
No hash-only update or fuzzy match is accepted. Changed literals, executable
string payloads, token structure, conflicting renames or nonunique anchors stop
publication and produce new_version_needs_remapping. Such releases still require
manual reverse engineering. This is not a general automatic deobfuscator and does
not certify live combat or arbitrary future versions.

# Stop automatic login after a server-ended life

The server's binary opcode 5 invokes the native death handler `ᴀⲣρ`.
It removes the local player, updates final XP, enters the death UI and later
closes the socket. Previously the mod treated the resulting state 64 as an
unexpected transport failure and scheduled another login. A successful login
reset the retry count, so repeated server-ended lives could cause more automatic
logins without the user pressing Play.

The native death handler now calls `onServerDeath` before its unchanged native
body. The mod disarms reconnect, cancels pending server-list callbacks, clears
aim state, and waits for native Play/Play Again. A subsequent manual login starts
a new recovery budget as before. Unexpected transport-loss recovery remains.
Native inventory/XP handling, tokens, cookies and storage are not changed.

This distinguishes a server-ended life from an unexpected transport loss; it
does not identify a ban or alter a server decision. It is not an explanation or
fix for the initial death/anti-cheat trigger.

Tests execute the exact pinned native handler and verify entity removal, XP,
no retry after death, cancellation of a stale refresh callback, and resuming
ordinary recovery after manual Play. Full checks: 53 JavaScript and 9 Python
tests, plus generated-bundle syntax. A live exact-bundle test received native
server death, then observed at least 16 seconds with no new game socket,
`armed=false`, `endedByServer=true`, and no JavaScript errors. This validates
stopping retries after death, not preventing the initial death.

## Investigation limits

The user reports that ordinary play also keeps failing from the affected IP
until their IP changes. That report invalidates treating a failed clean-client
run on an already-affected cloud address as evidence that the mod is innocent.
It suggests an address-level persistent restriction, but no server ban reason
or anti-cheat rule was exposed to the client.

A normal-window Chromium control with unmodified game JS remained connected
for 76 seconds. The exact previously published bundle also completed 60 seconds
of player tracking/following with AutoFire off, without a death packet.
A later AutoFire-on run died without acquiring a target or firing; it cannot
establish a firing-related cause. Earlier headless controls also died. These
results do not isolate the user's original triggering action. No IP change,
identity spoofing, or anti-cheat bypass is included in this patch.

## Input binding correction

Mod-owned keys now consume keydown, repeated keydown and the matching keyup
before the game's listeners run. Previously Space could toggle aim and also
reach native interaction handling. Rebinding releases Space for normal play.
Text inputs, editable elements, chat and native buttons retain their input.
Four regression tests cover propagation, repeat handling, rebinding and blur.

A real-browser Space check recorded no interaction packets in either build.
It therefore does not demonstrate a network difference in live play or explain
the initial disconnect. The correction is established by input-handler tests.

The user has clarified that the triggering action is firing at another player
with aim enabled. Neither the loader-only test nor tracking without firing
reproduces that action. No AK47 or laser-submachine firing validation was
completed. The initial disconnect and persistent address restriction remain
unresolved; this candidate must not be described as an anti-cheat fix.

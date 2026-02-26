## 2024-05-24 - IDOR in Personal Stash Access
**Vulnerability:** Players could access other players' "personal" stashes (where `owner = true`) by providing the victim's identifier in the `data.owner` field of the `ox_inventory:openInventory` callback.
**Learning:** The server-side logic trusted the client-provided `owner` field even for stashes intended to be restricted to the player's own identifier, as long as the stash name was a valid registered stash.
**Prevention:** Always force the `owner` to the player's own identifier for personal stashes when the interaction is triggered by a client, unless specifically performing an administrative action with elevated permissions.

**Note:** When working in this codebase, remember that it uses standard Lua (5.4), which does not support modern features like optional chaining (`?.`). Always use traditional nil-checks.

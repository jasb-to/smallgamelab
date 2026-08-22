# The Long Run — build audit

## 2026-08-22 incident

### Root causes found

1. The repository contained the production Unity project at `game-unity`, while several generated folders named `My project`, `My project (1)` and `My project (2)` were also present. Opening those folders caused Unity to show the wrong/sample scene and repeatedly produced the horizon-only result.
2. The runtime controller had accumulated multiple competing implementations during rapid iteration.
3. The previous `FiveChapterGame.cs` contained a broken reference to `time` and other stale implementation assumptions, which is why Vercel/Unity-side compilation kept failing during the earlier web-to-Unity transition.
4. A second runtime file was introduced while trying to repair the first, creating a duplicate-class risk.

### Fix applied

- Replaced the broken runtime with one controller only: `Assets/Scripts/Game/FiveChapterGame.cs`.
- Removed the duplicate runtime controller files.
- Added a stable Unity `.meta` for the controller.
- Kept the runtime self-bootstrapping so a clean scene does not depend on a hand-wired GameObject.
- Added a documented canonical Unity project path.
- Added the five-chapter progression: Delivery, One More Room, The Getaway, Dungeon 7 and The Final Run.
- Added camera follow, movement/jump, automatic firing, enemies, pursuit cars, boss encounters, HUD, scoring, waves and chapter transitions.

### Verification target

The next local verification is intentionally simple: open the canonical `game-unity` project, wait for compilation to finish, press Play, and confirm the chapter overlay appears instead of the sample horizon.

This audit is the source-of-truth record for the Unity-folder and runtime-controller incident.

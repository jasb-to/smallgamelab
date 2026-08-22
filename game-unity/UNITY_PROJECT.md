# THE LONG RUN — Unity project

**Open this folder in Unity Hub:**

`/Users/bilkhj50/smallgamelab/game-unity`

Do **not** open any of these generated folders:

- `game-unity/My project`
- `game-unity/My project (1)`
- `game-unity/My project (2)`
- `unity/TheLongRun`

Those folders were the source of the repeated horizon/sample-scene confusion.

## Correct workflow

1. Quit Play Mode.
2. In Unity Hub choose **Add → Add project from disk**.
3. Select exactly `/Users/bilkhj50/smallgamelab/game-unity`.
4. Let Unity finish importing.
5. In the Project window open `Assets/Scripts/Game/FiveChapterGame.cs` only if you need to inspect code.
6. Press Play. The runtime controller creates the camera, world, Mara, HUD and five-chapter flow automatically.

The project is pinned to Unity 6.3.0f1 in `ProjectSettings/ProjectVersion.txt`.

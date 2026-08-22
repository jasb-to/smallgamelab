using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    // Legacy entry point retained so old scenes do not break. The production runtime is now FiveChapterGame.
    public sealed class Stage1Bootstrap : MonoBehaviour
    {
        void Awake() { enabled = false; }
    }
}

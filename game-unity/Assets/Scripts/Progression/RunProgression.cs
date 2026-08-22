using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    public sealed class RunProgression : MonoBehaviour
    {
        [SerializeField] int startingLevel = 1;
        [SerializeField] int xpBase = 25;
        [SerializeField] float xpGrowth = 1.22f;

        public int Level { get; private set; }
        public int XP { get; private set; }
        public int XPToNext => Mathf.CeilToInt(xpBase * Mathf.Pow(xpGrowth, Level - 1));
        public event System.Action<int> LevelledUp;

        void Awake() => Level = startingLevel;

        public void AddXP(int amount)
        {
            XP += Mathf.Max(0, amount);
            while (XP >= XPToNext)
            {
                XP -= XPToNext;
                Level++;
                LevelledUp?.Invoke(Level);
            }
        }
    }
}

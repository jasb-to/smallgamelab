using UnityEngine;

namespace SmallGameLab.TheLongRun {
    public enum RunState { Menu, Running, Paused, LevelUp, Dead, Complete }

    public sealed class GameState : MonoBehaviour {
        public static GameState Instance { get; private set; }
        public RunState State { get; private set; } = RunState.Menu;
        public int Chapter { get; private set; } = 1;
        public int Score { get; private set; }
        public int Level { get; private set; } = 1;
        public int XP { get; private set; }

        void Awake() { if (Instance && Instance != this) { Destroy(gameObject); return; } Instance = this; DontDestroyOnLoad(gameObject); }
        public void StartRun() { State = RunState.Running; Score = 0; XP = 0; Level = 1; }
        public void AddScore(int value) { Score += Mathf.Max(0, value); }
        public void AddXP(int value) { XP += Mathf.Max(0, value); while (XP >= Level * 100) { XP -= Level * 100; Level++; State = RunState.LevelUp; } }
        public void Resume() { State = RunState.Running; }
        public void Pause() { if (State == RunState.Running) State = RunState.Paused; }
        public void Die() { State = RunState.Dead; }
        public void Complete() { State = RunState.Complete; }
    }
}

using UnityEngine;

namespace SmallGameLab.TheLongRun {
    public sealed class Health : MonoBehaviour {
        [SerializeField] int maxHealth=100; public int Current {get; private set;}
        void Awake(){Current=maxHealth;}
        public void Damage(int amount){Current-=Mathf.Max(0,amount); if(Current<=0){ var enemy=GetComponent<Enemy>(); if(enemy) enemy.Defeated(); else if(GameState.Instance) GameState.Instance.Die(); Destroy(gameObject); }}
    }
}

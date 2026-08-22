using UnityEngine;

namespace SmallGameLab.TheLongRun {
    public enum EnemyKind { Scout, Gunner, Brute, Drone, Elite }
    [RequireComponent(typeof(Health))]
    public sealed class Enemy : MonoBehaviour {
        [SerializeField] EnemyKind kind; [SerializeField] float speed=2f; Transform target;
        void Start(){ var p=GameObject.FindWithTag("Player"); if(p) target=p.transform; }
        void Update(){ if(!target || GameState.Instance?.State!=RunState.Running)return; Vector2 d=(target.position-transform.position); float s=kind==EnemyKind.Brute?speed*.55f:kind==EnemyKind.Scout?speed*1.35f:speed; if(Mathf.Abs(d.x)>1.4f) transform.position += new Vector3(Mathf.Sign(d.x)*s*Time.deltaTime,0,0); }
        public void Defeated(){if(GameState.Instance){GameState.Instance.AddScore(kind==EnemyKind.Elite?500:100);GameState.Instance.AddXP(kind==EnemyKind.Elite?40:10);}}
    }
}

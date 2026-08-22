using UnityEngine;
namespace SmallGameLab.TheLongRun {
    public sealed class EnemySpawner:MonoBehaviour {
        [SerializeField] GameObject[] enemyPrefabs; [SerializeField] Transform player; [SerializeField] float interval=1.4f; float timer;
        void Update(){if(GameState.Instance?.State!=RunState.Running || enemyPrefabs.Length==0)return; timer-=Time.deltaTime;if(timer<=0){Spawn();timer=Mathf.Max(.35f,interval-GameState.Instance.Level*.04f);}}
        void Spawn(){var p=Instantiate(enemyPrefabs[Random.Range(0,enemyPrefabs.Length)],player.position+new Vector3(Random.value>.5f?12:-12,Random.Range(-1f,3f),0),Quaternion.identity);p.transform.SetParent(transform);}
    }
}

using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    public enum EnemyArchetype { Scout, Gunner, Brute, Drone, Elite }

    [RequireComponent(typeof(Health))]
    public sealed class EnemyBrain : MonoBehaviour
    {
        [SerializeField] EnemyArchetype archetype;
        [SerializeField] Transform target;
        [SerializeField] float moveSpeed = 2.5f;
        [SerializeField] float preferredRange = 7f;
        [SerializeField] float contactDamage = 10f;

        Health health;
        Rigidbody2D body;

        void Awake()
        {
            health = GetComponent<Health>();
            body = GetComponent<Rigidbody2D>();
            health.Died += OnDied;
        }

        void Start()
        {
            if (!target)
            {
                var mara = GameObject.FindWithTag("Player");
                if (mara) target = mara.transform;
            }
        }

        void FixedUpdate()
        {
            if (!target || health.IsDead) return;
            var delta = target.position - transform.position;
            var distance = delta.magnitude;
            var direction = distance > 0.01f ? delta.normalized : Vector2.zero;
            var speed = archetype == EnemyArchetype.Brute ? moveSpeed * 0.55f : moveSpeed;
            if (archetype == EnemyArchetype.Gunner && distance < preferredRange) direction = Vector2.Perpendicular(direction);
            body.linearVelocity = direction * speed;
        }

        void OnTriggerStay2D(Collider2D other)
        {
            if (!other.CompareTag("Player")) return;
            var player = other.GetComponent<Health>();
            if (player) player.TakeDamage(contactDamage * Time.fixedDeltaTime, Vector2.zero);
        }

        void OnDied(Health _) => Destroy(gameObject, 0.12f);
    }
}

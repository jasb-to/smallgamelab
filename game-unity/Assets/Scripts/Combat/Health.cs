using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    public sealed class Health : MonoBehaviour, IDamageable
    {
        [SerializeField] float maxHealth = 100f;
        public float Current { get; private set; }
        public bool IsDead => Current <= 0f;
        public event System.Action<Health> Died;
        public event System.Action<float> Damaged;

        void Awake() => Current = maxHealth;

        public void TakeDamage(float amount, Vector2 impulse)
        {
            if (IsDead) return;
            Current = Mathf.Max(0f, Current - Mathf.Max(0f, amount));
            var body = GetComponent<Rigidbody2D>();
            if (body) body.AddForce(impulse, ForceMode2D.Impulse);
            Damaged?.Invoke(amount);
            if (IsDead) Died?.Invoke(this);
        }

        public void Restore(float amount) => Current = Mathf.Min(maxHealth, Current + Mathf.Max(0f, amount));
    }
}

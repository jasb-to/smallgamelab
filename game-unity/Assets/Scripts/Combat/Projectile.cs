using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    public sealed class Projectile : MonoBehaviour
    {
        Rigidbody2D body;
        float damage;
        float knockback;
        float lifetime = 2f;
        SpriteRenderer sprite;

        public void Initialise(Vector2 velocity, float damageValue, float knockbackValue, Color tint)
        {
            damage = damageValue;
            knockback = knockbackValue;
            body = GetComponent<Rigidbody2D>();
            sprite = GetComponent<SpriteRenderer>();
            if (body) body.linearVelocity = velocity;
            if (sprite) sprite.color = tint;
            Destroy(gameObject, lifetime);
        }

        void OnTriggerEnter2D(Collider2D other)
        {
            var target = other.GetComponent<IDamageable>();
            if (target != null)
            {
                target.TakeDamage(damage, transform.right * knockback);
                Destroy(gameObject);
            }
        }
    }

    public interface IDamageable
    {
        void TakeDamage(float amount, Vector2 impulse);
    }
}

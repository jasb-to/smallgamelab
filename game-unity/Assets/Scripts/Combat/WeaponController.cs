using UnityEngine;
using System.Collections;

namespace SmallGameLab.TheLongRun
{
    public sealed class WeaponController : MonoBehaviour
    {
        [SerializeField] WeaponDefinition[] loadout;
        [SerializeField] Transform muzzle;
        [SerializeField] Projectile projectilePrefab;
        [SerializeField] Animator animator;

        int index;
        float nextShot;
        public WeaponDefinition Current => loadout != null && loadout.Length > 0 ? loadout[index] : null;

        public void SetWeapon(int value)
        {
            if (loadout == null || loadout.Length == 0) return;
            index = Mathf.Clamp(value, 0, loadout.Length - 1);
        }

        public void Fire(Vector2 direction)
        {
            var weapon = Current;
            if (weapon == null || projectilePrefab == null || muzzle == null || Time.time < nextShot) return;
            nextShot = Time.time + 1f / Mathf.Max(0.1f, weapon.roundsPerSecond);
            animator?.SetTrigger("Fire");
            for (var i = 0; i < Mathf.Max(1, weapon.pellets); i++)
            {
                var angle = Random.Range(-weapon.spreadDegrees, weapon.spreadDegrees);
                var velocity = Quaternion.Euler(0f, 0f, angle) * direction.normalized * weapon.projectileSpeed;
                var shot = Instantiate(projectilePrefab, muzzle.position, Quaternion.identity);
                shot.Initialise(velocity, weapon.damage, weapon.knockback, weapon.projectileTint);
            }
        }
    }
}

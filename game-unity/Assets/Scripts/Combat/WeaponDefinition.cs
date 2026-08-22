using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    public enum WeaponKind { Sidearm, RavenSmg, Breacher }

    [CreateAssetMenu(menuName = "Small Game Lab/Weapon Definition")]
    public sealed class WeaponDefinition : ScriptableObject
    {
        public WeaponKind kind;
        public string displayName = "Mara Sidearm";
        public float damage = 12f;
        public float roundsPerSecond = 5f;
        public float projectileSpeed = 22f;
        public int pellets = 1;
        public float spreadDegrees = 0f;
        public float knockback = 2f;
        public Color projectileTint = Color.white;
    }
}

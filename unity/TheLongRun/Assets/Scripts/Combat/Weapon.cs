using UnityEngine;

namespace SmallGameLab.TheLongRun {
    public enum WeaponType { Sidearm, RavenSMG, Breacher }
    [System.Serializable] public struct WeaponSpec { public WeaponType type; public int damage; public float fireRate; public int pellets; public float spread; public float projectileSpeed; }
    public sealed class Weapon : MonoBehaviour {
        [SerializeField] WeaponSpec sidearm = new WeaponSpec { type=WeaponType.Sidearm, damage=18, fireRate=3.5f, pellets=1, spread=0, projectileSpeed=18 };
        [SerializeField] WeaponSpec smg = new WeaponSpec { type=WeaponType.RavenSMG, damage=9, fireRate=10, pellets=1, spread=.04f, projectileSpeed=20 };
        [SerializeField] WeaponSpec shotgun = new WeaponSpec { type=WeaponType.Breacher, damage=12, fireRate=1.5f, pellets=7, spread=.22f, projectileSpeed=16 };
        public WeaponType Current { get; private set; } = WeaponType.Sidearm; float cooldown;
        void Update() { cooldown -= Time.deltaTime; if (Input.GetKeyDown(KeyCode.Alpha1)) Current=WeaponType.Sidearm; if(Input.GetKeyDown(KeyCode.Alpha2))Current=WeaponType.RavenSMG; if(Input.GetKeyDown(KeyCode.Alpha3))Current=WeaponType.Breacher; if(Input.GetButton("Fire1") && cooldown<=0){ Fire(); var s=Spec(); cooldown=1f/s.fireRate; } }
        WeaponSpec Spec()=>Current==WeaponType.RavenSMG?smg:Current==WeaponType.Breacher?shotgun:sidearm;
        void Fire(){ var s=Spec(); for(int i=0;i<s.pellets;i++){ float a=Random.Range(-s.spread,s.spread); var p=GameObject.CreatePrimitive(PrimitiveType.Sphere); p.name=$"Projectile_{Current}"; p.transform.position=transform.position; p.transform.localScale=Vector3.one*.12f; var rb=p.AddComponent<Rigidbody2D>(); rb.gravityScale=0; rb.linearVelocity=Quaternion.Euler(0,0,a*Mathf.Rad2Deg)*Vector2.right*s.projectileSpeed; var hit=p.AddComponent<Projectile>(); hit.Damage=s.damage; Destroy(p,2f); } }
    }
    public sealed class Projectile:MonoBehaviour { public int Damage; void OnTriggerEnter2D(Collider2D c){ var h=c.GetComponent<Health>(); if(h){h.Damage(Damage);Destroy(gameObject);} } }
}

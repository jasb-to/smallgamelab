using UnityEngine;

namespace SmallGameLab.TheLongRun {
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class MaraController : MonoBehaviour {
        [SerializeField] float runSpeed = 6.5f;
        [SerializeField] float jumpVelocity = 12f;
        [SerializeField] float dashSpeed = 15f;
        [SerializeField] float dashDuration = .14f;
        Rigidbody2D body; float dashTimer; bool grounded; bool facingRight = true;
        public bool CanControl => GameState.Instance == null || GameState.Instance.State == RunState.Running;
        void Awake() { body = GetComponent<Rigidbody2D>(); body.gravityScale = 3.2f; }
        void Update() {
            if (!CanControl) return;
            float x = Input.GetAxisRaw("Horizontal");
            if (Mathf.Abs(x) > .01f) { facingRight = x > 0; transform.localScale = new Vector3(facingRight ? 1 : -1, 1, 1); }
            if (Input.GetButtonDown("Jump") && grounded) body.linearVelocity = new Vector2(body.linearVelocity.x, jumpVelocity);
            if (Input.GetKeyDown(KeyCode.LeftShift) && dashTimer <= 0) dashTimer = dashDuration;
            if (dashTimer > 0) dashTimer -= Time.deltaTime;
        }
        void FixedUpdate() {
            if (!CanControl) return;
            float x = Input.GetAxisRaw("Horizontal");
            float speed = dashTimer > 0 ? dashSpeed : runSpeed;
            body.linearVelocity = new Vector2(x * speed, body.linearVelocity.y);
        }
        void OnCollisionStay2D(Collision2D c) { foreach (var p in c.contacts) if (p.normal.y > .55f) grounded = true; }
        void OnCollisionExit2D(Collision2D c) { grounded = false; }
    }
}

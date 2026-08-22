using UnityEngine;
using UnityEngine.InputSystem;

namespace SmallGameLab.TheLongRun
{
    public sealed class MaraController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] float moveSpeed = 7.5f;
        [SerializeField] float jumpVelocity = 13f;
        [SerializeField] float dashSpeed = 20f;
        [SerializeField] float dashDuration = 0.14f;
        [SerializeField] int maxAirJumps = 1;

        [Header("Grounding")]
        [SerializeField] Transform groundCheck;
        [SerializeField] float groundRadius = 0.18f;
        [SerializeField] LayerMask groundMask;

        Rigidbody2D body;
        float move;
        int airJumps;
        float dashTimer;
        bool dashRequested;
        bool jumpRequested;

        public bool IsGrounded { get; private set; }
        public bool IsDashing => dashTimer > 0f;
        public float Facing { get; private set; } = 1f;

        void Awake() => body = GetComponent<Rigidbody2D>();

        void Update()
        {
            var keyboard = Keyboard.current;
            move = 0f;
            if (keyboard != null)
            {
                if (keyboard.aKey.isPressed || keyboard.leftArrowKey.isPressed) move -= 1f;
                if (keyboard.dKey.isPressed || keyboard.rightArrowKey.isPressed) move += 1f;
                if (keyboard.spaceKey.wasPressedThisFrame || keyboard.wKey.wasPressedThisFrame || keyboard.upArrowKey.wasPressedThisFrame) jumpRequested = true;
                if (keyboard.leftShiftKey.wasPressedThisFrame) dashRequested = true;
            }
            if (Mathf.Abs(move) > 0.01f) Facing = Mathf.Sign(move);
        }

        void FixedUpdate()
        {
            IsGrounded = groundCheck != null && Physics2D.OverlapCircle(groundCheck.position, groundRadius, groundMask);
            if (IsGrounded) airJumps = 0;

            if (dashRequested && !IsDashing) { dashTimer = dashDuration; dashRequested = false; }
            if (dashTimer > 0f)
            {
                dashTimer -= Time.fixedDeltaTime;
                body.linearVelocity = new Vector2(Facing * dashSpeed, 0f);
                return;
            }

            var velocity = body.linearVelocity;
            velocity.x = Mathf.MoveTowards(velocity.x, move * moveSpeed, 45f * Time.fixedDeltaTime);
            if (jumpRequested)
            {
                jumpRequested = false;
                if (IsGrounded || airJumps < maxAirJumps)
                {
                    if (!IsGrounded) airJumps++;
                    velocity.y = jumpVelocity;
                }
            }
            body.linearVelocity = velocity;
        }

        void OnDrawGizmosSelected()
        {
            if (!groundCheck) return;
            Gizmos.DrawWireSphere(groundCheck.position, groundRadius);
        }
    }
}

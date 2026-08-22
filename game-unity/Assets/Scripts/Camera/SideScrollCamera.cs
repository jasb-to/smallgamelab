using UnityEngine;

namespace SmallGameLab.TheLongRun
{
    public sealed class SideScrollCamera : MonoBehaviour
    {
        [SerializeField] Transform target;
        [SerializeField] Vector3 offset = new(4f, 1.5f, -10f);
        [SerializeField] float followSharpness = 8f;
        [SerializeField] float lookAhead = 3.5f;
        [SerializeField] float verticalLimit = 4f;

        void LateUpdate()
        {
            if (!target) return;
            var desired = target.position + offset + Vector3.right * lookAhead;
            desired.y = Mathf.Clamp(desired.y, -verticalLimit, verticalLimit);
            transform.position = Vector3.Lerp(transform.position, desired, 1f - Mathf.Exp(-followSharpness * Time.deltaTime));
        }
    }
}

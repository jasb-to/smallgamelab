using UnityEngine;
namespace SmallGameLab.TheLongRun {
    public sealed class EndlessRunnerCamera:MonoBehaviour {
        [SerializeField] Transform target; [SerializeField] float lead=3f, smooth=8f;
        void LateUpdate(){if(!target)return; Vector3 desired=new Vector3(target.position.x+lead,target.position.y,transform.position.z); transform.position=Vector3.Lerp(transform.position,desired,1-Mathf.Exp(-smooth*Time.deltaTime));}
    }
}

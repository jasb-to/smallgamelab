using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace SmallGameLab.TheLongRun
{
    public sealed class Stage1Bootstrap : MonoBehaviour
    {
        const float GroundY = -2.25f;
        readonly List<GameObject> enemies = new();
        Transform mara;
        Rigidbody2D maraBody;
        SpriteRenderer maraSprite;
        Camera cam;
        float fireTimer;
        float spawnTimer;
        float elapsed;
        int kills;
        int xp;
        int level = 1;
        int hp = 100;
        Text hud;
        Text banner;
        readonly Color orange = new(0.95f,0.27f,0.12f);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot() {
            if (FindFirstObjectByType<Stage1Bootstrap>() == null)
                new GameObject("THE LONG RUN · STAGE 1").AddComponent<Stage1Bootstrap>();
        }

        void Start() {
            BuildWorld();
            BuildUI();
            SpawnWave(1);
        }

        void BuildWorld() {
            cam = new GameObject("Main Camera").AddComponent<Camera>();
            cam.orthographic = true; cam.orthographicSize = 5.1f; cam.transform.position = new Vector3(0,1,-10);
            cam.backgroundColor = new Color(.018f,.025f,.04f);

            CreateBackdrop();
            CreatePlatform("Street", new Vector2(0,GroundY), new Vector2(42,0.5f), new Color(.07f,.09f,.12f));
            CreatePlatform("UpperRoof", new Vector2(6,1.15f), new Vector2(10,.35f), new Color(.11f,.13f,.17f));

            mara = new GameObject("Mara · Courier 17").transform;
            mara.position = new Vector3(-5,GroundY+1.6f,0);
            maraSprite = mara.gameObject.AddComponent<SpriteRenderer>();
            maraSprite.sprite = Resources.Load<Sprite>("Art/Mara/mara");
            maraSprite.sortingOrder = 20;
            mara.localScale = Vector3.one * 0.018f;
            maraBody = mara.gameObject.AddComponent<Rigidbody2D>();
            maraBody.gravityScale = 3.2f; maraBody.freezeRotation = true;
            var col = mara.gameObject.AddComponent<CapsuleCollider2D>(); col.size = new Vector2(1.1f,2.8f);
        }

        void CreateBackdrop() {
            for (int i=-12;i<18;i++) {
                float h = 2.5f + Mathf.Abs((i*37)%7)*.65f;
                var b=CreateBox("Building", new Vector2(i*2.2f,h/2f-2.2f), new Vector2(2f,h), new Color(.035f,.055f,.085f), -5);
                for(int w=0;w<4;w++) CreateBox("Window", b.transform.position+new Vector3(-.65f+w*.45f,0,0), new Vector2(.13f,.18f), new Color(.9f,.38f,.14f,.55f), -4);
            }
            CreateBox("Moon", new Vector2(6,5.6f), new Vector2(1.5f,1.5f), new Color(1f,.72f,.35f,.85f), -6);
        }

        GameObject CreateBox(string name, Vector2 pos, Vector2 size, Color color, int order=0) {
            var go=new GameObject(name); go.transform.position=pos; go.transform.localScale=size;
            var sr=go.AddComponent<SpriteRenderer>(); sr.sprite=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f)); sr.color=color; sr.sortingOrder=order; return go;
        }
        void CreatePlatform(string name, Vector2 pos, Vector2 size, Color color) { var g=CreateBox(name,pos,size,color,1); g.AddComponent<BoxCollider2D>(); }

        void BuildUI() {
            var canvas=new GameObject("HUD").AddComponent<Canvas>(); canvas.renderMode=RenderMode.ScreenSpaceOverlay;
            var scaler=canvas.gameObject.AddComponent<CanvasScaler>(); scaler.uiScaleMode=CanvasScaler.ScaleMode.ScaleWithScreenSize; scaler.referenceResolution=new Vector2(1920,1080);
            hud=MakeText(canvas.transform,"HUD",new Vector2(40,-35),new Vector2(900,70),28,TextAnchor.UpperLeft);
            hud.color=Color.white;
            banner=MakeText(canvas.transform,"Banner",new Vector2(0,-115),new Vector2(1920,80),38,TextAnchor.MiddleCenter); banner.color=orange;
            banner.text="MARA VALE  //  COURIER 17";
            Invoke(nameof(ClearBanner),2.4f);
        }
        Text MakeText(Transform parent,string name,Vector2 pos,Vector2 size,int font,TextAnchor anchor){var go=new GameObject(name);go.transform.SetParent(parent,false);var rt=go.AddComponent<RectTransform>();rt.anchorMin=new Vector2(.5f,1);rt.anchorMax=new Vector2(.5f,1);rt.pivot=new Vector2(.5f,1);rt.anchoredPosition=pos;rt.sizeDelta=size;var t=go.AddComponent<Text>();t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.fontSize=font;t.alignment=anchor;t.fontStyle=FontStyle.Bold;return t;}
        void ClearBanner(){if(banner)banner.text="";}

        void Update() {
            if(!maraBody) return;
            elapsed+=Time.deltaTime;
            var kb=Keyboard.current;
            float x=0;
            if(kb!=null){if(kb.aKey.isPressed||kb.leftArrowKey.isPressed)x--;if(kb.dKey.isPressed||kb.rightArrowKey.isPressed)x++;if((kb.spaceKey.wasPressedThisFrame||kb.wKey.wasPressedThisFrame||kb.upArrowKey.wasPressedThisFrame)&&Mathf.Abs(maraBody.linearVelocity.y)<.15f)maraBody.linearVelocity=new Vector2(maraBody.linearVelocity.x,11f);}
            maraBody.linearVelocity=new Vector2(Mathf.MoveTowards(maraBody.linearVelocity.x,x*7f,45f*Time.deltaTime),maraBody.linearVelocity.y);
            if(Mathf.Abs(x)>.01f)maraSprite.flipX=x<0;
            cam.transform.position=Vector3.Lerp(cam.transform.position,new Vector3(mara.position.x+2,1,-10),1-Mathf.Exp(-5*Time.deltaTime));
            fireTimer-=Time.deltaTime; if((kb!=null&&kb.jKey.isPressed)||Mouse.current?.leftButton.isPressed==true) Fire();
            spawnTimer-=Time.deltaTime; if(spawnTimer<=0){SpawnEnemy();spawnTimer=Mathf.Max(.28f,1.15f-level*.055f);}
            for(int i=enemies.Count-1;i>=0;i--){var e=enemies[i];if(!e){enemies.RemoveAt(i);continue;}var dir=(mara.position-e.transform.position).normalized;e.transform.position+=dir*Time.deltaTime*(1.15f+level*.06f);if(Vector2.Distance(e.transform.position,mara.position)<1.15f){hp-=10;Destroy(e);enemies.RemoveAt(i);if(hp<=0)Restart();}}
            hud.text=$"MARA VALE   ♥ {hp:000}     LEVEL {level:00}     XP {xp:0000}     TAKEDOWNS {kills:000}     {elapsed:00.0}s";
        }
        void Fire(){if(fireTimer>0)return;fireTimer=.16f;var p=CreateBox("Tracer",mara.position+new Vector3(maraSprite.flipX?-1.25f:1.25f,.15f,0),new Vector2(.42f,.08f),new Color(1f,.66f,.25f),30);var b=p.AddComponent<Projectile>();b.direction=maraSprite.flipX?Vector2.left:Vector2.right; b.speed=19f; b.damage=18;}
        void SpawnEnemy(){var g=new GameObject("Hostile");g.transform.position=mara.position+new Vector3(Random.Range(9f,13f),Random.Range(-.2f,2.2f),0);var sr=g.AddComponent<SpriteRenderer>();bool brute=Random.value<.18f;sr.sprite=Resources.Load<Sprite>(brute?"Art/Enemies/brute":"Art/Enemies/scout");sr.sortingOrder=12;g.transform.localScale=Vector3.one*(brute?.012f:.015f);g.AddComponent<BoxCollider2D>().isTrigger=true;var e=g.AddComponent<EnemyHealth>();e.hp=brute?70:28;e.bootstrap=this;enemies.Add(g);}
        void SpawnWave(int wave){for(int i=0;i<Mathf.Min(4+wave,10);i++)Invoke(nameof(SpawnEnemy),i*.35f);}
        public void HitEnemy(GameObject target,int damage){var h=target.GetComponent<EnemyHealth>();if(!h)return;h.hp-=damage;if(h.hp<=0){kills++;xp+=h.maxHp/2;if(xp>=level*80){xp=0;level++;banner.text=$"LEVEL {level} // CHOOSE YOUR EDGE";Invoke(nameof(ClearBanner),1.4f);}enemies.Remove(target);Destroy(target);}}
        void Restart(){hp=100;kills=0;xp=0;level=1;mara.position=new Vector3(-5,GroundY+1.6f,0);foreach(var e in enemies)if(e)Destroy(e);enemies.Clear();banner.text="RUN ENDED  //  KEEP MOVING";Invoke(nameof(ClearBanner),1.6f);}
    }
    public sealed class Projectile:MonoBehaviour{public Vector2 direction;public float speed=18,damage=10;float life=1.2f;void Update(){transform.position+=(Vector3)(direction*speed*Time.deltaTime);life-=Time.deltaTime;if(life<=0)Destroy(gameObject);foreach(var e in FindObjectsByType<EnemyHealth>(FindObjectsSortMode.None)){if(Vector2.Distance(transform.position,e.transform.position)<.65f){var root=FindFirstObjectByType<Stage1Bootstrap>();root?.HitEnemy(e.gameObject,(int)damage);Destroy(gameObject);break;}}}}
    public sealed class EnemyHealth:MonoBehaviour{public int hp=30;public int maxHp=30;[HideInInspector]public Stage1Bootstrap bootstrap;void Awake(){maxHp=hp;}}
}

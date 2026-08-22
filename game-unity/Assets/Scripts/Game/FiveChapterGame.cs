using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace SmallGameLab.TheLongRun
{
    public sealed class FiveChapterGame : MonoBehaviour
    {
        enum Mode { Runner, Survivor, Getaway, Dungeon, Final }
        readonly string[] titles = { "THE DELIVERY", "ONE MORE ROOM", "THE GETAWAY", "DUNGEON 7", "THE FINAL RUN" };
        readonly string[] subtitles = { "Rooftops · District 7", "Relay 9 · Underground", "Blackline · Pursuit", "The Warden's Vault", "One city. One last run." };
        readonly Mode[] modes = { Mode.Runner, Mode.Survivor, Mode.Getaway, Mode.Dungeon, Mode.Final };
        readonly List<GameObject> actors = new();
        readonly List<GameObject> bullets = new();
        readonly List<GameObject> pickups = new();
        Transform mara, weapon;
        Camera cam;
        Canvas ui;
        Text titleText, hud, objective;
        GameObject overlay;
        float time, distance, spawn, fire, bossHp;
        int chapter = 0, wave, hp, xp, score, kills, weaponLevel;
        bool playing, dead, complete, bossAlive;
        Vector2 aim = Vector2.right;
        Color orange = new(.95f,.27f,.12f), cream = new(1f,.78f,.46f), ink = new(.025f,.035f,.055f);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot() { if (FindFirstObjectByType<FiveChapterGame>() == null) new GameObject("THE LONG RUN · FULL GAME").AddComponent<FiveChapterGame>(); }

        void Start() { Application.targetFrameRate=60; BuildCamera(); BuildUI(); BuildMara(); ShowChapterIntro(); }
        void BuildCamera(){ cam=new GameObject("Game Camera").AddComponent<Camera>(); cam.orthographic=true; cam.orthographicSize=5.1f; cam.transform.position=new Vector3(0,0,-20); cam.backgroundColor=ink; }
        Sprite PixelSprite(){ return Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f)); }
        GameObject Box(string n,Vector2 p,Vector2 s,Color c,int order=0){ var g=new GameObject(n);g.transform.position=p;g.transform.localScale=s;var r=g.AddComponent<SpriteRenderer>();r.sprite=PixelSprite();r.color=c;r.sortingOrder=order;actors.Add(g);return g; }
        void BuildWorld(){ foreach(var a in actors) if(a) Destroy(a); actors.Clear(); foreach(var b in bullets) if(b) Destroy(b); bullets.Clear(); foreach(var p in pickups) if(p) Destroy(p); pickups.Clear();
            Color bg=chapter switch{0=>new Color(.025f,.045f,.08f),1=>new Color(.018f,.025f,.04f),2=>new Color(.055f,.025f,.02f),3=>new Color(.035f,.018f,.055f),_=>new Color(.07f,.018f,.025f)};
            cam.backgroundColor=bg;
            Box("Far skyline",new Vector2(10,1.8f),new Vector2(60,13),new Color(bg.r+.025f,bg.g+.03f,bg.b+.04f),-20);
            for(int i=-20;i<45;i++){float h=1.8f+Mathf.Abs(Mathf.Sin(i*2.7f))*5f; Box("Building",new Vector2(i*2.1f,-2.2f+h/2),new Vector2(1.7f,h),chapter==3?new Color(.09f,.055f,.12f):new Color(.045f,.065f,.095f),-10); for(int w=0;w<2;w++) Box("Window",new Vector2(i*2.1f-.35f+w*.7f,-1.5f+(w%2)*1.1f),new Vector2(.14f,.25f),cream with { a=.5f },-8); }
            Box("Ground",new Vector2(15,-3),new Vector2(70,.55f),new Color(.075f,.085f,.105f),2); Box("GroundLine",new Vector2(15,-2.69f),new Vector2(70,.06f),orange,3);
            for(int i=-8;i<40;i++){Box("RoadLight",new Vector2(i*3.4f,-.8f),new Vector2(.06f,2.3f),new Color(.12f,.15f,.19f),4);Box("Light",new Vector2(i*3.4f,.36f),new Vector2(.34f,.09f),orange,5);}
            if(chapter==0||chapter==4){for(int i=0;i<12;i++)Box("Rooftop",new Vector2(4+i*4,-1.9f+Mathf.Sin(i)*.7f),new Vector2(2.5f,.18f),new Color(.14f,.15f,.18f),6);}
            if(chapter==3){for(int i=0;i<12;i++){Box("Pillar",new Vector2(i*3-10,-.8f),new Vector2(.3f,4.2f),new Color(.12f,.06f,.17f),6);Box("Cable",new Vector2(i*3-8.5f,2.1f),new Vector2(2.8f,.05f),new Color(.4f,.12f,.5f),7);}}
        }
        void BuildMara(){mara=new GameObject("Mara Vale · Courier 17").transform;mara.position=new Vector3(-3,-1.4f,0);var r=mara.gameObject.AddComponent<SpriteRenderer>();r.sprite=Resources.Load<Sprite>("Art/Mara/mara");r.sortingOrder=40;mara.localScale=Vector3.one*.52f;weapon=new GameObject("Weapon").transform;weapon.SetParent(mara,false);weapon.localPosition=new Vector3(.65f,.02f,-.1f);var wr=weapon.gameObject.AddComponent<SpriteRenderer>();wr.sprite=Resources.Load<Sprite>("Art/Weapons/raven-smg");wr.sortingOrder=45;weapon.localScale=Vector3.one*.011f;}
        void BuildUI(){ui=new GameObject("HUD").AddComponent<Canvas>();ui.renderMode=RenderMode.ScreenSpaceOverlay;var s=ui.gameObject.AddComponent<CanvasScaler>();s.uiScaleMode=CanvasScaler.ScaleMode.ScaleWithScreenSize;s.referenceResolution=new Vector2(1920,1080);ui.gameObject.AddComponent<GraphicRaycaster>();if(!FindFirstObjectByType<EventSystem>())new GameObject("EventSystem",typeof(EventSystem),typeof(InputSystemUIInputModule));titleText=Txt("CHAPTER",new Vector2(0,-34),new Vector2(1700,55),27,TextAnchor.MiddleLeft);hud=Txt("HUD",new Vector2(0,-82),new Vector2(1700,42),17,TextAnchor.MiddleLeft);objective=Txt("OBJECTIVE",new Vector2(0,-118),new Vector2(1700,36),14,TextAnchor.MiddleCenter);}
        Text Txt(string n,Vector2 pos,Vector2 size,int fs,TextAnchor a){var g=new GameObject(n);g.transform.SetParent(ui.transform,false);var r=g.AddComponent<RectTransform>();r.anchorMin=new Vector2(.5f,1);r.anchorMax=new Vector2(.5f,1);r.pivot=new Vector2(.5f,1);r.anchoredPosition=pos;r.sizeDelta=size;var t=g.AddComponent<Text>();t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.fontSize=fs;t.fontStyle=FontStyle.Bold;t.alignment=a;t.color=Color.white;return t;}
        void ShowChapterIntro(){playing=false;dead=false;complete=false;BuildWorld();titleText.text=$"CHAPTER {chapter+1:00}  //  {titles[chapter]}";objective.text=subtitles[chapter];overlay=Panel("MARA VALE","Courier 17 · The Long Run",chapter==0?"The package is moving. So is everyone who wants it.":chapter==1?"The shard led Mara beneath District 7. Five waves. One way out.":chapter==2?"Blackline is closing in. Drive until the city runs out.":chapter==3?"Relay 9 is inside the Warden's vault. Get in. Get the truth. Get out.":"Everything comes back to the shard. Finish the run.",chapter==0?"START CHAPTER":"ENTER CHAPTER",StartChapter);}
        GameObject Panel(string kicker,string heading,string body,string button,UnityEngine.Events.UnityAction action){var p=new GameObject("Overlay");p.transform.SetParent(ui.transform,false);var r=p.AddComponent<RectTransform>();r.anchorMin=new Vector2(.5f,.5f);r.anchorMax=new Vector2(.5f,.5f);r.pivot=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(920,470);var im=p.AddComponent<Image>();im.color=new Color(.008f,.012f,.02f,.96f);var k=TxtChild(p,"Kicker",new Vector2(0,-55),new Vector2(800,35),13,TextAnchor.MiddleCenter);k.text=kicker.ToUpper();k.color=orange;var h=TxtChild(p,"Heading",new Vector2(0,-105),new Vector2(800,65),48,TextAnchor.MiddleCenter);h.text=heading;var b=TxtChild(p,"Body",new Vector2(0,-200),new Vector2(760,100),18,TextAnchor.MiddleCenter);b.text=body;b.color=new Color(.7f,.74f,.8f);var g=new GameObject("Button");g.transform.SetParent(p.transform,false);var br=g.AddComponent<RectTransform>();br.anchorMin=new Vector2(.5f,0);br.anchorMax=new Vector2(.5f,0);br.pivot=new Vector2(.5f,0);br.anchoredPosition=new Vector2(0,55);br.sizeDelta=new Vector2(330,70);var bi=g.AddComponent<Image>();bi.color=orange;var bu=g.AddComponent<Button>();bu.onClick.AddListener(action);var bt=TxtChild(g,"Label",Vector2.zero,new Vector2(330,70),17,TextAnchor.MiddleCenter);bt.text=button;bt.color=Color.black;return p;}
        Text TxtChild(GameObject p,string n,Vector2 pos,Vector2 size,int fs,TextAnchor a){var g=new GameObject(n);g.transform.SetParent(p.transform,false);var r=g.AddComponent<RectTransform>();r.anchorMin=new Vector2(.5f,1);r.anchorMax=new Vector2(.5f,1);r.pivot=new Vector2(.5f,1);r.anchoredPosition=pos;r.sizeDelta=size;var t=g.AddComponent<Text>();t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.fontSize=fs;t.fontStyle=FontStyle.Bold;t.alignment=a;t.color=Color.white;return t;}
        void StartChapter(){if(overlay)Destroy(overlay);playing=true;hp=100;xp=0;score=0;kills=0;wave=0;time=0;distance=0;spawn=0;fire=0;bossHp=500;bossAlive=false;weaponLevel=1;mara.position=new Vector3(-3,-1.4f,0);objective.text=Objective();}
        string Objective(){return modes[chapter] switch{Mode.Runner=>"REACH THE EXTRACTION POINT  ·  MOVE / JUMP / FIRE",Mode.Survivor=>"SURVIVE 6 WAVES  ·  COLLECT SHARDS  ·  EVOLVE",Mode.Getaway=>"LOSE THE HEAT  ·  DRIVE 2,000m  ·  DON'T CRASH",Mode.Dungeon=>"BREACH THE VAULT  ·  DEFEAT THE WARDEN",_=>"DEFEAT THE ARCHITECT  ·  COMPLETE MARA'S RUN"};}
        void Update(){if(!playing)return;float dt=Time.deltaTime;time+=dt;distance+=dt*5.4f;InputStep(dt);Simulate(dt);CameraStep(dt);HUDStep();if(dead){playing=false;overlay=Panel("RUN ENDED","Mara is down","The shard is still in Mara's hand. One more run.","RETRY",StartChapter);}else if(complete){playing=false;if(chapter<4){chapter++;overlay=Panel("CHAPTER COMPLETE",titles[chapter-1],"The road keeps going. Mara does too.","NEXT CHAPTER",StartChapter);}else overlay=Panel("THE LONG RUN","RUN COMPLETE","Five chapters. One courier. The story is only beginning.","PLAY AGAIN",()=>{chapter=0;StartChapter();});}}
        void InputStep(float dt){var kb=Keyboard.current;if(kb==null)return;float x=(kb.dKey.isPressed?1:0)-(kb.aKey.isPressed?1:0);mara.position+=new Vector3(x*7*dt,0,0);mara.position=new Vector3(Mathf.Clamp(mara.position.x,-7.2f,7.2f),mara.position.y,0);if(kb.spaceKey.wasPressedThisFrame)mara.position+=Vector3.up*.8f; if(kb.enterKey.wasPressedThisFrame)Fire();if(kb.eKey.wasPressedThisFrame)Fire();}
        void Simulate(float dt){spawn-=dt;fire-=dt;if(fire<=0){Fire();fire=chapter==1?0.18f:.25f;}if(spawn<=0){SpawnEnemy();spawn=chapter==1?Mathf.Max(.35f,1.2f-wave*.08f):Mathf.Max(.45f,1.35f-time*.008f);}
            for(int i=bullets.Count-1;i>=0;i--){var b=bullets[i];if(!b){bullets.RemoveAt(i);continue;}b.transform.position+=b.transform.right*16*dt;if(b.transform.position.x>15){Destroy(b);bullets.RemoveAt(i);}}
            for(int i=actors.Count-1;i>=0;i--){var a=actors[i];if(!a||!a.CompareTag("Enemy"))continue;a.transform.position+=Vector3.left*(chapter==2?5.5f:2.1f)*dt;if(Vector2.Distance(a.transform.position,mara.position)<.9f){hp-=chapter==3?12:8;Destroy(a);actors.RemoveAt(i);if(hp<=0){dead=true;return;}}if(a.transform.position.x<-10){Destroy(a);actors.RemoveAt(i);}}
            if(modes[chapter]==Mode.Runner&&distance>45)complete=true; if(modes[chapter]==Mode.Getaway&&distance>2000/5.4f)complete=true; if(modes[chapter]==Mode.Survivor&&wave>=6)complete=true; if(modes[chapter]==Mode.Dungeon&&kills>=28&&!bossAlive){bossAlive=true;SpawnBoss();} if(modes[chapter]==Mode.Final&&time>8&&!bossAlive){bossAlive=true;SpawnBoss();}if(bossAlive&&bossHp<=0)complete=true;
            if(chapter==1&&kills>0&&kills%8==0)wave=Mathf.Max(wave,kills/8);if(chapter==3&&kills>=28)wave=1;
        }
        void Fire(){if(!playing)return;var g=new GameObject("Projectile");g.transform.position=mara.position+new Vector3(.8f,.05f,0);g.transform.right=Vector2.right;var r=g.AddComponent<SpriteRenderer>();r.sprite=PixelSprite();r.color=chapter==2?cream:orange;r.sortingOrder=50;g.transform.localScale=new Vector3(chapter==4?1.2f:.7f,.08f,1);bullets.Add(g);for(int i=0;i<3;i++)Box("MuzzleFX",mara.position+new Vector3(.9f+Random.value*.25f,Random.Range(-.12f,.12f),0),new Vector2(.18f,.05f),cream,51);}
        void SpawnEnemy(){if(chapter==2){var e=Box("Enemy Car",new Vector2(9,Random.Range(-1.8f,1.2f)),new Vector2(2.1f,.85f),new Color(.6f,.08f,.1f),35);e.tag="Enemy";return;}var e2=Box("Enemy",new Vector2(9,Random.Range(-1.8f,1.6f)),new Vector2(chapter==3?1.25f:chapter==4?1.5f:.85f,chapter==3?1.8f:chapter==4?1.5f:.95f),chapter==3?new Color(.55f,.15f,.75f):chapter==4?new Color(.65f,.08f,.12f):new Color(.18f,.38f,.48f),35);e2.tag="Enemy";}
        void SpawnBoss(){var b=Box("BOSS",new Vector2(6,0),new Vector2(2.8f,3.2f),chapter==4?new Color(.72f,.08f,.12f):new Color(.45f,.18f,.65f),36);b.tag="Enemy";}
        void CameraStep(float dt){if(!cam)return;float target=mara.position.x+2.4f;cam.transform.position=Vector3.Lerp(cam.transform.position,new Vector3(target,0,-20),dt*4f);}
        void HUDStep(){titleText.text=$"CHAPTER {chapter+1:00}  //  {titles[chapter]}";hud.text=$"MARA  ♥ {Mathf.Max(0,hp)}   XP {xp}   KILLS {kills}   SCORE {score}   WEAPON {weaponLevel}";if(modes[chapter]==Mode.Survivor)hud.text+=$"   WAVE {Mathf.Min(6,wave)}/6";objective.text=Objective();}
    }
}

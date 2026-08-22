using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace SmallGameLab.TheLongRun
{
    /// <summary>
    /// Chapter 1 runtime slice. The scene is generated at runtime so we can iterate quickly
    /// while keeping the production game portable across desktop, iOS and Android.
    /// </summary>
    public sealed class Stage1Bootstrap : MonoBehaviour
    {
        const float GroundY = -2.55f;
        const float PlayerY = -1.05f;
        const float RunSpeed = 5.4f;
        const float CameraLead = 2.6f;

        readonly List<GameObject> enemies = new();
        readonly List<GameObject> effects = new();
        readonly List<GameObject> worldPieces = new();
        readonly List<GameObject> pickups = new();
        Transform mara;
        Rigidbody2D maraBody;
        SpriteRenderer maraSprite;
        Transform weaponRoot;
        SpriteRenderer weapon;
        Camera cam;
        Canvas canvas;
        Text hud;
        Text banner;
        Text objective;
        GameObject startPanel;
        GameObject gameOverPanel;
        Slider hpBar;
        Slider xpBar;
        float fireTimer;
        float spawnTimer;
        float worldDistance;
        float elapsed;
        float shake;
        int kills;
        int xp;
        int level = 1;
        int hp = 100;
        int score;
        bool started;
        bool dead;
        bool facingRight = true;
        bool jumping;
        readonly Color orange = new(.95f, .27f, .12f);
        readonly Color gold = new(1f, .68f, .22f);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            if (FindFirstObjectByType<Stage1Bootstrap>() == null)
                new GameObject("THE LONG RUN · CHAPTER 01").AddComponent<Stage1Bootstrap>();
        }

        void Start()
        {
            Application.targetFrameRate = 60;
            BuildWorld();
            BuildUI();
            ShowStart();
        }

        void BuildWorld()
        {
            cam = new GameObject("Main Camera").AddComponent<Camera>();
            cam.orthographic = true;
            cam.orthographicSize = 5.15f;
            cam.transform.position = new Vector3(0, .35f, -20);
            cam.backgroundColor = new Color(.012f, .018f, .03f);

            CreateSky();
            CreateCityLayer(-12f, .82f, 28, 2.0f, 5.8f, new Color(.035f, .05f, .075f), new Color(.98f, .33f, .16f, .35f), -10);
            CreateCityLayer(-9f, .55f, 22, 1.7f, 4.2f, new Color(.06f, .075f, .10f), new Color(1f, .62f, .25f, .55f), -8);
            CreateGround();
            CreateStreetFurniture();

            mara = new GameObject("Mara · Courier 17").transform;
            mara.position = new Vector3(-4.5f, PlayerY, 0);
            maraSprite = mara.gameObject.AddComponent<SpriteRenderer>();
            maraSprite.sprite = Resources.Load<Sprite>("Art/Mara/mara");
            maraSprite.sortingOrder = 40;
            mara.localScale = Vector3.one * .62f;

            maraBody = mara.gameObject.AddComponent<Rigidbody2D>();
            maraBody.gravityScale = 4.1f;
            maraBody.freezeRotation = true;
            maraBody.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            var bodyCollider = mara.gameObject.AddComponent<CapsuleCollider2D>();
            bodyCollider.size = new Vector2(1.15f, 2.35f);
            bodyCollider.offset = new Vector2(0, -.05f);

            weaponRoot = new GameObject("Raven SMG").transform;
            weaponRoot.SetParent(mara, false);
            weaponRoot.localPosition = new Vector3(.72f, .03f, -.1f);
            weapon = weaponRoot.gameObject.AddComponent<SpriteRenderer>();
            weapon.sprite = Resources.Load<Sprite>("Art/Weapons/raven-smg");
            weapon.sortingOrder = 45;
            weaponRoot.localScale = Vector3.one * .0115f;
        }

        void CreateSky()
        {
            CreateBox("Sky", new Vector2(10, 1.2f), new Vector2(70, 20), new Color(.012f, .022f, .04f), -20);
            CreateBox("Moon", new Vector2(9, 4.8f), new Vector2(1.75f, 1.75f), new Color(1f, .55f, .25f, .9f), -19);
            CreateBox("MoonGlow", new Vector2(9, 4.8f), new Vector2(3.4f, 3.4f), new Color(1f, .28f, .12f, .08f), -21);
            for (int i = 0; i < 85; i++)
            {
                float x = -15 + i * .82f;
                float y = 2.2f + Mathf.Abs(Mathf.Sin(i * 19.17f)) * 4.2f;
                CreateBox("Star", new Vector2(x, y), new Vector2(.025f, .025f), new Color(1f, .75f, .55f, .55f), -18);
            }
        }

        void CreateCityLayer(float baseY, float depth, int count, float minW, float maxH, Color building, Color window, int order)
        {
            for (int i = -8; i < count; i++)
            {
                float width = minW + Mathf.Abs(Mathf.Sin(i * 8.73f)) * 1.3f;
                float height = 2.2f + Mathf.Abs(Mathf.Sin(i * 3.11f)) * maxH;
                float x = i * (2.5f + depth * .45f);
                var b = CreateBox("CityBlock", new Vector2(x, baseY + height / 2f), new Vector2(width, height), building, order);
                for (int w = 0; w < Mathf.Max(2, Mathf.FloorToInt(width * 1.7f)); w++)
                {
                    float wx = b.transform.position.x - width * .35f + w * .34f;
                    for (int row = 0; row < Mathf.FloorToInt(height * .9f); row++)
                        if ((w + row + i) % 3 != 0) CreateBox("Window", new Vector2(wx, baseY + .6f + row * .52f), new Vector2(.11f, .18f), window, order + 1);
                }
            }
        }

        void CreateGround()
        {
            for (int i = -10; i < 80; i++)
            {
                float x = i * 3.2f;
                var street = CreateBox("StreetSegment", new Vector2(x, GroundY), new Vector2(3.25f, .7f), new Color(.065f, .075f, .09f), 4);
                street.AddComponent<BoxCollider2D>();
                CreateBox("Kerb", new Vector2(x, GroundY + .38f), new Vector2(3.25f, .09f), new Color(.22f, .25f, .29f), 5);
                CreateBox("RoadMark", new Vector2(x, GroundY - .04f), new Vector2(1.0f, .045f), new Color(1f, .55f, .2f, .38f), 5);
                worldPieces.Add(street);
            }
            CreatePlatform("Rooftop", new Vector2(10, .05f), new Vector2(7, .32f), new Color(.10f, .12f, .15f));
            CreatePlatform("Rooftop2", new Vector2(20, 1.15f), new Vector2(5, .32f), new Color(.10f, .12f, .15f));
        }

        void CreateStreetFurniture()
        {
            for (int i = 0; i < 25; i++)
            {
                float x = -8 + i * 3.9f;
                CreateBox("LampPole", new Vector2(x, -.55f), new Vector2(.08f, 2.8f), new Color(.12f, .14f, .17f), 8);
                CreateBox("Lamp", new Vector2(x, .82f), new Vector2(.38f, .10f), new Color(1f, .52f, .18f, .9f), 9);
            }
        }

        GameObject CreateBox(string name, Vector2 pos, Vector2 size, Color color, int order = 0)
        {
            var go = new GameObject(name); go.transform.position = pos; go.transform.localScale = size;
            var sr = go.AddComponent<SpriteRenderer>(); sr.sprite = Sprite.Create(Texture2D.whiteTexture, new Rect(0, 0, 1, 1), new Vector2(.5f, .5f)); sr.color = color; sr.sortingOrder = order;
            return go;
        }

        void CreatePlatform(string name, Vector2 pos, Vector2 size, Color color)
        {
            var g = CreateBox(name, pos, size, color, 6); g.AddComponent<BoxCollider2D>();
        }

        void BuildUI()
        {
            canvas = new GameObject("HUD").AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvas.gameObject.AddComponent<CanvasScaler>(); scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize; scaler.referenceResolution = new Vector2(1920, 1080);
            canvas.gameObject.AddComponent<GraphicRaycaster>();
            if (FindFirstObjectByType<EventSystem>() == null) new GameObject("EventSystem", typeof(EventSystem), typeof(InputSystemUIInputModule));

            hud = MakeText(canvas.transform, "HUD", new Vector2(0, -34), new Vector2(1760, 54), 25, TextAnchor.MiddleLeft);
            banner = MakeText(canvas.transform, "Banner", new Vector2(0, -115), new Vector2(1500, 70), 34, TextAnchor.MiddleCenter); banner.color = orange;
            objective = MakeText(canvas.transform, "Objective", new Vector2(0, -82), new Vector2(1500, 36), 15, TextAnchor.MiddleCenter); objective.color = new Color(1f, .72f, .4f);
            hpBar = MakeBar(canvas.transform, new Vector2(-670, -92), new Color(.88f, .16f, .12f));
            xpBar = MakeBar(canvas.transform, new Vector2(-670, -122), new Color(1f, .57f, .15f));
        }

        Slider MakeBar(Transform parent, Vector2 pos, Color fillColor)
        {
            var root = new GameObject("Bar"); root.transform.SetParent(parent, false);
            var rt = root.AddComponent<RectTransform>(); rt.anchorMin = new Vector2(.5f, 1); rt.anchorMax = new Vector2(.5f, 1); rt.pivot = new Vector2(.5f, 1); rt.anchoredPosition = pos; rt.sizeDelta = new Vector2(280, 14);
            var slider = root.AddComponent<Slider>(); slider.interactable = false; slider.minValue = 0; slider.maxValue = 100;
            var bg = CreateUIImage(root.transform, "Background", new Color(.02f, .025f, .035f, .95f)); bg.rectTransform.anchorMin = Vector2.zero; bg.rectTransform.anchorMax = Vector2.one; bg.rectTransform.sizeDelta = Vector2.zero;
            var fill = CreateUIImage(root.transform, "Fill", fillColor); fill.rectTransform.anchorMin = Vector2.zero; fill.rectTransform.anchorMax = Vector2.one; fill.rectTransform.sizeDelta = Vector2.zero; slider.fillRect = fill.rectTransform;
            return slider;
        }

        Image CreateUIImage(Transform parent, string name, Color color)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false); var image = go.AddComponent<Image>(); image.color = color; return image;
        }

        Text MakeText(Transform parent, string name, Vector2 pos, Vector2 size, int font, TextAnchor anchor)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>(); rt.anchorMin = new Vector2(.5f, 1); rt.anchorMax = new Vector2(.5f, 1); rt.pivot = new Vector2(.5f, 1); rt.anchoredPosition = pos; rt.sizeDelta = size;
            var t = go.AddComponent<Text>(); t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); t.fontSize = font; t.alignment = anchor; t.fontStyle = FontStyle.Bold; t.raycastTarget = false; return t;
        }

        void ShowStart()
        {
            started = false; dead = false; banner.text = "THE LONG RUN"; objective.text = "CHAPTER 01  ·  THE DELIVERY";
            startPanel = MakePanel("START", "MARA VALE  //  COURIER 17", "RUN THE ROOFTOPS. DELIVER THE PACKAGE. DO NOT GET CAUGHT.", "START RUN", StartRun);
        }

        GameObject MakePanel(string name, string title, string body, string buttonText, UnityEngine.Events.UnityAction action)
        {
            var panel = new GameObject(name); panel.transform.SetParent(canvas.transform, false);
            var rt = panel.AddComponent<RectTransform>(); rt.anchorMin = new Vector2(.5f, .5f); rt.anchorMax = new Vector2(.5f, .5f); rt.pivot = new Vector2(.5f, .5f); rt.sizeDelta = new Vector2(850, 430);
            var bg = panel.AddComponent<Image>(); bg.color = new Color(.018f, .022f, .03f, .96f);
            var titleText = MakeText(panel.transform, "Title", new Vector2(0, -55), new Vector2(760, 70), 48, TextAnchor.MiddleCenter); titleText.text = title; titleText.color = orange;
            var bodyText = MakeText(panel.transform, "Body", new Vector2(0, -145), new Vector2(690, 110), 18, TextAnchor.MiddleCenter); bodyText.text = body; bodyText.color = new Color(.7f, .73f, .78f);
            var button = new GameObject("Button"); button.transform.SetParent(panel.transform, false); var br = button.AddComponent<RectTransform>(); br.anchorMin = new Vector2(.5f, 0); br.anchorMax = new Vector2(.5f, 0); br.pivot = new Vector2(.5f, 0); br.anchoredPosition = new Vector2(0, 55); br.sizeDelta = new Vector2(330, 68);
            var bi = button.AddComponent<Image>(); bi.color = orange; var b = button.AddComponent<Button>(); b.onClick.AddListener(action);
            var bt = MakeText(button.transform, "Label", Vector2.zero, new Vector2(330, 68), 18, TextAnchor.MiddleCenter); bt.text = buttonText; bt.color = Color.black;
            return panel;
        }

        void StartRun()
        {
            if (startPanel) Destroy(startPanel); if (gameOverPanel) Destroy(gameOverPanel);
            started = true; dead = false; hp = 100; xp = 0; level = 1; kills = 0; score = 0; elapsed = 0; worldDistance = 0; spawnTimer = .5f;
            mara.position = new Vector3(-4.5f, PlayerY, 0); maraBody.linearVelocity = Vector2.zero;
            banner.text = "RUNNING // DISTRICT 7"; objective.text = "DELIVER THE PACKAGE  ·  SURVIVE THE PURSUIT"; Invoke(nameof(ClearBanner), 2.1f);
        }

        void Update()
        {
            if (!mara || !maraBody || !started || dead) return;
            float dt = Time.deltaTime; elapsed += dt; worldDistance += RunSpeed * dt;
            var kb = Keyboard.current;
            float move = 1f;
            bool left = kb != null && (kb.aKey.isPressed || kb.leftArrowKey.isPressed);
            bool right = kb != null && (kb.dKey.isPressed || kb.rightArrowKey.isPressed);
            if (left) move = -.2f; if (right) move = 1.15f;
            maraBody.linearVelocity = new Vector2(Mathf.MoveTowards(maraBody.linearVelocity.x, RunSpeed * move, 30f * dt), maraBody.linearVelocity.y);
            bool jump = kb != null && (kb.spaceKey.wasPressedThisFrame || kb.wKey.wasPressedThisFrame || kb.upArrowKey.wasPressedThisFrame);
            if (jump && Mathf.Abs(maraBody.linearVelocity.y) < .2f) { maraBody.linearVelocity = new Vector2(maraBody.linearVelocity.x, 10.8f); jumping = true; }
            if (maraBody.position.y < GroundY - 2f) DamageMara(35);
            if (Mathf.Abs(maraBody.linearVelocity.y) < .2f) jumping = false;

            if (Mathf.Abs(maraBody.linearVelocity.x) > .5f)
            {
                float bob = Mathf.Sin(elapsed * 18f) * (jumping ? .02f : .055f); maraSprite.transform.localPosition = new Vector3(0, bob, 0);
                float squash = 1f + Mathf.Sin(elapsed * 18f) * .025f; mara.localScale = new Vector3(.62f / squash, .62f * squash, 1);
            }
            else mara.localScale = Vector3.one * .62f;
            if (Mathf.Abs(maraBody.linearVelocity.x) > .1f) { facingRight = maraBody.linearVelocity.x >= 0; maraSprite.flipX = !facingRight; }
            weaponRoot.localPosition = new Vector3(facingRight ? .72f : -.72f, .03f, -.1f); weaponRoot.localScale = new Vector3(facingRight ? .0115f : -.0115f, .0115f, .0115f);

            fireTimer -= dt; bool firing = kb != null && (kb.jKey.isPressed || kb.kKey.isPressed) || Mouse.current != null && Mouse.current.leftButton.isPressed; if (firing) Fire();
            cam.transform.position = Vector3.Lerp(cam.transform.position, new Vector3(mara.position.x + CameraLead, .25f, -20), 1f - Mathf.Exp(-6f * dt));
            if (shake > 0) { shake -= dt; cam.transform.position += (Vector3)Random.insideUnitCircle * shake; }
            spawnTimer -= dt; if (spawnTimer <= 0) { SpawnEnemy(); spawnTimer = Mathf.Max(.42f, 1.05f - level * .045f) + Random.Range(-.12f, .18f); }
            UpdateEnemies(dt); UpdatePickups(dt); UpdateHUD();
        }

        void UpdateEnemies(float dt)
        {
            for (int i = enemies.Count - 1; i >= 0; i--)
            {
                var e = enemies[i]; if (!e) { enemies.RemoveAt(i); continue; }
                var h = e.GetComponent<EnemyHealth>(); if (!h) continue;
                float dx = mara.position.x - e.transform.position.x; float dy = mara.position.y - e.transform.position.y; float speed = h.brute ? .85f + level * .02f : 1.45f + level * .035f;
                e.transform.position += new Vector3(Mathf.Sign(dx) * speed * dt, Mathf.Sign(dy) * speed * .35f * dt, 0);
                float pulse = 1f + Mathf.Sin(elapsed * (h.brute ? 5f : 9f) + i) * .035f; e.transform.localScale = Vector3.one * (h.brute ? .78f : .62f) * pulse;
                if (Vector2.Distance(e.transform.position, mara.position) < (h.brute ? 1.35f : 1.0f)) { DamageMara(h.brute ? 20 : 9); Destroy(e); enemies.RemoveAt(i); continue; }
                if (e.transform.position.x < mara.position.x - 10f) { Destroy(e); enemies.RemoveAt(i); }
            }
        }

        void Fire()
        {
            if (fireTimer > 0) return; fireTimer = Mathf.Max(.075f, .14f - level * .003f);
            Vector3 muzzle = mara.position + new Vector3(facingRight ? 1.48f : -1.48f, .02f, 0);
            for (int i = 0; i < 2; i++) { var flash = CreateBox("MuzzleFlash", muzzle + new Vector3(facingRight ? .14f : -.14f, Random.Range(-.08f, .08f), 0), new Vector2(.34f, .22f), i == 0 ? gold : orange, 60); flash.transform.localRotation = Quaternion.Euler(0, 0, Random.Range(-25f, 25f)); Destroy(flash, .045f); }
            var tracer = CreateBox("RavenTracer", muzzle, new Vector2(.62f, .045f), new Color(1f, .76f, .32f, .95f), 58); var projectile = tracer.AddComponent<Projectile>(); projectile.direction = facingRight ? Vector2.right : Vector2.left; projectile.speed = 24f; projectile.damage = 20 + level * 2;
            weaponRoot.localRotation = Quaternion.Euler(0, 0, facingRight ? -4f : 4f); Invoke(nameof(ResetWeapon), .055f);
        }

        void ResetWeapon() { if (weaponRoot) weaponRoot.localRotation = Quaternion.identity; }

        void SpawnEnemy()
        {
            bool brute = Random.value < Mathf.Clamp(.12f + level * .015f, .12f, .28f); float x = mara.position.x + Random.Range(10f, 15f); float y = GroundY + (brute ? 1.15f : 1.0f);
            var g = new GameObject(brute ? "BRUTE" : "SCOUT"); g.transform.position = new Vector3(x, y, 0); var sr = g.AddComponent<SpriteRenderer>(); sr.sprite = Resources.Load<Sprite>(brute ? "Art/Enemies/brute" : "Art/Enemies/scout"); sr.sortingOrder = 35; sr.flipX = true;
            var h = g.AddComponent<EnemyHealth>(); h.hp = brute ? 85 + level * 6 : 34 + level * 3; h.maxHp = h.hp; h.brute = brute; enemies.Add(g);
        }

        public void HitEnemy(GameObject target, int damage)
        {
            var h = target ? target.GetComponent<EnemyHealth>() : null; if (!h) return; h.hp -= damage; SpawnHitFX(target.transform.position, h.hp <= 0);
            if (h.hp <= 0) { kills++; xp += h.brute ? 32 : 14; score += h.brute ? 250 : 100; shake = .06f; enemies.Remove(target); DropPickup(target.transform.position, h.brute ? 2 : 1); Destroy(target); if (xp >= level * 90) { xp = 0; level++; banner.text = $"LEVEL {level}  //  RAVEN UPGRADED"; Invoke(nameof(ClearBanner), 1.5f); } }
        }

        void SpawnHitFX(Vector3 pos, bool kill)
        {
            for (int i = 0; i < (kill ? 7 : 3); i++) { var p = CreateBox("HitSpark", pos, new Vector2(Random.Range(.05f, .15f), Random.Range(.05f, .15f)), kill ? gold : orange, 55); p.transform.rotation = Quaternion.Euler(0, 0, Random.Range(0, 360)); effects.Add(p); Destroy(p, .16f + Random.value * .16f); }
        }

        void DropPickup(Vector3 pos, int value)
        {
            if (Random.value > .34f) return; var p = CreateBox("Shard", pos + Vector3.up * .2f, new Vector2(.18f, .18f), gold, 50); p.transform.rotation = Quaternion.Euler(0, 0, 45); pickups.Add(p); p.AddComponent<Pickup>().value = value;
        }

        void UpdatePickups(float dt)
        {
            for (int i = pickups.Count - 1; i >= 0; i--)
            {
                var p = pickups[i]; if (!p) { pickups.RemoveAt(i); continue; }
                p.transform.position += Vector3.up * Mathf.Sin(elapsed * 6f + i) * dt * .35f; p.transform.Rotate(0, 0, 180f * dt);
                if (Vector2.Distance(p.transform.position, mara.position) < 1.1f) { var data = p.GetComponent<Pickup>(); xp += data.value * 5; score += data.value * 50; Destroy(p); pickups.RemoveAt(i); }
            }
        }

        void DamageMara(int amount)
        {
            if (!started || dead) return; hp = Mathf.Max(0, hp - amount); shake = .16f; SpawnHitFX(mara.position, false); if (hp <= 0) EndRun();
        }

        void EndRun()
        {
            dead = true; started = false; maraBody.linearVelocity = Vector2.zero; banner.text = "RUN OVER"; objective.text = $"SCORE {score:000000}  ·  TAKEDOWNS {kills:000}  ·  DISTANCE {worldDistance:000}m";
            gameOverPanel = MakePanel("GAME OVER", "MARA IS DOWN", $"DISTRICT 7 GOT YOU.  SCORE {score:000000}\nTAKEDOWNS {kills:000}  ·  LEVEL {level:00}", "RUN AGAIN", StartRun);
        }

        void UpdateHUD()
        {
            if (!hud) return; hud.text = $"MARA VALE     ♥ {hp:000}     LV {level:00}     XP {xp:000}     TAKEDOWNS {kills:000}     SCORE {score:000000}     {worldDistance:000}m";
            if (hpBar) hpBar.value = hp; if (xpBar) xpBar.value = Mathf.Clamp01((float)xp / Mathf.Max(1, level * 90)) * 100f;
        }

        void ClearBanner() { if (banner && started) banner.text = ""; }
    }

    public sealed class Projectile : MonoBehaviour
    {
        public Vector2 direction = Vector2.right; public float speed = 22f; public int damage = 20; float life = 1.1f;
        void Update()
        {
            transform.position += (Vector3)(direction.normalized * speed * Time.deltaTime); life -= Time.deltaTime; if (life <= 0) { Destroy(gameObject); return; }
            foreach (var enemy in FindObjectsByType<EnemyHealth>(FindObjectsSortMode.None)) if (Vector2.Distance(transform.position, enemy.transform.position) < .62f) { FindFirstObjectByType<Stage1Bootstrap>()?.HitEnemy(enemy.gameObject, damage); Destroy(gameObject); return; }
        }
    }

    public sealed class EnemyHealth : MonoBehaviour { public int hp = 30; public int maxHp = 30; public bool brute; }
    public sealed class Pickup : MonoBehaviour { public int value = 1; }
}

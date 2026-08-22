# The Long Run — Unity production build

Unity 6.3 LTS production target. The existing Next.js site remains the Small Game Lab front door; this folder is the native game production project.

## Stage 1
- Mara movement: run, jump, dash, facing
- weapon architecture: sidearm, SMG, shotgun
- distinct projectile behaviour
- health/damage
- enemy archetypes and pursuit AI
- XP/score/level progression
- responsive camera
- enemy spawning
- mobile-ready architecture target

## Art direction
Premium 2D side-scrolling run-and-gun. 80s/90s arcade readability, manga/cartoon character language, strong silhouettes, exaggerated muzzle flashes, readable projectiles and impact feedback. Bombastic Brothers is a gameplay/style reference, not an asset source or visual copy.

## Production rule
Use external assets only when their licence permits commercial incorporation. Record every imported asset in `docs/ASSET-LICENCE-LEDGER.md`.

## Build target
iOS + Android first, with a browser showcase/demo through the Small Game Lab website.

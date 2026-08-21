export type MobileAction = "left" | "right" | "jump" | "dash" | "attack" | "brake" | "boost" | "interact";

export type TouchInput = {
  action: MobileAction;
  pressed: boolean;
  timestamp: number;
};

export const mobileDesign = {
  minimumHitTarget: 48,
  safeAreaAware: true,
  orientation: "landscape" as const,
  inputLatencyTargetMs: 50,
  actions: ["left", "right", "jump", "dash", "attack", "brake", "boost", "interact"] as MobileAction[],
};

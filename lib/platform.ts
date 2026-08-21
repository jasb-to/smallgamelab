export type GameStatus = "live" | "coming-soon";
export type SessionStatus = "active" | "settled" | "cancelled";

export type Game = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: GameStatus;
  version: string;
};

export type Operator = {
  id: string;
  name: string;
  environment: "sandbox";
  apiKey: string;
};

export type Session = {
  id: string;
  operatorId: string;
  gameId: string;
  playerId: string;
  status: SessionStatus;
  balance: number;
  startedAt: string;
};

export type LedgerEvent = {
  id: string;
  sessionId: string;
  type: "authenticate" | "bet" | "win" | "rollback";
  amount: number;
  balanceAfter: number;
  createdAt: string;
};

export const games: Game[] = [
  { id: "sgl-001", slug: "last-stand", name: "Last Stand", category: "Action / Strategy", status: "live", version: "0.5" },
  { id: "sgl-002", slug: "game-002", name: "Game 002", category: "Coming soon", status: "coming-soon", version: "0.1" },
];

export const demoOperator: Operator = {
  id: "op-demo-001",
  name: "Small Game Lab Demo Operator",
  environment: "sandbox",
  apiKey: "sgl_demo_••••••••••••",
};

export const demoSessions: Session[] = [
  { id: "ses_8f21", operatorId: demoOperator.id, gameId: "sgl-001", playerId: "player_1042", status: "active", balance: 982.4, startedAt: "2026-08-21T21:42:00Z" },
  { id: "ses_7c12", operatorId: demoOperator.id, gameId: "sgl-001", playerId: "player_0881", status: "settled", balance: 1240.0, startedAt: "2026-08-21T21:31:00Z" },
];

export const demoEvents: LedgerEvent[] = [
  { id: "evt_001", sessionId: "ses_8f21", type: "authenticate", amount: 0, balanceAfter: 1000, createdAt: "2026-08-21T21:42:01Z" },
  { id: "evt_002", sessionId: "ses_8f21", type: "bet", amount: -20, balanceAfter: 980, createdAt: "2026-08-21T21:42:08Z" },
  { id: "evt_003", sessionId: "ses_8f21", type: "win", amount: 2.4, balanceAfter: 982.4, createdAt: "2026-08-21T21:42:13Z" },
];

export function money(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);
}

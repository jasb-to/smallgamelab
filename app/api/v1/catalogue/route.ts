import { games } from "../../../../../lib/platform";

export async function GET() {
  return Response.json({ environment: "sandbox", games, generatedAt: new Date().toISOString() });
}

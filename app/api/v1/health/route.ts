export async function GET() {
  return Response.json({ status: "ok", environment: "sandbox", service: "small-game-lab-platform", version: "0.1.0" });
}

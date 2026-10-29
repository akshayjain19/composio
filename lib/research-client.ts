import { ResearchRequestSchema, ResearchResponseSchema, type ResearchRequest, type ResearchResponse } from "./schema";

export async function startResearch(input: ResearchRequest & {regenerate?:boolean}, onMilestone: (phase: string) => void): Promise<ResearchResponse & {guideId?:string;generatedAt?:string;cached?:boolean}> {
  const validated = ResearchRequestSchema.parse({provider:input.provider});
  const response = await fetch("/api/research", { method: "POST", headers: { "content-type": "application/json", accept: "text/event-stream" }, body: JSON.stringify({...validated,regenerate:input.regenerate===true}), signal: AbortSignal.timeout(130_000) });
  if (!response.ok || !response.body) {
    const message = await response.text();
    throw new Error(message || `Research failed (${response.status}).`);
  }
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = "";
  while (true) {
    const { value, done } = await reader.read(); pending += decoder.decode(value, { stream: !done });
    const records = pending.split("\n\n"); pending = records.pop() ?? "";
    for (const record of records) {
      const event = record.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
      if (!event) continue;
      const parsed = JSON.parse(event) as { type: string; phase?: string; data?: unknown; message?: string; guideId?:string; generatedAt?:string; cached?:boolean };
      if (parsed.type === "milestone" && parsed.phase) onMilestone(parsed.phase);
      if (parsed.type === "result") return {...ResearchResponseSchema.parse(parsed.data),guideId:typeof parsed.guideId==="string"?parsed.guideId:undefined,generatedAt:typeof parsed.generatedAt==="string"?parsed.generatedAt:undefined,cached:parsed.cached===true};
      if (parsed.type === "error") throw new Error(parsed.message ?? "Research failed.");
    }
    if (done) break;
  }
  throw new Error("Research ended before a result was returned.");
}

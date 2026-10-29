import { z } from "zod";

export const EvidenceStatusSchema = z.enum(["verified_from_docs", "observed_in_setup", "inferred", "unverified"]);
export const EvidenceSchema = z.object({
  id: z.string().default("seed-source"), title: z.string(), url: z.url().refine((value) => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }),
  supports: z.array(z.string()), checkedAt: z.string().default("not independently date-stamped"), status: EvidenceStatusSchema.default("unverified"),
  // Backwards-compatible with the existing provider card rendering.
  verified: z.boolean(),
});
export const ProviderSchema = z.object({
  slug: z.string(), name: z.string(), initials: z.string(), color: z.string(), category: z.string(), officialWebsite: z.string().nullable().optional(),
  authAvailability: z.enum(["OAuth 2.0", "OAuth 2.0 + OIDC", "Unknown"]), oauthSupport: z.enum(["supported", "unsupported", "unknown"]).optional(),
  managedOAuth: z.enum(["Available", "Unknown", "Not available"]), recommendation: z.string(),
  complexity: z.enum(["Low", "Moderate", "High", "Unknown"]), complexityReasoning: z.string().optional(), effort: z.string(), effortBasis: z.string().optional(),
  approvalWait: z.string(), approvalWaitBasis: z.string().optional(), summary: z.string(), prerequisites: z.array(z.string()),
  setupSteps: z.array(z.object({ title: z.string(), description: z.string(), actor: z.enum(["Agent", "Developer"]), evidenceIndex: z.number().optional(), evidenceIds: z.array(z.string()).optional(), status: EvidenceStatusSchema.optional() })),
  scopes: z.array(z.string()), redirect: z.string(), testing: z.array(z.string()), distribution: z.string(),
  blockers: z.array(z.object({ title: z.string(), description: z.string(), resolution: z.string().optional(), evidenceIds: z.array(z.string()).optional() })),
  agentCan: z.array(z.string()), developerMust: z.array(z.string()), evidence: z.array(EvidenceSchema), confidence: z.enum(["Researched", "Partially researched", "Unverified"]),
  limitations: z.array(z.string()), nextAction: z.string(), researchedAt: z.string().nullable(),
});
export type Provider = z.infer<typeof ProviderSchema>;

const privateIpv4=(host:string)=>{const parts=host.split(".").map(Number);if(parts.length!==4||parts.some(n=>!Number.isInteger(n)||n<0||n>255))return false;return parts[0]===10||parts[0]===127||parts[0]===0||(parts[0]===169&&parts[1]===254)||(parts[0]===172&&parts[1]>=16&&parts[1]<=31)||(parts[0]===192&&parts[1]===168||(parts[0]===100&&parts[1]>=64&&parts[1]<=127));};
function isSafeProviderInput(value:string){if(!/^https?:\/\//i.test(value))return !/^(localhost|.*\.localhost|.*\.local)$/i.test(value);try{const url=new URL(value);const host=url.hostname.toLowerCase().replace(/^\[|\]$/g,"");if(url.protocol!=="https:"||url.username||url.password)return false;if(host==="localhost"||host.endsWith(".localhost")||host.endsWith(".local")||host==="::1"||host.startsWith("fc")||host.startsWith("fd")||host.startsWith("fe80:"))return false;if(privateIpv4(host))return false;return true}catch{return false}}
export const ResearchRequestSchema = z.object({ provider: z.string().trim().min(1).max(160).refine(isSafeProviderInput,"Use a provider name or public HTTPS website; local and private network URLs are not allowed.") }).strict();
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;
export const ResearchResponseSchema = z.object({
  status: z.enum(["complete", "unsupported", "ambiguous"]), guide: ProviderSchema.optional(), candidates: z.array(z.string()).optional(), message: z.string().optional(),guideId:z.string().optional(),generatedAt:z.string().optional(),cached:z.boolean().optional(),
});
export type ResearchResponse = z.infer<typeof ResearchResponseSchema>;
export const ResearchResultSchema = z.discriminatedUnion("status",[
  z.object({status:z.literal("complete"),guide:ProviderSchema,message:z.string().optional()}),
  z.object({status:z.literal("unsupported"),guide:ProviderSchema,message:z.string().optional()}),
  z.object({status:z.literal("ambiguous"),guide:z.null(),candidates:z.array(z.string()),message:z.string().optional()}),
]);
export type ResearchEvent = { type: "milestone"; phase: string } | { type: "result"; data: ResearchResponse; guideId?: string; generatedAt?: string; cached?: boolean } | { type: "error"; code: string; message: string };

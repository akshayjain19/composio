import { describe, expect, it } from "vitest";
import { providers } from "@/lib/providers";
import { validateGuide } from "@/lib/guide-validation";
import { ResearchResultSchema } from "@/lib/schema";

const guide=providers[0];
describe("guide validation",()=>{
  it("accepts a seeded guide",()=>{expect(validateGuide(guide).slug).toBe("github")});
  it("rejects unsupported result without a guide",()=>{expect(ResearchResultSchema.safeParse({status:"unsupported",message:"No official OAuth documentation found."}).success).toBe(false)});
  it("rejects references to evidence IDs not present in the source list",()=>{const invalid={...guide,setupSteps:[{...guide.setupSteps[0],evidenceIds:["missing-source"]}]};expect(()=>validateGuide(invalid)).toThrow(/missing evidence/)});
  it("rejects a failed research result as a completed result",()=>{expect(ResearchResultSchema.safeParse({status:"complete",message:"Research failed."}).success).toBe(false)});
});

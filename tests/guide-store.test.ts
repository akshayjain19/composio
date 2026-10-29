import { beforeEach, describe, expect, it, vi } from "vitest";

const {supabaseAdmin}=vi.hoisted(()=>({supabaseAdmin:vi.fn()}));
vi.mock("@/lib/supabase-admin",()=>({supabaseAdmin}));
import { getGuide } from "@/lib/guide-store";
import { providers } from "@/lib/providers";

describe("saved guide retrieval",()=>{
  beforeEach(()=>{vi.clearAllMocks()});
  it("returns null for a missing guide",async()=>{
    const maybeSingle=vi.fn().mockResolvedValue({data:null,error:null});const eq=vi.fn(()=>({maybeSingle}));const select=vi.fn(()=>({eq}));supabaseAdmin.mockReturnValue({from:vi.fn(()=>({select}))});
    await expect(getGuide("00000000-0000-4000-8000-000000000001")).resolves.toBeNull();
  });
  it("retrieves and validates a stored guide",async()=>{
    const record={id:"00000000-0000-4000-8000-000000000001",provider_id:"00000000-0000-4000-8000-000000000002",guide_json:providers[0],research_status:"complete",generated_at:"2026-10-28T00:00:00Z",updated_at:"2026-10-28T00:00:00Z"};
    const maybeSingle=vi.fn().mockResolvedValue({data:record,error:null});const eq=vi.fn(()=>({maybeSingle}));const select=vi.fn(()=>({eq}));supabaseAdmin.mockReturnValue({from:vi.fn(()=>({select}))});
    const saved=await getGuide(record.id);expect(saved?.guide.name).toBe("GitHub");expect(saved?.generatedAt).toBe(record.generated_at);
  });
  it("rejects a failed database read",async()=>{
    const maybeSingle=vi.fn().mockResolvedValue({data:null,error:{message:"connection refused"}});const eq=vi.fn(()=>({maybeSingle}));const select=vi.fn(()=>({eq}));supabaseAdmin.mockReturnValue({from:vi.fn(()=>({select}))});
    await expect(getGuide("00000000-0000-4000-8000-000000000001")).rejects.toThrow("Could not load guide");
  });
});

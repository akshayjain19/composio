import "server-only";
import type { Provider } from "@/lib/schema";
import { validateGuide } from "@/lib/guide-validation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const GUIDE_SCHEMA_VERSION=1;
export type SavedGuide={id:string;providerId:string;guide:Provider;generatedAt:string;updatedAt:string;status:"complete"|"unsupported"};

function cleanGuide(provider:Provider){
  // Provider guide structure has no credential fields by design. Parse again and enforce reasonable payload size.
  const guide=validateGuide(provider);
  const encoded=JSON.stringify(guide);if(encoded.length>200_000)throw new Error("Guide exceeds the storage size limit.");
  return guide;
}

export async function saveGuide(provider:Provider):Promise<SavedGuide>{
  const guide=cleanGuide(provider);const db=supabaseAdmin();
  const name=guide.name.trim();const slug=guide.slug;const website=guide.officialWebsite??null;
  const upsert=await db.from("providers").upsert({name,slug,official_website:website},{onConflict:"slug"}).select("id,name,slug,official_website").single();
  if(upsert.error)throw new Error(`Could not save provider: ${upsert.error.message}`);
  const inserted=await db.from("guides").insert({provider_id:upsert.data.id,schema_version:GUIDE_SCHEMA_VERSION,guide_json:guide,research_status:guide.oauthSupport==="unsupported"?"unsupported":"complete"}).select("id,provider_id,guide_json,research_status,generated_at,updated_at").single();
  if(inserted.error)throw new Error(`Could not save guide: ${inserted.error.message}`);
  return {id:inserted.data.id,providerId:inserted.data.provider_id,guide:validateGuide(inserted.data.guide_json),generatedAt:inserted.data.generated_at,updatedAt:inserted.data.updated_at,status:inserted.data.research_status};
}

export async function getGuide(id:string):Promise<SavedGuide|null>{
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return null;
  const {data,error}=await supabaseAdmin().from("guides").select("id,provider_id,guide_json,research_status,generated_at,updated_at").eq("id",id).maybeSingle();
  if(error)throw new Error(`Could not load guide: ${error.message}`);if(!data)return null;
  return{id:data.id,providerId:data.provider_id,guide:validateGuide(data.guide_json),generatedAt:data.generated_at,updatedAt:data.updated_at,status:data.research_status};
}

export async function findLatestGuide(providerInput:string):Promise<SavedGuide|null>{
  const normalized=providerInput.trim().toLowerCase().replace(/^https?:\/\//,"").replace(/\/$/,"");
  const {data,error}=await supabaseAdmin().from("guides").select("id,provider_id,guide_json,research_status,generated_at,updated_at,providers!inner(name,slug,official_website)").eq("research_status","complete").order("generated_at",{ascending:false}).limit(50);
  if(error)throw new Error(`Could not check cached guides: ${error.message}`);
  const match=data?.find((row)=>{const p=row.providers as unknown as {name:string;slug:string;official_website:string|null};return [p.name,p.slug,p.official_website??""].some(value=>value.toLowerCase().replace(/^https?:\/\//,"").replace(/\/$/,"")===normalized)});
  if(!match)return null;return{id:match.id,providerId:match.provider_id,guide:validateGuide(match.guide_json),generatedAt:match.generated_at,updatedAt:match.updated_at,status:match.research_status};
}

export async function createResearchRun(providerInput:string){const {data,error}=await supabaseAdmin().from("research_runs").insert({provider_input:providerInput,normalized_provider:providerInput.trim().toLowerCase(),status:"in_progress"}).select("id").single();if(error)throw new Error(error.message);return data.id as string}
export async function finishResearchRun(id:string,status:"complete"|"unsupported"|"ambiguous"|"failed",normalized:string|null,errorMessage?:string){const{error}=await supabaseAdmin().from("research_runs").update({status,normalized_provider:normalized,error_message:errorMessage??null,completed_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error(error.message)}

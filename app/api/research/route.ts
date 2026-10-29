import { NextResponse } from "next/server";
import { ResearchRequestSchema } from "@/lib/schema";
import { researchProvider, ResearchError } from "@/lib/research-service";
import { createResearchRun, findLatestGuide, finishResearchRun, saveGuide } from "@/lib/guide-store";

export const runtime="nodejs";
export const maxDuration=120;
const requestTimestamps=new Map<string,number[]>();
function clientKey(request:Request){return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown"}
function throttled(request:Request){const now=Date.now();const key=clientKey(request);const recent=(requestTimestamps.get(key)??[]).filter(t=>now-t<60_000);if(recent.length>=3)return true;recent.push(now);requestTimestamps.set(key,recent);return false}
function sse(data:unknown){return `data: ${JSON.stringify(data)}\n\n`}

export async function POST(request:Request){
  const contentLength=Number(request.headers.get("content-length")??0);if(contentLength>2048)return NextResponse.json({status:"failed",message:"Request body is too large."},{status:413});
  const body=await request.json().catch(()=>null);const parsed=ResearchRequestSchema.safeParse(body);
  if(!parsed.success)return NextResponse.json({status:"failed",message:"Enter a provider name or HTTPS website (up to 160 characters). Private and local URLs are not fetched."},{status:400});
  if(throttled(request))return NextResponse.json({status:"failed",message:"Research is limited to three requests per minute. Please wait and retry."},{status:429});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({status:"failed",message:"Live research is unavailable because OPENAI_API_KEY is not configured on the server."},{status:503});
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({status:"failed",message:"Guide storage is not configured. Set Supabase server credentials before researching."},{status:503});
  const force=body?.regenerate===true;
  if(!force){try{const cached=await findLatestGuide(parsed.data.provider);if(cached)return NextResponse.json({status:"complete",guide:cached.guide,guideId:cached.id,generatedAt:cached.generatedAt,cached:true})}catch{return NextResponse.json({status:"failed",message:"Could not check saved guides. Research was not started; please retry."},{status:503})}}
  let abortRequest=()=>{};
  const stream=new ReadableStream({start(controller){const encoder=new TextEncoder();let closed=false;const send=(event:unknown)=>{if(!closed)controller.enqueue(encoder.encode(sse(event)))};const aborter=new AbortController();abortRequest=()=>aborter.abort();
    void (async()=>{let runId:string|undefined;try{runId=await createResearchRun(parsed.data.provider);send({type:"milestone",phase:"Identifying provider"});const result=await researchProvider(parsed.data.provider,(phase)=>send({type:"milestone",phase}),aborter.signal);if(result.guide){const saved=await saveGuide(result.guide);const status=result.status==="unsupported"?"unsupported":"complete";await finishResearchRun(runId,status,result.guide.name);send({type:"milestone",phase:"Saving permanent guide"});send({type:"milestone",phase:"Complete"});send({type:"result",data:{...result,guide:saved.guide},guideId:saved.id,generatedAt:saved.generatedAt,cached:false})}else{await finishResearchRun(runId,result.status,result.candidates?.join(", ")??null,result.message);send({type:"milestone",phase:"Complete"});send({type:"result",data:result})}}catch(error){if(!aborter.signal.aborted){const code=error instanceof ResearchError?error.code:"research_failed";const message=error instanceof Error?error.message:"Research failed unexpectedly.";if(runId)await finishResearchRun(runId,"failed",null,message).catch(()=>{});send({type:"error",code,message})}}finally{closed=true;controller.close()}})();
  },cancel(){abortRequest()}});
  return new Response(stream,{headers:{"content-type":"text/event-stream; charset=utf-8","cache-control":"no-cache, no-transform","connection":"keep-alive","x-accel-buffering":"no"}});
}

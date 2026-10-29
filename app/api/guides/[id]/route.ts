import { NextResponse } from "next/server";
import { getGuide } from "@/lib/guide-store";

export const runtime="nodejs";
export const revalidate=300;
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;try{const saved=await getGuide(id);if(!saved)return NextResponse.json({status:"not_found"},{status:404,headers:{"cache-control":"public, max-age=60, s-maxage=300, stale-while-revalidate=3600"}});return NextResponse.json({status:"complete",id:saved.id,guide:saved.guide,generatedAt:saved.generatedAt},{headers:{"cache-control":"public, max-age=60, s-maxage=300, stale-while-revalidate=3600"}})}catch{return NextResponse.json({status:"unavailable",message:"Saved guides are temporarily unavailable."},{status:503,headers:{"cache-control":"no-store"}})}
}

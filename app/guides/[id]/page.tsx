import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { ProviderGuide } from "@/components/provider-guide";
import { getGuide } from "@/lib/guide-store";
import Link from "next/link";
export const runtime="nodejs";
export const revalidate=300;
export const metadata={title:"Shared OAuth guide · OAuth Pathfinder"};
export default async function SharedGuide({params}:{params:Promise<{id:string}>}){
  const {id}=await params;let saved;
  try{saved=await getGuide(id)}catch{return <AppShell><main className="main-content not-found-guide"><div className="empty-icon">!</div><span className="eyebrow">GUIDE STORAGE UNAVAILABLE</span><h1>We couldn’t load this saved guide.</h1><p>Storage is temporarily unavailable. The guide may still be available; please retry in a moment.</p><Link className="button-primary" href={`/guides/${id}`}>Retry</Link></main></AppShell>}
  if(!saved)notFound();
  return <AppShell><main className="main-content"><ProviderGuide provider={saved.guide} permalink={`/guides/${saved.id}`}/><div className="generated-guide-heading"><span>Permanent guide · {saved.status}</span><small>Research completed {new Date(saved.generatedAt).toLocaleString("en",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"})} UTC</small></div></main></AppShell>
}

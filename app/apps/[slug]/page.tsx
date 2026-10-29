import { notFound } from "next/navigation";
import { ProviderGuide } from "@/components/provider-guide";
import { AppShell } from "@/components/shell";
import { getProvider, providers } from "@/lib/providers";
export function generateStaticParams() { return providers.map(p=>({slug:p.slug})); }
export default async function GuidePage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const provider=getProvider(slug); if(!provider) notFound(); return <AppShell><ProviderGuide provider={provider}/></AppShell>; }

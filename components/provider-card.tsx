import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleHelp } from "lucide-react";
import type { Provider } from "@/lib/schema";

export function ProviderCard({ provider }: { provider: Provider }) {
  const researched = provider.confidence !== "Unverified";
  return <article className="provider-card"><div className="card-top"><span className="provider-logo" style={{ backgroundColor: provider.color }}>{provider.initials}</span><span className="card-status">{researched ? <CheckCircle2 size={14}/> : <CircleHelp size={14}/>} {researched ? "Sources included" : "Unverified"}</span></div><div className="provider-heading"><div><h3>{provider.name}</h3><p>{provider.category}</p></div><span className={`complexity complexity-${provider.complexity.toLowerCase()}`}>{provider.complexity}</span></div><p className="provider-summary">{provider.summary}</p><div className="provider-meta"><span>{provider.authAvailability}</span><span>·</span><span>Managed OAuth {provider.managedOAuth.toLowerCase()}</span></div><Link className="card-link" href={`/apps/${provider.slug}`}>View guide <ArrowUpRight size={15}/></Link></article>;
}

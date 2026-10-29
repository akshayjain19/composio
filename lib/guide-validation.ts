import { ProviderSchema, type Provider } from "@/lib/schema";

export function validateGuide(input:unknown):Provider{
  const guide=ProviderSchema.parse(input);const ids=new Set(guide.evidence.map(source=>source.id));
  for(const step of guide.setupSteps)for(const id of step.evidenceIds??[])if(!ids.has(id))throw new Error(`Setup step references missing evidence: ${id}`);
  for(const blocker of guide.blockers)for(const id of blocker.evidenceIds??[])if(!ids.has(id))throw new Error(`Blocker references missing evidence: ${id}`);
  return guide;
}

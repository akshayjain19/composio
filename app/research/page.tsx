import { AppShell } from "@/components/shell";
import { ResearchClient } from "@/components/research-client";
export const metadata = { title: "Research a provider · OAuth Pathfinder" };
export default function ResearchPage() { return <AppShell active="research"><ResearchClient/></AppShell>; }

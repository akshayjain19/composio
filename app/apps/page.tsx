import { AppShell } from "@/components/shell";
import { LibraryClient } from "@/components/library-client";
export const metadata = { title: "App library · OAuth Pathfinder" };
export default function AppsPage() { return <AppShell active="apps"><LibraryClient/></AppShell>; }

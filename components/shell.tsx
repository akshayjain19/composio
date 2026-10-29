import Link from "next/link";
import { KeyRound, Library, Search, ShieldCheck } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? "brand-light" : ""}`}><span className="brand-mark"><KeyRound size={18} strokeWidth={2.4} /></span><span>oauth<span className="brand-accent">pathfinder</span></span></Link>;
}

export function Header({ active = "overview" }: { active?: string }) {
  return <header className="topbar"><div className="topbar-inner"><Brand /><nav className="main-nav" aria-label="Main navigation"><Link className={active === "overview" ? "active" : ""} href="/">Overview</Link><Link className={active === "apps" ? "active" : ""} href="/apps"><Library size={15}/> App library</Link><Link className={active === "research" ? "active" : ""} href="/research"><Search size={15}/> Research</Link></nav><div className="topbar-right"><span className="environment-label"><span className="status-dot"/> Evidence first</span><span className="avatar">OP</span></div></div></header>;
}

export function Footer() { return <footer className="footer"><Brand /><span>Know the path before you build.</span><span className="footer-note"><ShieldCheck size={14}/> Guidance, not approval</span></footer>; }

export function AppShell({ children, active }: { children: React.ReactNode; active?: string }) { return <><Header active={active}/>{children}<div className="page-footer"><Footer /></div></>; }

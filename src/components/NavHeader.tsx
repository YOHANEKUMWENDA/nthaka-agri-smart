import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sprout, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpeg";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/recommend", label: "Analyze" },
  { to: "/rainfall", label: "Rainfall" },
  { to: "/about", label: "About" },
];

export default function NavHeader() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container max-w-6xl flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="NthakaGuide logo" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-display font-bold text-foreground text-lg">NthakaGuide</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to}>
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm font-semibold ${
                  pathname === link.to
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <Button variant="ghost" size="sm" className="sm:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="sm:hidden border-t border-border bg-card px-4 py-2 space-y-1">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm font-semibold ${
                  pathname === link.to ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

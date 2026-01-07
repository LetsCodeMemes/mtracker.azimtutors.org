import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronDown, Sparkles, LayoutDashboard, FilePlus, Calculator, Calendar, Brain } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container max-w-6xl h-16 flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity h-10">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fb1054737047f425f9516bbb02043979d%2F07d0ac73e1e34cf1a308b90dca923a08?format=webp&width=200"
            alt="Azim Tutors"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 focus:outline-none">
                  Tools <ChevronDown className="h-4 w-4 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/add-paper" className="flex items-center gap-2 w-full">
                      <FilePlus className="h-4 w-4" />
                      Add Paper
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/simulator" className="flex items-center gap-2 w-full">
                      <Calculator className="h-4 w-4" />
                      Grade Simulator
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/revision-plan" className="flex items-center gap-2 w-full">
                      <Calendar className="h-4 w-4" />
                      Revision Plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/practice-questions" className="flex items-center gap-2 w-full">
                      <Brain className="h-4 w-4" />
                      Practice Questions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-primary focus:text-primary font-semibold">
                    <Link to="/premium" className="flex items-center gap-2 w-full">
                      <Sparkles className="h-4 w-4" />
                      Premium Features
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Link to="/features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.first_name} {user.last_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container max-w-6xl px-4 py-4 flex flex-col gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="py-2 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">Tools</p>
                  <Link
                    to="/add-paper"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1 px-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FilePlus className="h-4 w-4" />
                    Add Paper
                  </Link>
                  <Link
                    to="/simulator"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1 px-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calculator className="h-4 w-4" />
                    Grade Simulator
                  </Link>
                  <Link
                    to="/revision-plan"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1 px-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    Revision Plan
                  </Link>
                  <Link
                    to="/practice-questions"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1 px-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Brain className="h-4 w-4" />
                    Practice Questions
                  </Link>
                  <Link
                    to="/premium"
                    className="text-sm font-bold text-primary hover:opacity-80 transition-opacity py-1 px-2 flex items-center gap-2 bg-primary/5 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Sparkles className="h-4 w-4" />
                    Premium Features
                  </Link>
                </div>
              </>
            )}
            <Link
              to="/features"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <p className="text-sm text-muted-foreground py-2">
                    {user.first_name} {user.last_name}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

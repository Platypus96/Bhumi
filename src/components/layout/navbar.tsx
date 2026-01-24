
"use client";

import Link from "next/link";
import { University, Menu, Shield } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { WalletConnectButton } from "@/components/connect-wallet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect, memo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NavLink = ({ href, children, onClick, isRegistrarLink = false }: { href: string, children: React.ReactNode, onClick: () => void, isRegistrarLink?: boolean}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive ? "bg-secondary text-primary" : "text-foreground/70 hover:text-foreground/90",
          isRegistrarLink && "text-accent-foreground/70 hover:text-accent-foreground/90"
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={cn(
        "block px-3 py-2 rounded-md text-base font-medium",
        isActive ? "bg-secondary text-primary" : "text-foreground/80 hover:bg-secondary/50"
      )} 
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const BaseNavbar = () => {
  const { isRegistrar } = useWeb3();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: "/public-portal", label: "Public Portal" },
    { href: "/my-properties", label: "My Properties" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  const registrarLink = { href: "/dashboard", label: "Dashboard" };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const desktopNav = (
    <>
      {navLinks.map(link => (
        <NavLink key={link.href} href={link.href} onClick={closeMobileMenu}>{link.label}</NavLink>
      ))}
      {isClient && isRegistrar && (
        <NavLink href={registrarLink.href} onClick={closeMobileMenu} isRegistrarLink>
           <div className="flex items-center text-primary font-semibold">
            <Shield className="mr-2 h-4 w-4" />
            {registrarLink.label}
          </div>
        </NavLink>
      )}
    </>
  );

  const mobileNav = (
     <>
      {navLinks.map(link => (
        <MobileNavLink key={link.href} href={link.href} onClick={closeMobileMenu}>{link.label}</MobileNavLink>
      ))}
      {isClient && isRegistrar && (
        <MobileNavLink href={registrarLink.href} onClick={closeMobileMenu}>
          <div className="flex items-center text-primary font-semibold">
            <Shield className="mr-2 h-4 w-4" />
            {registrarLink.label}
          </div>
        </MobileNavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="text-foreground">
            <University className="h-7 w-7" />
          </div>
          <span className="hidden font-bold sm:inline-block font-headline text-lg">Bhumi</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="mr-auto hidden md:flex items-center space-x-1 text-sm font-medium">
          {desktopNav}
        </nav>

        {/* Mobile Nav & Wallet Button */}
        <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
          <WalletConnectButton />
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 pt-10">
              <div className="flex flex-col space-y-2 px-4">
                {mobileNav}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Wallet Button */}
        <div className="hidden md:flex items-center justify-end">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}

export const Navbar = memo(BaseNavbar);

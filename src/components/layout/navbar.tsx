"use client";

import Link from "next/link";
import { Landmark, Menu, Shield } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { WalletConnectButton } from "@/components/connect-wallet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isRegistrar } = useWeb3();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/public-portal", label: "Public Portal" },
    { href: "/my-properties", label: "My Properties" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  const registrarLink = { href: "/dashboard", label: "Registrar Dashboard" };
  
  const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void}) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={cn(
          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:text-foreground/80"
        )}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  };

  const MobileNavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void}) => (
     <Link href={href} className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-accent/50" onClick={onClick}>
        {children}
      </Link>
  );


  const desktopNav = (
    <>
      {navLinks.map(link => (
        <NavLink key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>{link.label}</NavLink>
      ))}
      {isRegistrar && (
        <Link href={registrarLink.href} className="flex items-center text-primary transition-colors hover:text-primary/80 font-semibold" onClick={() => setMobileMenuOpen(false)}>
          <Shield className="mr-2 h-4 w-4" />
          {registrarLink.label}
        </Link>
      )}
    </>
  );

  const mobileNav = (
     <>
      {navLinks.map(link => (
        <MobileNavLink key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>{link.label}</MobileNavLink>
      ))}
      {isRegistrar && (
        <MobileNavLink href={registrarLink.href} onClick={() => setMobileMenuOpen(false)}>
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
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="bg-accent/20 text-accent p-2 rounded-lg">
              <Landmark className="h-6 w-6" />
            </div>
            <span className="hidden font-bold sm:inline-block">LandRegistryDApp</span>
          </Link>
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {desktopNav}
          </nav>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="mb-4 flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="bg-accent/20 text-accent p-2 rounded-lg">
                <Landmark className="h-6 w-6" />
              </div>
              <span className="font-bold">LandRegistryDApp</span>
            </Link>
            <div className="flex flex-col space-y-2">
              {mobileNav}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-start md:hidden">
          <Link href="/" className="flex items-center space-x-2">
             <div className="bg-accent/20 text-accent p-2 rounded-lg">
                <Landmark className="h-6 w-6" />
              </div>
            <span className="font-bold">LandRegistryDApp</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}

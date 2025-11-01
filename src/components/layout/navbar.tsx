"use client";

import Link from "next/link";
import { Landmark, Menu, User } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { WalletConnectButton } from "@/components/connect-wallet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const { account, isRegistrar } = useWeb3();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = (
    <>
       <Link href="/" className="transition-colors hover:text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
        Public Portal
      </Link>
      {account && (
        <Link href="/my-properties" className="transition-colors hover:text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
          My Properties
        </Link>
      )}
      {isRegistrar && (
        <Link href="/dashboard" className="transition-colors hover:text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Landmark className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">LandRegistryDApp</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium text-foreground/60">
            {navLinks}
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
              <Landmark className="h-6 w-6 text-primary" />
              <span className="font-bold">LandRegistryDApp</span>
            </Link>
            <div className="flex flex-col space-y-3">
              {navLinks}
            </div>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="flex items-center space-x-2 md:hidden">
          <Landmark className="h-6 w-6 text-primary" />
          <span className="font-bold">LandRegistryDApp</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}

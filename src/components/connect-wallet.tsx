"use client";

import { useWeb3 } from "@/hooks/use-web3";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, Wallet } from "lucide-react";

export function WalletConnectButton() {
  const { account, connectWallet, disconnectWallet, isRegistrar } = useWeb3();

  if (account) {
    const shortAddress = `${account.substring(0, 6)}...${account.substring(
      account.length - 4
    )}`;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 rounded-full border-2 border-primary/50 text-primary font-semibold hover:bg-primary/5 hover:text-primary">
             <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>{shortAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{isRegistrar ? "Registrar Account" : "User Account"}</p>
              <p className="text-xs leading-none text-muted-foreground">{account}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={connectWallet} className="rounded-full font-bold" size="lg">
      <Wallet className="mr-2 h-5 w-5" />
      Connect Wallet
    </Button>
  );
}

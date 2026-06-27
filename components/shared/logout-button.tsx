"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      className="bg-muted hover:bg-zinc-700"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Keluar
    </Button>
  );
}

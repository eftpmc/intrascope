"use client";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TooltipProvider>{children}</TooltipProvider>
  );
}

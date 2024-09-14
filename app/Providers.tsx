"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import Router from "next/router";
import { ReactNode } from "react";
import { DOCUMENT_URL } from "@/constants";

export function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TooltipProvider>{children}</TooltipProvider>
  );
}

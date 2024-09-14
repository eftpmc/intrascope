import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { DashboardLayout } from "@/layouts/Dashboard";
import { groups } from "@/data/groups";

export default async function Dashboard({ children }: { children: ReactNode }) {
    return <DashboardLayout groups={groups}>{children}</DashboardLayout>;
}

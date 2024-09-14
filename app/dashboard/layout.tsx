import { ReactNode } from "react";
import { groups } from "@/data/groups";
import { DashboardLayout } from "@/layouts/Dashboard";

export default async function Dashboard({ children }: { children: ReactNode }) {
    return <DashboardLayout groups={groups}>{children}</DashboardLayout>;
}

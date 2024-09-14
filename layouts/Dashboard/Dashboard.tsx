"use client";

import clsx from "clsx";
import { useState, ReactNode } from "react";
import { DashboardHeader, DashboardSidebar } from "@/components/Dashboard";
import { Group, DocumentType } from "@/types";
import { DocumentsList } from "@/layouts/Documents/DocumentsList";
import styles from "./Dashboard.module.css";

interface Props {
  groups: Group[];
  children?: ReactNode;
}

export function DashboardLayout({ groups, ...props }: Props) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<DocumentType | "all">("all");

  const handleCategoryChange = (newCategory: DocumentType | "all") => {
    setCategory(newCategory);
  };

  return (
    <div className={clsx(styles.container)} {...props}>
      <header className={styles.header}>
        <DashboardHeader isOpen={isMenuOpen} onMenuClick={() => setMenuOpen(!isMenuOpen)} />
      </header>
      <aside className={styles.aside} data-open={isMenuOpen || undefined}>
        <DashboardSidebar onCategoryChange={handleCategoryChange} groups={groups} />
      </aside>
      <main className={styles.main}>
        {/* Pass category to DocumentsList */}
        <DocumentsList category={category} />
      </main>
    </div>
  );
}
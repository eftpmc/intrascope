"use client"

import clsx from "clsx";
import { useEffect, useState } from "react";
import { getUserProfile, getUser } from "@/auth";
import { usePathname } from "next/navigation";
import { ComponentProps, useMemo } from "react";
import { FileIcon } from "@/icons";
import { IconButton, LinkButton } from "@/primitives/Button";
import { DocumentType, Group } from "@/types";
import { normalizeTrailingSlash } from "@/utils";
import styles from "./DashboardSidebar.module.css";

interface Props extends ComponentProps<"div"> {
  groups: Group[];
  onCategoryChange: (category: DocumentType | "all") => void;
}

interface SidebarLinkProps
  extends Omit<ComponentProps<typeof LinkButton>, "href"> {
  href: string;
}

interface SidebarButtonProps extends ComponentProps<"button"> {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

function SidebarLink({
  href,
  children,
  className,
  ...props
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = useMemo(
    () => normalizeTrailingSlash(pathname) === normalizeTrailingSlash(href),
    [pathname, href]
  );

  return (
    <LinkButton
      className={clsx(className, styles.sidebarLink)}
      data-active={isActive || undefined}
      href={href}
      variant="subtle"
      {...props}
    >
      {children}
    </LinkButton>
  );
}

function SidebarButton({
  onClick,
  children,
  className,
  ...props
}: SidebarButtonProps) {

  return (
    <IconButton
      className={clsx(className, styles.sidebarLink)}
      onClick={onClick}
      variant="subtle"
      {...props}
    >
      {children}
    </IconButton>
  );
}

export function DashboardSidebar({ onCategoryChange, className, groups, ...props }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = await getUser();  // Fetch user directly
      if (user) {
        const profile = await getUserProfile(user.id);  // Use user id from getUser
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className={clsx(className, styles.sidebar)} {...props}>
      <nav className={styles.navigation}>
        <div className={styles.category}>
          <ul className={styles.list}>
            <span className={styles.categoryTitle}>Offers</span>
            <li>
              <SidebarButton onClick={() => onCategoryChange("all")} icon={<FileIcon />}>
                All
              </SidebarButton>
            </li>
            <li>
              <SidebarButton onClick={() => onCategoryChange("food")} icon={<FileIcon />}>
                Food & Drink
              </SidebarButton>
            </li>
            <li>
              <SidebarButton onClick={() => onCategoryChange("fashion")} icon={<FileIcon />}>
                Fashion
              </SidebarButton>
            </li>
            <li>
              <SidebarButton onClick={() => onCategoryChange("tech")} icon={<FileIcon />}>
                Tech
              </SidebarButton>
            </li>
            <li>
              <SidebarButton onClick={() => onCategoryChange("health")} icon={<FileIcon />}>
                Health
              </SidebarButton>
            </li>
            <li>
              <SidebarButton onClick={() => onCategoryChange("entertainment")} icon={<FileIcon />}>
                Entertainment
              </SidebarButton>
            </li>

            {isAdmin && (
              <div className={styles.adminLinkContainer}>
                <ul className={styles.list}>
                  <li>
                    <SidebarLink href="/admin">Admin Dashboard</SidebarLink>
                  </li>
                </ul>
              </div>
            )}
          </ul>
        </div>
        {/* <div className={styles.category}>
          <span className={styles.categoryTitle}>Groups</span>
          <ul className={styles.list}>
            {groups.map((group) => {
              return (
                <li key={group.id}>
                  <SidebarLink
                    href={DASHBOARD_GROUP_URL(group.id)}
                    icon={<FolderIcon />}
                  >
                    {group.name}
                  </SidebarLink>
                </li>
              );
            })}
          </ul>
        </div> */}
      </nav>
    </div>
  );
}

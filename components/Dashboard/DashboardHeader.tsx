'use client';

import clsx from "clsx";
import Link from "next/link";
import { ComponentProps, MouseEventHandler, useEffect, useState } from "react";
import { getUserProfile, handleSignOut } from "@/auth";
import { CrossIcon, MenuIcon, SignOutIcon } from "@/icons";
import { Avatar } from "@/primitives/Avatar";
import { Button } from "@/primitives/Button";
import { Popover } from "@/primitives/Popover";
import { createClient } from '@/utils/supabase/client'
import { InboxPopover } from "../Inbox";
import { Logo } from "../Logo";
import styles from "./DashboardHeader.module.css";

interface Props extends ComponentProps<"header"> {
  isOpen: boolean;
  onMenuClick: MouseEventHandler<HTMLButtonElement>;
}

export function DashboardHeader({
  isOpen,
  onMenuClick,
  className,
  ...props
}: Props) {
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const supabase = createClient();
  // Fetch user profile information from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser(); // Get the current user from Supabase

      if (user) {
        const profile = await getUserProfile(user.id); // Fetch profile from the 'profiles' table
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header className={clsx(className, styles.header)} {...props}>
      <div className={styles.menu}>
        <button className={styles.menuToggle} onClick={onMenuClick}>
          {isOpen ? <CrossIcon /> : <MenuIcon />}
        </button>
      </div>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoLink}>
          <Logo />
        </Link>
      </div>
      <div className={styles.profile}>
        {userProfile && (
          <Popover
            align="end"
            alignOffset={-6}
            content={
              <div className={styles.profilePopover}>
                <div className={styles.profilePopoverInfo}>
                  <span className={styles.profilePopoverName}>
                    {userProfile.full_name}
                  </span>
                  <span className={styles.profilePopoverId}>
                    {/* Display user email or ID if needed */}
                  </span>
                </div>
                <div className={styles.profilePopoverActions}>
                  <Button
                    className={styles.profilePopoverButton}
                    icon={<SignOutIcon />}
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            }
            side="bottom"
            sideOffset={6}
          >
            <button className={styles.profileButton}>
              <Avatar
                className={styles.profileAvatar}
                name={userProfile.full_name}
                size={32}
                src={userProfile.avatar_url}
              />
            </button>
          </Popover>
        )}
        <div className={styles.profileInbox}>
          <InboxPopover align="end" sideOffset={4} />
        </div>
      </div>
    </header>
  );
}
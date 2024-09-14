import clsx from "clsx";
import { ComponentProps } from "react";
import { FileIcon } from "@/icons"; // Assuming you have the FileIcon component
import styles from "./DashboardSidebar.module.css"; // Assuming this is where your styles are located

interface SidebarButtonProps extends ComponentProps<"button"> {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function SidebarButton({ onClick, icon, children, className, ...props }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(className, styles.sidebarButton)} // Assuming you have the same styling
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

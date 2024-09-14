import clsx from "clsx";
import { ComponentProps } from "react";
import { Button } from "@/primitives/Button";
import styles from "./Inbox.module.css";

function InboxContent(props: ComponentProps<"div">) {

  return (
    <div {...props}>
      hewo
    </div>
  );
}

export function Inbox({ className, ...props }: ComponentProps<"div">) {

  return (
    <div className={clsx(className, styles.inbox)} {...props}>
      <div className={styles.inboxHeader}>
        <h2>Notifications</h2>
        <Button>
          Mark all as read
        </Button>
      </div>
        <InboxContent />
    </div>
  );
}

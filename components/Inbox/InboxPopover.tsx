import { usePathname } from "next/navigation";
import { ComponentProps, useEffect, useState } from "react";
import { InboxIcon } from "@/icons";
import { Button } from "@/primitives/Button";
import { Popover } from "@/primitives/Popover";
import { Inbox } from "./Inbox";
import styles from "./InboxPopover.module.css";

export function InboxPopover(
  props: Omit<ComponentProps<typeof Popover>, "content">
) {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={setOpen}
      content={<Inbox className={styles.inboxPopover} />}
      {...props}
    >
      <Button variant="secondary" icon={<InboxIcon />} iconButton>
      </Button>
    </Popover>
  );
}

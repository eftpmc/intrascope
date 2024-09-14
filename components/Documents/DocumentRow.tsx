import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ComponentProps, useCallback, useState } from "react";
import { DOCUMENT_URL } from "@/constants";
import { DeleteIcon, MoreIcon } from "@/icons";
import { AvatarStack } from "@/primitives/AvatarStack";
import { Button } from "@/primitives/Button";
import { Popover } from "@/primitives/Popover";
import { Skeleton } from "@/primitives/Skeleton";
import { deleteDocumentFromSupabase } from "@/utils/supabase/supabaseData"; // Import the Supabase delete operation
import { DocumentDeleteDialog } from "./DocumentDeleteDialog";
import { DocumentIcon } from "./DocumentIcon";
import styles from "./DocumentRow.module.css";

// Define the structure for documents fetched from Supabase
interface Document {
  id: string;
  title: string;
  type: string;
  updated_at: string;
  user_id: string;
}

interface Props extends ComponentProps<"div"> {
  document: Document;
  others?: any[];
  revalidateDocuments: () => void;
}

export function DocumentRow({
  className,
  document,
  others,
  revalidateDocuments,
  ...props
}: Props) {
  const [isMoreOpen, setMoreOpen] = useState(false);

  const date = new Date(document.updated_at); // Fetch updated_at from Supabase data
  const url = DOCUMENT_URL(document.type, document.id);

  const handleDeleteDialogOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setMoreOpen(false);
    }
  }, []);

  const handleDeleteDocument = async () => {
    const { error } = await deleteDocumentFromSupabase({
      documentId: document.id,
    });

    if (!error) {
      revalidateDocuments();
    } else {
      console.error("Failed to delete document:", error);
    }
  };

  return (
    <div className={clsx(className, styles.row)} {...props}>
      <Link className={clsx(styles.container, styles.link)} href={url}>
        <div className={styles.icon}>
          <DocumentIcon type={document.type} />
        </div>
        <div className={styles.info}>
          <span className={styles.documentName}>
            <span>{document.title}</span>
          </span>
          <span className={styles.documentDate}>
            Edited {formatDistanceToNow(date)} ago
          </span>
        </div>
        {others && (
          <div className={styles.presence}>
            <AvatarStack
              avatars={others.map((other) => ({
                name: other.name,
                src: other.avatar_url,
              }))}
              size={20}
              tooltip
            />
          </div>
        )}
      </Link>
      <div className={styles.more}>
        <Popover
          align="end"
          content={
            <div className={styles.morePopover}>
              <DocumentDeleteDialog
                documentId={document.id}
                onDeleteDocument={handleDeleteDocument}
                onOpenChange={handleDeleteDialogOpenChange}
              >
                <Button icon={<DeleteIcon />} variant="subtle">
                  Delete
                </Button>
              </DocumentDeleteDialog>
            </div>
          }
          modal
          onOpenChange={setMoreOpen}
          open={isMoreOpen}
          side="bottom"
          sideOffset={10}
          {...props}
        >
          <Button
            className={styles.moreButton}
            icon={<MoreIcon />}
            variant="secondary"
          />
        </Popover>
      </div>
    </div>
  );
}

export function DocumentRowSkeleton({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={clsx(className, styles.row)} {...props}>
      <div className={styles.container}>
        <div className={styles.icon}>
          <Skeleton style={{ width: 20, height: 20 }} />
        </div>
        <div className={clsx(styles.info, styles.infoSkeleton)}>
          <span className={styles.documentName}>
            <Skeleton style={{ width: 100 }} />
          </span>
          <span className={styles.documentDate}>
            <Skeleton style={{ width: 160 }} />
          </span>
        </div>
      </div>
    </div>
  );
}

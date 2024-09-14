import { ComponentProps, useState } from "react";
import { PlusIcon } from "@/icons";
import { createDocumentInSupabase } from "@/utils/supabase/supabaseData";
import { Button } from "@/primitives/Button";
import { Popover } from "@/primitives/Popover";
import { Document, DocumentGroup, DocumentType, DocumentUser } from "@/types";
import styles from "./DocumentCreatePopover.module.css";

interface Props extends Omit<ComponentProps<typeof Popover>, "content"> {
  documentName?: Document["name"];
  draft: Document["draft"];
  groupIds?: DocumentGroup["id"][];
  userId: DocumentUser["id"];
}

export function DocumentCreatePopover({
  groupIds,
  userId,
  draft,
  children,
  ...props
}: Props) {
  const [disableButtons, setDisableButtons] = useState(false);

  // Create a new document using Supabase, then handle post-creation logic
  async function createNewDocument(name: string, type: DocumentType) {
    setDisableButtons(true);

    const result = await createDocumentInSupabase({
      name,
      type,
      userId,
      draft,
      groupIds: draft ? undefined : groupIds,
    });

    // If this runs, there's an error and the creation failed
    if (!result || result?.error || !result.data) {
      setDisableButtons(false);
      return;
    }

    // Success! You can redirect the user or handle the result here
    console.log("Document created:", result.data);
    setDisableButtons(false);
  }

  return (
    <Popover
      content={
        <div className={styles.popover}>
          <Button
            icon={<PlusIcon />}
            onClick={() => {
              createNewDocument("Untitled", "text");
            }}
            variant="subtle"
            disabled={disableButtons}
          >
            Text
          </Button>
          <Button
            icon={<PlusIcon />}
            onClick={() => {
              createNewDocument("Untitled", "whiteboard");
            }}
            variant="subtle"
            disabled={disableButtons}
          >
            Whiteboard
          </Button>
          <Button
            disabled
            icon={<PlusIcon />}
            onClick={() => {
              createNewDocument("Untitled", "spreadsheet");
            }}
            variant="subtle"
          >
            Spreadsheet
          </Button>
        </div>
      }
      modal
      side="bottom"
      {...props}
    >
      {children}
    </Popover>
  );
}
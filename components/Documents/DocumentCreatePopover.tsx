import { ComponentProps, useState } from "react";
import { PlusIcon } from "@/icons";
import { Button } from "@/primitives/Button";
import { Popover } from "@/primitives/Popover";
import { Document, DocumentGroup, DocumentType, DocumentUser } from "@/types";
import { createDocumentInSupabase } from "@/utils/supabase/supabaseData";
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

  async function createNewDocument(name: string, type: DocumentType) {
    setDisableButtons(true);

    try {
      const result = await createDocumentInSupabase({
      name,
      type,
      userId,
      draft,
      groupIds: draft ? undefined : groupIds,
    });

    if ('error' in result && result.error) {
      setDisableButtons(false);
      throw new Error('Failed to create document');
    }

    if (!('data' in result)) {
      setDisableButtons(false);
      throw new Error('Unexpected response format');
    }


    console.log("Document created:", result.data);
    setDisableButtons(false);
  } catch (error) {
    console.error("Error creating document:", error);
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
}
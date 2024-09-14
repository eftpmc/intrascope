import { memo } from "react";
import { DocumentRow } from "./DocumentRow";
import styles from "@/layouts/Documents/DocumentsList.module.css";

type Props = {
  documents: any[]; // Assuming documents come directly from Supabase's data table
  revalidateDocuments: () => void;
};

export const DocumentRowGroup = memo(({ documents, revalidateDocuments }: Props) => {
  return (
    <>
      {documents.map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          className={styles.row}
          revalidateDocuments={revalidateDocuments}
        />
      ))}
    </>
  );
});
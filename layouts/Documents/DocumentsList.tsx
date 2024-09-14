"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { ComponentProps } from "react";
import { DocumentRowSkeleton } from "@/components/Documents";
import { DocumentRowGroup } from "@/components/Documents/DocumentRowGroup";
import { PlusIcon } from "@/icons";
import { Button } from "@/primitives/Button";
import { Container } from "@/primitives/Container";
import { Select } from "@/primitives/Select";
import { DocumentType } from "@/types";
import styles from "./DocumentsList.module.css";
import { capitalize } from "@/utils/capitalize";
import { fetchDocumentsFromSupabase } from "@/utils/supabase/supabaseData"; // Import the new fetch function

interface Props extends ComponentProps<"div"> {
  filter?: "all" | "drafts" | "group";
}

export function DocumentsList({
  filter = "all",
  className,
  ...props
}: Props) {
  const [documentType, setDocumentType] = useState<DocumentType | "all">("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents from Supabase, filtering by genre
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      // Call the new function in `supabaseData`
      const { data, error } = await fetchDocumentsFromSupabase(documentType);

      if (error) {
        setError("Error fetching documents");
      } else {
        setDocuments(data || []); // If data is null, set an empty array
      }

      setLoading(false);
    };

    fetchDocuments();
  }, [documentType]);

  const createDocumentButton = (
    <Button icon={<PlusIcon />}>New Document</Button>
  );

  // Define a header that updates based on the selected document type
  const headerTitle = documentType === "all" ? capitalize(filter) : capitalize(documentType);

  return (
    <Container
      size="small"
      className={clsx(className, styles.documents)}
      {...props}
    >
      <div className={styles.header}>
        <Select
          initialValue="all"
          items={[
            { value: "all", title: "All" },
            { value: "entertainment", title: "Entertainment" },
            { value: "fashion", title: "Fashion" },
            { value: "tech", title: "Tech" },
            { value: "food", title: "Food" },
            { value: "health", title: "Health" },
            { value: "other", title: "Other" },
          ]}
          onChange={(value: "all" | DocumentType) => setDocumentType(value)}
          className={styles.headerSelect}
        />
        <div className={styles.headerActions}>
          {createDocumentButton}
        </div>
      </div>

      <div className={styles.container}>
        {loading ? (
          <>
            <DocumentRowSkeleton className={styles.row} />
            <DocumentRowSkeleton className={styles.row} />
            <DocumentRowSkeleton className={styles.row} />
          </>
        ) : error ? (
          <div className={styles.emptyState}>
            <p>{error}</p>
          </div>
        ) : documents.length > 0 ? (
          <>
            <DocumentRowGroup
              documents={documents}
              revalidateDocuments={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>No documents yet.</p>
            {createDocumentButton}
          </div>
        )}
      </div>
    </Container>
  );
}
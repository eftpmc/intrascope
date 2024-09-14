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
import styles from "./DocumentsList.module.css";
import { fetchDocumentsFromSupabase } from "@/utils/supabase/supabaseData"; // Import the new fetch function

interface Props extends ComponentProps<"div"> {
  category: any;
}

export function DocumentsList({
  category,
  className,
  ...props
}: Props) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"mostRecent" | "leastRecent" | "alphabetical" | "reverseAlphabetical">("mostRecent");

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await fetchDocumentsFromSupabase(category);

      if (error) {
        setError("Error fetching documents");
      } else {
        const sortedData = data || [];

        // Apply sorting based on the selected filter
        switch (filter) {
          case "mostRecent":
            sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
          case "leastRecent":
            sortedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            break;
          case "alphabetical":
            sortedData.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "reverseAlphabetical":
            sortedData.sort((a, b) => b.title.localeCompare(a.title));
            break;
        }

        setDocuments(sortedData);
      }

      setLoading(false);
    };

    fetchDocuments();
  }, [category, filter]);

  const createDocumentButton = (
    <Button icon={<PlusIcon />}>New Document</Button>
  );

  return (
    <Container
      size="small"
      className={clsx(className, styles.documents)}
      {...props}
    >
      <div className={styles.header}>
        <Select
          initialValue="mostRecent"
          items={[
            { value: "mostRecent", title: "Most Recent" },
            { value: "leastRecent", title: "Least Recent" },
            { value: "alphabetical", title: "Alphabetical" },
            { value: "reverseAlphabetical", title: "Reverse Alphabetical" },
          ]}
          onChange={(value: "mostRecent" | "leastRecent" | "alphabetical" | "reverseAlphabetical") => setFilter(value)}
          className={styles.headerSelect}
        />
        <div className={styles.headerActions}>{createDocumentButton}</div>
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
          <DocumentRowGroup
            documents={documents}
            revalidateDocuments={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
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
"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; // Import Supabase client
import { ComponentProps } from "react";
import {
  DocumentRowSkeleton,
} from "@/components/Documents";
import { DocumentRowGroup } from "@/components/Documents/DocumentRowGroup";
import { PlusIcon } from "@/icons";
import { Button } from "@/primitives/Button";
import { Container } from "@/primitives/Container";
import { Select } from "@/primitives/Select";
import { Spinner } from "@/primitives/Spinner";
import { DocumentType } from "@/types";
import styles from "./DocumentsList.module.css";
import { capitalize } from "@/utils/capitalize";

// Load `x` documents at a time
const DOCUMENT_LOAD_LIMIT = 10;

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
  const supabase = createClient();

  // Fetch documents from the `data` table in Supabase, filtering by genre
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      // Supabase query to fetch documents by genre
      let query = supabase.from("data").select("*");

      if (documentType !== "all") {
        query = query.eq("type", documentType); // Filter by genre
      }

      const { data, error } = await query;

      if (error) {
        setError("Error fetching documents");
        console.error("Error fetching documents:", error);
      } else {
        setDocuments(data || []); // If data is null, set an empty array
      }

      setLoading(false);
    };

    fetchDocuments();
  }, [documentType, filter, supabase]);

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
        <h1 className={styles.headerTitle}>Offers</h1>
        <div className={styles.headerActions}>
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

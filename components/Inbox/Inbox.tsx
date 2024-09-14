import clsx from "clsx";
import { ComponentProps, useEffect, useState } from "react";
import { Button } from "@/primitives/Button";
import { fetchDocumentsFromSupabase } from "@/utils/supabase/supabaseData";
import styles from "./Inbox.module.css";

interface Document {
  id: string;
  title: string;
  updated_at: string;
}

function InboxContent({ documents }: { documents: Document[] }) {
  return (
    <div>
      {documents.length > 0 ? (
        documents.map((document) => (
          <div key={document.id} className={styles.inboxItem}>
            <p className={styles.documentName}>{document.title}</p>
            <span className={styles.documentDate}>{new Date(document.updated_at).toLocaleDateString()}</span>
          </div>
        ))
      ) : (
        <p>No new documents</p>
      )}
    </div>
  );
}

export function Inbox({ className, ...props }: ComponentProps<"div">) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data, error } = await fetchDocumentsFromSupabase("all");

      console.log(data)

      if (!error && data) {
        const sortedDocuments = data
          .sort((a: Document, b: Document) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5);

        setDocuments(sortedDocuments);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className={clsx(className, styles.inbox)} {...props}>
      <div className={styles.inboxHeader}>
        <h2>Notifications</h2>
        <Button>Mark all as read</Button>
      </div>
      <InboxContent documents={documents} />
    </div>
  );
}

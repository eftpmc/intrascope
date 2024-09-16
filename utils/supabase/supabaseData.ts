import { createClient } from "@/utils/supabase/client";
import { DocumentType } from "@/types";

// Create a Supabase client
const supabase = createClient();

export const deleteDocumentFromSupabase = async ({
  documentId,
}: {
  documentId: string;
}) => {
  try {
    const { error } = await supabase.from("data").delete().eq("id", documentId);

    if (error) {
      console.error("Error deleting document:", error);
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { error };
  }
};

export const fetchDocumentsFromSupabase = async (
  documentType: DocumentType | "all"
) => {
  try {
    // Build the query
    let query = supabase.from("data").select("*");

    if (documentType !== "all") {
      query = query.eq("type", documentType); // Filter by document type
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { error };
  }
};

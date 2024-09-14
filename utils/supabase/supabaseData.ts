import { createClient } from "@/utils/supabase/client";

// Create a Supabase client
const supabase = createClient();

// Function to create a new document in the `data` table
export const createDocumentInSupabase = async ({
  name,
  type,
  userId,
  draft = true,
  groupIds,
}: {
  name: string;
  type: string;
  userId: string;
  draft: boolean;
  groupIds?: string[];
}) => {
  try {
    const { data, error } = await supabase.from("data").insert([
      {
        title: name,
        type: type,
        user_id: userId,
        draft: draft,
        group_ids: groupIds ?? [],
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error creating document:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Error creating document:", error);
    return { error };
  }
};

// Function to delete a document from the `data` table
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

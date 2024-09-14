import { ErrorLayout } from "@/layouts/Error";
import { Group } from "@/types";
import { DocumentsList } from "./DocumentsList";

type Props = {
  filter?: "all" | "drafts" | "group";
  groupId?: Group["id"];
};

export async function DocumentsLayout({ filter, groupId }: Props) {

  return <DocumentsList filter={filter} />;
}

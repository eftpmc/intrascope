import { ComponentProps } from "react";
import { DocumentType } from "@/types";

interface Props extends Omit<ComponentProps<"svg">, "type"> {
  type?: DocumentType;
}

export function DocumentIcon({ type, ...props }: Props) {
  switch (type) {
    case "entertainment":
      return null; // No icon for now
    case "fashion":
      return null; // No icon for now
    case "tech":
      return null; // No icon for now
    case "food":
      return null; // No icon for now
    case "health":
      return null; // No icon for now
    case "other":
      return null; // No icon for now
    default:
      return null; // No icon for default
  }
}
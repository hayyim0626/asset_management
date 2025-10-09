import PlusIcon from "./plus";
import EditIcon from "./edit";
import ChevronDownIcon from "./chevron-down";
import XIcon from "./x";

export const icons = {
  plus: PlusIcon,
  edit: EditIcon,
  chevronDown: ChevronDownIcon,
  x: XIcon
} as const;

export type IconName = keyof typeof icons;

import PlusIcon from "./plus";
import EditIcon from "./edit";
import ChevronDownIcon from "./chevron-down";

export const icons = {
  plus: PlusIcon,
  edit: EditIcon,
  chevronDown: ChevronDownIcon
} as const;

export type IconName = keyof typeof icons;

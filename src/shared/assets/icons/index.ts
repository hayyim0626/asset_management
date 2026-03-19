import PlusIcon from "./plus";
import EditIcon from "./edit";
import ChevronDownIcon from "./chevron-down";
import ChevronLeftIcon from "./chevron-left";
import ChevronRightIcon from "./chevron-right";
import XIcon from "./x";

export const icons = {
  plus: PlusIcon,
  edit: EditIcon,
  chevronDown: ChevronDownIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  x: XIcon
} as const;

export type IconName = keyof typeof icons;

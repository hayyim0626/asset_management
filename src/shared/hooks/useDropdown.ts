import { useState } from "react";

interface PropType {
  onOpenChange?: (isOpen: boolean) => void;
}

export const useDropdown = (props: PropType) => {
  const { onOpenChange } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return { isOpen, handleToggle, handleClose };
};

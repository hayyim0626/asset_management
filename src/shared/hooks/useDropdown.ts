import { useState } from "react";

export const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => setIsOpen(false);

  return { isOpen, handleToggle, handleClose };
};

"use client";

import React, { useContext, createContext, ReactNode } from "react";
import { SvgIcon } from "@/shared/ui";
import { useDropdown } from "@/shared/hooks";

interface DropdownContextType<T> {
  isOpen: boolean;
  handleToggle: () => void;
  handleClose: () => void;
  selectedItem?: T;
}

const DropdownContext = createContext<DropdownContextType<unknown> | null>(null);

function useDropdownContext<T>() {
  const context = useContext(DropdownContext) as DropdownContextType<T> | null;
  if (!context) throw new Error("No Dropdown Context");
  return context;
}

function DropdownRoot({ children }: { children: ReactNode }) {
  const { isOpen, handleToggle, handleClose } = useDropdown();

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        handleToggle,
        handleClose
      }}
    >
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  );
}

function Label({ children }: { children?: ReactNode }) {
  return (
    children && <label className="block text-sm font-medium text-slate-300 mb-2">{children}</label>
  );
}

function Trigger<T>({
  children,
  className,
  placeholder
}: {
  children?: ReactNode | ((selectedItem: T | undefined) => ReactNode);
  className?: string;
  placeholder?: string;
}) {
  const { handleToggle, isOpen, selectedItem } = useDropdownContext<T>();
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`w-full h-[50px] px-4 py-3 cursor-pointer bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none flex items-center justify-between ${className}`}
    >
      {children ? (
        typeof children === "function" ? (
          children(selectedItem)
        ) : (
          <>{children}</>
        )
      ) : (
        <span className="text-slate-400">{placeholder}</span>
      )}
      <SvgIcon
        name="chevronDown"
        className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function Container({
  children,
  maxHeight = "max-h-48"
}: {
  children: ReactNode;
  maxHeight?: string;
}) {
  const { isOpen } = useDropdownContext<unknown>();
  if (!isOpen) return null;
  return (
    <div
      className={`absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10 ${maxHeight} overflow-y-auto`}
    >
      {children}
    </div>
  );
}

function ItemList<T>({
  children,
  value,
  selectedValue,
  onSelect
}: {
  children: ReactNode;
  value: T;
  selectedValue: T;
  onSelect: (value: T) => void;
}) {
  const { handleClose } = useDropdownContext<T>();

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(value);
        handleClose();
      }}
      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-700 transition-colors text-left ${
        selectedValue === value ? "bg-blue-500/20 text-blue-400" : "text-white"
      }`}
    >
      {children}
    </button>
  );
}

export const Dropdown = Object.assign(DropdownRoot, { Label, Trigger, Container, ItemList });

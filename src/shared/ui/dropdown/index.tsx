"use client";

import { useState } from "react";
import { SvgIcon } from "@/shared/ui";

interface DropdownProps<T> {
  items: T[];
  value: string;
  onSelect: (value: string) => void;
  getKey: (item: T) => string | number;
  getValue: (item: T) => string;
  renderTrigger: (selectedItem: T) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  label?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dropdown<T>({
  items,
  value,
  onSelect,
  getKey,
  getValue,
  renderTrigger,
  renderItem,
  placeholder = "선택해주세요",
  className = "",
  maxHeight = "max-h-48",
  label,
  onOpenChange
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedItem = items.find((item) => getValue(item) === value);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  const handleSelect = (itemValue: string) => {
    onSelect(itemValue);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full h-[50px] px-4 py-3 cursor-pointer bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none flex items-center justify-between ${className}`}
        >
          {selectedItem ? (
            renderTrigger(selectedItem)
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <SvgIcon
            name="chevronDown"
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10 ${maxHeight} overflow-y-auto`}
          >
            {items.map((item) => {
              const itemValue = getValue(item);
              const isSelected = value === itemValue;

              return (
                <button
                  key={getKey(item)}
                  type="button"
                  onClick={() => handleSelect(itemValue)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-700 transition-colors text-left ${
                    isSelected ? "bg-blue-500/20 text-blue-400" : "text-white"
                  }`}
                >
                  {renderItem(item)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
